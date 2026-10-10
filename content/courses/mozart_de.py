# Wolfgang Amadeus Mozart - deutsche Fassung von mozart.py.
COURSE = {
    'slug': 'mozart-leben-und-werk-einfuehrung',
    'language': 'de',
    'translationOf': 'mozart-life-and-music-introduction',
    'title': 'Wolfgang Amadeus Mozart: Leben und Werk – Eine erste Einführung',
    'shortSummary': 'Vier Wochen mit Mozart: das Wunderkind aus Salzburg, das durch Europa reiste, Wien eroberte und die Zauberflöte und das Requiem schrieb, bevor es mit 35 starb.',
    'description': (
        "Wolfgang Amadeus Mozart (1756–1791) gab mit sechs Jahren seine ersten Konzerte, schrieb mit acht seine erste Sinfonie und komponierte "
        "in nur 35 Lebensjahren mehr als 600 Werke – Opern, Sinfonien, Konzerte, Kammermusik und Kirchenmusik.\n\n"
        "In vier Wochen folgst du seinem Leben Schritt für Schritt:\n"
        "- Woche 1 – Das Wunderkind aus Salzburg (1756–1766)\n"
        "- Woche 2 – Erwachsenwerden auf Reisen – und der Bruch (1766–1781)\n"
        "- Woche 3 – Wien: freier Künstler, Figaro und Don Giovanni (1781–1788)\n"
        "- Woche 4 – Die letzten Jahre: Die Zauberflöte und das Requiem (1788–1791)\n\n"
        "Jede Woche verbindet illustrierte Folien, Videos (darunter die Königin der Nacht aus dem Royal Opera House), Aufnahmen und Noten aus der "
        "mymusic.coach-Bibliothek und ein kurzes Quiz. Vorkenntnisse sind nicht nötig. Plane etwa 1–2 Stunden pro Woche ein."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin', 'Voice'],
    'musicStyles': ['Classical', 'Opera'],
    'cover': {'image': 'mozart_portrait', 'title': 'Mozart', 'subtitle': 'Leben und Werk – Eine erste Einführung', 'tag': '4-Wochen-Kurs'},
}
FOOTER = 'Wolfgang Amadeus Mozart: Leben und Werk'
PORTRAIT = {'image': 'mozart_portrait', 'credit': 'Posthumes Porträt von Barbara Krafft, 1819 (gemeinfrei)'}
SYMPHONY_40 = 'cmuygtj2l00l84kktos5ni9rf'

WEEKS = [
  {
    'title': 'Woche 1 – Das Wunderkind aus Salzburg (1756–1766)',
    'lessons': [
      {
        'title': 'Willkommen: Wolfgang Amadeus Mozart', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Willkommen im Kurs! Lerne Wolfgang Amadeus Mozart kennen und sieh, wie die nächsten vier Wochen ablaufen.\n\nTipp: Alle Musik, die im Kurs vorkommt, ist in den Lektionen verlinkt. Öffne sie in der Bibliothek, lies die Noten mit und sammle zusätzliche XP, wenn du bis zum Ende liest oder hörst.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 1', 'title': 'Wolfgang Amadeus Mozart', 'subtitle': 'Eine erste Einführung in sein Leben und seine Musik', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Warum Mozart?', 'bullets': [
              'Geboren 1756 in Salzburg – gestorben 1791 in Wien, mit nur 35 Jahren',
              'Ein Wunderkind, das jahrelang mit seiner Familie durch Europa reiste',
              'Er schrieb in jeder Gattung seiner Zeit – und war in allen herausragend',
              'Seine Opern gehören zu den meistgespielten der Welt',
              'Mit Haydn und Beethoven der große Meister der Wiener Klassik']},
          {'kind': 'timeline', 'title': 'Deine vier Wochen', 'rows': [
              ('Woche 1', 'Das Wunderkind aus Salzburg (1756–1766)'),
              ('Woche 2', 'Erwachsenwerden auf Reisen – und der Bruch (1766–1781)'),
              ('Woche 3', 'Wien: Figaro und Don Giovanni (1781–1788)'),
              ('Woche 4', 'Die Zauberflöte und das Requiem (1788–1791)')]},
          {'kind': 'bullets', 'title': 'Was ist die „Klassik“?', 'bullets': [
              'Die Musik von etwa 1750 bis 1820: Haydn, Mozart, der junge Beethoven',
              'Klare, singbare Melodien mit einfacher Begleitung',
              'Ausgewogene Phrasen – wie Frage und Antwort',
              'Neue Formen, die zum Standard wurden: Sinfonie, Streichquartett, Sonate']},
          {'kind': 'quote', 'quote': 'Die Melodie ist das Wesen der Musik.', 'by': 'Wolfgang Amadeus Mozart zugeschrieben'},
        ],
      },
      {
        'title': 'Ein Wunderkind auf Reisen', 'type': 'SLIDES', 'minutes': 15,
        'description': "Noch bevor er zehn war, hatte Mozart vor einer Kaiserin, einem König und einer Königin gespielt und war in Paris und London zu hören gewesen. Diese Folien erzählen, wie es dazu kam.",
        'slides': [
          {'kind': 'image', 'title': 'Salzburg, 27. Januar 1756', 'text': 'Johannes Chrysostomus Wolfgangus Theophilus Mozart wurde in diesem Haus in der Getreidegasse geboren. „Theophilus“ heißt „von Gott geliebt“ – lateinisch „Amadeus“, der Name, den er später gern benutzte.', 'image': 'mozart_birthplace', 'credit': 'Mozarts Geburtshaus, Salzburg (Foto: Immanuel Giel, gemeinfrei)'},
          {'kind': 'bullets', 'title': 'Vater und Lehrer: Leopold Mozart', 'bullets': [
              'Leopold war Geiger und Komponist am Hof des Salzburger Fürsterzbischofs',
              'Seine 1756 erschienene Violinschule wurde in ganz Europa benutzt',
              'Er unterrichtete Wolfgang und dessen ältere Schwester Maria Anna – „Nannerl“ – selbst',
              'Wolfgang schrieb seine ersten kleinen Stücke mit fünf; Leopold notierte sie']},
          {'kind': 'timeline', 'title': 'Unterwegs', 'rows': [
              ('1762', 'Erste Reisen: München, dann Wien – er spielt vor Kaiserin Maria Theresia'),
              ('1763–1766', 'Die „große Reise“: dreieinhalb Jahre durch Deutschland, nach Paris, London und in die Niederlande'),
              ('1764', 'London: Freundschaft mit Johann Christian Bach; seine erste Sinfonie'),
              ('1764', 'In Paris erscheinen seine ersten Werke im Druck – Sonaten für Klavier und Violine'),
              ('1766', 'Heimkehr nach Salzburg')]},
          {'kind': 'bullets', 'title': 'Vorführen – und lernen', 'bullets': [
              'Das Publikum stellte ihn auf die Probe: Spielen mit einem Tuch über den Tasten, Töne benennen, alles vom Blatt spielen',
              'Vor allem aber waren die Reisen eine Schule: Wolfgang nahm jeden Stil auf, den er hörte',
              'Auch Nannerl war eine glänzende Pianistin – doch als Mädchen endete ihre Laufbahn, als sie erwachsen wurde']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Geboren am 27. Januar 1756 in Salzburg',
              'Unterrichtet von seinem Vater Leopold, zusammen mit seiner Schwester Nannerl',
              'Ab sieben Jahren dreieinhalb Jahre auf Europareise',
              'London: J. C. Bach und seine erste Sinfonie']},
        ],
      },
      {
        'title': 'Video: Mozarts Leben und seine Orte', 'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=fC0_h3-ZH0Q',
        'description': "Diese Dokumentation besucht die Orte, an denen Mozart lebte und arbeitete – von Salzburg quer durch Europa bis nach Wien. Das Video ist auf Englisch – schalte bei Bedarf die automatischen Untertitel von YouTube ein.\n\nAchte beim Anschauen auf Folgendes:\n1. Welche Städte besuchte die Familie Mozart auf ihren Reisen?\n2. Warum verließ Mozart Salzburg für immer?\n3. Welche seiner Opern wurden in Prag uraufgeführt?\n\nDu musst dir nicht alles merken – jeder Teil kommt in den nächsten Wochen wieder.",
      },
      {
        'title': 'Rückblick Woche 1 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Eine kurze Zusammenfassung, ein erstes Stück zum Entdecken und fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 1 auf einen Blick', 'bullets': [
              'Geboren am 27. Januar 1756 in Salzburg',
              'Vater Leopold: Geiger, Komponist und Lehrer',
              'Schwester Nannerl: eine begabte Pianistin',
              '1763–1766: die große Reise – Paris, London, die Niederlande',
              'Erste Sinfonie mit acht Jahren in London']},
          {'kind': 'bullets', 'title': 'Diese Woche zum Entdecken', 'bullets': [
              'Mozarts 12 Variationen über „Ah vous dirai-je, Maman“ – die Melodie von „Morgen kommt der Weihnachtsmann“ und „Twinkle, Twinkle, Little Star“',
              'Er schrieb sie um 1781/82 in Wien – sie zeigen perfekt, wie gern er mit einer einfachen Melodie spielte',
              'Öffne die Noten und finde die Melodie in jeder Variation']},
        ],
        'library': [('cmuygwa26027v4kktd1gb78bx', 'Variationen über „Ah vous dirai-je, Maman“ – Noten')],
        'quiz': [
          ('In welcher Stadt wurde Mozart geboren?', ['Wien', 'Salzburg', 'Prag', 'München'], 1),
          ('Wer war Mozarts erster Lehrer?', ['Joseph Haydn', 'Sein Vater Leopold', 'Johann Christian Bach', 'Antonio Salieri'], 1),
          ('Wie hieß Mozarts Schwester, ebenfalls eine begabte Pianistin?', ['Constanze', 'Nannerl (Maria Anna)', 'Aloysia', 'Fanny'], 1),
          ('Wo schrieb Mozart mit acht Jahren seine erste Sinfonie?', ['Salzburg', 'Paris', 'London', 'Rom'], 2),
          ('Welche Melodie ist „Ah vous dirai-je, Maman“?', ['Happy Birthday', 'Morgen kommt der Weihnachtsmann (Twinkle, Twinkle, Little Star)', 'Bruder Jakob', 'Stille Nacht'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 2 – Erwachsenwerden auf Reisen – und der Bruch (1766–1781)',
    'lessons': [
      {
        'title': 'Italien, Salzburg und die Suche nach einer Stelle', 'type': 'SLIDES', 'minutes': 15,
        'description': "Als Jugendlicher eroberte Mozart Italien. Als junger Mann fühlte er sich in Salzburg gefangen – bis er sich 1781 losriss.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 2', 'title': 'Erwachsen werden – und sich lösen', 'subtitle': '1766 – 1781', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Triumph in Italien', 'bullets': [
              'Zwischen 1769 und 1773 unternahmen Mozart und sein Vater drei Reisen nach Italien',
              'In Rom hörte er in der Sixtinischen Kapelle Allegris geheimes „Miserere“ und schrieb es aus dem Gedächtnis auf',
              'Der Papst ernannte ihn zum Ritter vom Goldenen Sporn',
              'Seine Oper „Mitridate“ (1770) war in Mailand ein Erfolg – er war 14']},
          {'kind': 'image', 'title': 'Eine musikalische Familie', 'text': 'Die Familie um 1780: Nannerl und Wolfgang am Klavier, Leopold mit seiner Geige. Die Mutter Anna Maria, 1778 gestorben, hängt als Porträt an der Wand.', 'image': 'mozart_family', 'credit': 'Johann Nepomuk della Croce, die Familie Mozart, um 1780 (gemeinfrei)'},
          {'kind': 'timeline', 'title': 'Jahre der Enttäuschung', 'rows': [
              ('1773', 'Zurück in Salzburg, als Hofmusiker beim strengen Fürsterzbischof Colloredo'),
              ('1777–1779', 'Stellensuche in Mannheim und Paris – ohne Erfolg'),
              ('1778', 'Seine Mutter stirbt in Paris, wo sie ihn begleitet'),
              ('1781', 'Erfolg in München mit der Oper „Idomeneo“'),
              ('1781', 'In Wien überwirft er sich mit Colloredo; der Oberküchenmeister Graf Arco befördert ihn mit einem Fußtritt hinaus')]},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Drei Italienreisen als Jugendlicher',
              'Unglückliche Jahre als Hofmusiker in Salzburg',
              '1778: Tod der Mutter in Paris',
              '1781: Er verlässt den Dienst des Erzbischofs und bleibt in Wien']},
        ],
      },
      {
        'title': 'Hören: die Klaviersonate C-Dur „facile“', 'type': 'SLIDES', 'minutes': 12,
        'description': "Mozart nannte sie eine kleine Sonate „für Anfänger“ – heute ist sie eines der meistgespielten Klavierstücke der Welt. Ein perfektes Beispiel für den klassischen Stil.",
        'slides': [
          {'kind': 'bullets', 'title': 'Eine Sonate „für Anfänger“', 'bullets': [
              'Klaviersonate Nr. 16 C-Dur, KV 545, 1788 in Wien geschrieben',
              'Mozart trug sie ein als „Eine kleine klavier Sonate für anfänger“',
              'Spitzname „Sonata facile“ – die leichte Sonate',
              'Leicht zu lesen – aber schwer, sie vollkommen zu spielen']},
          {'kind': 'listen', 'title': 'Die Sonatenform Schritt für Schritt', 'work': 'Sonate C-Dur, KV 545 – erster Satz', 'points': [
              'Exposition: ein heiteres erstes Thema in C-Dur, Tonleiterläufe, ein zweites Thema in G-Dur',
              'Durchführung: Die Themen wandern durch andere Tonarten',
              'Reprise: Das erste Thema kehrt zurück – überraschend in F-Dur',
              'Alles ist ausgewogen: zwei Takte Frage, zwei Takte Antwort']},
          {'kind': 'bullets', 'title': 'Probier es selbst', 'bullets': [
              'Öffne die Noten in der Bibliothek und finde das zweite Thema',
              'Klavierspieler: Der erste Satz ist ein Klassiker für die Mittelstufe – frag deine Lehrkraft',
              'Achte auf die KV-Nummer: Ludwig von Köchel verzeichnete Mozarts Werke 1862 – „KV“ steht für Köchel-Verzeichnis']},
        ],
        'library': [('cmuygwa2w028y4kkteja74k7w', 'Sonata facile, KV 545 – Noten des ersten Satzes'), ('cmuygwa2d02864kktojtpwodb', 'Rondo alla turca aus KV 331 – Noten')],
      },
      {
        'title': 'Hören: Sinfonie Nr. 40', 'type': 'AUDIO', 'minutes': 6, 'libraryAudio': [SYMPHONY_40, 0],
        'description': "Im Sommer 1788 schrieb Mozart seine letzten drei Sinfonien in etwa sechs Wochen. Die Nr. 40 in g-Moll ist eine von nur zwei Sinfonien, die er in Moll schrieb – unruhig, drängend und unvergesslich.\n\nHier hörst du den ersten Satz, Molto allegro (Musopen, gemeinfrei).\n\nAchte auf:\n1. Das berühmte Thema beginnt leise in den Violinen über einer nervösen Begleitung der Bratschen\n2. Eine seufzende Zwei-Ton-Figur, die immer wiederkehrt\n3. Die Musik kommt kaum zur Ruhe – selbst das sanfte zweite Thema wirkt unruhig\n\nAlle vier Sätze findest du in der Bibliothek.",
        'library': [(SYMPHONY_40, 'Sinfonie Nr. 40 g-Moll – alle vier Sätze')],
      },
      {
        'title': 'Rückblick Woche 2 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung von Mozarts Jugend, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 2 auf einen Blick', 'bullets': [
              '1769–1773: drei Italienreisen',
              'Rom: Er schrieb Allegris „Miserere“ aus dem Gedächtnis auf',
              'Salzburg: Hofmusiker unter Erzbischof Colloredo',
              '1781: Bruch mit dem Erzbischof – ein freies Leben in Wien',
              'Sonatenform: Exposition, Durchführung, Reprise']},
        ],
        'quiz': [
          ('Was schrieb Mozart in Rom aus dem Gedächtnis auf?', ['Eine Fuge von Bach', 'Allegris „Miserere“', 'Eine Oper von Gluck', 'Eine päpstliche Hymne'], 1),
          ('Wo starb Mozarts Mutter 1778?', ['Salzburg', 'Wien', 'Paris', 'Mannheim'], 2),
          ('Was geschah 1781 in Wien?', ['Mozart wurde Hofkomponist', 'Er brach mit dem Erzbischof von Salzburg', 'Er traf Beethoven', 'Er heiratete Nannerls Freundin'], 1),
          ('Wofür steht „KV“ bei Mozarts Werken?', ['Köchel-Verzeichnis', 'Klavierversion', 'Konzertvariante', 'Kapellmeister-Verzeichnis'], 0),
          ('In welcher Tonart steht die Sinfonie Nr. 40?', ['C-Dur', 'g-Moll', 'D-Dur', 'Es-Dur'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 3 – Wien: Figaro und Don Giovanni (1781–1788)',
    'lessons': [
      {
        'title': 'Ein freier Star in Wien', 'type': 'SLIDES', 'minutes': 15,
        'description': "Mozart war einer der ersten großen Komponisten, die ohne feste Anstellung lebten – vom Unterrichten, Konzertieren, Veröffentlichen und vom Opernschreiben.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 3', 'title': 'Wien', 'subtitle': '1781 – 1788', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Ein neues Leben', 'bullets': [
              '1782: Er heiratet Constanze Weber – gegen den Willen seines Vaters',
              '1782: Seine deutsche Oper „Die Entführung aus dem Serail“ wird ein Erfolg',
              'Er gibt Subskriptionskonzerte und spielt seine eigenen Klavierkonzerte',
              'Joseph Haydn zu Leopold: „Ihr Sohn ist der größte Componist, den ich von Person und dem Nahmen nach kenne“']},
          {'kind': 'timeline', 'title': 'Die großen Opern', 'rows': [
              ('1786', '„Die Hochzeit des Figaro“ – Libretto von Lorenzo Da Ponte, Wien'),
              ('1787', '„Don Giovanni“ – Uraufführung in Prag, das Mozart verehrte'),
              ('1790', '„Così fan tutte“ – die dritte Da-Ponte-Oper'),
              ('1791', '„Die Zauberflöte“ – ein deutsches Singspiel für ein Vorstadttheater')]},
          {'kind': 'bullets', 'title': 'Warum der Figaro gewagt war', 'bullets': [
              'Nach einem Theaterstück von Beaumarchais, das in Wien verboten war, weil es den Adel verspottete',
              'Die Diener sind klüger als ihr Herr, der Graf',
              'Mozart gibt jeder Figur eine eigene Stimme – selbst in Ensembles, in denen sechs Personen gleichzeitig singen',
              'Nächste Woche: Mozarts letzte Oper, „Die Zauberflöte“']},
        ],
        'library': [('cmuygtj2k00l54kkt8rbn0eup', 'Ouvertüre zu „Die Hochzeit des Figaro“ – Aufnahme')],
      },
      {
        'title': 'Video: die Königin der Nacht', 'type': 'YOUTUBE', 'minutes': 5, 'video': 'https://www.youtube.com/watch?v=YuBeBjqKSGQ',
        'description': "Eine der berühmtesten – und schwierigsten – Arien überhaupt: „Der Hölle Rache“ der Königin der Nacht aus der Zauberflöte (1791). Diana Damrau singt sie im Royal Opera House in London.\n\nAchte auf:\n1. Wut in jeder Note: Die Königin befiehlt ihrer Tochter, ihren Feind zu töten\n2. Die Koloraturen – blitzschnelle Läufe und Staccato-Töne\n3. Das hohe F (f³) – einer der höchsten Töne im gängigen Opernrepertoire\n\nMozart schrieb die Partie für seine Schwägerin Josepha Hofer, die außergewöhnliche Spitzentöne hatte.",
      },
      {
        'title': 'Hören: die Ouvertüre zur Zauberflöte', 'type': 'AUDIO', 'minutes': 7, 'libraryAudio': ['cmuygtj2j00l44kktgboi8jvw', 0],
        'description': "Die Ouvertüre zur Zauberflöte beginnt mit drei feierlichen Akkorden – die Zahl Drei spielt in der ganzen Oper eine symbolische Rolle, die voller Anspielungen auf die Freimaurerei ist (Mozart war Freimaurer).\n\nAchte auf:\n1. Die drei majestätischen Akkorde am Anfang\n2. Ein schnelles, geschäftiges, fugenartiges Thema in den Violinen\n3. In der Mitte kehren die Akkorde zurück – dreimal drei\n\nEine historische Aufnahme derselben Ouvertüre von 1922 findest du ebenfalls in der Bibliothek.",
        'library': [('cmuygtj2j00l44kktgboi8jvw', 'Ouvertüre zur Zauberflöte'), ('cmv2j3by200t612if33bed6o6', 'Historische Aufnahme der Ouvertüre (1922)'), ('cmuygwa2y02944kktpiqlsu40', 'Eine Arie aus der Zauberflöte – Noten')],
      },
      {
        'title': 'Rückblick Woche 3 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der Wiener Jahre, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 3 auf einen Blick', 'bullets': [
              '1782: Heirat mit Constanze Weber; „Die Entführung aus dem Serail“',
              'Subskriptionskonzerte und Klavierkonzerte',
              'Opern mit Lorenzo Da Ponte: Figaro, Don Giovanni, Così fan tutte',
              'Prag liebte Mozart: Don Giovanni wurde dort 1787 uraufgeführt']},
        ],
        'quiz': [
          ('Wen heiratete Mozart 1782?', ['Aloysia Weber', 'Constanze Weber', 'Nannerl Mozart', 'Josepha Hofer'], 1),
          ('Wer schrieb die Libretti zu Figaro, Don Giovanni und Così fan tutte?', ['Schikaneder', 'Lorenzo Da Ponte', 'Goethe', 'Beaumarchais'], 1),
          ('In welcher Stadt wurde Don Giovanni uraufgeführt?', ['Wien', 'Salzburg', 'Prag', 'Mailand'], 2),
          ('Welcher berühmte Komponist nannte Mozart „den größten Componisten, den ich kenne“?', ['Bach', 'Haydn', 'Salieri', 'Gluck'], 1),
          ('Welche Figur singt „Der Hölle Rache“?', ['Pamina', 'Die Königin der Nacht', 'Papageno', 'Susanna'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 4 – Die Zauberflöte und das Requiem (1788–1791)',
    'lessons': [
      {
        'title': 'Das letzte Jahr', 'type': 'SLIDES', 'minutes': 15,
        'description': "1791 war eines der produktivsten Jahre in Mozarts Leben – und sein letztes.",
        'slides': [
          {'kind': 'bullets', 'title': 'Geldsorgen', 'bullets': [
              'Ab 1788 führte Österreich Krieg gegen das Osmanische Reich – weniger Konzerte, weniger Geld',
              'Mozart lieh sich Geld bei Freunden; seine Briefe zeigen echte Sorgen',
              'Trotzdem komponierte er in erstaunlichem Tempo weiter']},
          {'kind': 'timeline', 'title': '1791', 'rows': [
              ('Januar', 'Sein letztes Klavierkonzert, Nr. 27 B-Dur'),
              ('September', '„La clemenza di Tito“ für eine Krönung in Prag'),
              ('30. September', 'Premiere der „Zauberflöte“ in Wien – ein großer Erfolg'),
              ('Oktober', 'Klarinettenkonzert für seinen Freund Anton Stadler'),
              ('5. Dezember', 'Mozart stirbt mit 35 Jahren; das Requiem bleibt unvollendet')]},
          {'kind': 'bullets', 'title': 'Das geheimnisvolle Requiem', 'bullets': [
              '1791 gab ein Unbekannter anonym eine Totenmesse in Auftrag',
              'Der Auftraggeber war Graf Walsegg, der sie als eigenes Werk ausgeben wollte',
              'Mozart starb vor der Vollendung; sein Schüler Franz Xaver Süßmayr stellte es fertig',
              'Legenden von Gift und Rivalität mit Salieri sind genau das – Legenden']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              '1791: Die Zauberflöte, das Klarinettenkonzert, das letzte Klavierkonzert',
              'Mozart starb am 5. Dezember 1791 mit 35 Jahren',
              'Das Requiem wurde von Süßmayr vollendet']},
        ],
      },
      {
        'title': 'Video: das Requiem', 'type': 'YOUTUBE', 'minutes': 55, 'video': 'https://www.youtube.com/watch?v=Dp2SJN4UiE4',
        'description': "Das Orchestre national de France und der Chœur de Radio France unter James Gaffigan führen Mozarts Requiem d-Moll, KV 626 auf.\n\nDu musst nicht alles auf einmal ansehen. Beginne mit:\n1. Dem Introitus: ein langsamer, dunkler Beginn mit Bassetthörnern und Fagotten\n2. Dem „Dies irae“ – dem Tag des Zorns – ein plötzlicher Sturm\n3. Dem „Lacrimosa“: Mozart schrieb davon nur die ersten acht Takte, bevor er starb\n\nHör, wie Mozart, der Komponist so vieler heller Musik, in seinem letzten Werk klingt.",
      },
      {
        'title': 'Mozarts Vermächtnis', 'type': 'SLIDES', 'minutes': 12,
        'description': "Warum spielen wir Mozart noch mehr als 230 Jahre später?",
        'slides': [
          {'kind': 'bullets', 'title': 'Was Mozart uns geschenkt hat', 'bullets': [
              'Opern mit echten Menschen auf der Bühne – komisch, grausam, zärtlich, alles zugleich',
              'Das Klavierkonzert als Dialog zwischen Solist und Orchester',
              'Vollkommenes Gleichgewicht von Form und Gefühl',
              'Über 600 Werke, verzeichnet von Köchel: KV 1 bis KV 626 (das Requiem)']},
          {'kind': 'bullets', 'title': 'Mozart heute', 'bullets': [
              'Die Zauberflöte und der Figaro gehören weltweit zu den meistgespielten Opern',
              'Beethoven kam 1787 nach Wien, in der Hoffnung, bei ihm zu studieren',
              'Salzburg feiert ihn mit den Festspielen und dem Mozarteum',
              'Generationen von Pianisten beginnen mit seinen Sonaten']},
          {'kind': 'summary', 'title': 'Wie es weitergeht', 'bullets': [
              'Entdecke Mozarts Noten und Aufnahmen in der mymusic.coach-Bibliothek',
              'Weiter mit „Beethoven: Leben und Werk“ – dem Komponisten, der nach Wien kam, um ihn zu treffen',
              'Klavierspieler: Frag deine Lehrkraft nach der Sonata facile, KV 545']},
        ],
        'library': [('cmuygtj2k00l74kktecmzg0qb', 'Streichquartett „Dissonanzen“, KV 465 – Haydn gewidmet'), ('cmuygwa2v028w4kkt5jd7ul9j', 'Das Lied „Abendempfindung“ – Noten')],
      },
      {
        'title': 'Abschluss: Rückblick und Quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Herzlichen Glückwunsch – du bist am Ende des Kurses angekommen! Ein letzter Rückblick und ein Abschlussquiz über alle vier Wochen.",
        'slides': [
          {'kind': 'timeline', 'title': 'Mozarts Leben auf einen Blick', 'rows': [
              ('1756', 'Geboren am 27. Januar in Salzburg'),
              ('1763–1766', 'Die große Europareise'),
              ('1769–1773', 'Drei Italienreisen'),
              ('1781', 'Lässt sich als freier Musiker in Wien nieder'),
              ('1786', 'Die Hochzeit des Figaro'),
              ('1791', 'Die Zauberflöte; gestorben am 5. Dezember')]},
        ],
        'quiz': [
          ('Wie alt war Mozart, als er starb?', ['35', '45', '56', '27'], 0),
          ('Wer vollendete Mozarts Requiem?', ['Salieri', 'Franz Xaver Süßmayr', 'Leopold Mozart', 'Haydn'], 1),
          ('Für wen schrieb Mozart sein Klarinettenkonzert?', ['Anton Stadler', 'Graf Walsegg', 'Kaiser Joseph II.', 'Lorenzo Da Ponte'], 0),
          ('Welche Oper hatte am 30. September 1791 in Wien Premiere?', ['Don Giovanni', 'Die Zauberflöte', 'Idomeneo', 'Die Hochzeit des Figaro'], 1),
          ('Wer gab das Requiem heimlich in Auftrag?', ['Graf Walsegg', 'Der Kaiser', 'Salieri', 'Constanze'], 0),
          ('Wofür steht die Köchel-Nummer KV 626?', ['Die Zauberflöte', 'Das Requiem', 'Sinfonie Nr. 40', 'Die Sonata facile'], 1),
        ],
      },
    ],
  },
]
