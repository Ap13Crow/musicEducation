# Clara Schumann (geb. Wieck) - deutsche Fassung von clara.py.
COURSE = {
    'slug': 'clara-schumann-leben-und-werk-einfuehrung',
    'language': 'de',
    'translationOf': 'clara-schumann-life-and-music-introduction',
    'title': 'Clara Schumann: Leben und Werk – Eine erste Einführung',
    'shortSummary': 'Vier Wochen mit Clara Schumann: Wunderkind, die größte Pianistin ihres Jahrhunderts, Komponistin, Ehefrau Robert Schumanns, Freundin von Brahms – und über sechzig Jahre auf der Bühne.',
    'description': (
        "Clara Schumann (1819–1896), geborene Clara Wieck, war mit elf Jahren ein gefeierter Klavierstar, mit dreizehn Komponistin und über sechzig Jahre lang "
        "eine der meistbewunderten Musikerinnen Europas – während sie sieben Kinder großzog und ihre Familie ernährte.\n\n"
        "In vier Wochen folgst du ihrem Leben Schritt für Schritt:\n"
        "- Woche 1 – Leipzig: ein Wunderkind (1819–1835)\n"
        "- Woche 2 – Clara und Robert: eine Liebe gegen den Willen des Vaters (1835–1840)\n"
        "- Woche 3 – Komponistin, Mutter, Virtuosin (1840–1856)\n"
        "- Woche 4 – Vierzig weitere Jahre auf dem Konzertpodium (1856–1896)\n\n"
        "Jede Woche verbindet illustrierte Folien, eine Dokumentation und eine Aufführung ihres Klaviertrios (Carnegie Hall), interaktive Noten ihrer "
        "Lieder aus der mymusic.coach-Bibliothek, eine historische Aufnahme und ein kurzes Quiz. Vorkenntnisse sind nicht nötig. Plane etwa 1–2 Stunden pro Woche ein."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Voice'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'clara_portrait', 'title': 'Clara Schumann', 'subtitle': 'Leben und Werk – Eine erste Einführung', 'tag': '4-Wochen-Kurs'},
}
FOOTER = 'Clara Schumann: Leben und Werk'
PORTRAIT = {'image': 'clara_portrait', 'credit': 'Fotografie von Franz Hanfstaengl, 1857 (gemeinfrei)'}
COUPLE = {'image': 'clara_robert', 'credit': 'Clara und Robert Schumann, Lithografie von Eduard Kaiser, 1847 (gemeinfrei)'}
TRAUMEREI = 'cmv2iz1yr00k812if2gksf8vb'

WEEKS = [
  {
    'title': 'Woche 1 – Leipzig: ein Wunderkind (1819–1835)',
    'lessons': [
      {
        'title': 'Willkommen: Clara Schumann', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Willkommen im Kurs! Lerne Clara Schumann kennen – Pianistin, Komponistin, Lehrerin und eine der bemerkenswertesten Musikerinnen des 19. Jahrhunderts – und sieh, wie die nächsten vier Wochen ablaufen.\n\nTipp: Ihre Lieder findest du in der mymusic.coach-Bibliothek als interaktive Noten – lies mit, markiere deine Lieblingsstücke und sammle zusätzliche XP, wenn du sie bis zum Ende liest.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 1', 'title': 'Clara Schumann', 'subtitle': 'Eine erste Einführung in ihr Leben und ihre Musik', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Warum Clara Schumann?', 'bullets': [
              'Geboren 1819 in Leipzig als Clara Wieck – gestorben 1896 in Frankfurt',
              'Eine der größten Pianistinnen des 19. Jahrhunderts – über 60 Jahre auf der Bühne',
              'Komponistin: ein Klavierkonzert, ein Klaviertrio, Lieder, Klavierstücke',
              'Ehefrau des Komponisten Robert Schumann, enge Freundin von Johannes Brahms',
              'Jahrelang verdiente sie das Geld für eine Familie mit sieben Kindern']},
          {'kind': 'timeline', 'title': 'Deine vier Wochen', 'rows': [
              ('Woche 1', 'Leipzig: ein Wunderkind'),
              ('Woche 2', 'Clara und Robert: eine Liebe gegen den Willen des Vaters'),
              ('Woche 3', 'Komponistin, Mutter, Virtuosin'),
              ('Woche 4', 'Vierzig weitere Jahre auf dem Konzertpodium')]},
          {'kind': 'bullets', 'title': 'Eine Berufsmusikerin', 'bullets': [
              'Anders als Fanny Hensel wurde Clara von Kindheit an für eine öffentliche Laufbahn ausgebildet',
              'Ihr Vater plante jeden Schritt – vom Unterricht bis zu den Konzertreisen',
              'Sie wurde in ganz Europa berühmt – zu einer Zeit, als kaum eine Frau überhaupt einen Beruf hatte',
              'Doch Komponieren, so hörte sie und glaubte sie schließlich selbst, sei Männersache']},
        ],
      },
      {
        'title': 'Die Schülerin ihres Vaters', 'type': 'SLIDES', 'minutes': 15,
        'description': "Friedrich Wieck hatte einen Plan: Seine Tochter sollte eine große Pianistin werden. Diese Folien folgen Claras außergewöhnlicher Kindheit.",
        'slides': [
          {'kind': 'bullets', 'title': 'Leipzig, 13. September 1819', 'bullets': [
              'Ihr Vater Friedrich Wieck war Klavierlehrer und Klavierhändler; ihre Mutter Marianne Tromlitz war Sängerin und Pianistin',
              'Als Clara vier war, trennten sich die Eltern; Clara blieb beim Vater',
              'Bis etwa zum vierten Lebensjahr sprach sie kaum',
              'Ab fünf erhielt sie vom Vater täglich Unterricht: Klavier, Theorie, Violine, Gesang, Komposition']},
          {'kind': 'timeline', 'title': 'Ein Kinderstar', 'rows': [
              ('1828', 'Mit 9: erster Auftritt im Leipziger Gewandhaus'),
              ('1830', 'Mit 11: ihr erstes eigenes Konzert im Gewandhaus'),
              ('1831', 'Sie spielt in Weimar für Goethe, der ihr eine Medaille mit seinem Bildnis schenkt'),
              ('1831–1832', 'Eine Konzertreise nach Paris mit ihrem Vater'),
              ('1831', 'Ihr op. 1 erscheint: vier Polonaisen')]},
          {'kind': 'bullets', 'title': 'Ein neuer Untermieter', 'bullets': [
              '1830 zog ein junger Jurastudent, Robert Schumann, ins Haus der Wiecks, um Klavier zu studieren',
              'Er war neun Jahre älter als Clara',
              'Er erzählte ihr und ihren Brüdern Gespenstergeschichten und spielte mit ihnen',
              'Noch ahnte niemand, was fünf Jahre später geschehen würde']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Geboren am 13. September 1819 in Leipzig',
              'Täglich unterrichtet von ihrem Vater Friedrich Wieck',
              'Mit 11: erstes eigenes Konzert im Gewandhaus',
              'Robert Schumann zieht als Schüler ihres Vaters ins Haus']},
        ],
      },
      {
        'title': 'Video: Begegnung mit Robert und Clara Schumann', 'type': 'YOUTUBE', 'minutes': 12, 'video': 'https://www.youtube.com/watch?v=NK6HLaZ4kp4',
        'description': "Diese Dokumentation des Bachfest Malaysia stellt Robert und Clara Schumann vor – ihr Leben, ihre Liebe und ihre Musik. Das Video ist auf Englisch – schalte bei Bedarf die automatischen Untertitel von YouTube ein.\n\nAchte beim Anschauen auf Folgendes:\n1. Warum kämpfte Claras Vater gegen ihre Heirat?\n2. Wie beeinflussten sich Clara und Robert gegenseitig in ihrer Musik?\n3. Was geschah 1854 mit Robert?\n\nAlles kommt in den nächsten Wochen wieder.",
      },
      {
        'title': 'Ein Konzert mit vierzehn – und Quiz zu Woche 1', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "Mit 13 Jahren begann Clara ein Klavierkonzert. Dann eine kurze Zusammenfassung und fünf Fragen.",
        'slides': [
          {'kind': 'bullets', 'title': 'Klavierkonzert a-Moll, op. 7', 'bullets': [
              '1833 begonnen, als Clara 13 war; den letzten Satz instrumentierte sie mit Roberts Hilfe',
              'Uraufgeführt am 9. November 1835 im Gewandhaus – Clara spielte, Felix Mendelssohn dirigierte',
              'Die drei Sätze gehen ohne Pause ineinander über',
              'Der langsame Satz ist ein leises Duett für Klavier und Solocello – eine für die Zeit ungewöhnliche Idee']},
          {'kind': 'summary', 'title': 'Woche 1 auf einen Blick', 'bullets': [
              'Geboren 1819 in Leipzig; ab fünf vom Vater ausgebildet',
              'Erstes eigenes Konzert im Gewandhaus mit 11; Vorspiel bei Goethe',
              'Ein mit 16 vollendetes Klavierkonzert, uraufgeführt unter Mendelssohn',
              'Robert Schumann lebt als Schüler ihres Vaters im Haus']},
        ],
        'quiz': [
          ('In welcher Stadt wurde Clara Schumann geboren?', ['Dresden', 'Leipzig', 'Frankfurt', 'Wien'], 1),
          ('Wer war Claras erster und wichtigster Lehrer?', ['Felix Mendelssohn', 'Ihr Vater Friedrich Wieck', 'Robert Schumann', 'Franz Liszt'], 1),
          ('Welcher berühmte Dichter hörte sie 1831 spielen?', ['Heine', 'Goethe', 'Schiller', 'Eichendorff'], 1),
          ('Wer dirigierte 1835 die Uraufführung ihres Klavierkonzerts?', ['Robert Schumann', 'Felix Mendelssohn', 'Johannes Brahms', 'Ihr Vater'], 1),
          ('Warum wohnte Robert Schumann im Haus der Wiecks?', ['Er war ein Cousin', 'Er war Klavierschüler ihres Vaters', 'Er mietete dort einen Laden', 'Er war ihr Lehrer'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 2 – Clara und Robert: eine Liebe gegen den Willen des Vaters (1835–1840)',
    'lessons': [
      {
        'title': 'Eine heimliche Verlobung', 'type': 'SLIDES', 'minutes': 15,
        'description': "Clara und Robert verliebten sich, als sie sechzehn war. Ihr Vater tat alles, um sie zu trennen.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 2', 'title': 'Clara und Robert', 'subtitle': '1835 – 1840', **COUPLE},
          {'kind': 'bullets', 'title': 'Liebe und Verbot', 'bullets': [
              '1835 verliebten sich Clara und Robert; 1837 verlobten sie sich heimlich',
              'Friedrich Wieck verbot jeden Kontakt – Robert hatte wenig Geld und eine unsichere Zukunft',
              'Lange Zeit konnten sie sich nur Briefe schreiben, oft heimlich übermittelt',
              'Ihre Musik wurde zur Geheimsprache: Sie zitierten gegenseitig ihre Themen']},
          {'kind': 'bullets', 'title': 'Wien, 1838', 'bullets': [
              'Auf einer Konzertreise nach Wien 1837/38 wurde Clara zur Sensation',
              'Mit 18 wurde sie zur k. k. Kammervirtuosin ernannt – der höchsten österreichischen Auszeichnung für Musiker',
              'Ungewöhnlich für eine Protestantin, eine Ausländerin – und so jung',
              'Sogar der Dichter Franz Grillparzer schrieb ein Gedicht über ihr Spiel']},
          {'kind': 'timeline', 'title': 'Vor Gericht für die Liebe', 'rows': [
              ('1839', 'Clara und Robert verklagen ihren Vater, um heiraten zu dürfen'),
              ('1840', 'Das Gericht entscheidet zu ihren Gunsten'),
              ('12. September 1840', 'Hochzeit in der Dorfkirche von Schönefeld bei Leipzig – am Tag vor ihrem 21. Geburtstag')]},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              '1837: eine heimliche Verlobung',
              '1838: k. k. Kammervirtuosin in Wien',
              '12. September 1840: Hochzeit, nach einem Prozess gegen ihren Vater']},
        ],
      },
      {
        'title': 'Hören: Musik für Clara', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [TRAUMEREI, 0],
        'description': "In den Jahren der Trennung schrieb Robert viele seiner besten Klavierwerke – und Clara steckte in allen. 1838 schrieb er ihr, sie habe einmal gesagt, er komme ihr manchmal wie ein Kind vor – daraus entstanden die „Kinderszenen“, etwa dreißig kleine Stücke, von denen er dreizehn behielt.\n\nDas siebte ist die „Träumerei“ – hier in einer Fassung für Violoncello, gespielt vom belgischen Cellisten Maurice Dambois auf einer Schellackplatte von 1919.\n\nAchte auf:\n1. Eine einzige kurze, schlichte Melodie, die immer wieder steigt und fällt\n2. Wie sich die Harmonien darunter jedes Mal ändern\n3. Und überlege dann: Was mag Clara in dieser Musik gehört haben?\n\n1840, im Jahr der Hochzeit, schrieb Robert mehr als 100 Lieder. Sein Hochzeitsgeschenk für sie war die Liedersammlung „Myrthen“, die mit „Widmung“ beginnt.",
        'library': [(TRAUMEREI, 'Robert Schumann: „Träumerei“ – Maurice Dambois, Violoncello, 1919'), ('cmv2iwhqx00f212ifgakf8i8u', 'Robert Schumann: Romanze Fis-Dur – Olga Samaroff, Klavier, 1924')],
      },
      {
        'title': 'Lesen: Claras Lieder', 'type': 'SLIDES', 'minutes': 12,
        'description': "1841 veröffentlichten Clara und Robert eine gemeinsame Liedersammlung. Lies ihre drei Lieder daraus.",
        'slides': [
          {'kind': 'bullets', 'title': 'Zwölf Lieder aus „Liebesfrühling“', 'bullets': [
              'Gedichte von Friedrich Rückert, vertont von Robert und Clara',
              '1841 erschienen als Roberts op. 37 und Claras op. 12 – ohne anzugeben, wer welches Lied schrieb',
              'Claras drei: „Er ist gekommen in Sturm und Regen“, „Liebst du um Schönheit“ und „Warum willst du and’re fragen“',
              'Kritiker konnten ihre Lieder oft nicht voneinander unterscheiden']},
          {'kind': 'listen', 'title': '„Liebst du um Schönheit“', 'work': 'Lieder, op. 12', 'points': [
              '„Liebst du um Schönheit, o nicht mich liebe! Liebe die Sonne …“',
              'Jede Strophe nennt einen Grund, nicht zu lieben: Schönheit, Jugend, Schätze',
              'Die letzte Strophe: „Liebst du um Liebe, o ja, mich liebe!“',
              'Achte darauf, wie die Musik in der letzten Strophe wärmer wird – öffne die interaktiven Noten']},
          {'kind': 'listen', 'title': '„Er ist gekommen in Sturm und Regen“', 'work': 'Lieder, op. 12', 'points': [
              'Eine stürmische, drängende Klavierstimme – man hört den Regen',
              'Die Singstimme ist atemlos vor Aufregung',
              'Ein Liebeslied, das zugleich ein Naturbild ist',
              'Vergleiche es mit Roberts „Widmung“, wenn du sie kennst']},
        ],
        'library': [('cmuyfx8w200ye2eony5s6x9v2', '„Liebst du um Schönheit“ – interaktive Noten'), ('cmuyfx8w200yd2eon215aey0k', '„Er ist gekommen in Sturm und Regen“ – interaktive Noten'), ('cmuyfx8w300yf2eonkr9ncs19', '„Warum willst du and’re fragen“ – interaktive Noten')],
      },
      {
        'title': 'Rückblick Woche 2 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der Liebesgeschichte, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 2 auf einen Blick', 'bullets': [
              '1835–1840: Clara und Robert verliebt – gegen den Willen ihres Vaters',
              '1838: die höchste österreichische Auszeichnung für Musiker, mit 18',
              '1840: ein Prozess – und die Hochzeit am 12. September',
              '1841: gemeinsame Lieder nach Gedichten von Rückert']},
        ],
        'quiz': [
          ('Warum zogen Clara und Robert vor Gericht?', ['Wegen Geld', 'Um heiraten zu dürfen', 'Wegen einer gestohlenen Handschrift', 'Wegen eines Konzertvertrags'], 1),
          ('Wann heirateten Clara und Robert?', ['1835', '1838', '1840', '1854'], 2),
          ('Welche Auszeichnung erhielt Clara 1838 in Wien?', ['Eine Goldmedaille von Goethe', 'Den Titel k. k. Kammervirtuosin', 'Die Ehrenbürgerschaft Wiens', 'Das Amt einer Hofkapellmeisterin'], 1),
          ('Welcher Dichter schrieb die Texte ihrer gemeinsamen Lieder von 1841?', ['Heine', 'Friedrich Rückert', 'Goethe', 'Schiller'], 1),
          ('Wie heißt das siebte Stück der „Kinderszenen“?', ['Walzer', 'Träumerei', 'Kindheit', 'Abschied'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 3 – Komponistin, Mutter, Virtuosin (1840–1856)',
    'lessons': [
      {
        'title': 'Zwei Laufbahnen in einem Haus', 'type': 'SLIDES', 'minutes': 15,
        'description': "Die Ehe brachte Glück – und einen schwierigen Balanceakt zwischen Kindern, Roberts Komponieren und ihrer eigenen Laufbahn.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 3', 'title': 'Komponistin, Mutter, Virtuosin', 'subtitle': '1840 – 1856', **COUPLE},
          {'kind': 'bullets', 'title': 'Ein gemeinsames Tagebuch', 'bullets': [
              'Clara und Robert führten gemeinsam ein Ehetagebuch und schrieben abwechselnd',
              'Sie studierten zusammen Bach-Fugen und Partituren',
              'Doch wenn Robert komponierte, konnte Clara nicht üben – die Wohnung war zu klein',
              'Zwischen 1841 und 1854 brachte sie acht Kinder zur Welt; sieben überlebten das Säuglingsalter']},
          {'kind': 'timeline', 'title': 'Orte und Werke', 'rows': [
              ('1844', 'Eine lange Russlandreise; die Familie zieht nach Dresden'),
              ('1846', 'Klaviertrio g-Moll, op. 17 – ihr größtes Kammermusikwerk'),
              ('1850', 'Umzug nach Düsseldorf, wo Robert Musikdirektor wird'),
              ('1853', 'Drei Romanzen für Violine und Klavier, op. 22; Variationen über ein Thema von Robert, op. 20')]},
          {'kind': 'quote', 'quote': 'Es geht doch nichts über das Selbstschaffen, und wäre es nur, daß man doch Stunden lang sich selbst vergißt, wo man nur in Tönen athmet.', 'by': 'Clara Schumann, Tagebuch, 1853'},
        ],
      },
      {
        'title': 'Video: das Klaviertrio g-Moll', 'type': 'YOUTUBE', 'minutes': 30, 'video': 'https://www.youtube.com/watch?v=H_Pc04tZzmg',
        'description': "Clara Schumanns Klaviertrio g-Moll, op. 17 (1846), gespielt vom Ensemble Connect in der Carnegie Hall.\n\nEs war Claras ehrgeizigstes Werk; Robert schrieb im Jahr darauf sein eigenes erstes Klaviertrio. Mendelssohns Einfluss ist deutlich – und ebenso ihre eigene Stimme.\n\nAchte auf:\n1. Erster Satz: ein dunkles, gesangliches Thema der Violine über fließendem Klavier\n2. Zweiter Satz: ein anmutiges „Scherzo“ im Tempo eines Menuetts\n3. Dritter Satz: ein zärtlicher langsamer Satz\n4. Finale: eine fugenartige Passage (ein Fugato) – Clara liebte Bach\n\nDenk darüber nach: Warum zweifelte eine Komponistin, die solche Musik schrieb, so oft an ihrem Talent?",
      },
      {
        'title': 'Brahms und die Katastrophe von 1854', 'type': 'SLIDES', 'minutes': 15,
        'description': "1853 klopfte ein junger Mann aus Hamburg an die Tür der Schumanns. Wenige Monate später brach Claras Leben zusammen.",
        'slides': [
          {'kind': 'bullets', 'title': 'Johannes Brahms, 1853', 'bullets': [
              'Am 30. September 1853 besuchte der 20-jährige Brahms die Schumanns in Düsseldorf',
              'Robert kündigte ihn in einem Artikel als kommendes Genie an – „Neue Bahnen“',
              'Brahms und der Geiger Joseph Joachim wurden Claras lebenslange Freunde',
              'Über vierzig Jahre lang zeigte Brahms ihr jedes neue Werk']},
          {'kind': 'bullets', 'title': '1854', 'bullets': [
              'Robert litt seit Langem an Depressionen; im Februar 1854 verschlimmerte sich seine Krankheit stark',
              'Er stürzte sich in den Rhein, wurde gerettet und bat, in eine Heilanstalt in Endenich bei Bonn gebracht zu werden',
              'Über zwei Jahre lang erlaubten die Ärzte Clara nicht, ihn zu sehen',
              'Sie sah ihn erst zwei Tage vor seinem Tod am 29. Juli 1856 wieder']},
          {'kind': 'bullets', 'title': 'Sie gibt das Komponieren auf', 'bullets': [
              'Nach 1853 schrieb Clara fast keine Musik mehr',
              'Sie hatte sieben Kinder zu ernähren – und wurde als reisende Pianistin die Ernährerin der Familie',
              'Brahms half der Familie in Düsseldorf, während sie auf Tournee war',
              'Schon 1839 hatte sie geschrieben: „Ein Frauenzimmer muß nicht componieren wollen – es konnte es noch keine, sollte ich dazu bestimmt sein?“']},
          {'kind': 'listen', 'title': 'Ihre letzten Lieder', 'work': '„Die stille Lotosblume“ (1843) und die Sechs Lieder, op. 23 (1853)', 'points': [
              '„Die stille Lotosblume“: die Lotosblume auf einem stillen See – endet auf einem offenen, unaufgelösten Akkord',
              'Op. 23: sechs Lieder aus „Jucunde“ von Hermann Rollett – unter ihren letzten Werken',
              'Öffne die interaktiven Noten und lies sie']},
        ],
        'library': [('cmuyfx8u000y62eonvrbwvse4', '„Die stille Lotosblume“ – interaktive Noten'), ('cmuyfx8u200yc2eonu34mmw4s', '„O Lust, o Lust“, op. 23 – interaktive Noten')],
      },
      {
        'title': 'Rückblick Woche 3 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der Ehejahre, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 3 auf einen Blick', 'bullets': [
              'Komponistin, Konzertpianistin und Mutter von acht Kindern',
              '1846: Klaviertrio g-Moll, op. 17',
              '1853: Brahms und Joachim werden lebenslange Freunde',
              '1854: Roberts Zusammenbruch; er stirbt 1856 – Clara hört auf zu komponieren']},
        ],
        'quiz': [
          ('Was ist Claras größtes Kammermusikwerk?', ['Ein Streichquartett', 'Das Klaviertrio g-Moll, op. 17', 'Eine Violinsonate', 'Ein Oktett'], 1),
          ('Wer klopfte 1853 an die Tür der Schumanns?', ['Franz Liszt', 'Johannes Brahms', 'Richard Wagner', 'Frédéric Chopin'], 1),
          ('Welcher Geiger wurde Claras lebenslanger Freund?', ['Niccolò Paganini', 'Joseph Joachim', 'Ferdinand David', 'Pablo de Sarasate'], 1),
          ('Wann starb Robert Schumann?', ['1847', '1854', '1856', '1896'], 2),
          ('Was tat Clara nach 1854, um ihre Familie zu ernähren?', ['Sie eröffnete einen Laden', 'Sie reiste als Konzertpianistin', 'Sie heiratete wieder', 'Sie verkaufte Roberts Handschriften'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 4 – Vierzig weitere Jahre auf dem Konzertpodium (1856–1896)',
    'lessons': [
      {
        'title': 'Die Königin des Klaviers', 'type': 'SLIDES', 'minutes': 15,
        'description': "Vier Jahrzehnte nach Roberts Tod reiste Clara durch Europa. Sie veränderte, wie Konzerte gegeben – und wie Klavier gespielt wurde.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 4', 'title': 'Vierzig weitere Jahre auf der Bühne', 'subtitle': '1856 – 1896', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Eine neue Art von Pianistin', 'bullets': [
              'Sie gab weit über tausend Konzerte in ganz Europa; England besuchte sie viele Male',
              'Sie war eine der Ersten, die regelmäßig auswendig spielten',
              'Sie spielte ernste Musik – Bach, Beethoven, Chopin, Schumann, Brahms – nicht nur Bravourstücke',
              'Sie setzte sich für Roberts Musik ein und gab später seine gesammelten Werke heraus']},
          {'kind': 'timeline', 'title': 'Die späten Jahre', 'rows': [
              ('1856', 'Robert stirbt; Clara setzt ihre Laufbahn fort'),
              ('1863', 'Sommer in Baden-Baden'),
              ('1878', 'Erste Klavierlehrerin am neuen Hoch’schen Konservatorium in Frankfurt'),
              ('1891', 'Ihr letztes öffentliches Konzert, in Frankfurt'),
              ('20. Mai 1896', 'Stirbt in Frankfurt mit 76 Jahren; beigesetzt neben Robert in Bonn')]},
          {'kind': 'bullets', 'title': 'Lehrerin', 'bullets': [
              'In Frankfurt unterrichtete sie Schülerinnen und Schüler aus ganz Europa und Amerika',
              'Sie bestand auf einem gesanglichen Ton und auf Treue zum Notentext',
              'Ihre Schüler trugen ihren Stil ins 20. Jahrhundert']},
        ],
      },
      {
        'title': 'Lesen: „Lorelei“', 'type': 'SLIDES', 'minutes': 10,
        'description': "Claras „Lorelei“ (1843) vertont Heinrich Heines berühmtes Gedicht über die Nixe am Rhein – und zeigt sie von ihrer dramatischsten Seite.",
        'slides': [
          {'kind': 'listen', 'title': '„Lorelei“ (1843)', 'work': 'Lied nach einem Gedicht von Heinrich Heine', 'points': [
              'Die Lorelei sitzt auf einem Felsen über dem Rhein und kämmt ihr goldenes Haar',
              'Ihr Gesang ist so schön, dass die Schiffer die Felsen vergessen – und untergehen',
              'Claras Klavierstimme rauscht vom Anfang bis zum Ende wie der Fluss',
              'Ganz anders als Friedrich Silchers berühmte volkstümliche Vertonung – öffne die interaktiven Noten']},
          {'kind': 'summary', 'title': 'Claras Lieder in der Bibliothek', 'bullets': [
              'Op. 12 und op. 13 (1840–1844): Rückert, Heine und Geibel',
              'Op. 23 (1853): sechs Lieder nach Gedichten von Hermann Rollett',
              'Einzelne Lieder wie „Lorelei“ und „Die gute Nacht“',
              '17 ihrer Lieder stehen als interaktive Noten in der Bibliothek']},
        ],
        'library': [('cmuyfx8w900yh2eon7yibchvi', '„Lorelei“ – interaktive Noten'), ('cmuyfx8tz00y12eon3xbau5mx', '„Ich stand in dunklen Träumen“, op. 13 – interaktive Noten')],
      },
      {
        'title': 'Clara Schumann heute', 'type': 'SLIDES', 'minutes': 10,
        'description': "Wie man sich an Clara erinnert – und warum ihre Musik immer öfter gespielt wird.",
        'slides': [
          {'kind': 'bullets', 'title': 'In Erinnerung', 'bullets': [
              'Auf der letzten D-Mark-Serie vor dem Euro war sie auf dem 100-Mark-Schein abgebildet',
              'Ihr 200. Geburtstag 2019 brachte weltweit Konzerte, Aufnahmen und Bücher',
              'Ihr Klavierkonzert, ihr Klaviertrio und die Romanzen op. 22 gehören wieder zum Repertoire',
              'Ihre Tagebücher und Briefwechsel mit Robert und Brahms gehören zu den großen Dokumenten der Romantik']},
          {'kind': 'summary', 'title': 'Wie es weitergeht', 'bullets': [
              'Weiter mit „Johannes Brahms“, „Felix Mendelssohn“ und „Fanny Hensel“',
              'Sängerinnen und Sänger: Frag deine Lehrkraft nach „Liebst du um Schönheit“',
              'Pianisten: Suche ihre „Romanzen“ und „Soirées musicales“']},
        ],
      },
      {
        'title': 'Abschluss: Rückblick und Quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Herzlichen Glückwunsch – du bist am Ende des Kurses angekommen! Ein letzter Rückblick und ein Abschlussquiz über alle vier Wochen.",
        'slides': [
          {'kind': 'timeline', 'title': 'Clara Schumanns Leben auf einen Blick', 'rows': [
              ('1819', 'Geboren am 13. September in Leipzig'),
              ('1830', 'Erstes eigenes Konzert im Gewandhaus, mit 11'),
              ('1835', 'Uraufführung ihres Klavierkonzerts'),
              ('1840', 'Heirat mit Robert Schumann'),
              ('1846', 'Klaviertrio g-Moll'),
              ('1853–1856', 'Brahms; Roberts Krankheit und Tod'),
              ('1896', 'Gestorben am 20. Mai in Frankfurt')]},
        ],
        'quiz': [
          ('Wie lange trat Clara öffentlich auf?', ['Etwa 10 Jahre', 'Etwa 30 Jahre', 'Mehr als 60 Jahre', 'Nur als Kind'], 2),
          ('Was war an Claras Konzerten ungewöhnlich?', ['Sie spielte nur eigene Musik', 'Sie spielte oft auswendig', 'Sie spielte immer mit Orchester', 'Sie spielte nie Beethoven'], 1),
          ('Wo unterrichtete Clara ab 1878?', ['Am Leipziger Konservatorium', 'Am Hoch’schen Konservatorium in Frankfurt', 'Am Pariser Conservatoire', 'An der Royal Academy in London'], 1),
          ('Auf welchem Geldschein war Clara Schumann abgebildet?', ['Auf dem 100-D-Mark-Schein', 'Auf der 50-Franken-Note', 'Auf dem 10-Euro-Schein', 'Auf dem 1000-Schilling-Schein'], 0),
          ('Auf wessen Gedicht beruht ihr Lied „Lorelei“?', ['Goethe', 'Heinrich Heine', 'Rückert', 'Eichendorff'], 1),
          ('Wie viele ihrer Kinder überlebten das Säuglingsalter?', ['Drei', 'Fünf', 'Sieben', 'Neun'], 2),
        ],
      },
    ],
  },
]
