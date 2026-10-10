# Johannes Brahms - deutsche Fassung von brahms.py.
COURSE = {
    'slug': 'brahms-leben-und-werk-einfuehrung',
    'language': 'de',
    'translationOf': 'brahms-life-and-music-introduction',
    'title': 'Johannes Brahms: Leben und Werk – Eine erste Einführung',
    'shortSummary': 'Vier Wochen mit Johannes Brahms: von der Hafenstadt Hamburg nach Wien – die Schumanns, ein Deutsches Requiem, die Ungarischen Tänze, das Wiegenlied und vier große Sinfonien.',
    'description': (
        "Johannes Brahms (1833–1897) wuchs in Hamburg in Armut auf, wurde mit zwanzig von Robert Schumann als kommendes Genie gefeiert und wurde in Wien "
        "zum großen Bewahrer der klassischen Tradition – und schrieb zugleich einige der wärmsten, leidenschaftlichsten Werke der Romantik.\n\n"
        "In vier Wochen folgst du seinem Leben Schritt für Schritt:\n"
        "- Woche 1 – Hamburg: ein Musikersohn (1833–1853)\n"
        "- Woche 2 – Die Schumanns und ein Deutsches Requiem (1853–1868)\n"
        "- Woche 3 – Wien und die Schritte eines Riesen: die Sinfonien (1862–1885)\n"
        "- Woche 4 – Späte Werke, Abschied und Vermächtnis (1886–1897)\n\n"
        "Jede Woche verbindet illustrierte Folien, eine Dokumentation und die Berliner Philharmoniker, Sinfonien und eine Platte von 1913 aus der "
        "mymusic.coach-Bibliothek, interaktive Noten seiner Lieder und ein kurzes Quiz. Vorkenntnisse sind nicht nötig. Plane etwa 1–2 Stunden pro Woche ein."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin', 'Voice'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'brahms_portrait', 'title': 'Brahms', 'subtitle': 'Leben und Werk – Eine erste Einführung', 'tag': '4-Wochen-Kurs'},
}
FOOTER = 'Johannes Brahms: Leben und Werk'
PORTRAIT = {'image': 'brahms_portrait', 'credit': 'Fotografie von C. Brasch, Berlin, 1889 (gemeinfrei)'}
YOUNG = {'image': 'brahms_young', 'credit': 'Zeichnung von Bonaventure Laurens, Düsseldorf 1853 (gemeinfrei)'}
SYMPHONY1 = 'cmuygtj1x00jz4kktyutlvk6x'
SYMPHONY4 = 'cmuygtizg00jk4kktfa0bejsv'
CRADLE = 'cmv2iqfgj004a12if6pg0lp0b'
HUNGARIAN5 = 'cmv2is2is007a12ifdj5md9d0'

WEEKS = [
  {
    'title': 'Woche 1 – Hamburg: ein Musikersohn (1833–1853)',
    'lessons': [
      {
        'title': 'Willkommen: Johannes Brahms', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Willkommen im Kurs! Lerne den Mann mit dem berühmten Bart kennen – der einmal ein schlanker, schüchterner junger Pianist war – und sieh, wie die nächsten vier Wochen ablaufen.\n\nTipp: Alle Musik, die im Kurs vorkommt, ist in den Lektionen verlinkt. Öffne sie in der Bibliothek, lies die Noten mit und sammle zusätzliche XP, wenn du bis zum Ende hörst oder liest.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 1', 'title': 'Johannes Brahms', 'subtitle': 'Eine erste Einführung in sein Leben und seine Musik', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Warum Brahms?', 'bullets': [
              'Geboren 1833 in Hamburg – gestorben 1897 in Wien',
              'Vier Sinfonien, zwei Klavierkonzerte, ein Violinkonzert, „Ein deutsches Requiem“',
              'Über 200 Lieder, Kammermusik, Klavierstücke – und die Ungarischen Tänze',
              'Sein „Wiegenlied“ ist eine der bekanntesten Melodien der Welt',
              'Er verband die Formen von Bach und Beethoven mit romantischer Wärme']},
          {'kind': 'timeline', 'title': 'Deine vier Wochen', 'rows': [
              ('Woche 1', 'Hamburg: ein Musikersohn'),
              ('Woche 2', 'Die Schumanns und ein Deutsches Requiem'),
              ('Woche 3', 'Wien und die Schritte eines Riesen: die Sinfonien'),
              ('Woche 4', 'Späte Werke, Abschied und Vermächtnis')]},
          {'kind': 'bullets', 'title': 'Die „drei großen B“', 'bullets': [
              'Der Dirigent Hans von Bülow nannte Bach, Beethoven und Brahms die „drei großen B“ der Musik',
              'Brahms war ein moderner Komponist, der die Musik der Vergangenheit liebte',
              'Er studierte alte Musik gründlich: Bach, Händel, Schütz, sogar Komponisten der Renaissance',
              'Schönberg nannte ihn später „Brahms der Fortschrittliche“']},
        ],
      },
      {
        'title': 'Eine Kindheit am Hafen', 'type': 'SLIDES', 'minutes': 15,
        'description': "Brahms wuchs in einer armen Familie im engen Hamburger Hafenviertel auf. Die Musik war sein Ausweg.",
        'slides': [
          {'kind': 'bullets', 'title': 'Hamburg, 7. Mai 1833', 'bullets': [
              'Sein Vater Johann Jakob war Kontrabassist in Tanzkapellen und Theaterorchestern',
              'Seine Mutter Christiane war Näherin und 17 Jahre älter als ihr Mann',
              'Die Familie wohnte in kleinen Zimmern in der Altstadt nahe dem Hafen',
              'Johannes lernte vom Vater Geige und Cello – liebte aber das Klavier']},
          {'kind': 'bullets', 'title': 'Zwei gute Lehrer', 'bullets': [
              'Mit sieben begann er Klavierunterricht bei Otto Friedrich Cossel',
              'Cossel schickte ihn zu seinem eigenen Lehrer, Eduard Marxsen, einem der besten Musiker Hamburgs',
              'Marxsen lehrte ihn Bach und Beethoven – und das Komponieren',
              'Mit zehn trat Johannes öffentlich auf; ein Angebot für eine Amerika-Tournee lehnten seine Lehrer ab']},
          {'kind': 'bullets', 'title': 'Früh Geld verdienen', 'bullets': [
              'Als Jugendlicher spielte er in Gasthäusern und Lokalen zum Tanz, um die Familie zu unterstützen',
              'Später erzählte er Freunden düstere Geschichten über diese Nächte – die Forschung streitet noch, wie wahr sie sind',
              'Er bearbeitete auch Unterhaltungsmusik für Verleger unter falschen Namen',
              'Und er las alles: Gedichte, Volkslieder, Geschichte']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Geboren am 7. Mai 1833 in Hamburg, Sohn eines Kontrabassisten',
              'Lehrer: Otto Cossel und Eduard Marxsen',
              'Ein Jugendlicher, der für Geld spielte – und jede freie Stunde las und komponierte']},
        ],
      },
      {
        'title': 'Video: Brahms – sein Leben und seine Orte', 'type': 'YOUTUBE', 'minutes': 22, 'video': 'https://www.youtube.com/watch?v=DyVmw5u9vjI',
        'description': "Diese Dokumentation von opera-inside folgt Brahms von Hamburg nach Düsseldorf, Wien und in die Sommerfrischen, in denen er komponierte – die ganze Zeit begleitet von seiner Musik. Das Video ist auf Englisch – schalte bei Bedarf die automatischen Untertitel von YouTube ein.\n\nAchte beim Anschauen auf Folgendes:\n1. Welche Rolle spielten Robert und Clara Schumann in seinem Leben?\n2. Warum dauerte seine erste Sinfonie so lange?\n3. Wo verbrachte er seine Sommer zum Komponieren?\n\nAlles kommt in den nächsten Wochen wieder.",
      },
      {
        'title': '1853: der Weg nach Düsseldorf – und Quiz zu Woche 1', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "1853 brach Brahms zu einer Konzertreise auf. Am Ende des Jahres war er berühmt.",
        'slides': [
          {'kind': 'title', 'week': '1853', 'title': 'Der Weg nach Düsseldorf', 'subtitle': 'Brahms mit 20', **YOUNG},
          {'kind': 'timeline', 'title': 'Das Jahr, das alles veränderte', 'rows': [
              ('Frühjahr 1853', 'Eine Tournee mit dem ungarischen Geiger Ede Reményi – Brahms hört ungarische „Zigeunermusik“'),
              ('Mai 1853', 'In Hannover lernt er den großen Geiger Joseph Joachim kennen, der ein lebenslanger Freund wird'),
              ('Juni 1853', 'In Weimar trifft er Franz Liszt – fühlt sich in dessen Kreis aber nicht zu Hause'),
              ('30. Sept. 1853', 'Mit einem Brief Joachims klopft er bei den Schumanns in Düsseldorf an')]},
          {'kind': 'summary', 'title': 'Woche 1 auf einen Blick', 'bullets': [
              'Geboren 1833 in Hamburg, Sohn eines Kontrabassisten',
              'Von Cossel und Marxsen in Bach und Beethoven ausgebildet',
              'Als Jugendlicher spielte er für Geld',
              '1853: Reményi, Joachim, Liszt – und die Schumanns']},
        ],
        'quiz': [
          ('In welcher Stadt wurde Brahms geboren?', ['Wien', 'Hamburg', 'Berlin', 'Leipzig'], 1),
          ('Welches Instrument spielte Brahms’ Vater?', ['Klavier', 'Kontrabass', 'Trompete', 'Orgel'], 1),
          ('Wer war Brahms’ wichtigster Lehrer in Hamburg?', ['Eduard Marxsen', 'Robert Schumann', 'Franz Liszt', 'Felix Mendelssohn'], 0),
          ('Welcher Geiger wurde 1853 sein lebenslanger Freund?', ['Ede Reményi', 'Joseph Joachim', 'Niccolò Paganini', 'Pablo de Sarasate'], 1),
          ('Wer sind die „drei großen B“ der Musik?', ['Bach, Beethoven, Brahms', 'Bach, Bruckner, Berlioz', 'Beethoven, Bellini, Bizet', 'Brahms, Bartók, Britten'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Woche 2 – Die Schumanns und ein Deutsches Requiem (1853–1868)',
    'lessons': [
      {
        'title': 'Robert und Clara Schumann', 'type': 'SLIDES', 'minutes': 15,
        'description': "Robert Schumann nannte ihn öffentlich ein Genie – und erkrankte dann. Brahms stand Clara für den Rest ihres Lebens zur Seite.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 2', 'title': 'Die Schumanns und ein Deutsches Requiem', 'subtitle': '1853 – 1868', **YOUNG},
          {'kind': 'bullets', 'title': '„Neue Bahnen“, Oktober 1853', 'bullets': [
              'Robert Schumann hörte Brahms seine eigenen Sonaten spielen und war überwältigt',
              'In seiner Zeitschrift schrieb er den Artikel „Neue Bahnen“',
              'Er nannte Brahms den Jungen, der „berufen wäre, den höchsten Ausdruck der Zeit in idealer Weise auszusprechen“',
              'Plötzlich war der Zwanzigjährige berühmt – und stand unter enormem Druck']},
          {'kind': 'bullets', 'title': '1854–1856', 'bullets': [
              'Im Februar 1854 erkrankte Robert Schumann schwer und kam in eine Heilanstalt',
              'Brahms zog nach Düsseldorf, um Clara und ihren sieben Kindern zu helfen',
              'Er verliebte sich tief in Clara, die 14 Jahre älter war',
              'Nach Roberts Tod 1856 blieben sie vierzig Jahre lang enge Freunde – er heiratete nie']},
          {'kind': 'bullets', 'title': 'Klavierkonzert Nr. 1, 1859', 'bullets': [
              'Es begann als Sonate für zwei Klaviere, wurde dann eine Sinfonie und schließlich ein Konzert',
              'Sein stürmischer Beginn wird oft mit dem Schock über Schumanns Krankheit verbunden',
              'Bei der Leipziger Aufführung im Januar 1859 zischte das Publikum',
              'Brahms schrieb an Joachim: „Ich experimentiere und tappe noch“ – und machte weiter']},
        ],
      },
      {
        'title': 'Hören: die Ungarischen Tänze', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [HUNGARIAN5, 0],
        'description': "Die Tournee mit Reményi 1853 machte Brahms mit dem feurigen Stil ungarischer Roma-Kapellen bekannt. Er sammelte ihre Melodien, und 1869 veröffentlichte er die ersten Ungarischen Tänze für Klavier zu vier Händen. Sie wurden ein riesiger Erfolg und machten ihn wohlhabend.\n\nBrahms nannte sie „Bearbeitungen“, nicht eigene Kompositionen, weil die meisten Melodien populäre Weisen waren. Joachim bearbeitete sie für Violine und Klavier.\n\nHier die Nr. 5 – die berühmteste – in Joachims Bearbeitung auf einer Edison-Platte von 1913.\n\nAchte auf:\n1. Plötzliche Tempowechsel – langsam, dann sehr schnell\n2. Den feurigen, schluchzenden Stil der Violine\n3. Einen fröhlichen Mittelteil in Dur\n\nSieh dir danach in der nächsten Lektion die Orchesterfassung mit den Berliner Philharmonikern an.",
        'library': [(HUNGARIAN5, 'Ungarischer Tanz Nr. 5 – Schellackplatte, 1913'), ('cmv2is0ce007812if2ho6w8s1', 'Ungarischer Tanz Nr. 1 – Philadelphia Orchestra, 1922')],
      },
      {
        'title': 'Ein Deutsches Requiem und das Wiegenlied', 'type': 'SLIDES', 'minutes': 15,
        'description': "Zwei sehr unterschiedliche Werke aus denselben Jahren: ein großes Chor-Requiem für die Lebenden – und ein Wiegenlied für das Baby einer Freundin.",
        'slides': [
          {'kind': 'bullets', 'title': '„Ein deutsches Requiem“', 'bullets': [
              '1865 starb Brahms’ Mutter; die Arbeit am Requiem wurde dringlicher',
              'Keine lateinische Totenmesse: Brahms wählte die deutschen Bibeltexte selbst aus',
              'Es tröstet die Lebenden: „Selig sind, die da Leid tragen, denn sie sollen getröstet werden“',
              'Erstmals aufgeführt im Bremer Dom am Karfreitag 1868; alle sieben Sätze 1869 in Leipzig',
              'Es machte Brahms in ganz Europa berühmt']},
          {'kind': 'listen', 'title': 'Das „Wiegenlied“', 'work': 'Wiegenlied, op. 49 Nr. 4 (1868)', 'points': [
              '„Guten Abend, gut’ Nacht“ – geschrieben für den zweiten Sohn seiner Freundin Bertha Faber',
              'Die Klavierbegleitung zitiert ein Wiener Lied, das Bertha ihm Jahre zuvor vorgesungen hatte',
              'Eine schlichte, wiegende Melodie, die heute die ganze Welt kennt',
              'Lies die Noten und hör den großen Pianisten Alfred Cortot auf einer Aufnahme von 1925']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              '1853: Schumanns „Neue Bahnen“ machen Brahms berühmt',
              'Lebenslange Freundschaft mit Clara Schumann',
              '1868–1869: „Ein deutsches Requiem“ – sein Durchbruch',
              '1868: das Wiegenlied; 1869: die Ungarischen Tänze']},
        ],
        'library': [('cmuyfx7o3003t2eon3amkh63k', 'Wiegenlied, op. 49 Nr. 4 – interaktive Noten'), (CRADLE, 'Wiegenlied – Alfred Cortot, Klavier, 1925')],
      },
      {
        'title': 'Rückblick Woche 2 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der Schumann-Jahre und des Requiems, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 2 auf einen Blick', 'bullets': [
              '„Neue Bahnen“: Schumanns berühmter Artikel über den zwanzigjährigen Brahms',
              '1854: Roberts Krankheit; Brahms unterstützt Clara',
              '1859: Das Erste Klavierkonzert wird in Leipzig ausgezischt',
              '1868: „Ein deutsches Requiem“ – und das Wiegenlied']},
        ],
        'quiz': [
          ('Wie hieß Schumanns Artikel über Brahms?', ['„Hut ab, ihr Herren“', '„Neue Bahnen“', '„Die Musik der Zukunft“', '„Ein junges Genie“'], 1),
          ('Was ist das Besondere an den Texten von „Ein deutsches Requiem“?', ['Sie sind lateinisch', 'Brahms wählte die deutschen Bibeltexte selbst aus', 'Sie stammen von Goethe', 'Es gibt keine Worte'], 1),
          ('Für wen schrieb Brahms sein „Wiegenlied“?', ['Für Clara Schumanns Tochter', 'Für den kleinen Sohn seiner Freundin Bertha Faber', 'Für seinen eigenen Sohn', 'Für Queen Victoria'], 1),
          ('Was geschah 1859 bei der Leipziger Aufführung seines Ersten Klavierkonzerts?', ['Ein großer Erfolg', 'Das Publikum zischte', 'Es wurde abgesagt', 'Brahms wurde krank'], 1),
          ('Wie bezeichnete Brahms seine Ungarischen Tänze?', ['Als seine größten Werke', 'Als Bearbeitungen populärer Melodien', 'Als Sinfonien', 'Als Kirchenmusik'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 3 – Wien und die Schritte eines Riesen (1862–1885)',
    'lessons': [
      {
        'title': 'Wien und die Erste Sinfonie', 'type': 'SLIDES', 'minutes': 15,
        'description': "Brahms ließ sich in Wien nieder, der Stadt Beethovens und Schuberts. Eine Sinfonie nach Beethoven zu schreiben, kostete ihn mehr als zwanzig Jahre.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 3', 'title': 'Wien und die Schritte eines Riesen', 'subtitle': '1862 – 1885', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Ein Wiener aus Hamburg', 'bullets': [
              'Brahms kam 1862 zum ersten Mal nach Wien und blieb bald für immer',
              'Er leitete die Singakademie und später die Konzerte der Gesellschaft der Musikfreunde',
              'Ab 1872 wohnte er in einer bescheidenen Wohnung in der Karlsgasse 4',
              'Jeden Sommer verließ er die Stadt, um auf dem Land zu komponieren']},
          {'kind': 'quote', 'quote': 'Du hast keinen Begriff davon, wie es unsereinem zu Mute ist, wenn er immer so einen Riesen hinter sich marschieren hört.', 'by': 'Brahms über Beethoven, nach der Erinnerung des Dirigenten Hermann Levi'},
          {'kind': 'bullets', 'title': 'Sinfonie Nr. 1 c-Moll, 1876', 'bullets': [
              'Erste Skizzen in den 1850er-Jahren; vollendet erst 1876, mit 43',
              'Uraufgeführt in Karlsruhe am 4. November 1876',
              'Die große Melodie des Finales klingt wie Beethovens „Freude, schöner Götterfunken“ – Brahms sagte: „Das sieht jeder Esel“',
              'Hans von Bülow nannte sie „Beethovens Zehnte“']},
        ],
      },
      {
        'title': 'Hören: die Erste Sinfonie', 'type': 'AUDIO', 'minutes': 17, 'libraryAudio': [SYMPHONY1, 3],
        'description': "Hier der letzte Satz der Sinfonie Nr. 1 (Aufnahme von Musopen, gemeinfrei) – der Moment, in dem die Musik nach langem, dunklem Ringen nach C-Dur durchbricht.\n\nAchte auf:\n1. Eine langsame, geheimnisvolle Einleitung in Moll\n2. Ein Solohorn spielt eine weite Alphorn-Melodie – Brahms hatte sie Clara 1868 auf einer Geburtstagskarte aus der Schweiz geschickt, mit den Worten „Hoch auf’m Berg, tief im Tal, grüß ich dich viel tausendmal!“\n3. Einen feierlichen Choral der Posaunen\n4. Dann das große Hauptthema in den Streichern – das alle an Beethoven erinnerte\n\nDie ganze Sinfonie findest du in der Bibliothek.",
        'library': [(SYMPHONY1, 'Sinfonie Nr. 1 c-Moll – vollständige Aufnahme')],
      },
      {
        'title': 'Video: Ungarischer Tanz Nr. 5', 'type': 'YOUTUBE', 'minutes': 3, 'video': 'https://www.youtube.com/watch?v=QAMxkietiik',
        'description': "Claudio Abbado dirigiert die Berliner Philharmoniker in der Orchesterfassung des Ungarischen Tanzes Nr. 5.\n\nVergleiche mit der Violinaufnahme von 1913 aus Woche 2:\n1. Welche Fassung ist feuriger?\n2. Wie nutzt das Orchester die plötzlichen Tempowechsel?\n3. Welche Instrumente bekommen die Melodie?\n\nDenk darüber nach: Brahms’ leichte Musik machte ihn wohlhabend – und gab ihm die Freiheit, sich zwanzig Jahre Zeit für eine Sinfonie zu lassen.",
      },
      {
        'title': 'Die großen Jahre – und Quiz zu Woche 3', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "Nach der Ersten Sinfonie öffneten sich die Schleusen. Eine Zusammenfassung und fünf Fragen.",
        'slides': [
          {'kind': 'timeline', 'title': 'Meisterwerke, 1877–1885', 'rows': [
              ('1877', 'Sinfonie Nr. 2 – sonnig, in einem Sommer am Wörthersee geschrieben'),
              ('1878', 'Violinkonzert, für Joseph Joachim'),
              ('1880', 'Akademische Festouvertüre – Dank für einen Ehrendoktor, gebaut aus Studentenliedern'),
              ('1881', 'Klavierkonzert Nr. 2'),
              ('1883', 'Sinfonie Nr. 3'),
              ('1885', 'Sinfonie Nr. 4')]},
          {'kind': 'bullets', 'title': 'Brahms gegen Wagner?', 'bullets': [
              'Kritiker wie Eduard Hanslick machten Brahms zum Helden der „absoluten“ Musik',
              'Ihre Gegner priesen Wagners und Liszts „Musik der Zukunft“',
              'Die Zeitungen liebten den Streit; Brahms selbst bewunderte Wagners Können',
              'Heute können wir einfach beide genießen']},
        ],
        'quiz': [
          ('In welcher Stadt ließ sich Brahms nieder?', ['Hamburg', 'Wien', 'Leipzig', 'Berlin'], 1),
          ('Wie alt war Brahms bei der Uraufführung seiner Ersten Sinfonie?', ['23', '33', '43', '53'], 2),
          ('Wer nannte die Erste Sinfonie „Beethovens Zehnte“?', ['Clara Schumann', 'Hans von Bülow', 'Richard Wagner', 'Eduard Hanslick'], 1),
          ('Für wen schrieb Brahms sein Violinkonzert?', ['Reményi', 'Joseph Joachim', 'Paganini', 'Clara Schumann'], 1),
          ('Worauf ist die Akademische Festouvertüre aufgebaut?', ['Auf Kirchenliedern', 'Auf Studentenliedern', 'Auf ungarischen Tänzen', 'Auf Hamburger Volksliedern'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 4 – Späte Werke, Abschied und Vermächtnis (1886–1897)',
    'lessons': [
      {
        'title': 'Hören: die Vierte Sinfonie', 'type': 'AUDIO', 'minutes': 12, 'libraryAudio': [SYMPHONY4, 3],
        'description': "Brahms’ letzte Sinfonie (1885) endet mit einem Satz wie kein anderes Sinfoniefinale: 30 Variationen über ein wiederholtes achttaktiges Thema – eine Passacaglia, eine alte Barockform. Das Thema ist dem Schlusssatz von Bachs Kantate Nr. 150 nachgebildet.\n\nAchte (Aufnahme von Musopen, gemeinfrei) auf:\n1. Das Thema: acht laute Akkorde in Bläsern und Posaunen\n2. Ein langes, einsames Flötensolo in der Mitte, im langsamen Tempo\n3. Die Posaunen, die mit dem Thema als feierlichem Choral zurückkehren\n4. Einen dramatischen, tragischen Schluss in e-Moll\n\nHier sind die alte Bach-Tradition und die romantische Sinfonie in einem Satz vereint. Die ganze Sinfonie findest du in der Bibliothek.",
        'library': [(SYMPHONY4, 'Sinfonie Nr. 4 e-Moll – vollständige Aufnahme')],
      },
      {
        'title': 'Späte Werke und Abschied', 'type': 'SLIDES', 'minutes': 15,
        'description': "1890 wollte Brahms mit dem Komponieren aufhören. Ein Klarinettist brachte ihn davon ab.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 4', 'title': 'Späte Werke und Abschied', 'subtitle': '1886 – 1897', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Das letzte Kapitel', 'bullets': [
              '1890: Brahms dachte daran, sich zur Ruhe zu setzen',
              '1891: In Meiningen hörte er den Klarinettisten Richard Mühlfeld und schrieb vier Werke für ihn, darunter das Klarinettenquintett',
              '1892–1893: zwanzig kurze Klavierstücke, op. 116–119 – innig und herbstlich',
              'Das Intermezzo op. 118 Nr. 2 ist eines der beliebtesten; das Heft ist Clara gewidmet']},
          {'kind': 'bullets', 'title': '1896–1897', 'bullets': [
              'Im Mai 1896, als Clara Schumann im Sterben lag, schrieb er die „Vier ernsten Gesänge“ nach Bibeltexten',
              'Clara starb am 20. Mai 1896; Brahms verpasste fast ihre Beerdigung, weil er den falschen Zug nahm',
              'Er war bereits an Leberkrebs erkrankt, an dem auch sein Vater gestorben war',
              'Er starb am 3. April 1897 in Wien und ist nahe Beethoven und Schubert begraben']},
          {'kind': 'listen', 'title': 'Zum Mitlesen', 'work': 'Intermezzo A-Dur, op. 118 Nr. 2', 'points': [
              'Eine zärtliche Melodie, die eine Frage zu stellen scheint',
              'Die Antwort ist dieselbe Melodie, auf den Kopf gestellt',
              'Ein dunklerer Mittelteil – dann wieder die Frage',
              'Öffne die Noten in der Bibliothek']},
        ],
        'library': [('cmuygw9cz01vx4kktx94zuyj2', 'Intermezzo, op. 118 Nr. 2 – Noten'), ('cmuyfx7nv003f2eonhfi0j60a', '„O Tod, wie bitter bist du“ (Vier ernste Gesänge) – interaktive Noten')],
      },
      {
        'title': 'Lesen: Brahms’ Lieder', 'type': 'SLIDES', 'minutes': 10,
        'description': "Brahms schrieb über 200 Lieder. Hier sind drei, die du in der Bibliothek lesen kannst.",
        'slides': [
          {'kind': 'bullets', 'title': 'Ein Liedkomponist mit Wurzeln im Volkslied', 'bullets': [
              'Brahms liebte deutsche Volkslieder und bearbeitete Dutzende davon',
              'Sein Ideal: eine Melodie so natürlich, als hätte es sie schon immer gegeben',
              'Er schrieb oft für tiefe Stimmen – er mochte warme, dunkle Farben']},
          {'kind': 'listen', 'title': 'Drei Lieder zum Lesen', 'work': 'Lieder aus der mymusic.coach-Bibliothek', 'points': [
              '„Von ewiger Liebe“ (op. 43 Nr. 1): ein dramatisches Zwiegespräch zweier Liebender',
              '„Die Mainacht“ (op. 43 Nr. 2): eine langsame, einsame Nacht im Mai',
              '„Wie bist du, meine Königin“ (op. 32 Nr. 9): ein hingerissenes Liebeslied',
              'Öffne die interaktiven Noten und folge Stimme und Klavier']},
          {'kind': 'bullets', 'title': 'Vermächtnis', 'bullets': [
              'Dvořák verdankte Brahms seinen ersten Durchbruch – siehe den Kurs über Dvořák',
              'Schönberg bewunderte seine Techniken, eine Melodie zu entwickeln',
              'Seine Sinfonien und Konzerte stehen im Zentrum des Orchesterrepertoires',
              'Als Freund von Johann Strauss (Sohn) schrieb er auf den Fächer von dessen Frau Adele das Thema des „Donauwalzers“: „Leider nicht von Johannes Brahms“']},
        ],
        'library': [('cmuyfx7nw003h2eonnbz6isg0', '„Von ewiger Liebe“, op. 43 – interaktive Noten'), ('cmuyfx7nw003i2eonp5lv7at1', '„Die Mainacht“, op. 43 – interaktive Noten'), ('cmuyfx7rf005t2eonamwbfokb', '„Wie bist du, meine Königin“, op. 32 – interaktive Noten')],
      },
      {
        'title': 'Abschluss: Rückblick und Quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Herzlichen Glückwunsch – du bist am Ende des Kurses angekommen! Ein letzter Rückblick und ein Abschlussquiz über alle vier Wochen.",
        'slides': [
          {'kind': 'timeline', 'title': 'Brahms’ Leben auf einen Blick', 'rows': [
              ('1833', 'Geboren am 7. Mai in Hamburg'),
              ('1853', 'Joachim, Liszt und die Schumanns; „Neue Bahnen“'),
              ('1862', 'Erster Besuch in Wien, bald seine Heimat'),
              ('1868', '„Ein deutsches Requiem“; das Wiegenlied'),
              ('1876', 'Sinfonie Nr. 1'),
              ('1885', 'Sinfonie Nr. 4'),
              ('1897', 'Gestorben am 3. April in Wien')]},
        ],
        'quiz': [
          ('Welche alte Barockform beschließt die Vierte Sinfonie?', ['Eine Fuge', 'Eine Passacaglia – Variationen über ein wiederholtes Thema', 'Ein Menuett', 'Eine Toccata'], 1),
          ('Für welches Instrument schrieb Brahms seine späten Kammermusikwerke für Mühlfeld?', ['Flöte', 'Klarinette', 'Horn', 'Oboe'], 1),
          ('Welche Klavierstücke sind Clara Schumann gewidmet?', ['Die Ungarischen Tänze', 'Die sechs Stücke op. 118', 'Die Walzer op. 39', 'Die Balladen op. 10'], 1),
          ('Was schrieb Brahms, als Clara Schumann im Sterben lag?', ['Ein deutsches Requiem', 'Die Vier ernsten Gesänge', 'Das Wiegenlied', 'Die Sinfonie Nr. 4'], 1),
          ('Wo ist Brahms begraben?', ['In Hamburg', 'In Wien, nahe Beethoven und Schubert', 'In Bonn, neben den Schumanns', 'In Leipzig'], 1),
          ('Welchen berühmten Walzer hätte Brahms gern selbst geschrieben?', ['Chopins Minutenwalzer', 'Johann Strauss’ „An der schönen blauen Donau“', 'Tschaikowskys Blumenwalzer', 'Schuberts Ländler'], 1),
        ],
      },
    ],
  },
]
