# Felix Mendelssohn Bartholdy - deutsche Fassung von felix.py.
COURSE = {
    'slug': 'felix-mendelssohn-leben-und-werk-einfuehrung',
    'language': 'de',
    'translationOf': 'felix-mendelssohn-life-and-music-introduction',
    'title': 'Felix Mendelssohn Bartholdy: Leben und Werk – Eine erste Einführung',
    'shortSummary': 'Vier Wochen mit Felix Mendelssohn Bartholdy: das junge Genie des Oktetts, der Mann, der Bach wieder zum Leben erweckte, der Dirigent von Leipzig – von der Fingalshöhle bis zum Violinkonzert.',
    'description': (
        "Felix Mendelssohn Bartholdy (1809–1847) schrieb Meisterwerke schon als Jugendlicher, reiste durch ganz Europa, machte das Leipziger Gewandhausorchester "
        "zu einem der besten Orchester der Welt und belebte die Musik Bachs neu. Er wurde nur 38 Jahre alt.\n\n"
        "In vier Wochen folgst du seinem Leben Schritt für Schritt:\n"
        "- Woche 1 – Ein Berliner Wunderkind: Goethe, das Oktett und ein Sommernachtstraum (1809–1826)\n"
        "- Woche 2 – Bach neu entdeckt und eine große Reise: Berlin, Schottland, Italien (1827–1832)\n"
        "- Woche 3 – Leipzig: der Dirigent (1833–1842)\n"
        "- Woche 4 – Elias, das Violinkonzert und ein letzter Abschied (1843–1847)\n\n"
        "Jede Woche verbindet illustrierte Folien, Videos (eine Dokumentation, das Gewandhausorchester), Aufnahmen und Noten aus der mymusic.coach-Bibliothek "
        "– darunter eine Schellackplatte von 1922 – und ein kurzes Quiz. Vorkenntnisse sind nicht nötig. Plane etwa 1–2 Stunden pro Woche ein."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'felix_portrait', 'title': 'Felix Mendelssohn', 'subtitle': 'Leben und Werk – Eine erste Einführung', 'tag': '4-Wochen-Kurs'},
}
FOOTER = 'Felix Mendelssohn Bartholdy: Leben und Werk'
PORTRAIT = {'image': 'felix_portrait', 'credit': 'Porträt von Eduard Magnus, 1833 (gemeinfrei)'}
HEBRIDES = 'cmuygtj1v00jw4kktiyafru9g'
ITALIAN = 'cmuygtj1x00jy4kktrjjajsc1'
SCOTTISH = 'cmuygtj1y00k04kktq4ubsyp8'
QUARTET6 = 'cmuygtj2j00l34kktdybi56gs'
SPRING_SONG = 'cmv2j38l200sw12if4tl6pbts'

