# Solfège 1: Reading Music - Foundations. A 16-week beginner theory course
# (months 1-4 of the Solfège year; solfege2.py and solfege3.py follow).
# Written once in English, German and French (solfege_common.L); note names
# follow each language: C D E F G A B / C D E F G A H / do ré mi fa sol la si.
# solfege1_de.py and solfege1_fr.py build the other two editions.
from solfege_common import (L, abc, notes, scale, chord_abc, abc_pitch, bullets, staff, image, keyboard, white_key_names,
                            lesson, week, build, question, picture, q_note, q_interval, interval_name, key_name)

# Library scores used for reading practice.
MINUET_G = 'cmuygw98a01th4kkt69w3wfcf'        # Bach notebook: Menuet in G, BWV Anh. 114
MINUET_A_MINOR = 'cmuygw98c01to4kktbnwg9qxt'  # Minuet in A minor, BWV Anh. 120
MUSETTE = 'cmuygw98d01tq4kktaotadidf'         # Musette in D, BWV Anh. 126
MARCH_E_FLAT = 'cmuygw99y01tr4kktlutc4sct'    # March in E-flat, BWV Anh. 127
AIR = 'cmuygw9a001tt4kkt0yc1zloh'             # Air, BWV Anh. 131
POLONAISE = 'cmuygw98c01tn4kktgyup43zg'       # Polonaise in G minor, BWV Anh. 119
MELODIE = 'cmuygwaa402cg4kkt69koy3us'         # Schumann, Album for the Young No. 1
MARCH_SCHUMANN = 'cmuygwaa502ch4kktjle42jld'  # No. 2 Soldier's March
HUMMING = 'cmuygwaa602ci4kkt9ifg0y3s'         # No. 3 Humming Song
CHORALE = 'cmuygwaa702cj4kktvetxptph'         # No. 4 Chorale
PIECE = 'cmuygwaa802ck4kkt1hadyczk'           # No. 5 Little Piece
WILD_RIDER = 'cmuygwaaa02cn4kkt34dz3djs'      # No. 8 Wild Rider
FARMER = 'cmuygwaab02cp4kktligv6mmn'          # No. 10 The Happy Farmer
STUDY = 'cmuygwaal02cw4kkt3gkg6nj8'           # No. 14 Little Study
AH_VOUS = 'cmuygwa26027v4kktd1gb78bx'         # Mozart, variations on "Ah vous dirai-je, Maman"
MOZART_KV2 = 'cmuygwa26027u4kktvjky12t3'      # Mozart, Minuet KV 2
BEETHOVEN_MINUET = 'cmuygw9cv01vr4kktlutmlq38'  # Beethoven, Minuet WoO 82
FUR_ELISE = 'cmuygw9ct01vp4kkttmshx9kc'
GAVOTTE = 'cmuygw9wu024q4kkta0le0is3'         # Handel, Gavotte
BLUE_DANUBE = 'cmuygwadu02f94kkto9p9vfc5'
WOODEN_SOLDIERS = 'cmuygwadw02ff4kkt3u7xikvj'
PRELUDE_C = 'cmuygw95g01ro4kktg902w7j6'       # Bach, Little Prelude in C, BWV 924
HEIDENROESLEIN = 'cmuyfx8r900w92eon5eyc7x6t'  # Schubert (interactive score)
CLEMENTI = 'cmuygw9il01z04kktds3p89p2'        # Sonatina Op. 36

GUIDO = {'key': 'guido_hand', 'credit': L('Guidonian hand, Italian manuscript, 15th century (public domain)',
                                          'Guidonische Hand, italienische Handschrift, 15. Jh. (gemeinfrei)',
                                          'Main guidonienne, manuscrit italien, XVe siècle (domaine public)')}

# Melodies used throughout (public domain).
TWINKLE = 'C C G G | A A G2 | F F E E | D D C2 |]'
ODE = 'E E F G | G F E D | C C D E | E3/2 D/ D2 |]'
ODE_FULL = 'E E F G | G F E D | C C D E | E3/2 D/ D2 | E E F G | G F E D | C C D E | D3/2 C/ C2 |]'
CLAIR = 'C C C D | E2 D2 | C E D D | C4 |]'
FRERE = 'C D E C | C D E C | E F G2 | E F G2 |]'
MINUET = 'd2 GABc | d2 G2 G2 | e2 cdef | g2 G2 G2 | c2 dcBA | B2 cBAG | F2 GABG | A6 |]'


def lyr(*words):
    """Translated words under notes (L texts or note-name tokens)."""
    return list(words)


def ask(text, options, correct=0, music=None, count=4):
    return question(text, options, correct, picture(music, count) if music else None)


Q_BEATS = L('How many beats does this bar have?', 'Wie viele Schläge hat dieser Takt?', 'Combien de temps compte cette mesure ?')

COURSE = {
    'slugs': {'en': 'solfege-1-reading-music-foundations', 'de': 'solfege-1-noten-lesen-grundlagen', 'fr': 'solfege-1-lire-la-musique-les-bases'},
    'title': L('Solfège 1: Reading Music – Foundations', 'Solfège 1: Noten lesen – Grundlagen', 'Solfège 1 : lire la musique – les bases'),
    'shortSummary': L(
        'Sixteen weeks from the first line of the staff to reading real pieces: note names, clefs, rhythm, time signatures, sharps and flats, scales and intervals - with notation, scores from the Library and a quiz in every lesson.',
        'Sechzehn Wochen von der ersten Notenlinie bis zum Lesen echter Stücke: Notennamen, Schlüssel, Rhythmus, Taktarten, Kreuz und b, Tonleitern und Intervalle – mit Notenbeispielen, Partituren aus der Bibliothek und einem Quiz in jeder Lektion.',
        'Seize semaines, de la première ligne de la portée à la lecture de vraies pièces : noms des notes, clés, rythme, mesures, dièses et bémols, gammes et intervalles – avec des exemples notés, des partitions de la Bibliothèque et un quiz à chaque leçon.'),
    'description': L(
        "Solfège is the art of reading and understanding music. This course teaches you to read notes and rhythms from scratch - no instrument and no previous knowledge needed.\n\n"
        "It is the first part of a one-year Solfège programme: four months of foundations, followed by Solfège 2 (intermediate) and Solfège 3 (advanced).\n\n"
        "- Month 1 - The staff, note names (C D E F G A B), the treble clef, ledger lines and octaves\n"
        "- Month 2 - Rhythm: note values, rests, time signatures and quavers (eighth notes)\n"
        "- Month 3 - The bass clef, semitones, sharps and flats, dotted notes, ties and the C major scale\n"
        "- Month 4 - Intervals, dynamics and articulation, repeats - and reading real pieces\n\n"
        "Every week has three lessons: two lessons with illustrated slides and music examples, and a practice lesson with a longer quiz. "
        "Many questions show a short piece of notation to read. Reading assignments take you into the mymusic.coach Library - Bach's Notebook for Anna Magdalena, Schumann's Album for the Young, Mozart and Beethoven. "
        "Plan about 1-2 hours per week.",
        "Solfège ist die Kunst, Musik zu lesen und zu verstehen. In diesem Kurs lernst du von Grund auf, Noten und Rhythmen zu lesen – ohne Instrument und ohne Vorkenntnisse.\n\n"
        "Er ist der erste Teil eines einjährigen Solfège-Programms: vier Monate Grundlagen, danach Solfège 2 (Aufbaukurs) und Solfège 3 (Fortgeschrittene).\n\n"
        "- Monat 1 – Das Notensystem, die Notennamen (C D E F G A H), der Violinschlüssel, Hilfslinien und Oktaven\n"
        "- Monat 2 – Rhythmus: Notenwerte, Pausen, Taktarten und Achtelnoten\n"
        "- Monat 3 – Der Bassschlüssel, Halbtöne, Kreuz und b, punktierte Noten, Haltebögen und die C-Dur-Tonleiter\n"
        "- Monat 4 – Intervalle, Dynamik und Artikulation, Wiederholungen – und echte Stücke lesen\n\n"
        "Jede Woche hat drei Lektionen: zwei mit illustrierten Folien und Notenbeispielen und eine Übungslektion mit einem längeren Quiz. "
        "Viele Fragen zeigen ein kurzes Notenbeispiel zum Lesen. Leseaufgaben führen dich in die mymusic.coach-Bibliothek – zu Bachs Notenbüchlein für Anna Magdalena, Schumanns Album für die Jugend, Mozart und Beethoven. "
        "Plane etwa 1–2 Stunden pro Woche ein.",
        "Le solfège est l'art de lire et de comprendre la musique. Ce cours t'apprend à lire les notes et les rythmes depuis le début – sans instrument et sans connaissances préalables.\n\n"
        "C'est la première partie d'un programme de solfège d'un an : quatre mois de bases, puis Solfège 2 (intermédiaire) et Solfège 3 (avancé).\n\n"
        "- Mois 1 – La portée, le nom des notes (do ré mi fa sol la si), la clé de sol, les lignes supplémentaires et les octaves\n"
        "- Mois 2 – Le rythme : figures de notes, silences, mesures et croches\n"
        "- Mois 3 – La clé de fa, les demi-tons, dièses et bémols, notes pointées, liaisons et la gamme de do majeur\n"
        "- Mois 4 – Les intervalles, nuances et articulations, reprises – et la lecture de vraies pièces\n\n"
        "Chaque semaine compte trois leçons : deux leçons avec des diapositives illustrées et des exemples notés, et une leçon d'entraînement avec un quiz plus long. "
        "Beaucoup de questions montrent un court extrait de partition à lire. Les exercices de lecture t'emmènent dans la Bibliothèque mymusic.coach – le Petit livre d'Anna Magdalena Bach, l'Album pour la jeunesse de Schumann, Mozart et Beethoven. "
        "Compte environ 1 à 2 heures par semaine."),
    'level': 'BEGINNER',
    'category': ['music-theory', 'Music Theory'],
    'instruments': ['Piano', 'Voice', 'Violin', 'Flute', 'Guitar'],
    'musicStyles': ['Classical'],
    'cover': {'image': 'guido_hand', 'kicker': L('Theory course', 'Theoriekurs', 'Cours de théorie'),
              'title': 'Solfège 1', 'subtitle': L('Reading Music – Foundations', 'Noten lesen – Grundlagen', 'Lire la musique – les bases'),
              'tag': L('16 weeks · beginners', '16 Wochen · Einsteiger', '16 semaines · débutants')},
}
FOOTER = L('Solfège 1: Reading Music', 'Solfège 1: Noten lesen', 'Solfège 1 : lire la musique')

# --- Month 1 ------------------------------------------------------------------

W1 = week(1, L('Sound, Pitch and the Staff', 'Klang, Tonhöhe und Notensystem', 'Le son, la hauteur et la portée'),
  lesson(L('Welcome: what is solfège?', 'Willkommen: Was ist Solfège?', "Bienvenue : qu'est-ce que le solfège ?"),
    L("Welcome! Solfège means reading and understanding music. Meet the monk who invented the note names a thousand years ago - and see how the next sixteen weeks work.",
      "Willkommen! Solfège heißt: Musik lesen und verstehen. Lerne den Mönch kennen, der vor tausend Jahren die Notennamen erfand – und erfahre, wie die nächsten sechzehn Wochen ablaufen.",
      "Bienvenue ! Le solfège, c'est lire et comprendre la musique. Découvre le moine qui a inventé le nom des notes il y a mille ans – et comment se dérouleront les seize prochaines semaines."),
    [
      {'kind': 'title', 'week': L('Week 1', 'Woche 1', 'Semaine 1'), 'title': L('Welcome to Solfège', 'Willkommen beim Solfège', 'Bienvenue au solfège'),
       'subtitle': L('Learn to read and understand music', 'Lerne, Musik zu lesen und zu verstehen', 'Apprends à lire et à comprendre la musique'), 'image': GUIDO['key'], 'credit': GUIDO['credit']},
      bullets(L('What you will learn', 'Was du lernst', 'Ce que tu vas apprendre'),
        L('To read notes on the staff - in the treble and the bass clef', 'Noten im Notensystem lesen – im Violin- und im Bassschlüssel', 'Lire les notes sur la portée – en clé de sol et en clé de fa'),
        L('To read and count rhythms: note values, rests and time signatures', 'Rhythmen lesen und zählen: Notenwerte, Pausen und Taktarten', 'Lire et compter les rythmes : figures de notes, silences et mesures'),
        L('Sharps, flats, scales and intervals - the building blocks of melody', 'Kreuz, b, Tonleitern und Intervalle – die Bausteine der Melodie', 'Dièses, bémols, gammes et intervalles – les briques de la mélodie'),
        L('The signs in a real score: dynamics, articulation, repeats', 'Die Zeichen einer echten Partitur: Dynamik, Artikulation, Wiederholungen', "Les signes d'une vraie partition : nuances, articulations, reprises"),
        L('At the end: reading pieces by Bach, Mozart and Schumann from the Library', 'Am Ende: Stücke von Bach, Mozart und Schumann aus der Bibliothek lesen', 'À la fin : lire des pièces de Bach, Mozart et Schumann de la Bibliothèque')),
      image(L('Guido of Arezzo', 'Guido von Arezzo', "Guido d'Arezzo"),
        L('Around 1025 the Italian monk Guido of Arezzo taught singers to read new chants at sight. He used lines to fix the pitch of each note and gave the notes names - the beginning of modern notation.',
          'Um 1025 brachte der italienische Mönch Guido von Arezzo Sängern bei, neue Gesänge vom Blatt zu singen. Er legte die Tonhöhe mit Linien fest und gab den Tönen Namen – der Anfang unserer heutigen Notenschrift.',
          "Vers 1025, le moine italien Guido d'Arezzo apprit aux chanteurs à déchiffrer de nouveaux chants. Il fixa la hauteur des notes par des lignes et leur donna des noms – le début de notre notation moderne."),
        'guido_monochord', L('Guido and Bishop Theobald at the monochord, 12th-century manuscript, Austrian National Library (CC BY-SA 3.0)',
                             'Guido und Bischof Theobald am Monochord, Handschrift des 12. Jh., Österreichische Nationalbibliothek (CC BY-SA 3.0)',
                             "Guido et l'évêque Théobald au monocorde, manuscrit du XIIe siècle, Bibliothèque nationale autrichienne (CC BY-SA 3.0)")),
      image(L('Ut, re, mi, fa, sol, la', 'Ut, re, mi, fa, sol, la', 'Ut, ré, mi, fa, sol, la'),
        L('Guido took the syllables from a hymn to St John: each line starts one note higher - UT queant laxis, REsonare fibris, MIra gestorum, FAmuli tuorum, SOLve polluti, LAbii reatum. Later "si" was added and "ut" became "do".',
          'Guido nahm die Silben aus einem Hymnus an Johannes den Täufer: Jede Zeile beginnt einen Ton höher – UT queant laxis, REsonare fibris, MIra gestorum, FAmuli tuorum, SOLve polluti, LAbii reatum. Später kam „si“ dazu, und aus „ut“ wurde „do“.',
          "Guido prit ces syllabes dans un hymne à saint Jean-Baptiste : chaque vers commence une note plus haut – UT queant laxis, REsonare fibris, MIra gestorum, FAmuli tuorum, SOLve polluti, LAbii reatum. Plus tard, on ajouta « si », et « ut » devint « do »."),
        'ut_queant', L('"Ut queant laxis" in modern notation (public domain)', '„Ut queant laxis“ in moderner Notation (gemeinfrei)', '« Ut queant laxis » en notation moderne (domaine public)')),
      bullets(L('How this course works', 'So funktioniert der Kurs', 'Comment fonctionne ce cours'),
        L('16 weeks, 3 lessons per week - about 1-2 hours in total', '16 Wochen, 3 Lektionen pro Woche – insgesamt etwa 1–2 Stunden', '16 semaines, 3 leçons par semaine – environ 1 à 2 heures en tout'),
        L('Slides with music examples - read them slowly, say the notes out loud', 'Folien mit Notenbeispielen – lies sie langsam und sprich die Noten laut', 'Des diapositives avec exemples notés – lis-les lentement, dis les notes à voix haute'),
        L('A quiz in every lesson; the third lesson of each week is a longer practice quiz', 'Ein Quiz in jeder Lektion; die dritte Lektion jeder Woche ist ein längeres Übungsquiz', "Un quiz à chaque leçon ; la troisième leçon de chaque semaine est un quiz d'entraînement plus long"),
        L('Reading tasks with real scores from the mymusic.coach Library', 'Leseaufgaben mit echten Noten aus der mymusic.coach-Bibliothek', 'Des exercices de lecture avec de vraies partitions de la Bibliothèque mymusic.coach')),
    ],
    quiz=[
      ask(L('What does solfège teach?', 'Was lernt man im Solfège?', "Qu'apprend-on en solfège ?"),
          [L('To read and understand music', 'Musik lesen und verstehen', 'À lire et comprendre la musique'),
           L('To build instruments', 'Instrumente bauen', 'À fabriquer des instruments'),
           L('To play the piano with both hands', 'Mit beiden Händen Klavier spielen', 'À jouer du piano à deux mains'),
           L('To write song lyrics', 'Liedtexte schreiben', 'À écrire des paroles de chansons')]),
      ask(L('Where do the syllables ut, re, mi, fa, sol, la come from?', 'Woher stammen die Silben ut, re, mi, fa, sol, la?', "D'où viennent les syllabes ut, ré, mi, fa, sol, la ?"),
          [L('From a Latin hymn to St John', 'Aus einem lateinischen Hymnus an Johannes', "D'un hymne latin à saint Jean"),
           L('From the names of six composers', 'Von den Namen von sechs Komponisten', 'Des noms de six compositeurs'),
           L('From the Greek alphabet', 'Aus dem griechischen Alphabet', "De l'alphabet grec"),
           L('From the strings of the violin', 'Von den Saiten der Geige', 'Des cordes du violon')]),
      ask(L('Which monk gave the notes their names around 1025?', 'Welcher Mönch gab den Tönen um 1025 ihre Namen?', 'Quel moine a donné leur nom aux notes vers 1025 ?'),
          [L('Guido of Arezzo', 'Guido von Arezzo', "Guido d'Arezzo"), 'Johann Sebastian Bach', 'Gregor Mendel', L('Francis of Assisi', 'Franz von Assisi', "François d'Assise")]),
    ], minutes=12, preview=True),
  lesson(L('High and low: the staff', 'Hoch und tief: das Notensystem', 'Aigu et grave : la portée'),
    L('Music moves up and down. The staff shows this movement: five lines, four spaces - and the higher a note sits, the higher it sounds.',
      'Musik bewegt sich auf und ab. Das Notensystem zeigt diese Bewegung: fünf Linien, vier Zwischenräume – je höher eine Note steht, desto höher klingt sie.',
      "La musique monte et descend. La portée montre ce mouvement : cinq lignes, quatre interlignes – plus une note est placée haut, plus elle sonne aigu."),
    [
      bullets(L('Pitch: high and low', 'Tonhöhe: hoch und tief', 'La hauteur : aigu et grave'),
        L('Every musical sound has a pitch - how high or low it sounds', 'Jeder musikalische Klang hat eine Tonhöhe – wie hoch oder tief er klingt', 'Chaque son musical a une hauteur – il sonne plus ou moins aigu ou grave'),
        L('A bird sings high; a tuba plays low', 'Ein Vogel singt hoch, eine Tuba spielt tief', "L'oiseau chante aigu, le tuba joue grave"),
        L('Faster vibrations sound higher: the A above middle C vibrates 440 times a second', 'Schnellere Schwingungen klingen höher: Das A über dem mittleren C schwingt 440-mal pro Sekunde', 'Plus la vibration est rapide, plus le son est aigu : le la du diapason vibre 440 fois par seconde'),
        L('Notation turns pitch into a picture: higher on the page = higher in sound', 'Notenschrift macht Tonhöhe sichtbar: weiter oben = höher im Klang', 'La notation transforme la hauteur en image : plus haut sur la page = plus aigu')),
      staff(L('The staff: 5 lines, 4 spaces', 'Das Notensystem: 5 Linien, 4 Zwischenräume', 'La portée : 5 lignes, 4 interlignes'),
        abc('x8', clef='none'),
        text=L('Lines and spaces are counted from the bottom up: line 1 is the lowest line, space 1 the lowest space.',
               'Linien und Zwischenräume werden von unten nach oben gezählt: Linie 1 ist die unterste Linie, Zwischenraum 1 der unterste Zwischenraum.',
               "Les lignes et les interlignes se comptent de bas en haut : la 1re ligne est la plus basse, le 1er interligne aussi.")),
      staff(L('Notes on lines and in spaces', 'Noten auf Linien und in Zwischenräumen', 'Notes sur les lignes et dans les interlignes'),
        abc('E2 F2 G2 A2 B2 c2 d2 e2 f2', clef='none', lyrics=[L('line', 'Linie', 'ligne') if i % 2 == 0 else L('space', 'Zw.', 'interl.') for i in range(9)]),
        text=L('A note sits either on a line (the line runs through it) or in a space (between two lines).',
               'Eine Note sitzt entweder auf einer Linie (die Linie geht durch sie hindurch) oder in einem Zwischenraum (zwischen zwei Linien).',
               "Une note est soit sur une ligne (la ligne la traverse), soit dans un interligne (entre deux lignes).")),
      staff(L('Higher on the staff = higher in sound', 'Weiter oben = höher im Klang', 'Plus haut sur la portée = plus aigu'),
        abc('C D E F G A B c d e f g', clef='none'),
        text=L('Each step up - line, space, line, space - is the next note up.',
               'Jeder Schritt nach oben – Linie, Zwischenraum, Linie, Zwischenraum – ist der nächsthöhere Ton.',
               'Chaque pas vers le haut – ligne, interligne, ligne, interligne – donne la note suivante, plus aiguë.')),
    ],
    quiz=[
      ask(L('How many lines does a staff have?', 'Wie viele Linien hat ein Notensystem?', 'Combien de lignes compte une portée ?'), ['5', '4', '6', '7']),
      ask(L('How many spaces are there between the lines?', 'Wie viele Zwischenräume gibt es zwischen den Linien?', "Combien d'interlignes y a-t-il entre les lignes ?"), ['4', '5', '3', '6']),
      ask(L('Lines are counted ...', 'Linien werden gezählt ...', 'Les lignes se comptent ...'),
          [L('from the bottom up', 'von unten nach oben', 'de bas en haut'), L('from the top down', 'von oben nach unten', 'de haut en bas'),
           L('from the middle outwards', 'von der Mitte aus', 'à partir du milieu'), L('from left to right', 'von links nach rechts', 'de gauche à droite')]),
      ask(L('Which note sounds higher?', 'Welche Note klingt höher?', 'Quelle note sonne plus aigu ?'),
          [L('The second one', 'Die zweite', 'La deuxième'), L('The first one', 'Die erste', 'La première'), L('Both are the same', 'Beide gleich', 'Les deux sont pareilles')],
          music=abc('F2 d2', clef='none'), count=2),
      ask(L('Where does this note sit?', 'Wo steht diese Note?', 'Où se trouve cette note ?'),
          [L('On the third line', 'Auf der dritten Linie', 'Sur la 3e ligne'), L('In the third space', 'Im dritten Zwischenraum', 'Dans le 3e interligne'),
           L('On the second line', 'Auf der zweiten Linie', 'Sur la 2e ligne'), L('On the fourth line', 'Auf der vierten Linie', 'Sur la 4e ligne')],
          music=abc('B2', clef='none'), count=1),
    ]),
  lesson(L('Practice: steps and skips', 'Übung: Schritte und Sprünge', 'Entraînement : pas et sauts'),
    L('Melodies move by steps (line to the next space) or skips (line to line, space to space). Learn to see the shape of a melody - before you know a single note name.',
      'Melodien bewegen sich in Schritten (Linie zum nächsten Zwischenraum) oder Sprüngen (Linie zu Linie, Zwischenraum zu Zwischenraum). Lerne, die Gestalt einer Melodie zu sehen – noch bevor du einen Notennamen kennst.',
      "Les mélodies avancent par degrés conjoints (d'une ligne à l'interligne voisin) ou par sauts (de ligne à ligne, d'interligne à interligne). Apprends à voir le dessin d'une mélodie – avant même de connaître le nom des notes."),
    [
      staff(L('Steps', 'Schritte', 'Degrés conjoints'), abc('E F G A B A G F E', clef='none'),
        text=L('A step goes from a line to the next space (or back): the neighbouring note.', 'Ein Schritt geht von einer Linie zum nächsten Zwischenraum (oder zurück): zum Nachbarton.', "Un degré conjoint va d'une ligne à l'interligne voisin (ou inversement) : la note voisine.")),
      staff(L('Skips', 'Sprünge', 'Sauts'), abc('E G B d B G E', clef='none'),
        text=L('A skip jumps over a note: line to line or space to space.', 'Ein Sprung überspringt einen Ton: von Linie zu Linie oder von Zwischenraum zu Zwischenraum.', "Un saut passe par-dessus une note : de ligne à ligne ou d'interligne à interligne.")),
      staff(L('The shape of a melody', 'Die Gestalt einer Melodie', "Le dessin d'une mélodie"), abc(ODE_FULL, clef='none', meter='4/4'),
        text=L('Follow it with your finger: mostly steps, up and down. You may know it - it is the "Ode to Joy" by Beethoven.',
               'Folge ihr mit dem Finger: fast nur Schritte, auf und ab. Vielleicht kennst du sie – es ist die „Ode an die Freude“ von Beethoven.',
               "Suis-la du doigt : presque uniquement des degrés conjoints, qui montent et descendent. Tu la connais peut-être : c'est l'« Hymne à la joie » de Beethoven.")),
      bullets(L('Week 1 in a nutshell', 'Woche 1 kurz gefasst', 'La semaine 1 en bref'),
        L('Solfège = reading and understanding music', 'Solfège = Musik lesen und verstehen', 'Solfège = lire et comprendre la musique'),
        L('The staff has 5 lines and 4 spaces, counted from the bottom', 'Das Notensystem hat 5 Linien und 4 Zwischenräume, von unten gezählt', 'La portée a 5 lignes et 4 interlignes, comptés de bas en haut'),
        L('Higher on the staff sounds higher', 'Weiter oben klingt höher', 'Plus haut sur la portée = plus aigu'),
        L('Melodies move by steps and skips', 'Melodien bewegen sich in Schritten und Sprüngen', 'Les mélodies avancent par degrés conjoints et par sauts'),
        summary=True),
    ],
    quiz=[
      ask(L('Step or skip?', 'Schritt oder Sprung?', 'Degré conjoint ou saut ?'),
          [L('Step', 'Schritt', 'Degré conjoint'), L('Skip', 'Sprung', 'Saut'), L('Same note', 'Gleicher Ton', 'Même note')], music=abc('G2 A2', clef='none'), count=2),
      ask(L('Step or skip?', 'Schritt oder Sprung?', 'Degré conjoint ou saut ?'),
          [L('Skip', 'Sprung', 'Saut'), L('Step', 'Schritt', 'Degré conjoint'), L('Same note', 'Gleicher Ton', 'Même note')], music=abc('G2 B2', clef='none'), count=2),
      ask(L('Step or skip?', 'Schritt oder Sprung?', 'Degré conjoint ou saut ?'),
          [L('Skip', 'Sprung', 'Saut'), L('Step', 'Schritt', 'Degré conjoint'), L('Same note', 'Gleicher Ton', 'Même note')], music=abc('c2 A2', clef='none'), count=2),
      ask(L('Step or skip?', 'Schritt oder Sprung?', 'Degré conjoint ou saut ?'),
          [L('Step', 'Schritt', 'Degré conjoint'), L('Skip', 'Sprung', 'Saut'), L('Same note', 'Gleicher Ton', 'Même note')], music=abc('e2 d2', clef='none'), count=2),
      ask(L('Where does this melody go?', 'Wohin geht diese Melodie?', 'Où va cette mélodie ?'),
          [L('Up by steps', 'In Schritten nach oben', 'Elle monte par degrés conjoints'), L('Down by steps', 'In Schritten nach unten', 'Elle descend par degrés conjoints'),
           L('Up by skips', 'In Sprüngen nach oben', 'Elle monte par sauts'), L('It stays on one note', 'Sie bleibt auf einem Ton', 'Elle reste sur une note')],
          music=abc('D E F G A', clef='none'), count=5),
      ask(L('Where does this melody go?', 'Wohin geht diese Melodie?', 'Où va cette mélodie ?'),
          [L('Down by skips', 'In Sprüngen nach unten', 'Elle descend par sauts'), L('Down by steps', 'In Schritten nach unten', 'Elle descend par degrés conjoints'),
           L('Up by skips', 'In Sprüngen nach oben', 'Elle monte par sauts'), L('It stays on one note', 'Sie bleibt auf einem Ton', 'Elle reste sur une note')],
          music=abc('f d B G E', clef='none'), count=5),
      ask(L('Which of these notes sits in a space?', 'Welche dieser Noten steht in einem Zwischenraum?', 'Laquelle de ces notes est dans un interligne ?'),
          [L('The second', 'Die zweite', 'La deuxième'), L('The first', 'Die erste', 'La première'), L('The third', 'Die dritte', 'La troisième')],
          music=abc('"^1"G2 "^2"A2 "^3"B2', clef='none'), count=3),
      ask(L('Lines and spaces are counted from ...', 'Linien und Zwischenräume zählt man von ...', 'Lignes et interlignes se comptent ...'),
          [L('the bottom', 'unten', 'du bas'), L('the top', 'oben', 'du haut'), L('the middle', 'der Mitte', 'du milieu')]),
    ], minutes=10),
)

