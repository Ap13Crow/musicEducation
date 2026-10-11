"""Shared helpers for the Solfège courses (solfege1.py ... solfege3.py).

A Solfège course is written once, with every text in three languages
(L(en, de, fr)) and every piece of music once, as notation. build(lang) turns
it into the plain course module the renderer and seeder read, so the music is
identical in every language and only the words - and the note names - differ.

Note names follow each language's own tradition:
  English  C D E F G A B          sharps/flats: C♯, B♭ (C sharp, B flat)
  German   C D E F G A H          B♭ is B, other flats -es/-s (Es, As, Des),
                                  sharps -is (Fis, Cis)
  French   do ré mi fa sol la si  fixed do; dièse/bémol (fa♯, si♭)

Pitches are written as letter + accidental + octave in scientific pitch
notation: 'C4' is middle C, 'F#4', 'Bb3', 'Eb5'. Notation is ABC (abcjs
renders it, see render_slides.py).
"""
import re

LANGS = ('en', 'de', 'fr')


class L:
    """A text in English, German and French."""

    def __init__(self, en, de, fr):
        self.texts = {'en': en, 'de': de, 'fr': fr}


_LETTERS = 'CDEFGAB'
_NAMES = {
    'en': dict(zip(_LETTERS, ['C', 'D', 'E', 'F', 'G', 'A', 'B'])),
    'de': dict(zip(_LETTERS, ['C', 'D', 'E', 'F', 'G', 'A', 'H'])),
    'fr': dict(zip(_LETTERS, ['do', 'ré', 'mi', 'fa', 'sol', 'la', 'si'])),
}
_PITCH = re.compile(r'^([A-G])(##|bb|#|b|n)?(-?\d)$')


def parse(pitch):
    match = _PITCH.match(pitch)
    if not match:
        raise ValueError(f'bad pitch {pitch!r}')
    letter, accidental, octave = match.groups()
    return letter, accidental or '', int(octave)


def name(pitch, lang, long=False):
    """The note's name in this language ('F#4' -> F♯ / Fis / fa♯)."""
    letter, accidental, _ = parse(pitch)
    if lang == 'de':
        base = _NAMES['de'][letter]
        if accidental == '#':
            return base + 'is'
        if accidental == '##':
            return base + 'isis'
        if accidental == 'b':
            return {'B': 'B', 'E': 'Es', 'A': 'As'}.get(letter, base + 'es')
        if accidental == 'bb':
            return {'B': 'Heses', 'E': 'Eses', 'A': 'Asas'}.get(letter, base + 'eses')
        return base
    base = _NAMES[lang][letter]
    if long:
        words = {'en': {'#': ' sharp', '##': ' double sharp', 'b': ' flat', 'bb': ' double flat', 'n': ' natural'},
                 'fr': {'#': ' dièse', '##': ' double dièse', 'b': ' bémol', 'bb': ' double bémol', 'n': ' bécarre'}}[lang]
        return base + words.get(accidental, '')
    return base + {'#': '♯', '##': '𝄪', 'b': '♭', 'bb': '𝄫', 'n': '♮'}.get(accidental, '')


def abc_pitch(pitch, key='C'):
    """'C4' -> 'C', 'C5' -> 'c', 'C6' -> "c'", 'C3' -> 'C,', 'F#4' -> '^F'.
    Accidentals already in the key signature are left out (and a natural
    against it is written out)."""
    letter, accidental, octave = parse(pitch)
    signature = key_signature(key)
    if letter in signature:
        accidental = '' if accidental == signature[letter] else (accidental or 'n')
    prefix = {'#': '^', '##': '^^', 'b': '_', 'bb': '__', 'n': '='}.get(accidental, '')
    if octave >= 5:
        return prefix + letter.lower() + "'" * (octave - 5)
    return prefix + letter + ',' * (4 - octave)


