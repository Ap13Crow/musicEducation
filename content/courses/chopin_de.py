# Frédéric Chopin - deutsche Fassung von chopin.py.
COURSE = {
    'slug': 'chopin-leben-und-werk-einfuehrung',
    'language': 'de',
    'translationOf': 'chopin-life-and-music-introduction',
    'title': 'Frédéric Chopin: Leben und Werk – Eine erste Einführung',
    'shortSummary': 'Vier Wochen mit Frédéric Chopin, dem „Poeten des Klaviers“: von Warschau in die Pariser Salons, zu George Sand und nach Nohant – Nocturnes, Balladen, Polonaisen und die Préludes.',
    'description': (
        "Frédéric Chopin (1810–1849) schrieb fast ausschließlich für das Klavier – und veränderte für immer, wie es klingt. Geboren bei Warschau, verließ er Polen "
        "mit 20 Jahren und sah es nie wieder; in Paris wurde er zum meistbewunderten Pianisten der Salons.\n\n"
        "In vier Wochen folgst du seinem Leben Schritt für Schritt:\n"
        "- Woche 1 – Eine polnische Kindheit: Warschau (1810–1830)\n"
        "- Woche 2 – Paris: der Poet des Klaviers (1831–1837)\n"
        "- Woche 3 – George Sand, Mallorca und Nohant (1838–1846)\n"
        "- Woche 4 – Die letzten Jahre und das Vermächtnis (1847–1849)\n\n"
        "Jede Woche verbindet illustrierte Folien, eine Dokumentation, Aufnahmen vom Internationalen Chopin-Wettbewerb, Aufnahmen und Noten "
        "aus der mymusic.coach-Bibliothek und ein kurzes Quiz. Vorkenntnisse sind nicht nötig. Plane etwa 1–2 Stunden pro Woche ein."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'chopin_delacroix', 'title': 'Chopin', 'subtitle': 'Leben und Werk – Eine erste Einführung', 'tag': '4-Wochen-Kurs'},
}
FOOTER = 'Frédéric Chopin: Leben und Werk'
PORTRAIT = {'image': 'chopin_delacroix', 'credit': 'Eugène Delacroix, Frédéric Chopin, 1838 (Louvre, gemeinfrei)'}
PHOTO = {'image': 'chopin_photo', 'credit': 'Daguerreotypie von Louis-Auguste Bisson, 1849 (gemeinfrei)'}
NOCTURNE = 'cmuygtjik00sp4kktzi6k3k9h'
BALLADE1 = 'cmuygtj4r00m94kktpave15sk'
RAINDROP = 'cmuygtjtv00ui4kkt1fywy6rm'
REVOLUTIONARY = 'cmuygtj5800nd4kktdeqnhk2o'
HEROIC = 'cmuygtjo200tb4kkteday0mft'
BERCEUSE = 'cmuygtj4t00me4kkt04luo6y0'
FUNERAL = 'cmuygtk7u00vs4kktm0j5t5th'