NAMES_TABLE = bullets(L('One scale, three ways of naming it', 'Eine Tonleiter, drei Arten der Benennung', 'Une gamme, trois façons de la nommer'),
  'English:  C – D – E – F – G – A – B',
  'Deutsch:  C – D – E – F – G – A – H',
  'Français :  do – ré – mi – fa – sol – la – si',
  L('Same notes, same sounds - only the names differ. In this course you read the English names.',
    'Gleiche Töne, gleicher Klang – nur die Namen unterscheiden sich. In diesem Kurs liest du die deutschen Namen.',
    'Mêmes notes, mêmes sons – seuls les noms changent. Dans ce cours, tu lis les noms français.'))

NEXT_NAME = L('Which note name comes next: {n:%s} → ?', 'Welcher Notenname folgt: {n:%s} → ?', 'Quelle note vient après : {n:%s} → ?')
PREV_NAME = L('Which note name comes before: ? → {n:%s}', 'Welcher Notenname kommt davor: ? → {n:%s}', 'Quelle note vient avant : ? → {n:%s}')


def fill(text, *values):
    return L(*(t % values for t in (text.texts['en'], text.texts['de'], text.texts['fr'])))


def q_next(pitch, after, others):
    return ask(fill(NEXT_NAME, pitch), ['{n:%s}' % after] + ['{n:%s}' % o for o in others])


def q_prev(pitch, before, others):
    return ask(fill(PREV_NAME, pitch), ['{n:%s}' % before] + ['{n:%s}' % o for o in others])


W2 = week(2, L('The Names of the Notes', 'Die Namen der Noten', 'Le nom des notes'),
  lesson(L('Seven names for all the notes', 'Sieben Namen für alle Töne', 'Sept noms pour toutes les notes'),
    L('All of Western music uses just seven note names, repeated again and again. English, German and French name them differently - here is how.',
      'Die ganze westliche Musik kommt mit sieben Notennamen aus, die sich immer wiederholen. Englisch, Deutsch und Französisch benennen sie unterschiedlich – so geht es.',
      "Toute la musique occidentale n'utilise que sept noms de notes, répétés encore et encore. L'anglais, l'allemand et le français les nomment différemment – voici comment."),
    [
      bullets(L('Seven note names', 'Sieben Notennamen', 'Sept noms de notes'),
        L('Music uses seven names: {n:C4} {n:D4} {n:E4} {n:F4} {n:G4} {n:A4} {n:B4}', 'Die Musik verwendet sieben Namen: {n:C4} {n:D4} {n:E4} {n:F4} {n:G4} {n:A4} {n:B4}', 'La musique utilise sept noms : {n:C4} {n:D4} {n:E4} {n:F4} {n:G4} {n:A4} {n:B4}'),
        L('After {n:B4} the names start again with {n:C5}', 'Nach {n:B4} beginnen die Namen wieder mit {n:C5}', 'Après {n:B4}, on recommence avec {n:C5}'),
        L('Going down, they run backwards: {n:C5} {n:B4} {n:A4} {n:G4} ...', 'Abwärts laufen sie rückwärts: {n:C5} {n:B4} {n:A4} {n:G4} ...', 'En descendant, on les dit à l’envers : {n:C5} {n:B4} {n:A4} {n:G4} ...'),
        L('Practise saying them up and down until it is automatic', 'Sag sie auf- und abwärts, bis es ganz automatisch geht', "Récite-les en montant et en descendant jusqu'à ce que ce soit automatique")),
      NAMES_TABLE,
      bullets(L('Good to know', 'Gut zu wissen', 'Bon à savoir'),
        L('English and German use letters; French, Italian and Spanish use the syllables do ré mi', 'Englisch und Deutsch verwenden Buchstaben; Französisch, Italienisch und Spanisch die Silben do re mi', "L'anglais et l'allemand utilisent des lettres ; le français, l'italien et l'espagnol les syllabes do ré mi"),
        L('In German the note B is called H - and "B" means B flat (you will meet it in week 10)', 'Im Deutschen heißt der siebte Ton H – „B“ ist der um einen Halbton erniedrigte Ton darunter (mehr dazu in Woche 10)', "En allemand, le si s'appelle H – et « B » désigne le si bémol (nous le verrons en semaine 10)"),
        L('In France "do" is always the same note (fixed do); in English sol-fa "do" moves with the key (movable do)', 'In Frankreich ist „do“ immer derselbe Ton (feste Solmisation); bei der relativen Solmisation wandert „do“ mit der Tonart', "En France, « do » est toujours la même note (do fixe) ; en solmisation relative (do mobile), « do » change avec la tonalité"),
        L('Older French texts still say "ut" for do - you will meet it in the "clé d\'ut"', 'Ältere französische Texte sagen noch „ut“ statt do – etwa beim „clé d’ut“, dem C-Schlüssel', "Les textes anciens disent encore « ut » pour do – on le retrouve dans la « clé d'ut »")),
      staff(L('The names on the staff', 'Die Namen im Notensystem', 'Les noms sur la portée'), lambda lang: notes(scale('C4'), lang),
        text=L('This is how the seven names look on the staff - next week you will learn why they sit exactly there.',
               'So sehen die sieben Namen im Notensystem aus – nächste Woche erfährst du, warum sie genau dort stehen.',
               "Voici les sept noms sur la portée – la semaine prochaine, tu sauras pourquoi ils se placent exactement là.")),
    ],
    quiz=[
      ask(L('How many different note names are there?', 'Wie viele verschiedene Notennamen gibt es?', 'Combien de noms de notes différents existe-t-il ?'), ['7', '8', '5', '12']),
      q_next('G4', 'A4', ['B4', 'F4', 'C4']),
      q_next('B4', 'C5', ['A4', 'D5', 'G4']),
      ask(L('Which naming uses do, ré, mi?', 'Welche Benennung verwendet do, re, mi?', 'Quel système utilise do, ré, mi ?'),
          [L('French (and Italian, Spanish)', 'Französisch (und Italienisch, Spanisch)', 'Le français (et l’italien, l’espagnol)'), L('German', 'Deutsch', "L'allemand"), L('English', 'Englisch', "L'anglais")]),
      ask(L('In German, which letter replaces the English B?', 'Welcher Buchstabe ersetzt im Deutschen das englische B?', "En allemand, quelle lettre remplace le si (B anglais) ?"), ['H', 'A', 'C', 'S']),
    ], minutes=12),
  lesson(L('The keyboard and the octave', 'Die Klaviatur und die Oktave', "Le clavier et l'octave"),
    L('The piano keyboard is the best map of the note names. Find C (do) by the black keys - and discover the octave: the same name, eight notes higher.',
      'Die Klaviatur ist die beste Landkarte der Notennamen. Finde das C an den schwarzen Tasten – und entdecke die Oktave: derselbe Name, acht Töne höher.',
      "Le clavier du piano est la meilleure carte des noms de notes. Trouve le do grâce aux touches noires – et découvre l'octave : le même nom, huit notes plus haut."),
    [
      keyboard(L('The white keys', 'Die weißen Tasten', 'Les touches blanches'), labels=white_key_names(), text=L(
        'Black keys come in groups of two and three. {n:C4} is always the white key just left of a group of two.',
        'Die schwarzen Tasten bilden Zweier- und Dreiergruppen. {n:C4} ist immer die weiße Taste links neben einer Zweiergruppe.',
        'Les touches noires forment des groupes de deux et de trois. Le {n:C4} est toujours la touche blanche juste à gauche d’un groupe de deux.')),
      keyboard(L('Find every C', 'Finde jedes C', 'Trouve tous les do'), labels={'C4': '{n:C4}', 'C5': '{n:C5}', 'F4': '{n:F4}', 'F5': '{n:F5}'}, highlight=['C4', 'C5'], text=L(
        'Every C sits left of two black keys; every {n:F4} left of three black keys.',
        'Jedes C liegt links von zwei schwarzen Tasten, jedes {n:F4} links von drei schwarzen Tasten.',
        'Chaque do est à gauche de deux touches noires ; chaque {n:F4} à gauche de trois touches noires.')),
      staff(L('The octave', 'Die Oktave', "L'octave"), abc('C2 D E F G A B c2', lyrics=lyr('1', '2', '3', '4', '5', '6', '7', '8')),
        text=L('From one C to the next is eight notes: an octave (from Latin octo, eight). Both notes have the same name and sound "the same, only higher".',
               'Von einem C zum nächsten sind es acht Töne: eine Oktave (lateinisch octo, acht). Beide Töne haben denselben Namen und klingen „gleich, nur höher“.',
               "D'un do au suivant, il y a huit notes : une octave (du latin octo, huit). Les deux notes portent le même nom et sonnent « pareil, mais plus aigu ».")),
      bullets(L('Saying the names', 'Die Namen aufsagen', 'Dire les noms'),
        L('Up from {n:C4}: {n:C4} {n:D4} {n:E4} {n:F4} {n:G4} {n:A4} {n:B4} {n:C5}', 'Aufwärts ab {n:C4}: {n:C4} {n:D4} {n:E4} {n:F4} {n:G4} {n:A4} {n:B4} {n:C5}', 'En montant depuis {n:C4} : {n:C4} {n:D4} {n:E4} {n:F4} {n:G4} {n:A4} {n:B4} {n:C5}'),
        L('Down from {n:C5}: {n:C5} {n:B4} {n:A4} {n:G4} {n:F4} {n:E4} {n:D4} {n:C4}', 'Abwärts ab {n:C5}: {n:C5} {n:B4} {n:A4} {n:G4} {n:F4} {n:E4} {n:D4} {n:C4}', 'En descendant depuis {n:C5} : {n:C5} {n:B4} {n:A4} {n:G4} {n:F4} {n:E4} {n:D4} {n:C4}'),
        L('In skips: {n:C4} {n:E4} {n:G4} {n:B4} {n:D5} {n:F5} {n:A5}', 'In Sprüngen: {n:C4} {n:E4} {n:G4} {n:B4} {n:D5} {n:F5} {n:A5}', 'Par sauts : {n:C4} {n:E4} {n:G4} {n:B4} {n:D5} {n:F5} {n:A5}'),
        L('Try starting on any note - e.g. from {n:G4} down to {n:G3}', 'Beginne auf einem beliebigen Ton – etwa von {n:G4} abwärts bis {n:G3}', "Commence sur n'importe quelle note – par exemple de {n:G4} jusqu'au {n:G3} en descendant")),
    ],
    quiz=[
      ask(L('Which white key lies just left of a group of two black keys?', 'Welche weiße Taste liegt links neben einer Zweiergruppe schwarzer Tasten?', 'Quelle touche blanche est juste à gauche d’un groupe de deux touches noires ?'), ['{n:C4}', '{n:F4}', '{n:A4}', '{n:E4}']),
      ask(L('Which white key lies just left of a group of three black keys?', 'Welche weiße Taste liegt links neben einer Dreiergruppe schwarzer Tasten?', 'Quelle touche blanche est juste à gauche d’un groupe de trois touches noires ?'), ['{n:F4}', '{n:C4}', '{n:G4}', '{n:B4}']),
      ask(L('How many notes does an octave span, counting both ends?', 'Wie viele Töne umfasst eine Oktave, beide Enden mitgezählt?', "Combien de notes compte une octave, en comptant les deux extrémités ?"), ['8', '7', '12', '10']),
      q_prev('C5', 'B4', ['D5', 'A4', 'C4']),
      q_prev('F4', 'E4', ['G4', 'D4', 'F5']),
    ]),
  lesson(L('Practice: the note-name circle', 'Übung: der Notennamen-Kreis', 'Entraînement : le cercle des noms'),
    L('Speed up your note names: forwards, backwards and in skips. Fluency here makes reading much easier later.',
      'Werde schneller mit den Notennamen: vorwärts, rückwärts und in Sprüngen. Diese Sicherheit macht das Lesen später viel leichter.',
      "Gagne en vitesse avec le nom des notes : en montant, en descendant et par sauts. Cette aisance facilitera beaucoup la lecture."),
    [
      bullets(L('Week 2 in a nutshell', 'Woche 2 kurz gefasst', 'La semaine 2 en bref'),
        L('Seven note names, repeated in every octave', 'Sieben Notennamen, die sich in jeder Oktave wiederholen', 'Sept noms de notes, répétés à chaque octave'),
        L('English C D E F G A B · German C D E F G A H · French do ré mi fa sol la si', 'Englisch C D E F G A B · Deutsch C D E F G A H · Französisch do re mi fa sol la si', 'Anglais C D E F G A B · allemand C D E F G A H · français do ré mi fa sol la si'),
        L('{n:C4} sits left of two black keys, {n:F4} left of three', '{n:C4} liegt links von zwei schwarzen Tasten, {n:F4} links von drei', 'Le {n:C4} est à gauche de deux touches noires, le {n:F4} à gauche de trois'),
        L('Octave: eight notes up, the same name again', 'Oktave: acht Töne höher, wieder derselbe Name', "Octave : huit notes plus haut, le même nom"),
        summary=True),
    ],
    quiz=[
      q_next('E4', 'F4', ['G4', 'D4', 'E5']),
      q_next('A4', 'B4', ['C5', 'G4', 'A5']),
      q_prev('D4', 'C4', ['E4', 'B3', 'D5']),
      q_prev('A4', 'G4', ['B4', 'F4', 'A3']),
      ask(L('Skip one name each time: {n:C4} {n:E4} {n:G4} → ?', 'Überspringe jeweils einen Namen: {n:C4} {n:E4} {n:G4} → ?', 'Saute un nom à chaque fois : {n:C4} {n:E4} {n:G4} → ?'), ['{n:B4}', '{n:A4}', '{n:C5}', '{n:F4}']),
      ask(L('Going down in skips: {n:A4} {n:F4} {n:D4} → ?', 'Abwärts in Sprüngen: {n:A4} {n:F4} {n:D4} → ?', 'En descendant par sauts : {n:A4} {n:F4} {n:D4} → ?'), ['{n:B3}', '{n:C4}', '{n:E4}', '{n:A3}']),
      ask(L('Which note is an octave above {n:G4}?', 'Welcher Ton liegt eine Oktave über {n:G4}?', 'Quelle note est une octave au-dessus de {n:G4} ?'), ['{n:G5}', '{n:A4}', '{n:F5}', '{n:C5}']),
      ask(L('What is the 5th note counting up from {n:C4} (C = 1)?', 'Welcher ist der 5. Ton aufwärts ab {n:C4} (C = 1)?', 'Quelle est la 5e note en montant depuis {n:C4} (do = 1) ?'), ['{n:G4}', '{n:F4}', '{n:A4}', '{n:E4}']),
    ], minutes=10),
)

TREBLE_LINES = ['E4', 'G4', 'B4', 'D5', 'F5']
TREBLE_SPACES = ['F4', 'A4', 'C5', 'E5']

W3 = week(3, L('The Treble Clef', 'Der Violinschlüssel', 'La clé de sol'),
  lesson(L('The treble clef (G clef)', 'Der Violinschlüssel (G-Schlüssel)', 'La clé de sol'),
    L('A clef at the start of the staff tells you which note sits on which line. The treble clef - used by violins, flutes, singers and the pianist\'s right hand - points to G.',
      'Ein Schlüssel am Anfang der Zeile sagt dir, welcher Ton auf welcher Linie steht. Der Violinschlüssel – für Geige, Flöte, Gesang und die rechte Hand am Klavier – zeigt auf das G.',
      "La clé, au début de la portée, indique quelle note se trouve sur quelle ligne. La clé de sol – pour le violon, la flûte, la voix et la main droite du piano – désigne le sol."),
    [
      staff(L('The treble clef', 'Der Violinschlüssel', 'La clé de sol'), abc('x8'),
        text=L('The clef grew out of a letter G. Its curl wraps around line 2: every note on line 2 is a {n:G4}.',
               'Der Schlüssel entstand aus einem Buchstaben G. Seine Schnecke umschließt die 2. Linie: Jede Note auf der 2. Linie ist ein {n:G4}.',
               "La clé est née d'une lettre G. Sa boucle entoure la 2e ligne : toute note sur la 2e ligne est un {n:G4}.")),
      staff(L('{n:G4} on line 2', '{n:G4} auf der 2. Linie', '{n:G4} sur la 2e ligne'), lambda lang: notes(['G4', 'G4', 'G4', 'G4'], lang),
        text=L('Find {n:G4} first - then count up and down from it.', 'Finde zuerst das {n:G4} – dann zähle von dort auf- und abwärts.', 'Trouve d’abord le {n:G4} – puis compte en montant et en descendant.')),
      staff(L('Counting from {n:G4}', 'Vom {n:G4} aus zählen', 'Compter à partir du {n:G4}'), lambda lang: notes(['G4', 'A4', 'B4', 'C5', 'D5', 'C5', 'B4', 'A4', 'G4', 'F4', 'E4'], lang)),
      bullets(L('Who reads the treble clef?', 'Wer liest im Violinschlüssel?', 'Qui lit en clé de sol ?'),
        L('Violin, flute, oboe, clarinet, trumpet, recorder', 'Violine, Flöte, Oboe, Klarinette, Trompete, Blockflöte', 'Violon, flûte, hautbois, clarinette, trompette, flûte à bec'),
        L('Sopranos and altos, children\'s voices - and most songs', 'Sopran und Alt, Kinderstimmen – und die meisten Lieder', 'Sopranos et altos, voix d’enfants – et la plupart des chansons'),
        L('The right hand of the piano', 'Die rechte Hand am Klavier', 'La main droite du piano'),
        L('Guitar music too (it sounds an octave lower than written)', 'Auch die Gitarre (sie klingt eine Oktave tiefer als notiert)', "La guitare aussi (elle sonne une octave plus bas qu'écrit)")),
    ],
    quiz=[
      ask(L('Which line does the treble clef curl around?', 'Um welche Linie windet sich der Violinschlüssel?', 'Autour de quelle ligne s’enroule la clé de sol ?'),
          [L('Line 2', 'Die 2. Linie', 'La 2e ligne'), L('Line 1', 'Die 1. Linie', 'La 1re ligne'), L('Line 3', 'Die 3. Linie', 'La 3e ligne'), L('Line 4', 'Die 4. Linie', 'La 4e ligne')]),
      ask(L('Which note does the treble clef name?', 'Welchen Ton bestimmt der Violinschlüssel?', 'Quelle note la clé de sol désigne-t-elle ?'), ['{n:G4}', '{n:C4}', '{n:F4}', '{n:A4}']),
      q_note('G4'), q_note('A4'), q_note('F4'),
    ]),
  lesson(L('Lines and spaces in the treble clef', 'Linien und Zwischenräume im Violinschlüssel', 'Lignes et interlignes en clé de sol'),
    L('Learn the five line notes and the four space notes - two short groups that unlock the whole staff.',
      'Lerne die fünf Liniennoten und die vier Zwischenraumnoten – zwei kurze Gruppen, die dir das ganze System erschließen.',
      "Apprends les cinq notes des lignes et les quatre notes des interlignes – deux petits groupes qui ouvrent toute la portée."),
    [
      staff(L('The five lines', 'Die fünf Linien', 'Les cinq lignes'), lambda lang: notes(TREBLE_LINES, lang, duration='2'),
        text=L('Bottom to top: {n:E4} {n:G4} {n:B4} {n:D5} {n:F5} - "Every Good Boy Deserves Fruit".',
               'Von unten nach oben: {n:E4} {n:G4} {n:B4} {n:D5} {n:F5}.',
               'De bas en haut : {n:E4} {n:G4} {n:B4} {n:D5} {n:F5}.')),
      staff(L('The four spaces', 'Die vier Zwischenräume', 'Les quatre interlignes'), lambda lang: notes(TREBLE_SPACES, lang, duration='2'),
        text=L('Bottom to top: {n:F4} {n:A4} {n:C5} {n:E5} - they spell FACE.',
               'Von unten nach oben: {n:F4} {n:A4} {n:C5} {n:E5}.',
               'De bas en haut : {n:F4} {n:A4} {n:C5} {n:E5}.')),
      bullets(L('Three landmarks', 'Drei Orientierungspunkte', 'Trois repères'),
        L('{n:G4} on line 2 - the clef tells you', '{n:G4} auf der 2. Linie – das sagt der Schlüssel', '{n:G4} sur la 2e ligne – la clé te le dit'),
        L('{n:B4} on the middle line', '{n:B4} auf der Mittellinie', '{n:B4} sur la ligne du milieu'),
        L('{n:F5} on the top line', '{n:F5} auf der obersten Linie', '{n:F5} sur la ligne du haut'),
        L('From a landmark, count by steps to any note nearby', 'Von einem Orientierungspunkt zählst du schrittweise zu jedem Nachbarton', 'À partir d’un repère, compte par degrés jusqu’à la note voisine')),
      staff(L('Read the notes', 'Lies die Noten', 'Lis les notes'), abc('E G B d f | F A c e | G B d B G |]'),
        text=L('Say the names out loud, then check yourself with the slides before.', 'Sag die Namen laut und kontrolliere dich mit den vorigen Folien.', 'Dis les noms à voix haute, puis vérifie avec les diapositives précédentes.')),
    ],
    quiz=[q_note('E4'), q_note('B4'), q_note('D5'), q_note('C5'), q_note('E5')]),
  lesson(L('Practice: reading in the treble clef', 'Übung: Lesen im Violinschlüssel', 'Entraînement : lire en clé de sol'),
    L('A long drill: name each note on the staff. Use the landmarks {n:G4}, {n:B4} and {n:F5} if you hesitate. Then read the first bars of a real children\'s piece.',
      'Ein langes Training: Benenne jede Note. Nutze die Orientierungspunkte {n:G4}, {n:B4} und {n:F5}, wenn du zögerst. Danach liest du die ersten Takte eines echten Kinderstücks.',
      "Un long entraînement : nomme chaque note. Aide-toi des repères {n:G4}, {n:B4} et {n:F5} si tu hésites. Puis lis les premières mesures d'une vraie pièce pour enfants."),
    [
      staff(L('A melody to read', 'Eine Melodie zum Lesen', 'Une mélodie à lire'), abc(TWINKLE, meter='4/4'),
        text=L('Name each note, then sing or hum it. Do you recognise the tune? Mozart wrote twelve variations on it (in the Library).',
               'Benenne jede Note, dann sing oder summ sie. Erkennst du die Melodie? Mozart schrieb zwölf Variationen darüber (in der Bibliothek).',
               'Nomme chaque note, puis chante-la ou fredonne-la. Reconnais-tu l’air ? Mozart a écrit douze variations sur ce thème (dans la Bibliothèque).')),
      bullets(L('Week 3 in a nutshell', 'Woche 3 kurz gefasst', 'La semaine 3 en bref'),
        L('The treble clef curls around line 2: {n:G4}', 'Der Violinschlüssel umschließt die 2. Linie: {n:G4}', 'La clé de sol s’enroule autour de la 2e ligne : {n:G4}'),
        L('Lines: {n:E4} {n:G4} {n:B4} {n:D5} {n:F5}', 'Linien: {n:E4} {n:G4} {n:B4} {n:D5} {n:F5}', 'Lignes : {n:E4} {n:G4} {n:B4} {n:D5} {n:F5}'),
        L('Spaces: {n:F4} {n:A4} {n:C5} {n:E5}', 'Zwischenräume: {n:F4} {n:A4} {n:C5} {n:E5}', 'Interlignes : {n:F4} {n:A4} {n:C5} {n:E5}'),
        L('Landmarks: {n:G4}, {n:B4} (middle line), {n:F5} (top line)', 'Orientierung: {n:G4}, {n:B4} (Mittellinie), {n:F5} (oberste Linie)', 'Repères : {n:G4}, {n:B4} (ligne du milieu), {n:F5} (ligne du haut)'),
        summary=True),
    ],
    quiz=[q_note('F5'), q_note('A4'), q_note('D5'), q_note('E4'), q_note('C5'), q_note('G4'), q_note('B4'), q_note('E5'),
          ask(L('Which note is the first one of this melody?', 'Welcher Ton ist der erste dieser Melodie?', 'Quelle est la première note de cette mélodie ?'),
              ['{n:G4}', '{n:A4}', '{n:B4}', '{n:E4}'], music=abc('G A B c | d2 d2 |]', meter='4/4'), count=6)],
    library=[(AH_VOUS, L('Mozart\'s variations on "Ah vous dirai-je, Maman" (Twinkle, Twinkle): find the theme at the start and name its first eight notes.',
                         'Mozarts Variationen über „Ah vous dirai-je, Maman“ („Morgen kommt der Weihnachtsmann“): Finde das Thema am Anfang und benenne seine ersten acht Noten.',
                         "Les variations de Mozart sur « Ah vous dirai-je, maman » : trouve le thème au début et nomme ses huit premières notes."))],
    minutes=15),
)

