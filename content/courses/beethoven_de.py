# Beethoven - deutsche Fassung von beethoven.py.
SITE = 'https://mymusic.coach'
EROICA = f'{SITE}/api/library/items/cmuygtj1r00jr4kktm2vrvx1p/files/0.audio'
EGMONT = f'{SITE}/api/library/items/cmuygtj1o00jn4kktbx3ydpyk/files/0.audio'

COURSE = {
    'slug': 'beethoven-leben-und-werk-einfuehrung',
    'language': 'de',
    'translationOf': 'beethoven-life-and-music-introduction',
    'title': 'Beethoven: Leben und Werk – Eine erste Einführung',
    'shortSummary': 'Vier Wochen mit Ludwig van Beethoven: von einer harten Kindheit in Bonn bis zur Neunten Sinfonie – sein Leben, seine Taubheit und die Musik, die alles veränderte.',
    'description': (
        "Ludwig van Beethoven (1770–1827) ist einer der berühmtesten Komponisten aller Zeiten – und einer der überraschendsten. "
        "Er war ein Klavierstar in Wien, verlor mit Ende zwanzig sein Gehör und schrieb trotzdem Musik, die zweihundert Jahre später noch neu klingt.\n\n"
        "In vier Wochen folgst du seinem Leben Schritt für Schritt:\n"
        "- Woche 1 – Bonn: eine musikalische Kindheit (1770–1792)\n"
        "- Woche 2 – Wien: der junge Klaviervirtuose (1792–1802)\n"
        "- Woche 3 – Krise und Heldentum: Taubheit, Eroica und die Fünfte (1802–1814)\n"
        "- Woche 4 – Die späten Jahre und die Neunte Sinfonie (1815–1827)\n\n"
        "Jede Woche verbindet illustrierte Folien, kurze Videos, Aufnahmen zum Anhören und Noten aus der mymusic.coach-Bibliothek, "
        "gefolgt von einem kurzen Quiz. Vorkenntnisse sind nicht nötig – nur Neugier und ein paar Kopfhörer. Plane etwa 1–2 Stunden pro Woche ein."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin'],
    'musicStyles': ['Classical', 'Romantic'],
    'cover': {'image': 'beethoven_stieler', 'title': 'Beethoven', 'subtitle': 'Leben und Werk – Eine erste Einführung', 'tag': '4-Wochen-Kurs'},
}

FOOTER = 'Beethoven: Leben und Werk'

WEEKS = [
  {
    'title': 'Woche 1 – Bonn: eine musikalische Kindheit (1770–1792)',
    'lessons': [
      {
        'title': 'Willkommen: Beethoven',
        'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': (
            "Willkommen im Kurs! In dieser ersten Lektion bekommst du einen Überblick über die nächsten vier Wochen und einen ersten Eindruck von dem Menschen "
            "hinter dem berühmten strengen Gesicht. Klick dich in deinem eigenen Tempo durch die Folien.\n\n"
            "Tipp: Jedes Musikstück, das im Kurs vorkommt, ist in den Lektionen verlinkt – du kannst es in der Bibliothek öffnen, "
            "als Favorit markieren und zusätzliche XP sammeln, wenn du bis zum Ende liest oder hörst."
        ),
        'slides': [
          {'kind': 'title', 'week': 'Woche 1', 'title': 'Ludwig van Beethoven', 'subtitle': 'Eine erste Einführung in sein Leben und seine Musik', 'image': 'beethoven_stieler', 'credit': 'Porträt von Joseph Karl Stieler, 1820 (gemeinfrei)'},
          {'kind': 'bullets', 'title': 'Warum Beethoven?', 'bullets': [
              'Geboren 1770 in Bonn – gestorben 1827 in Wien',
              'Ein gefeierter Pianist, der zum meistbewunderten Komponisten seiner Zeit wurde',
              'Er verlor sein Gehör – und komponierte noch 25 Jahre weiter',
              'Er verband zwei Epochen: den klassischen Stil Haydns und Mozarts und die kommende Romantik',
              'Seine Musik wird jeden einzelnen Tag irgendwo auf der Welt gespielt']},
          {'kind': 'timeline', 'title': 'Deine vier Wochen', 'rows': [
              ('Woche 1', 'Bonn – eine musikalische Kindheit (1770–1792)'),
              ('Woche 2', 'Wien – der junge Klaviervirtuose (1792–1802)'),
              ('Woche 3', 'Krise und Heldentum – Taubheit, Eroica, Fünfte Sinfonie'),
              ('Woche 4', 'Die späten Jahre und die Neunte Sinfonie (1815–1827)')]},
          {'kind': 'bullets', 'title': 'So funktioniert der Kurs', 'bullets': [
              'Folien wie diese erklären die Geschichte und die Musik',
              'In Videos siehst du große Orchester und Pianisten spielen',
              'Aufnahmen und Noten aus der mymusic.coach-Bibliothek zum Weiterentdecken',
              'Am Ende jeder Woche ein kurzes Quiz – dabei sammelst du XP',
              'Markiere jede Lektion als abgeschlossen, wenn du fertig bist']},
          {'kind': 'quote', 'quote': 'Musik ist höhere Offenbarung als alle Weisheit und Philosophie.', 'by': 'Ludwig van Beethoven zugeschrieben (überliefert von Bettina von Arnim)'},
        ],
      },
      {
        'title': 'Aufwachsen in Bonn',
        'type': 'SLIDES', 'minutes': 15,
        'description': (
            "Beethoven wuchs nicht als unbeschwertes Wunderkind auf. Sein Vater trieb ihn hart an, die Familie kämpfte ums Auskommen, "
            "und mit 16 verlor er seine Mutter. Diese Folien erzählen von seinen ersten 22 Jahren in Bonn – und von den Menschen, die an ihn glaubten."
        ),
        'slides': [
          {'kind': 'image', 'title': 'Bonn, Dezember 1770', 'text': 'Ludwig van Beethoven wurde am 17. Dezember 1770 in Bonn getauft, damals Hauptstadt des Kurfürstentums Köln. Seine Familie wohnte in diesem Haus in der Bonngasse – heute das Museum Beethoven-Haus.', 'image': 'bonn_house', 'credit': 'Foto: Sir James, CC BY-SA 3.0, via Wikimedia Commons'},
          {'kind': 'bullets', 'title': 'Eine Familie von Hofmusikern', 'bullets': [
              'Sein Großvater, ebenfalls Ludwig, war Kapellmeister am Bonner Hof',
              'Sein Vater Johann war Tenor in der Hofkapelle – und ein strenger, oft harter Lehrer',
              'Johann hoffte, seinen Sohn als „zweiten Mozart“ vorführen zu können',
              'Der junge Ludwig gab im März 1778, mit sieben Jahren, sein erstes öffentliches Konzert in Köln']},
          {'kind': 'bullets', 'title': 'Ein echter Lehrer: Christian Gottlob Neefe', 'bullets': [
              'Der Hoforganist Neefe wurde um 1781 Beethovens Lehrer',
              'Er unterrichtete ihn mit Bachs „Wohltemperiertem Klavier“ – die beste Schule für einen Tastenspieler',
              '1782 erschien Beethovens erste Komposition im Druck: Variationen über einen Marsch von Dressler',
              'Bald arbeitete er als Hilfsorganist und spielte Bratsche im Hoforchester']},
          {'kind': 'timeline', 'title': 'Schnell erwachsen', 'rows': [
              ('1778', 'Erstes öffentliches Konzert in Köln'),
              ('1782', 'Erstes veröffentlichtes Werk'),
              ('1787', 'Kurze Reise nach Wien – seine Mutter erkrankt, er eilt heim; sie stirbt im Juli'),
              ('1789', 'Er übernimmt die Verantwortung für seine beiden jüngeren Brüder'),
              ('1792', 'Er verlässt Bonn in Richtung Wien – für immer')]},
          {'kind': 'quote', 'quote': 'Durch ununterbrochenen Fleiß erhalten Sie: Mozarts Geist aus Haydns Händen.', 'by': 'Graf Ferdinand Waldstein in Beethovens Stammbuch, Oktober 1792'},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Geboren 1770 in Bonn, in eine Familie von Hofmusikern',
              'Eine schwierige Kindheit mit einem fordernden Vater',
              'Neefe gab ihm eine solide musikalische Ausbildung',
              'Freunde wie Graf Waldstein schickten ihn nach Wien, um bei Haydn zu studieren']},
        ],
      },
      {
        'title': 'Video: Beethovens Leben und seine Orte',
        'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=yl7HqahLCDk',
        'description': (
            "Diese Dokumentation führt dich an die Orte, an denen Beethoven lebte und arbeitete – von Bonn bis Wien. "
            "Das Video ist auf Englisch – schalte bei Bedarf die automatischen Untertitel von YouTube ein.\n\n"
            "Achte beim Anschauen auf Folgendes:\n"
            "1. Welche Menschen in Bonn unterstützten den jungen Beethoven?\n"
            "2. Wie veränderte sich sein Leben, als er nach Wien zog?\n"
            "3. Wann bemerkte er erstmals Probleme mit dem Gehör?\n\n"
            "Du musst dir nicht alles merken – die nächsten Wochen gehen auf jeden Teil der Geschichte genauer ein."
        ),
      },
      {
        'title': 'Rückblick Woche 1 und Quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Eine kurze Zusammenfassung von Woche 1, dann fünf Fragen. Nimm dir Zeit – du kannst das Quiz auch wiederholen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 1 auf einen Blick', 'bullets': [
              'Getauft in Bonn am 17. Dezember 1770',
              'Vater Johann: ehrgeizig und streng',
              'Lehrer Neefe: Bach, Orgel, erste Veröffentlichung 1782',
              'Die Mutter starb 1787 – Beethoven wurde Familienoberhaupt',
              '1792: nach Wien, um bei Joseph Haydn zu studieren']},
          {'kind': 'bullets', 'title': 'Diese Woche zum Hören', 'bullets': [
              'Öffne „Für Elise“ in der Bibliothek und lies die Noten mit – Beethoven schrieb es viel später (1810), aber es ist das perfekte erste Stück zum Entdecken',
              'Probier die Sieben Variationen WoO 78 – Variationen waren die Lieblingsform des jungen Beethoven, um am Klavier zu glänzen']},
        ],
        'library': [('cmuygw9ct01vp4kkttmshx9kc', 'Erste Noten zum Entdecken – lies mit, während du eine Aufnahme hörst'), ('cmuygw9cu01vq4kkt3n10qs6q', 'Variationen: wie der junge Beethoven am Klavier glänzte'), ('cmv2iui6i00bc12ifvera3oo4', 'Historische Aufnahme: das Menuett in G, gespielt von der Geigerin Maud Powell 1916')],
        'quiz': [
          ('In welcher Stadt wurde Beethoven geboren?', ['Wien', 'Bonn', 'Salzburg', 'Leipzig'], 1),
          ('Welches Amt hatte Beethovens Großvater?', ['Kapellmeister am Bonner Hof', 'Klavierbauer', 'Opernsänger in Wien', 'Organist in Leipzig'], 0),
          ('Welcher Lehrer machte den jungen Beethoven mit Bachs „Wohltemperiertem Klavier“ bekannt?', ['Joseph Haydn', 'Antonio Salieri', 'Christian Gottlob Neefe', 'Wolfgang Amadeus Mozart'], 2),
          ('Warum eilte Beethoven 1787 aus Wien zurück?', ['Er hatte kein Geld mehr', 'Seine Mutter war schwer krank', 'Der Kurfürst rief ihn zurück', 'Er fiel bei einem Vorspiel durch'], 1),
          ('Bei wem sollte Beethoven studieren, als er 1792 nach Wien zog?', ['Joseph Haydn', 'Johann Sebastian Bach', 'Franz Schubert', 'Christoph Willibald Gluck'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Woche 2 – Wien: der junge Virtuose (1792–1802)',
    'lessons': [
      {
        'title': 'Ein Klavierstar in Wien',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Wien war die Musikhauptstadt Europas. Innerhalb weniger Jahre wurde der junge Mann aus Bonn ihr aufregendster Pianist – und ein Komponist, über den man sprach.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 2', 'title': 'Wien: der junge Virtuose', 'subtitle': '1792 – 1802', 'image': 'beethoven_young', 'credit': 'Beethoven im Jahr 1801, Kupferstich von Carl Traugott Riedel (gemeinfrei)'},
          {'kind': 'bullets', 'title': 'Unterricht bei den Meistern', 'bullets': [
              'Beethoven kam im November 1792 in Wien an',
              'Er nahm Unterricht bei Joseph Haydn – und heimlich auch bei anderen Lehrern',
              'Später studierte er Kontrapunkt bei Albrechtsberger und italienischen Vokalsatz bei Salieri',
              'Haydn war stolz auf ihn, aber die beiden starken Persönlichkeiten waren sich nicht immer einig']},
          {'kind': 'bullets', 'title': 'Freunde im Adel', 'bullets': [
              'Musik fand in Wien in den Salons der Aristokratie statt',
              'Fürst Karl Lichnowsky gab Beethoven ein Zuhause und eine jährliche Rente',
              'Beethoven wurde für seine Improvisationen berühmt – und gewann mehrere Klavier-„Duelle“',
              'Er trat Fürsten als Gleicher gegenüber – ungewöhnlich für einen Musiker jener Zeit']},
          {'kind': 'timeline', 'title': 'Erste Erfolge', 'rows': [
              ('1795', 'Drei Klaviertrios erscheinen als sein Opus 1 – ein großer Erfolg'),
              ('1795', 'Erstes öffentliches Konzert in Wien'),
              ('1799', 'Klaviersonate „Pathétique“, op. 13'),
              ('1800', 'Uraufführung der Ersten Sinfonie'),
              ('1801', 'Klaviersonate op. 27 Nr. 2 – später „Mondscheinsonate“ genannt')]},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Wien 1792: Studien bei Haydn und anderen',
              'Unterstützt von adligen Gönnern wie Fürst Lichnowsky',
              'Zuerst als Pianist und Improvisator berühmt, dann als Komponist',
              'Bis 1800: Klaviersonaten, Kammermusik, eine erste Sinfonie']},
        ],
      },
      {
        'title': 'Hören: die Sonate „Pathétique“',
        'type': 'YOUTUBE', 'minutes': 15, 'video': 'https://www.youtube.com/watch?v=hcczxDKkYhU',
        'description': (
            "Die Klaviersonate Nr. 8 c-Moll, op. 13 – 1799 als „Grande Sonate pathétique“ erschienen – machte den jungen Beethoven in ganz Europa berühmt. "
            "Der Pianist Fabian Müller spielt den ersten Satz.\n\n"
            "Achte auf:\n"
            "1. Die langsamen, schweren Akkorde am Anfang (Grave) – wie ein dramatischer Vorhang, der sich öffnet\n"
            "2. Den plötzlichen Wechsel in ein schnelles, unruhiges Allegro\n"
            "3. Die langsame Einleitung, die zurückkehrt – zweimal! –, bevor der Satz endet\n\n"
            "Öffne dann unten die Noten aus der Bibliothek und folge den ersten Takten: Siehst du, wie dicht die ersten Akkorde sind?"
        ),
        'library': [('cmuygw9af01u44kktp3bdmamc', 'Die Noten des ersten Satzes – folge den Anfangsakkorden'), ('cmuygw9ag01u64kktocu8ro7g', 'Der berühmte langsame zweite Satz'), ('cmv2incvt000q12ifkpjahud0', 'Eine 100 Jahre alte Aufnahme: der langsame Satz für Violine bearbeitet, Marjorie Hayward (1921)')],
      },
      {
        'title': 'Die „Mondscheinsonate“',
        'type': 'SLIDES', 'minutes': 12,
        'description': "Wohl das berühmteste Klavierstück, das je geschrieben wurde – aber Beethoven nannte es nie „Mondschein“. Diese Folien erklären, woher der Name kommt und was die Musik so besonders macht.",
        'slides': [
          {'kind': 'bullets', 'title': 'Sonate „quasi una fantasia“', 'bullets': [
              'Klaviersonate Nr. 14 cis-Moll, op. 27 Nr. 2, geschrieben 1801',
              'Beethoven nannte sie eine Sonate „fast wie eine Fantasie“ – frei und ungewöhnlich in der Form',
              'Gewidmet seiner jungen Schülerin, Gräfin Giulietta Guicciardi',
              'Der Name „Mondschein“ stammt vom Kritiker Ludwig Rellstab – aus dem Jahr 1832, nach Beethovens Tod']},
          {'kind': 'listen', 'title': 'Hörführer: erster Satz', 'work': 'Adagio sostenuto', 'points': [
              'Sanfte Triolen, die durchgehend fließen – „wie ein See im Mondschein“, schrieb Rellstab',
              'Eine schlichte, traurige Melodie schwebt darüber',
              'Tiefe Basstöne geben der Musik ihre dunkle Farbe',
              'Beethoven verlangt das Haltepedal – der Klang soll weich und verschwommen sein']},
          {'kind': 'bullets', 'title': 'Ein überraschender Schluss', 'bullets': [
              'Auf den ruhigen ersten Satz folgt ein kurzes, leichtes Allegretto',
              'Das Finale (Presto agitato) ist ein Sturm – schnell, laut und dramatisch',
              'Statt schnell–langsam–schnell wächst die Sonate von der Ruhe zum Zorn']},
          {'kind': 'summary', 'title': 'Probier es selbst', 'bullets': [
              'Öffne die Noten in der Bibliothek und sieh dir das Triolenmuster in linker und rechter Hand an',
              'Hör den ersten Satz und zähle die Triolen: 1-2-3, 1-2-3 …',
              'Klavierspieler: Der Anfang ist schon in der frühen Mittelstufe spielbar – frag deine Lehrkraft!']},
        ],
        'library': [('cmuygw9ap01ui4kktgbansj59', 'Erster Satz – folge den Triolen'), ('cmuygw9ao01uh4kktal1dz7ue', 'Die ganze Sonate')],
      },
      {
        'title': 'Rückblick Woche 2 und Quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung von Beethovens ersten Wiener Jahren, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 2 auf einen Blick', 'bullets': [
              'Wien 1792: Unterricht bei Haydn, Albrechtsberger und Salieri',
              'Gönner wie Fürst Lichnowsky unterstützten ihn',
              'Opus 1 (1795): drei Klaviertrios',
              'Sonaten „Pathétique“ (1799) und „Mondschein“ (1801)',
              'Uraufführung der Ersten Sinfonie 1800']},
        ],
        'quiz': [
          ('Welcher berühmte Komponist unterrichtete Beethoven in Wien?', ['Joseph Haydn', 'Johann Strauss', 'Franz Liszt', 'Felix Mendelssohn'], 0),
          ('Wer gab der „Mondscheinsonate“ ihren Beinamen?', ['Beethoven selbst', 'Sein Verleger 1801', 'Der Kritiker Ludwig Rellstab, nach Beethovens Tod', 'Gräfin Giulietta Guicciardi'], 2),
          ('Wie nannte Beethoven die „Mondscheinsonate“?', ['Sonata quasi una fantasia', 'Sonata pathétique', 'Sonata appassionata', 'Mondscheinsonate'], 0),
          ('In welcher Tonart steht die Sonate „Pathétique“?', ['C-Dur', 'c-Moll', 'd-Moll', 'Es-Dur'], 1),
          ('1800 brachte Beethoven zur Uraufführung …', ['seine einzige Oper', 'seine Erste Sinfonie', 'seine Neunte Sinfonie', 'seine letzte Klaviersonate'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 3 – Krise und Heldentum (1802–1814)',
    'lessons': [
      {
        'title': 'Das Gehör schwindet: das Heiligenstädter Testament',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Mit etwa 28 Jahren bemerkte Beethoven, dass er taub wurde. 1802 schrieb er darüber einen bewegenden Brief – und beschloss, für seine Kunst zu leben.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 3', 'title': 'Krise und Heldentum', 'subtitle': '1802 – 1814', 'image': 'beethoven_maehler', 'credit': 'Porträt von Joseph Willibrord Mähler, 1804–05 (gemeinfrei)'},
          {'kind': 'bullets', 'title': 'Ein Musiker wird taub', 'bullets': [
              'Ab etwa 1798 hörte Beethoven ein Klingeln und Sausen in den Ohren',
              'Sein Gehör wurde langsam schlechter – die Ärzte konnten nicht helfen',
              'Jahrelang verbarg er es: Ein tauber Musiker schien undenkbar',
              '1802 schickte ihn sein Arzt zur Erholung in das Dorf Heiligenstadt bei Wien']},
          {'kind': 'image', 'title': 'Heiligenstadt, Oktober 1802', 'text': 'In diesem Haus schrieb Beethoven einen langen Brief an seine Brüder Carl und Johann. Er schickte ihn nie ab – man fand ihn nach seinem Tod in seinen Papieren. Heute nennen wir ihn das „Heiligenstädter Testament“.', 'image': 'heiligenstadt_house', 'credit': 'Foto: Michael Kranewitter, CC BY-SA 3.0, via Wikimedia Commons'},
          {'kind': 'quote', 'quote': 'Nur sie, die Kunst, sie hielt mich zurück. Ach, es dünkte mir unmöglich, die Welt eher zu verlassen, bis ich das alles hervorgebracht, wozu ich mich aufgelegt fühlte.', 'by': 'Heiligenstädter Testament, 6. Oktober 1802'},
          {'kind': 'summary', 'title': 'Ein Wendepunkt', 'bullets': [
              'Beethoven entschied sich weiterzuleben – für seine Musik',
              'Gleich nach der Krise wurde seine Musik kühner und größer',
              'Historiker nennen die folgenden Jahre seine „heroische“ Phase']},
        ],
      },
      {
        'title': 'Hören: die „Eroica“',
        'type': 'AUDIO', 'minutes': 16, 'video': EROICA,
        'description': (
            "Die Sinfonie Nr. 3 Es-Dur, op. 55 – die „Eroica“ (1803/04) – war länger und kühner als jede Sinfonie zuvor. "
            "Zunächst wollte Beethoven sie Napoleon Bonaparte widmen. Als Napoleon sich 1804 selbst zum Kaiser krönte, "
            "zerriss Beethoven – nach dem Bericht seines Schülers Ferdinand Ries – wütend das Titelblatt. Erschienen ist die Sinfonie schließlich "
            "„um das Andenken eines großen Mannes zu feiern“.\n\n"
            "Hier hörst du den ersten Satz (Allegro con brio), gespielt vom Czech National Symphony Orchestra (Musopen, gemeinfrei).\n\n"
            "Achte auf:\n"
            "1. Zwei kurze, laute Akkorde ganz am Anfang – wie ein Klopfen an der Tür\n"
            "2. Das Hauptthema in den Celli, gebaut auf einem einfachen gebrochenen Akkord\n"
            "3. Harte, aufeinanderprallende Akkorde in der Mitte des Satzes – Beethoven wollte, dass man einen Kampf spürt\n\n"
            "Die ganze Sinfonie mit allen vier Sätzen findest du unten in der Bibliothek."
        ),
        'library': [('cmuygtj1r00jr4kktm2vrvx1p', 'Die vollständige „Eroica“ – alle vier Sätze')],
      },
      {
        'title': 'Video: Sinfonie Nr. 5',
        'type': 'YOUTUBE', 'minutes': 35, 'video': 'https://www.youtube.com/watch?v=9aDEq3u5huA',
        'description': (
            "Ta-ta-ta-taaa! Der Beginn der Fünften Sinfonie (1808) ist das berühmteste Vier-Ton-Motiv der Musik. "
            "Sieh die Berliner Philharmoniker unter Herbert von Karajan die ganze Sinfonie spielen.\n\n"
            "Achte auf:\n"
            "1. Wie oft der Rhythmus kurz-kurz-kurz-lang im ersten Satz wiederkehrt\n"
            "2. Die leise, geheimnisvolle Passage, die ohne Pause in den letzten Satz führt\n"
            "3. Das strahlende C-Dur-Finale – vom Dunkel zum Licht\n\n"
            "Die Fünfte wurde am 22. Dezember 1808 in Wien uraufgeführt, in einem etwa vierstündigen Konzert – "
            "zusammen mit der Sechsten Sinfonie („Pastorale“) und dem Vierten Klavierkonzert."
        ),
        'library': [('cmuygw9az01v34kktsjuawo4n', 'Noten des ersten Satzes – finde das Vier-Ton-Motiv'), ('cmuygw9b001v54kktkgrbtz51', 'Die ganze Sinfonie für Klavier bearbeitet')],
      },
      {
        'title': 'Rückblick Woche 3 und Quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der heroischen Jahre, eine Bonus-Aufnahme und das Quiz zu Woche 3.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 3 auf einen Blick', 'bullets': [
              'Ab etwa 1798: Beethoven verliert langsam sein Gehör',
              '1802: das Heiligenstädter Testament – er entscheidet sich, für seine Kunst zu leben',
              '1804: die „Eroica“ – ursprünglich für Napoleon gedacht',
              '1808: Fünfte und Sechste Sinfonie am selben Abend uraufgeführt',
              '1805–1814: seine einzige Oper, „Fidelio“, über Mut und Freiheit']},
          {'kind': 'bullets', 'title': 'Zum Weiterhören', 'bullets': [
              'Die Egmont-Ouvertüre (1810) ist in der Bibliothek – Musik zu Goethes Drama über einen Helden, der für die Freiheit kämpft',
              'Achte auf den dunklen, langsamen Beginn und den triumphalen Schluss']},
        ],
        'library': [('cmuygtj1o00jn4kktbx3ydpyk', 'Zum Weiterhören: die Egmont-Ouvertüre'), ('cmuygw9b101va4kktcabhhrvp', 'Eine Arie aus Fidelio, seiner einzigen Oper')],
        'quiz': [
          ('Was ist das „Heiligenstädter Testament“?', ['Eine Sinfonie', 'Ein Brief an seine Brüder über seine Taubheit', 'Ein Vertrag mit seinem Verleger', 'Eine Kirche in Wien'], 1),
          ('Wem wollte Beethoven die „Eroica“ zuerst widmen?', ['Napoleon Bonaparte', 'Joseph Haydn', 'Fürst Lichnowsky', 'Kaiser Franz'], 0),
          ('Welcher Rhythmus eröffnet die Fünfte Sinfonie?', ['Lang-lang-kurz', 'Kurz-kurz-kurz-lang', 'Lang-kurz-lang-kurz', 'Kurz-lang-kurz-lang'], 1),
          ('In welchem Jahr wurden die Fünfte und die Sechste Sinfonie uraufgeführt?', ['1792', '1800', '1808', '1824'], 2),
          ('Wie heißt Beethovens einzige Oper?', ['Don Giovanni', 'Fidelio', 'Egmont', 'Die Zauberflöte'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 4 – Die späten Jahre und die Neunte (1815–1827)',
    'lessons': [
      {
        'title': 'Musik aus der Stille',
        'type': 'SLIDES', 'minutes': 15,
        'description': "In seinen letzten Jahren war Beethoven fast völlig taub. Mit Besuchern unterhielt er sich schriftlich – und komponierte einige der tiefgründigsten Werke, die je geschrieben wurden.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 4', 'title': 'Die späten Jahre', 'subtitle': '1815 – 1827', 'image': 'beethoven_stieler', 'credit': 'Porträt von Joseph Karl Stieler, 1820 (gemeinfrei)'},
          {'kind': 'bullets', 'title': 'Ein schwieriges Leben', 'bullets': [
              'Ab etwa 1818 schrieben Besucher ihre Fragen in „Konversationshefte“ – rund 140 sind erhalten',
              'Nach dem Tod seines Bruders Carl (1815) führte er einen langen Rechtsstreit um die Erziehung seines Neffen Karl',
              'Er zog oft um, stritt mit Dienstboten – und sorgte sich um Geld',
              'Dennoch komponierte er langsam, sorgfältig und mit gewaltigem Anspruch']},
          {'kind': 'bullets', 'title': 'Die späten Meisterwerke', 'bullets': [
              'Die letzten fünf Klaviersonaten, bis op. 111 (1822)',
              'Die „Missa solemnis“, eine gewaltige Vertonung der katholischen Messe (1823)',
              'Die Neunte Sinfonie mit Chor (1824)',
              'Die späten Streichquartette (1825–26) – Musik so neu, dass viele Hörer ratlos waren']},
          {'kind': 'image', 'title': 'Wien, 7. Mai 1824', 'text': 'Die Neunte Sinfonie wurde im Kärntnertortheater uraufgeführt. Beethoven stand neben dem Dirigenten. Am Ende konnte er den Applaus nicht hören – die Sängerin Caroline Unger drehte ihn um, damit er das jubelnde Publikum sah.', 'image': 'kaerntnertor', 'credit': 'Das Kärntnertortheater, Wien, 1830 (gemeinfrei)'},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Fast völlig taub: Konversationshefte',
              'Späte Werke: Missa solemnis, späte Sonaten und Quartette',
              'Uraufführung der Neunten am 7. Mai 1824 in Wien']},
        ],
      },
      {
        'title': 'Video: „Ode an die Freude“',
        'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=q0EjVVjJraA',
        'description': (
            "Für den letzten Satz seiner Neunten Sinfonie tat Beethoven etwas, das vor ihm niemand getan hatte: Er fügte Gesangssolisten und einen Chor hinzu. "
            "Der Text ist Friedrich Schillers Gedicht „An die Freude“: „Alle Menschen werden Brüder“.\n\n"
            "Achte auf:\n"
            "1. Das Orchester zitiert zuerst Musik aus den vorigen Sätzen – und verwirft sie\n"
            "2. Die berühmte Freudenmelodie, zuerst ganz leise in Celli und Bässen\n"
            "3. Einen Solobariton, der singt: „O Freunde, nicht diese Töne!“\n\n"
            "Wusstest du schon? Seit 1985 ist die Freudenmelodie die offizielle Hymne der Europäischen Union."
        ),
      },
      {
        'title': 'Beethovens Vermächtnis',
        'type': 'SLIDES', 'minutes': 12,
        'description': "Beethoven starb 1827 – und wurde zur Legende. Warum ist seine Musik heute noch wichtig?",
        'slides': [
          {'kind': 'image', 'title': 'Wien, 29. März 1827', 'text': 'Beethoven starb am 26. März 1827. Drei Tage später folgten viele Tausend Menschen seinem Trauerzug durch Wien. Unter den Fackelträgern war ein junger Komponist: Franz Schubert.', 'image': 'beethoven_funeral', 'credit': 'Beethovens Leichenzug, Franz Xaver Stöber, 1827 (gemeinfrei)'},
          {'kind': 'bullets', 'title': 'Was sich durch Beethoven veränderte', 'bullets': [
              'Der Komponist als Künstler, nicht als Diener: Er schrieb, was er schreiben wollte',
              'Größere Formen: längere Sinfonien, Sonaten und Quartette',
              'Musik, die eine Geschichte erzählt – vom Kampf zum Sieg',
              'Komponisten nach ihm – Brahms, Wagner, Mahler – maßen sich an ihm']},
          {'kind': 'bullets', 'title': 'Beethoven heute', 'bullets': [
              'Die „Ode an die Freude“ ist die Hymne Europas',
              'Der Beginn der Fünften Sinfonie ist auf der ganzen Welt bekannt',
              '„Für Elise“ ist eines der ersten Stücke, die viele Klavierschüler lernen',
              'Seine Musik erklingt in Konzertsälen, Filmen, Schulen – und bei den Olympischen Spielen']},
          {'kind': 'summary', 'title': 'Wie es weitergeht', 'bullets': [
              'Entdecke Beethovens Noten und Aufnahmen in der mymusic.coach-Bibliothek',
              'Weiter mit „Franz Schubert: Leben und Lieder“ – dem Komponisten, der bei seinem Begräbnis eine Fackel trug',
              'Oder buche eine Stunde bei deiner Lehrkraft und spiele dein erstes Beethoven-Stück']},
        ],
              'library': [('cmv2iqckr004212ifexdxgvnx', 'Beethoven in den 1910er-Jahren: Jascha Heifetz spielt den „Chor der Derwische“ (1917)'), ('cmuygtj1r00jr4kktm2vrvx1p', 'Noch einmal die „Eroica“ – jetzt, da du die ganze Geschichte kennst')],
      },
      {
        'title': 'Abschluss: Rückblick und Quiz',
        'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Herzlichen Glückwunsch – du bist am Ende des Kurses angekommen! Ein letzter Rückblick und ein Abschlussquiz über alle vier Wochen.",
        'slides': [
          {'kind': 'timeline', 'title': 'Beethovens Leben auf einen Blick', 'rows': [
              ('1770', 'Getauft am 17. Dezember in Bonn'),
              ('1792', 'Umzug nach Wien, Studien bei Haydn'),
              ('1802', 'Heiligenstädter Testament'),
              ('1804', 'Sinfonie „Eroica“'),
              ('1808', 'Fünfte und Sechste Sinfonie'),
              ('1824', 'Uraufführung der Neunten Sinfonie'),
              ('1827', 'Gestorben am 26. März in Wien')]},
          {'kind': 'quote', 'quote': 'Ich will dem Schicksal in den Rachen greifen, ganz niederbeugen soll es mich gewiss nicht.', 'by': 'Beethoven in einem Brief an seinen Freund Franz Wegeler, November 1801'},
        ],
        'quiz': [
          ('Wie alt war Beethoven, als er endgültig nach Wien zog?', ['Etwa 12', 'Etwa 22', 'Etwa 32', 'Etwa 42'], 1),
          ('Wie unterhielten sich Besucher in seinen letzten Jahren mit Beethoven?', ['In Gebärdensprache', 'Schriftlich, in Konversationsheften', 'Nur über seinen Neffen', 'Nur mit einem Hörrohr'], 1),
          ('Was war neu an der Neunten Sinfonie?', ['Sie war für Klavier geschrieben', 'Im letzten Satz singen Solisten und ein Chor', 'Sie hat nur einen Satz', 'Sie war seine erste Sinfonie'], 1),
          ('Wessen Gedicht wird in der „Ode an die Freude“ gesungen?', ['Goethe', 'Schiller', 'Heine', 'Müller'], 1),
          ('Welcher Komponist trug bei Beethovens Begräbnis eine Fackel?', ['Franz Schubert', 'Joseph Haydn', 'Richard Wagner', 'Johannes Brahms'], 0),
          ('Seit 1985 ist die Melodie der „Ode an die Freude“ …', ['die Hymne der Europäischen Union', 'die deutsche Nationalhymne', 'die olympische Hymne', 'die österreichische Bundeshymne'], 0),
        ],
      },
    ],
  },
]