WEEKS = [
  {
    'title': 'Woche 1 – Eine polnische Kindheit: Warschau (1810–1830)',
    'lessons': [
      {
        'title': 'Willkommen: Frédéric Chopin', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Willkommen im Kurs! Lerne den „Poeten des Klaviers“ kennen – und sieh, wie die nächsten vier Wochen ablaufen.\n\nTipp: Alle Musik, die im Kurs vorkommt, ist in den Lektionen verlinkt. Öffne Aufnahmen und Noten in der Bibliothek und sammle zusätzliche XP, wenn du bis zum Ende hörst oder liest.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 1', 'title': 'Frédéric Chopin', 'subtitle': 'Eine erste Einführung in sein Leben und seine Musik', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Warum Chopin?', 'bullets': [
              'Geboren 1810 bei Warschau – gestorben 1849 in Paris, mit 39 Jahren',
              'Fast jedes seiner Werke ist mit Klavier',
              'Er schuf neue Arten von Klavierstücken: die Ballade und seine ganz eigenen Nocturnes, Etüden und Préludes',
              'Polnische Tänze – Mazurken und Polonaisen – wurden in seinen Händen zur Kunstmusik',
              'Heute ist er wohl der meistgespielte Komponist von Pianisten weltweit']},
          {'kind': 'timeline', 'title': 'Deine vier Wochen', 'rows': [
              ('Woche 1', 'Eine polnische Kindheit: Warschau'),
              ('Woche 2', 'Paris: der Poet des Klaviers'),
              ('Woche 3', 'George Sand, Mallorca und Nohant'),
              ('Woche 4', 'Die letzten Jahre und das Vermächtnis')]},
          {'kind': 'bullets', 'title': 'Das Klavier zu Chopins Zeit', 'bullets': [
              'Klaviere wurden größer, lauter und klangvoller',
              'Paris war die Hauptstadt des Klavierbaus: Pleyel und Érard',
              'Chopin liebte Pleyel-Flügel wegen ihres weichen, singenden Tons',
              'Sein Geheimnis: das Klavier „singen“ zu lassen wie eine Opernstimme']},
        ],
      },
      {
        'title': 'Eine Kindheit in Warschau', 'type': 'SLIDES', 'minutes': 15,
        'description': "Ein französischer Vater, eine polnische Mutter, eine Stadt voller Musik: Wie ein Junge aus Warschau mit acht Jahren berühmt wurde.",
        'slides': [
          {'kind': 'bullets', 'title': 'Żelazowa Wola, 1810', 'bullets': [
              'Geboren im Dorf Żelazowa Wola westlich von Warschau – am 1. März 1810, dem Datum, das er und seine Familie feierten (laut Taufregister am 22. Februar)',
              'Sein Vater Nicolas Chopin war Franzose und unterrichtete in Warschau Französisch',
              'Seine Mutter Justyna war Polin und spielte Klavier',
              'Wenige Monate später zog die Familie nach Warschau']},
          {'kind': 'timeline', 'title': 'Ein Wunderkind', 'rows': [
              ('1816', 'Klavierunterricht bei Wojciech Żywny, einem Verehrer von Bach und Mozart'),
              ('1817', 'Mit 7 Jahren: sein erstes gedrucktes Werk, eine Polonaise g-Moll'),
              ('1818', 'Erstes öffentliches Konzert mit 8 – „ein zweiter Mozart“, schrieben die Warschauer Zeitungen'),
              ('1826–1829', 'Kompositionsstudium am Warschauer Konservatorium bei Józef Elsner')]},
          {'kind': 'quote', 'quote': 'Chopin, Fryderyk: außergewöhnliche Begabung, musikalisches Genie.', 'by': 'Józef Elsner in seinem Abschlusszeugnis für seinen Schüler, 1829'},
          {'kind': 'listen', 'title': 'Sein erstes veröffentlichtes Werk', 'work': 'Polonaise g-Moll (1817) – von einem Siebenjährigen', 'points': [
              'Eine Polonaise ist ein würdevoller polnischer Tanz im Dreiertakt',
              'Einfach, aber mit echtem Charakter',
              'Öffne die Aufnahme in der Bibliothek – und vergleiche sie mit der „Heroischen“ Polonaise in Woche 3']},
        ],
        'library': [('cmuygtjr400u24kkt14g9zilc', 'Polonaise g-Moll – mit sieben Jahren geschrieben')],
      },
      {
        'title': 'Video: Chopin – Leben, Orte und Musik', 'type': 'YOUTUBE', 'minutes': 28, 'video': 'https://www.youtube.com/watch?v=n7Pk5uhl4JM',
        'description': "Diese Dokumentation von opera-inside folgt Chopin von Żelazowa Wola und Warschau nach Paris, Mallorca und Nohant, die ganze Zeit begleitet von seiner Musik. Das Video ist auf Englisch – schalte bei Bedarf die automatischen Untertitel von YouTube ein.\n\nAchte beim Anschauen auf Folgendes:\n1. Warum verließ Chopin Polen – und warum kehrte er nie zurück?\n2. Wer war George Sand?\n3. Wo schrieb er die 24 Préludes?\n\nAlles kommt in den nächsten Wochen wieder.",
      },
      {
        'title': 'Abschied von Polen – und Quiz zu Woche 1', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "Im November 1830 verließ Chopin Warschau in Richtung Wien. Drei Wochen später erhob sich Polen gegen Russland – und er konnte nie mehr nach Hause zurück.",
        'slides': [
          {'kind': 'bullets', 'title': 'Lebewohl, Warschau', 'bullets': [
              '1829: ein erfolgreiches Debüt in Wien',
              '1830: Seine beiden Klavierkonzerte werden in Warschau uraufgeführt',
              '2. November 1830: Er verlässt Polen – Freunde schenken ihm einen Becher mit polnischer Erde',
              '29. November 1830: Der Novemberaufstand gegen die russische Herrschaft beginnt']},
          {'kind': 'listen', 'title': 'Die „Revolutionsetüde“', 'work': 'Etüde c-Moll, op. 10 Nr. 12', 'points': [
              'Im September 1831 erfuhr Chopin in Stuttgart, dass Warschau von der russischen Armee eingenommen worden war',
              'Sein Tagebuch aus diesen Tagen ist voller Verzweiflung',
              'Der Überlieferung nach war diese Etüde seine Antwort: ein Sturm in der linken Hand, Schreie in der rechten',
              'Zweieinhalb Minuten Zorn – öffne die Aufnahme in der Bibliothek']},
          {'kind': 'summary', 'title': 'Woche 1 auf einen Blick', 'bullets': [
              'Geboren 1810 bei Warschau; französischer Vater, polnische Mutter',
              'Ein Kinderstar: erstes gedrucktes Stück mit 7, erstes Konzert mit 8',
              'Unterricht bei Żywny und Elsner',
              '1830: Abschied von Polen – für immer']},
        ],
        'library': [(REVOLUTIONARY, '„Revolutionsetüde“, op. 10 Nr. 12 – Aufnahme'), ('cmuygw9fx01y04kktfxw2tvje', '„Revolutionsetüde“ – Noten')],
        'quiz': [
          ('Wo wurde Chopin geboren?', ['In Paris', 'In Żelazowa Wola bei Warschau', 'In Krakau', 'In Wien'], 1),
          ('Woher stammte Chopins Vater?', ['Aus Polen', 'Aus Frankreich', 'Aus Deutschland', 'Aus Russland'], 1),
          ('Was war Chopins erstes gedrucktes Werk, mit 7 Jahren?', ['Ein Nocturne', 'Eine Polonaise', 'Ein Klavierkonzert', 'Ein Lied'], 1),
          ('Welches Ereignis begann kurz nachdem Chopin 1830 Warschau verlassen hatte?', ['Die Französische Revolution', 'Der Novemberaufstand gegen Russland', 'Der Wiener Kongress', 'Die Napoleonischen Kriege'], 1),
          ('Welche Etüde wird mit dem Fall Warschaus 1831 verbunden?', ['Die „Schwarze-Tasten-Etüde“', 'Die „Revolutionsetüde“', 'Die „Schmetterlingsetüde“', 'Die „Winterwind-Etüde“'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 2 – Paris: der Poet des Klaviers (1831–1837)',
    'lessons': [
      {
        'title': 'Ein Pole in Paris', 'type': 'SLIDES', 'minutes': 15,
        'description': "Paris war in den 1830er-Jahren voller polnischer Emigranten, großer Pianisten und reicher Salons. Chopin fand dort schnell seinen Platz.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 2', 'title': 'Paris: der Poet des Klaviers', 'subtitle': '1831 – 1837', **PORTRAIT},
          {'kind': 'quote', 'quote': 'Hut ab, ihr Herren, ein Genie!', 'by': 'Robert Schumann in seiner Besprechung von Chopins Variationen op. 2, 1831'},
          {'kind': 'bullets', 'title': 'Der Salon statt des Konzertsaals', 'bullets': [
              'Herbst 1831: Chopin kommt nach Paris; sein erstes Pariser Konzert gibt er im Februar 1832 im Salle Pleyel',
              'Er mochte keine großen Säle und gab in seinem ganzen Leben nur etwa 30 öffentliche Konzerte',
              'Stattdessen spielte er in den Salons von Aristokraten und Bankiers – etwa bei den Rothschilds',
              'Seinen Lebensunterhalt verdiente er mit Unterricht für wohlhabende Schüler und dem Verkauf seiner Werke an Verleger']},
          {'kind': 'bullets', 'title': 'Freunde in Paris', 'bullets': [
              'Franz Liszt, der große Virtuose – Freund und Rivale',
              'Der Maler Eugène Delacroix – einer seiner engsten Freunde',
              'Polnische Emigranten wie der Dichter Adam Mickiewicz',
              'Felix Mendelssohn, Vincenzo Bellini und Hector Berlioz']},
        ],
      },
      {
        'title': 'Hören: das Nocturne Es-Dur', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [NOCTURNE, 0],
        'description': "Ein Nocturne ist ein „Nachtstück“: eine träumerische, singende Melodie über einer sanft wiegenden Begleitung. Der irische Komponist John Field erfand den Namen – Chopin machte das Nocturne berühmt. Er veröffentlichte 21 davon.\n\nDas Nocturne Es-Dur, op. 9 Nr. 2 (erschienen 1832) ist das berühmteste von allen (Aufnahme von Musopen, gemeinfrei).\n\nAchte auf:\n1. Die linke Hand: ein tiefer Basston, dann zwei Akkorde – wie ein langsamer Walzer\n2. Die rechte Hand singt wie eine Opernsängerin – Chopin liebte Bellinis Opern\n3. Jedes Mal, wenn die Melodie wiederkommt, ist sie reicher verziert – mit kleinen, schnellen Ornamenten\n\nLies in den Noten mit, oder vergleiche mit der Fassung des Geigers Mischa Elman auf einer Schellackplatte von 1924.",
        'library': [(NOCTURNE, 'Nocturne op. 9 Nr. 2 – Aufnahme'), ('cmuygw9ik01yx4kkth8o2buwb', 'Nocturne op. 9 Nr. 2 – Noten'), ('cmv2iv6gr00cc12if7rl3la76', 'Nocturne op. 9 Nr. 2 für Violine – Mischa Elman, 1924')],
      },
      {
        'title': 'Video: die erste Ballade', 'type': 'YOUTUBE', 'minutes': 10, 'video': 'https://www.youtube.com/watch?v=BjZsTeSvwe4',
        'description': "Chopin erfand die Ballade für Klavier: eine lange, dramatische Erzählung ohne Worte. Die Ballade Nr. 1 g-Moll, op. 23 wurde 1835 vollendet. Schumann berichtete, Chopin habe ihm gesagt, sie sei ihm die liebste.\n\nHier spielt sie Martín García García beim 18. Internationalen Chopin-Wettbewerb in Warschau (2021) – der seit 1927 alle fünf Jahre stattfindende Wettbewerb gehört zu den wichtigsten der Welt.\n\nAchte auf:\n1. Eine langsame, fragende Einleitung\n2. Das erste Thema: eine traurige, wiegende Melodie in g-Moll\n3. Das zweite Thema: warm und ruhig – später kehrt es in voller Pracht zurück\n4. Die rasende Coda am Schluss\n\nÖffne danach Noten und eine vollständige Aufnahme in der Bibliothek.",
        'library': [('cmuygw9fy01y24kkthv67wxx8', 'Erste Ballade – Noten'), (BALLADE1, 'Erste Ballade – Aufnahme')],
      },
      {
        'title': 'Rückblick Woche 2 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der ersten Pariser Jahre, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 2 auf einen Blick', 'bullets': [
              '1831: Ankunft in Paris; Schumann: „Hut ab, ihr Herren, ein Genie!“',
              'Eher Salonpianist und Lehrer als Konzertvirtuose',
              'Nocturnes: singende „Nachtstücke“',
              'Die Ballade: eine neue Art dramatischer Klaviermusik']},
          {'kind': 'bullets', 'title': 'Zum Mitlesen: der Minutenwalzer', 'bullets': [
              'Walzer waren der Modetanz von Paris',
              'Der „Minutenwalzer“, op. 64 Nr. 1, dauert keine Minute: „minute“ heißt „winzig“',
              'Er soll ein Hündchen zeigen, das seinem Schwanz nachjagt',
              'Öffne Noten und Aufnahme in der Bibliothek']},
        ],
        'library': [('cmuygw9if01yt4kkt2o428xyb', '„Minutenwalzer“ – Noten'), ('cmuygtkaq00wv4kktlh1mwpgf', '„Minutenwalzer“ – Aufnahme')],
        'quiz': [
          ('Wer schrieb über Chopin „Hut ab, ihr Herren, ein Genie!“?', ['Liszt', 'Robert Schumann', 'Mendelssohn', 'Berlioz'], 1),
          ('Wo spielte Chopin am liebsten?', ['In großen Konzertsälen', 'In privaten Salons', 'In Kirchen', 'In Opernhäusern'], 1),
          ('Was ist ein Nocturne?', ['Ein schneller Tanz', 'Ein träumerisches „Nachtstück“', 'Eine Übung für die Technik', 'Ein Orchesterstück'], 1),
          ('Welche Art von Klavierstück erfand Chopin?', ['Die Sonate', 'Die Ballade', 'Die Fuge', 'Den Walzer'], 1),
          ('Was bedeutet „minute“ im „Minutenwalzer“?', ['Er dauert eine Minute', 'Winzig', 'Sehr schnell', 'In einer Minute geschrieben'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 3 – George Sand, Mallorca und Nohant (1838–1846)',
    'lessons': [
      {
        'title': 'George Sand und ein Winter auf Mallorca', 'type': 'SLIDES', 'minutes': 15,
        'description': "1836 lernte Chopin die Schriftstellerin George Sand kennen. Ihre neun gemeinsamen Jahre wurden die produktivsten seines Lebens.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 3', 'title': 'George Sand, Mallorca und Nohant', 'subtitle': '1838 – 1846', **PORTRAIT},
          {'kind': 'image', 'title': 'George Sand', 'text': 'Als Aurore Dupin geboren, schrieb sie unter einem Männernamen, trug manchmal Männerkleidung und war eine der berühmtesten Schriftstellerinnen Frankreichs. Liszt stellte sie 1836 Chopin vor; ab 1838 waren sie ein Paar.', 'image': 'george_sand', 'credit': 'Eugène Delacroix, George Sand, 1838 (gemeinfrei)'},
          {'kind': 'bullets', 'title': 'Mallorca, Winter 1838–1839', 'bullets': [
              'Sand nahm Chopin und ihre beiden Kinder mit nach Mallorca – in der Hoffnung, die Sonne helfe seiner schwachen Lunge',
              'Es regnete wochenlang; schließlich wohnten sie in einem alten Kloster in Valldemossa',
              'Chopin war schwer krank – und vollendete dort seine 24 Préludes auf einem kleinen einheimischen Klavier, bis sein Pleyel eintraf',
              'Delacroix malte das Paar 1838 gemeinsam – das Bild wurde später in zwei Teile zerschnitten']},
          {'kind': 'listen', 'title': 'Das „Regentropfen“-Prélude', 'work': 'Prélude Des-Dur, op. 28 Nr. 15', 'points': [
              'Ein einziger wiederholter Ton zieht sich durch das ganze Stück – wie Regen auf dem Dach',
              'Der Mittelteil wird dunkel und schwer, wie ein böser Traum',
              'George Sand beschrieb, wie Chopin im Regen in Valldemossa spielte',
              'Der Beiname stammt nicht von Chopin – öffne die Aufnahme und urteile selbst']},
        ],
        'library': [(RAINDROP, '„Regentropfen“-Prélude – Aufnahme'), ('cmuygw9fy01y54kkt3wpqkzcf', '„Regentropfen“-Prélude – Noten'), ('cmuygw9ib01yh4kkte87nhbsf', 'Prélude Nr. 4 e-Moll – Noten')],
      },
      {
        'title': 'Sommer in Nohant', 'type': 'SLIDES', 'minutes': 12,
        'description': "Die meisten Sommer von 1839 bis 1846 verbrachte Chopin auf George Sands Landsitz in Nohant, mitten in Frankreich. Dort schrieb er viele seiner größten Werke.",
        'slides': [
          {'kind': 'bullets', 'title': 'Das Leben in Nohant', 'bullets': [
              'Winter in Paris für Unterricht und Salons; Sommer auf dem Land zum Komponieren',
              'Zu Gast waren Delacroix, Liszt und die Sängerin Pauline Viardot',
              'Chopin arbeitete langsam und mühevoll und schrieb eine Seite wieder und wieder neu',
              'Sand berichtete, er habe sechs Wochen an einer einzigen Seite gearbeitet']},
          {'kind': 'timeline', 'title': 'Werke der Jahre in Nohant', 'rows': [
              ('1839', 'Klaviersonate Nr. 2 b-Moll, mit dem Trauermarsch'),
              ('1842', 'Polonaise As-Dur, op. 53, „Heroische“; Ballade Nr. 4'),
              ('1844', 'Berceuse (Wiegenlied) und Klaviersonate Nr. 3'),
              ('1845–1846', 'Barcarolle und Polonaise-Fantaisie; Cellosonate')]},
          {'kind': 'listen', 'title': 'Zwei Gegensätze', 'work': '„Heroische“ Polonaise, op. 53 – und die Berceuse, op. 57', 'points': [
              'Die „Heroische“ Polonaise: stolz, glänzend – ein Symbol Polens',
              'Achte auf die donnernden Oktaven der linken Hand im Mittelteil',
              'Die Berceuse: ein Wiegenlied über einem einzigen, durchgehend wiederholten Wiegemuster im Bass',
              'Beide Aufnahmen findest du in der Bibliothek']},
        ],
        'library': [(HEROIC, '„Heroische“ Polonaise, op. 53 – Aufnahme'), (BERCEUSE, 'Berceuse, op. 57 – Aufnahme')],
      },
      {
        'title': 'Video: Andante spianato und Grande Polonaise', 'type': 'YOUTUBE', 'minutes': 15, 'video': 'https://www.youtube.com/watch?v=B4DzzgBxpx4',
        'description': "Bruce (Xiaoyu) Liu spielt Andante spianato und Grande Polonaise brillante, op. 22 beim 18. Internationalen Chopin-Wettbewerb 2021 – den er anschließend gewann.\n\nChopin schrieb die Polonaise 1830/31 in Warschau und Wien für Klavier und Orchester und fügte 1834 in Paris das ruhige Andante spianato („geglättet“) hinzu. Oft wird sie, wie hier, von Klavier allein gespielt.\n\nAchte auf:\n1. Das glatte, leise Andante – wie Wasser\n2. Eine Fanfare, die die Polonaise ankündigt\n3. Den funkelnden, brillanten Stil, der Chopin als jungen Virtuosen berühmt machte",
      },
      {
        'title': 'Rückblick Woche 3 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der Jahre mit George Sand, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 3 auf einen Blick', 'bullets': [
              '1836: Begegnung mit der Schriftstellerin George Sand',
              '1838–1839: ein Winter auf Mallorca – die 24 Préludes',
              '1839–1846: Sommer in Nohant – seine produktivsten Jahre',
              '„Heroische“ Polonaise, Berceuse, Barcarolle, Sonaten']},
        ],
        'quiz': [
          ('Wie hieß George Sand eigentlich?', ['Pauline Viardot', 'Aurore Dupin', 'Marie d’Agoult', 'Jane Stirling'], 1),
          ('Wo vollendete Chopin seine 24 Préludes?', ['In Nohant', 'Auf Mallorca', 'In Warschau', 'In London'], 1),
          ('Welches Prélude trägt den Beinamen „Regentropfen“?', ['Nr. 4 e-Moll', 'Nr. 15 Des-Dur', 'Nr. 20 c-Moll', 'Nr. 1 C-Dur'], 1),
          ('Wo verbrachte Chopin die Sommer von 1839 bis 1846?', ['Auf Mallorca', 'In Nohant', 'In Warschau', 'In der Schweiz'], 1),
          ('Was ist eine Berceuse?', ['Ein Marsch', 'Ein Wiegenlied', 'Ein Tanz', 'Eine Etüde'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 4 – Die letzten Jahre und das Vermächtnis (1847–1849)',
    'lessons': [
      {
        'title': 'Trennung, Großbritannien und das letzte Konzert', 'type': 'SLIDES', 'minutes': 15,
        'description': "1847 trennten sich Chopin und George Sand. Krank und kaum noch fähig zu komponieren, unternahm er eine letzte lange Reise.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 4', 'title': 'Die letzten Jahre', 'subtitle': '1847 – 1849', **PHOTO},
          {'kind': 'timeline', 'title': 'Die letzte Reise', 'rows': [
              ('1847', 'Ein schmerzlicher Bruch mit George Sand, nach Streitigkeiten um ihre Kinder'),
              ('Feb. 1848', 'Sein letztes Konzert in Paris, im Salle Pleyel'),
              ('1848', 'Sieben Monate in England und Schottland, eingeladen von seiner Schülerin Jane Stirling'),
              ('16. Nov. 1848', 'Sein letzter öffentlicher Auftritt: ein Wohltätigkeitskonzert für polnische Flüchtlinge in London'),
              ('17. Okt. 1849', 'Stirbt in Paris mit 39 Jahren – vermutlich an Tuberkulose')]},
          {'kind': 'bullets', 'title': 'Abschied', 'bullets': [
              'Bei seiner Trauerfeier in der Madeleine erklang, wie er es gewünscht hatte, Mozarts Requiem',
              'Er wurde auf dem Friedhof Père Lachaise in Paris beigesetzt',
              'Seine Schwester Ludwika brachte sein Herz nach Warschau, wie er es erbeten hatte',
              'Es ruht in einem Pfeiler der Heilig-Kreuz-Kirche']},
          {'kind': 'image', 'title': 'Die einzige Fotografie', 'text': 'Diese Daguerreotypie aus seinem letzten Lebensjahr 1849 ist eine von nur zwei Fotografien Chopins. Vergleiche sie mit Delacroix’ Porträt von 1838.', **PHOTO},
        ],
      },
      {
        'title': 'Hören: der Trauermarsch', 'type': 'AUDIO', 'minutes': 10, 'libraryAudio': [FUNERAL, 0],
        'description': "Der Trauermarsch entstand 1837 und wurde zum langsamen Satz der Klaviersonate Nr. 2 b-Moll (1839). Er erklang bei Chopins eigener Beisetzung – und später bei den Begräbnissen von Staatsmännern in aller Welt.\n\nAchte auf (Aufnahme von Musopen, gemeinfrei):\n1. Schwere Akkorde in der linken Hand, wie langsam läutende Glocken\n2. Eine sanfte, tröstende Melodie in der Mitte – wie eine Erinnerung\n3. Die Rückkehr des Marsches\n\nDie Noten der ganzen Sonate findest du in der Bibliothek.",
        'library': [(FUNERAL, 'Sonate Nr. 2: Trauermarsch – Aufnahme'), ('cmuygw9ie01yp4kktflm0uegd', 'Sonate Nr. 2 – Noten')],
      },
      {
        'title': 'Chopin heute', 'type': 'SLIDES', 'minutes': 12,
        'description': "Warum Chopin bis heute im Zentrum des Klavierspiels steht – und der polnischen Identität.",
        'slides': [
          {'kind': 'bullets', 'title': 'Chopins Klavier', 'bullets': [
              'Ein Pedalgebrauch, der Klänge zu einer Farbwolke verschmilzt',
              'Rubato: „gestohlene Zeit“ – die Melodie gibt nach, während die Begleitung im Takt bleibt',
              'Etüden, die zugleich Übungen und echte Musik sind',
              'Liszt, Debussy, Rachmaninow und viele andere lernten von ihm']},
          {'kind': 'bullets', 'title': 'Ein polnisches Symbol', 'bullets': [
              'Mazurken und Polonaisen hielten die polnische Musik lebendig, als Polen kein freies Land war',
              'Der Internationale Chopin-Wettbewerb findet seit 1927 in Warschau statt',
              'Der Warschauer Flughafen und eine Musikuniversität tragen seinen Namen',
              'Sein Geburtshaus in Żelazowa Wola ist ein Museum']},
          {'kind': 'summary', 'title': 'Wie es weitergeht', 'bullets': [
              'Entdecke mehr als 150 Chopin-Aufnahmen und -Noten in der mymusic.coach-Bibliothek',
              'Klavierspieler: Frag deine Lehrkraft nach einem Prélude (Nr. 4, 6 oder 7) oder einem Walzer',
              'Weiter mit den Kursen über Felix Mendelssohn, Clara Schumann und Debussy']},
        ],
      },
      {
        'title': 'Abschluss: Rückblick und Quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Herzlichen Glückwunsch – du bist am Ende des Kurses angekommen! Ein letzter Rückblick und ein Abschlussquiz über alle vier Wochen.",
        'slides': [
          {'kind': 'timeline', 'title': 'Chopins Leben auf einen Blick', 'rows': [
              ('1810', 'Geboren in Żelazowa Wola bei Warschau'),
              ('1817', 'Erstes gedrucktes Werk, mit 7 Jahren'),
              ('1830', 'Verlässt Polen für immer'),
              ('1831', 'Ankunft in Paris'),
              ('1838–1839', 'Mallorca mit George Sand: die 24 Préludes'),
              ('1839–1846', 'Sommer in Nohant'),
              ('1849', 'Gestorben am 17. Oktober in Paris')]},
        ],
        'quiz': [
          ('Für welches Instrument schrieb Chopin fast seine gesamte Musik?', ['Violine', 'Klavier', 'Orgel', 'Gesang'], 1),
          ('Welche zwei polnischen Tänze erhob Chopin zur Kunstmusik?', ['Walzer und Menuett', 'Mazurka und Polonaise', 'Polka und Galopp', 'Tarantella und Saltarello'], 1),
          ('Was ist „Rubato“?', ['Eine Klavierart', 'Freie, „gestohlene“ Zeit in der Melodie', 'Ein schneller Schluss', 'Eine Pedalart'], 1),
          ('Welche Musik erklang bei Chopins Trauerfeier?', ['Sein eigener Trauermarsch', 'Mozarts Requiem', 'Bachs Matthäus-Passion', 'Beethovens Neunte'], 1),
          ('Wo wird Chopins Herz aufbewahrt?', ['In Paris', 'In der Heilig-Kreuz-Kirche in Warschau', 'In Nohant', 'Auf Mallorca'], 1),
          ('Seit wann gibt es den Internationalen Chopin-Wettbewerb?', ['1849', '1900', '1927', '1990'], 2),
        ],
      },
    ],
  },
]