W4 = week(4, L('Ledger Lines and Octaves', 'Hilfslinien und Oktaven', 'Lignes supplémentaires et octaves'),
  lesson(L('Ledger lines and middle C', 'Hilfslinien und das mittlere C', 'Les lignes supplémentaires et le do central'),
    L('When a melody goes higher or lower than the staff, short extra lines help out. The most important note below the staff is middle C.',
      'Wenn eine Melodie über oder unter das System hinausgeht, helfen kurze Zusatzlinien aus. Die wichtigste Note unter dem System ist das mittlere C.',
      "Quand une mélodie dépasse la portée vers le haut ou vers le bas, de petites lignes viennent en aide. La note la plus importante sous la portée est le do central."),
    [
      staff(L('Ledger lines', 'Hilfslinien', 'Lignes supplémentaires'), lambda lang: notes(['A3', 'B3', 'C4', 'D4', 'G5', 'A5', 'B5', 'C6'], lang, duration='2'),
        text=L('Short ledger lines extend the staff for single notes. They continue the line-space pattern.',
               'Kurze Hilfslinien verlängern das System für einzelne Noten. Das Muster Linie-Zwischenraum geht einfach weiter.',
               'De petites lignes supplémentaires prolongent la portée pour quelques notes. Le motif ligne-interligne continue.')),
      staff(L('Middle C', 'Das mittlere C', 'Le do central'), lambda lang: notes(['C4', 'C4'], lang, duration='4'),
        text=L('{n:C4} on one ledger line below the treble staff is "middle C" - in the middle of the piano keyboard and between the two clefs.',
               '{n:C4} auf einer Hilfslinie unter dem System ist das „mittlere C“ – in der Mitte der Klaviatur und zwischen den beiden Schlüsseln.',
               "Le {n:C4} sur une ligne supplémentaire sous la portée est le « do central » – au milieu du clavier et entre les deux clés.")),
      staff(L('From middle C up', 'Vom mittleren C aufwärts', 'Du do central vers le haut'), lambda lang: notes(scale('C4'), lang)),
      bullets(L('Reading ledger lines', 'Hilfslinien lesen', 'Lire les lignes supplémentaires'),
        L('Count the ledger lines first, then count steps from the staff', 'Zähle zuerst die Hilfslinien, dann die Schritte vom System aus', "Compte d'abord les lignes supplémentaires, puis les degrés depuis la portée"),
        L('One line below: {n:C4}; just below it: {n:B3}; two lines below: {n:A3}', 'Eine Linie darunter: {n:C4}; direkt darunter: {n:B3}; zwei Linien darunter: {n:A3}', 'Une ligne en dessous : {n:C4} ; juste dessous : {n:B3} ; deux lignes en dessous : {n:A3}'),
        L('One line above: {n:A5}; two lines above: {n:C6}', 'Eine Linie darüber: {n:A5}; zwei Linien darüber: {n:C6}', 'Une ligne au-dessus : {n:A5} ; deux lignes au-dessus : {n:C6}'),
        L('Directly above the top line (no ledger line): {n:G5}', 'Direkt über der obersten Linie (ohne Hilfslinie): {n:G5}', 'Juste au-dessus de la ligne du haut (sans ligne supplémentaire) : {n:G5}')),
    ],
    quiz=[q_note('C4'), q_note('A5'), q_note('B3'), q_note('G5'),
          ask(L('How many ledger lines does middle C have in the treble clef?', 'Wie viele Hilfslinien hat das mittlere C im Violinschlüssel?', 'Combien de lignes supplémentaires a le do central en clé de sol ?'), ['1', '2', '0', '3'])]),
  lesson(L('Naming the octaves', 'Die Oktaven benennen', 'Nommer les octaves'),
    L('There are many Cs on a piano - how do you tell them apart? Each language has its own system: numbers, primes or registers.',
      'Auf dem Klavier gibt es viele Cs – wie unterscheidet man sie? Jede Sprache hat ihr eigenes System: Zahlen, Striche oder Oktavnamen.',
      "Il y a beaucoup de do sur un piano – comment les distinguer ? Chaque langue a son système : chiffres, indices ou noms d'octaves."),
    [
      keyboard(L('Many Cs', 'Viele Cs', 'Plusieurs do'), start='C3', octaves=3, key_width=60, highlight=['C3', 'C4', 'C5'],
        labels={'C3': L('C3', 'c', 'do2'), 'C4': L('C4', "c'", 'do3'), 'C5': L('C5', "c''", 'do4')},
        text=L('Scientific pitch: middle C is C4, the next C up is C5. The A above middle C (A4) is the tuning note at 440 Hz.',
               "Deutsche Oktavbezeichnung: Das mittlere C ist das eingestrichene c' (c¹), darunter liegt das kleine c, darüber das zweigestrichene c''.",
               'En France, le do central est le do3 ; le do au-dessus est le do4. Le la3, juste au-dessus du do central, est le la du diapason (440 Hz).')),
      bullets(L('Octave names', 'Oktavbezeichnungen', "Les noms d'octaves"),
        L('English: numbers - C4 is middle C, every C starts a new number', "Englisch: Zahlen – C4 ist das mittlere C (bei uns c')", "Anglais : des chiffres – C4 est le do central (notre do3)"),
        L("German: letters and primes - great C, small c, c' (one-line), c'' (two-line)", "Deutsch: Großes C, kleines c, eingestrichenes c', zweigestrichenes c'' ...", "Allemand : grand C, petit c, c' (une prime), c'' (deux primes)..."),
        L('French: middle C is do3 - one number lower than English', "Französisch: Das mittlere C heißt do3 – eine Zahl tiefer als im Englischen (C4)", "Français : le do central est le do3 – un chiffre de moins qu'en anglais (C4)"),
        L('Whatever the system, all octaves share the same note names', 'Egal welches System: Alle Oktaven teilen dieselben Notennamen', 'Quel que soit le système, toutes les octaves partagent les mêmes noms')),
      staff(L('Same name, different octave', 'Gleicher Name, andere Oktave', 'Même nom, autre octave'), lambda lang: notes(['C4', 'C5', 'G4', 'G5', 'E4', 'E5'], lang, duration='2'),
        text=L('Notes an octave apart look different on the staff - one on a line, the other in a space - but have the same name.',
               'Töne im Oktavabstand sehen im System verschieden aus – einer auf einer Linie, der andere im Zwischenraum – heißen aber gleich.',
               "Deux notes à l'octave ne se ressemblent pas sur la portée – l'une sur une ligne, l'autre dans un interligne – mais portent le même nom.")),
    ],
    quiz=[
      ask(L('Which name does middle C have in French?', 'Wie heißt das mittlere C im Französischen?', 'Comment appelle-t-on le do central en français ?'), ['do3', 'do4', 'do1', 'do5']),
      ask(L('In scientific pitch notation middle C is ...', 'In der wissenschaftlichen Notation (englisch) heißt das mittlere C ...', 'En notation scientifique (anglaise), le do central se nomme ...'), ['C4', 'C3', 'C5', 'C1']),
      ask(L("In German, middle C is called ...", "Im Deutschen heißt das mittlere C ...", "En allemand, le do central se nomme ..."), ["c' (eingestrichenes c)", "C (großes C)", "c (kleines c)", "c'' (zweigestrichenes c)"]),
      ask(L('These two notes are ...', 'Diese beiden Noten sind ...', 'Ces deux notes sont ...'),
          [L('an octave apart', 'eine Oktave voneinander entfernt', "à l'octave"), L('the same note', 'derselbe Ton', 'la même note'), L('a step apart', 'ein Schritt voneinander entfernt', 'voisines')],
          music=abc('E2 e2'), count=2),
    ]),
  lesson(L('Practice: month 1 review', 'Übung: Rückblick auf Monat 1', 'Entraînement : bilan du mois 1'),
    L('A review of the first month: the staff, note names, the treble clef and ledger lines - and your first look at a Bach minuet.',
      'Ein Rückblick auf den ersten Monat: Notensystem, Notennamen, Violinschlüssel und Hilfslinien – und ein erster Blick auf ein Menuett von Bach.',
      "Un bilan du premier mois : la portée, le nom des notes, la clé de sol et les lignes supplémentaires – et un premier regard sur un menuet de Bach."),
    [
      staff(L('Bach: Minuet in G (beginning)', 'Bach: Menuett in G (Anfang)', 'Bach : Menuet en sol (début)'), abc(MINUET, meter='3/4', unit='1/8', key='G'),
        text=L('From the Notebook for Anna Magdalena Bach (1725). Name the first note of every bar - you will learn about the sharp sign at the beginning in week 10.',
               'Aus dem Notenbüchlein für Anna Magdalena Bach (1725). Benenne die erste Note jedes Takts – das Kreuz am Anfang lernst du in Woche 10 kennen.',
               "Extrait du Petit livre d'Anna Magdalena Bach (1725). Nomme la première note de chaque mesure – le dièse au début, tu le découvriras en semaine 10.")),
      bullets(L('Month 1 in a nutshell', 'Monat 1 kurz gefasst', 'Le mois 1 en bref'),
        L('Five lines, four spaces; higher on the staff sounds higher', 'Fünf Linien, vier Zwischenräume; weiter oben klingt höher', 'Cinq lignes, quatre interlignes ; plus haut = plus aigu'),
        L('Seven note names repeat in every octave', 'Sieben Notennamen wiederholen sich in jeder Oktave', 'Sept noms de notes, répétés à chaque octave'),
        L('Treble clef: {n:G4} on line 2; lines {n:E4} {n:G4} {n:B4} {n:D5} {n:F5}, spaces {n:F4} {n:A4} {n:C5} {n:E5}', 'Violinschlüssel: {n:G4} auf der 2. Linie; Linien {n:E4} {n:G4} {n:B4} {n:D5} {n:F5}, Zwischenräume {n:F4} {n:A4} {n:C5} {n:E5}', 'Clé de sol : {n:G4} sur la 2e ligne ; lignes {n:E4} {n:G4} {n:B4} {n:D5} {n:F5}, interlignes {n:F4} {n:A4} {n:C5} {n:E5}'),
        L('Ledger lines extend the staff; middle C sits on one ledger line below', 'Hilfslinien verlängern das System; das mittlere C liegt auf einer Hilfslinie darunter', 'Les lignes supplémentaires prolongent la portée ; le do central est sur une ligne en dessous'),
        summary=True),
    ],
    quiz=[q_note('C4'), q_note('D4'), q_note('B3'), q_note('A5'), q_note('G5'), q_note('F4'), q_note('C5'), q_note('E5'),
          ask(L('Which note begins the Minuet in G?', 'Mit welchem Ton beginnt das Menuett in G?', 'Par quelle note commence le Menuet en sol ?'), ['{n:D5}', '{n:G4}', '{n:B4}', '{n:C5}'],
              music=abc('d2 GABc | d2 G2 G2 |]', meter='3/4', unit='1/8', key='G'), count=8),
          ask(L('How many different notes are in this bar?', 'Wie viele verschiedene Töne enthält dieser Takt?', 'Combien de notes différentes contient cette mesure ?'), ['5', '4', '6', '3'],
              music=abc('d2 GABc |]', meter='3/4', unit='1/8', key='G'), count=5)],
    library=[(MINUET_G, L('The Minuet in G from the Notebook for Anna Magdalena Bach: open the score and name the first note of each bar of the first line.',
                          'Das Menuett in G aus dem Notenbüchlein für Anna Magdalena Bach: Öffne die Noten und benenne die erste Note jedes Takts der ersten Zeile.',
                          "Le Menuet en sol du Petit livre d'Anna Magdalena Bach : ouvre la partition et nomme la première note de chaque mesure de la première ligne."))],
    minutes=15),
)

# --- Month 2: rhythm ------------------------------------------------------------

WHOLE = L('whole note', 'ganze Note', 'ronde')
HALF = L('half note', 'halbe Note', 'blanche')
QUARTER = L('quarter note', 'Viertelnote', 'noire')
EIGHTH = L('eighth note', 'Achtelnote', 'croche')
WHOLE_REST = L('whole rest', 'ganze Pause', 'pause')
HALF_REST = L('half rest', 'halbe Pause', 'demi-pause')
QUARTER_REST = L('quarter rest', 'Viertelpause', 'soupir')
EIGHTH_REST = L('eighth rest', 'Achtelpause', 'demi-soupir')


def beats_question(body, answer, others, unit='1/4'):
    return ask(Q_BEATS, [str(answer)] + [str(o) for o in others], music=abc(body + ' |]', unit=unit), count=6)


W5 = week(5, L('Beat and Note Values', 'Puls und Notenwerte', 'La pulsation et les figures de notes'),
  lesson(L('The beat and three note values', 'Der Puls und drei Notenwerte', 'La pulsation et trois figures de notes'),
    L('Music has a heartbeat - the beat. The shape of a note tells you how many beats it lasts: whole, half and quarter notes.',
      'Musik hat einen Herzschlag – den Puls. Die Form einer Note sagt, wie viele Schläge sie dauert: ganze, halbe und Viertelnoten.',
      "La musique a un cœur qui bat – la pulsation. La forme d'une note indique combien de temps elle dure : ronde, blanche et noire."),
    [
      bullets(L('The beat', 'Der Puls', 'La pulsation'),
        L('Tap your foot to any song: that steady tap is the beat (or pulse)', 'Tippe mit dem Fuß zu einem Lied: Dieses gleichmäßige Tippen ist der Puls (Grundschlag)', 'Tape du pied sur une chanson : ce battement régulier est la pulsation (le temps)'),
        L('Pitch is shown up and down - duration from left to right', 'Tonhöhe zeigt sich oben und unten – die Dauer von links nach rechts', 'La hauteur se lit de bas en haut – la durée de gauche à droite'),
        L('The shape of a note shows how long it lasts', 'Die Form einer Note zeigt, wie lange sie dauert', "La forme d'une note montre combien de temps elle dure"),
        L('Open or filled note head, with or without a stem', 'Leerer oder gefüllter Notenkopf, mit oder ohne Hals', 'Tête de note blanche ou noire, avec ou sans hampe')),
      staff(L('Whole, half and quarter notes', 'Ganze, halbe und Viertelnoten', 'Ronde, blanche et noire'),
        abc('B4 | B2 B2 | B B B B |]', meter='4/4', lyrics=lyr(WHOLE, HALF, '*', QUARTER, '*', '*', '*')), scale=2.0,
        points=[L('Whole note (semibreve): open head, no stem - 4 beats', 'Ganze Note: leerer Kopf, ohne Hals – 4 Schläge', 'Ronde : tête blanche, sans hampe – 4 temps'),
                L('Half note (minim): open head with stem - 2 beats', 'Halbe Note: leerer Kopf mit Hals – 2 Schläge', 'Blanche : tête blanche avec hampe – 2 temps'),
                L('Quarter note (crotchet): filled head with stem - 1 beat', 'Viertelnote: gefüllter Kopf mit Hals – 1 Schlag', 'Noire : tête noire avec hampe – 1 temps')]),
      bullets(L('Stems up or down', 'Hals nach oben oder unten', 'Hampe en haut ou en bas'),
        L('Below the middle line: stem up, on the right of the head', 'Unter der Mittellinie: Hals nach oben, rechts am Kopf', 'Sous la ligne du milieu : hampe vers le haut, à droite de la tête'),
        L('On or above the middle line: stem down, on the left', 'Auf oder über der Mittellinie: Hals nach unten, links', 'Sur ou au-dessus de la ligne du milieu : hampe vers le bas, à gauche'),
        L('The direction never changes the length of a note', 'Die Richtung ändert nie die Dauer einer Note', 'Le sens de la hampe ne change jamais la durée'),
        L('It just keeps the music tidy and easy to read', 'Sie sorgt nur für ein ordentliches, gut lesbares Notenbild', 'Il rend simplement la partition plus claire')),
      staff(L('How they add up', 'Wie sie sich zusammensetzen', "Comment elles s'additionnent"), abc('c4 | c2 c2 | c c c c |]', meter='4/4', lyrics=lyr('1~2~3~4', '1~2', '3~4', '1', '2', '3', '4')),
        text=L('1 whole note = 2 half notes = 4 quarter notes.', '1 ganze Note = 2 halbe Noten = 4 Viertelnoten.', '1 ronde = 2 blanches = 4 noires.')),
    ],
    quiz=[
      ask(L('How many beats does a whole note last (in 4/4)?', 'Wie viele Schläge dauert eine ganze Note (im 4/4-Takt)?', 'Combien de temps dure une ronde (en 4/4) ?'), ['4', '2', '1', '3']),
      ask(L('Which note value is this?', 'Welcher Notenwert ist das?', 'Quelle est cette figure de note ?'), [HALF, WHOLE, QUARTER, EIGHTH], music=abc('B2'), count=1),
      ask(L('Which note value is this?', 'Welcher Notenwert ist das?', 'Quelle est cette figure de note ?'), [QUARTER, HALF, WHOLE, EIGHTH], music=abc('G'), count=1),
      ask(L('How many quarter notes fit into a half note?', 'Wie viele Viertelnoten passen in eine halbe Note?', 'Combien de noires dans une blanche ?'), ['2', '4', '1', '3']),
    ]),
  lesson(L('Rests: counted silence', 'Pausen: gezählte Stille', 'Les silences : se taire en mesure'),
    L('Silence is part of music too. Every note value has a matching rest - and you count a rest exactly like a note.',
      'Auch Stille gehört zur Musik. Zu jedem Notenwert gibt es eine passende Pause – und eine Pause zählt man genau wie eine Note.',
      "Le silence fait aussi partie de la musique. À chaque figure de note correspond un silence – et un silence se compte exactement comme une note."),
    [
      staff(L('Whole, half and quarter rests', 'Ganze, halbe und Viertelpause', 'Pause, demi-pause et soupir'),
        abc('z4 | z2 z2 | z z z z |]', meter='4/4', lyrics=None),
        points=[L('Whole rest: a block hanging from line 4 - a whole bar of silence', 'Ganze Pause: ein Balken, der an der 4. Linie hängt – ein ganzer Takt Stille', 'Pause : un petit rectangle suspendu sous la 4e ligne – une mesure entière de silence'),
                L('Half rest: a block sitting on line 3 - 2 beats', 'Halbe Pause: ein Balken, der auf der 3. Linie sitzt – 2 Schläge', 'Demi-pause : un rectangle posé sur la 3e ligne – 2 temps'),
                L('Quarter rest: a zigzag - 1 beat', 'Viertelpause: ein Zickzack – 1 Schlag', 'Soupir : un zigzag – 1 temps')]),
      bullets(L('Hat or hole?', 'Hut oder Loch?', 'Chapeau ou trou ?'),
        L('The half rest sits on the line like a hat', 'Die halbe Pause sitzt auf der Linie wie ein Hut', 'La demi-pause est posée sur la ligne comme un chapeau'),
        L('The whole rest hangs below the line like a hole - it is "heavier"', 'Die ganze Pause hängt unter der Linie wie ein Loch – sie ist „schwerer“', 'La pause pend sous la ligne comme un trou – elle est « plus lourde »'),
        L('A whole rest also means "rest for the whole bar" in any time signature', 'Eine ganze Pause bedeutet in jeder Taktart auch „den ganzen Takt Pause“', 'La pause signifie aussi « toute la mesure en silence », quelle que soit la mesure'),
        L('Count rests out loud - silence must be exact', 'Zähle Pausen laut mit – auch Stille muss genau sein', 'Compte les silences à voix haute – le silence doit être précis')),
      staff(L('Notes and rests together', 'Noten und Pausen zusammen', 'Notes et silences ensemble'), abc('c c z c | c2 z2 | z c c2 | c4 |]', meter='4/4', lyrics=lyr('1', '2', '4', '1', '2', '3', '1')),
        text=L('Count steadily 1-2-3-4 and clap only on the notes.', 'Zähle gleichmäßig 1-2-3-4 und klatsche nur bei den Noten.', 'Compte régulièrement 1-2-3-4 et frappe seulement sur les notes.')),
    ],
    quiz=[
      ask(L('Which rest is this?', 'Welche Pause ist das?', 'Quel est ce silence ?'), [HALF_REST, WHOLE_REST, QUARTER_REST], music=abc('z2'), count=1),
      ask(L('Which rest is this?', 'Welche Pause ist das?', 'Quel est ce silence ?'), [WHOLE_REST, HALF_REST, QUARTER_REST], music=abc('z4'), count=1),
      ask(L('Which rest is this?', 'Welche Pause ist das?', 'Quel est ce silence ?'), [QUARTER_REST, HALF_REST, WHOLE_REST], music=abc('z'), count=1),
      ask(L('How many beats of silence does a half rest give?', 'Wie viele Schläge Stille bringt eine halbe Pause?', 'Combien de temps de silence dure une demi-pause ?'), ['2', '1', '4', '3']),
    ]),
  lesson(L('Practice: counting note values', 'Übung: Notenwerte zählen', 'Entraînement : compter les durées'),
    L('Add up notes and rests: how many beats does each bar contain? Count out loud and clap.',
      'Addiere Noten und Pausen: Wie viele Schläge enthält jeder Takt? Zähle laut und klatsche.',
      "Additionne notes et silences : combien de temps contient chaque mesure ? Compte à voix haute et frappe dans tes mains."),
    [
      bullets(L('Week 5 in a nutshell', 'Woche 5 kurz gefasst', 'La semaine 5 en bref'),
        L('The beat is the steady pulse of the music', 'Der Puls ist der gleichmäßige Herzschlag der Musik', 'La pulsation est le battement régulier de la musique'),
        L('Whole note 4 beats · half note 2 · quarter note 1', 'Ganze Note 4 Schläge · halbe Note 2 · Viertelnote 1', 'Ronde 4 temps · blanche 2 · noire 1'),
        L('Whole rest hangs, half rest sits, quarter rest zigzags', 'Ganze Pause hängt, halbe Pause sitzt, Viertelpause ist ein Zickzack', 'La pause pend, la demi-pause est posée, le soupir est un zigzag'),
        L('Rests are counted exactly like notes', 'Pausen werden genau wie Noten gezählt', 'Les silences se comptent exactement comme les notes'),
        summary=True),
    ],
    quiz=[
      beats_question('B2 B B', 4, [3, 5, 2]),
      beats_question('B4', 4, [1, 2, 3]),
      beats_question('B B z B', 4, [3, 2, 5]),
      beats_question('B2 z2', 4, [2, 3, 6]),
      beats_question('B2 B', 3, [4, 2, 5]),
      beats_question('z B B2', 4, [3, 5, 2]),
      beats_question('B2 z B2', 5, [4, 3, 6]),
      ask(L('Which is longer?', 'Was ist länger?', 'Lequel est le plus long ?'), [L('A whole note', 'Eine ganze Note', 'Une ronde'), L('Three quarter notes', 'Drei Viertelnoten', 'Trois noires'), L('A half note', 'Eine halbe Note', 'Une blanche')]),
    ], minutes=10),
)