HEADER = """X:1
%%stretchlast 1
%%vocalfont Inter 15
%%annotationfont Inter 14
%%gchordfont Inter 14
"""


def abc(body, clef='treble', key='C', meter='none', unit='1/4', lyrics=None):
    """A complete ABC tune from a body of notes (one line)."""
    if lyrics and any(not isinstance(word, str) for word in lyrics):
        # Translated words under the notes: resolved per language.
        return lambda lang: abc(body, clef, key, meter, unit, [localize(word, lang) for word in lyrics])
    text = f"{HEADER}M:{meter}\nL:{unit}\nK:{key} clef={clef}\n{body}\n"
    if lyrics:
        # One word per note: spaces are kept inside a word (~), hyphens escaped.
        text += 'w: ' + ' '.join(str(word).replace(' ', '~').replace('-', '\\-') for word in lyrics) + '\n'
    return text


def notes(pitches, lang=None, clef='treble', duration='', numbered=False, key='C', bar_every=0):
    """A row of notes; with lang, their names are printed underneath."""
    parts = []
    for index, pitch in enumerate(pitches):
        token = (f'"^{index + 1}"' if numbered else '') + abc_pitch(pitch, key) + duration
        parts.append(token)
        if bar_every and (index + 1) % bar_every == 0:
            parts.append('|')
    body = ' '.join(parts) + (' |]' if bar_every else '')
    lyrics = [name(p, lang) for p in pitches] if lang else None
    return abc(body, clef=clef, key=key, lyrics=lyrics)


_TOKEN = re.compile(r'\{(n|N):([A-G](?:##|bb|#|b|n)?-?\d)\}')


def localize(value, lang):
    """Resolve L(...) texts and {n:G4} / {N:F#4} note-name tokens for lang."""
    if isinstance(value, L):
        value = value.texts[lang]
    if isinstance(value, str):
        return _TOKEN.sub(lambda m: name(m.group(2), lang, long=m.group(1) == 'N'), value)
    if callable(value):
        return localize(value(lang), lang)
    if isinstance(value, dict):
        return {key: localize(item, lang) for key, item in value.items()}
    if isinstance(value, list):
        return [localize(item, lang) for item in value]
    if isinstance(value, tuple):
        return tuple(localize(item, lang) for item in value)
    return value


# --- Theory: pitches, intervals, scales, keys, chords -----------------------

_STEP = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
_ALTER = {'': 0, 'n': 0, '#': 1, '##': 2, 'b': -1, 'bb': -2}
_ACCIDENTAL = {0: '', 1: '#', 2: '##', -1: 'b', -2: 'bb'}


def midi(pitch):
    letter, accidental, octave = parse(pitch)
    return 12 * (octave + 1) + _STEP[letter] + _ALTER[accidental]


def degree(pitch):
    """Position on the staff: one step per letter."""
    letter, _, octave = parse(pitch)
    return octave * 7 + _LETTERS.index(letter)


_PERFECT = {1: 0, 4: 5, 5: 7}
_MAJOR = {2: 2, 3: 4, 6: 9, 7: 11}


def interval(low, high):
    """(number, quality) from low up to high: (5, 'P'), (3, 'm'), (4, 'A')..."""
    number = degree(high) - degree(low) + 1
    semis = midi(high) - midi(low)
    simple = (number - 1) % 7 + 1
    octaves = (number - 1) // 7
    semis -= 12 * octaves
    if simple in _PERFECT:
        quality = {0: 'P', 1: 'A', -1: 'd', 2: 'AA', -2: 'dd'}[semis - _PERFECT[simple]]
    else:
        quality = {0: 'M', -1: 'm', 1: 'A', -2: 'd'}[semis - _MAJOR[simple]]
    return number, quality


