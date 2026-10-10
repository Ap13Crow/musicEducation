# Antonín Dvořák - deutsche Fassung von dvorak.py.
COURSE = {
    'slug': 'dvorak-leben-und-werk-einfuehrung',
    'language': 'de',
    'translationOf': 'dvorak-life-and-music-introduction',
    'title': 'Antonín Dvořák: Leben und Werk – Eine erste Einführung',
    'shortSummary': 'Vier Wochen mit Antonín Dvořák: ein Metzgersohn vom Dorf, der zur Stimme der tschechischen Musik wurde – Slawische Tänze, die Sinfonie „Aus der Neuen Welt“, das „Amerikanische“ Quartett und Rusalka.',
    'description': (
        "Antonín Dvořák (1841–1904) wuchs in einem böhmischen Dorfgasthaus auf, spielte neun Jahre Bratsche in einem Prager Theaterorchester – und wurde "
        "einer der beliebtesten Komponisten der Welt, gefeiert in London und New York.\n\n"
        "In vier Wochen folgst du seinem Leben Schritt für Schritt:\n"
        "- Woche 1 – Vom Dorf nach Prag (1841–1873)\n"
        "- Woche 2 – Brahms, die Slawischen Tänze und der Ruhm (1874–1884)\n"
        "- Woche 3 – Die Neue Welt (1884–1895)\n"
        "- Woche 4 – Wieder zu Hause: Humoreske, Rusalka und Vermächtnis (1895–1904)\n\n"
        "Jede Woche verbindet illustrierte Folien, Aufführungen der Berliner Philharmoniker und des Pavel Haas Quartetts, historische Aufnahmen von Fritz "
        "Kreisler und dem Flonzaley Quartet aus der mymusic.coach-Bibliothek, Noten und ein kurzes Quiz. Vorkenntnisse sind nicht nötig. Plane etwa 1–2 Stunden pro Woche ein."
    ),
    'level': 'BEGINNER',
    'instruments': ['Violin', 'Viola', 'Cello', 'Piano'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'dvorak_portrait', 'title': 'Dvořák', 'subtitle': 'Leben und Werk – Eine erste Einführung', 'tag': '4-Wochen-Kurs'},
}
FOOTER = 'Antonín Dvořák: Leben und Werk'
PORTRAIT = {'image': 'dvorak_portrait', 'credit': 'Antonín Dvořák, Fotografie, 1882 (gemeinfrei)'}
SLAVONIC = 'cmv2ixgfj00go12if8myhxypi'
QUARTET10 = 'cmuygtj1p00jo4kkty6s5jmia'
AMERICAN = 'cmuygtj1q00jq4kktrtycsxum'
HUMORESQUE = 'cmv2irtks007212ifp9xj9u4x'
MOTHER = 'cmv2j3jon00tq12ifnjkgcgxn'