W6 = week(6, L('Bars and Time Signatures', 'Takte und Taktarten', 'Les mesures et leur chiffrage'),
  lesson(L('Bars, bar lines and time signatures', 'Takte, Taktstriche und Taktangaben', 'Mesures, barres de mesure et chiffrage'),
    L('Beats fall into groups of two, three or four. Bar lines mark the groups; the time signature at the start tells you how they are built.',
      'Schläge bilden Gruppen von zwei, drei oder vier. Taktstriche trennen die Gruppen; die Taktangabe am Anfang sagt, wie sie gebaut sind.',
      "Les temps se regroupent par deux, trois ou quatre. Les barres de mesure séparent les groupes ; le chiffrage au début indique comment ils sont construits."),
    [
      staff(L('Bars and bar lines', 'Takte und Taktstriche', 'Mesures et barres de mesure'), abc('c c c c | d2 d2 | e e d d | c4 |]', meter='4/4'),
        points=[L('A bar (measure) is the space between two bar lines', 'Ein Takt ist der Raum zwischen zwei Taktstrichen', "Une mesure est l'espace entre deux barres de mesure"),
                L('A thin and a thick line (final bar line) end the piece', 'Ein dünner und ein dicker Strich (Schlussstrich) beenden das Stück', 'Un trait fin et un trait épais (double barre finale) terminent le morceau')]),
      bullets(L('Reading a time signature', 'Eine Taktangabe lesen', 'Lire un chiffrage de mesure'),
        L('Two numbers, one above the other, after the clef', 'Zwei Zahlen übereinander, nach dem Schlüssel', "Deux chiffres l'un au-dessus de l'autre, après la clé"),
        L('Top number: how many beats in each bar', 'Obere Zahl: wie viele Schläge pro Takt', 'Chiffre du haut : combien de temps par mesure'),
        L('Bottom number: which note gets one beat - 4 means a quarter note', 'Untere Zahl: welcher Notenwert einen Schlag bekommt – 4 heißt Viertelnote', 'Chiffre du bas : quelle figure vaut un temps – 4 signifie la noire'),
        L('4/4 is also written as C ("common time")', 'Der 4/4-Takt wird auch als C geschrieben', 'La mesure à 4/4 s’écrit aussi C')),
      staff('2/4 · 3/4 · 4/4', abc('[M:2/4] c c | c2 || [M:3/4] c c c | c3 || [M:4/4] c c c c | c4 |]', meter='2/4'),
        text=L('Two, three or four quarter-note beats in every bar.', 'Zwei, drei oder vier Viertelschläge in jedem Takt.', 'Deux, trois ou quatre temps de noire dans chaque mesure.')),
    ],
    quiz=[
      ask(L('What does the top number of 3/4 tell you?', 'Was sagt die obere Zahl von 3/4?', 'Que dit le chiffre du haut de 3/4 ?'),
          [L('3 beats in each bar', '3 Schläge pro Takt', '3 temps par mesure'), L('3 bars in the piece', '3 Takte im Stück', '3 mesures dans le morceau'),
           L('Play 3 times faster', 'Dreimal so schnell spielen', 'Jouer trois fois plus vite'), L('The third line is G', 'Die dritte Linie ist G', 'La 3e ligne est sol')]),
      ask(L('In 4/4, which note gets one beat?', 'Welcher Notenwert erhält im 4/4-Takt einen Schlag?', 'En 4/4, quelle figure vaut un temps ?'), [QUARTER, HALF, WHOLE, EIGHTH]),
      ask(L('What is the C at the start of a staff (after the clef)?', 'Was bedeutet das C nach dem Schlüssel?', 'Que signifie le C après la clé ?'),
          [L('4/4 time', 'Den 4/4-Takt', 'La mesure à 4/4'), L('The note C', 'Den Ton C', 'La note do'), L('Play crescendo', 'Crescendo spielen', 'Jouer crescendo'), L('3/4 time', 'Den 3/4-Takt', 'La mesure à 3/4')]),
      ask(L('Which time signature fits this bar?', 'Welche Taktangabe passt zu diesem Takt?', 'Quel chiffrage convient à cette mesure ?'), ['3/4', '4/4', '2/4'], music=abc('c2 c |]'), count=2),
    ]),
  lesson(L('Strong and weak beats', 'Betonte und unbetonte Zählzeiten', 'Temps forts et temps faibles'),
    L('Every time signature has its own swing: the march in two, the waltz in three, the song in four. Feel where the strong beat falls.',
      'Jede Taktart hat ihren eigenen Schwung: der Marsch in zwei, der Walzer in drei, das Lied in vier. Spüre, wo die Betonung liegt.',
      "Chaque mesure a son propre balancement : la marche à deux temps, la valse à trois, la chanson à quatre. Sens où tombe le temps fort."),
    [
      bullets(L('Where is the accent?', 'Wo liegt die Betonung?', 'Où est l’appui ?'),
        L('Beat 1 of every bar is the strongest (the downbeat)', 'Die Eins jedes Takts ist am stärksten betont', 'Le 1er temps de chaque mesure est le plus fort'),
        L('2/4: STRONG - weak - like a march (left, right)', '2/4: STARK – schwach – wie ein Marsch (links, rechts)', '2/4 : FORT – faible – comme une marche (gauche, droite)'),
        L('3/4: STRONG - weak - weak - like a waltz', '3/4: STARK – schwach – schwach – wie ein Walzer', '3/4 : FORT – faible – faible – comme une valse'),
        L('4/4: STRONG - weak - medium - weak', '4/4: STARK – schwach – mittel – schwach', '4/4 : FORT – faible – mi-fort – faible')),
      staff(L('A waltz in 3/4', 'Ein Walzer im 3/4-Takt', 'Une valse à 3/4'), abc('!>!c e g | !>!g3 | !>!e g c\' | !>!c\'3 |]', meter='3/4', lyrics=lyr('1', '2', '3', '1', '1', '2', '3', '1')),
        text=L('Count "ONE two three" - the opening of Strauss\'s Blue Danube waltz moves just like this.',
               'Zähle „EINS zwei drei“ – der Beginn des Donauwalzers von Strauss bewegt sich genau so.',
               "Compte « UN deux trois » – le début du Beau Danube bleu de Strauss se balance exactement ainsi.")),
      staff(L('Read in 4/4: Ode to Joy', 'Lies im 4/4-Takt: Ode an die Freude', "Lis à 4/4 : l'Hymne à la joie"), abc(ODE_FULL, meter='4/4'),
        text=L('Beethoven, Symphony No. 9. Count 1-2-3-4 in every bar, then name the notes.', 'Beethoven, 9. Sinfonie. Zähle in jedem Takt 1-2-3-4, dann benenne die Noten.', 'Beethoven, 9e symphonie. Compte 1-2-3-4 dans chaque mesure, puis nomme les notes.')),
    ],
    quiz=[
      ask(L('Which beat is the strongest in every bar?', 'Welche Zählzeit ist in jedem Takt am stärksten?', 'Quel temps est le plus fort dans chaque mesure ?'), [L('The first', 'Die erste', 'Le premier'), L('The last', 'Die letzte', 'Le dernier'), L('The second', 'Die zweite', 'Le deuxième')]),
      ask(L('A waltz is usually in ...', 'Ein Walzer steht meistens im ...', 'Une valse est généralement à ...'), ['3/4', '2/4', '4/4']),
      ask(L('A march is usually in ...', 'Ein Marsch steht meistens im ...', 'Une marche est généralement à ...'), ['2/4', '3/4', '5/4']),
      ask(L('Which note begins the third bar of the Ode to Joy?', 'Mit welchem Ton beginnt der dritte Takt der Ode an die Freude?', "Par quelle note commence la 3e mesure de l'Hymne à la joie ?"), ['{n:C4}', '{n:E4}', '{n:D4}', '{n:G4}'], music=abc(ODE, meter='4/4'), count=8),
    ],
    library=[(BLUE_DANUBE, L('The main theme of the Blue Danube waltz: find the time signature and count "ONE two three" through the first line.',
                             'Das Hauptthema des Donauwalzers: Finde die Taktangabe und zähle die erste Zeile mit „EINS zwei drei“.',
                             'Le thème du Beau Danube bleu : trouve le chiffrage et compte « UN deux trois » sur la première ligne.'))]),
  lesson(L('Practice: time signatures', 'Übung: Taktarten', 'Entraînement : les mesures'),
    L('Which time signature fits? How many beats are missing? A practice quiz on bars and time signatures.',
      'Welche Taktart passt? Wie viele Schläge fehlen? Ein Übungsquiz zu Takten und Taktarten.',
      "Quel chiffrage convient ? Combien de temps manquent ? Un quiz d'entraînement sur les mesures."),
    [
      bullets(L('Week 6 in a nutshell', 'Woche 6 kurz gefasst', 'La semaine 6 en bref'),
        L('Bar lines divide the music into bars of equal length', 'Taktstriche teilen die Musik in gleich lange Takte', 'Les barres de mesure divisent la musique en mesures égales'),
        L('Top number = beats per bar, bottom number = beat value', 'Obere Zahl = Schläge pro Takt, untere Zahl = Notenwert des Schlags', 'Chiffre du haut = temps par mesure, chiffre du bas = valeur du temps'),
        L('2/4 march, 3/4 waltz, 4/4 (C) - the most common', '2/4 Marsch, 3/4 Walzer, 4/4 (C) – der häufigste', '2/4 marche, 3/4 valse, 4/4 (C) – la plus courante'),
        L('Beat 1 is the strongest', 'Die Eins ist am stärksten', 'Le premier temps est le plus fort'),
        summary=True),
    ],
    quiz=[
      ask(L('Which time signature fits this bar?', 'Welche Taktangabe passt zu diesem Takt?', 'Quel chiffrage convient à cette mesure ?'), ['4/4', '3/4', '2/4'], music=abc('c2 c c |]'), count=3),
      ask(L('Which time signature fits this bar?', 'Welche Taktangabe passt zu diesem Takt?', 'Quel chiffrage convient à cette mesure ?'), ['2/4', '3/4', '4/4'], music=abc('c c |]'), count=2),
      ask(L('Which time signature fits this bar?', 'Welche Taktangabe passt zu diesem Takt?', 'Quel chiffrage convient à cette mesure ?'), ['3/4', '2/4', '4/4'], music=abc('c z c |]'), count=3),
      ask(L('Which time signature fits this bar?', 'Welche Taktangabe passt zu diesem Takt?', 'Quel chiffrage convient à cette mesure ?'), ['4/4', '2/4', '3/4'], music=abc('z2 c2 |]'), count=2),
      ask(L('This bar is in 4/4. Which value completes it?', 'Dieser Takt steht im 4/4-Takt. Welcher Wert fehlt?', 'Cette mesure est à 4/4. Quelle valeur la complète ?'), [HALF, QUARTER, WHOLE], music=abc('c c |]', meter='4/4'), count=2),
      ask(L('This bar is in 3/4. Which value completes it?', 'Dieser Takt steht im 3/4-Takt. Welcher Wert fehlt?', 'Cette mesure est à 3/4. Quelle valeur la complète ?'), [QUARTER, HALF, WHOLE], music=abc('c2 |]', meter='3/4'), count=1),
      ask(L('How many bars does this melody have?', 'Wie viele Takte hat diese Melodie?', 'Combien de mesures compte cette mélodie ?'), ['4', '3', '8', '16'], music=abc(TWINKLE, meter='4/4'), count=10),
      ask(L('Which bar does NOT fit 3/4?', 'Welcher Takt passt NICHT in den 3/4-Takt?', 'Quelle mesure ne convient PAS à 3/4 ?'),
          [L('Bar 2', 'Takt 2', 'La mesure 2'), L('Bar 1', 'Takt 1', 'La mesure 1'), L('Bar 3', 'Takt 3', 'La mesure 3')], music=abc('"^1"c c c | "^2"c2 c2 | "^3"c2 c |]', meter='3/4'), count=8),
    ], minutes=12),
)

W7 = week(7, L('Eighth Notes', 'Achtelnoten', 'Les croches'),
  lesson(L('Eighth notes and how to count them', 'Achtelnoten und wie man sie zählt', 'Les croches et comment les compter'),
    L('Split a beat in two and you get eighth notes - with a flag, or joined by a beam. Count them "1-and, 2-and".',
      'Teilt man einen Schlag in zwei, entstehen Achtelnoten – mit Fähnchen oder durch einen Balken verbunden. Man zählt „1 und 2 und“.',
      "Coupe un temps en deux et tu obtiens des croches – avec un crochet, ou reliées par une barre. On les compte « 1 et 2 et »."),
    [
      staff(L('One eighth, two eighths', 'Eine Achtel, zwei Achtel', 'Une croche, deux croches'), abc('c/ z/ c/c/ c/c/ c/c/ c2 |]', lyrics=lyr('1', '2', '+', '3', '+', '4', '+', '1~2')),
        points=[L('An eighth note (quaver) lasts half a beat - it has a flag', 'Eine Achtelnote dauert einen halben Schlag – sie hat ein Fähnchen', 'Une croche dure un demi-temps – elle a un crochet'),
                L('Two or more eighths are joined by a beam', 'Zwei oder mehr Achtel werden durch einen Balken verbunden', 'Deux croches ou plus sont reliées par une barre'),
                L('2 eighth notes = 1 quarter note', '2 Achtelnoten = 1 Viertelnote', '2 croches = 1 noire')]),
      bullets(L('Counting eighths', 'Achtel zählen', 'Compter les croches'),
        L('Say the beat numbers on the beat, and "and" in between: 1 + 2 + 3 + 4 +', 'Sag die Zahlen auf dem Schlag und „und“ dazwischen: 1 + 2 + 3 + 4 +', 'Dis les chiffres sur le temps et « et » entre deux : 1 et 2 et 3 et 4 et'),
        L('Tap your foot on the numbers - the "and" falls when your foot comes up', 'Der Fuß tippt auf die Zahlen – das „und“ fällt, wenn der Fuß nach oben geht', 'Le pied tape sur les chiffres – le « et » tombe quand le pied remonte'),
        L('Beams usually group eighths by the beat, so you can see each beat', 'Balken fassen Achtel meist nach Schlägen zusammen – so sieht man jeden Schlag', 'Les barres regroupent les croches par temps : on voit chaque temps'),
        L('In German the "+" is spoken "und", in French "et"', 'Das „+“ wird „und“ gesprochen', 'Le « + » se dit « et »')),
      staff(L('Frère Jacques', 'Bruder Jakob', 'Frère Jacques'), abc('C D E C | C D E C | E F G2 | E F G2 | G/A/G/F/ E C | G/A/G/F/ E C | C G, C2 | C G, C2 |]', meter='4/4'),
        text=L('A round known in many languages. Bars 5 and 6 begin with four eighth notes: count "1 + 2 +".',
               'Ein Kanon, den man in vielen Sprachen singt. Die Takte 5 und 6 beginnen mit vier Achteln: zähle „1 + 2 +“.',
               'Un canon chanté dans de nombreuses langues. Les mesures 5 et 6 commencent par quatre croches : compte « 1 et 2 et ».')),
    ],
    quiz=[
      ask(L('How many eighth notes equal one quarter note?', 'Wie viele Achtelnoten ergeben eine Viertelnote?', 'Combien de croches valent une noire ?'), ['2', '4', '3', '1']),
      ask(L('How many eighth notes fit into a whole note?', 'Wie viele Achtelnoten passen in eine ganze Note?', 'Combien de croches dans une ronde ?'), ['8', '4', '6', '16']),
      ask(L('Which note value is this?', 'Welcher Notenwert ist das?', 'Quelle est cette figure de note ?'), [EIGHTH, QUARTER, HALF], music=abc('c/'), count=1),
      beats_question('c/c/ c/c/ c c', 4, [6, 3, 2]),
    ]),
  lesson(L('Eighth rests and rhythm patterns', 'Achtelpausen und Rhythmusmuster', 'Le demi-soupir et les formules rythmiques'),
    L('Meet the eighth rest and the rhythm patterns you will find in every piece - read them in a Bach minuet.',
      'Lerne die Achtelpause kennen und die Rhythmusmuster, die in jedem Stück vorkommen – gelesen in einem Menuett von Bach.',
      "Découvre le demi-soupir et les formules rythmiques présentes dans chaque morceau – à lire dans un menuet de Bach."),
    [
      staff(L('The eighth rest', 'Die Achtelpause', 'Le demi-soupir'), abc('z/c/ z/c/ | c/z/ c |]', meter='2/4'),
        text=L('The eighth rest looks like a small 7 with a dot. It lasts half a beat - often the music starts "on the and".',
               'Die Achtelpause sieht aus wie eine kleine 7 mit Punkt. Sie dauert einen halben Schlag – oft beginnt die Musik dann „auf und“.',
               'Le demi-soupir ressemble à un petit 7 avec un point. Il dure un demi-temps – souvent, la musique commence alors « sur le et ».')),
      staff(L('Common patterns', 'Häufige Muster', 'Formules courantes'), abc('c c | c/c/ c | c c/c/ | c/c/ c/c/ | c2 |]', meter='2/4', lyrics=lyr('1', '2', '1', '+', '2', '1', '2', '+', '1', '+', '2', '+', '1')),
        text=L('Clap each bar while counting "1 + 2 +".', 'Klatsche jeden Takt und zähle „1 + 2 +“.', 'Frappe chaque mesure en comptant « 1 et 2 et ».')),
      staff(L('Rhythm in a minuet', 'Rhythmus in einem Menuett', 'Le rythme dans un menuet'), abc(MINUET, meter='3/4', unit='1/8', key='G'),
        text=L("Bach's Minuet in G mixes quarter notes and groups of four eighths. Count \"1 2+ 3+\" in the first bar.",
               'Bachs Menuett in G mischt Viertel und Gruppen von vier Achteln. Zähle im ersten Takt „1 2+ 3+“.',
               'Le Menuet en sol de Bach mêle noires et groupes de quatre croches. Compte « 1 2 et 3 et » dans la première mesure.')),
    ],
    quiz=[
      ask(L('Which rest is this?', 'Welche Pause ist das?', 'Quel est ce silence ?'), [EIGHTH_REST, QUARTER_REST, HALF_REST], music=abc('z/'), count=1),
      beats_question('c/c/ c/c/ c/c/', 3, [6, 4, 2]),
      beats_question('c z/c/ c2', 4, [5, 3, 6]),
      ask(L('How many eighth notes are in this bar?', 'Wie viele Achtelnoten hat dieser Takt?', 'Combien de croches dans cette mesure ?'), ['4', '5', '3', '6'], music=abc('d2 GABc |]', meter='3/4', unit='1/8', key='G'), count=5),
    ],
    library=[(MINUET_G, L('Minuet in G: clap the rhythm of the first eight bars while counting "1 2+ 3+".', 'Menuett in G: Klatsche den Rhythmus der ersten acht Takte und zähle „1 2+ 3+“.', 'Menuet en sol : frappe le rythme des huit premières mesures en comptant « 1 2 et 3 et ».')),
             (MOZART_KV2, L('Mozart wrote this minuet at the age of six. It is in 3/4 too - find the eighth notes.', 'Mozart schrieb dieses Menuett mit sechs Jahren. Es steht auch im 3/4-Takt – finde die Achtelnoten.', 'Mozart a écrit ce menuet à six ans. Il est aussi à 3/4 – trouve les croches.'))]),
  lesson(L('Practice: rhythm reading', 'Übung: Rhythmen lesen', 'Entraînement : lecture rythmique'),
    L('Count the beats, find the time signature, spot the missing note value - a practice quiz with eighths, quarters, halves and rests.',
      'Zähle die Schläge, finde die Taktart, ergänze den fehlenden Notenwert – ein Übungsquiz mit Achteln, Vierteln, Halben und Pausen.',
      "Compte les temps, trouve le chiffrage, complète la valeur manquante – un quiz d'entraînement avec croches, noires, blanches et silences."),
    [
      bullets(L('Week 7 in a nutshell', 'Woche 7 kurz gefasst', 'La semaine 7 en bref'),
        L('An eighth note lasts half a beat; two make a quarter', 'Eine Achtelnote dauert einen halben Schlag; zwei ergeben eine Viertel', 'Une croche dure un demi-temps ; deux font une noire'),
        L('Flags for single eighths, beams for groups', 'Fähnchen für einzelne Achtel, Balken für Gruppen', 'Crochet pour une croche seule, barre pour un groupe'),
        L('Count "1 + 2 +"; the foot comes up on the "+"', 'Zähle „1 + 2 +“; beim „+“ geht der Fuß hoch', 'Compte « 1 et 2 et » ; le pied remonte sur le « et »'),
        L('Eighth rest: a little 7 - half a beat of silence', 'Achtelpause: eine kleine 7 – ein halber Schlag Stille', 'Demi-soupir : un petit 7 – un demi-temps de silence'),
        summary=True),
    ],
    quiz=[
      beats_question('c/c/ c c2', 4, [5, 3, 6]),
      beats_question('c/c/c/c/ c', 3, [5, 4, 2]),
      beats_question('z/c/ c/c/', 2, [3, 4, 1]),
      beats_question('c2 c/c/ c/c/', 4, [6, 3, 5]),
      beats_question('c/ z/ z c2', 4, [3, 5, 2]),
      ask(L('This bar is in 2/4. Which value completes it?', 'Dieser Takt steht im 2/4-Takt. Welcher Wert fehlt?', 'Cette mesure est à 2/4. Quelle valeur la complète ?'), [EIGHTH, QUARTER, HALF], music=abc('c c/ |]', meter='2/4'), count=2),
      ask(L('Which time signature fits this bar?', 'Welche Taktangabe passt zu diesem Takt?', 'Quel chiffrage convient à cette mesure ?'), ['3/4', '2/4', '4/4'], music=abc('c/c/ c/c/ c/c/ |]'), count=6),
      ask(L('How many quarter-note beats are in a bar of six eighth notes?', 'Wie viele Viertelschläge haben sechs Achtelnoten?', 'Combien de temps de noire font six croches ?'), ['3', '6', '2', '4']),
    ], minutes=12),
)

