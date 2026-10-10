# Fanny Hensel (geb. Mendelssohn) - deutsche Fassung von fanny.py.
COURSE = {
    'slug': 'fanny-hensel-leben-und-werk-einfuehrung',
    'language': 'de',
    'translationOf': 'fanny-hensel-life-and-music-introduction',
    'title': 'Fanny Hensel: Leben und Werk – Eine erste Einführung',
    'shortSummary': 'Vier Wochen mit Fanny Mendelssohn Hensel: eine glänzende Komponistin und Pianistin, die über 450 Werke schrieb, den besten Musiksalon Berlins führte – und erst mit 40 unter eigenem Namen veröffentlichte.',
    'description': (
        "Fanny Hensel (1805–1847), geborene Fanny Mendelssohn, war ebenso begabt wie ihr berühmter Bruder Felix – und durfte die Musik doch "
        "fast ihr ganzes Leben lang nicht zum Beruf machen. Trotzdem komponierte sie mehr als 450 Werke: Lieder, Klavierstücke, Kammermusik, Chor- und Orchesterwerke.\n\n"
        "In vier Wochen folgst du ihrem Leben Schritt für Schritt:\n"
        "- Woche 1 – Eine Berliner Kindheit in einer Familie voller Talente (1805–1820)\n"
        "- Woche 2 – „Nur Zierde“? Lieder unter dem Namen des Bruders (1820–1829)\n"
        "- Woche 3 – Sonntagsmusiken und Italien (1829–1840)\n"
        "- Woche 4 – „Das Jahr“ und endlich der eigene Name (1841–1847)\n\n"
        "Jede Woche verbindet illustrierte Folien, Videos (Oxford University Press, Duke University, WDR Sinfonieorchester), interaktive Noten "
        "ihrer Lieder aus der mymusic.coach-Bibliothek und ein kurzes Quiz. Vorkenntnisse sind nicht nötig. Plane etwa 1–2 Stunden pro Woche ein."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Voice'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'fanny_portrait', 'title': 'Fanny Hensel', 'subtitle': 'Leben und Werk – Eine erste Einführung', 'tag': '4-Wochen-Kurs'},
}
FOOTER = 'Fanny Hensel: Leben und Werk'
PORTRAIT = {'image': 'fanny_portrait', 'credit': 'Porträt von Moritz Daniel Oppenheim, 1842 (gemeinfrei)'}
YOUNG = {'image': 'fanny_young', 'credit': 'Zeichnung von Wilhelm Hensel, ihrem späteren Ehemann, 1829 (gemeinfrei)'}

WEEKS = [
  {
    'title': 'Woche 1 – Eine Berliner Kindheit in einer Familie voller Talente (1805–1820)',
    'lessons': [
      {
        'title': 'Willkommen: Fanny Hensel', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Willkommen im Kurs! Lerne Fanny Hensel kennen – eine der begabtesten Komponistinnen des 19. Jahrhunderts – und sieh, wie die nächsten vier Wochen ablaufen.\n\nTipp: Ihre Lieder findest du in der mymusic.coach-Bibliothek als interaktive Noten – lies mit, markiere deine Lieblingsstücke und sammle zusätzliche XP, wenn du sie bis zum Ende liest.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 1', 'title': 'Fanny Hensel', 'subtitle': 'Eine erste Einführung in ihr Leben und ihre Musik', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Warum Fanny Hensel?', 'bullets': [
              'Geboren 1805 in Hamburg als Fanny Mendelssohn – gestorben 1847 in Berlin',
              'Pianistin und Komponistin, ebenso begabt wie ihr Bruder Felix',
              'Mehr als 450 Werke: Lieder, Klaviermusik, Kammermusik, Chor- und Orchesterwerke',
              'Fast ihr ganzes Leben lang erlaubte ihr die Familie nicht zu veröffentlichen',
              'Erst in den letzten Jahrzehnten wurde vieles von ihr gedruckt, gespielt und aufgenommen']},
          {'kind': 'timeline', 'title': 'Deine vier Wochen', 'rows': [
              ('Woche 1', 'Eine Berliner Kindheit in einer Familie voller Talente'),
              ('Woche 2', '„Nur Zierde“? Lieder unter dem Namen des Bruders'),
              ('Woche 3', 'Sonntagsmusiken und Italien'),
              ('Woche 4', '„Das Jahr“ – und endlich der eigene Name')]},
          {'kind': 'bullets', 'title': 'Komponistin im 19. Jahrhundert', 'bullets': [
              'Frauen aus wohlhabenden Familien lernten Musik – als gesellschaftliche Zierde, nicht als Beruf',
              'Öffentlich aufzutreten oder Musik zu veröffentlichen galt für eine Dame als unschicklich',
              'Viele Frauen komponierten trotzdem – oft im Privaten, in Salons oder unter fremdem Namen',
              'In diesem Kurs lernst du eine Frau kennen, die zwischen diesen Regeln ihren eigenen Weg fand']},
        ],
      },
      {
        'title': 'Eine Familie voller Talente', 'type': 'SLIDES', 'minutes': 15,
        'description': "Die Mendelssohns waren eine der bemerkenswertesten Familien Europas. Fanny wuchs umgeben von Ideen, Kunst – und Musik auf.",
        'slides': [
          {'kind': 'bullets', 'title': 'Hamburg, 14. November 1805', 'bullets': [
              'Fanny war das älteste von vier Kindern des Bankiers Abraham Mendelssohn und Lea Salomon',
              'Ihr Großvater war der berühmte Philosoph Moses Mendelssohn',
              'Ihre Mutter soll bei der Geburt bemerkt haben, das Kind habe „Bachsche Fugenfinger“',
              '1811 zog die Familie nach Berlin']},
          {'kind': 'bullets', 'title': 'Fanny und Felix', 'bullets': [
              'Felix, geboren 1809, war ihr ganzes Leben lang ihr engster Vertrauter',
              'Sie hatten dieselben Lehrer: Ludwig Berger für Klavier, Carl Friedrich Zelter für Komposition',
              'Sie zeigten einander jedes neue Stück und holten sich gegenseitig Rat',
              'Beide liebten Bach – selten in einer Zeit, in der seine Musik kaum gespielt wurde']},
          {'kind': 'timeline', 'title': 'Eine außergewöhnliche Begabung', 'rows': [
              ('1811', 'Die Familie lässt sich in Berlin nieder'),
              ('1816', 'Klavierunterricht in Paris während eines Familienaufenthalts'),
              ('1818', 'Mit 13 spielt sie ihrem Vater alle 24 Präludien aus Bachs Wohltemperiertem Klavier, Teil 1, auswendig vor'),
              ('1819', 'Ihr erstes Lied: zum Geburtstag ihres Vaters')]},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Geboren am 14. November 1805 in Hamburg, als ältestes von vier Kindern',
              'Großvater: der Philosoph Moses Mendelssohn',
              'Dieselbe Ausbildung wie Felix – bei Berger und Zelter',
              'Mit 13 spielte sie Teil 1 von Bachs Wohltemperiertem Klavier auswendig']},
        ],
      },
      {
        'title': 'Video: Wer war Fanny Mendelssohn?', 'type': 'YOUTUBE', 'minutes': 3, 'video': 'https://www.youtube.com/watch?v=wS1GqLt1k3o',
        'description': "Eine kurze Einführung von R. Larry Todd, Autor der großen Biografie „Fanny Hensel: The Other Mendelssohn“ (Oxford University Press). Das Video ist auf Englisch – schalte bei Bedarf die automatischen Untertitel von YouTube ein.\n\nDenk beim Anschauen darüber nach:\n1. Warum wird sie oft „die andere Mendelssohn“ genannt?\n2. Warum blieb wohl so viel ihrer Musik so lange unveröffentlicht?\n\nDie nächsten Wochen geben dir die Antworten.",
      },
      {
        'title': 'Rückblick Woche 1 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Eine kurze Zusammenfassung, ein erstes Lied zum Lesen und fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 1 auf einen Blick', 'bullets': [
              'Geboren am 14. November 1805 in Hamburg, aufgewachsen in Berlin',
              'Enkelin des Philosophen Moses Mendelssohn',
              'Gemeinsam mit Felix unterrichtet von Ludwig Berger und Carl Friedrich Zelter',
              'Ein Wunderkind am Klavier – besonders bei Bach']},
          {'kind': 'bullets', 'title': 'Diese Woche zum Lesen', 'bullets': [
              '„Schwanenlied“ aus ihrem Opus 1 – ein kurzes Lied nach einem Gedicht von Heinrich Heine',
              'Achte auf die sanft wiegende Klavierbegleitung und wie die Stimme darüber schwebt',
              'Öffne die interaktiven Noten und lies mit']},
        ],
        'library': [('cmuyfx87200h92eonuq99hup5', '„Schwanenlied“, op. 1 – interaktive Noten')],
        'quiz': [
          ('In welcher Stadt wurde Fanny Mendelssohn geboren?', ['Berlin', 'Hamburg', 'Leipzig', 'Frankfurt'], 1),
          ('Wer war ihr berühmter Großvater?', ['Der Komponist Johann Sebastian Bach', 'Der Philosoph Moses Mendelssohn', 'Der Dichter Goethe', 'Der Bankier Rothschild'], 1),
          ('Wer unterrichtete Fanny und Felix in Komposition?', ['Carl Friedrich Zelter', 'Ludwig van Beethoven', 'Antonio Salieri', 'Carl Czerny'], 0),
          ('Was spielte Fanny mit 13 ihrem Vater auswendig vor?', ['Eine Beethoven-Sonate', 'Teil 1 von Bachs Wohltemperiertem Klavier', 'Mozarts Klavierkonzerte', 'Die erste Sinfonie ihres Bruders'], 1),
          ('In welchem Jahr wurde ihr Bruder Felix geboren?', ['1805', '1809', '1811', '1820'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 2 – „Nur Zierde“? Lieder unter dem Namen des Bruders (1820–1829)',
    'lessons': [
      {
        'title': 'Beruf für ihn, Zierde für sie', 'type': 'SLIDES', 'minutes': 15,
        'description': "Fannys Vater machte sehr deutlich, was er von seiner Tochter erwartete. Diese Folien zeigen, wie sie trotzdem weiterkomponierte.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 2', 'title': '„Nur Zierde“?', 'subtitle': '1820 – 1829', **YOUNG},
          {'kind': 'quote', 'quote': 'Die Musik wird für ihn vielleicht Beruf, während sie für dich stets nur Zierde, niemals Grundbass deines Seins und Tuns werden kann und soll.', 'by': 'Abraham Mendelssohn an Fanny, 1820'},
          {'kind': 'bullets', 'title': 'Trotzdem komponieren', 'bullets': [
              'Fanny komponierte weiter: Lieder, Klavierstücke, Kammermusik',
              'Ihre Musik erklang zu Hause und im Freundeskreis – nicht öffentlich',
              'Felix bewunderte ihre Werke – war aber wie der Vater dagegen, dass sie veröffentlichte',
              'Ihre Musik blieb meist als Handschrift erhalten; vieles wurde erst im 20. und 21. Jahrhundert gedruckt']},
          {'kind': 'bullets', 'title': 'Unter Felix’ Namen', 'bullets': [
              '1827 und 1830 veröffentlichte Felix sechs ihrer Lieder in seinen eigenen Sammlungen op. 8 und op. 9',
              'Darunter: „Italien“, „Das Heimweh“ und „Suleika und Hatem“',
              '1842 erzählte Queen Victoria Felix, „Italien“ sei ihr Lieblingslied von ihm, und sang es ihm vor',
              'Felix musste gestehen, dass seine Schwester es geschrieben hatte']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              '1820: Für sie sei Musik „nur Zierde“, schreibt der Vater',
              'Sie komponierte weiter – für Familie, Freunde und den Salon',
              'Sechs ihrer Lieder erschienen unter Felix’ Namen',
              'Queen Victorias liebstes „Mendelssohn“-Lied war von Fanny']},
        ],
      },
      {
        'title': 'Lesen: die Lieder, die Felix veröffentlichte', 'type': 'SLIDES', 'minutes': 12,
        'description': "Lies die drei Lieder von Fanny, die in Felix’ op. 8 erschienen – darunter das, das Queen Victoria so liebte.",
        'slides': [
          {'kind': 'listen', 'title': '„Italien“ – Queen Victorias Lieblingslied', 'work': 'Italien (op. 8 Nr. 3, unter Felix’ Namen erschienen)', 'points': [
              'Ein Gedicht von Franz Grillparzer über die Sehnsucht nach dem sonnigen Süden',
              'Eine helle, lebhafte Klavierstimme, die nie stillsteht',
              'Die Melodie springt nach oben – voller Begeisterung',
              'Öffne die interaktiven Noten in der Bibliothek und folge ihnen']},
          {'kind': 'bullets', 'title': 'Zwei weitere Lieder', 'bullets': [
              '„Das Heimweh“ – still und nach innen gekehrt',
              '„Suleika und Hatem“ – ein Duett nach Gedichten aus Goethes „West-östlichem Divan“',
              'Alle drei zeigen ihre Begabung für Melodien und ihren reichen, einfallsreichen Klaviersatz']},
          {'kind': 'bullets', 'title': 'Was ihre Lieder besonders macht', 'bullets': [
              'Kühne Harmonien – sie liebte überraschende Wendungen',
              'Das Klavier ist gleichberechtigter Partner, wie in Schuberts Liedern',
              'Sie vertonte Gedichte der besten Dichter: Goethe, Heine, Eichendorff']},
        ],
        'library': [('cmuyfx85700h32eonpqao4rwp', '„Italien“ – interaktive Noten'), ('cmuyfx85700h22eonu1tu63fl', '„Das Heimweh“ – interaktive Noten'), ('cmuyfx85800h42eony0mt51hg', '„Suleika und Hatem“ – interaktive Noten')],
      },
      {
        'title': 'Video: ein musikalisches Rätsel gelöst', 'type': 'YOUTUBE', 'minutes': 5, 'video': 'https://www.youtube.com/watch?v=9asDSXTsko0',
        'description': "1828 schrieb Fanny eine große Klaviersonate, die „Ostersonate“. Lange galt sie als verschollen – und als 1970 in Frankreich eine mit „F. Mendelssohn“ signierte Handschrift auftauchte, wurde sie als Werk von Felix veröffentlicht und aufgenommen. 2010 wies die Musikwissenschaftlerin Angela Mace nach, dass sie von Fanny stammt.\n\nDieses kurze Video der Duke University erzählt die Geschichte. Es ist auf Englisch – schalte bei Bedarf die automatischen Untertitel ein.\n\nDenk darüber nach: Wie viele Werke von Frauen stehen wohl noch unter fremdem Namen im Archiv?",
      },
      {
        'title': 'Rückblick Woche 2 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der 1820er-Jahre, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 2 auf einen Blick', 'bullets': [
              '1820: Musik soll für sie „nur Zierde“ sein, sagt der Vater',
              '1827–1830: sechs ihrer Lieder erscheinen unter Felix’ Namen',
              '1828: die „Ostersonate“ – lange Felix zugeschrieben',
              '1842: Queen Victorias liebstes „Mendelssohn“-Lied stammt von Fanny']},
        ],
        'quiz': [
          ('Was sollte Musik laut Fannys Vater für sie sein?', ['Ihr Beruf', 'Nur Zierde', 'Ein Sonntagshobby', 'Verboten'], 1),
          ('Unter wessen Namen erschienen sechs von Fannys Liedern zuerst?', ['Unter dem ihres Vaters', 'Unter dem ihres Bruders Felix', 'Unter Zelters Namen', 'Anonym'], 1),
          ('Welches ihrer Lieder sang Queen Victoria Felix vor?', ['Schwanenlied', 'Italien', 'Gondellied', 'Die Mainacht'], 1),
          ('Wer wies 2010 nach, dass die „Ostersonate“ von Fanny stammt?', ['R. Larry Todd', 'Angela Mace', 'Felix Mendelssohn', 'Clara Schumann'], 1),
          ('Welcher Dichter schrieb den „West-östlichen Divan“?', ['Heine', 'Goethe', 'Schiller', 'Eichendorff'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 3 – Sonntagsmusiken und Italien (1829–1840)',
    'lessons': [
      {
        'title': 'Ehe und Sonntagsmusiken', 'type': 'SLIDES', 'minutes': 15,
        'description': "Die Ehe mit einem Maler, der ihr Schaffen förderte, und eine eigene Bühne im Elternhaus: Die 1830er-Jahre brachten Fanny neue Freiheit.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 3', 'title': 'Sonntagsmusiken und Italien', 'subtitle': '1829 – 1840', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Wilhelm Hensel', 'bullets': [
              '1829 heiratete Fanny den Maler Wilhelm Hensel, Hofmaler in Berlin',
              'Anders als ihr Vater ermutigte er sie zu komponieren – und zu veröffentlichen',
              '1830 wurde ihr Sohn Sebastian geboren',
              'Wilhelm zeichnete sie viele Male']},
          {'kind': 'bullets', 'title': 'Die „Sonntagsmusiken“', 'bullets': [
              'Im Familienhaus Leipziger Straße 3 in Berlin veranstaltete sie regelmäßig Sonntagskonzerte',
              'Sie spielte Klavier, leitete Chor und kleines Orchester – und brachte ihre eigenen Werke zur Aufführung',
              'Zu Gast waren Liszt, Clara Schumann, Gounod und viele führende Köpfe Berlins',
              'Hier hatte sie das Musikleben, das ihr der Konzertsaal verwehrte']},
          {'kind': 'timeline', 'title': 'Werke der 1830er-Jahre', 'rows': [
              ('1831', 'Kantaten für die Sonntagsmusiken'),
              ('um 1832', 'Ouvertüre C-Dur – ihre einzige Orchesterouvertüre'),
              ('1834', 'Streichquartett Es-Dur'),
              ('1839–1840', 'Eine Reise nach Italien mit Wilhelm und Sebastian')]},
        ],
        'library': [('cmuygtiqy00f64kktzy68v92b', 'Streichquartett Es-Dur – interaktive Noten')],
      },
      {
        'title': 'Video: die Ouvertüre C-Dur', 'type': 'YOUTUBE', 'minutes': 12, 'video': 'https://www.youtube.com/watch?v=D-j7qj2r5e0',
        'description': "Fanny Hensels Ouvertüre C-Dur, um 1832 für ihre eigenen Konzerte geschrieben, gespielt vom WDR Sinfonieorchester unter Cristian Măcelaru (ARD Klassik).\n\nAchte auf:\n1. Eine langsame, feierliche Einleitung\n2. Einen lebhaften Hauptteil mit leuchtenden Holzbläsern\n3. Wie souverän sie ein ganzes Orchester einsetzt – obwohl ihr selten eines zur Verfügung stand\n\nDenk darüber nach: Weit über hundert Jahre lang wurde dieses Stück kaum gespielt. Woran könnte das liegen?",
      },
      {
        'title': 'Italien: das glücklichste Jahr', 'type': 'SLIDES', 'minutes': 12,
        'description': "1839/40 verbrachte Fanny ein Jahr in Italien. In Rom wurde sie als Komponistin bewundert wie nie zuvor – später nannte sie es die glücklichste Zeit ihres Lebens.",
        'slides': [
          {'kind': 'bullets', 'title': 'Rom, 1839–1840', 'bullets': [
              'Die Hensels reisten etwa ein Jahr lang durch Italien',
              'In Rom schwärmten junge französische Komponisten der Villa Medici für ihr Spiel',
              'Unter ihnen Charles Gounod, der sich in seinen Erinnerungen daran erinnerte, wie sie ihm Bach und Beethoven nahebrachte',
              'Endlich wurde sie zuerst als Künstlerin wahrgenommen']},
          {'kind': 'listen', 'title': 'Lies ein Lied des Südens', 'work': '„Nach Süden“, op. 10', 'points': [
              'Ein Lied der Sehnsucht nach dem Süden – entstanden nach der Italienreise',
              'Achte auf den schwingenden Rhythmus und die weite, offene Melodie',
              'Vergleiche es mit dem „Gondellied“ aus ihrem Opus 1 – noch einer Erinnerung an Italien',
              'Öffne beide interaktiven Noten in der Bibliothek']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              '1829: Heirat mit dem Maler Wilhelm Hensel',
              'Die Sonntagsmusiken in der Leipziger Straße 3 – ihre eigene Bühne',
              '1839–1840: ein glückliches Jahr in Italien, bewundert von Gounod und anderen']},
        ],
        'library': [('cmuyfx85800h52eonoymq39tg', '„Nach Süden“, op. 10 – interaktive Noten'), ('cmuyfx87800hf2eonpln88msa', '„Gondellied“, op. 1 – interaktive Noten')],
      },
      {
        'title': 'Rückblick Woche 3 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der 1830er-Jahre, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 3 auf einen Blick', 'bullets': [
              '1829: Heirat mit Wilhelm Hensel, der sie ermutigte',
              'Die Sonntagsmusiken – spielen, dirigieren, eigene Werke aufführen',
              'Ouvertüre C-Dur und Streichquartett Es-Dur',
              '1839–1840: Italien, wo Gounod und andere sie bewunderten']},
        ],
        'quiz': [
          ('Welchen Beruf hatte Wilhelm Hensel?', ['Komponist', 'Maler', 'Bankier', 'Dichter'], 1),
          ('Was waren die „Sonntagsmusiken“?', ['Gottesdienste', 'Sonntagskonzerte im Familienhaus', 'Eine Musikzeitschrift', 'Ihr Klavierunterricht'], 1),
          ('Welchen französischen Komponisten inspirierte Fanny in Rom?', ['Debussy', 'Gounod', 'Berlioz', 'Bizet'], 1),
          ('Welches Orchesterwerk schrieb sie um 1832?', ['Eine Sinfonie in D', 'Eine Ouvertüre in C-Dur', 'Ein Violinkonzert', 'Eine Oper'], 1),
          ('Wie beschrieb Fanny später ihr Jahr in Italien?', ['Als schwerste Zeit', 'Als glücklichste Zeit ihres Lebens', 'Als verlorene Zeit', 'Als Arbeitsurlaub'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 4 – „Das Jahr“ und endlich der eigene Name (1841–1847)',
    'lessons': [
      {
        'title': '„Das Jahr“ und die ersten Veröffentlichungen', 'type': 'SLIDES', 'minutes': 15,
        'description': "Von Italien inspiriert, schrieb Fanny ihr ehrgeizigstes Klavierwerk – und mit 40 entschied sie sich endlich, unter eigenem Namen zu veröffentlichen.",
        'slides': [
          {'kind': 'bullets', 'title': '„Das Jahr“, 1841', 'bullets': [
              'Zwölf Charakterstücke, eines für jeden Monat, dazu ein Nachspiel',
              'Jeder Monat steht auf Papier einer anderen Farbe, mit einer Zeichnung von Wilhelm und einem kurzen Gedicht',
              'Choralzitate und Anklänge an Bach erscheinen – zu Ostern, Weihnachten, Neujahr',
              'Einer der originellsten Klavierzyklen des 19. Jahrhunderts – vollständig erst 1989 veröffentlicht']},
          {'kind': 'timeline', 'title': 'Der eigene Name', 'rows': [
              ('1846', 'Gegen den Rat ihres Bruders entschließt sie sich zu veröffentlichen'),
              ('1846', 'Op. 1: Sechs Lieder – gedruckt bei Bote & Bock in Berlin'),
              ('1846–1847', 'Weitere Lieder, Klavierstücke und Chorlieder (die „Gartenlieder“, op. 3)'),
              ('1847', 'Klaviertrio d-Moll, op. 11 – eines ihrer letzten Werke'),
              ('14. Mai 1847', 'Stirbt mit 41 an einem Schlaganfall während einer Probe für eine Sonntagsmusik')]},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              '„Das Jahr“: zwölf Monate in Musik und Bildern',
              '1846: erste Veröffentlichungen unter eigenem Namen – mit 40',
              'Gestorben am 14. Mai 1847; Felix starb sechs Monate später']},
        ],
        'library': [('cmuyfx87700he2eonaax7iup7', '„Morgenständchen“, op. 1 – interaktive Noten'), ('cmuyfx87n00hz2eonpox0xt8f', '„Im Wald“ aus den Gartenliedern, op. 3 – interaktive Noten')],
      },
      {
        'title': 'Hören: die „Ostersonate“', 'type': 'YOUTUBE', 'minutes': 8, 'video': 'https://www.youtube.com/watch?v=R-KSWCt5Pys',
        'description': "Erinnerst du dich an das musikalische Rätsel aus Woche 2? Hier ist das Finale der „Ostersonate“ (1828), gespielt von Isata Kanneh-Mason auf ihrem Album mit Werken von Komponistinnen.\n\nAchte auf:\n1. „Allegro con strepito“ – schnell und lärmend: ein stürmischer, dramatischer Satz\n2. Anklänge an Beethoven, dessen späte Sonaten Fanny gut kannte\n3. Die Musik von Passion und Ostern – vom Aufruhr zum Licht\n\nUnter ihrem eigenen Namen wurde sie erst 2012 öffentlich aufgeführt – 184 Jahre nach ihrer Entstehung.",
      },
      {
        'title': 'Fanny Hensel heute', 'type': 'SLIDES', 'minutes': 12,
        'description': "Wie eine fast vergessene Komponistin zu einer der bekanntesten Frauen der Musikgeschichte wurde.",
        'slides': [
          {'kind': 'bullets', 'title': 'Wiederentdeckung', 'bullets': [
              'Die meisten ihrer Handschriften blieben in der Familie; viele liegen heute in der Staatsbibliothek zu Berlin',
              'Ab den 1980er-Jahren begannen Forschung und Interpreten, ihre Musik zu veröffentlichen und aufzunehmen',
              '2017 feierte Google ihren 212. Geburtstag mit einem weltweit gezeigten Doodle',
              'Ihre Lieder, das Klaviertrio und „Das Jahr“ werden heute regelmäßig aufgeführt']},
          {'kind': 'bullets', 'title': 'Warum sie wichtig ist', 'bullets': [
              'Eine Komponistin von echter Originalität – nicht „die Schwester von Felix“',
              'Ihre Geschichte zeigt, wie Talent ausgebremst werden kann – und wie es trotzdem seinen Weg findet',
              'Im Salon schuf sie sich ein eigenes Musikleben',
              'Heute werden viele weitere Komponistinnen wiederentdeckt – Clara Schumann, Cécile Chaminade und andere']},
          {'kind': 'summary', 'title': 'Wie es weitergeht', 'bullets': [
              'Entdecke mehr als 30 ihrer Lieder in der mymusic.coach-Bibliothek',
              'Weiter mit „Felix Mendelssohn“ und „Clara Schumann“',
              'Sängerinnen, Sänger und Pianisten: Frag deine Lehrkraft nach „Schwanenlied“ oder „Italien“']},
        ],
      },
      {
        'title': 'Abschluss: Rückblick und Quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Herzlichen Glückwunsch – du bist am Ende des Kurses angekommen! Ein letzter Rückblick und ein Abschlussquiz über alle vier Wochen.",
        'slides': [
          {'kind': 'timeline', 'title': 'Fanny Hensels Leben auf einen Blick', 'rows': [
              ('1805', 'Geboren am 14. November in Hamburg'),
              ('1820', 'Musik „nur Zierde“, schreibt ihr Vater'),
              ('1829', 'Heirat mit dem Maler Wilhelm Hensel'),
              ('1831', 'Sonntagsmusiken in der Leipziger Straße 3'),
              ('1839–1840', 'Ein Jahr in Italien'),
              ('1846', 'Erste Veröffentlichungen unter eigenem Namen'),
              ('1847', 'Gestorben am 14. Mai in Berlin')]},
        ],
        'quiz': [
          ('Wie viele Werke komponierte Fanny Hensel ungefähr?', ['Etwa 40', 'Etwa 150', 'Mehr als 450', 'Genau 12'], 2),
          ('Was ist „Das Jahr“?', ['Eine Oper', 'Ein Zyklus von Klavierstücken für die zwölf Monate', 'Ein Liederzyklus von Felix', 'Ein Tagebuch'], 1),
          ('Wie alt war Fanny, als sie zum ersten Mal unter eigenem Namen veröffentlichte?', ['18', '25', 'Etwa 40', 'Nie'], 2),
          ('Wer ermutigte sie zu veröffentlichen?', ['Ihr Vater', 'Ihr Mann Wilhelm', 'Zelter', 'Queen Victoria'], 1),
          ('Wie starb Fanny Hensel?', ['Bei einem Kutschenunfall', 'An einem Schlaganfall während einer Probe', 'An Cholera auf einer Reise', 'Im hohen Alter'], 1),
          ('Welcher Verlag druckte 1846 ihr op. 1?', ['Breitkopf & Härtel', 'Bote & Bock', 'Schott', 'Peters'], 1),
        ],
      },
    ],
  },
]