WEEKS = [
  {
    'title': 'Woche 1 – Vom Dorf nach Prag (1841–1873)',
    'lessons': [
      {
        'title': 'Willkommen: Antonín Dvořák', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Willkommen im Kurs! Lerne Antonín Dvořák kennen – und sieh, wie die nächsten vier Wochen ablaufen.\n\nTipp: Alle Musik, die im Kurs vorkommt, ist in den Lektionen verlinkt. Öffne Aufnahmen und Noten in der Bibliothek und sammle zusätzliche XP, wenn du bis zum Ende hörst oder liest.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 1', 'title': 'Antonín Dvořák', 'subtitle': 'Eine erste Einführung in sein Leben und seine Musik', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Warum Dvořák?', 'bullets': [
              'Geboren 1841 in einem böhmischen Dorf – gestorben 1904 in Prag',
              'Neun Sinfonien – die letzte „Aus der Neuen Welt“',
              'Slawische Tänze, das Cellokonzert, das „Amerikanische“ Quartett, die Oper „Rusalka“',
              'Er brachte die Lieder und Tänze Böhmens in den Konzertsaal',
              'So spricht man es: „DWOR-schak“ – das „ř“ ist ein besonderer tschechischer Laut']},
          {'kind': 'timeline', 'title': 'Deine vier Wochen', 'rows': [
              ('Woche 1', 'Vom Dorf nach Prag'),
              ('Woche 2', 'Brahms, die Slawischen Tänze und der Ruhm'),
              ('Woche 3', 'Die Neue Welt'),
              ('Woche 4', 'Wieder zu Hause: Humoreske, Rusalka und Vermächtnis')]},
          {'kind': 'bullets', 'title': 'Böhmen im 19. Jahrhundert', 'bullets': [
              'Böhmen – heute das Herz Tschechiens – gehörte zum Kaisertum Österreich',
              'Deutsch war die Sprache der Verwaltung und der Gebildeten',
              'Tschechische Künstler wollten, dass ihre Sprache, Geschichte und Musik geachtet werden',
              'Bedřich Smetana und Dvořák wurden zu den musikalischen Stimmen dieser Bewegung']},
        ],
      },
      {
        'title': 'Eine Kindheit im Dorfgasthaus', 'type': 'SLIDES', 'minutes': 15,
        'description': "Dvořák sollte Metzger werden wie sein Vater. Die Musik hatte andere Pläne.",
        'slides': [
          {'kind': 'image', 'title': 'Nelahozeves, 8. September 1841', 'text': 'Antonín wurde in diesem Haus in einem Dorf an der Moldau nördlich von Prag geboren. Sein Vater František war Dorfmetzger und Gastwirt – und spielte zum Tanz die Zither. Antonín war das älteste von vierzehn Kindern.', 'image': 'dvorak_birthplace', 'credit': 'Dvořáks Geburtshaus in Nelahozeves (Foto, gemeinfrei)'},
          {'kind': 'bullets', 'title': 'Musik lernen', 'bullets': [
              'Der Dorfschullehrer brachte ihm das Geigenspiel bei; er spielte in der Dorfkapelle und in der Kirche',
              'Mit 12 wurde er nach Zlonice geschickt, um Deutsch zu lernen – nötig für jede Laufbahn',
              'Dort unterrichtete ihn der Organist Antonín Liehmann in Orgel, Bratsche, Klavier und Musiktheorie',
              'Sein Vater wollte noch immer, dass er die Metzgerei übernahm']},
          {'kind': 'timeline', 'title': 'Nach Prag', 'rows': [
              ('1857–1859', 'Studium an der Prager Orgelschule'),
              ('1859', 'Bratschist in Karel Komzáks beliebter Tanzkapelle'),
              ('1862', 'Die Kapelle wird zum Kern des Orchesters des neuen tschechischen Interimstheaters'),
              ('1866', 'Bedřich Smetana wird Dirigent des Theaters')]},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Geboren am 8. September 1841 in Nelahozeves, Sohn eines Metzgers und Gastwirts',
              'Lernte Orgel, Bratsche und Theorie bei Antonín Liehmann in Zlonice',
              'Prager Orgelschule 1857–1859']},
        ],
      },
      {
        'title': 'Hören: Leben und Musik Dvořáks', 'type': 'YOUTUBE', 'minutes': 30, 'video': 'https://www.youtube.com/watch?v=YnVymt9mu8U',
        'description': "Eine Audio-Dokumentation von WETA Classical, dem öffentlichen Klassiksender von Washington, D.C. Sie erzählt Dvořáks Geschichte „von bescheidenen Anfängen bis zum Ruhm“, mit viel Musik. Die Sendung ist auf Englisch und lang – hör jetzt die erste halbe Stunde und den Rest später im Kurs. Bei Bedarf helfen die automatischen Untertitel von YouTube.\n\nAchte beim Hören auf Folgendes:\n1. Wer half Dvořák zu seinem ersten großen Verleger?\n2. Warum ging er nach Amerika?\n3. Was vermisste er am meisten, wenn er fort war?",
      },
      {
        'title': 'Neun Jahre im Orchester – und Quiz zu Woche 1', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "Dvořáks eigentliche Schule war der Orchestergraben. Eine kurze Zusammenfassung und fünf Fragen.",
        'slides': [
          {'kind': 'bullets', 'title': 'Bratschist am Theater', 'bullets': [
              'Von 1862 bis 1871 spielte er Bratsche im Orchester des Interimstheaters',
              'Er lernte die Opern von Mozart, Rossini, Verdi und Smetana von innen kennen',
              '1863 spielte er unter Richard Wagner, der in Prag eigene Werke dirigierte',
              'Er komponierte nachts – Sinfonien, Quartette, eine Oper – und verbrannte später manches davon']},
          {'kind': 'bullets', 'title': 'Erster Erfolg, 1873', 'bullets': [
              'Sein patriotischer Hymnus „Die Erben des Weißen Berges“ war in Prag ein Erfolg',
              '1873 heiratete er die Sängerin Anna Čermáková; sie bekamen neun Kinder',
              'Das Orchester hatte er 1871 verlassen; ab 1874 war er Organist an der St.-Adalbert-Kirche in Prag',
              'Er war 32 – und außerhalb Prags noch fast unbekannt']},
          {'kind': 'summary', 'title': 'Woche 1 auf einen Blick', 'bullets': [
              'Eine Dorfkindheit in Nelahozeves',
              'Orgelschule in Prag, dann neun Jahre Bratschist am Theater',
              'Lernen durch Spielen: Mozart, Verdi, Wagner, Smetana',
              '1873: erster Erfolg, Heirat mit Anna Čermáková']},
        ],
        'quiz': [
          ('Welchen Beruf hatte Dvořáks Vater?', ['Organist', 'Metzger und Gastwirt', 'Lehrer', 'Bauer'], 1),
          ('Warum wurde der junge Dvořák nach Zlonice geschickt?', ['Um Deutsch zu lernen', 'Um Jura zu studieren', 'Um in einer Fabrik zu arbeiten', 'Um Priester zu werden'], 0),
          ('Welches Instrument spielte Dvořák im Theaterorchester?', ['Violine', 'Bratsche', 'Horn', 'Kontrabass'], 1),
          ('Welcher berühmte Komponist leitete ab 1866 das Theaterorchester?', ['Brahms', 'Smetana', 'Liszt', 'Janáček'], 1),
          ('Wen heiratete Dvořák 1873?', ['Josefina Čermáková', 'Anna Čermáková', 'Clara Wieck', 'Bertha Faber'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 2 – Brahms, die Slawischen Tänze und der Ruhm (1874–1884)',
    'lessons': [
      {
        'title': 'Ein Brief von Brahms', 'type': 'SLIDES', 'minutes': 15,
        'description': "Ein staatliches Stipendium für mittellose Künstler machte Johannes Brahms auf Dvořák aufmerksam – und veränderte sein Leben.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 2', 'title': 'Brahms, die Slawischen Tänze und der Ruhm', 'subtitle': '1874 – 1884', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Das österreichische Staatsstipendium', 'bullets': [
              '1874 erhielt Dvořák ein Staatsstipendium für junge, mittellose Künstler – und in späteren Jahren erneut',
              'In der Jury: der Kritiker Eduard Hanslick – und Johannes Brahms',
              'Brahms war von Dvořáks „Klängen aus Mähren“ (Mährische Duette) tief beeindruckt',
              '1877 empfahl er ihn seinem eigenen Verleger, Fritz Simrock in Berlin']},
          {'kind': 'bullets', 'title': 'Slawische Tänze, 1878', 'bullets': [
              'Simrock wünschte sich Tänze wie Brahms’ Ungarische Tänze',
              'Dvořák schrieb acht Slawische Tänze für Klavier zu vier Händen, dann für Orchester',
              'Sie beruhen auf tschechischen Tanzrhythmen wie Furiant und Polka – die Melodien aber sind seine eigenen',
              'Ein riesiger Erfolg: Musikalienhandlungen waren ausverkauft, Orchester überall spielten sie']},
          {'kind': 'bullets', 'title': 'Stabat Mater', 'bullets': [
              'Zwischen 1875 und 1877 verloren Dvořák und Anna drei kleine Kinder',
              'Er verwandelte seine Trauer in eine große Vertonung des „Stabat Mater“ – Maria unter dem Kreuz',
              'Die Aufführung in London 1883 machte ihn in England berühmt']},
        ],
      },
      {
        'title': 'Hören: ein Slawischer Tanz', 'type': 'AUDIO', 'minutes': 6, 'libraryAudio': [SLAVONIC, 0],
        'description': "Der große Geiger Fritz Kreisler liebte Dvořáks Musik und bearbeitete mehrere Slawische Tänze für Violine und Klavier. Hier spielt er einen davon selbst, mit Carl Lamson am Klavier, auf einer Schellackplatte von 1917.\n\nAchte auf:\n1. Eine melancholische, gesangliche Melodie – typisch für Dvořáks „slawischen“ Klang\n2. Kleine Glissandi und Verzierungen in der Violine – wie bei einem Volksmusikanten\n3. Wie die Stimmung von traurig zu verspielt wechselt\n\nEbenfalls in der Bibliothek: zwei weitere Slawische Tänze, gespielt von Jascha Heifetz 1922.",
        'library': [(SLAVONIC, 'Slawischer Tanz – Fritz Kreisler, Violine, 1917'), ('cmv2ixh4q00gq12ifx2upgais', 'Slawischer Tanz Nr. 2 – Jascha Heifetz, 1922'), ('cmv2ixhra00gs12ifluucbdpw', 'Slawischer Tanz Nr. 3 – Jascha Heifetz, 1922')],
      },
      {
        'title': 'Hören: die „Dumka“', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [QUARTET10, 1],
        'description': "Nach den Slawischen Tänzen wollten alle „slawische“ Musik von Dvořák. Das Streichquartett Es-Dur, op. 51 (1879) gab der Primarius des berühmten Florentiner Quartetts in Auftrag – mit genau diesem Wunsch.\n\nDer zweite Satz ist eine „Dumka“: eine slawische Form, die zwischen langsamer, trauriger Klage und schnellem, wildem Tanz wechselt. Dvořák liebte sie – später schrieb er sogar ein ganzes Klaviertrio aus Dumkas, das „Dumky“-Trio.\n\nAchte (Aufnahme von Musopen, gemeinfrei) auf:\n1. Eine melancholische Melodie über gezupften, gitarrenartigen Akkorden\n2. Den plötzlichen Wechsel in einen schnellen, fröhlichen Tanz\n3. Die Rückkehr der Traurigkeit\n\nDie Noten des Quartetts findest du in der Bibliothek.",
        'library': [(QUARTET10, 'Streichquartett Nr. 10 Es-Dur, op. 51 – Aufnahme'), ('cmuygtidh00c14kktnzbxdgch', 'Streichquartett Nr. 10 – interaktive Noten')],
      },
      {
        'title': 'Rückblick Woche 2 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der Jahre des Durchbruchs, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 2 auf einen Blick', 'bullets': [
              '1874: das österreichische Staatsstipendium; Brahms in der Jury',
              '1877: Brahms empfiehlt ihn dem Verleger Simrock',
              '1878: Die Slawischen Tänze machen ihn berühmt',
              'Stabat Mater – Musik aus der Trauer; 1884: erste Reise nach London']},
        ],
        'quiz': [
          ('Welcher berühmte Komponist half Dvořák zu einem Verleger?', ['Wagner', 'Brahms', 'Liszt', 'Tschaikowsky'], 1),
          ('Welcher Verlag druckte die Slawischen Tänze?', ['Simrock', 'Breitkopf & Härtel', 'Ricordi', 'Novello'], 0),
          ('Nach welchem Vorbild entstanden die Slawischen Tänze?', ['Chopins Mazurken', 'Brahms’ Ungarische Tänze', 'Liszts Ungarische Rhapsodien', 'Strauss’ Walzer'], 1),
          ('Was ist eine „Dumka“?', ['Eine tschechische Polka', 'Eine slawische Form zwischen Klage und schnellem Tanz', 'Ein Kirchenlied', 'Eine Art Dudelsack'], 1),
          ('Was regte Dvořáks Stabat Mater an?', ['Ein Auftrag des Papstes', 'Der Tod dreier seiner Kinder', 'Eine Reise nach Rom', 'Seine Hochzeit'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 3 – Die Neue Welt (1884–1895)',
    'lessons': [
      {
        'title': 'Von London nach New York', 'type': 'SLIDES', 'minutes': 15,
        'description': "England empfing Dvořák wie einen Helden. Dann kam ein Angebot aus Amerika, das er nicht ablehnen konnte.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 3', 'title': 'Die Neue Welt', 'subtitle': '1884 – 1895', **PORTRAIT},
          {'kind': 'timeline', 'title': 'Internationaler Ruhm', 'rows': [
              ('1884', 'Dirigiert sein Stabat Mater in der Londoner Royal Albert Hall – die erste von neun Englandreisen'),
              ('1885', 'Sinfonie Nr. 7, geschrieben für die Philharmonic Society of London'),
              ('1889', 'Sinfonie Nr. 8'),
              ('1891', 'Ehrendoktor in Cambridge; Professor am Prager Konservatorium; das „Dumky“-Trio')]},
          {'kind': 'bullets', 'title': 'Eine Einladung nach Amerika', 'bullets': [
              'Jeannette Thurber, Gründerin des National Conservatory of Music in New York, lud ihn als Direktor ein',
              'Das Gehalt betrug ein Vielfaches dessen, was er in Prag verdiente',
              'Im September 1892 kam er mit seiner Frau und zwei der Kinder in New York an',
              'Das Konservatorium stand Frauen und Schwarzen offen – damals ungewöhnlich']},
          {'kind': 'bullets', 'title': 'Musik für Amerika', 'bullets': [
              'Sein Schüler Harry T. Burleigh sang ihm afroamerikanische Spirituals vor',
              'Dvořák sagte amerikanischen Zeitungen, die künftige Musik Amerikas solle aus diesen Melodien und aus der Musik der amerikanischen Ureinwohner wachsen',
              'Viele Amerikaner waren überrascht – manche verärgert',
              'Burleigh wurde später ein berühmter Sänger und Bearbeiter von Spirituals']},
        ],
      },
      {
        'title': 'Video: Sinfonie „Aus der Neuen Welt“ – Largo', 'type': 'YOUTUBE', 'minutes': 14, 'video': 'https://www.youtube.com/watch?v=acurczH-Yt8',
        'description': "Die Sinfonie Nr. 9 e-Moll „Aus der Neuen Welt“ wurde am 16. Dezember 1893 von den New Yorker Philharmonikern in der Carnegie Hall uraufgeführt – ein Triumph. Hier der langsame Satz, das Largo, gespielt von den Berliner Philharmonikern.\n\nAchte auf:\n1. Feierliche Blechbläserakkorde am Anfang\n2. Die berühmte Melodie des Englischhorns – so ähnlich einem Spiritual, dass daraus später das Lied „Goin’ Home“ wurde, mit Worten von Dvořáks Schüler William Arms Fisher\n3. Einen unruhigen Mittelteil – und einen Moment, in dem Themen aus den anderen Sätzen zurückkehren\n\nDie ganze Sinfonie? Die vollständige Aufführung des hr-Sinfonieorchesters findest du auf YouTube: youtube.com/watch?v=jOofzffyDSA",
      },
      {
        'title': 'Spillville und das „Amerikanische“ Quartett', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': ['cmv2iw83r00ei12ifvohs4sv4', 0],
        'description': "Im Sommer 1893 lebte die Familie Dvořák in Spillville, Iowa – einem kleinen Dorf tschechischer Einwanderer. Dvořák spielte in der Kirche Orgel, wanderte durch die Wälder und lauschte den Vögeln. In gut zwei Wochen im Juni schrieb er das Streichquartett F-Dur, op. 96 – das „Amerikanische“.\n\nHier der langsame Satz, das Lento, gespielt 1925 vom Flonzaley Quartet – einem der ersten großen Streichquartette, die Platten aufnahmen.\n\nAchte auf:\n1. Eine lange, traurige Melodie in der Violine, dann im Cello – Heimweh vielleicht\n2. Schlichte, gleichmäßige Begleitung in den anderen Instrumenten\n3. Pentatonische (fünftönige) Melodien, wie in der Volksmusik auf der ganzen Welt\n\nEbenfalls in der Bibliothek: das ganze Quartett (Musopen) und die Noten.",
        'library': [('cmv2iw83r00ei12ifvohs4sv4', '„Amerikanisches“ Quartett: Lento – Flonzaley Quartet, 1925'), (AMERICAN, '„Amerikanisches“ Quartett – vollständige Aufnahme'), ('cmuygtidi00c34kktknas3av8', '„Amerikanisches“ Quartett – interaktive Noten')],
      },
      {
        'title': 'Rückblick Woche 3 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der amerikanischen Jahre, dann fünf Fragen. Wenn du Zeit hast, sieh dir das ganze „Amerikanische“ Quartett mit dem Pavel Haas Quartett an: youtube.com/watch?v=cb3jPORwL74",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 3 auf einen Blick', 'bullets': [
              'Neun Englandreisen; Sinfonien Nr. 7 und 8',
              '1892–1895: Direktor des National Conservatory in New York',
              '1893: die Sinfonie „Aus der Neuen Welt“ in der Carnegie Hall',
              '1893: das „Amerikanische“ Quartett, geschrieben in Spillville, Iowa']},
        ],
        'quiz': [
          ('Wer lud Dvořák nach New York ein?', ['Andrew Carnegie', 'Jeannette Thurber', 'Leonard Bernstein', 'Harry T. Burleigh'], 1),
          ('Wo wurde die Sinfonie „Aus der Neuen Welt“ uraufgeführt?', ['Royal Albert Hall, London', 'Carnegie Hall, New York', 'Rudolfinum, Prag', 'Musikverein, Wien'], 1),
          ('Welches Instrument spielt die berühmte Largo-Melodie?', ['Flöte', 'Englischhorn', 'Trompete', 'Violine'], 1),
          ('Wo schrieb Dvořák das „Amerikanische“ Quartett?', ['New York', 'Spillville, Iowa', 'Chicago', 'Prag'], 1),
          ('Welcher Schüler sang Dvořák Spirituals vor?', ['William Arms Fisher', 'Harry T. Burleigh', 'Scott Joplin', 'George Gershwin'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 4 – Wieder zu Hause: Humoreske, Rusalka und Vermächtnis (1895–1904)',
    'lessons': [
      {
        'title': 'Hören: Humoreske', 'type': 'AUDIO', 'minutes': 5, 'libraryAudio': [HUMORESQUE, 0],
        'description': "Im Sommer 1894, im Urlaub daheim in Böhmen, schrieb Dvořák acht kurze Klavierstücke, die Humoresken op. 101 – mit Skizzen aus seinen amerikanischen Notizbüchern. Nr. 7 in Ges-Dur wurde eine der berühmtesten Melodien der Welt.\n\nHier in Fritz Kreislers Fassung für Violine, gespielt von Kreisler selbst auf einer Platte von 1911.\n\nAchte auf:\n1. Einen hüpfenden, punktierten Rhythmus – leicht und humorvoll\n2. Eine plötzliche Wendung in ein ernsteres Moll in der Mitte\n3. Kreislers berühmten warmen Ton und seine sanften Glissandi\n\nEbenfalls in der Bibliothek: Mischa Elmans Fassung von 1919.",
        'library': [(HUMORESQUE, 'Humoreske – Fritz Kreisler, Violine, 1911'), ('cmv2irz2c007412ifpn7kiyef', 'Humoreske – Mischa Elman, Violine, 1919')],
      },
      {
        'title': 'Zu Hause: das Cellokonzert und Rusalka', 'type': 'SLIDES', 'minutes': 15,
        'description': "1895 kehrte Dvořák nach Böhmen zurück und verließ es nie wieder. Seine letzten Jahre brachten ein großes Konzert – und seine beliebteste Oper.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 4', 'title': 'Wieder zu Hause', 'subtitle': '1895 – 1904', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Das Cellokonzert, 1894–1895', 'bullets': [
              'Geschrieben in New York in seinem letzten amerikanischen Winter',
              'Brahms soll ausgerufen haben: „Warum habe ich nicht gewusst, dass man ein Cellokonzert wie dieses schreiben kann?“',
              'Zu Hause schrieb er den Schluss neu – in Erinnerung an seine gerade verstorbene Schwägerin Josefina, seine erste Liebe',
              'Es ist vielleicht das beliebteste aller Cellokonzerte']},
          {'kind': 'bullets', 'title': '„Rusalka“, 1901', 'bullets': [
              'Eine Märchenoper: Eine Wassernixe verliebt sich in einen Prinzen und gibt ihre Stimme auf, um Mensch zu werden',
              'Uraufgeführt im Nationaltheater Prag am 31. März 1901',
              'Rusalkas „Lied an den Mond“ ist eine der beliebtesten Sopranarien',
              'Sieh sie dir in der nächsten Lektion an']},
          {'kind': 'timeline', 'title': 'Die letzten Jahre', 'rows': [
              ('1895', 'Endgültige Rückkehr nach Prag'),
              ('1896', 'Letzte Reise nach London; sinfonische Dichtungen nach tschechischen Märchen'),
              ('1901', '„Rusalka“; Direktor des Prager Konservatoriums; sein 60. Geburtstag wird im ganzen Land gefeiert'),
              ('1. Mai 1904', 'Stirbt in Prag mit 62 Jahren; beigesetzt auf dem Vyšehrader Friedhof')]},
        ],
      },
      {
        'title': 'Video: das „Lied an den Mond“', 'type': 'YOUTUBE', 'minutes': 6, 'video': 'https://www.youtube.com/watch?v=ZAJmU_pmWJk',
        'description': "Die slowakische Sopranistin Lucia Popp singt „Měsíčku na nebi hlubokém“ – „Mond, hoch am tiefen Himmel“ – aus dem ersten Akt von Rusalka.\n\nRusalka bittet den Mond, dem Prinzen zu sagen, dass sie ihn liebt.\n\nAchte auf:\n1. Schimmernde Harfe und Streicher – Mondlicht auf dem Wasser\n2. Eine lange, schwebende Melodie, die immer höher steigt\n3. Die tschechische Sprache – gesungen nach der Gestalt der Worte\n\nUm die Oper auf der Bühne zu sehen: Der Trailer des Royal Opera House zu seiner Inszenierung ist hier: youtube.com/watch?v=KJMp4ps_CZ0",
      },
      {
        'title': 'Abschluss: Rückblick und Quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Herzlichen Glückwunsch – du bist am Ende des Kurses angekommen! Ein letzter Rückblick, ein Lied zum Lesen und ein Abschlussquiz.",
        'slides': [
          {'kind': 'timeline', 'title': 'Dvořáks Leben auf einen Blick', 'rows': [
              ('1841', 'Geboren am 8. September in Nelahozeves'),
              ('1862–1871', 'Bratschist im Orchester des Interimstheaters'),
              ('1878', 'Slawische Tänze – internationaler Ruhm'),
              ('1884', 'Erste Englandreise'),
              ('1892–1895', 'Direktor in New York; Sinfonie „Aus der Neuen Welt“'),
              ('1901', '„Rusalka“'),
              ('1904', 'Gestorben am 1. Mai in Prag')]},
          {'kind': 'listen', 'title': 'Zum Mitlesen: „Als die alte Mutter“', 'work': 'Zigeunermelodien, op. 55 Nr. 4 (1880)', 'points': [
              'Ein Lied von einer Mutter, die weinte, während sie ihrem Kind vorsang – und nun weint auch das Kind',
              'Eine seiner berühmtesten Melodien',
              'Lies die Noten – und hör dann die Sopranistin Geraldine Farrar, die es 1922 sang']},
        ],
        'library': [('cmuygw9qm021b4kkto9nvmeeq', '„Als die alte Mutter“ – Noten'), (MOTHER, '„Songs My Mother Taught Me“ – Geraldine Farrar, 1922')],
        'quiz': [
          ('Welches Stück Dvořáks machte Kreisler auf der Violine berühmt?', ['Das Cellokonzert', 'Die Humoreske Nr. 7', 'Das Largo', 'Rusalka'], 1),
          ('Wer ist Rusalka?', ['Ein tschechischer Tanz', 'Eine Wassernixe in einer Märchenoper', 'Ein Dorf bei Prag', 'Ein Streichquartett'], 1),
          ('An wen richtet Rusalka ihre berühmte Arie?', ['An die Sonne', 'An den Mond', 'An den Fluss', 'An die Mutter des Prinzen'], 1),
          ('Wo schrieb Dvořák sein Cellokonzert?', ['Prag', 'New York', 'London', 'Wien'], 1),
          ('In welchem Jahr starb Dvořák?', ['1895', '1901', '1904', '1914'], 2),
          ('Wo ist Dvořák begraben?', ['In Nelahozeves', 'Auf dem Vyšehrader Friedhof in Prag', 'Auf dem Wiener Zentralfriedhof', 'In Spillville'], 1),
        ],
      },
    ],
  },
]