W8 = week(8, L('Review and Mid-Course Test', 'Wiederholung und Zwischentest', 'Révision et test de mi-parcours'),
  lesson(L('Putting pitch and rhythm together', 'Tonhöhe und Rhythmus zusammen', 'Hauteur et rythme ensemble'),
    L('Real reading means doing two things at once: naming the notes and counting their length. Practise on three well-known melodies.',
      'Richtiges Lesen heißt, zwei Dinge gleichzeitig zu tun: die Noten benennen und ihre Dauer zählen. Übe an drei bekannten Melodien.',
      "Lire vraiment, c'est faire deux choses à la fois : nommer les notes et compter leur durée. Entraîne-toi sur trois mélodies connues."),
    [
      bullets(L('How to read a new melody', 'So liest du eine neue Melodie', 'Comment lire une nouvelle mélodie'),
        L('1. Look at the clef and the time signature', '1. Schau auf Schlüssel und Taktangabe', '1. Regarde la clé et le chiffrage'),
        L('2. Clap the rhythm while counting', '2. Klatsche den Rhythmus und zähle dabei', '2. Frappe le rythme en comptant'),
        L('3. Name the notes in rhythm, slowly', '3. Sprich die Notennamen im Rhythmus, langsam', '3. Dis le nom des notes en rythme, lentement'),
        L('4. Sing or play it - and only then speed up', '4. Sing oder spiel es – erst dann schneller', '4. Chante-la ou joue-la – et seulement ensuite accélère')),
      staff(L('Au clair de la lune', 'Au clair de la lune', 'Au clair de la lune'), abc(CLAIR, meter='4/4'),
        text=L('A French folk song. Clap, then name the notes in rhythm.', 'Ein französisches Volkslied. Klatschen, dann die Noten im Rhythmus benennen.', 'Une chanson populaire française. Frappe le rythme, puis dis les notes en rythme.')),
      staff(L('Ode to Joy', 'Ode an die Freude', "L'Hymne à la joie"), abc(ODE_FULL, meter='4/4'),
        text=L('Bar 4 has a dotted rhythm - you will learn it in week 11. For now, hold the first note a little longer.',
               'Takt 4 hat einen punktierten Rhythmus – den lernst du in Woche 11. Halte die erste Note vorerst einfach etwas länger.',
               'La mesure 4 contient un rythme pointé – tu le verras en semaine 11. Pour l’instant, tiens simplement la première note un peu plus longtemps.')),
    ],
    quiz=[
      ask(L('Which note is the highest in this melody?', 'Welcher Ton ist der höchste dieser Melodie?', 'Quelle est la note la plus aiguë de cette mélodie ?'), ['{n:E4}', '{n:D4}', '{n:C4}', '{n:G4}'], music=abc(CLAIR, meter='4/4'), count=10),
      ask(L('How many beats does the last note of this melody last?', 'Wie viele Schläge dauert der letzte Ton dieser Melodie?', 'Combien de temps dure la dernière note de cette mélodie ?'), ['4', '2', '1', '3'], music=abc(CLAIR, meter='4/4'), count=10),
      ask(L('Which time signature does this melody use?', 'Welche Taktart hat diese Melodie?', 'Quelle est la mesure de cette mélodie ?'), ['4/4', '3/4', '2/4'], music=abc(FRERE, meter='4/4'), count=12),
    ]),
  lesson(L('Mid-course test', 'Zwischentest', 'Test de mi-parcours'),
    L('Two months done! This test covers everything so far: the staff, note names, the treble clef, ledger lines, note values, rests and time signatures.',
      'Zwei Monate geschafft! Dieser Test umfasst alles bisher: Notensystem, Notennamen, Violinschlüssel, Hilfslinien, Notenwerte, Pausen und Taktarten.',
      "Deux mois déjà ! Ce test couvre tout ce que tu as vu : portée, nom des notes, clé de sol, lignes supplémentaires, figures de notes, silences et mesures."),
    [
      bullets(L('Before you start', 'Bevor du beginnst', 'Avant de commencer'),
        L('14 questions - take your time', '14 Fragen – lass dir Zeit', '14 questions – prends ton temps'),
        L('Say the notes out loud; count the beats with your foot', 'Sprich die Noten laut; zähle die Schläge mit dem Fuß', 'Dis les notes à voix haute ; compte les temps avec le pied'),
        L('You can repeat the test as often as you like', 'Du kannst den Test beliebig oft wiederholen', 'Tu peux refaire le test autant de fois que tu veux')),
    ],
    quiz=[q_note('G4'), q_note('E5'), q_note('C4'), q_note('B4'), q_note('A5'), q_note('D4'),
          beats_question('c2 c c', 4, [3, 5, 2]),
          beats_question('c/c/ c z', 3, [4, 2, 5]),
          ask(L('Which rest is this?', 'Welche Pause ist das?', 'Quel est ce silence ?'), [HALF_REST, WHOLE_REST, QUARTER_REST, EIGHTH_REST], music=abc('z2'), count=1),
          ask(L('Which note value is this?', 'Welcher Notenwert ist das?', 'Quelle est cette figure de note ?'), [WHOLE, HALF, QUARTER, EIGHTH], music=abc('c4'), count=1),
          ask(L('Which time signature fits this bar?', 'Welche Taktangabe passt zu diesem Takt?', 'Quel chiffrage convient à cette mesure ?'), ['3/4', '4/4', '2/4'], music=abc('c/c/ c c |]'), count=4),
          q_next('B4', 'C5', ['A4', 'D5', 'G4']),
          ask(L('Which note is an octave above {n:D4}?', 'Welcher Ton liegt eine Oktave über {n:D4}?', 'Quelle note est une octave au-dessus de {n:D4} ?'), ['{n:D5}', '{n:C5}', '{n:E5}', '{n:A4}']),
          ask(L('How many quarter notes equal a whole note?', 'Wie viele Viertelnoten ergeben eine ganze Note?', 'Combien de noires valent une ronde ?'), ['4', '2', '8', '3'])],
    minutes=15, xp=25),
  lesson(L('Reading assignment: Schumann and Bach', 'Leseaufgabe: Schumann und Bach', 'Lecture : Schumann et Bach'),
    L("Open two real scores from the Library and read them with what you know: the clef, the time signature, the first notes and rhythms.",
      'Öffne zwei echte Partituren aus der Bibliothek und lies sie mit deinem Wissen: Schlüssel, Taktart, erste Noten und Rhythmen.',
      "Ouvre deux vraies partitions de la Bibliothèque et lis-les avec ce que tu sais : clé, mesure, premières notes et rythmes."),
    [
      bullets(L('Your reading checklist', 'Deine Lese-Checkliste', 'Ta liste de lecture'),
        L('Which clef? Which time signature?', 'Welcher Schlüssel? Welche Taktart?', 'Quelle clé ? Quelle mesure ?'),
        L('How many bars in the first line?', 'Wie viele Takte hat die erste Zeile?', 'Combien de mesures sur la première ligne ?'),
        L('Name the first five notes of the right hand', 'Benenne die ersten fünf Noten der rechten Hand', 'Nomme les cinq premières notes de la main droite'),
        L('Clap the rhythm of the first two bars', 'Klatsche den Rhythmus der ersten zwei Takte', 'Frappe le rythme des deux premières mesures'),
        L('Look for signs you do not know yet - we will meet them soon', 'Suche Zeichen, die du noch nicht kennst – wir lernen sie bald', 'Repère les signes que tu ne connais pas encore – nous les verrons bientôt')),
      staff(L('Warm-up melody', 'Aufwärm-Melodie', "Mélodie d'échauffement"), abc('e2 dc | B2 A2 | G2 AB | c4 |]', meter='4/4'),
        text=L('A simple exercise in the style of the Album for the Young: name the notes, then compare with the real score in the Library.',
               'Eine einfache Übung im Stil des Albums für die Jugend: Benenne die Noten und vergleiche dann mit den echten Noten in der Bibliothek.',
               "Un exercice simple dans le style de l'Album pour la jeunesse : nomme les notes, puis compare avec la vraie partition de la Bibliothèque.")),
    ],
    quiz=[
      ask(L('Which note is the lowest in this exercise?', 'Welcher Ton ist der tiefste in dieser Übung?', 'Quelle est la note la plus grave de cet exercice ?'), ['{n:G4}', '{n:A4}', '{n:B4}', '{n:C5}'], music=abc('e2 dc | B2 A2 | G2 AB | c4 |]', meter='4/4'), count=10),
      ask(L('How many half notes are in this exercise?', 'Wie viele halbe Noten enthält diese Übung?', 'Combien de blanches dans cet exercice ?'), ['4', '3', '5', '2'], music=abc('e2 dc | B2 A2 | G2 AB | c4 |]', meter='4/4'), count=10),
    ],
    library=[(MELODIE, L('Schumann, "Melody" from the Album for the Young: work through the reading checklist for the right hand.', 'Schumann, „Melodie“ aus dem Album für die Jugend: Geh die Lese-Checkliste für die rechte Hand durch.', "Schumann, « Mélodie » de l'Album pour la jeunesse : suis la liste de lecture pour la main droite.")),
             (MUSETTE, L("Bach's Musette from the Notebook for Anna Magdalena: which time signature? Which note repeats in the left hand?", 'Bachs Musette aus dem Notenbüchlein für Anna Magdalena: Welche Taktart? Welcher Ton wiederholt sich in der linken Hand?', "La Musette du Petit livre d'Anna Magdalena : quelle mesure ? Quelle note se répète à la main gauche ?"))],
    minutes=20),
)

# --- Month 3 ------------------------------------------------------------------

BASS_LINES = ['G2', 'B2', 'D3', 'F3', 'A3']
BASS_SPACES = ['A2', 'C3', 'E3', 'G3']


def q_bass(pitch):
    return q_note(pitch, clef='bass')


W9 = week(9, L('The Bass Clef', 'Der Bassschlüssel', 'La clé de fa'),
  lesson(L('The bass clef (F clef)', 'Der Bassschlüssel (F-Schlüssel)', 'La clé de fa'),
    L('Low instruments and the pianist\'s left hand read the bass clef. Its two dots frame the line of F - the second landmark of music reading.',
      'Tiefe Instrumente und die linke Hand am Klavier lesen im Bassschlüssel. Seine zwei Punkte umrahmen die Linie des F – den zweiten Orientierungspunkt beim Notenlesen.',
      "Les instruments graves et la main gauche du piano lisent en clé de fa. Ses deux points encadrent la ligne du fa – le second repère de la lecture musicale."),
    [
      staff(L('The bass clef', 'Der Bassschlüssel', 'La clé de fa'), abc('x8', clef='bass'),
        text=L('The bass clef grew out of a letter F. It starts on line 4 and its two dots sit above and below that line: every note on line 4 is {n:F3}.',
               'Der Bassschlüssel entstand aus einem F. Er beginnt auf der 4. Linie, und seine zwei Punkte stehen über und unter ihr: Jede Note auf der 4. Linie ist ein {n:F3}.',
               'La clé de fa est née d’une lettre F. Elle part de la 4e ligne et ses deux points l’encadrent : toute note sur la 4e ligne est un {n:F3}.')),
      staff(L('Counting from {n:F3}', 'Vom {n:F3} aus zählen', 'Compter à partir du {n:F3}'), lambda lang: notes(['F3', 'G3', 'A3', 'B3', 'C4', 'B3', 'A3', 'G3', 'F3', 'E3', 'D3', 'C3'], lang, clef='bass')),
      bullets(L('Who reads the bass clef?', 'Wer liest im Bassschlüssel?', 'Qui lit en clé de fa ?'),
        L('Cello, double bass, bassoon, trombone, tuba', 'Violoncello, Kontrabass, Fagott, Posaune, Tuba', 'Violoncelle, contrebasse, basson, trombone, tuba'),
        L('Tenor and bass voices in choir music', 'Tenor- und Bassstimmen im Chor', 'Les voix de ténor et de basse dans le chœur'),
        L('The left hand of the piano', 'Die linke Hand am Klavier', 'La main gauche du piano'),
        L('In French the bass clef is the "clé de fa"; in German "Bassschlüssel" or F-Schlüssel', 'Im Französischen heißt er „clé de fa“, im Englischen „bass clef“', 'En allemand : « Bassschlüssel » ; en anglais : « bass clef »')),
      staff(L('Middle C from both sides', 'Das mittlere C von beiden Seiten', 'Le do central des deux côtés'), lambda lang: notes(['A3', 'B3', 'C4', 'C4', 'D4', 'E4'], lang, clef='bass', duration='2'),
        text=L('In the bass clef middle C sits on one ledger line above the staff - the mirror image of the treble clef.',
               'Im Bassschlüssel steht das mittlere C auf einer Hilfslinie über dem System – das Spiegelbild zum Violinschlüssel.',
               'En clé de fa, le do central est sur une ligne supplémentaire au-dessus de la portée – l’image miroir de la clé de sol.')),
    ],
    quiz=[
      ask(L('Which line does the bass clef mark?', 'Welche Linie bezeichnet der Bassschlüssel?', 'Quelle ligne la clé de fa désigne-t-elle ?'),
          [L('Line 4', 'Die 4. Linie', 'La 4e ligne'), L('Line 2', 'Die 2. Linie', 'La 2e ligne'), L('Line 3', 'Die 3. Linie', 'La 3e ligne'), L('Line 5', 'Die 5. Linie', 'La 5e ligne')]),
      ask(L('Which note sits on that line?', 'Welcher Ton steht auf dieser Linie?', 'Quelle note se trouve sur cette ligne ?'), ['{n:F3}', '{n:G3}', '{n:C4}', '{n:D3}']),
      q_bass('F3'), q_bass('C4'), q_bass('G3'),
    ]),
  lesson(L('Lines and spaces in the bass clef', 'Linien und Zwischenräume im Bassschlüssel', 'Lignes et interlignes en clé de fa'),
    L('The same staff, different names: learn the bass-clef lines and spaces and the grand staff that joins both clefs.',
      'Dasselbe System, andere Namen: Lerne die Linien und Zwischenräume des Bassschlüssels und das Klaviersystem, das beide Schlüssel verbindet.',
      "La même portée, d'autres noms : apprends les lignes et interlignes de la clé de fa et la double portée qui réunit les deux clés."),
    [
      staff(L('The five lines', 'Die fünf Linien', 'Les cinq lignes'), lambda lang: notes(BASS_LINES, lang, clef='bass', duration='2'),
        text=L('Bottom to top: {n:G2} {n:B2} {n:D3} {n:F3} {n:A3} - "Good Boys Do Fine Always".', 'Von unten nach oben: {n:G2} {n:B2} {n:D3} {n:F3} {n:A3}.', 'De bas en haut : {n:G2} {n:B2} {n:D3} {n:F3} {n:A3}.')),
      staff(L('The four spaces', 'Die vier Zwischenräume', 'Les quatre interlignes'), lambda lang: notes(BASS_SPACES, lang, clef='bass', duration='2'),
        text=L('Bottom to top: {n:A2} {n:C3} {n:E3} {n:G3} - "All Cows Eat Grass".', 'Von unten nach oben: {n:A2} {n:C3} {n:E3} {n:G3}.', 'De bas en haut : {n:A2} {n:C3} {n:E3} {n:G3}.')),
      staff(L('The grand staff', 'Das Klaviersystem', 'La double portée (le grand système)'),
        'X:1\n%%staves {RH LH}\nM:none\nL:1/4\nK:C\nV:RH clef=treble\nV:LH clef=bass\n[V:RH] x2 x2 x2 x2 x2 D2 E2 F2 G2 |]\n[V:LH] F,2 G,2 A,2 B,2 C2 x2 x2 x2 x2 |]\n',
        text=L('Piano music joins both clefs with a brace. Middle C lies exactly between them: one ledger line below the treble, one above the bass.',
               'Klaviermusik verbindet beide Schlüssel mit einer Klammer. Das mittlere C liegt genau dazwischen: eine Hilfslinie unter dem Violin-, eine über dem Bassschlüssel.',
               'La musique de piano réunit les deux clés par une accolade. Le do central est exactement entre les deux : une ligne sous la clé de sol, une au-dessus de la clé de fa.')),
    ],
    quiz=[q_bass('G2'), q_bass('D3'), q_bass('A3'), q_bass('C3'), q_bass('E3')]),
  lesson(L('Practice: reading in the bass clef', 'Übung: Lesen im Bassschlüssel', 'Entraînement : lire en clé de fa'),
    L('Name bass-clef notes until they feel as familiar as the treble clef. Landmarks: {n:F3} on line 4, {n:D3} on the middle line, middle C above the staff.',
      'Benenne Noten im Bassschlüssel, bis sie dir so vertraut sind wie der Violinschlüssel. Orientierung: {n:F3} auf der 4. Linie, {n:D3} auf der Mittellinie, das mittlere C über dem System.',
      "Nomme des notes en clé de fa jusqu'à ce qu'elles te soient aussi familières que la clé de sol. Repères : {n:F3} sur la 4e ligne, {n:D3} sur la ligne du milieu, le do central au-dessus de la portée."),
    [
      staff(L('A bass line to read', 'Eine Basslinie zum Lesen', 'Une ligne de basse à lire'), abc('C, E, G, C | F, A, C F | G, B, D G | C4 |]', clef='bass', meter='4/4'),
        text=L('Name every note, then check: the line moves in skips (a broken chord in each bar).', 'Benenne jede Note und kontrolliere: Die Linie bewegt sich in Sprüngen (ein gebrochener Akkord pro Takt).', 'Nomme chaque note, puis vérifie : la ligne avance par sauts (un accord brisé par mesure).')),
      bullets(L('Week 9 in a nutshell', 'Woche 9 kurz gefasst', 'La semaine 9 en bref'),
        L('The bass clef marks {n:F3} on line 4', 'Der Bassschlüssel bezeichnet {n:F3} auf der 4. Linie', 'La clé de fa désigne {n:F3} sur la 4e ligne'),
        L('Lines: {n:G2} {n:B2} {n:D3} {n:F3} {n:A3}', 'Linien: {n:G2} {n:B2} {n:D3} {n:F3} {n:A3}', 'Lignes : {n:G2} {n:B2} {n:D3} {n:F3} {n:A3}'),
        L('Spaces: {n:A2} {n:C3} {n:E3} {n:G3}', 'Zwischenräume: {n:A2} {n:C3} {n:E3} {n:G3}', 'Interlignes : {n:A2} {n:C3} {n:E3} {n:G3}'),
        L('Middle C: one ledger line above the bass staff', 'Mittleres C: eine Hilfslinie über dem Bass-System', 'Do central : une ligne supplémentaire au-dessus de la portée en clé de fa'),
        summary=True),
    ],
    quiz=[q_bass('F3'), q_bass('B2'), q_bass('G3'), q_bass('A2'), q_bass('D3'), q_bass('C4'), q_bass('E2'), q_bass('B3'),
          ask(L('Which clef does the left hand of the piano usually read?', 'Welchen Schlüssel liest die linke Hand am Klavier meistens?', 'Quelle clé lit généralement la main gauche du piano ?'),
              [L('Bass clef', 'Bassschlüssel', 'La clé de fa'), L('Treble clef', 'Violinschlüssel', 'La clé de sol'), L('Neither', 'Keinen', 'Aucune')])],
    library=[(CHORALE, L("Schumann's \"Chorale\" (Album for the Young No. 4): name the first four notes of the left hand in the bass clef.", 'Schumanns „Choral“ (Album für die Jugend Nr. 4): Benenne die ersten vier Noten der linken Hand im Bassschlüssel.', "Le « Choral » de Schumann (Album pour la jeunesse n° 4) : nomme les quatre premières notes de la main gauche en clé de fa."))],
    minutes=12),
)

SHARP = L('sharp ♯', 'Kreuz ♯', 'dièse ♯')
FLAT = L('flat ♭', 'b ♭ (Be)', 'bémol ♭')
NATURAL = L('natural ♮', 'Auflösungszeichen ♮', 'bécarre ♮')

