# Franz Schubert - deutsche Fassung von schubert.py.
SITE = 'https://mymusic.coach'
SONATA_D958 = f'{SITE}/api/library/items/cmuygtj2n00le4kktmlgfxzji/files/0.audio'

COURSE = {
    'slug': 'schubert-leben-und-lieder-einfuehrung',
    'language': 'de',
    'translationOf': 'schubert-life-and-songs-introduction',
    'title': 'Franz Schubert: Leben und Lieder – Eine erste Einführung',
    'shortSummary': 'Vier Wochen mit Franz Schubert: der Sohn eines Wiener Schulmeisters, der über 600 Lieder, das „Forellenquintett“ und die „Winterreise“ schrieb – und mit nur 31 starb.',
    'description': (
        "Franz Schubert (1797–1828) wurde nur 31 Jahre alt und lebte fast immer in Wien. Er hatte nie eine feste Stelle, trat selten öffentlich auf "
        "und veröffentlichte zu Lebzeiten nur einen kleinen Teil seiner Musik. Und doch schrieb er mehr als 600 Lieder, wunderbare Klaviermusik, "
        "Sinfonien und Kammermusik – und veränderte, was ein Lied sein kann.\n\n"
        "In vier Wochen folgst du seinem Leben Schritt für Schritt:\n"
        "- Woche 1 – Eine Wiener Kindheit (1797–1814)\n"
        "- Woche 2 – Das Liederwunder: „Gretchen am Spinnrade“ und „Erlkönig“ (1814–1815)\n"
        "- Woche 3 – Freunde, Schubertiaden und die „Forelle“ (1816–1824)\n"
        "- Woche 4 – Die „Winterreise“ und die letzten Jahre (1825–1828)\n\n"
        "Jede Woche verbindet illustrierte Folien, Videos, Aufnahmen und interaktive Noten aus der mymusic.coach-Bibliothek, "
        "gefolgt von einem kurzen Quiz. Vorkenntnisse sind nicht nötig. Plane etwa 1–2 Stunden pro Woche ein."
    ),
    'level': 'BEGINNER',
    'instruments': ['Voice', 'Piano'],
    'musicStyles': ['Romantic', 'Classical'],
    'cover': {'image': 'schubert_rieder', 'title': 'Schubert', 'subtitle': 'Leben und Lieder – Eine erste Einführung', 'tag': '4-Wochen-Kurs'},
}

FOOTER = 'Franz Schubert: Leben und Lieder'

