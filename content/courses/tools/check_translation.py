"""Checks a translated course module against its English original:
    python3 -I tools/check_translation.py bach bach_de bach_fr ...
Everything but the words must match - lessons, videos, Library links,
audio, quiz answer positions, slide kinds and pictures - and the module
must name its language and its original."""
import importlib.util, os, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load(name):
    spec = importlib.util.spec_from_file_location(name, os.path.join(HERE, f'{name}.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def shape(module):
    course = module.COURSE
    out = [('course', course['level'], tuple(course['instruments']), tuple(course['musicStyles']), course['cover']['image'])]
    for week in module.WEEKS:
        out.append(('week', len(week['lessons'])))
        for lesson in week['lessons']:
            out.append((
                'lesson', lesson['type'], lesson.get('video'), tuple(lesson.get('libraryAudio') or ()), lesson.get('xp'), bool(lesson.get('preview')), lesson.get('minutes'),
                tuple(item for item, _ in lesson.get('library', [])),
                tuple((len(options), correct) for _, options, correct in lesson.get('quiz', [])),
            ))
            for slide in lesson.get('slides', []):
                out.append((
                    'slide', slide['kind'], slide.get('image'),
                    len(slide.get('bullets', [])), len(slide.get('rows', [])), len(slide.get('points', [])),
                ))
    return out


def texts(module):
    """Every visible string, to spot untranslated leftovers."""
    found = [module.COURSE['title'], module.COURSE['shortSummary'], module.COURSE['description'], module.FOOTER]
    for week in module.WEEKS:
        found.append(week['title'])
        for lesson in week['lessons']:
            found += [lesson['title'], lesson['description']] + [note for _, note in lesson.get('library', [])]
            for question, options, _ in lesson.get('quiz', []):
                found += [question] + options
            for slide in lesson.get('slides', []):
                found += [slide.get(key, '') for key in ('title', 'subtitle', 'text', 'quote', 'by', 'work', 'credit', 'week')]
                found += slide.get('bullets', []) + slide.get('points', []) + [what for _, what in slide.get('rows', [])]
    return [text for text in found if text]


def main():
    original, *translations = sys.argv[1:]
    source = load(original)
    english = set(texts(source))
    failed = False
    for name in translations:
        module = load(name)
        problems = []
        lang = module.COURSE.get('language')
        if lang not in ('de', 'fr'):
            problems.append(f'language is {lang!r}')
        if module.COURSE.get('translationOf') != source.COURSE['slug']:
            problems.append('translationOf does not name the original slug')
        if module.COURSE['slug'] == source.COURSE['slug']:
            problems.append('slug equals the original')
        a, b = shape(source), shape(module)
        if len(a) != len(b):
            problems.append(f'structure length {len(b)} != {len(a)}')
        for index, (left, right) in enumerate(zip(a, b)):
            if left != right:
                problems.append(f'#{index}: {right} != {left}')
                break
        # Long English sentences left untranslated (names and titles may repeat).
        same = [text for text in texts(module) if text in english and len(text) > 40 and ' ' in text and not text.startswith('http')]
        if same:
            problems.append(f'{len(same)} untranslated: {same[0][:80]!r}')
        lessons = sum(len(week['lessons']) for week in module.WEEKS)
        questions = sum(len(lesson.get('quiz', [])) for week in module.WEEKS for lesson in week['lessons'])
        print(f"{name}: {'OK' if not problems else 'FAIL'} ({lang}, {lessons} lessons, {questions} questions){''.join(chr(10) + '  - ' + p for p in problems)}")
        failed |= bool(problems)
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