W10 = week(10, L('Semitones, Sharps and Flats', 'Halbtöne, Kreuz und b', 'Demi-tons, dièses et bémols'),
  lesson(L('Semitones and whole tones', 'Halbtöne und Ganztöne', 'Demi-tons et tons'),
    L('Between most white keys there is a black key - but not everywhere. Discover the semitone, the smallest step in Western music, and the whole tone.',
      'Zwischen den meisten weißen Tasten liegt eine schwarze – aber nicht überall. Entdecke den Halbton, den kleinsten Schritt der westlichen Musik, und den Ganzton.',
      "Entre la plupart des touches blanches, il y a une touche noire – mais pas partout. Découvre le demi-ton, le plus petit intervalle de la musique occidentale, et le ton."),
    [
      keyboard(L('Semitones', 'Halbtöne', 'Demi-tons'), octaves=1, key_width=110, labels={'E4': '{n:E4}', 'F4': '{n:F4}', 'B4': '{n:B4}', 'C4': '{n:C4}', 'C#4': '½', 'D4': '{n:D4}'},
        highlight=['E4', 'F4', 'B4'], text=L(
          'A semitone (half step) is the distance to the very next key, black or white. {n:E4}–{n:F4} and {n:B4}–{n:C5} are semitones between two white keys.',
          'Ein Halbton ist der Abstand zur direkt benachbarten Taste, schwarz oder weiß. {n:E4}–{n:F4} und {n:B4}–{n:C5} sind Halbtöne zwischen zwei weißen Tasten.',
          'Un demi-ton est la distance jusqu’à la touche voisine, noire ou blanche. {n:E4}–{n:F4} et {n:B4}–{n:C5} sont des demi-tons entre deux touches blanches.')),
      bullets(L('Whole tone = two semitones', 'Ganzton = zwei Halbtöne', 'Un ton = deux demi-tons'),
        L('{n:C4}–{n:D4} is a whole tone: a black key lies between them', '{n:C4}–{n:D4} ist ein Ganzton: Eine schwarze Taste liegt dazwischen', '{n:C4}–{n:D4} est un ton : une touche noire se trouve entre les deux'),
        L('{n:E4}–{n:F4} and {n:B4}–{n:C5} are only semitones - no black key between', '{n:E4}–{n:F4} und {n:B4}–{n:C5} sind nur Halbtöne – keine schwarze Taste dazwischen', '{n:E4}–{n:F4} et {n:B4}–{n:C5} ne sont que des demi-tons – pas de touche noire entre eux'),
        L('All other neighbouring white keys are a whole tone apart', 'Alle anderen benachbarten weißen Tasten liegen einen Ganzton auseinander', 'Toutes les autres touches blanches voisines sont à un ton'),
        L('An octave has 12 semitones', 'Eine Oktave hat 12 Halbtöne', 'Une octave compte 12 demi-tons')),
      staff(L('Steps on the staff', 'Schritte im Notensystem', 'Les degrés sur la portée'), lambda lang: notes(['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'], lang),
        text=L('On the staff every step looks the same - but {n:E4}–{n:F4} and {n:B4}–{n:C5} are smaller (semitones).',
               'Im Notensystem sieht jeder Schritt gleich aus – doch {n:E4}–{n:F4} und {n:B4}–{n:C5} sind kleiner (Halbtöne).',
               'Sur la portée, tous les degrés se ressemblent – mais {n:E4}–{n:F4} et {n:B4}–{n:C5} sont plus petits (demi-tons).')),
    ],
    quiz=[
      ask(L('Which pair of white keys is a semitone apart?', 'Welches Paar weißer Tasten liegt einen Halbton auseinander?', 'Quelle paire de touches blanches est à un demi-ton ?'), ['{n:E4} – {n:F4}', '{n:C4} – {n:D4}', '{n:F4} – {n:G4}', '{n:A4} – {n:B4}']),
      ask(L('Which other pair is also a semitone?', 'Welches andere Paar ist ebenfalls ein Halbton?', 'Quelle autre paire est aussi à un demi-ton ?'), ['{n:B4} – {n:C5}', '{n:G4} – {n:A4}', '{n:D4} – {n:E4}', '{n:C4} – {n:D4}']),
      ask(L('How many semitones make a whole tone?', 'Wie viele Halbtöne ergeben einen Ganzton?', 'Combien de demi-tons font un ton ?'), ['2', '1', '3', '4']),
      ask(L('How many semitones are in an octave?', 'Wie viele Halbtöne hat eine Oktave?', 'Combien de demi-tons dans une octave ?'), ['12', '8', '7', '10']),
    ]),
  lesson(L('Sharps, flats and naturals', 'Kreuz, b und Auflösungszeichen', 'Dièses, bémols et bécarres'),
    L('Three signs raise or lower a note by a semitone. Their names are a classic trap between languages - especially the German B and H.',
      'Drei Zeichen erhöhen oder erniedrigen einen Ton um einen Halbton. Ihre Namen sind eine klassische Sprachfalle – besonders das deutsche B und H.',
      "Trois signes haussent ou baissent une note d'un demi-ton. Leurs noms sont un piège classique entre les langues – surtout le B et le H allemands."),
    [
      staff(L('The three accidentals', 'Die drei Versetzungszeichen', 'Les trois altérations'), abc('^F2 _B2 =B2', lyrics=lyr(SHARP, FLAT, NATURAL)),
        points=[L('Sharp ♯: raises the note a semitone', 'Kreuz ♯: erhöht den Ton um einen Halbton', 'Dièse ♯ : hausse la note d’un demi-ton'),
                L('Flat ♭: lowers the note a semitone', 'b ♭: erniedrigt den Ton um einen Halbton', 'Bémol ♭ : baisse la note d’un demi-ton'),
                L('Natural ♮: cancels a sharp or flat', 'Auflösungszeichen ♮: hebt Kreuz oder b auf', 'Bécarre ♮ : annule un dièse ou un bémol')]),
      bullets(L('Naming altered notes', 'Veränderte Töne benennen', 'Nommer les notes altérées'),
        L('English adds a word: F sharp ({n:F#4}), B flat ({n:Bb4})', 'Mit Kreuz hängt man -is an: F → Fis, C → Cis, G → Gis', 'Le français ajoute un mot : fa dièse ({n:F#4}), si bémol ({n:Bb4})'),
        L('German adds -is for sharp: Fis, Cis - and -es for flat: Des, Ges', 'Mit b hängt man -es an: D → Des, G → Ges; bei Vokalen nur -s: E → Es, A → As', "L'allemand ajoute -is pour le dièse (Fis, Cis) et -es pour le bémol (Des, Ges)"),
        L('German exceptions: E flat = Es, A flat = As - and B flat is simply "B"!', 'Ausnahme: H mit b heißt nicht „Hes“, sondern B. Darum heißt der siebte Stammton H', "Exceptions allemandes : mi bémol = Es, la bémol = As – et si bémol se dit simplement « B » !"),
        L('So a German "B" is your B flat, and a German "H" is your B', 'Im Englischen heißt H „B“ – und unser B „B flat“: Vorsicht bei englischen Noten!', "Donc le « B » allemand est notre si bémol, et le « H » allemand notre si")),
      keyboard(L('Black keys have two names', 'Schwarze Tasten haben zwei Namen', 'Les touches noires ont deux noms'), octaves=1, key_width=110,
        labels={'C#4': '{n:C#4}/{n:Db4}', 'D#4': '{n:D#4}/{n:Eb4}', 'F#4': '{n:F#4}/{n:Gb4}', 'G#4': '{n:G#4}/{n:Ab4}', 'A#4': '{n:A#4}/{n:Bb4}', **white_key_names('C4', 1)},
        text=L('{n:F#4} and {n:Gb4} are the same key - they are "enharmonic". Which name is used depends on the music.',
               '{n:F#4} und {n:Gb4} sind dieselbe Taste – sie sind „enharmonisch“ gleich. Welcher Name gilt, hängt von der Musik ab.',
               '{n:F#4} et {n:Gb4} sont la même touche – on dit qu’ils sont « enharmoniques ». Le nom dépend de la musique.')),
      staff(L('An accidental lasts for the bar', 'Ein Vorzeichen gilt für den Takt', "Une altération vaut pour toute la mesure"), lambda lang: abc('^F G F E | F2 =F2 |]', meter='4/4', lyrics=['{n:F#4}', '{n:G4}', '{n:F#4}', '{n:E4}', '{n:F#4}', '{n:F4}']),
        text=L('A sharp, flat or natural applies to every later note on the same line or space until the bar line.',
               'Ein Kreuz, b oder Auflösungszeichen gilt für alle folgenden Noten auf derselben Linie bzw. im selben Zwischenraum bis zum Taktstrich.',
               "Un dièse, un bémol ou un bécarre s'applique à toutes les notes suivantes sur la même ligne ou le même interligne, jusqu'à la barre de mesure.")),
    ],
    quiz=[
      q_note('F#4', distractors=['F4', 'G#4', 'E4']),
      q_note('Bb4', distractors=['B4', 'A#4', 'Eb4']),
      q_note('Eb5', distractors=['E5', 'D#5', 'Ab4']),
      ask(L('What does a natural sign do?', 'Was bewirkt ein Auflösungszeichen?', 'Que fait un bécarre ?'),
          [L('Cancels a sharp or flat', 'Es hebt Kreuz oder b auf', 'Il annule un dièse ou un bémol'), L('Raises the note a semitone', 'Es erhöht um einen Halbton', 'Il hausse d’un demi-ton'), L('Lowers the note a whole tone', 'Es erniedrigt um einen Ganzton', 'Il baisse d’un ton')]),
      ask(L('Which note is enharmonic with {n:F#4}?', 'Welcher Ton ist enharmonisch gleich mit {n:F#4}?', 'Quelle note est l’enharmonique de {n:F#4} ?'), ['{n:Gb4}', '{n:Fb4}', '{n:G#4}', '{n:Eb4}']),
    ]),
  lesson(L('Practice: accidentals', 'Übung: Versetzungszeichen', 'Entraînement : les altérations'),
    L('Read sharps, flats and naturals on the staff, and in both clefs. Watch out for accidentals that last until the bar line.',
      'Lies Kreuz, b und Auflösungszeichen im Notensystem, in beiden Schlüsseln. Achte auf Vorzeichen, die bis zum Taktstrich gelten.',
      "Lis dièses, bémols et bécarres sur la portée, dans les deux clés. Attention aux altérations qui valent jusqu'à la barre de mesure."),
    [
      bullets(L('Week 10 in a nutshell', 'Woche 10 kurz gefasst', 'La semaine 10 en bref'),
        L('Semitone = next key; whole tone = two semitones', 'Halbton = Nachbartaste; Ganzton = zwei Halbtöne', 'Demi-ton = touche voisine ; ton = deux demi-tons'),
        L('{n:E4}–{n:F4} and {n:B4}–{n:C5} are semitones', '{n:E4}–{n:F4} und {n:B4}–{n:C5} sind Halbtöne', '{n:E4}–{n:F4} et {n:B4}–{n:C5} sont des demi-tons'),
        L('♯ raises, ♭ lowers, ♮ cancels - until the bar line', '♯ erhöht, ♭ erniedrigt, ♮ löst auf – bis zum Taktstrich', '♯ hausse, ♭ baisse, ♮ annule – jusqu’à la barre de mesure'),
        L('German: Fis, Cis, Es, As - and B = B flat, H = B', 'Deutsch: Fis, Cis, Es, As – und B ist das erniedrigte H', 'Allemand : Fis, Cis, Es, As – et B = si bémol, H = si'),
        summary=True),
    ],
    quiz=[
      q_note('C#5', distractors=['C5', 'Db5', 'D#5']),
      q_note('Ab4', distractors=['A4', 'G#4', 'Bb4']),
      q_note('G#4', distractors=['G4', 'Ab4', 'F#4']),
      q_note('Bb2', clef='bass', distractors=['B2', 'Eb3', 'A#2']),
      q_note('F#3', clef='bass', distractors=['F3', 'Gb3', 'C#3']),
      ask(L('What is the third note of this bar?', 'Wie heißt die dritte Note dieses Takts?', 'Quelle est la troisième note de cette mesure ?'), ['{n:C#5}', '{n:C5}', '{n:D5}', '{n:B4}'], music=abc('^c d c B |]', meter='4/4')),
      ask(L('What is the last note of this bar?', 'Wie heißt die letzte Note dieses Takts?', 'Quelle est la dernière note de cette mesure ?'), ['{n:B4}', '{n:Bb4}', '{n:A4}', '{n:B#4}'], music=abc('_B A _B =B |]', meter='4/4')),
      ask(L('Which note lies a semitone above {n:E4}?', 'Welcher Ton liegt einen Halbton über {n:E4}?', 'Quelle note est un demi-ton au-dessus de {n:E4} ?'), ['{n:F4}', '{n:F#4}', '{n:Eb4}', '{n:G4}']),
    ], minutes=12),
)

DOTTED_HALF = L('dotted half note', 'punktierte Halbe', 'blanche pointée')
DOTTED_QUARTER = L('dotted quarter note', 'punktierte Viertel', 'noire pointée')

W11 = week(11, L('Dotted Notes, Ties and Upbeats', 'Punktierte Noten, Haltebögen und Auftakt', 'Notes pointées, liaisons et anacrouse'),
  lesson(L('Dots and ties', 'Punkte und Haltebögen', 'Points et liaisons de prolongation'),
    L('Two ways to make a note longer: a dot adds half its value; a tie joins two notes of the same pitch into one.',
      'Zwei Wege, eine Note zu verlängern: Ein Punkt verlängert sie um die Hälfte ihres Werts; ein Haltebogen verbindet zwei gleich hohe Noten zu einer.',
      "Deux façons d'allonger une note : le point ajoute la moitié de sa valeur ; la liaison de prolongation réunit deux notes de même hauteur en une seule."),
    [
      staff(L('The dot', 'Der Punkt', 'Le point'), abc('c3 c | c3/ c/ c2 |]', meter='4/4', lyrics=lyr('3', '1', '1½', '½', '2')),
        points=[L('Dotted half note: 2 + 1 = 3 beats', 'Punktierte Halbe: 2 + 1 = 3 Schläge', 'Blanche pointée : 2 + 1 = 3 temps'),
                L('Dotted quarter note: 1 + ½ = 1½ beats, usually followed by an eighth', 'Punktierte Viertel: 1 + ½ = 1½ Schläge, meist gefolgt von einer Achtel', 'Noire pointée : 1 + ½ = 1 temps ½, souvent suivie d’une croche')]),
      staff(L('The tie', 'Der Haltebogen', 'La liaison de prolongation'), abc('c2 c2- | c c d2 | e4- | e4 |]', meter='4/4'),
        text=L('A curved line joining two notes of the same pitch: play the first and hold it through the second. Ties are the only way to hold a note across a bar line.',
               'Ein Bogen zwischen zwei Noten gleicher Tonhöhe: Spiele die erste und halte sie über die zweite hinweg. Nur mit Haltebögen kann ein Ton über den Taktstrich klingen.',
               'Une courbe reliant deux notes de même hauteur : on joue la première et on la tient pendant la seconde. Seule la liaison permet de tenir une note au-delà de la barre de mesure.')),
      staff(L('Dotted rhythm in Ode to Joy', 'Punktierter Rhythmus in der Ode an die Freude', "Le rythme pointé dans l'Hymne à la joie"), abc(ODE, meter='4/4'),
        text=L('Bar 4: a dotted quarter + an eighth + a half note. Count "1 - (2) and 3 - 4".', 'Takt 4: punktierte Viertel + Achtel + Halbe. Zähle „1 – (2) und 3 – 4“.', 'Mesure 4 : noire pointée + croche + blanche. Compte « 1 – (2) et 3 – 4 ».')),
    ],
    quiz=[
      ask(L('How many beats does a dotted half note last?', 'Wie viele Schläge dauert eine punktierte Halbe?', 'Combien de temps dure une blanche pointée ?'), ['3', '2', '2½', '4']),
      ask(L('How many beats does a dotted quarter note last?', 'Wie viele Schläge dauert eine punktierte Viertel?', 'Combien de temps dure une noire pointée ?'), ['1½', '1', '2', '3']),
      ask(L('Which note value is this?', 'Welcher Notenwert ist das?', 'Quelle est cette figure de note ?'), [DOTTED_HALF, HALF, DOTTED_QUARTER, WHOLE], music=abc('c3'), count=1),
      beats_question('c3 c', 4, [3, 5, 6]),
      ask(L('How long does the tied note sound in total?', 'Wie lange klingt die übergebundene Note insgesamt?', 'Combien de temps dure la note liée au total ?'), [L('3 beats', '3 Schläge', '3 temps'), L('2 beats', '2 Schläge', '2 temps'), L('4 beats', '4 Schläge', '4 temps')], music=abc('c2- c |]'), count=2),
    ]),
  lesson(L('The upbeat (anacrusis)', 'Der Auftakt', "L'anacrouse (levée)"),
    L('Many melodies start before the first strong beat - with an upbeat. Learn to spot it and to count it.',
      'Viele Melodien beginnen vor der ersten betonten Zählzeit – mit einem Auftakt. Lerne, ihn zu erkennen und zu zählen.',
      "Beaucoup de mélodies commencent avant le premier temps fort – par une anacrouse. Apprends à la repérer et à la compter."),
    [
      staff(L('An upbeat', 'Ein Auftakt', 'Une anacrouse'), abc('G | c2 e2 | d3 c | B2 G2 | c3 |]', meter='4/4', lyrics=lyr('4', '1', '3', '1', '4', '1', '3', '1')), scale=2.0, measures=5,
        text=L('The melody starts on beat 4. The first, incomplete bar is the upbeat - the last bar is usually shortened to match.',
               'Die Melodie beginnt auf Zählzeit 4. Der erste, unvollständige Takt ist der Auftakt – der letzte Takt ist meist entsprechend verkürzt.',
               "La mélodie commence sur le 4e temps. La première mesure incomplète est l'anacrouse – la dernière mesure est en général raccourcie d'autant.")),
      bullets(L('Counting an upbeat', 'Einen Auftakt zählen', 'Compter une anacrouse'),
        L('Find the time signature and count the missing beats first', 'Schau auf die Taktart und zähle zuerst die fehlenden Schläge', "Regarde la mesure et compte d'abord les temps manquants"),
        L('In 4/4 a one-beat upbeat is counted "(1 2 3) 4 | 1"', 'Im 4/4-Takt zählt man einen Viertelauftakt „(1 2 3) 4 | 1“', 'En 4/4, une anacrouse d’un temps se compte « (1 2 3) 4 | 1 »'),
        L('Bars are numbered from the first complete bar', 'Die Takte werden ab dem ersten vollständigen Takt gezählt', 'On numérote les mesures à partir de la première mesure complète'),
        L('Many songs and dances start this way - think of "Happy Birthday"', 'Viele Lieder und Tänze beginnen so – etwa „Happy Birthday“', 'Beaucoup de chansons et de danses commencent ainsi – pense à « Joyeux anniversaire »')),
    ],
    quiz=[
      ask(L('On which beat does this melody start?', 'Auf welcher Zählzeit beginnt diese Melodie?', 'Sur quel temps commence cette mélodie ?'), ['4', '1', '3', '2'], music=abc('G | c2 e2 | d4 |]', meter='4/4')),
      ask(L('On which beat does this melody start?', 'Auf welcher Zählzeit beginnt diese Melodie?', 'Sur quel temps commence cette mélodie ?'), ['3', '1', '2', '4'], music=abc('G | c2 e | d3 |]', meter='3/4')),
      ask(L('What do we call the incomplete first bar?', 'Wie heißt der unvollständige erste Takt?', 'Comment appelle-t-on la première mesure incomplète ?'), [L('Upbeat (anacrusis)', 'Auftakt', 'Anacrouse'), L('Coda', 'Coda', 'Coda'), L('Tie', 'Haltebogen', 'Liaison'), L('Fermata', 'Fermate', 'Point d’orgue')]),
    ]),
  lesson(L('Practice: dotted rhythms', 'Übung: punktierte Rhythmen', 'Entraînement : rythmes pointés'),
    L('Count bars with dots, ties and upbeats. Clap every example before you answer.',
      'Zähle Takte mit Punkten, Haltebögen und Auftakten. Klatsche jedes Beispiel, bevor du antwortest.',
      "Compte des mesures avec points, liaisons et anacrouses. Frappe chaque exemple avant de répondre."),
    [
      bullets(L('Week 11 in a nutshell', 'Woche 11 kurz gefasst', 'La semaine 11 en bref'),
        L('A dot adds half the value: dotted half = 3, dotted quarter = 1½', 'Ein Punkt verlängert um die Hälfte: punktierte Halbe = 3, punktierte Viertel = 1½', 'Le point ajoute la moitié : blanche pointée = 3, noire pointée = 1 ½'),
        L('A tie joins two notes of the same pitch', 'Ein Haltebogen verbindet zwei gleich hohe Noten', 'La liaison de prolongation relie deux notes de même hauteur'),
        L('An upbeat starts before the first strong beat', 'Ein Auftakt beginnt vor der ersten betonten Zählzeit', 'L’anacrouse commence avant le premier temps fort'),
        summary=True),
    ],
    quiz=[
      beats_question('c3/ c/ c2', 4, [3, 5, 2]),
      beats_question('c3', 3, [2, 4, 1]),
      beats_question('c3/ c/ c', 3, [4, 2, 5]),
      beats_question('c2- c c', 4, [3, 5, 2]),
      beats_question('c3 c/c/', 4, [3, 5, 6]),
      ask(L('This bar is in 3/4. Which value fills it with one note?', 'Dieser Takt steht im 3/4-Takt. Welcher Wert füllt ihn mit einer Note?', 'Cette mesure est à 3/4. Quelle valeur la remplit en une seule note ?'), [DOTTED_HALF, WHOLE, HALF, DOTTED_QUARTER]),
      ask(L('Which value follows a dotted quarter to fill two beats?', 'Welcher Wert ergänzt eine punktierte Viertel zu zwei Schlägen?', 'Quelle valeur complète une noire pointée pour faire deux temps ?'), [EIGHTH, QUARTER, HALF]),
      ask(L('Tie or slur? A curve joins two DIFFERENT notes.', 'Haltebogen oder Legatobogen? Ein Bogen verbindet zwei VERSCHIEDENE Töne.', 'Liaison de prolongation ou de phrasé ? Une courbe relie deux notes DIFFÉRENTES.'),
          [L('A slur - play them smoothly connected', 'Ein Legatobogen – gebunden spielen', 'Une liaison de phrasé – jouer lié'), L('A tie - hold one note', 'Ein Haltebogen – einen Ton halten', 'Une liaison de prolongation – tenir une note')], music=abc('(c2 d2) |]'), count=2),
    ], minutes=12),
)

W12 = week(12, L('The C Major Scale', 'Die C-Dur-Tonleiter', 'La gamme de do majeur'),
  lesson(L('The major scale pattern', 'Das Muster der Dur-Tonleiter', 'Le modèle de la gamme majeure'),
    L('Play the white keys from C to C and you hear the major scale - the sound of countless melodies. Its secret is a pattern of whole tones and semitones.',
      'Spiele die weißen Tasten von C bis C und du hörst die Dur-Tonleiter – den Klang unzähliger Melodien. Ihr Geheimnis ist ein Muster aus Ganz- und Halbtönen.',
      "Joue les touches blanches de do à do et tu entends la gamme majeure – le son d'innombrables mélodies. Son secret : une suite de tons et de demi-tons."),
    [
      staff(L('C major', 'C-Dur', 'Do majeur'), lambda lang: notes(scale('C4'), lang, duration='2'),
        text=L('Whole – whole – half – whole – whole – whole – half. The semitones fall between degrees 3–4 and 7–8.',
               'Ganzton – Ganzton – Halbton – Ganzton – Ganzton – Ganzton – Halbton. Die Halbtöne liegen zwischen der 3. und 4. sowie der 7. und 8. Stufe.',
               'Ton – ton – demi-ton – ton – ton – ton – demi-ton. Les demi-tons se trouvent entre les degrés 3–4 et 7–8.')),
      staff(L('Scale degrees', 'Tonleiterstufen', 'Les degrés de la gamme'), abc('C2 D2 E2 F2 G2 A2 B2 c2 |]', lyrics=lyr('1', '2', '3', '4', '5', '6', '7', '8')),
        points=[L('Degree 1 (and 8) is the tonic - the "home" note where melodies like to end', 'Die 1. (und 8.) Stufe ist der Grundton – das „Zuhause“, wo Melodien gern enden', 'Le 1er degré (et le 8e) est la tonique – la note « maison » où les mélodies aiment finir'),
                L('Degree 5 is the next strongest note', 'Die 5. Stufe ist der zweitstärkste Ton', 'Le 5e degré est la deuxième note la plus forte')]),
      bullets(L('Sing it - do re mi', 'Sing sie – do re mi', 'Chante-la – do ré mi'),
        L('Sing the scale up and down on the note names', 'Sing die Tonleiter auf und ab mit den Notennamen', 'Chante la gamme en montant et en descendant avec le nom des notes'),
        L('Movable-do singers call every major tonic "do": do re mi fa sol la ti do', 'Bei der relativen Solmisation heißt jeder Dur-Grundton „do“: do re mi fa so la ti do', 'En France, do reste do (do fixe) ; dans d’autres pays, chaque tonique majeure s’appelle « do » (do mobile)'),
        L('The scale is the alphabet of a key: a melody in C major uses these 7 notes', 'Die Tonleiter ist das Alphabet einer Tonart: Eine Melodie in C-Dur verwendet diese 7 Töne', "La gamme est l'alphabet d'une tonalité : une mélodie en do majeur utilise ces 7 notes")),
    ],
    quiz=[
      ask(L('Between which degrees of the major scale are the semitones?', 'Zwischen welchen Stufen der Dur-Tonleiter liegen die Halbtöne?', 'Entre quels degrés de la gamme majeure se trouvent les demi-tons ?'), ['3–4 & 7–8', '2–3 & 6–7', '4–5 & 7–8', '1–2 & 5–6']),
      ask(L('What do we call degree 1 of a scale?', 'Wie heißt die 1. Stufe einer Tonleiter?', 'Comment appelle-t-on le 1er degré d’une gamme ?'), [L('The tonic', 'Grundton (Tonika)', 'La tonique'), L('The dominant', 'Dominante', 'La dominante'), L('The leading note', 'Leitton', 'La sensible')]),
      ask(L('Which is the 5th degree of C major?', 'Welcher Ton ist die 5. Stufe von C-Dur?', 'Quel est le 5e degré de do majeur ?'), ['{n:G4}', '{n:F4}', '{n:A4}', '{n:E4}']),
      ask(L('How many different notes are in a major scale?', 'Wie viele verschiedene Töne hat eine Dur-Tonleiter?', 'Combien de notes différentes dans une gamme majeure ?'), ['7', '8', '5', '12']),
    ]),
  lesson(L('G major and F major', 'G-Dur und F-Dur', 'Sol majeur et fa majeur'),
    L('Start the same pattern on G or F and one black key is needed. This is where key signatures come from.',
      'Beginnt man dasselbe Muster auf G oder F, braucht man eine schwarze Taste. Daher kommen die Tonartvorzeichen.',
      "Commence le même modèle sur sol ou sur fa et il faut une touche noire. C'est l'origine de l'armure."),
    [
      staff(L('G major needs {n:F#4}', 'G-Dur braucht {n:F#4}', 'Sol majeur a besoin de {n:F#4}'), lambda lang: notes(scale('G4'), lang, duration='2'),
        text=L('From G the pattern whole-whole-half-whole-whole-whole-half needs {n:F#4} instead of {n:F4}.',
               'Ab G verlangt das Muster Ganz-Ganz-Halb-Ganz-Ganz-Ganz-Halb ein {n:F#4} statt {n:F4}.',
               'À partir de sol, le modèle ton-ton-demi-ton-ton-ton-ton-demi-ton exige {n:F#4} au lieu de {n:F4}.')),
      staff(L('F major needs {n:Bb4}', 'F-Dur braucht {n:Bb4}', 'Fa majeur a besoin de {n:Bb4}'), lambda lang: notes(scale('F4'), lang, duration='2'),
        text=L('From F the semitone between degrees 3 and 4 needs {n:Bb4} instead of {n:B4}.', 'Ab F verlangt der Halbton zwischen der 3. und 4. Stufe ein {n:Bb4} statt {n:B4}.', 'À partir de fa, le demi-ton entre les degrés 3 et 4 exige {n:Bb4} au lieu de {n:B4}.')),
      staff(L('The key signature', 'Die Tonartvorzeichen', "L'armure"), abc('x4 || [K:F] x4 |]', key='G'),
        text=L('Instead of writing the sharp or flat every time, it is placed once after the clef: the key signature. One sharp = G major, one flat = F major.',
               'Statt das Kreuz oder b jedes Mal zu schreiben, steht es einmal nach dem Schlüssel: die Vorzeichen (Generalvorzeichen). Ein Kreuz = G-Dur, ein b = F-Dur.',
               "Au lieu d'écrire le dièse ou le bémol à chaque fois, on le place une fois après la clé : l'armure. Un dièse = sol majeur, un bémol = fa majeur.")),
    ],
    quiz=[
      ask(L('Which note is sharpened in G major?', 'Welcher Ton ist in G-Dur erhöht?', 'Quelle note est diésée en sol majeur ?'), ['{n:F4}', '{n:C4}', '{n:G4}', '{n:B4}']),
      ask(L('Which note is flattened in F major?', 'Welcher Ton ist in F-Dur erniedrigt?', 'Quelle note est bémolisée en fa majeur ?'), ['{n:B4}', '{n:E4}', '{n:F4}', '{n:A4}']),
      ask(L('Which major key has this key signature?', 'Welche Durtonart hat diese Vorzeichen?', 'Quelle tonalité majeure a cette armure ?'), [lambda lang: key_name('G', lang), lambda lang: key_name('F', lang), lambda lang: key_name('C', lang), lambda lang: key_name('D', lang)], music=abc('x4', key='G'), count=2),
      ask(L('Which major key has this key signature?', 'Welche Durtonart hat diese Vorzeichen?', 'Quelle tonalité majeure a cette armure ?'), [lambda lang: key_name('F', lang), lambda lang: key_name('G', lang), lambda lang: key_name('C', lang), lambda lang: key_name('Bb', lang)], music=abc('x4', key='F'), count=2),
    ],
    library=[(MINUET_G, L('The Minuet in G again: now you can explain the sharp in the key signature. Which note is always raised?', 'Noch einmal das Menuett in G: Jetzt kannst du das Kreuz in den Vorzeichen erklären. Welcher Ton ist immer erhöht?', 'Encore le Menuet en sol : tu peux maintenant expliquer le dièse à l’armure. Quelle note est toujours haussée ?'))]),
  lesson(L('Practice: scales and key signatures', 'Übung: Tonleitern und Vorzeichen', 'Entraînement : gammes et armures'),
    L('Recognise C, G and F major on the staff, and read melodies with a key signature.',
      'Erkenne C-, G- und F-Dur im Notensystem und lies Melodien mit Vorzeichen.',
      "Reconnais do, sol et fa majeur sur la portée et lis des mélodies avec une armure."),
    [
      staff(L('Read with a key signature', 'Mit Vorzeichen lesen', 'Lire avec une armure'), abc('G A B c | d2 B2 | c A F A | G4 |]', meter='4/4', key='G'),
        text=L('Every F is played as {n:F#4} - even without a sharp in front of it.', 'Jedes F wird als {n:F#4} gespielt – auch ohne Kreuz davor.', 'Chaque fa se joue {n:F#4} – même sans dièse devant.')),
      bullets(L('Week 12 in a nutshell', 'Woche 12 kurz gefasst', 'La semaine 12 en bref'),
        L('Major scale: whole-whole-half-whole-whole-whole-half', 'Dur-Tonleiter: Ganz-Ganz-Halb-Ganz-Ganz-Ganz-Halb', 'Gamme majeure : ton-ton-demi-ton-ton-ton-ton-demi-ton'),
        L('C major: no sharps or flats', 'C-Dur: keine Vorzeichen', 'Do majeur : ni dièse ni bémol'),
        L('G major: {n:F#4} · F major: {n:Bb4}', 'G-Dur: {n:F#4} · F-Dur: {n:Bb4}', 'Sol majeur : {n:F#4} · fa majeur : {n:Bb4}'),
        L('The key signature applies to every octave, all piece long', 'Die Vorzeichen gelten in jeder Oktave, im ganzen Stück', "L'armure vaut à toutes les octaves, pendant tout le morceau"),
        summary=True),
    ],
    quiz=[
      ask(L('Which scale is this?', 'Welche Tonleiter ist das?', 'Quelle est cette gamme ?'), [lambda lang: key_name('G', lang), lambda lang: key_name('C', lang), lambda lang: key_name('F', lang)], music=lambda lang: notes(scale('G4'))),
      ask(L('Which scale is this?', 'Welche Tonleiter ist das?', 'Quelle est cette gamme ?'), [lambda lang: key_name('F', lang), lambda lang: key_name('C', lang), lambda lang: key_name('G', lang)], music=lambda lang: notes(scale('F4'))),
      ask(L('Which scale is this?', 'Welche Tonleiter ist das?', 'Quelle est cette gamme ?'), [lambda lang: key_name('C', lang), lambda lang: key_name('G', lang), lambda lang: key_name('F', lang)], music=lambda lang: notes(scale('C4'))),
      ask(L('How is the marked note played?', 'Wie wird die markierte Note gespielt?', 'Comment joue-t-on la note marquée ?'), ['{n:F#5}', '{n:F5}', '{n:Fb5}', '{n:G5}'], music=abc('d e "^?"f g |]', key='G')),
      ask(L('How is the marked note played?', 'Wie wird die markierte Note gespielt?', 'Comment joue-t-on la note marquée ?'), ['{n:Bb4}', '{n:B4}', '{n:C5}', '{n:A4}'], music=abc('A "^?"B c d |]', key='F')),
      ask(L('Which degree of the scale is {n:E4} in C major?', 'Die wievielte Stufe ist {n:E4} in C-Dur?', 'Quel degré est {n:E4} en do majeur ?'), ['3', '2', '4', '5']),
      ask(L('Which note is the tonic of G major?', 'Welcher Ton ist der Grundton von G-Dur?', 'Quelle est la tonique de sol majeur ?'), ['{n:G4}', '{n:D4}', '{n:F#4}', '{n:C4}']),
      ask(L('Where is the key signature written?', 'Wo stehen die Vorzeichen?', "Où écrit-on l'armure ?"), [L('Right after the clef, on every line', 'Direkt nach dem Schlüssel, in jeder Zeile', 'Juste après la clé, à chaque ligne'), L('Only at the end of the piece', 'Nur am Ende des Stücks', 'Seulement à la fin du morceau'), L('Above the first note', 'Über der ersten Note', 'Au-dessus de la première note')]),
    ], minutes=12),
)