WEEKS = [
  {
    'title': 'Woche 1 – Eine Wiener Kindheit (1797–1814)',
    'lessons': [
      {
        'title': 'Willkommen: Franz Schubert',
        'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': (
            "Willkommen im Kurs! In dieser ersten Lektion lernst du Franz Schubert kennen und bekommst einen Überblick über die nächsten vier Wochen.\n\n"
            "Tipp: Die meisten Lieder dieses Kurses findest du in der mymusic.coach-Bibliothek als interaktive Noten – du kannst mitlesen, während sie erklingen, "
            "sie als Favoriten markieren und zusätzliche XP sammeln, wenn du sie bis zum Ende liest."
        ),
        'slides': [
          {'kind': 'title', 'week': 'Woche 1', 'title': 'Franz Schubert', 'subtitle': 'Eine erste Einführung in sein Leben und seine Lieder', 'image': 'schubert_rieder', 'credit': 'Porträt von Wilhelm August Rieder, 1875, nach seinem Aquarell von 1825 (gemeinfrei)'},
          {'kind': 'bullets', 'title': 'Warum Schubert?', 'bullets': [
              'Geboren 1797 in Wien – dort gestorben 1828, mit nur 31 Jahren',
              'Er schrieb mehr als 600 Lieder für Singstimme und Klavier',
              'Er machte das Klavier zum gleichberechtigten Partner des Sängers',
              'Er schrieb auch Sinfonien, Kammermusik und Klavierstücke, die weltweit geliebt werden',
              'Der größte Teil seiner Musik wurde erst nach seinem Tod berühmt']},
          {'kind': 'timeline', 'title': 'Deine vier Wochen', 'rows': [
              ('Woche 1', 'Eine Wiener Kindheit (1797–1814)'),
              ('Woche 2', 'Das Liederwunder: „Gretchen“ und „Erlkönig“'),
              ('Woche 3', 'Freunde, Schubertiaden und die „Forelle“'),
              ('Woche 4', 'Die „Winterreise“ und die letzten Jahre (1825–1828)')]},
          {'kind': 'bullets', 'title': 'Was ist ein Lied?', 'bullets': [
              'Gemeint ist das Kunstlied – durch Schubert wurde „Lied“ zum Fachwort, das man auch im Englischen und Französischen verwendet',
              'Ein vertontes Gedicht für eine Singstimme und Klavier',
              'Schubert wählte Gedichte von Goethe, Schiller, Müller und seinen eigenen Freunden',
              'In seinen Liedern malt das Klavier die Szene: ein Spinnrad, ein galoppierendes Pferd, einen Bach']},
          {'kind': 'quote', 'quote': 'Wollte ich Liebe singen, ward sie mir zum Schmerz. Und wollte ich wieder Schmerz nur singen, ward er mir zur Liebe.', 'by': 'Franz Schubert, „Mein Traum“, 1822'},
        ],
      },
      {
        'title': 'Aufwachsen in Wien',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Ein Schulmeisterssohn, ein Familienquartett und ein Sängerknabe am Kaiserhof: Diese Folien erzählen von Schuberts ersten 17 Jahren.",
        'slides': [
          {'kind': 'bullets', 'title': 'Wien, 31. Januar 1797', 'bullets': [
              'Geboren in der Vorstadt Himmelpfortgrund, gleich vor der alten Stadt Wien',
              'Sein Vater Franz Theodor führte eine kleine Schule; seine Mutter Elisabeth war Köchin gewesen',
              'Er war eines von vierzehn Kindern – nur fünf überlebten die Kindheit',
              'Musik gehörte zu Hause zum Alltag']},
          {'kind': 'bullets', 'title': 'Eine musikalische Familie', 'bullets': [
              'Sein Vater brachte ihm die Geige bei, sein Bruder Ignaz das Klavier',
              'Die Familie spielte gemeinsam Streichquartett – Franz spielte Bratsche',
              'Der Lichtentaler Chorregent Michael Holzer sagte: „Wenn ich ihm etwas Neues beibringen wollte, hat er es schon gewusst“']},
          {'kind': 'timeline', 'title': 'Sängerknabe am Kaiserhof', 'rows': [
              ('1808', 'Er wird Sängerknabe der kaiserlichen Hofkapelle – mit einem Freiplatz im Stadtkonvikt'),
              ('1808–1812', 'Er spielt Geige im Schulorchester: Sinfonien von Haydn, Mozart und Beethoven'),
              ('ab 1812', 'Kompositionsunterricht beim Hofkapellmeister Antonio Salieri'),
              ('1812', 'Der Stimmbruch – seine Zeit als Sängerknabe endet'),
              ('1814', 'Er wird zum Lehrer ausgebildet und hilft an der Schule seines Vaters')]},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Geboren am 31. Januar 1797 in Wien, Sohn eines Schulmeisters',
              'Geige, Klavier und Bratsche zu Hause – ein Familienstreichquartett',
              'Ab 1808 Sängerknabe und Zögling im Stadtkonvikt',
              'Kompositionsunterricht bei Antonio Salieri',
              '1814: Schulgehilfe – aber sein Herz gehörte der Musik']},
        ],
      },
      {
        'title': 'Video: Schuberts Leben und seine Orte',
        'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=Zi7qHY-TkvY',
        'description': (
            "Diese Dokumentation besucht die Orte, an denen Schubert lebte und arbeitete, und stellt die Menschen vor, die ihm am wichtigsten waren. "
            "Das Video ist auf Englisch – schalte bei Bedarf die automatischen Untertitel von YouTube ein.\n\n"
            "Achte beim Anschauen auf Folgendes:\n"
            "1. Wo in Wien wurde Schubert geboren?\n"
            "2. Wer waren seine wichtigsten Freunde?\n"
            "3. Wie oft zog Schubert um – und warum?\n\n"
            "Du musst dir nicht alles merken – jeder Teil der Geschichte kommt in den nächsten Wochen wieder."
        ),
      },
      {
        'title': 'Rückblick Woche 1 und Quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Eine kurze Zusammenfassung von Woche 1, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 1 auf einen Blick', 'bullets': [
              'Geboren am 31. Januar 1797 in Wien',
              'Sohn eines Schulmeisters – eines von fünf überlebenden Kindern',
              'Familienstreichquartett: Franz an der Bratsche',
              '1808: Sängerknabe der kaiserlichen Hofkapelle',
              'Unterricht bei Antonio Salieri']},
          {'kind': 'bullets', 'title': 'Diese Woche zum Hören', 'bullets': [
              'Öffne das „Heidenröslein“ in der Bibliothek: ein schlichtes, volksliedhaftes Lied, das Schubert mit 18 schrieb',
              'Achte darauf, wie kurz es ist – und wie dieselbe Musik in jeder Strophe wiederkehrt']},
        ],
        'library': [('cmuyfx8r900w92eon5eyc7x6t', 'Ein erstes Lied zum Entdecken: schlicht, kurz und berühmt'), ('cmv2iotfk002c12ifqkn9m9ge', 'Historische Aufnahme: Fritz Kreisler spielt Schuberts Rosamunde-Ballettmusik (1917)')],
        'quiz': [
          ('In welcher Stadt wurde Franz Schubert geboren?', ['Salzburg', 'Wien', 'Graz', 'München'], 1),
          ('Welchen Beruf hatte sein Vater?', ['Hofmusiker', 'Schulmeister', 'Klavierbauer', 'Priester'], 1),
          ('Welches Instrument spielte Schubert im Familienquartett?', ['Cello', 'Bratsche', 'Flöte', 'Kontrabass'], 1),
          ('Wo sang Schubert als Junge?', ['In der kaiserlichen Hofkapelle', 'In der Thomaskirche in Leipzig', 'An der Oper', 'In einem Kloster in Salzburg'], 0),
          ('Welcher berühmte Hofkomponist unterrichtete Schubert in Komposition?', ['Joseph Haydn', 'Ludwig van Beethoven', 'Antonio Salieri', 'Carl Czerny'], 2),
        ],
      },
    ],
  },
  {
    'title': 'Woche 2 – Das Liederwunder (1814–1815)',
    'lessons': [
      {
        'title': '„Gretchen am Spinnrade“: ein Meisterwerk mit 17',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Am 19. Oktober 1814 schrieb der 17-jährige Schubert ein Lied, das viele die Geburt des deutschen Kunstlieds nennen. Lies mit den interaktiven Noten aus der Bibliothek mit.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 2', 'title': 'Das Liederwunder', 'subtitle': '1814 – 1815', 'image': 'schubert_klimt', 'credit': 'Gustav Klimt, „Schubert am Klavier“, 1899 (gemeinfrei)'},
          {'kind': 'bullets', 'title': 'Gretchen am Spinnrad', 'bullets': [
              'Worte aus Goethes Drama „Faust“: Das junge Gretchen denkt an Faust, den sie liebt',
              '„Meine Ruh’ ist hin, mein Herz ist schwer“',
              'Schubert schrieb es am 19. Oktober 1814 – er war 17 Jahre alt',
              'Viele Historiker nennen diesen Tag den Geburtstag des deutschen Kunstlieds']},
          {'kind': 'listen', 'title': 'Hör auf das Spinnrad', 'work': 'Gretchen am Spinnrade, D 118', 'points': [
              'Die rechte Hand des Klaviers dreht und dreht sich – das Spinnrad',
              'Die linke Hand wiederholt ein gleichmäßiges Muster – das Tretbrett unter Gretchens Fuß',
              'Bei „sein Kuss!“ bricht die Musik ab – das Rad steht still',
              'Langsam, stockend setzt das Rad wieder ein …']},
          {'kind': 'summary', 'title': 'Warum es wichtig ist', 'bullets': [
              'Das Klavier begleitet nicht nur – es erzählt einen Teil der Geschichte',
              'Eine musikalische Idee (das Rad) hält das ganze Lied zusammen',
              'Öffne die interaktiven Noten in der Bibliothek und beobachte die Spinnfigur im Klavier']},
        ],
        'library': [('cmuyfx8tx00xw2eonufiq20fa', 'Interaktive Noten – beobachte das Spinnrad in der Klavierstimme')],
      },
      {
        'title': '„Erlkönig“: vier Stimmen, ein Sänger',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Ein Vater reitet mit seinem kranken Kind durch die Nacht, und der Erlkönig lockt den Jungen. Schubert machte aus Goethes Ballade ein dreiminütiges Drama – für einen Sänger und Klavier.",
        'slides': [
          {'kind': 'bullets', 'title': 'Die Geschichte', 'bullets': [
              'Ein Vater galoppiert durch eine dunkle, windige Nacht und hält seinen Sohn im Arm',
              'Der Junge sieht den Erlkönig, einen Geist, der ihn mit Spielen und Geschenken lockt',
              'Der Vater will ihn beruhigen: „Es ist ein Nebelstreif … in dürren Blättern säuselt der Wind“',
              'Als sie zu Hause ankommen, ist das Kind tot']},
          {'kind': 'bullets', 'title': 'Ein Sänger – vier Figuren', 'bullets': [
              'Der Erzähler: in der mittleren Stimmlage, ruhig und ernst',
              'Der Vater: tief und beständig',
              'Der Sohn: hoch und immer verängstigter',
              'Der Erlkönig: süß und freundlich – in Dur']},
          {'kind': 'listen', 'title': 'Hörführer', 'work': 'Erlkönig, D 328', 'points': [
              'Schnell wiederholte Oktaven im Klavier – das galoppierende Pferd (und eine Herausforderung für jeden Pianisten!)',
              'Eine grollende Figur im Bass – der Wind und der dunkle Wald',
              'Der Schrei des Jungen „Mein Vater, mein Vater!“ steigt jedes Mal höher',
              'Der Galopp bricht ab – und die letzten Worte werden fast ohne Musik gesprochen: „war tot“']},
          {'kind': 'timeline', 'title': 'Vom Schülerwerk zum Opus 1', 'rows': [
              ('1815', 'Schubert schreibt den „Erlkönig“ – er ist 18'),
              ('1815', 'In diesem einen Jahr schreibt er etwa 140 Lieder'),
              ('7. März 1821', 'Der Bariton Johann Michael Vogl singt ihn in einem öffentlichen Konzert in Wien – eine Sensation'),
              ('April 1821', 'Freunde finanzieren den Druck: Der „Erlkönig“ wird Schuberts Opus 1')]},
        ],
        'library': [('cmuyfx8tt00xu2eon15eoa2sb', 'Interaktive Noten – folge den vier Figuren'), ('cmuygwa5m02as4kktbztoivs2', 'Die gedruckten Noten (PDF)'), ('cmv2j2nc000ri12iflfzaiwgz', 'Historische Aufnahme: Robert Leonhardt singt den „Erlkönig“ (1921)')],
      },
      {
        'title': 'Video: der „Erlkönig“ als Animation',
        'type': 'YOUTUBE', 'minutes': 8, 'video': 'https://www.youtube.com/watch?v=sElBd0Wv1L8',
        'description': (
            "Ein Animationsfilm zu Schuberts „Erlkönig“. Sieh ihn dir zweimal an:\n\n"
            "1. Beim ersten Mal genieß einfach die Geschichte.\n"
            "2. Beim zweiten Mal hör nur auf das Klavier: Wann hört der Galopp auf? Was passiert in der Musik, wenn der Erlkönig spricht?\n\n"
            "Öffne dann die Noten aus der Bibliothek in der vorigen Lektion und finde die Stelle, an der die Musik fast stillsteht."
        ),
      },
      {
        'title': 'Rückblick Woche 2 und Quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung des Liederwunders, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 2 auf einen Blick', 'bullets': [
              '19. Oktober 1814: „Gretchen am Spinnrade“ – das Klavier wird zum Spinnrad',
              '1815: etwa 140 Lieder in einem einzigen Jahr',
              '„Erlkönig“: ein Sänger, vier Figuren, ein galoppierendes Klavier',
              '1821: „Erlkönig“ erscheint als Opus 1, bezahlt von Freunden']},
        ],
        'quiz': [
          ('Aus welchem Werk Goethes stammt der Text von „Gretchen am Spinnrade“?', ['Faust', 'Werther', 'Egmont', 'Wilhelm Meister'], 0),
          ('Wie alt war Schubert, als er „Gretchen am Spinnrade“ schrieb?', ['12', '17', '25', '31'], 1),
          ('Was ahmt das Klavier in „Gretchen am Spinnrade“ nach?', ['Einen Sturm', 'Ein Spinnrad', 'Kirchenglocken', 'Ein Pferd'], 1),
          ('Wie viele Figuren stellt der Sänger im „Erlkönig“ dar?', ['Eine', 'Zwei', 'Vier', 'Sechs'], 2),
          ('Wie endet der „Erlkönig“?', ['Mit einer Hochzeit', 'Das Kind ist tot', 'Der Erlkönig verschwindet', 'Der Vater findet Hilfe'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 3 – Freunde, Schubertiaden und die „Forelle“ (1816–1824)',
    'lessons': [
      {
        'title': 'Schubert und seine Freunde',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Schubert hatte nie eine feste Stelle. Ein Kreis treuer Freunde gab ihm Zimmer, Geld, Gedichte – und ein Publikum: die Schubertiaden.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 3', 'title': 'Freunde und Schubertiaden', 'subtitle': '1816 – 1824', 'image': 'schubertiade', 'credit': 'Julius Schmid, „Schubertiade“, 1897 (gemeinfrei)'},
          {'kind': 'bullets', 'title': 'Ein Freundeskreis', 'bullets': [
              'Joseph von Spaun – Schulfreund, der seine Lieder an Goethe schickte',
              'Franz von Schober – gab Schubert ein Zimmer und schrieb Gedichte für ihn',
              'Johann Mayrhofer – Dichter; Schubert vertonte fast fünfzig seiner Gedichte',
              'Johann Michael Vogl – ein berühmter Opernbariton, der Schuberts Lieder überall sang',
              'Maler wie Moritz von Schwind und Leopold Kupelwieser']},
          {'kind': 'bullets', 'title': 'Was war eine Schubertiade?', 'bullets': [
              'Ein Abend bei Freunden zu Hause, ganz der Musik Schuberts gewidmet',
              'Lieder, Klavierduette, Tänze – oft mit Schubert am Klavier',
              'Lesungen, Spiele, Wein und lange Gespräche',
              'Seine Freunde nannten ihn „Schwammerl“ – kleines Pilzchen –, weil er klein und rundlich war']},
          {'kind': 'timeline', 'title': 'Jahre der Freiheit – und der Sorge', 'rows': [
              ('1818', 'Er gibt den Schuldienst auf; Sommer als Musiklehrer der Familie Esterházy in Zseliz'),
              ('1819', 'Reise mit Vogl nach Oberösterreich; er schreibt das „Forellenquintett“'),
              ('1822', 'Sinfonie in h-Moll – die „Unvollendete“'),
              ('Ende 1822', 'Er erkrankt schwer – seine Gesundheit erholt sich nie ganz'),
              ('1823', 'Der Liederzyklus „Die schöne Müllerin“')]},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Freunde gaben Schubert Zimmer, Geld, Gedichte und ein Publikum',
              'Schubertiaden: musikalische Abende zu Hause',
              'Ab 1818 lebte er als freischaffender Komponist',
              'Die „Unvollendete“ hat nur zwei Sätze – niemand weiß genau, warum']},
        ],
              'library': [('cmv2iy5yt00im12ifkvh31t43', 'Historische Aufnahme: die „Unvollendete“, Philadelphia Orchestra unter Leopold Stokowski (1924)'), ('cmv2iumnh00bm12ifzo8xv1z2', 'Historische Aufnahme: „Moment musical“, Philadelphia Orchestra (1922)')],
      },
      {
        'title': 'Video: Schuberts Freunde und Dichter',
        'type': 'YOUTUBE', 'minutes': 60, 'video': 'https://www.youtube.com/watch?v=wyxnjA1Xyng',
        'description': (
            "Der Pianist Graham Johnson, einer der weltweit besten Kenner von Schuberts Liedern, erzählt von den Jahren 1816–1820 "
            "– als Schubert mit dem Dichter Johann Mayrhofer zusammenlebte –, während Sängerinnen und Sänger die Lieder in der Londoner Wigmore Hall singen. "
            "Die Erklärungen sind auf Englisch, die Lieder auf Deutsch.\n\n"
            "Das Video ist lang: Sieh es dir gern in Teilen an. Achte auf:\n"
            "1. Wie sich Mayrhofers dunkle Gedichte von Goethes unterscheiden\n"
            "2. Wie Schuberts Klaviersatz die Natur beschreibt – Wasser, Wind, Nacht\n"
            "3. Lieder, die du aus diesem Kurs schon kennst"
        ),
      },
      {
        'title': 'Hören: „Die Forelle“ und das „Forellenquintett“',
        'type': 'YOUTUBE', 'minutes': 40, 'video': 'https://www.youtube.com/watch?v=J_nKAXM9CY8',
        'description': (
            "1817 schrieb Schubert das Lied „Die Forelle“: Ein Fischer trübt das klare Wasser, um eine muntere Forelle zu fangen. "
            "Zwei Jahre später wünschte sich ein Musikliebhaber in Steyr ein Klavierquintett – mit Variationen über dieses Lied. "
            "Das Ergebnis ist das „Forellenquintett“, D 667, für Klavier, Violine, Bratsche, Cello und Kontrabass.\n\n"
            "Hier spielt das Schubert Ensemble das ganze Quintett live in der Wigmore Hall.\n\n"
            "Achte auf:\n"
            "1. Die perlenden Figuren des Klaviers – wieder Wasser!\n"
            "2. Im vierten Satz: die Liedmelodie, dann Variationen – jedes Instrument kommt an die Reihe\n"
            "3. Den Kontrabass – ungewöhnlich in einem Quintett –, der dem Klang ein warmes, tiefes Fundament gibt\n\n"
            "Lies zuerst das Lied selbst in der Bibliothek: Die springende Figur des Klaviers ist die Forelle, die durchs Wasser schießt."
        ),
        'library': [('cmuyfx8tu00xv2eonaugi8dph', 'Das Lied „Die Forelle“ – interaktive Noten')],
      },
      {
        'title': 'Rückblick Woche 3 und Quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der freien Jahre, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 3 auf einen Blick', 'bullets': [
              'Freunde: Spaun, Schober, Mayrhofer, der Sänger Vogl',
              'Schubertiaden – Musik, Dichtung und Freundschaft zu Hause',
              '1818: Schubert gibt den Schuldienst endgültig auf',
              '1819: das „Forellenquintett“, mit Variationen über sein Lied',
              '1822: die „Unvollendete“ – und eine schwere Krankheit']},
        ],
        'quiz': [
          ('Was war eine „Schubertiade“?', ['Ein Musikfestival in Salzburg', 'Ein Abend mit Schuberts Musik bei Freunden zu Hause', 'Ein Gottesdienst', 'Ein Tanz'], 1),
          ('Welcher Sänger machte Schuberts Lieder bekannt?', ['Johann Michael Vogl', 'Caroline Unger', 'Jenny Lind', 'Franz Liszt'], 0),
          ('Auf welchem Lied beruhen die Variationen im „Forellenquintett“?', ['Erlkönig', 'Die Forelle', 'Heidenröslein', 'Ave Maria'], 1),
          ('Welches Instrument macht das „Forellenquintett“ ungewöhnlich?', ['Flöte', 'Kontrabass', 'Harfe', 'Klarinette'], 1),
          ('Was ist das Besondere an der „Unvollendeten“?', ['Sie hat keinen langsamen Satz', 'Sie hat nur zwei Sätze', 'Sie ist für Chor geschrieben', 'Sie wurde nie aufgeführt'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 4 – Die „Winterreise“ und die letzten Jahre (1825–1828)',
    'lessons': [
      {
        'title': '„Winterreise“: eine Reise durch den Winter',
        'type': 'SLIDES', 'minutes': 15,
        'description': "1827 schrieb Schubert 24 Lieder über einen einsamen Wanderer im Winter. Seine Freunde waren erschüttert, wie düster sie waren – heute gilt die „Winterreise“ als eines der größten Werke der Musik.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 4', 'title': 'Winterreise und die letzten Jahre', 'subtitle': '1825 – 1828', 'image': 'schubert_rieder', 'credit': 'Porträt von Wilhelm August Rieder, 1875, nach seinem Aquarell von 1825 (gemeinfrei)'},
          {'kind': 'bullets', 'title': 'Ein Liederzyklus', 'bullets': [
              '24 Lieder nach Gedichten von Wilhelm Müller, geschrieben 1827',
              'Ein junger Mann, in der Liebe zurückgewiesen, verlässt in einer Winternacht die Stadt',
              'Er wandert durch Schnee und Eis: ein Lindenbaum, ein gefrorener Fluss, eine Krähe, ein Wegweiser',
              'Es gibt kein Happy End – das letzte Lied begegnet einem armen Leiermann']},
          {'kind': 'listen', 'title': 'Drei Lieder zum Entdecken', 'work': 'Winterreise, D 911', 'points': [
              'Nr. 1 „Gute Nacht“ – gleichmäßige Schritte im Klavier: die Reise beginnt',
              'Nr. 5 „Der Lindenbaum“ – das Rauschen der Blätter, eine Melodie fast wie ein Volkslied',
              'Nr. 24 „Der Leiermann“ – ein leerer, sich wiederholender Bordun: der Leiermann in der Kälte']},
          {'kind': 'quote', 'quote': 'Ich werde euch einen Zyklus schauerlicher Lieder vorsingen. Sie haben mich mehr angegriffen, als dieses je bei anderen Liedern der Fall war.', 'by': 'Schubert zu seinen Freunden, nach der Erinnerung Joseph von Spauns'},
          {'kind': 'summary', 'title': 'Probier es selbst', 'bullets': [
              'Öffne „Gute Nacht“ und „Der Lindenbaum“ in der Bibliothek und lies mit',
              'Zähle die gleichmäßigen Achtel in „Gute Nacht“ – das Gehen hört nie auf',
              'Sieh dir im „Leiermann“ den Bass an: immer wieder dieselben zwei Töne']},
        ],
        'library': [('cmuyfx8ri00x22eonjl2tvyhp', 'Nr. 1 „Gute Nacht“ – die Reise beginnt'), ('cmuyfx8rj00x62eonfpjqbi34', 'Nr. 5 „Der Lindenbaum“'), ('cmuyfx8tq00xn2eonv1bdee2j', 'Nr. 24 „Der Leiermann“ – das letzte Lied')],
      },
      {
        'title': 'Video: die „Winterreise“ live',
        'type': 'YOUTUBE', 'minutes': 75, 'video': 'https://www.youtube.com/watch?v=tnuvs2w7ges',
        'description': (
            "Der Tenor Ian Bostridge – der auch ein ganzes Buch über die „Winterreise“ geschrieben hat – singt den vollständigen Zyklus live.\n\n"
            "Du musst nicht alle 24 Lieder auf einmal ansehen. Beginne mit dem ersten Lied („Gute Nacht“), spring dann zum "
            "„Lindenbaum“ (Nr. 5) und schließe mit dem letzten Lied, dem „Leiermann“.\n\n"
            "Achte darauf, wie der Sänger die Farbe wechselt – warme Erinnerungen in Dur, kalte Wirklichkeit in Moll."
        ),
      },
      {
        'title': '1828: das letzte Jahr',
        'type': 'AUDIO', 'minutes': 15, 'video': SONATA_D958,
        'description': (
            "Schuberts letztes Jahr war erstaunlich produktiv. Am 26. März 1828 – genau ein Jahr nach Beethovens Tod – gab er das einzige "
            "öffentliche Konzert mit eigener Musik zu Lebzeiten; es war ein Erfolg. In den folgenden Monaten schrieb er das große Streichquintett C-Dur, "
            "die später als „Schwanengesang“ veröffentlichten Lieder und drei große Klaviersonaten.\n\n"
            "Schubert starb am 19. November 1828, nur 31 Jahre alt. Auf eigenen Wunsch wurde er in der Nähe Beethovens begraben. "
            "Sein Freund, der Dichter Franz Grillparzer, schrieb die Grabinschrift: „Die Tonkunst begrub hier einen reichen Besitz, aber noch viel schönere Hoffnungen.“\n\n"
            "Hier hörst du den ersten Satz (Allegro) der Klaviersonate c-Moll, D 958 – einer jener letzten drei Sonaten –, gespielt von Paul Pitman "
            "(Musopen, gemeinfrei). Achte auf den stürmischen Beginn – Schubert dachte an Beethoven – und das sanfte zweite Thema, das ihm antwortet."
        ),
        'library': [('cmuygtj2n00le4kktmlgfxzji', 'Die vollständige Sonate c-Moll, D 958'), ('cmuyfx8re00wr2eonxcjach5b', '„Ständchen“ aus dem Schwanengesang – interaktive Noten'), ('cmv2iprf6002y12if6z3yxwje', 'Sergei Rachmaninow spielt seine eigene Klavierbearbeitung eines Schubert-Liedes (1925)'), ('cmv2iogtd001q12ifdoqiegny', 'Jascha Heifetz spielt Schuberts „Ave Maria“ (1924)')],
      },
      {
        'title': 'Abschluss: Rückblick und Quiz',
        'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Herzlichen Glückwunsch – du bist am Ende des Kurses angekommen! Ein letzter Rückblick und ein Abschlussquiz über alle vier Wochen.",
        'slides': [
          {'kind': 'timeline', 'title': 'Schuberts Leben auf einen Blick', 'rows': [
              ('1797', 'Geboren am 31. Januar in Wien'),
              ('1808', 'Sängerknabe der kaiserlichen Hofkapelle'),
              ('1814', '„Gretchen am Spinnrade“'),
              ('1815', '„Erlkönig“ – etwa 140 Lieder in einem Jahr'),
              ('1819', 'Das „Forellenquintett“'),
              ('1827', '„Winterreise“ – Fackelträger bei Beethovens Begräbnis'),
              ('1828', 'Gestorben am 19. November in Wien, mit 31 Jahren')]},
          {'kind': 'bullets', 'title': 'Wie es weitergeht', 'bullets': [
              'Entdecke mehr als 150 Schubert-Noten und -Aufnahmen in der mymusic.coach-Bibliothek',
              'Weiter mit „Beethoven: Leben und Werk“ – dem Komponisten, den Schubert am meisten bewunderte',
              'Sängerinnen, Sänger und Pianisten: Frag deine Lehrkraft nach einem ersten Schubert-Lied – das „Heidenröslein“ ist ein guter Anfang']},
        ],
        'quiz': [
          ('Wie viele Lieder schrieb Schubert?', ['Etwa 60', 'Etwa 200', 'Mehr als 600', 'Genau 24'], 2),
          ('Wer schrieb die Gedichte der „Winterreise“?', ['Goethe', 'Wilhelm Müller', 'Schiller', 'Heine'], 1),
          ('Wie viele Lieder hat die „Winterreise“?', ['12', '20', '24', '30'], 2),
          ('Was tat Schubert 1827 bei Beethovens Begräbnis?', ['Er dirigierte das Orchester', 'Er trug eine Fackel', 'Er hielt eine Rede', 'Er war nicht dabei'], 1),
          ('Wie alt war Schubert, als er starb?', ['31', '45', '56', '27'], 0),
          ('Was geschah am 26. März 1828?', ['Schuberts einziges öffentliches Konzert mit eigener Musik', 'Die Uraufführung des „Erlkönigs“', 'Schuberts Hochzeit', 'Die Veröffentlichung der „Winterreise“'], 0),
        ],
      },
    ],
  },
]
