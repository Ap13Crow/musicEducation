# Claude Debussy - deutsche Fassung von debussy.py.
COURSE = {
    'slug': 'debussy-leben-und-werk-einfuehrung',
    'language': 'de',
    'translationOf': 'debussy-life-and-music-introduction',
    'title': 'Claude Debussy: Leben und Werk – Eine erste Einführung',
    'shortSummary': 'Vier Wochen mit Claude Debussy: der Rebell des Pariser Conservatoire, der der modernen Musik die Tür öffnete – Clair de lune, der Faun, Pelléas, La Mer und die Préludes.',
    'description': (
        "Claude Debussy (1862–1918) brach die Harmonieregeln, die man ihn lehrte, hörte javanischem Gamelan zu und betrachtete japanische Holzschnitte – und schrieb Musik "
        "aus Licht, Wasser und Luft. Viele Musiker sagen: Mit ihm beginnt die moderne Musik.\n\n"
        "In vier Wochen folgst du seinem Leben Schritt für Schritt:\n"
        "- Woche 1 – Ein Rebell am Conservatoire (1862–1887)\n"
        "- Woche 2 – Neue Klänge: Gamelan, Dichter und ein Faun (1887–1898)\n"
        "- Woche 3 – Pelléas, La Mer und ein Skandal (1899–1908)\n"
        "- Woche 4 – Préludes, Krieg und die letzten Jahre (1909–1918)\n\n"
        "Jede Woche verbindet illustrierte Folien, eine Dokumentation und Aufführungen (Deutsche Grammophon, Berliner Philharmoniker, hr-Sinfonieorchester), "
        "Noten und Lieder aus der mymusic.coach-Bibliothek, eine Harfenplatte von 1920 und ein kurzes Quiz. Vorkenntnisse sind nicht nötig. "
        "Plane etwa 1–2 Stunden pro Woche ein."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Flute', 'Voice'],
    'musicStyles': ['Impressionist', 'Modern'],
    'cover': {'image': 'debussy_portrait', 'title': 'Debussy', 'subtitle': 'Leben und Werk – Eine erste Einführung', 'tag': '4-Wochen-Kurs'},
}
FOOTER = 'Claude Debussy: Leben und Werk'
PORTRAIT = {'image': 'debussy_portrait', 'credit': 'Fotografie von Nadar, um 1908 (gemeinfrei)'}
YOUNG = {'image': 'debussy_young', 'credit': 'Marcel Baschet, Claude Debussy, 1884 (Musée d’Orsay, gemeinfrei)'}
ARABESQUE_78 = 'cmv2j11e700ow12ifhlp61i9g'

WEEKS = [
  {
    'title': 'Woche 1 – Ein Rebell am Conservatoire (1862–1887)',
    'lessons': [
      {
        'title': 'Willkommen: Claude Debussy', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Willkommen im Kurs! Lerne Claude Debussy kennen – und sieh, wie die nächsten vier Wochen ablaufen.\n\nTipp: Alle Musik, die im Kurs vorkommt, ist in den Lektionen verlinkt. Öffne Noten und Lieder in der Bibliothek und sammle zusätzliche XP, wenn du bis zum Ende liest oder hörst.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 1', 'title': 'Claude Debussy', 'subtitle': 'Eine erste Einführung in sein Leben und seine Musik', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Warum Debussy?', 'bullets': [
              'Geboren 1862 bei Paris – gestorben 1918 in Paris',
              'Er befreite die Harmonik von den alten Regeln: Akkorde wegen ihrer Farbe, nicht wegen ihrer Funktion',
              '„Clair de lune“, „Prélude à l’après-midi d’un faune“, „La Mer“, die Préludes',
              'Eine Oper: „Pelléas et Mélisande“',
              'Ravel, Strawinsky, Jazzpianisten und Filmkomponisten lernten alle von ihm']},
          {'kind': 'timeline', 'title': 'Deine vier Wochen', 'rows': [
              ('Woche 1', 'Ein Rebell am Conservatoire'),
              ('Woche 2', 'Neue Klänge: Gamelan, Dichter und ein Faun'),
              ('Woche 3', 'Pelléas, La Mer und ein Skandal'),
              ('Woche 4', 'Préludes, Krieg und die letzten Jahre')]},
          {'kind': 'bullets', 'title': '„Impressionist“?', 'bullets': [
              'Kritiker nannten seine Musik „impressionistisch“, wie die Bilder Monets',
              'Debussy mochte das Etikett nicht – er fühlte sich den symbolistischen Dichtern näher',
              'Seine Musik deutet an, statt auszusprechen: Nebel, Spiegelungen, Mondlicht',
              'Hör auf Farbe, Stimmung und Stille ebenso wie auf die Melodie']},
        ],
      },
      {
        'title': 'Vom Porzellanladen ans Conservatoire', 'type': 'SLIDES', 'minutes': 15,
        'description': "Debussy stammte aus einer armen Familie ohne musikalische Tradition. Eine zufällige Begegnung machte ihn zum Pianisten.",
        'slides': [
          {'kind': 'bullets', 'title': 'Saint-Germain-en-Laye, 22. August 1862', 'bullets': [
              'Achille-Claude Debussy wurde westlich von Paris geboren, wo seine Eltern einen Porzellanladen hatten',
              'Der Laden ging pleite; die Familie zog nach Paris und war oft arm',
              'Er ging nie zur Schule – seine Mutter unterrichtete ihn zu Hause',
              '1870 nahm ihn eine Tante mit nach Cannes, wo er seine ersten Klavierstunden bekam']},
          {'kind': 'bullets', 'title': 'Madame Mauté', 'bullets': [
              'Zurück in Paris bemerkte Antoinette Mauté de Fleurville sein Talent und unterrichtete ihn umsonst',
              'Sie sagte, sie habe bei Chopin studiert – Debussy glaubte es sein Leben lang',
              'Sie war die Schwiegermutter des Dichters Paul Verlaine, dessen Gedichte er später vertonte',
              '1872, mit zehn Jahren, wurde er am Pariser Conservatoire aufgenommen']},
          {'kind': 'bullets', 'title': 'Elf Jahre am Conservatoire', 'bullets': [
              'Er war ein glänzender, aber unberechenbarer Pianist',
              'In der Harmonielehre spielte er seltsame Akkorde, die gegen die Regeln verstießen – und liebte sie',
              'Auf die Frage eines Lehrers, welcher Regel er folge, soll er geantwortet haben: „Meinem Vergnügen!“',
              'Ferienjobs: Ab 1880 reiste er als Hauspianist von Nadeschda von Meck, Tschaikowskys Gönnerin – nach Italien, in die Schweiz und nach Russland']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Geboren am 22. August 1862 in Saint-Germain-en-Laye',
              'Keine Schule – aber kostenloser Klavierunterricht bei Madame Mauté',
              'Ab 1872, mit zehn, am Pariser Conservatoire',
              'Ein Rebell in der Harmonielehre']},
        ],
      },
      {
        'title': 'Video: Debussy – sein Leben und seine Orte', 'type': 'YOUTUBE', 'minutes': 21, 'video': 'https://www.youtube.com/watch?v=562b30X5Kuo',
        'description': "Diese Dokumentation von opera-inside folgt Debussy durch Paris, Rom und die Orte seines Lebens, die ganze Zeit begleitet von seiner Musik. Das Video ist auf Englisch – schalte bei Bedarf die automatischen Untertitel von YouTube ein.\n\nAchte beim Anschauen auf Folgendes:\n1. Welcher Preis führte Debussy nach Rom – und gefiel es ihm dort?\n2. Welche Musik aus Asien beeindruckte ihn bei der Weltausstellung 1889?\n3. Wer war „Chouchou“?\n\nAlles kommt in den nächsten Wochen wieder.",
      },
      {
        'title': 'Der Prix de Rome – und Quiz zu Woche 1', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "1884 gewann Debussy Frankreichs wichtigsten Preis für junge Komponisten. Wohin er ihn führte, gefiel ihm gar nicht.",
        'slides': [
          {'kind': 'title', 'week': '1884', 'title': 'Der Prix de Rome', 'subtitle': 'Debussy mit 22', **YOUNG},
          {'kind': 'bullets', 'title': 'Rom, 1885–1887', 'bullets': [
              '1884 gewann er den Prix de Rome mit der Kantate „L’enfant prodigue“ (Der verlorene Sohn)',
              'Der Preis bedeutete einen mehrjährigen Aufenthalt in der Villa Medici in Rom',
              'Debussy fühlte sich einsam, hatte Heimweh nach Paris und mochte den offiziellen Stil nicht',
              'Er reiste 1887 früher als geplant ab – dieses Porträt malte ein Mitpreisträger, Marcel Baschet']},
          {'kind': 'summary', 'title': 'Woche 1 auf einen Blick', 'bullets': [
              'Geboren 1862; eine arme Familie; keine Schule',
              'Mit zehn am Conservatoire – ein Rebell der Harmonielehre',
              'Hauspianist bei Tschaikowskys Gönnerin Nadeschda von Meck',
              '1884: Prix de Rome; eine unglückliche Zeit in Rom']},
        ],
        'quiz': [
          ('Wo wurde Debussy geboren?', ['In Paris', 'In Saint-Germain-en-Laye', 'In Rom', 'In Cannes'], 1),
          ('Mit wie vielen Jahren kam Debussy ans Pariser Conservatoire?', ['Mit sechs', 'Mit zehn', 'Mit sechzehn', 'Mit zwanzig'], 1),
          ('Wessen Gönnerin beschäftigte Debussy als Hauspianisten?', ['Wagners', 'Tschaikowskys', 'Chopins', 'Liszts'], 1),
          ('Welchen Preis gewann Debussy 1884?', ['Den Nobelpreis', 'Den Prix de Rome', 'Die Ehrenlegion', 'Den Chopin-Preis'], 1),
          ('Welches Etikett gaben Kritiker seiner Musik – das er nicht mochte?', ['Romantisch', 'Impressionistisch', 'Barock', 'Minimalistisch'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 2 – Neue Klänge: Gamelan, Dichter und ein Faun (1887–1898)',
    'lessons': [
      {
        'title': 'Gamelan, Wagner und die Dichter', 'type': 'SLIDES', 'minutes': 15,
        'description': "Zurück in Paris suchte Debussy seine eigene Stimme. Drei Entdeckungen halfen ihm, sie zu finden.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 2', 'title': 'Gamelan, Dichter und ein Faun', 'subtitle': '1887 – 1898', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Drei Entdeckungen', 'bullets': [
              'Wagner: 1888 und 1889 fuhr er nach Bayreuth – fasziniert und dann entschlossen, ihn nicht zu kopieren',
              'Gamelan: Bei der Weltausstellung 1889 in Paris hörte er javanische Musiker – Glocken, Gongs, neue Tonleitern und Rhythmen',
              'Dichtung: Er besuchte die Dienstagsabende des Dichters Stéphane Mallarmé und der Symbolisten',
              'Malerei: Er liebte Whistler, Turner und japanische Holzschnitte']},
          {'kind': 'bullets', 'title': 'Debussys musikalischer Werkzeugkasten', 'bullets': [
              'Ganztonleitern – kein Grundton, ein schwebender Klang',
              'Pentatonik – fünf Töne, wie die schwarzen Tasten des Klaviers',
              'Akkorde, die parallel verschoben werden, wie Farbblöcke',
              'Alte Kirchentonarten – ein uralter, offener Klang']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Bayreuth 1888–1889: Wagner fasziniert ihn – und er beschließt, seinen eigenen Weg zu gehen',
              '1889: javanisches Gamelan auf der Pariser Weltausstellung',
              'Mallarmé und die symbolistischen Dichter',
              'Neue Tonleitern und Akkorde als Farben']},
        ],
      },
      {
        'title': 'Hören: die Erste Arabeske', 'type': 'AUDIO', 'minutes': 6, 'libraryAudio': [ARABESQUE_78, 0],
        'description': "Die beiden Arabesken für Klavier (erschienen 1891) sind frühe Werke – noch nah an der Salonmusik der Zeit, aber schon voller fließender Linien Debussys. Eine Arabeske ist eine verschnörkelte, geschwungene Verzierung.\n\nHier die Erste Arabeske in einer Bearbeitung für Harfe – deren Klang perfekt zu ihr passt –, gespielt von Ada Sassoli auf einer Schellackplatte von 1920.\n\nAchte auf:\n1. Perlende Triolen, die wie Wasser fließen\n2. Eine Melodie, die sich auf und ab schwingt – eine „Arabeske“\n3. Einen ruhigeren, verspielteren Mittelteil\n\nLies danach die Klaviernoten beider Arabesken in der Bibliothek.",
        'library': [(ARABESQUE_78, 'Erste Arabeske – Ada Sassoli, Harfe, 1920'), ('cmuygw9li01zy4kktpwxlhkx9', 'Erste Arabeske – Noten'), ('cmuygw9li01zz4kktni8kqj43', 'Zweite Arabeske – Noten')],
      },
      {
        'title': 'Video: Prélude à l’après-midi d’un faune', 'type': 'YOUTUBE', 'minutes': 10, 'video': 'https://www.youtube.com/watch?v=tjEdr3MuXTE',
        'description': "„Prélude à l’après-midi d’un faune“ (Vorspiel zum Nachmittag eines Fauns, 1894) beruht auf einem Gedicht von Mallarmé: An einem heißen Nachmittag erwacht ein Faun – halb Mensch, halb Bock –, spielt auf seiner Flöte und träumt von Nymphen. Uraufgeführt wurde es am 22. Dezember 1894 in Paris.\n\nHier spielen es die Berliner Philharmoniker in einer Aufnahme von 1985, mit Karlheinz Zöller an der Soloflöte.\n\nAchte auf:\n1. Das Flötensolo zu Beginn: eine langsame, gleitende Melodie ohne klare Tonart\n2. Leise Harfen und Hörner – wie ein Sommerdunst\n3. Die Musik „kommt“ nie wirklich „an“ – sie treibt, träumt und verklingt\n\nDer Komponist Pierre Boulez sagte, mit diesem Stück sei die moderne Musik erwacht.",
      },
      {
        'title': 'Rückblick Woche 2 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der 1890er-Jahre, ein Lied zum Lesen und fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 2 auf einen Blick', 'bullets': [
              'Wagner, Gamelan, die symbolistischen Dichter',
              'Ganzton- und pentatonische Tonleitern, Parallelakkorde',
              '1891: zwei Arabesken für Klavier',
              '1894: Prélude à l’après-midi d’un faune']},
          {'kind': 'listen', 'title': 'Zum Mitlesen: Verlaine-Lieder', 'work': '„Mandoline“ (1882) und „Il pleure dans mon cœur“ aus den „Ariettes oubliées“', 'points': [
              '„Mandoline“: Ständchensänger, die in einem mondbeschienenen Park zupfen – man hört die Mandoline im Klavier',
              '„Il pleure dans mon cœur“: „Es weint in meinem Herzen, wie es auf die Stadt regnet“',
              'Beide nach Gedichten von Paul Verlaine – dem Schwiegersohn seiner ersten Klavierlehrerin',
              'Öffne die interaktiven Noten in der Bibliothek']},
        ],
        'library': [('cmuyfx7x400at2eonnx5mi96r', '„Mandoline“ – interaktive Noten'), ('cmuyfx7wy00ag2eon8sl6xs38', '„Il pleure dans mon cœur“ – interaktive Noten'), ('cmuygticx00b04kktc3l0zl6x', 'Streichquartett g-Moll (1893) – interaktive Noten')],
        'quiz': [
          ('Welche Art von Musik hörte Debussy auf der Weltausstellung 1889?', ['Amerikanischen Jazz', 'Javanisches Gamelan', 'Spanischen Flamenco', 'Russische Volkslieder'], 1),
          ('Die Dienstagsabende welches Dichters besuchte Debussy?', ['Victor Hugo', 'Stéphane Mallarmé', 'Charles Baudelaire', 'Arthur Rimbaud'], 1),
          ('Welches Instrument eröffnet das Prélude à l’après-midi d’un faune?', ['Oboe', 'Flöte', 'Violine', 'Harfe'], 1),
          ('Was ist eine Ganztonleiter?', ['Eine Tonleiter nur aus schwarzen Tasten', 'Eine Tonleiter aus gleichen Ganztonschritten ohne Grundton', 'Eine Dur-Tonleiter', 'Eine Tonleiter mit 12 Tönen'], 1),
          ('Wer sagte, mit dem Faun sei die moderne Musik erwacht?', ['Igor Strawinsky', 'Pierre Boulez', 'Maurice Ravel', 'Erik Satie'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 3 – Pelléas, La Mer und ein Skandal (1899–1908)',
    'lessons': [
      {
        'title': 'Pelléas et Mélisande', 'type': 'SLIDES', 'minutes': 15,
        'description': "Zehn Jahre lang arbeitete Debussy an einer Oper wie keiner anderen. Ihre Uraufführung 1902 machte ihn berühmt.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 3', 'title': 'Pelléas, La Mer und ein Skandal', 'subtitle': '1899 – 1908', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Eine Oper des Flüsterns', 'bullets': [
              'Nach einem symbolistischen Drama des belgischen Dichters Maurice Maeterlinck',
              'Ein geheimnisvolles Mädchen, Mélisande, zwei Halbbrüder, ein düsteres Schloss am Meer',
              'Keine großen Arien: Die Sänger sprechen fast, im natürlichen Rhythmus des Französischen',
              'Das Orchester malt die Stimmungen – Wälder, Brunnen, Dunkelheit, das Meer']},
          {'kind': 'timeline', 'title': 'Leben und Werk', 'rows': [
              ('1899', 'Heirat mit Lilly Texier, einem Mannequin'),
              ('30. April 1902', 'Uraufführung von „Pelléas et Mélisande“ an der Opéra-Comique – erst ratlos aufgenommen, dann Kult'),
              ('1901', 'Beginnt Musikkritiken zu schreiben; sein ironisches Alter Ego ist „Monsieur Croche“'),
              ('1905', 'Überarbeitet und veröffentlicht die „Suite bergamasque“ mit „Clair de lune“')]},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              '1902: „Pelléas et Mélisande“ – seine einzige vollendete Oper',
              'Worte, gesungen fast wie gesprochenes Französisch',
              'Er schrieb witzige Kritiken als „Monsieur Croche“']},
        ],
      },
      {
        'title': 'Video: Clair de lune', 'type': 'YOUTUBE', 'minutes': 6, 'video': 'https://www.youtube.com/watch?v=U3u4pQ4WKOk',
        'description': "„Clair de lune“ (Mondschein) ist das dritte Stück der „Suite bergamasque“ – um 1890 begonnen und 1905 veröffentlicht. Der Titel stammt aus einem Gedicht Verlaines über maskierte Tänzer im Mondlicht.\n\nHier spielt es Seong-Jin Cho, Gewinner des Internationalen Chopin-Wettbewerbs 2015, für die Deutsche Grammophon.\n\nAchte auf:\n1. Sehr leise Anfangsakkorde – pianissimo – wie Mondlicht auf dem Wasser\n2. Einen schwebenden Rhythmus: Man spürt den Takt kaum\n3. Perlende Arpeggien in der Mitte, wenn der Mond aus den Wolken tritt\n\nÖffne danach die Noten in der Bibliothek – oft ist es eines der ersten Debussy-Stücke, die Pianisten lernen.",
        'library': [('cmuygw9lj02004kktg6iplwvl', '„Clair de lune“ – Noten')],
      },
      {
        'title': 'La Mer und eine neue Familie', 'type': 'SLIDES', 'minutes': 15,
        'description': "1904 verließ Debussy seine Frau für eine andere – ein Pariser Skandal. Im selben Jahr arbeitete er an seinem großen Porträt des Meeres.",
        'slides': [
          {'kind': 'bullets', 'title': 'Skandal', 'bullets': [
              '1904 verließ Debussy Lilly für Emma Bardac, eine Sängerin und Ehefrau eines wohlhabenden Bankiers',
              'Lilly versuchte sich das Leben zu nehmen; viele Freunde wandten sich von Debussy ab',
              'Ihre Tochter Claude-Emma, genannt „Chouchou“, wurde 1905 geboren',
              'Claude und Emma heirateten 1908']},
          {'kind': 'image', 'title': '„La Mer“, 1905', 'text': 'Debussy wünschte sich Hokusais Holzschnitt „Die große Welle vor Kanagawa“ auf dem Umschlag der Partitur. „La Mer“ (Das Meer) hat drei Sätze: Von der Morgendämmerung bis zum Mittag auf dem Meer, Spiel der Wellen und Zwiegespräch von Wind und Meer.', 'image': 'debussy_wave', 'credit': 'Katsushika Hokusai, Die große Welle vor Kanagawa, um 1831 (gemeinfrei)'},
          {'kind': 'bullets', 'title': 'Children’s Corner, 1908', 'bullets': [
              'Sechs Klavierstücke für Chouchou, „mit den zärtlichen Entschuldigungen ihres Vaters für das, was folgt“',
              'Sie machen sich über Klavierübungen lustig („Doctor Gradus ad Parnassum“) und zeigen ihr Spielzeug',
              'Das letzte, „Golliwogg’s Cakewalk“, verwendet amerikanische Ragtime-Rhythmen',
              'In der Mitte verspottet es den Anfang von Wagners „Tristan“!']},
        ],
      },
      {
        'title': 'Video: La Mer – und Quiz zu Woche 3', 'type': 'YOUTUBE', 'minutes': 28, 'xp': 20, 'video': 'https://www.youtube.com/watch?v=y1hWp4pQpAs',
        'description': "Alain Altinoglu dirigiert das hr-Sinfonieorchester in „La Mer“ – uraufgeführt am 15. Oktober 1905 in Paris.\n\nAchte auf:\n1. „Von der Morgendämmerung bis zum Mittag auf dem Meer“: Das Meer erwacht langsam; am Ende ein großer Blechbläserchoral – die Sonne am Mittag\n2. „Spiel der Wellen“ (ab 9:06): leicht, funkelnd, immer im Wandel\n3. „Zwiegespräch von Wind und Meer“: Sturm und Kraft – und ein glänzender Schluss\n\nBeantworte danach die fünf Quizfragen zu Woche 3.",
        'quiz': [
          ('Wer schrieb das Drama, auf dem „Pelléas et Mélisande“ beruht?', ['Victor Hugo', 'Maurice Maeterlinck', 'Paul Verlaine', 'Stéphane Mallarmé'], 1),
          ('Welches Bild wollte Debussy auf dem Umschlag von „La Mer“?', ['Ein Gemälde von Monet', 'Hokusais „Große Welle“', 'Ein Foto des Atlantiks', 'Eine Zeichnung von Delacroix'], 1),
          ('Wie lautete der Spitzname von Debussys Tochter?', ['Mimi', 'Chouchou', 'Lili', 'Coco'], 1),
          ('Welches Stück aus Children’s Corner verwendet Ragtime-Rhythmen?', ['Doctor Gradus ad Parnassum', 'Golliwogg’s Cakewalk', 'The Snow is Dancing', 'Jimbo’s Lullaby'], 1),
          ('Zu welcher Suite gehört „Clair de lune“?', ['Children’s Corner', 'Suite bergamasque', 'Images', 'Estampes'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 4 – Préludes, Krieg und die letzten Jahre (1909–1918)',
    'lessons': [
      {
        'title': 'Die Préludes', 'type': 'SLIDES', 'minutes': 15,
        'description': "Zwischen 1909 und 1913 schrieb Debussy 24 Préludes für Klavier – kleine, vollkommene Bilder in Tönen.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 4', 'title': 'Préludes, Krieg und die letzten Jahre', 'subtitle': '1909 – 1918', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Zwei Bücher Préludes', 'bullets': [
              'Buch 1 erschien 1910, Buch 2 1913 – je zwölf Stücke, wie Chopins 24 Préludes',
              'Die Titel stehen am Ende jedes Stücks in Klammern – erst hören, dann den Titel lesen',
              '„La fille aux cheveux de lin“ (Das Mädchen mit dem flachsblonden Haar), „La cathédrale engloutie“ (Die versunkene Kathedrale), „Feux d’artifice“ (Feuerwerk)',
              'Debussy spielte 1913 auch einige seiner Werke auf Klavierrollen ein']},
          {'kind': 'listen', 'title': 'Zum Mitlesen', 'work': 'Prélude 4, Buch 1: „Les sons et les parfums tournent dans l’air du soir“', 'points': [
              '„Klänge und Düfte kreisen in der Abendluft“ – ein Vers von Baudelaire',
              'Leise, langsam und voller reicher Akkorde',
              'Achte auf die vielen dynamischen Angaben – die meisten sehr leise',
              'Öffne die Noten in der Bibliothek – und das ganze Buch 1']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              '24 Préludes in zwei Büchern (1910, 1913)',
              'Titel am Ende – zuerst die Fantasie',
              'Bilder von Natur, Legenden, Menschen und Orten']},
        ],
        'library': [('cmuygw9l901zw4kktfja35cxo', 'Prélude 4, Buch 1 – Noten'), ('cmuygw9la01zx4kktxk5qnbka', 'Préludes, Buch 1 – Noten')],
      },
      {
        'title': 'Krieg, Krankheit und „musicien français“', 'type': 'SLIDES', 'minutes': 12,
        'description': "Debussys letzte Jahre waren von Krebs und dem Ersten Weltkrieg überschattet. Trotzdem schrieb er einige seiner originellsten Werke.",
        'slides': [
          {'kind': 'bullets', 'title': 'Die letzten Werke', 'bullets': [
              '1909: Debussy erfuhr, dass er Krebs hatte',
              '1913: das Ballett „Jeux“ – zwei Wochen später löste Strawinskys „Sacre du printemps“ im selben Theater einen Tumult aus',
              '1915: die zwölf Études für Klavier, dem Andenken Chopins gewidmet',
              '1915–1917: drei Sonaten, stolz unterzeichnet mit „Claude Debussy, musicien français“']},
          {'kind': 'bullets', 'title': 'Das Ende', 'bullets': [
              'Er plante sechs Sonaten für verschiedene Instrumente – drei vollendete er: Cello, Flöte-Bratsche-Harfe, Violine',
              'Die Violinsonate (1917) war sein letztes vollendetes Werk und sein letzter öffentlicher Auftritt als Pianist',
              'Er starb am 25. März 1918 in Paris, während deutsche Geschütze die Stadt beschossen',
              'Chouchou starb im Jahr darauf, mit 13']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Études (1915), dem Andenken Chopins gewidmet',
              'Drei späte Sonaten – „musicien français“',
              'Gestorben am 25. März 1918, mitten im Krieg']},
        ],
      },
      {
        'title': 'Debussy heute', 'type': 'SLIDES', 'minutes': 10,
        'description': "Warum Debussy zu den Begründern der Musik des 20. Jahrhunderts gehört.",
        'slides': [
          {'kind': 'bullets', 'title': 'Sein Einfluss', 'bullets': [
              'Ravel, Strawinsky, Bartók und Messiaen lernten alle von ihm',
              'Jazzmusiker wie Bill Evans liebten seine Akkorde',
              'Film- und Videospielmusik verwendet täglich seine Farben und Klangflächen',
              'Er zeigte, dass der Klang selbst – Klangfarbe, Raum, Stille – Thema der Musik sein kann']},
          {'kind': 'summary', 'title': 'Wie es weitergeht', 'bullets': [
              'Lies seine Lieder nach Gedichten von Verlaine und Baudelaire in der Bibliothek',
              'Klavierspieler: Frag deine Lehrkraft nach „Clair de lune“, einer Arabeske oder „La fille aux cheveux de lin“',
              'Weiter mit den Kursen über Chopin und Cécile Chaminade']},
        ],
        'library': [('cmuyfx7x200am2eonpe47e1pt', '„Harmonie du soir“ (Baudelaire) – interaktive Noten'), ('cmuyfx7x300aq2eon2cagakpt', '„La flûte de Pan“ (Chansons de Bilitis) – interaktive Noten')],
      },
      {
        'title': 'Abschluss: Rückblick und Quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Herzlichen Glückwunsch – du bist am Ende des Kurses angekommen! Ein letzter Rückblick und ein Abschlussquiz über alle vier Wochen.",
        'slides': [
          {'kind': 'timeline', 'title': 'Debussys Leben auf einen Blick', 'rows': [
              ('1862', 'Geboren am 22. August in Saint-Germain-en-Laye'),
              ('1872', 'Eintritt ins Pariser Conservatoire'),
              ('1884', 'Prix de Rome'),
              ('1894', 'Prélude à l’après-midi d’un faune'),
              ('1902', '„Pelléas et Mélisande“'),
              ('1905', '„La Mer“; Chouchou wird geboren'),
              ('1918', 'Gestorben am 25. März in Paris')]},
        ],
        'quiz': [
          ('Wo stehen die Titel von Debussys Préludes?', ['Oben', 'Am Ende jedes Stücks', 'Nur im Inhaltsverzeichnis', 'Nirgends'], 1),
          ('Wie unterzeichnete Debussy seine späten Sonaten?', ['„Claude de France“', '„Claude Debussy, musicien français“', '„Monsieur Croche“', '„Achille Debussy“'], 1),
          ('Wessen Andenken sind seine Études gewidmet?', ['Bach', 'Chopin', 'Wagner', 'Mozart'], 1),
          ('Wann starb Debussy?', ['1902', '1914', '1918', '1925'], 2),
          ('Welches Ballett Strawinskys löste zwei Wochen nach Debussys „Jeux“ einen Tumult aus?', ['Der Feuervogel', 'Le Sacre du printemps', 'Petruschka', 'Pulcinella'], 1),
          ('Was war Debussys einzige vollendete Oper?', ['Carmen', 'Pelléas et Mélisande', 'Rusalka', 'Der verlorene Sohn'], 1),
        ],
      },
    ],
  },
]