# --- Month 4 ------------------------------------------------------------------


def iv(number):
    return lambda lang: interval_name(number, None, lang)


def q_size(low, high, harmonic=False, clef='treble'):
    return q_interval(low, high, with_quality=False, harmonic=harmonic, clef=clef)


W13 = week(13, L('Intervals', 'Intervalle', 'Les intervalles'),
  lesson(L('Counting intervals', 'Intervalle abzählen', 'Compter les intervalles'),
    L('An interval is the distance between two notes. Count the letter names - including both notes - and you have its number: second, third, fourth ...',
      'Ein Intervall ist der Abstand zwischen zwei Tönen. Zähle die Notennamen – beide Töne mitgerechnet – und du hast seine Größe: Sekunde, Terz, Quarte ...',
      "Un intervalle est la distance entre deux notes. Compte les noms de notes – les deux notes comprises – et tu obtiens son nom : seconde, tierce, quarte..."),
    [
      staff(L('Intervals from {n:C4}', 'Intervalle ab {n:C4}', 'Les intervalles à partir de {n:C4}'),
        abc('[CC]2 [CD]2 [CE]2 [CF]2 [CG]2 [CA]2 [CB]2 [Cc]2 |]', lyrics=lyr(iv(1), iv(2), iv(3), iv(4), iv(5), iv(6), iv(7), iv(8))), scale=1.7,
        text=L('Count: C(1) D(2) E(3) - so C to E is a third. The same note twice is a unison.', 'Zähle: C(1) D(2) E(3) – also ist C bis E eine Terz. Zweimal derselbe Ton ist eine Prime.', 'Compte : do(1) ré(2) mi(3) – do-mi est donc une tierce. Deux fois la même note : un unisson.')),
      bullets(L('Seeing intervals on the staff', 'Intervalle im Notensystem sehen', 'Voir les intervalles sur la portée'),
        L('Second: line to the next space - neighbours', 'Sekunde: Linie zum nächsten Zwischenraum – Nachbarn', 'Seconde : ligne à l’interligne voisin – des voisines'),
        L('Third: line to line, or space to space (next one)', 'Terz: Linie zu Linie oder Zwischenraum zu Zwischenraum (nächster)', 'Tierce : ligne à ligne ou interligne à interligne (suivant)'),
        L('Fifth: line to line, skipping one line (or space to space)', 'Quinte: Linie zu Linie mit einer übersprungenen Linie (oder Zwischenraum zu Zwischenraum)', 'Quinte : ligne à ligne en sautant une ligne (ou interligne à interligne)'),
        L('Odd numbers (3, 5, 7) stay on lines or in spaces; even ones (2, 4, 6, 8) switch', 'Ungerade (3, 5, 7) bleiben auf Linien oder in Zwischenräumen; gerade (2, 4, 6, 8) wechseln', 'Les impairs (3, 5, 7) restent sur des lignes ou des interlignes ; les pairs (2, 4, 6, 8) changent')),
      staff(L('Melodic and harmonic', 'Melodisch und harmonisch', 'Mélodique et harmonique'), abc('C2 G2 | [CG]4 |]'),
        text=L('One after the other: a melodic interval. Sounding together: a harmonic interval. Both here are fifths.', 'Nacheinander: ein melodisches Intervall. Gleichzeitig: ein harmonisches Intervall. Beide sind hier Quinten.', 'L’une après l’autre : intervalle mélodique. Ensemble : intervalle harmonique. Ici, ce sont deux quintes.')),
    ],
    quiz=[q_size('C4', 'E4'), q_size('D4', 'A4'), q_size('E4', 'F4'), q_size('G4', 'G5'), q_size('F4', 'B4', harmonic=True)]),
  lesson(L('Intervals in melodies', 'Intervalle in Melodien', 'Les intervalles dans les mélodies'),
    L('Famous tunes begin with typical intervals. Recognise them and you will read - and sing - new melodies much faster.',
      'Berühmte Melodien beginnen mit typischen Intervallen. Wer sie erkennt, liest – und singt – neue Melodien viel schneller.',
      "Les mélodies célèbres commencent par des intervalles typiques. Reconnais-les et tu liras – et chanteras – de nouvelles mélodies bien plus vite."),
    [
      staff(L('A fifth: Twinkle, twinkle', 'Eine Quinte: „Morgen kommt der Weihnachtsmann“', 'Une quinte : « Ah ! vous dirai-je, maman »'), abc('C C G G | A A G2 |]', meter='4/4'),
        text=L('{n:C4} to {n:G4}: a fifth.', '{n:C4} bis {n:G4}: eine Quinte.', '{n:C4} à {n:G4} : une quinte.')),
      staff(L('Thirds and seconds: Frère Jacques', 'Terzen und Sekunden: Bruder Jakob', 'Tierces et secondes : Frère Jacques'), abc(FRERE, meter='4/4'),
        text=L('Mostly seconds; {n:E4}–{n:C4} at the end of bar 1 is a third.', 'Vor allem Sekunden; {n:E4}–{n:C4} am Ende von Takt 1 ist eine Terz.', 'Surtout des secondes ; {n:E4}–{n:C4} à la fin de la mesure 1 est une tierce.')),
      staff(L('An octave and a sixth', 'Eine Oktave und eine Sexte', 'Une octave et une sixte'), abc('C2 c2 | E2 c2 |]'),
        text=L('{n:C4}–{n:C5} is an octave (the leap at the start of "Somewhere over the Rainbow"); {n:E4}–{n:C5} is a sixth.', '{n:C4}–{n:C5} ist eine Oktave; {n:E4}–{n:C5} ist eine Sexte.', '{n:C4}–{n:C5} est une octave ; {n:E4}–{n:C5} est une sixte.')),
    ],
    quiz=[q_size('C4', 'G4'), q_size('E4', 'C5'), q_size('A4', 'D5'), q_size('B3', 'D4'), q_size('F3', 'D4', clef='bass')]),
  lesson(L('Practice: naming intervals', 'Übung: Intervalle bestimmen', 'Entraînement : nommer les intervalles'),
    L('A practice quiz on interval sizes - melodic and harmonic, in both clefs.',
      'Ein Übungsquiz zur Intervallgröße – melodisch und harmonisch, in beiden Schlüsseln.',
      "Un quiz d'entraînement sur les intervalles – mélodiques et harmoniques, dans les deux clés."),
    [
      bullets(L('Week 13 in a nutshell', 'Woche 13 kurz gefasst', 'La semaine 13 en bref'),
        L('Count both notes: C–E = 3 (third)', 'Beide Töne mitzählen: C–E = 3 (Terz)', 'Compter les deux notes : do–mi = 3 (tierce)'),
        L('Unison, second, third, fourth, fifth, sixth, seventh, octave', 'Prime, Sekunde, Terz, Quarte, Quinte, Sexte, Septime, Oktave', 'Unisson, seconde, tierce, quarte, quinte, sixte, septième, octave'),
        L('Odd intervals: line–line or space–space', 'Ungerade Intervalle: Linie–Linie oder Zwischenraum–Zwischenraum', 'Intervalles impairs : ligne–ligne ou interligne–interligne'),
        L('In Solfège 2 you will learn major, minor and perfect intervals', 'In Solfège 2 lernst du große, kleine und reine Intervalle', 'Dans Solfège 2, tu apprendras les intervalles majeurs, mineurs et justes'),
        summary=True),
    ],
    quiz=[q_size('D4', 'F4'), q_size('C5', 'A5'), q_size('G4', 'C5', harmonic=True), q_size('E4', 'D5'), q_size('A3', 'A4', harmonic=True),
          q_size('C3', 'G3', clef='bass'), q_size('B4', 'C5'), q_size('F4', 'E5', harmonic=True)], minutes=12),
)

DYNAMICS = 'pp p mp mf f ff'.split()

W14 = week(14, L('Dynamics, Tempo and Articulation', 'Dynamik, Tempo und Artikulation', 'Nuances, tempo et articulations'),
  lesson(L('Loud and soft: dynamics', 'Laut und leise: Dynamik', 'Fort et doux : les nuances'),
    L('Composers write how loud to play with Italian words and their abbreviations - from pianissimo to fortissimo.',
      'Komponisten schreiben die Lautstärke mit italienischen Wörtern und ihren Abkürzungen vor – vom Pianissimo bis zum Fortissimo.',
      "Les compositeurs indiquent l'intensité avec des mots italiens et leurs abréviations – du pianissimo au fortissimo."),
    [
      staff(L('From very soft to very loud', 'Von sehr leise bis sehr laut', 'Du très doux au très fort'), abc(' '.join('!%s!c2' % d for d in DYNAMICS) + ' |]'),
        points=[L('p = piano (soft), f = forte (loud), m = mezzo (medium)', 'p = piano (leise), f = forte (laut), m = mezzo (mittel)', 'p = piano (doux), f = forte (fort), m = mezzo (moyennement)'),
                L('pp pianissimo · p · mp · mf · f · ff fortissimo', 'pp Pianissimo · p · mp · mf · f · ff Fortissimo', 'du plus doux au plus fort : pp · p · mp · mf · f · ff')]),
      staff(L('Getting louder and softer', 'Lauter und leiser werden', 'Plus fort, plus doux'), abc('!p!!crescendo(!C D E F !crescendo)!| !f!G4 | !diminuendo(!G F E D !diminuendo)!| !p!C4 |]', meter='4/4'),
        text=L('The opening "hairpin" (or cresc.) means get louder; the closing one (dim. or decresc.) means get softer.', 'Die sich öffnende Gabel (oder cresc.) heißt lauter werden; die sich schließende (dim. oder decresc.) leiser werden.', 'Le soufflet qui s’ouvre (ou cresc.) signifie plus fort ; celui qui se ferme (dim. ou decresc.) plus doux.')),
      bullets(L('Why Italian?', 'Warum Italienisch?', 'Pourquoi l’italien ?'),
        L('In the 17th and 18th centuries Italy led European music', 'Im 17. und 18. Jahrhundert führte Italien die europäische Musik an', 'Aux XVIIe et XVIIIe siècles, l’Italie dominait la musique européenne'),
        L('Its words became an international language for musicians', 'Seine Wörter wurden zur internationalen Sprache der Musiker', 'Ses mots sont devenus une langue internationale des musiciens'),
        L('"Pianoforte" - the piano - is named after p and f: an instrument that can play both', '„Pianoforte“ – das Klavier – heißt nach p und f: ein Instrument, das beides kann', '« Pianoforte » – le piano – tire son nom de p et f : un instrument qui sait jouer les deux'),
        L('Some composers wrote in their own language: Schumann in German, Debussy in French', 'Manche Komponisten schrieben in ihrer Sprache: Schumann auf Deutsch, Debussy auf Französisch', 'Certains écrivaient dans leur langue : Schumann en allemand, Debussy en français')),
    ],
    quiz=[
      ask(L('What does "p" mean?', 'Was bedeutet „p“?', 'Que signifie « p » ?'), [L('soft (piano)', 'leise (piano)', 'doux (piano)'), L('loud (forte)', 'laut (forte)', 'fort (forte)'), L('slow', 'langsam', 'lent'), L('pause', 'Pause', 'pause')]),
      ask(L('Which is the loudest?', 'Was ist am lautesten?', 'Quelle nuance est la plus forte ?'), ['ff', 'mf', 'f', 'mp']),
      ask(L('Which is softer: mp or mf?', 'Was ist leiser: mp oder mf?', 'Lequel est plus doux : mp ou mf ?'), ['mp', 'mf', L('the same', 'gleich', 'pareil')]),
      ask(L('What does crescendo mean?', 'Was bedeutet crescendo?', 'Que signifie crescendo ?'), [L('getting louder', 'lauter werden', 'de plus en plus fort'), L('getting softer', 'leiser werden', 'de plus en plus doux'), L('getting faster', 'schneller werden', 'de plus en plus vite'), L('getting slower', 'langsamer werden', 'de plus en plus lent')]),
    ]),
  lesson(L('Tempo and articulation', 'Tempo und Artikulation', 'Tempo et articulations'),
    L('How fast? How short or connected? Tempo words and articulation signs complete what the notes alone cannot say.',
      'Wie schnell? Wie kurz oder gebunden? Tempobezeichnungen und Artikulationszeichen ergänzen, was die Noten allein nicht sagen.',
      "À quelle vitesse ? Court ou lié ? Les indications de tempo et les signes d'articulation complètent ce que les notes seules ne disent pas."),
    [
      bullets(L('Tempo words', 'Tempobezeichnungen', 'Indications de tempo'),
        L('Largo, Adagio - slow · Andante - walking pace · Moderato - moderate', 'Largo, Adagio – langsam · Andante – gehend · Moderato – mäßig', 'Largo, Adagio – lent · Andante – allant · Moderato – modéré'),
        L('Allegro - fast and lively · Presto - very fast', 'Allegro – schnell und lebhaft · Presto – sehr schnell', 'Allegro – rapide et joyeux · Presto – très rapide'),
        L('ritardando (rit.) - slowing down · accelerando - speeding up', 'ritardando (rit.) – langsamer werden · accelerando – schneller werden', 'ritardando (rit.) – en ralentissant · accelerando – en accélérant'),
        L('a tempo - back to the original speed · ♩ = 60: 60 beats per minute', 'a tempo – zurück zum Anfangstempo · ♩ = 60: 60 Schläge pro Minute', 'a tempo – retour au tempo initial · ♩ = 60 : 60 temps par minute')),
      staff(L('Articulation signs', 'Artikulationszeichen', "Signes d'articulation"), abc('.c .c .c .c | (c d e f) | !>!g !>!g !tenuto!g !tenuto!g | !fermata!c4 |]', meter='4/4'), scale=2.2,
        points=[L('Staccato (dot): short, detached · slur (curve): smooth, legato', 'Staccato (Punkt): kurz, abgestoßen · Bogen: gebunden, legato', 'Staccato (point) : court, détaché · liaison (courbe) : lié, legato'),
                L('Accent (>): stressed · tenuto (–): held full length · fermata: hold as long as you like', 'Akzent (>): betont · Tenuto (–): voll ausgehalten · Fermate: beliebig lang halten', 'Accent (>) : appuyé · tenuto (–) : tenu · point d’orgue : tenir aussi longtemps que voulu')]),
      bullets(L('Tie or slur?', 'Haltebogen oder Legatobogen?', 'Liaison de prolongation ou de phrasé ?'),
        L('Both are curves', 'Beide sind Bögen', 'Les deux sont des courbes'),
        L('Same pitch: a tie - one long note', 'Gleiche Tonhöhe: Haltebogen – ein langer Ton', 'Même hauteur : liaison de prolongation – une seule note longue'),
        L('Different pitches: a slur - play them connected', 'Verschiedene Tonhöhen: Legatobogen – gebunden spielen', 'Hauteurs différentes : liaison de phrasé – jouer lié'),
        L('Singers: one breath, or one syllable over several notes', 'Sänger: ein Atem oder eine Silbe über mehrere Töne', 'Chanteurs : un seul souffle, ou une syllabe sur plusieurs notes')),
    ],
    quiz=[
      ask(L('Which tempo is the fastest?', 'Welches Tempo ist am schnellsten?', 'Quel tempo est le plus rapide ?'), ['Presto', 'Allegro', 'Andante', 'Adagio']),
      ask(L('What does "Andante" mean?', 'Was bedeutet „Andante“?', 'Que signifie « Andante » ?'), [L('at a walking pace', 'gehend', 'allant, au pas'), L('very fast', 'sehr schnell', 'très rapide'), L('very slow', 'sehr langsam', 'très lent'), L('getting louder', 'lauter werden', 'de plus en plus fort')]),
      ask(L('What do the dots above the notes mean?', 'Was bedeuten die Punkte über den Noten?', 'Que signifient les points au-dessus des notes ?'), [L('staccato - short', 'Staccato – kurz', 'staccato – court'), L('longer by half', 'um die Hälfte länger', 'plus long de moitié'), L('louder', 'lauter', 'plus fort')], music=abc('.c .c .c .c |]')),
      ask(L('What does this sign mean?', 'Was bedeutet dieses Zeichen?', 'Que signifie ce signe ?'), [L('fermata - hold the note', 'Fermate – Ton halten', "point d'orgue – tenir la note"), L('accent', 'Akzent', 'accent'), L('repeat', 'Wiederholung', 'reprise')], music=abc('!fermata!c4 |]')),
      ask(L('What does "rit." mean?', 'Was bedeutet „rit.“?', 'Que signifie « rit. » ?'), [L('slow down gradually', 'allmählich langsamer', 'ralentir progressivement'), L('speed up', 'schneller werden', 'accélérer'), L('play softly', 'leise spielen', 'jouer doux')]),
    ]),
  lesson(L('Practice: the signs of a score', 'Übung: die Zeichen einer Partitur', "Entraînement : les signes d'une partition"),
    L('Read all the signs in a short piece - dynamics, tempo and articulation - and then find them in Schumann.',
      'Lies alle Zeichen in einem kurzen Stück – Dynamik, Tempo und Artikulation – und finde sie dann bei Schumann.',
      "Lis tous les signes d'un court morceau – nuances, tempo et articulations – puis retrouve-les chez Schumann."),
    [
      staff(L('Everything together', 'Alles zusammen', 'Tout ensemble'), 'X:1\n%%stretchlast 1\nQ:"Allegro"\nM:2/4\nL:1/8\nK:G\n!mf!.G.B .d.B | (cA) F2 | !p!(GA Bc) | !>!d2 !fermata!z2 |]\n',
        text=L('Allegro, mezzo forte, staccato, slur, piano, accent, fermata on a rest. Say each sign out loud as you read.', 'Allegro, mezzoforte, staccato, Bogen, piano, Akzent, Fermate über einer Pause. Sag jedes Zeichen beim Lesen laut.', 'Allegro, mezzo forte, staccato, liaison, piano, accent, point d’orgue sur un silence. Dis chaque signe à voix haute en lisant.')),
      bullets(L('Week 14 in a nutshell', 'Woche 14 kurz gefasst', 'La semaine 14 en bref'),
        L('Dynamics: pp p mp mf f ff, cresc. and dim.', 'Dynamik: pp p mp mf f ff, cresc. und dim.', 'Nuances : pp p mp mf f ff, cresc. et dim.'),
        L('Tempo: Adagio < Andante < Moderato < Allegro < Presto', 'Tempo, von langsam nach schnell: Adagio < Andante < Moderato < Allegro < Presto', 'Tempo : Adagio < Andante < Moderato < Allegro < Presto'),
        L('Articulation: staccato, legato, accent, tenuto, fermata', 'Artikulation: Staccato, Legato, Akzent, Tenuto, Fermate', 'Articulations : staccato, legato, accent, tenuto, point d’orgue'),
        summary=True),
    ],
    quiz=[
      ask(L('Which dynamic marking starts this piece?', 'Mit welcher Dynamik beginnt dieses Stück?', 'Par quelle nuance commence ce morceau ?'), ['mf', 'p', 'f', 'mp'], music='X:1\nM:2/4\nL:1/8\nK:G\n!mf!.G.B .d.B | (cA) F2 |]\n'),
      ask(L('Order from slowest to fastest:', 'Ordne von langsam nach schnell:', 'Classe du plus lent au plus rapide :'), ['Adagio – Andante – Allegro', 'Andante – Adagio – Allegro', 'Allegro – Andante – Adagio']),
      ask(L('Which is softest?', 'Was ist am leisesten?', 'Laquelle est la plus douce ?'), ['pp', 'p', 'mp', 'mf']),
      ask(L('What does "decrescendo" mean?', 'Was bedeutet „decrescendo“?', 'Que signifie « decrescendo » ?'), [L('getting softer', 'leiser werden', 'de plus en plus doux'), L('getting louder', 'lauter werden', 'de plus en plus fort'), L('getting slower', 'langsamer werden', 'de plus en plus lent')]),
      ask(L('What sign is above the third note?', 'Welches Zeichen steht über der dritten Note?', 'Quel signe y a-t-il sur la troisième note ?'), [L('accent', 'Akzent', 'accent'), L('staccato', 'Staccato', 'staccato'), L('fermata', 'Fermate', "point d'orgue")], music=abc('c d !>!e f |]')),
      ask(L('Which word means "very fast"?', 'Welches Wort bedeutet „sehr schnell“?', 'Quel mot signifie « très rapide » ?'), ['Presto', 'Largo', 'Moderato', 'Andante']),
      ask(L('"a tempo" means ...', '„a tempo“ bedeutet ...', '« a tempo » signifie ...'), [L('back to the original speed', 'zurück zum Anfangstempo', 'revenir au tempo initial'), L('in time with a partner', 'im Takt mit einem Partner', 'en mesure avec un partenaire'), L('as fast as possible', 'so schnell wie möglich', 'aussi vite que possible')]),
    ],
    library=[(WILD_RIDER, L('Schumann, "The Wild Rider": find the tempo word, the dynamic markings and the staccato dots on the first page.', 'Schumann, „Wilder Reiter“: Finde Tempobezeichnung, Dynamik und Staccato-Punkte auf der ersten Seite.', 'Schumann, « Le cavalier sauvage » : trouve l’indication de tempo, les nuances et les points de staccato sur la première page.')),
             (FARMER, L('Schumann, "The Happy Farmer": which hand has the melody first? Which dynamic marking does it start with?', 'Schumann, „Fröhlicher Landmann“: Welche Hand hat zuerst die Melodie? Mit welcher Dynamik beginnt es?', 'Schumann, « Le gai laboureur » : quelle main a d’abord la mélodie ? Par quelle nuance commence-t-il ?'))],
    minutes=12),
)