WEEKS = [
  {
    'title': 'Woche 1 – Ein Berliner Wunderkind (1809–1826)',
    'lessons': [
      {
        'title': 'Willkommen: Felix Mendelssohn', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Willkommen im Kurs! Lerne Felix Mendelssohn kennen – Komponist, Pianist, Dirigent, Maler und Briefschreiber – und sieh, wie die nächsten vier Wochen ablaufen.\n\nTipp: Alle Musik, die im Kurs vorkommt, ist in den Lektionen verlinkt. Öffne sie in der Bibliothek, lies die Noten mit und sammle zusätzliche XP, wenn du bis zum Ende liest oder hörst.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 1', 'title': 'Felix Mendelssohn Bartholdy', 'subtitle': 'Eine erste Einführung in sein Leben und seine Musik', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Warum Mendelssohn?', 'bullets': [
              'Geboren 1809 in Hamburg – gestorben 1847 in Leipzig, mit nur 38 Jahren',
              'Meisterwerke schon als Jugendlicher: das Oktett mit 16, die „Sommernachtstraum“-Ouvertüre mit 17',
              'Er brachte 1829 Bachs Matthäus-Passion wieder zum Klingen',
              'Berühmter Dirigent des Leipziger Gewandhausorchesters und Gründer des Leipziger Konservatoriums',
              'Hebriden-Ouvertüre, „Italienische“ Sinfonie, Violinkonzert, Hochzeitsmarsch']},
          {'kind': 'timeline', 'title': 'Deine vier Wochen', 'rows': [
              ('Woche 1', 'Ein Berliner Wunderkind: Goethe, das Oktett und ein Sommernachtstraum'),
              ('Woche 2', 'Bach neu entdeckt und eine große Reise: Berlin, Schottland, Italien'),
              ('Woche 3', 'Leipzig: der Dirigent'),
              ('Woche 4', 'Elias, das Violinkonzert und ein letzter Abschied')]},
          {'kind': 'bullets', 'title': 'Bevor es losgeht', 'bullets': [
              'Mendelssohn gehört zur frühen Generation der Romantik – mit Chopin, Schumann und Liszt',
              'Er liebte klare Formen wie Mozart – und die Farben und Stimmungen der Romantik',
              'Auch seine Schwester Fanny war eine große Komponistin – über sie gibt es einen eigenen Kurs',
              'Die Malerei war seine zweite Kunst: Auf allen Reisen zeichnete er und malte Aquarelle']},
        ],
      },
      {
        'title': 'Eine begabte Familie in Berlin', 'type': 'SLIDES', 'minutes': 15,
        'description': "Enkel eines berühmten Philosophen, Sohn eines Bankiers, Bruder einer glänzenden Schwester: Felix wuchs mit allen Vorteilen auf – und arbeitete sehr hart.",
        'slides': [
          {'kind': 'bullets', 'title': 'Hamburg, 3. Februar 1809', 'bullets': [
              'Zweites von vier Kindern des Bankiers Abraham Mendelssohn und Lea Salomon',
              'Enkel des jüdischen Philosophen Moses Mendelssohn',
              '1811 zog die Familie nach Berlin; 1816 wurden die Kinder lutherisch getauft',
              'Die Familie nahm den Namen „Bartholdy“ an – Felix behielt auch „Mendelssohn“']},
          {'kind': 'bullets', 'title': 'Unterricht ab fünf Uhr morgens', 'bullets': [
              'Die Kinder standen um fünf Uhr zum Unterricht auf: Sprachen, Mathematik, Zeichnen, Musik',
              'Klavier bei Ludwig Berger, Komposition bei Carl Friedrich Zelter – wie seine Schwester Fanny',
              'Zwischen 1821 und 1823 schrieb er zwölf Sinfonien für Streicher als Übungsstücke',
              'Ab 1822 veranstaltete die Familie Sonntagsmusiken – mit einem kleinen Orchester für seine neuen Werke']},
          {'kind': 'bullets', 'title': 'Zwölf Jahre alt – bei Goethe', 'bullets': [
              '1821 nahm Zelter Felix mit nach Weimar zu seinem Freund Goethe, damals 72',
              'Der Junge blieb etwa zwei Wochen und spielte Goethe jeden Tag vor',
              'Goethe verglich ihn mit dem jungen Mozart – und fand Felix noch beeindruckender',
              'Sie blieben befreundet bis zum Tod des Dichters 1832']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Geboren am 3. Februar 1809 in Hamburg, aufgewachsen in Berlin',
              'Lehrer: Ludwig Berger (Klavier), Carl Friedrich Zelter (Komposition)',
              '1821: Der zwölfjährige Felix besucht Goethe in Weimar',
              'Zwölf Streichersinfonien schon als Junge']},
        ],
      },
      {
        'title': 'Video: Mendelssohn – sein Leben und seine Orte', 'type': 'YOUTUBE', 'minutes': 22, 'video': 'https://www.youtube.com/watch?v=3susb6TcHG8',
        'description': "Diese Dokumentation von opera-inside führt an die Orte von Mendelssohns Leben – Hamburg, Berlin, Düsseldorf, Leipzig und seine Reisen –, die ganze Zeit begleitet von seiner Musik. Das Video ist auf Englisch – schalte bei Bedarf die automatischen Untertitel von YouTube ein.\n\nAchte beim Anschauen auf Folgendes:\n1. Was erreichte Mendelssohn mit Bachs Matthäus-Passion?\n2. Welche Reisen inspirierten seine „Schottische“ und seine „Italienische“ Sinfonie?\n3. Warum war Leipzig so wichtig für ihn?\n\nAlles kommt in den nächsten Wochen wieder.",
      },
      {
        'title': 'Das Oktett und ein Sommernachtstraum', 'type': 'SLIDES', 'minutes': 15, 'xp': 20,
        'description': "Zwei Werke eines Jugendlichen, die zu den Wundern der Musikgeschichte gehören – dann eine kurze Zusammenfassung und fünf Fragen.",
        'slides': [
          {'kind': 'bullets', 'title': 'Das Oktett, 1825', 'bullets': [
              'Im Herbst 1825 mit 16 Jahren geschrieben, als Geburtstagsgeschenk für seinen Geigenlehrer Eduard Rietz',
              'Acht Streicher: vier Violinen, zwei Bratschen, zwei Celli – eine „Sinfonie“ für Kammerbesetzung',
              'Das leichte, flüsternde Scherzo wurde von der Walpurgisnacht in Goethes „Faust“ angeregt',
              'Viele Musiker halten es für vollkommener als alles, was Mozart in diesem Alter schrieb']},
          {'kind': 'bullets', 'title': 'Ein Sommernachtstraum, 1826', 'bullets': [
              'Mit 17, nachdem er Shakespeares Komödie mit Fanny gelesen hatte, schrieb er eine Konzertouvertüre',
              'Vier zauberhafte Bläserakkorde öffnen die Tür zur Feenwelt',
              'Hör auf die Elfen (schnelle, leise Violinen) und den Esel Zettel (ein „I-A“ in den Streichern!)',
              '17 Jahre später, 1842, schrieb er weitere Musik zum Stück – darunter den berühmten Hochzeitsmarsch']},
          {'kind': 'summary', 'title': 'Woche 1 auf einen Blick', 'bullets': [
              'Geboren 1809 in Hamburg, aufgewachsen in einer gebildeten Berliner Familie',
              'Unterrichtet von Berger und Zelter; mit 12 bei Goethe',
              '1825: das Oktett – mit 16',
              '1826: die „Sommernachtstraum“-Ouvertüre – mit 17']},
        ],
        'quiz': [
          ('In welcher Stadt wurde Felix Mendelssohn geboren?', ['Berlin', 'Hamburg', 'Leipzig', 'Wien'], 1),
          ('Welchen berühmten Dichter besuchte der zwölfjährige Felix in Weimar?', ['Schiller', 'Goethe', 'Heine', 'Shakespeare'], 1),
          ('Wie alt war Mendelssohn, als er sein Oktett schrieb?', ['12', '16', '21', '30'], 1),
          ('Welches Theaterstück inspirierte seine Ouvertüre von 1826?', ['Hamlet', 'Ein Sommernachtstraum', 'Romeo und Julia', 'Der Sturm'], 1),
          ('Welches berühmte Stück gehört zu seiner späteren Sommernachtstraum-Musik (1842)?', ['Der Hochzeitsmarsch', 'Der Radetzky-Marsch', 'Der Türkische Marsch', 'Der Trauermarsch'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Woche 2 – Bach neu entdeckt und eine große Reise (1827–1832)',
    'lessons': [
      {
        'title': 'Bachs Matthäus-Passion, 1829', 'type': 'SLIDES', 'minutes': 15,
        'description': "Am 11. März 1829 dirigierte ein Zwanzigjähriger ein Werk, das seit Bachs Tod nicht mehr erklungen war. Es veränderte die Musikgeschichte.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 2', 'title': 'Bach neu entdeckt und eine große Reise', 'subtitle': '1827 – 1832', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Ein vergessenes Meisterwerk', 'bullets': [
              'Nach Bachs Tod 1750 wurden seine großen Chorwerke kaum noch aufgeführt',
              'Felix bekam eine Abschrift der Matthäus-Passion von seiner Großmutter zu Weihnachten geschenkt',
              'Er studierte sie mit Freunden – und beschloss, sie wieder hörbar zu machen',
              'Zelter, Leiter der Berliner Sing-Akademie, war zunächst skeptisch']},
          {'kind': 'timeline', 'title': '11. März 1829', 'rows': [
              ('Ort', 'Die Sing-Akademie zu Berlin'),
              ('Dirigent', 'Felix Mendelssohn, 20 Jahre alt (in gekürzter Fassung)'),
              ('Mitwirkende', 'Ein Chor von über 150 Sängerinnen und Sängern'),
              ('Publikum', 'Hegel, Heine und die Berliner Gesellschaft – ausverkauft, Hunderte mussten abgewiesen werden'),
              ('Folge', 'Der Beginn der Bach-Renaissance im 19. Jahrhundert')]},
          {'kind': 'quote', 'quote': 'Und dass es ein Komödiant und ein Judensohn sein müssen, die den Leuten die größte christliche Musik wiederbringen!', 'by': 'Mendelssohn zum Schauspieler Eduard Devrient, der den Jesus sang, 1829 (nach Devrients Erinnerung)'},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              '11. März 1829: Die Matthäus-Passion erklingt wieder, rund 100 Jahre nach ihrer Uraufführung',
              'Dirigiert vom zwanzigjährigen Mendelssohn in Berlin',
              'Der Beginn der Bach-Renaissance – Bach wurde wieder zum „Klassiker“']},
        ],
      },
      {
        'title': 'Hören: die Hebriden-Ouvertüre', 'type': 'AUDIO', 'minutes': 12, 'libraryAudio': [HEBRIDES, 0],
        'description': "Im Sommer 1829 reiste Mendelssohn mit seinem Freund Karl Klingemann durch Schottland. Am 7. August notierte er auf der Insel Mull 21 Takte Musik in einem Brief nach Hause, „um Euch zu verdeutlichen, wie seltsam mir auf den Hebriden zu Muthe geworden ist“. Am nächsten Tag segelte er zur Insel Staffa und zur Fingalshöhle. Die Ouvertüre – auch „Die Fingalshöhle“ genannt – wurde 1830 vollendet und 1832 überarbeitet.\n\nAchte auf:\n1. Das Anfangsthema in Bratschen, Celli und Fagotten: rollend wie Wellen\n2. Ein breites, gesangliches zweites Thema in Celli und Fagotten\n3. Stürmische Passagen – und die leise Klarinette am Schluss\n\nAufnahme von Musopen, gemeinfrei. Noten und weitere Aufnahmen findest du in der Bibliothek.",
        'library': [(HEBRIDES, 'Die Hebriden-Ouvertüre – vollständige Aufnahme')],
      },
      {
        'title': 'Eine große Reise: Schottland und Italien', 'type': 'SLIDES', 'minutes': 15,
        'description': "Zwischen 1829 und 1832 sah Mendelssohn Großbritannien, Italien, die Schweiz und Paris. Aus seinen Reisebildern wurden Sinfonien.",
        'slides': [
          {'kind': 'image', 'title': 'Die Fingalshöhle, Staffa', 'text': 'Eine Meereshöhle aus schwarzen Basaltsäulen auf einer winzigen Hebrideninsel. Mendelssohn besuchte sie im August 1829 – er war seekrank, aber die Wellen und das Echo ließen ihn nicht mehr los.', 'image': 'felix_fingal', 'credit': 'Edward Goodall, Fingal’s Cave, Staffa, 1833 (Yale Center for British Art, CC0)'},
          {'kind': 'timeline', 'title': 'Die große Reise, 1829–1832', 'rows': [
              ('1829', 'London – seine ersten Konzerte dort – und Schottland: Holyrood, die Hebriden'),
              ('1830–1831', 'Weimar (ein letzter Besuch bei Goethe), München, Wien, Venedig, Florenz, Rom, Neapel'),
              ('1831', 'Die Schweiz, dann Paris – Begegnung mit Chopin und Liszt'),
              ('1832', 'Wieder London: Die „Hebriden“-Ouvertüre wird aufgeführt')]},
          {'kind': 'listen', 'title': 'Die „Italienische“ Sinfonie', 'work': 'Sinfonie Nr. 4 A-Dur, op. 90 (Uraufführung London, 1833)', 'points': [
              'Der erste Satz sprüht vor Lebensfreude – „das heiterste Stück, das ich gemacht habe“, schrieb Felix aus Rom',
              'Zweiter Satz: eine langsame Prozession – vielleicht Pilger, die er in Neapel sah',
              'Das Finale ist ein „Saltarello“, ein schneller römischer Tanz',
              'Öffne die Aufnahme in der Bibliothek und hör dir den ersten Satz an']},
          {'kind': 'bullets', 'title': 'Die „Schottische“ Sinfonie', 'bullets': [
              'In der verfallenen Kapelle von Holyrood in Edinburgh notierte er 1829 eine Melodie',
              'Die Sinfonie vollendete er erst 1842 – 13 Jahre später',
              'Nebelige, dunkle Farben: ganz anders als die helle „Italienische“',
              'Gewidmet Queen Victoria, die er 1842 im Buckingham-Palast besuchte']},
        ],
        'library': [(ITALIAN, '„Italienische“ Sinfonie – vollständige Aufnahme'), (SCOTTISH, '„Schottische“ Sinfonie – vollständige Aufnahme')],
      },
      {
        'title': 'Rückblick Woche 2 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung von Bach und der großen Reise, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 2 auf einen Blick', 'bullets': [
              '1829: Mendelssohn dirigiert Bachs Matthäus-Passion in Berlin',
              '1829: Schottland und die Hebriden – die Fingalshöhle',
              '1830–1831: Italien, Anregung für die „Italienische“ Sinfonie',
              '1842: Die „Schottische“ Sinfonie wird endlich vollendet']},
        ],
        'quiz': [
          ('Welches vergessene Werk dirigierte Mendelssohn 1829 in Berlin?', ['Händels Messias', 'Bachs Matthäus-Passion', 'Mozarts Requiem', 'Haydns Schöpfung'], 1),
          ('Wie heißt die Hebriden-Ouvertüre noch?', ['Die Fingalshöhle', 'Schottische Sinfonie', 'Das Meer', 'Meeresstille und glückliche Fahrt'], 0),
          ('Welches Land inspirierte seine Sinfonie Nr. 4?', ['Schottland', 'Italien', 'Die Schweiz', 'Frankreich'], 1),
          ('Was für ein Stück ist das Finale der „Italienischen“ Sinfonie?', ['Ein Walzer', 'Ein Saltarello, ein schneller römischer Tanz', 'Eine Fuge', 'Ein Trauermarsch'], 1),
          ('Wem widmete er die „Schottische“ Sinfonie?', ['Goethe', 'Queen Victoria', 'Seiner Schwester Fanny', 'Dem König von Preußen'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 3 – Leipzig: der Dirigent (1833–1842)',
    'lessons': [
      {
        'title': 'Leipzig und das Gewandhaus', 'type': 'SLIDES', 'minutes': 15,
        'description': "Mit 26 wurde Mendelssohn Kapellmeister des Leipziger Gewandhausorchesters – und machte es zu einem der führenden Orchester Europas.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 3', 'title': 'Leipzig: der Dirigent', 'subtitle': '1833 – 1842', **PORTRAIT},
          {'kind': 'timeline', 'title': 'Karriereschritte', 'rows': [
              ('1833', 'Musikdirektor in Düsseldorf'),
              ('1835', 'Kapellmeister des Gewandhausorchesters in Leipzig'),
              ('1836', 'Erstes Oratorium, „Paulus“, uraufgeführt in Düsseldorf'),
              ('1837', 'Heirat mit Cécile Jeanrenaud aus Frankfurt – sie bekommen fünf Kinder'),
              ('1839', 'Uraufführung von Schuberts „Großer“ C-Dur-Sinfonie')]},
          {'kind': 'bullets', 'title': 'Ein neuer Typ Dirigent', 'bullets': [
              'Er war einer der Ersten, die mit Taktstock vor dem Orchester stehend dirigierten',
              'Er probte gründlich und bestand auf Präzision',
              'Seine Programme verbanden neue Musik mit den „Klassikern“: Bach, Händel, Mozart, Beethoven',
              'Er dirigierte die Uraufführungen von Schumanns Erster Sinfonie (1841) und Schuberts „Großer“ C-Dur-Sinfonie']},
          {'kind': 'image', 'title': 'Mendelssohn als Maler', 'text': 'Mendelssohn zeichnete und malte, wo immer er war. Dieses Aquarell von 1838 zeigt Thomaskirche und Thomasschule in Leipzig – wo ein Jahrhundert zuvor Bach gewirkt hatte.', 'image': 'felix_watercolour', 'credit': 'Felix Mendelssohn, Aquarell, 1838 (gemeinfrei)'},
        ],
      },
      {
        'title': 'Hören: Lieder ohne Worte', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [SPRING_SONG, 0],
        'description': "Mendelssohn erfand eine neue Art von Klavierstück: das „Lied ohne Worte“ – eine Melodie, die singt wie eine Stimme, über einer Klavierbegleitung. Er veröffentlichte acht Hefte zu je sechs Stücken, und jede klavierspielende Familie des 19. Jahrhunderts besaß sie.\n\nHier das beliebteste von allen, das „Frühlingslied“ (op. 62 Nr. 6, 1842), in einer Bearbeitung für Harfe, gespielt von Alberto Salvi auf einer Schellackplatte von 1922.\n\nAchte auf:\n1. Die Melodie in der Mitte, umgeben von leichten, perlenden Akkorden\n2. Die kurzen Vorschläge am Anfang der Melodie – wie Vogelgesang\n3. Versuch danach, die Melodie selbst zu singen – sie ist wirklich ein Lied!\n\nEbenfalls in der Bibliothek: „Auf Flügeln des Gesanges“ auf einer Platte von 1917 und die Duette op. 63.",
        'library': [(SPRING_SONG, '„Frühlingslied“ – Schellackplatte, 1922'), ('cmv2ivcds00cu12if78ebppkt', '„Auf Flügeln des Gesanges“ – Schellackplatte, 1917'), ('cmuyfx8j800q42eon7bxmhfla', '„Gruß“, op. 63 Nr. 3 – interaktive Noten')],
      },
      {
        'title': 'Freunde und Familie', 'type': 'SLIDES', 'minutes': 12,
        'description': "Mendelssohn kannte alle – und schrieb Tausende von Briefen. Diese Folien stellen die Menschen um ihn vor.",
        'slides': [
          {'kind': 'bullets', 'title': 'Fanny', 'bullets': [
              'Seine ältere Schwester war seine erste Kritikerin und engste musikalische Freundin',
              '1827 und 1830 veröffentlichte er sechs ihrer Lieder unter seinem eigenen Namen',
              'Doch lange unterstützte er ihren Wunsch nicht, eigene Musik zu veröffentlichen',
              '1846 veröffentlichte sie trotzdem – und er schickte ihr seinen Segen']},
          {'kind': 'bullets', 'title': 'Robert und Clara Schumann', 'bullets': [
              'Robert Schumann bewunderte ihn als „Mozart des 19. Jahrhunderts“',
              'Clara Schumann spielte oft im Gewandhaus unter Mendelssohn',
              'In Leipzig gehörten die drei zum selben musikalischen Kreis',
              'Robert schrieb nach Mendelssohns Tod seine Erinnerungen an ihn nieder']},
          {'kind': 'bullets', 'title': 'England', 'bullets': [
              'Mendelssohn besuchte Großbritannien zehnmal – er war dort ungeheuer beliebt',
              'Queen Victoria und Prinz Albert luden ihn in den Buckingham-Palast ein',
              'Seine Oratorien prägten das britische Musikleben ein Jahrhundert lang']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              '1835: Kapellmeister des Leipziger Gewandhausorchesters',
              '1837: Heirat mit Cécile Jeanrenaud',
              'Er brachte Schuberts „Große“ C-Dur-Sinfonie zur Uraufführung (1839)',
              '„Lieder ohne Worte“: eine neue Art von Klavierstück']},
        ],
      },
      {
        'title': 'Rückblick Woche 3 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der Leipziger Jahre, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 3 auf einen Blick', 'bullets': [
              'Düsseldorf (1833), dann Leipzig (1835)',
              'Ein moderner Dirigent, der die „Klassiker“ zurückbrachte',
              'Uraufführungen von Schuberts „Großer“ C-Dur und Schumanns Erster Sinfonie',
              'Die „Lieder ohne Worte“ – und ein Malerauge']},
        ],
        'quiz': [
          ('Welches Orchester leitete Mendelssohn ab 1835?', ['Die Wiener Philharmoniker', 'Das Leipziger Gewandhausorchester', 'Die Berliner Hofkapelle', 'Das London Philharmonic'], 1),
          ('Wessen „Große“ C-Dur-Sinfonie brachte er 1839 zur Uraufführung?', ['Beethovens', 'Schuberts', 'Mozarts', 'Schumanns'], 1),
          ('Was ist ein „Lied ohne Worte“?', ['Ein Chorstück', 'Ein Klavierstück mit singender Melodie', 'Ein Lied nur auf „la-la“', 'Eine Opernarie'], 1),
          ('Wen heiratete Mendelssohn 1837?', ['Clara Wieck', 'Cécile Jeanrenaud', 'Jenny Lind', 'Fanny Hensel'], 1),
          ('Welches Hobby pflegte Mendelssohn auf allen Reisen?', ['Fotografie', 'Aquarellmalerei', 'Bildhauerei', 'Gärtnern'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 4 – Elias, das Violinkonzert und ein letzter Abschied (1843–1847)',
    'lessons': [
      {
        'title': 'Das Konservatorium und der Elias', 'type': 'SLIDES', 'minutes': 15,
        'description': "In seinen letzten Jahren gründete Mendelssohn eine Musikhochschule, schrieb ein berühmtes Oratorium – und arbeitete viel zu viel.",
        'slides': [
          {'kind': 'bullets', 'title': 'Das Leipziger Konservatorium, 1843', 'bullets': [
              'Mendelssohn gründete das erste Konservatorium Deutschlands',
              'Zu den Lehrern gehörten Robert Schumann und der Geiger Ferdinand David',
              'Studierende kamen aus ganz Europa – später auch der Norweger Edvard Grieg',
              'Heute heißt es Hochschule für Musik und Theater „Felix Mendelssohn Bartholdy“']},
          {'kind': 'bullets', 'title': '„Elias“, 1846', 'bullets': [
              'Ein Oratorium über den alttestamentlichen Propheten Elias',
              'Uraufgeführt beim Musikfest in Birmingham am 26. August 1846, auf Englisch',
              'Mendelssohn dirigierte; das Publikum verlangte acht Nummern als Zugabe',
              'Hör in der Bibliothek „Höre, Israel“ und „Wie lieblich sind die Boten“ (aus dem „Paulus“) auf alten Platten']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              '1843: Gründung des Leipziger Konservatoriums',
              '1846: Uraufführung des „Elias“ in Birmingham',
              'Er arbeitete ohne Pause – als Komponist, Dirigent, Lehrer und Organisator']},
        ],
        'library': [('cmv2j30yn00sg12ifb701vuk6', '„Höre, Israel“ (Elias) – Schellackplatte, 1922'), ('cmv2j1cnw00pc12if2upsauij', '„Wie lieblich sind die Boten“ (Paulus) – Schellackplatte, 1920')],
      },
      {
        'title': 'Video: das Violinkonzert e-Moll', 'type': 'YOUTUBE', 'minutes': 36, 'video': 'https://www.youtube.com/watch?v=lzIvElJ0VnI',
        'description': "Eines der beliebtesten Violinkonzerte überhaupt, gespielt von Nikolaj Szeps-Znaider mit dem Gewandhausorchester unter Riccardo Chailly – Mendelssohns eigenem Orchester.\n\nMendelssohn schrieb es für seinen Freund Ferdinand David, den Konzertmeister des Orchesters, und arbeitete sechs Jahre daran. David spielte die Uraufführung am 13. März 1845 in Leipzig.\n\nAchte auf:\n1. Die Violine setzt fast sofort ein – nicht wie üblich nach einer langen Orchestereinleitung\n2. Die Kadenz (das Solo des Solisten) steht mitten im ersten Satz, nicht am Ende\n3. Ein einzelner Fagottton verbindet den ersten und den zweiten Satz – die drei Sätze werden ohne Pause gespielt",
      },
      {
        'title': 'Hören: ein Requiem für Fanny', 'type': 'AUDIO', 'minutes': 10, 'libraryAudio': [QUARTET6, 0],
        'description': "Am 14. Mai 1847 starb Fanny Hensel plötzlich in Berlin. Felix brach zusammen, als er die Nachricht hörte. Im Sommer in der Schweiz schrieb er das Streichquartett f-Moll, op. 80 – oft „Requiem für Fanny“ genannt. Es ist die aufgewühlteste und dunkelste Musik, die er je schrieb.\n\nMendelssohn starb am 4. November 1847 in Leipzig nach mehreren Schlaganfällen – weniger als sechs Monate nach seiner Schwester. Er war 38.\n\nHör dir den ersten Satz an (Aufnahme von Musopen, gemeinfrei):\n1. Unruhige Tremoli vom ersten Takt an\n2. Plötzliche Ausbrüche und kaum Ruhe\n3. Vergleiche es mit dem fröhlichen Oktett aus Woche 1",
        'library': [(QUARTET6, 'Streichquartett Nr. 6 f-Moll, op. 80 – vollständige Aufnahme'), ('cmuygtiti00ge4kktwiu66wcy', 'Streichquartett Nr. 6 – interaktive Noten')],
      },
      {
        'title': 'Abschluss: Rückblick und Quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Herzlichen Glückwunsch – du bist am Ende des Kurses angekommen! Ein letzter Rückblick, ein Blick auf Mendelssohns Vermächtnis und ein Abschlussquiz.",
        'slides': [
          {'kind': 'timeline', 'title': 'Mendelssohns Leben auf einen Blick', 'rows': [
              ('1809', 'Geboren am 3. Februar in Hamburg'),
              ('1825–1826', 'Das Oktett und die „Sommernachtstraum“-Ouvertüre'),
              ('1829', 'Matthäus-Passion in Berlin; Schottland'),
              ('1835', 'Kapellmeister des Leipziger Gewandhausorchesters'),
              ('1843', 'Gründung des Leipziger Konservatoriums'),
              ('1845–1846', 'Violinkonzert; „Elias“'),
              ('1847', 'Gestorben am 4. November in Leipzig')]},
          {'kind': 'bullets', 'title': 'Vermächtnis', 'bullets': [
              'Nach 1933 verboten die Nationalsozialisten seine Musik wegen seiner jüdischen Herkunft; sein Leipziger Denkmal wurde 1936 entfernt',
              'Heute wird seine Musik überall wieder gespielt – und seit 2008 steht in Leipzig ein neues Denkmal',
              'Seine Bach-Renaissance veränderte, wie wir über die Musik der Vergangenheit denken',
              'Weiter mit den Kursen über Fanny Hensel, Clara Schumann und Bach']},
        ],
        'quiz': [
          ('Wer spielte die Uraufführung des Violinkonzerts?', ['Niccolò Paganini', 'Ferdinand David', 'Joseph Joachim', 'Mendelssohn selbst'], 1),
          ('Welches Oratorium wurde 1846 in Birmingham uraufgeführt?', ['Der Messias', 'Elias', 'Paulus', 'Die Schöpfung'], 1),
          ('Was gründete Mendelssohn 1843 in Leipzig?', ['Ein Orchester', 'Das erste Konservatorium Deutschlands', 'Eine Musikzeitschrift', 'Eine Klavierfabrik'], 1),
          ('Welches Werk wird oft sein „Requiem für Fanny“ genannt?', ['Das Oktett', 'Das Streichquartett f-Moll, op. 80', 'Die „Schottische“ Sinfonie', 'Elias'], 1),
          ('Wie alt war Mendelssohn, als er starb?', ['38', '48', '56', '72'], 0),
          ('Was ist ungewöhnlich am Beginn seines Violinkonzerts?', ['Es beginnt mit einem Paukensolo', 'Die Violine setzt fast sofort ein', 'Es beginnt mit einem Chor', 'Es gibt kein Orchester'], 1),
        ],
      },
    ],
  },
]