def transpose(pitch, number, quality):
    """The pitch an interval above (number > 0) - spelled correctly."""
    letter, _, octave = parse(pitch)
    target = degree(pitch) + number - 1
    new_letter, new_octave = _LETTERS[target % 7], target // 7
    simple = (number - 1) % 7 + 1
    base = _PERFECT.get(simple, _MAJOR.get(simple))
    shift = {'P': 0, 'M': 0, 'm': -1, 'A': 1, 'd': -1 if simple in _PERFECT else -2}[quality]
    semis = base + shift + 12 * ((number - 1) // 7)
    wanted = midi(pitch) + semis
    natural = 12 * (new_octave + 1) + _STEP[new_letter]
    return f'{new_letter}{_ACCIDENTAL[wanted - natural]}{new_octave}'


_NUMBERS = {
    'en': ['unison', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'octave'],
    'de': ['Prime', 'Sekunde', 'Terz', 'Quarte', 'Quinte', 'Sexte', 'Septime', 'Oktave'],
    'fr': ['unisson', 'seconde', 'tierce', 'quarte', 'quinte', 'sixte', 'septième', 'octave'],
}
_QUALITIES = {
    'en': {'P': 'perfect', 'M': 'major', 'm': 'minor', 'A': 'augmented', 'd': 'diminished'},
    'de': {'P': 'reine', 'M': 'große', 'm': 'kleine', 'A': 'übermäßige', 'd': 'verminderte'},
    'fr': {'P': 'juste', 'M': 'majeure', 'm': 'mineure', 'A': 'augmentée', 'd': 'diminuée'},
}


def interval_name(number, quality=None, lang='en'):
    """'major third' / 'große Terz' / 'tierce majeure' (just 'third' without quality)."""
    noun = _NUMBERS[lang][number - 1] if number <= 8 else str(number)
    if not quality:
        return noun
    adjective = _QUALITIES[lang][quality]
    return f'{noun} {adjective}' if lang == 'fr' else f'{adjective} {noun}'


SCALES = {
    'major': [(2, 'M'), (3, 'M'), (4, 'P'), (5, 'P'), (6, 'M'), (7, 'M'), (8, 'P')],
    'minor': [(2, 'M'), (3, 'm'), (4, 'P'), (5, 'P'), (6, 'm'), (7, 'm'), (8, 'P')],
    'harmonic': [(2, 'M'), (3, 'm'), (4, 'P'), (5, 'P'), (6, 'm'), (7, 'M'), (8, 'P')],
    'melodic': [(2, 'M'), (3, 'm'), (4, 'P'), (5, 'P'), (6, 'M'), (7, 'M'), (8, 'P')],
    'dorian': [(2, 'M'), (3, 'm'), (4, 'P'), (5, 'P'), (6, 'M'), (7, 'm'), (8, 'P')],
    'phrygian': [(2, 'm'), (3, 'm'), (4, 'P'), (5, 'P'), (6, 'm'), (7, 'm'), (8, 'P')],
    'lydian': [(2, 'M'), (3, 'M'), (4, 'A'), (5, 'P'), (6, 'M'), (7, 'M'), (8, 'P')],
    'mixolydian': [(2, 'M'), (3, 'M'), (4, 'P'), (5, 'P'), (6, 'M'), (7, 'm'), (8, 'P')],
    'locrian': [(2, 'm'), (3, 'm'), (4, 'P'), (5, 'd'), (6, 'm'), (7, 'm'), (8, 'P')],
}


def scale(tonic, kind='major'):
    """'D4' -> ['D4', 'E4', 'F#4', ..., 'D5']."""
    return [tonic] + [transpose(tonic, n, q) for n, q in SCALES[kind]]


# Major keys around the circle of fifths: index - 7 = sharps (+) or flats (-).
CIRCLE = ['Cb', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F', 'C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#']
SHARPS = 'FCGDAEB'
FLATS = 'BEADGCF'


def major_of(key):
    """'Am' -> 'C', 'F#m' -> 'A', 'G' -> 'G'."""
    if key.endswith('m'):
        return transpose(key[:-1] + '4', 3, 'm')[:-1]
    return key


def accidentals_in(key):
    """Signed count: +2 for D major / B minor, -3 for E-flat major / C minor."""
    return CIRCLE.index(major_of(key)) - 7


def key_signature(key):
    count = accidentals_in(key)
    if count >= 0:
        return {letter: '#' for letter in SHARPS[:count]}
    return {letter: 'b' for letter in FLATS[:-count]}


def key_name(key, lang):
    """'F#m' -> 'F♯ minor' / 'fis-Moll' / 'fa dièse mineur'; 'Bb' -> 'B♭ major' / 'B-Dur' / 'si bémol majeur'."""
    minor = key.endswith('m')
    tonic = (key[:-1] if minor else key) + '4'
    if lang == 'de':
        n = name(tonic, 'de')
        return f'{n.lower()}-Moll' if minor else f'{n}-Dur'
    if lang == 'fr':
        return f"{name(tonic, 'fr', long=True)} {'mineur' if minor else 'majeur'}"
    return f"{name(tonic, 'en')} {'minor' if minor else 'major'}"


TRIADS = {'major': [(3, 'M'), (5, 'P')], 'minor': [(3, 'm'), (5, 'P')],
          'diminished': [(3, 'm'), (5, 'd')], 'augmented': [(3, 'M'), (5, 'A')]}
SEVENTHS = {'dominant': [(3, 'M'), (5, 'P'), (7, 'm')], 'major': [(3, 'M'), (5, 'P'), (7, 'M')],
            'minor': [(3, 'm'), (5, 'P'), (7, 'm')], 'half-diminished': [(3, 'm'), (5, 'd'), (7, 'm')],
            'diminished': [(3, 'm'), (5, 'd'), (7, 'd')]}


def chord(root, kind='major', seventh=False):
    table = SEVENTHS if seventh else TRIADS
    return [root] + [transpose(root, n, q) for n, q in table[kind]]


_TRIAD_NAMES = {
    'en': {'major': 'major', 'minor': 'minor', 'diminished': 'diminished', 'augmented': 'augmented'},
    'de': {'major': 'Dur', 'minor': 'Moll', 'diminished': 'vermindert', 'augmented': 'übermäßig'},
    'fr': {'major': 'majeur', 'minor': 'mineur', 'diminished': 'diminué', 'augmented': 'augmenté'},
}


def triad_name(root, kind, lang):
    """'C major triad' / 'C-Dur-Dreiklang' / 'accord de do majeur'."""
    if lang == 'de':
        n = name(root, 'de')
        if kind == 'major':
            return f'{n}-Dur-Dreiklang'
        if kind == 'minor':
            return f'{n.lower()}-Moll-Dreiklang'
        return f"{'verminderter' if kind == 'diminished' else 'übermäßiger'} Dreiklang auf {n}"
    if lang == 'fr':
        return f"accord de {name(root, 'fr')} {_TRIAD_NAMES['fr'][kind]}"
    return f"{name(root, 'en')} {kind} triad"


def chord_abc(pitches, duration='4', key='C'):
    return '[' + ''.join(abc_pitch(p, key) for p in pitches) + ']' + duration


# --- Quiz helpers -------------------------------------------------------------
# A quiz question is (text, options, correct, picture); every part may be an
# L(...) text or a string with {n:...} note-name tokens, resolved per language.

import random


def question(text, options, correct_option, picture=None):
    """Options in a stable shuffled order (the same for every language)."""
    rng = random.Random(repr((_plain(text), [_plain(o) for o in options])))
    order = list(range(len(options)))
    rng.shuffle(order)
    shuffled = [options[i] for i in order]
    return (text, shuffled, order.index(correct_option), picture)


def _plain(value):
    if isinstance(value, L):
        return value.texts['en']
    if callable(value):
        return _plain(value('en'))
    return value


def picture(abc_text, notes_count=None):
    """A quiz picture (all quiz pictures share one width; long music wraps)."""
    return {'abc': abc_text}


WHICH_NOTE = L('Which note is this?', 'Welcher Ton ist das?', 'Quelle est cette note ?')


def q_note(pitch, clef='treble', key='C', distractors=None):
    """Name the note on the staff."""
    if distractors is None:
        d = degree(pitch)
        letter, accidental, _ = parse(pitch)
        near = [p for p in (_from_degree(d + 1, accidental), _from_degree(d - 1, accidental), _from_degree(d + 2, accidental), _from_degree(d - 2, accidental))]
        distractors = near[:3]
    options = ['{n:%s}' % pitch] + ['{n:%s}' % p for p in distractors]
    return question(WHICH_NOTE, options, 0, picture(abc(abc_pitch(pitch, key) + '2', clef=clef, key=key), 1))


def _from_degree(d, accidental=''):
    return f"{_LETTERS[d % 7]}{accidental if accidental != 'n' else ''}{d // 7}"


_OTHER_QUALITIES = {'M': ['m', 'A', 'd'], 'm': ['M', 'd', 'A'], 'P': ['A', 'd'], 'A': ['P', 'M', 'd'], 'd': ['P', 'm', 'A']}


def _valid(number, quality):
    simple = (number - 1) % 7 + 1
    return quality in (('P', 'A', 'd') if simple in _PERFECT else ('M', 'm', 'A', 'd'))


def q_interval(low, high, with_quality=True, clef='treble', harmonic=False):
    number, quality = interval(low, high)
    shown = chord_abc([low, high], '4') if harmonic else f'{abc_pitch(low)}2 {abc_pitch(high)}2'
    pic = picture(abc(shown, clef=clef), 2)
    if with_quality:
        options = [(number, quality)]
        # Two other qualities of the same size, then a neighbouring size.
        options += [(number, q) for q in _OTHER_QUALITIES[quality] if _valid(number, q)][:2]
        neighbour = number + 1 if number < 8 else number - 1
        options.append((neighbour, 'P' if _valid(neighbour, 'P') else (quality if quality in 'Mm' else 'm')))
        text = L('Which interval is this?', 'Welches Intervall ist das?', 'Quel est cet intervalle ?')
        return question(text, [_interval_option(n, q) for n, q in options], 0, pic)
    numbers = [number] + [n for n in (number + 1, number - 1, number + 2, number - 2) if 1 <= n <= 8 and n != number][:3]
    text = L('How big is this interval?', 'Wie groß ist dieses Intervall?', 'Quel est cet intervalle ?')
    return question(text, [_interval_option(n) for n in numbers], 0, pic)


def _interval_option(number, quality=None):
    return lambda lang: interval_name(number, quality, lang)


def q_key(key, clef='treble'):
    """Which key has this key signature?"""
    minor = key.endswith('m')
    count = accidentals_in(key)
    others = [CIRCLE[i + 7] for i in (count + 1, count - 1, -count) if -7 <= i <= 7 and i != count][:3]
    if minor:
        others = [_relative_minor(k) for k in others]
    options = [key] + others
    text = (L('Which minor key has this key signature?', 'Welche Molltonart hat diese Vorzeichen?', 'Quelle tonalité mineure a cette armure ?') if minor
            else L('Which major key has this key signature?', 'Welche Durtonart hat diese Vorzeichen?', 'Quelle tonalité majeure a cette armure ?'))
    return question(text, [_key_option(k) for k in options], 0, picture(abc('x8', clef=clef, key=key), 2))


def _relative_minor(major):
    return transpose(major + '4', 6, 'M')[:-1] + 'm'


def _key_option(key):
    return lambda lang: key_name(key, lang)


def q_triad(root, kind, clef='treble'):
    pitches = chord(root, kind)
    pic = picture(abc(chord_abc(pitches, '4'), clef=clef), 2)
    options = [kind] + [k for k in ('major', 'minor', 'diminished', 'augmented') if k != kind]
    text = L('Which triad is this?', 'Welcher Dreiklang ist das?', 'Quel est cet accord ?')
    return question(text, [_triad_option(root, k) for k in options], 0, pic)


def _triad_option(root, kind):
    return lambda lang: triad_name(root, kind, lang)


# --- Course building ----------------------------------------------------------

def bullets(title, *items, summary=False):
    return {'kind': 'summary' if summary else 'bullets', 'title': title, 'bullets': list(items)}


def staff(title, abc_text, text=None, points=None, scale=None, measures=None):
    slide = {'kind': 'notation', 'title': title, 'abc': abc_text}
    if measures:
        slide['measures'] = measures
    if text:
        slide['text'] = text
    if points:
        slide['points'] = list(points)
    if scale:
        slide['scale'] = scale
    elif isinstance(abc_text, str) and '%%staves {(S A)' in abc_text:
        slide['scale'] = 1.9  # four-part chorales are tall: leave room for the text
    return slide


def image(title, text, key, credit):
    return {'kind': 'image', 'title': title, 'text': text, 'image': key, 'credit': credit}


def lesson(title, description, slides, quiz=(), library=(), minutes=15, preview=False, xp=None):
    entry = {'title': title, 'type': 'SLIDES', 'minutes': minutes, 'description': description, 'slides': list(slides)}
    if quiz:
        entry['quiz'] = list(quiz)
    if library:
        entry['library'] = list(library)
    if preview:
        entry['preview'] = True
    if xp:
        entry['xp'] = xp
    return entry


WEEK = L('Week', 'Woche', 'Semaine')


def week(number, title, *lessons):
    return {'title': lambda lang: f"{localize(WEEK, lang)} {number} – {localize(title, lang)}", 'lessons': list(lessons)}


def build(course, footer, weeks, lang):
    """The plain course module (COURSE, FOOTER, WEEKS) in one language."""
    info = localize(course, lang)
    slugs = info.pop('slugs')
    info['slug'] = slugs[lang]
    info['language'] = lang
    if lang != 'en':
        info['translationOf'] = slugs['en']
    return {'COURSE': info, 'FOOTER': localize(footer, lang), 'WEEKS': localize(weeks, lang)}




def keyboard(title, start='C4', octaves=2, labels=None, highlight=(), text=None, key_width=None):
    """A keyboard slide; labels {pitch: text}, highlight [pitches]."""
    slide = {'kind': 'keyboard', 'title': title, 'start': midi(start), 'count': 12 * octaves,
             'labels': {midi(p): t for p, t in (labels or {}).items()}, 'highlight': [midi(p) for p in highlight]}
    if text:
        slide['text'] = text
    if key_width:
        slide['keyWidth'] = key_width
    return slide


def white_key_names(start='C4', octaves=2):
    """Labels for every white key, named per language."""
    pitches = [p for p in scale(start)[:-1]]
    allp = [f'{p[:-1]}{int(p[-1]) + o}' for o in range(octaves) for p in pitches]
    return {p: '{n:%s}' % p for p in allp}


DEGREE_NAMES = {
    'en': ['tonic', 'supertonic', 'mediant', 'subdominant', 'dominant', 'submediant', 'leading note'],
    'de': ['Tonika (Grundton)', 'Supertonika', 'Mediante', 'Subdominante', 'Dominante', 'Submediante', 'Leitton'],
    'fr': ['tonique', 'sus-tonique', 'médiante', 'sous-dominante', 'dominante', 'sus-dominante', 'sensible'],
}


def degree_name(number):
    return lambda lang: DEGREE_NAMES[lang][number - 1]


def invert(pitches, times=1):
    """A chord's inversion: lowest note moved up an octave, `times` times."""
    pitches = list(pitches)
    for _ in range(times):
        low = pitches.pop(0)
        pitches.append(transpose(low, 8, 'P'))
    return pitches


SEVENTH_NAMES = {
    'en': {'dominant': 'dominant seventh', 'major': 'major seventh', 'minor': 'minor seventh', 'half-diminished': 'half-diminished seventh', 'diminished': 'diminished seventh'},
    'de': {'dominant': 'Dominantseptakkord', 'major': 'großer Durseptakkord', 'minor': 'Mollseptakkord', 'half-diminished': 'halbverminderter Septakkord', 'diminished': 'verminderter Septakkord'},
    'fr': {'dominant': 'septième de dominante', 'major': 'septième majeure', 'minor': 'septième mineure', 'half-diminished': 'septième demi-diminuée', 'diminished': 'septième diminuée'},
}


def seventh_name(root, kind, lang):
    """'G dominant seventh' / 'Dominantseptakkord auf G' / 'septième de dominante sur sol'."""
    if lang == 'de':
        return f"{SEVENTH_NAMES['de'][kind]} auf {name(root, 'de')}"
    if lang == 'fr':
        return f"{SEVENTH_NAMES['fr'][kind]} sur {name(root, 'fr')}"
    return f"{name(root, 'en')} {SEVENTH_NAMES['en'][kind]}"


def q_seventh(root, kind, clef='treble'):
    pic = picture(abc(chord_abc(chord(root, kind, seventh=True), '4'), clef=clef), 2)
    options = [kind] + [k for k in ('dominant', 'major', 'minor', 'half-diminished', 'diminished') if k != kind][:3]
    text = L('Which seventh chord is this?', 'Welcher Septakkord ist das?', 'Quel est cet accord de septième ?')
    return question(text, [(lambda lang, k=k: seventh_name(root, k, lang)) for k in options], 0, pic)


MODES = ['major', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'minor', 'locrian']
MODE_NAMES = {
    'en': dict(zip(MODES, ['Ionian (major)', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian (natural minor)', 'Locrian'])),
    'de': dict(zip(MODES, ['ionisch (Dur)', 'dorisch', 'phrygisch', 'lydisch', 'mixolydisch', 'äolisch (natürliches Moll)', 'lokrisch'])),
    'fr': dict(zip(MODES, ['ionien (majeur)', 'dorien', 'phrygien', 'lydien', 'mixolydien', 'éolien (mineur naturel)', 'locrien'])),
}


def mode_name(mode):
    return lambda lang: MODE_NAMES[lang][mode]


def q_mode(tonic, mode, others):
    pic = picture(notes(scale(tonic, mode)), 8)
    text = L('Which mode is this?', 'Welcher Modus ist das?', 'Quel est ce mode ?')
    return question(text, [mode_name(mode)] + [mode_name(m) for m in others], 0, pic)


def satb(chords, key='C', meter='none', duration='2', labels=None, fermata_last=False):
    """Four-part chorale texture: chords are [bass, tenor, alto, soprano] pitch lists."""
    def voice(index, label=False):
        out = []
        for i, c in enumerate(chords):
            token = abc_pitch(c[index], key) + duration
            if fermata_last and i == len(chords) - 1 and index in (0, 3):
                token = '!fermata!' + token
            if label and labels:
                token = f'"_{labels[i]}"' + token
            out.append(token)
        return ' '.join(out) + ' |]'
    return (f'X:1\n%%stretchlast 1\n%%annotationfont Inter 14\n%%staves {{(S A) (T B)}}\nM:{meter}\nL:1/4\nK:{key}\n'
            f'V:S clef=treble stem=up\nV:A clef=treble stem=down\nV:T clef=bass stem=up\nV:B clef=bass stem=down\n'
            f'[V:S] {voice(3)}\n[V:A] {voice(2)}\n[V:T] {voice(1)}\n[V:B] {voice(0, True)}\n')