W15 = week(15, L('Repeats and the Road Map of a Score', 'Wiederholungen und der Weg durch die Partitur', 'Reprises et parcours de la partition'),
  lesson(L('Repeat signs and endings', 'Wiederholungszeichen und Klammern', 'Barres de reprise et fins'),
    L('Music saves paper: repeat signs send you back, first and second endings change the way out.',
      'Musik spart Papier: Wiederholungszeichen schicken dich zurück, erste und zweite Klammer ändern den Ausgang.',
      "La musique économise le papier : les barres de reprise te renvoient en arrière, les première et deuxième fins changent la sortie."),
    [
      staff(L('Repeat signs', 'Wiederholungszeichen', 'Barres de reprise'), abc('|: C D E F | G4 :| A G F E | C4 |]', meter='4/4'),
        text=L('Two dots before a double bar line: go back to the facing sign (or to the beginning) and play once more.', 'Zwei Punkte vor einem Doppelstrich: Zurück zum Gegenzeichen (oder zum Anfang) und noch einmal spielen.', 'Deux points devant une double barre : reviens au signe opposé (ou au début) et rejoue une fois.')),
      staff(L('First and second endings', 'Erste und zweite Klammer', 'Première et deuxième fins'), abc('|: C D E F |1 G2 E2 :|2 C4 |]', meter='4/4'),
        text=L('First time: play ending 1 and repeat. Second time: skip ending 1 and play ending 2.', 'Beim ersten Mal: Klammer 1 spielen und wiederholen. Beim zweiten Mal: Klammer 1 überspringen und Klammer 2 spielen.', 'La première fois : joue la fin 1 et reprends. La seconde fois : saute la fin 1 et joue la fin 2.')),
      bullets(L('Play order', 'Spielreihenfolge', "Ordre de jeu"),
        L('Example 1: bars 1-2-1-2-3-4', 'Beispiel 1: Takte 1-2-1-2-3-4', 'Exemple 1 : mesures 1-2-1-2-3-4'),
        L('Example 2: bars 1-2-1-3', 'Beispiel 2: Takte 1-2-1-3', 'Exemple 2 : mesures 1-2-1-3'),
        L('Minuets and dances: both halves are usually repeated (AABB)', 'Menuette und Tänze: Meist werden beide Hälften wiederholt (AABB)', 'Menuets et danses : les deux moitiés sont généralement reprises (AABB)'),
        L('Tip: before playing, trace the road with your finger', 'Tipp: Fahre den Weg vor dem Spielen mit dem Finger nach', 'Astuce : avant de jouer, suis le parcours du doigt')),
    ],
    quiz=[
      ask(L('In which order are the bars played?', 'In welcher Reihenfolge werden die Takte gespielt?', 'Dans quel ordre joue-t-on les mesures ?'), ['1-2-1-2-3', '1-2-3', '1-2-3-1-2-3', '1-1-2-2-3'], music=abc('|: "_1"C D E F | "_2"G4 :| "_3"c4 |]', meter='4/4')),
      ask(L('In which order are the bars played?', 'In welcher Reihenfolge werden die Takte gespielt?', 'Dans quel ordre joue-t-on les mesures ?'), ['1-2-1-3', '1-2-3', '1-2-1-2-3', '1-3-1-2'], music=abc('|: "_1"C D E F |1 "_2"G2 E2 :|2 "_3"C4 |]', meter='4/4')),
      ask(L('A repeat sign has ...', 'Ein Wiederholungszeichen hat ...', 'Une barre de reprise comporte ...'), [L('two dots next to a double bar line', 'zwei Punkte neben einem Doppelstrich', 'deux points à côté d’une double barre'), L('a curved line', 'einen Bogen', 'une ligne courbe'), L('a number above the staff', 'eine Zahl über dem System', 'un chiffre au-dessus de la portée')]),
    ]),
  lesson(L('D.C., D.S., Fine and Coda', 'D.C., D.S., Fine und Coda', 'D.C., D.S., Fine et Coda'),
    L('Longer jumps use Italian words and symbols: Da Capo, Dal Segno, Fine, and the Coda sign.',
      'Längere Sprünge verwenden italienische Wörter und Symbole: Da capo, Dal segno, Fine und das Coda-Zeichen.',
      "Les sauts plus longs utilisent des mots et symboles italiens : Da capo, Dal segno, Fine et le signe de coda."),
    [
      bullets(L('The road signs', 'Die Wegweiser', 'Les panneaux de signalisation'),
        L('D.C. (da capo): go back to the beginning', 'D.C. (da capo): zurück zum Anfang', 'D.C. (da capo) : retour au début'),
        L('D.S. (dal segno): go back to the sign 𝄋', 'D.S. (dal segno): zurück zum Zeichen 𝄋', 'D.S. (dal segno) : retour au signe 𝄋'),
        L('Fine: the end - stop here after jumping back', 'Fine: das Ende – nach dem Rücksprung hier aufhören', 'Fine : la fin – s’arrêter ici après le retour'),
        L('To Coda 𝄌: jump to the Coda (the closing section)', 'Zur Coda 𝄌: zur Coda (dem Schlussteil) springen', 'Vers la Coda 𝄌 : sauter à la coda (la conclusion)'),
        L('"D.C. al Fine" = from the beginning to Fine', '„D.C. al Fine“ = vom Anfang bis Fine', '« D.C. al Fine » = du début jusqu’à Fine')),
      staff(L('D.C. al Fine', 'D.C. al Fine', 'D.C. al Fine'), abc('"^1"C D E F | "^2"G4 "_Fine"|| "^3"A G F E | "^4""_D.C. al Fine"D2 z2 |]', meter='4/4'), scale=2.2, measures=4,
        text=L('Play bars 1-2-3-4, then back to the beginning and stop at Fine: 1-2-3-4-1-2. A minuet with its trio often works this way.',
               'Spiele die Takte 1-2-3-4, dann zurück an den Anfang bis Fine: 1-2-3-4-1-2. Ein Menuett mit Trio funktioniert oft so.',
               'Joue les mesures 1-2-3-4, puis reviens au début jusqu’à Fine : 1-2-3-4-1-2. Un menuet avec trio fonctionne souvent ainsi.')),
    ],
    quiz=[
      ask(L('What does D.C. mean?', 'Was bedeutet D.C.?', 'Que signifie D.C. ?'), [L('Go back to the beginning', 'Zurück zum Anfang', 'Retour au début'), L('Go back to the sign', 'Zurück zum Zeichen', 'Retour au signe'), L('Play softer', 'Leiser spielen', 'Jouer plus doux')]),
      ask(L('What does "Fine" mean?', 'Was bedeutet „Fine“?', 'Que signifie « Fine » ?'), [L('The end', 'Das Ende', 'La fin'), L('Fine, well played', 'Gut gemacht', 'Bien joué'), L('Repeat', 'Wiederholen', 'Reprise')]),
      ask(L('Bars 1-4 are followed by "D.C. al Fine"; Fine is at the end of bar 2. The order is ...', 'Auf die Takte 1–4 folgt „D.C. al Fine“; Fine steht am Ende von Takt 2. Die Reihenfolge ist ...', 'Les mesures 1–4 sont suivies de « D.C. al Fine » ; Fine est à la fin de la mesure 2. L’ordre est ...'), ['1-2-3-4-1-2', '1-2-3-4-1-2-3-4', '1-2-1-2-3-4', '1-2-3-4-3-4']),
    ]),
  lesson(L('Practice: the road map of a minuet', 'Übung: der Weg durch ein Menuett', "Entraînement : le parcours d'un menuet"),
    L('Plan the road through real pieces: repeats, endings, D.C. Then follow them in the Library scores.',
      'Plane den Weg durch echte Stücke: Wiederholungen, Klammern, D.C. Dann folge ihm in den Noten der Bibliothek.',
      "Planifie le parcours de vraies pièces : reprises, fins, D.C. Puis suis-le dans les partitions de la Bibliothèque."),
    [
      bullets(L('Week 15 in a nutshell', 'Woche 15 kurz gefasst', 'La semaine 15 en bref'),
        L('Repeat signs: two dots and a double bar line', 'Wiederholungszeichen: zwei Punkte und Doppelstrich', 'Barres de reprise : deux points et une double barre'),
        L('1st and 2nd endings change the way out', '1. und 2. Klammer ändern den Ausgang', 'Les 1re et 2e fins changent la sortie'),
        L('D.C. = from the beginning, D.S. = from the sign, Fine = the end', 'D.C. = vom Anfang, D.S. = vom Zeichen, Fine = Ende', 'D.C. = du début, D.S. = du signe, Fine = la fin'),
        summary=True),
    ],
    quiz=[
      ask(L('How many bars are played in total?', 'Wie viele Takte werden insgesamt gespielt?', 'Combien de mesures joue-t-on au total ?'), ['6', '4', '3', '8'], music=abc('|: C D E F | G4 :| c4 |]', meter='4/4')),
      ask(L('How many bars are played in total?', 'Wie viele Takte werden insgesamt gespielt?', 'Combien de mesures joue-t-on au total ?'), ['8', '4', '6', '10'], music=abc('|: C D E F | G4 :||: A G F E | C4 :|', meter='4/4')),
      ask(L('What does D.S. mean?', 'Was bedeutet D.S.?', 'Que signifie D.S. ?'), [L('Back to the sign 𝄋', 'Zurück zum Zeichen 𝄋', 'Retour au signe 𝄋'), L('Back to the beginning', 'Zurück zum Anfang', 'Retour au début'), L('Jump to the end', 'Zum Ende springen', 'Aller à la fin')]),
      ask(L('A minuet in AABB form has two halves, each repeated. A has 8 bars, B has 8 bars. How many bars do you play?', 'Ein Menuett in der Form AABB hat zwei Hälften mit Wiederholung. A hat 8 Takte, B hat 8 Takte. Wie viele Takte spielst du?', 'Un menuet de forme AABB a deux moitiés reprises. A a 8 mesures, B en a 8. Combien de mesures joues-tu ?'), ['32', '16', '24', '64']),
      ask(L('Second ending: when do you play it?', 'Zweite Klammer: wann spielst du sie?', 'La deuxième fin : quand la joues-tu ?'), [L('The second time through', 'Beim zweiten Durchgang', 'Au deuxième passage'), L('The first time through', 'Beim ersten Durchgang', 'Au premier passage'), L('Both times', 'Beide Male', 'Les deux fois')]),
      ask(L('What is a Coda?', 'Was ist eine Coda?', "Qu'est-ce qu'une coda ?"), [L('A closing section', 'Ein Schlussteil', 'Une section de conclusion'), L('An upbeat', 'Ein Auftakt', 'Une anacrouse'), L('A tempo word', 'Eine Tempoangabe', 'Une indication de tempo')]),
    ],
    library=[(BEETHOVEN_MINUET, L("Beethoven's Minuet WoO 82: find the repeat signs. How is the piece built?", 'Beethovens Menuett WoO 82: Finde die Wiederholungszeichen. Wie ist das Stück aufgebaut?', 'Le Menuet WoO 82 de Beethoven : trouve les barres de reprise. Comment le morceau est-il construit ?')),
             (MINUET_A_MINOR, L('Minuet in A minor (Bach notebook): how many bars in each half? Write down the full play order.', 'Menuett in a-Moll (Notenbüchlein): Wie viele Takte hat jede Hälfte? Schreib die komplette Spielreihenfolge auf.', 'Menuet en la mineur (Petit livre) : combien de mesures dans chaque moitié ? Écris l’ordre de jeu complet.'))],
    minutes=12),
)

W16 = week(16, L('Reading Real Music – Final Test', 'Echte Musik lesen – Abschlusstest', 'Lire de la vraie musique – test final'),
  lesson(L('Reading a whole piece', 'Ein ganzes Stück lesen', 'Lire un morceau entier'),
    L('Everything comes together: read the Minuet in G from top to bottom - clef, key, time, notes, rhythm, signs and road map.',
      'Alles kommt zusammen: Lies das Menuett in G von Anfang bis Ende – Schlüssel, Tonart, Takt, Noten, Rhythmus, Zeichen und Spielweg.',
      "Tout se rassemble : lis le Menuet en sol du début à la fin – clé, tonalité, mesure, notes, rythme, signes et parcours."),
    [
      staff(L('Minuet in G, BWV Anh. 114 (first half)', 'Menuett in G, BWV Anh. 114 (erster Teil)', 'Menuet en sol, BWV Anh. 114 (première partie)'),
        abc('|: ' + MINUET.replace('A6 |]', 'A6 |') + ' d2 GABc | d2 G2 G2 | e2 cdef | g2 G2 G2 | c2 dcBA | B2 cBAG | A2 BAGF | G6 :|', meter='3/4', unit='1/8', key='G'), scale=1.7, measures=8,
        text=L('Read it in five passes: 1. clef, key and time · 2. rhythm · 3. note names · 4. road map · 5. sing or play it.',
               'Lies in fünf Durchgängen: 1. Schlüssel, Tonart, Takt · 2. Rhythmus · 3. Notennamen · 4. Spielweg · 5. singen oder spielen.',
               'Lis-le en cinq passages : 1. clé, tonalité, mesure · 2. rythme · 3. noms des notes · 4. parcours · 5. chante-le ou joue-le.')),
      bullets(L('What you can now see in it', 'Was du jetzt darin erkennst', 'Ce que tu y vois maintenant'),
        L('Treble clef, one sharp: G major; 3/4 - a dance', 'Violinschlüssel, ein Kreuz: G-Dur; 3/4 – ein Tanz', 'Clé de sol, un dièse : sol majeur ; 3/4 – une danse'),
        L('Quarter notes and groups of eighths; a dotted half note at bar 8', 'Viertel und Achtelgruppen; eine punktierte Halbe in Takt 8', 'Noires et groupes de croches ; une blanche pointée en mesure 8'),
        L('Steps and skips; bar 1 leaps down a fifth, from {n:D5} to {n:G4}', 'Schritte und Sprünge; Takt 1 springt eine Quinte abwärts, von {n:D5} zu {n:G4}', 'Degrés conjoints et sauts ; la mesure 1 descend d’une quinte, de {n:D5} à {n:G4}'),
        L('A repeated first half - the road map of a dance', 'Ein wiederholter erster Teil – der Spielweg eines Tanzes', 'Une première partie reprise – le parcours d’une danse')),
    ],
    quiz=[
      ask(L('Which key is this minuet in?', 'In welcher Tonart steht dieses Menuett?', 'Dans quelle tonalité est ce menuet ?'), [lambda lang: key_name('G', lang), lambda lang: key_name('C', lang), lambda lang: key_name('F', lang)], music=abc(MINUET, meter='3/4', unit='1/8', key='G')),
      ask(L('What is the interval from the first to the second note?', 'Welches Intervall liegt zwischen der ersten und zweiten Note?', 'Quel intervalle sépare la 1re et la 2e note ?'), [iv(5), iv(4), iv(3), iv(6)], music=abc('d2 GABc |]', meter='3/4', unit='1/8', key='G')),
      ask(L('How many beats does the last note of bar 8 last?', 'Wie viele Schläge dauert die Note in Takt 8?', 'Combien de temps dure la note de la mesure 8 ?'), ['3', '2', '6', '1']),
    ],
    library=[(MINUET_G, L('Now read the complete Minuet in G in the Library, both halves. Mark the repeat signs and name every note of the second half.', 'Lies jetzt das ganze Menuett in G in der Bibliothek, beide Teile. Markiere die Wiederholungszeichen und benenne jede Note des zweiten Teils.', 'Lis maintenant le Menuet en sol complet dans la Bibliothèque, les deux parties. Repère les barres de reprise et nomme chaque note de la seconde partie.'))]),
  lesson(L('Your reading repertoire', 'Dein Lese-Repertoire', 'Ton répertoire de lecture'),
    L('Choose pieces from the Library and keep reading every day. Here is a graded list for the weeks after this course.',
      'Wähle Stücke aus der Bibliothek und lies jeden Tag weiter. Hier ist eine gestufte Liste für die Wochen nach diesem Kurs.',
      "Choisis des pièces dans la Bibliothèque et continue à lire chaque jour. Voici une liste progressive pour les semaines qui suivent ce cours."),
    [
      bullets(L('A reading plan', 'Ein Leseplan', 'Un plan de lecture'),
        L('Easy: Mozart\'s Minuet KV 2, Bach\'s Musette and Air from the Notebook', 'Leicht: Mozarts Menuett KV 2, Bachs Musette und Air aus dem Notenbüchlein', 'Facile : le Menuet KV 2 de Mozart, la Musette et l’Air du Petit livre de Bach'),
        L('Next: Schumann\'s Melody, Soldier\'s March and Little Piece (Op. 68)', 'Danach: Schumanns Melodie, Soldatenmarsch und Stückchen (op. 68)', 'Ensuite : Mélodie, Marche militaire et Petite pièce de Schumann (op. 68)'),
        L('Then: Bach\'s Little Prelude in C, Clementi\'s Sonatina Op. 36', 'Dann: Bachs Kleines Präludium in C, Clementis Sonatine op. 36', 'Puis : le Petit prélude en do de Bach, la Sonatine op. 36 de Clementi'),
        L('Ten minutes a day beats one hour a week', 'Zehn Minuten täglich sind besser als eine Stunde pro Woche', 'Dix minutes par jour valent mieux qu’une heure par semaine'),
        L('Next: Solfège 2 - keys, minor scales, intervals and chords', 'Weiter geht es mit Solfège 2 – Tonarten, Moll, Intervalle und Akkorde', 'La suite : Solfège 2 – tonalités, gammes mineures, intervalles et accords')),
    ],
    quiz=[
      ask(L('What is the best way to improve your reading?', 'Wie verbesserst du dein Notenlesen am besten?', 'Quelle est la meilleure façon de progresser en lecture ?'), [L('A little every day', 'Jeden Tag ein bisschen', 'Un peu chaque jour'), L('Once a month for a long time', 'Einmal im Monat sehr lange', 'Une fois par mois, longtemps'), L('Only by listening', 'Nur durch Zuhören', 'Seulement en écoutant')]),
    ],
    library=[(MOZART_KV2, L('Mozart, Minuet KV 2 - read the right hand, then the left hand in the bass clef.', 'Mozart, Menuett KV 2 – lies die rechte Hand, dann die linke im Bassschlüssel.', 'Mozart, Menuet KV 2 – lis la main droite, puis la main gauche en clé de fa.')),
             (AIR, L('Bach, Air BWV Anh. 131 - a slow piece to read slowly.', 'Bach, Air BWV Anh. 131 – ein langsames Stück zum langsamen Lesen.', 'Bach, Air BWV Anh. 131 – une pièce lente à lire lentement.')),
             (MARCH_SCHUMANN, L('Schumann, Soldier\'s March - find the staccato dots and the repeats.', 'Schumann, Soldatenmarsch – finde die Staccato-Punkte und die Wiederholungen.', 'Schumann, Marche militaire – trouve les points de staccato et les reprises.')),
             (PIECE, L('Schumann, Little Piece - which time signature?', 'Schumann, Stückchen – welche Taktart?', 'Schumann, Petite pièce – quelle mesure ?')),
             (PRELUDE_C, L('Bach, Little Prelude in C - broken chords in the right hand: name the notes of the first bar.', 'Bach, Kleines Präludium in C – gebrochene Akkorde in der rechten Hand: Benenne die Noten des ersten Takts.', 'Bach, Petit prélude en do – accords brisés à la main droite : nomme les notes de la première mesure.')),
             (CLEMENTI, L('Clementi, Sonatina Op. 36 - your first sonatina: tempo word, key and time signature?', 'Clementi, Sonatine op. 36 – deine erste Sonatine: Tempo, Tonart und Taktart?', 'Clementi, Sonatine op. 36 – ta première sonatine : tempo, tonalité et mesure ?'))]),
  lesson(L('Final test', 'Abschlusstest', 'Test final'),
    L('The final test of Solfège 1: twenty questions on everything you have learned in four months. Good luck!',
      'Der Abschlusstest von Solfège 1: zwanzig Fragen zu allem, was du in vier Monaten gelernt hast. Viel Erfolg!',
      "Le test final de Solfège 1 : vingt questions sur tout ce que tu as appris en quatre mois. Bonne chance !"),
    [
      bullets(L('Solfège 1 - what you can do now', 'Solfège 1 – was du jetzt kannst', 'Solfège 1 – ce que tu sais faire maintenant'),
        L('Read notes in the treble and bass clefs, with ledger lines', 'Noten im Violin- und Bassschlüssel lesen, mit Hilfslinien', 'Lire les notes en clé de sol et en clé de fa, avec lignes supplémentaires'),
        L('Count rhythms with whole to eighth notes, dots, ties and rests', 'Rhythmen mit ganzen bis Achtelnoten, Punkten, Haltebögen und Pausen zählen', 'Compter des rythmes de la ronde à la croche, avec points, liaisons et silences'),
        L('Read sharps, flats, naturals and simple key signatures', 'Kreuz, b, Auflösungszeichen und einfache Vorzeichen lesen', 'Lire dièses, bémols, bécarres et armures simples'),
        L('Name intervals and understand the major scale', 'Intervalle bestimmen und die Dur-Tonleiter verstehen', 'Nommer les intervalles et comprendre la gamme majeure'),
        L('Follow dynamics, tempo, articulation and repeats', 'Dynamik, Tempo, Artikulation und Wiederholungen befolgen', 'Suivre nuances, tempo, articulations et reprises'),
        summary=True),
    ],
    quiz=[q_note('A4'), q_note('F5'), q_note('C4'), q_bass('G2'), q_bass('E3'), q_bass('C4'),
          q_note('F#4', distractors=['F4', 'Gb4', 'G4']), q_note('Bb4', distractors=['B4', 'A#4', 'A4']),
          beats_question('c3/ c/ c2', 4, [3, 5, 2]), beats_question('c/c/ c3', 4, [3, 5, 6]), beats_question('z/ c/ c c', 3, [2, 4, 5]),
          q_size('C4', 'A4'), q_size('E4', 'B4', harmonic=True), q_size('D5', 'E5'),
          ask(L('Which major key has one flat?', 'Welche Durtonart hat ein b?', 'Quelle tonalité majeure a un bémol ?'), [lambda lang: key_name('F', lang), lambda lang: key_name('G', lang), lambda lang: key_name('C', lang), lambda lang: key_name('Bb', lang)]),
          ask(L('Which time signature fits this bar?', 'Welche Taktangabe passt zu diesem Takt?', 'Quel chiffrage convient à cette mesure ?'), ['3/4', '2/4', '4/4'], music=abc('c3/ c/ c |]')),
          ask(L('What does "mf" mean?', 'Was bedeutet „mf“?', 'Que signifie « mf » ?'), [L('moderately loud', 'mittellaut', 'moyennement fort'), L('very soft', 'sehr leise', 'très doux'), L('very loud', 'sehr laut', 'très fort'), L('moderately fast', 'mäßig schnell', 'modérément rapide')]),
          ask(L('In which order are the bars played?', 'In welcher Reihenfolge werden die Takte gespielt?', 'Dans quel ordre joue-t-on les mesures ?'), ['1-2-1-3', '1-2-3', '1-2-1-2-3', '1-3'], music=abc('|: "_1"E F G A |1 "_2"G4 :|2 "_3"c4 |]', meter='4/4')),
          ask(L('In German the note a semitone below H is called ...', 'Der Ton einen Halbton unter H heißt ...', 'En allemand, la note un demi-ton sous H (si) s’appelle ...'), ['B', 'Hes', 'As', 'A']),
          ask(L('How many semitones are in a whole tone?', 'Wie viele Halbtöne hat ein Ganzton?', 'Combien de demi-tons dans un ton ?'), ['2', '1', '3', '12'])],
    minutes=20, xp=50),
)

# The three-language source; this module itself is the English edition.
SOURCE = (COURSE, FOOTER, [W1, W2, W3, W4, W5, W6, W7, W8, W9, W10, W11, W12, W13, W14, W15, W16])
globals().update(build(*SOURCE, 'en'))

