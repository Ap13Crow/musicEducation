# Johann Sebastian Bach - deutsche Fassung von bach.py.
COURSE = {
    'slug': 'bach-leben-und-werk-einfuehrung',
    'language': 'de',
    'translationOf': 'bach-life-and-music-introduction',
    'title': 'Johann Sebastian Bach: Leben und Werk – Eine erste Einführung',
    'shortSummary': 'Vier Wochen mit Johann Sebastian Bach: ein Waisenkind aus Eisenach, das zum großen Meister des Barock wurde – Orgel, Brandenburgische Konzerte, Goldberg-Variationen und Matthäus-Passion.',
    'description': (
        "Johann Sebastian Bach (1685–1750) hat Deutschland nie verlassen. Er war Organist, Hofmusiker und Kirchenmusikdirektor – "
        "und schrieb Musik, mit der Musikerinnen und Musiker auf der ganzen Welt bis heute täglich arbeiten. Von Mozart bis zu den Beatles haben Komponisten von ihm gelernt.\n\n"
        "In vier Wochen folgst du seinem Leben Schritt für Schritt:\n"
        "- Woche 1 – Eine Musikerfamilie: Eisenach, Ohrdruf, Lüneburg (1685–1703)\n"
        "- Woche 2 – Der junge Organist: Arnstadt, Mühlhausen, Weimar (1703–1717)\n"
        "- Woche 3 – Köthen: Brandenburgische Konzerte und das Wohltemperierte Klavier (1717–1723)\n"
        "- Woche 4 – Leipzig: Kantaten, Passionen und die Goldberg-Variationen (1723–1750)\n\n"
        "Jede Woche verbindet illustrierte Folien, Videos der Nederlandse Bachvereniging, Aufnahmen und Noten aus der mymusic.coach-Bibliothek "
        "und ein kurzes Quiz. Vorkenntnisse sind nicht nötig. Plane etwa 1–2 Stunden pro Woche ein."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin', 'Cello'],
    'musicStyles': ['Baroque'],
    'cover': {'image': 'bach_portrait', 'title': 'Bach', 'subtitle': 'Leben und Werk – Eine erste Einführung', 'tag': '4-Wochen-Kurs'},
}
FOOTER = 'Johann Sebastian Bach: Leben und Werk'
PORTRAIT = {'image': 'bach_portrait', 'credit': 'Porträt von Elias Gottlob Haußmann, 1748 (gemeinfrei)'}
GOLDBERG = 'cmuygtizf00jj4kktc8xi94bw'

WEEKS = [
  {
    'title': 'Woche 1 – Eine Musikerfamilie (1685–1703)',
    'lessons': [
      {
        'title': 'Willkommen: Johann Sebastian Bach', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Willkommen im Kurs! Lerne den Menschen hinter der Perücke und dem strengen Porträt kennen – und sieh, wie die nächsten vier Wochen ablaufen.\n\nTipp: Alle Musik, die im Kurs vorkommt, ist in den Lektionen verlinkt. Öffne sie in der Bibliothek, lies die Noten mit und sammle zusätzliche XP, wenn du bis zum Ende liest oder hörst.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 1', 'title': 'Johann Sebastian Bach', 'subtitle': 'Eine erste Einführung in sein Leben und seine Musik', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Warum Bach?', 'bullets': [
              'Geboren 1685 in Eisenach – gestorben 1750 in Leipzig',
              'Organist, Hofmusiker und Kirchenmusikdirektor – nie Opernkomponist',
              'Über 1.000 Werke sind erhalten: Orgel- und Klaviermusik, Konzerte, Kantaten, Passionen',
              'Der größte Meister des Kontrapunkts: mehrere Melodien, kunstvoll miteinander verflochten',
              'Mozart, Beethoven, Chopin und Mendelssohn haben seine Musik studiert']},
          {'kind': 'timeline', 'title': 'Deine vier Wochen', 'rows': [
              ('Woche 1', 'Eine Musikerfamilie (1685–1703)'),
              ('Woche 2', 'Der junge Organist (1703–1717)'),
              ('Woche 3', 'Köthen: Konzerte und das Wohltemperierte Klavier'),
              ('Woche 4', 'Leipzig: Kantaten, Passionen, Goldberg-Variationen')]},
          {'kind': 'bullets', 'title': 'Was heißt „Barock“?', 'bullets': [
              'Die Musikepoche von etwa 1600 bis 1750 – Bachs Tod markiert ihr Ende',
              'Eine durchgehende Basslinie (Generalbass, Basso continuo) trägt die Musik',
              'Lange, fließende Melodien und kräftige, gleichmäßige Rhythmen',
              'Kontraste: laut und leise, Solist und Orchester, ein Instrument gegen viele']},
          {'kind': 'quote', 'quote': 'Und soll wie aller Music, also auch des General Basses Finis und End Uhrsache anders nicht, als nur zu Gottes Ehre und Recreation des Gemüths seyn.', 'by': 'Bach zugeschrieben, in einer von Schülern abgeschriebenen Generalbasslehre (1738)'},
        ],
      },
      {
        'title': 'Ein Waisenkind in einer Musikerfamilie', 'type': 'SLIDES', 'minutes': 15,
        'description': "Bach stammte aus einer Familie, in der fast alle Musiker waren. Diese Folien erzählen von seiner Kindheit – und von dem Bruder, der ihn unterrichtete, nachdem er beide Eltern verloren hatte.",
        'slides': [
          {'kind': 'bullets', 'title': 'Eisenach, März 1685', 'bullets': [
              'Geboren am 21. März 1685 in Eisenach in Thüringen, als jüngstes von acht Kindern',
              'Sein Vater Johann Ambrosius war Stadtmusikus – Geiger und Trompeter',
              'Über sieben Generationen brachte die Familie Bach mehr als 50 Berufsmusiker hervor',
              'In manchen thüringischen Städten bedeutete „ein Bach“ einfach „ein Musiker“']},
          {'kind': 'timeline', 'title': 'Eine harte Kindheit', 'rows': [
              ('1694', 'Seine Mutter Maria Elisabeth stirbt – Johann Sebastian ist neun'),
              ('1695', 'Weniger als ein Jahr später stirbt sein Vater'),
              ('1695', 'Er zieht nach Ohrdruf zu seinem ältesten Bruder Johann Christoph, einem Organisten'),
              ('1700', 'Mit 15 wandert er nach Lüneburg und singt im Chor der Michaelisschule'),
              ('1703', 'Erste Stelle: Geiger am Weimarer Hof, dann Organist in Arnstadt')]},
          {'kind': 'bullets', 'title': 'Lernen durch Abschreiben', 'bullets': [
              'Sein Bruder unterrichtete ihn auf dem Tasteninstrument',
              'Eine berühmte Geschichte: Der junge Sebastian schrieb ein verschlossenes Notenbuch heimlich bei Mondlicht ab – monatelang',
              'Die Musik anderer Komponisten abzuschreiben, blieb sein Leben lang seine Art zu lernen',
              'In Lüneburg hörte er den großen Organisten Georg Böhm und die französische Musik am nahen Hof in Celle']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Geboren am 21. März 1685 in Eisenach, in eine Musikerfamilie',
              'Mit zehn Jahren Waise, aufgewachsen bei seinem Bruder in Ohrdruf',
              'Ab 1700 Chorknabe in Lüneburg',
              'Er lernte, indem er die Musik anderer abschrieb und studierte']},
        ],
      },
      {
        'title': 'Video: Bachs Leben und seine Orte', 'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=qqmhYsF-JrE',
        'description': "Diese Dokumentation besucht die Orte, an denen Bach lebte und arbeitete, von Eisenach bis Leipzig. Das Video ist auf Englisch – schalte bei Bedarf die automatischen Untertitel von YouTube ein.\n\nAchte beim Anschauen auf Folgendes:\n1. In welchen Städten arbeitete Bach – und in welcher Reihenfolge?\n2. Welche Stellen hatte er an Höfen, welche an Kirchen?\n3. Wie groß war Bachs Familie?\n\nDu musst dir nicht alles merken – jeder Teil der Geschichte kommt in den nächsten Wochen wieder.",
      },
      {
        'title': 'Rückblick Woche 1 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Eine kurze Zusammenfassung von Woche 1, ein erstes Stück zum Entdecken und fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 1 auf einen Blick', 'bullets': [
              'Geboren am 21. März 1685 in Eisenach',
              'Eine Musikerfamilie über sieben Generationen',
              'Mit zehn Jahren Waise – aufgezogen von seinem Bruder Johann Christoph',
              'Chorknabe an der Michaelisschule in Lüneburg',
              '1703: seine ersten Stellen als Musiker']},
          {'kind': 'bullets', 'title': 'Diese Woche zum Entdecken', 'bullets': [
              'Das berühmte „Menuett in G“ aus dem Notenbüchlein für Anna Magdalena Bach – für viele das erste Klavierstück',
              'Wusstest du schon? Die Forschung hat gezeigt, dass es eigentlich von Christian Petzold stammt – Bach schrieb es für seine Familie ab',
              'Eine historische Aufnahme von 1924 findest du ebenfalls in der Bibliothek']},
        ],
        'library': [('cmuygw98a01th4kkt69w3wfcf', 'Das Menuett in G aus dem Notenbüchlein für Anna Magdalena – Noten'), ('cmv2j6zl4010w12ifusp63hw3', 'Historische Aufnahme des Menuetts in G (1924)')],
        'quiz': [
          ('In welcher Stadt wurde Johann Sebastian Bach geboren?', ['Leipzig', 'Eisenach', 'Weimar', 'Hamburg'], 1),
          ('Was geschah, als Bach neun und zehn Jahre alt war?', ['Er wurde Hofmusiker', 'Er verlor erst seine Mutter, dann seinen Vater', 'Er zog nach Italien', 'Er schrieb seine erste Kantate'], 1),
          ('Wer kümmerte sich in Ohrdruf um den jungen Bach?', ['Sein ältester Bruder, ein Organist', 'Der Herzog von Weimar', 'Sein Onkel in Leipzig', 'Eine Klosterschule'], 0),
          ('Wo sang Bach ab 1700 als Chorknabe?', ['Wien', 'Dresden', 'Lüneburg', 'Lübeck'], 2),
          ('Wie lernte Bach die Musik anderer Komponisten kennen?', ['Durch Aufnahmen', 'Vor allem, indem er sie von Hand abschrieb', 'An der Universität', 'Nur nach Gehör'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 2 – Der junge Organist (1703–1717)',
    'lessons': [
      {
        'title': 'Organist in Arnstadt, Mühlhausen und Weimar', 'type': 'SLIDES', 'minutes': 15,
        'description': "Berühmt wurde Bach zuerst als Organist – und als ziemlich eigensinniger junger Angestellter. So begann seine Laufbahn.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 2', 'title': 'Der junge Organist', 'subtitle': '1703 – 1717', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Arnstadt: zu Fuß nach Lübeck', 'bullets': [
              '1703 wurde Bach Organist an der Neuen Kirche in Arnstadt',
              '1705 wanderte er rund 400 km nach Lübeck, um den großen Organisten Dieterich Buxtehude zu hören',
              'Er bekam vier Wochen Urlaub – und blieb etwa vier Monate',
              'Zu Hause beschwerte sich das Konsistorium über seine „wunderlichen“ Harmonien, die die Gemeinde verwirrten']},
          {'kind': 'timeline', 'title': 'Stationen', 'rows': [
              ('1707', 'Organist in Mühlhausen; Heirat mit seiner Cousine Maria Barbara Bach'),
              ('1708', 'Hoforganist in Weimar'),
              ('1714', 'Beförderung zum Konzertmeister – nun komponiert er jeden Monat eine Kantate'),
              ('1717', 'Er will nach Köthen wechseln – der Herzog lässt ihn fast vier Wochen einsperren'),
              ('1717', '„In Ungnade“ entlassen – und Antritt der neuen Stelle in Köthen')]},
          {'kind': 'bullets', 'title': 'Der König der Orgel', 'bullets': [
              'Die meisten großen Orgelwerke Bachs stammen aus diesen Jahren',
              'Er konnte eine neue Orgel in wenigen Minuten prüfen – und wurde sein Leben lang als Orgelgutachter gerufen',
              'Seine Improvisationen waren legendär: Er konnte aus dem Stegreif eine Fuge erfinden',
              '1717 endete ein geplanter Wettstreit in Dresden, bevor er begann – sein Rivale Louis Marchand reiste vorher ab']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Organist in Arnstadt, Mühlhausen und Weimar',
              '1705: die lange Wanderung zu Buxtehude nach Lübeck',
              'Weimar: große Orgelwerke und seine ersten Kantaten',
              'Er wollte Weimar so entschlossen verlassen, dass man ihn kurz einsperrte']},
        ],
      },
      {
        'title': 'Video: eine Toccata von Bach', 'type': 'YOUTUBE', 'minutes': 10, 'video': 'https://www.youtube.com/watch?v=WialMe-8zaU',
        'description': "Eine Toccata (vom italienischen „toccare“, berühren) ist ein Bravourstück, in dem der Spieler glänzen kann. Bart Jacobs spielt Bachs Toccata e-Moll, BWV 914, für die Nederlandse Bachvereniging.\n\nAchte auf:\n1. Den freien Beginn, der wie improvisiert klingt\n2. Abschnitte, die Tempo und Charakter wechseln – wie eine Reihe kurzer Szenen\n3. Die Fuge am Schluss: Eine kurze Melodie (das Thema) setzt in einer Stimme nach der anderen ein\n\nÖffne danach die berühmteste Toccata überhaupt, Toccata und Fuge d-Moll, BWV 565, in der Bibliothek und sieh dir ihre dramatischen ersten Takte an.",
        'library': [('cmuygw8yz01mh4kkthvxs2qic', 'Toccata und Fuge d-Moll, BWV 565 – Noten')],
      },
      {
        'title': 'Wie eine Fuge funktioniert', 'type': 'SLIDES', 'minutes': 12,
        'description': "Die Fuge war Bachs Lieblingsform. Wenn du die vier Grundideen kennst, kannst du fast jeder Fuge folgen.",
        'slides': [
          {'kind': 'bullets', 'title': 'Ein musikalisches Gespräch', 'bullets': [
              'Eine Fuge entsteht aus einer kurzen Melodie: dem Thema',
              'Eine Stimme stellt das Thema allein vor',
              'Eine zweite Stimme antwortet mit derselben Melodie, etwas höher oder tiefer',
              'Weitere Stimmen setzen nacheinander ein – alle selbstständig, alle gleich wichtig']},
          {'kind': 'listen', 'title': 'Einer Fuge folgen', 'work': 'Invention Nr. 1 C-Dur, BWV 772', 'points': [
              'Bachs zweistimmige Inventionen sind der perfekte erste Schritt: nur zwei Stimmen',
              'Die kurze Anfangsfigur der rechten Hand wird von der linken Hand beantwortet',
              'Die Figur kehrt immer wieder – umgekehrt, höher, tiefer',
              'Öffne die Noten in der Bibliothek und markiere jede Stelle, an der die Anfangsfigur erscheint']},
          {'kind': 'bullets', 'title': 'Warum das bis heute zählt', 'bullets': [
              'Kontrapunkt schult dich darin, mehrere Dinge gleichzeitig zu hören',
              'Bach schrieb die Inventionen, um „eine cantable Art im Spielen“ zu lehren – Singen auf dem Klavier',
              'Pianistinnen und Pianisten lernen sie bis heute – Beethoven, Chopin und viele andere übten täglich Bach']},
        ],
        'library': [('cmuygw92d01pd4kkthosmeill', 'Invention Nr. 1 C-Dur, BWV 772 – Noten')],
      },
      {
        'title': 'Rückblick Woche 2 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung von Bachs Jahren als Organist, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 2 auf einen Blick', 'bullets': [
              '1703: Organist in Arnstadt',
              '1705: zu Fuß nach Lübeck, um Buxtehude zu hören',
              '1707: Mühlhausen und Heirat mit Maria Barbara',
              '1708–1717: Hoforganist und Konzertmeister in Weimar',
              'Die Fuge: ein Thema, mehrere selbstständige Stimmen']},
        ],
        'quiz': [
          ('Welchen berühmten Organisten wollte Bach hören, als er rund 400 km wanderte?', ['Georg Friedrich Händel', 'Dieterich Buxtehude', 'Antonio Vivaldi', 'Johann Pachelbel'], 1),
          ('Was geschah, als Bach 1717 Weimar verlassen wollte?', ['Er bekam eine Gehaltserhöhung', 'Der Herzog ließ ihn fast vier Wochen einsperren', 'Er wurde nach Italien geschickt', 'Er musste eine hohe Strafe zahlen'], 1),
          ('Was ist das „Thema“ einer Fuge?', ['Der Titel des Stücks', 'Die kurze Hauptmelodie, die jede Stimme aufnimmt', 'Der Schlussakkord', 'Die Person, der das Stück gewidmet ist'], 1),
          ('Wen heiratete Bach 1707?', ['Anna Magdalena Wilcke', 'Seine Cousine Maria Barbara Bach', 'Eine Prinzessin aus Köthen', 'Niemanden – er heiratete nur einmal, 1721'], 1),
          ('Woher kommt das Wort „Toccata“?', ['Vom italienischen Wort für „berühren“', 'Von einer Stadt in Deutschland', 'Von einem französischen Tanz', 'Vom Namen eines Orgelbauers'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Woche 3 – Köthen: Konzerte und das Wohltemperierte Klavier (1717–1723)',
    'lessons': [
      {
        'title': 'Hofkapellmeister in Köthen', 'type': 'SLIDES', 'minutes': 15,
        'description': "Am Hof eines musikbegeisterten jungen Fürsten schrieb Bach einige der fröhlichsten Instrumentalwerke, die je komponiert wurden – und erlebte großes Leid.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 3', 'title': 'Köthen', 'subtitle': '1717 – 1723', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Ein Fürst, der die Musik liebte', 'bullets': [
              'Fürst Leopold von Anhalt-Köthen spielte Geige, Gambe und Cembalo',
              'Bach wurde sein Kapellmeister – Leiter eines hervorragenden Hoforchesters',
              'Die Hofkirche war reformiert (calvinistisch) und brauchte wenig Musik – also schrieb Bach vor allem für Instrumente',
              'Meisterwerke dieser Jahre: die Cellosuiten, die Sonaten und Partiten für Violine, die Brandenburgischen Konzerte']},
          {'kind': 'timeline', 'title': 'Freude und Leid', 'rows': [
              ('1720', 'Bei der Rückkehr von einer Reise mit dem Fürsten erfährt Bach, dass seine Frau Maria Barbara gestorben ist'),
              ('1721', 'Er schickt sechs Konzerte an den Markgrafen von Brandenburg – die „Brandenburgischen“ Konzerte'),
              ('1721', 'Heirat mit Anna Magdalena Wilcke, einer Hofsängerin'),
              ('1722', 'Er vollendet den ersten Teil des Wohltemperierten Klaviers'),
              ('1723', 'Umzug nach Leipzig als Thomaskantor')]},
          {'kind': 'bullets', 'title': 'Das Wohltemperierte Klavier', 'bullets': [
              '24 Präludien und Fugen – eines in jeder Dur- und Molltonart',
              '„Wohltemperiert“ meint eine Stimmung, in der alle Tonarten gut klingen',
              'Der zweite Teil folgte um 1742: noch einmal 24',
              'Pianisten nennen es das „Alte Testament“ der Klaviermusik']},
          {'kind': 'listen', 'title': 'Präludium Nr. 1 C-Dur', 'work': 'Wohltemperiertes Klavier I, BWV 846', 'points': [
              'Ein einziges Muster gebrochener Akkorde vom Anfang bis zum Ende',
              'Nur die Harmonie ändert sich – ein Akkord pro Takt',
              'Hör, wie sich vor dem Schluss über einem lang ausgehaltenen Basston die Spannung aufbaut',
              'Gounod schrieb später seine „Ave Maria“-Melodie genau über dieses Präludium']},
        ],
        'library': [('cmuygw94v01qi4kktwlxbfn8g', 'Präludium Nr. 1 C-Dur, BWV 846 – Noten'), ('cmuygw94p01qg4kktleg0qfhx', 'Die Fuge, die darauf folgt'), ('cmuygw8u401ko4kktl6eoo2ed', 'Die berühmte „Air“ aus BWV 1068 – Noten')],
      },
      {
        'title': 'Video: Brandenburgisches Konzert Nr. 3', 'type': 'YOUTUBE', 'minutes': 12, 'video': 'https://www.youtube.com/watch?v=qr0f6t2UbOo',
        'description': "1721 schickte Bach sechs schön abgeschriebene Konzerte an Christian Ludwig, Markgraf von Brandenburg. Der Markgraf ließ sie wohl nie aufführen – heute gehören sie zu den meistgespielten Barockwerken. Die Nederlandse Bachvereniging mit Shunske Sato spielt das dritte Konzert.\n\nAchte auf:\n1. Drei Violinen, drei Bratschen, drei Celli – ein Konzert für Dreiergruppen\n2. Die Spieler werfen sich kurze Motive zu wie einen Ball\n3. Der „langsame Satz“ besteht nur aus zwei Akkorden – die Musiker improvisieren eine Brücke zwischen den schnellen Sätzen\n\nWusstest du schon? Der erste Satz des Brandenburgischen Konzerts Nr. 2 reist auf der Voyager Golden Record (1977) durchs All.",
      },
      {
        'title': 'Bachs Familie', 'type': 'SLIDES', 'minutes': 10,
        'description': "Bach hatte zwanzig Kinder. Mehrere seiner Söhne wurden selbst berühmte Komponisten.",
        'slides': [
          {'kind': 'bullets', 'title': 'Zwanzig Kinder', 'bullets': [
              'Sieben Kinder mit Maria Barbara, dreizehn mit Anna Magdalena',
              'Nur zehn erreichten das Erwachsenenalter – die Kindersterblichkeit war sehr hoch',
              'Der Haushalt war eine Musikschule: Kinder, Schüler und Verwandte musizierten zusammen',
              'Für Anna Magdalena und die Kinder stellte er die „Notenbüchlein“ mit leichten Stücken zusammen']},
          {'kind': 'bullets', 'title': 'Musikalische Söhne', 'bullets': [
              'Wilhelm Friedemann (1710–1784) – Organist in Dresden und Halle',
              'Carl Philipp Emanuel (1714–1788) – Hofmusiker Friedrichs des Großen, dann in Hamburg; Haydn und Beethoven bewunderten ihn',
              'Johann Christian (1735–1782) – „der Londoner Bach“, der sich mit dem achtjährigen Mozart anfreundete',
              'Jahrzehntelang meinte man nach 1750 mit „Bach“ meist einen der Söhne, nicht den Vater']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Köthen: Brandenburgische Konzerte, Cellosuiten, Wohltemperiertes Klavier',
              '1720: Tod von Maria Barbara; 1721: Heirat mit Anna Magdalena',
              'Zwanzig Kinder – drei Söhne wurden berühmte Komponisten']},
        ],
      },
      {
        'title': 'Rückblick Woche 3 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der Köthener Jahre, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 3 auf einen Blick', 'bullets': [
              '1717–1723: Kapellmeister bei Fürst Leopold von Köthen',
              'Instrumentale Meisterwerke: Cellosuiten, Violinpartiten, Brandenburgische Konzerte',
              '1722: Wohltemperiertes Klavier, Teil 1 – 24 Präludien und Fugen',
              '1721: Heirat mit der Sängerin Anna Magdalena Wilcke']},
        ],
        'library': [('cmuygw8tt01k94kktr0aiwa4q', 'Eine Cellosuite zum Entdecken: das Prélude der Suite Nr. 6')],
        'quiz': [
          ('Warum schrieb Bach in Köthen vor allem Instrumentalmusik?', ['Er mochte keine Sänger', 'Die Hofkirche brauchte wenig Musik', 'Es gab keine Orgel in der Stadt', 'Der Fürst war taub'], 1),
          ('Wem sind die „Brandenburgischen“ Konzerte gewidmet?', ['Dem König von Preußen', 'Dem Markgrafen von Brandenburg', 'Fürst Leopold', 'Der Stadt Leipzig'], 1),
          ('Wie viele Präludien und Fugen enthält der erste Teil des Wohltemperierten Klaviers?', ['12', '24', '30', '48'], 1),
          ('Welcher Komponist schrieb ein „Ave Maria“ über Bachs Präludium C-Dur?', ['Schubert', 'Gounod', 'Verdi', 'Mozart'], 1),
          ('Welcher von Bachs Söhnen hieß „der Londoner Bach“?', ['Carl Philipp Emanuel', 'Wilhelm Friedemann', 'Johann Christian', 'Johann Christoph'], 2),
        ],
      },
    ],
  },
  {
    'title': 'Woche 4 – Leipzig: Kantaten, Passionen und die Goldberg-Variationen (1723–1750)',
    'lessons': [
      {
        'title': 'Thomaskantor', 'type': 'SLIDES', 'minutes': 15,
        'description': "In den letzten 27 Jahren seines Lebens war Bach für die Musik der Leipziger Hauptkirchen verantwortlich – eine riesige Arbeitslast, aus der einige seiner größten Werke hervorgingen.",
        'slides': [
          {'kind': 'image', 'title': 'Leipzig, 1723', 'text': 'Bach wurde Kantor der Thomasschule und Musikdirektor der Hauptkirchen der Stadt. Er unterrichtete die Schüler, probte mit den Chören und schrieb Musik für jeden Sonntag.', 'image': 'bach_leipzig', 'credit': 'Thomaskirche und Thomasschule, Leipzig, Kupferstich, 1735 (gemeinfrei)'},
          {'kind': 'bullets', 'title': 'Jede Woche eine Kantate', 'bullets': [
              'In seinen ersten Jahren schrieb er für fast jeden Sonn- und Feiertag eine neue Kantate',
              'Rund 200 seiner Kirchenkantaten sind erhalten',
              'Jede verbindet Chöre, Arien, Rezitative und einen Choral – ein Kirchenlied, das die Gemeinde kannte']},
          {'kind': 'timeline', 'title': 'Meisterwerke der Leipziger Jahre', 'rows': [
              ('1724', 'Johannes-Passion'),
              ('1727', 'Matthäus-Passion'),
              ('1734', 'Weihnachtsoratorium'),
              ('1741', 'Die Goldberg-Variationen erscheinen'),
              ('1747', 'Das Musikalische Opfer – über ein Thema König Friedrichs des Großen'),
              ('1749', 'Die h-Moll-Messe wird vollendet')]},
          {'kind': 'bullets', 'title': 'Die letzten Jahre', 'bullets': [
              '1747 besuchte er Friedrich den Großen in Potsdam und improvisierte über das Thema des Königs',
              'Sein Augenlicht ließ nach; zwei Operationen 1750 durch den reisenden Augenarzt John Taylor verliefen schlecht',
              'Bach starb am 28. Juli 1750 in Leipzig',
              'Sein letztes großes Projekt, Die Kunst der Fuge, blieb unvollendet']},
        ],
      },
      {
        'title': 'Hören: die Goldberg-Variationen', 'type': 'AUDIO', 'minutes': 5, 'libraryAudio': [GOLDBERG, 0],
        'description': "Die 1741 erschienenen Goldberg-Variationen bestehen aus einer Aria, 30 Variationen und noch einmal der Aria. Eine berühmte Geschichte – erzählt 1802 von Bachs erstem Biografen Forkel und wohl eher Legende als Tatsache – besagt, sie seien für den schlaflosen Grafen Keyserlingk und seinen jungen Cembalisten Johann Gottlieb Goldberg entstanden.\n\nHier hörst du die Aria, das sanfte Thema am Anfang (Aufnahme von Musopen, gemeinfrei).\n\nAchte auf:\n1. Eine langsame, verzierte Melodie – wie eine Sarabande, ein würdevoller Tanz\n2. Die Basslinie: Die Variationen bauen auf diesem Bass auf, nicht auf der Melodie\n3. Öffne danach die vollständige Aufnahme in der Bibliothek: Jede dritte Variation ist ein Kanon, in dem eine Stimme eine andere nachahmt\n\nAlle 32 Stücke und die Noten jeder Variation findest du in der Bibliothek.",
        'library': [(GOLDBERG, 'Die vollständigen Goldberg-Variationen – alle 32 Stücke'), ('cmuygw97m01sa4kktvp0yth9e', 'Die Aria – Noten'), ('cmuygw97r01si4kkt998of1zs', 'Variation 3: der erste Kanon – Noten')],
      },
      {
        'title': 'Bachs Vermächtnis', 'type': 'SLIDES', 'minutes': 12,
        'description': "Nach seinem Tod geriet Bach beim Publikum fast in Vergessenheit – bis ein Zwanzigjähriger namens Felix Mendelssohn ihn zurückholte.",
        'slides': [
          {'kind': 'bullets', 'title': 'Vergessen – und wiederentdeckt', 'bullets': [
              'Nach 1750 galt Bachs Stil als altmodisch – aber Musiker studierten weiter seine Klavierwerke',
              'Mozart und Beethoven schrieben seine Fugen ab und spielten sie',
              'Am 11. März 1829 dirigierte Felix Mendelssohn in Berlin die Matthäus-Passion – die erste Aufführung seit Bachs Tod',
              'Damit begann die „Bach-Renaissance“, die bis heute anhält']},
          {'kind': 'bullets', 'title': 'Bach heute', 'bullets': [
              'Seine Werke sind im Bach-Werke-Verzeichnis nummeriert: BWV 1 bis über 1.100',
              'Drei Stücke von Bach fliegen auf der Voyager Golden Record, inzwischen jenseits unseres Sonnensystems',
              'Jazzmusiker, Rockbands und Filmkomponisten greifen seine Ideen auf',
              'Wer ernsthaft Klavier, Orgel, Geige oder Cello spielt, spielt Bach']},
          {'kind': 'quote', 'quote': 'Nicht Bach – Meer sollte er heißen.', 'by': 'Beethovens Wortspiel über den „Bach“, der eigentlich ein Meer sei – von Zeitgenossen überliefert'},
          {'kind': 'summary', 'title': 'Wie es weitergeht', 'bullets': [
              'Entdecke Hunderte Bach-Noten in der mymusic.coach-Bibliothek',
              'Weiter mit „Felix Mendelssohn“ – dem Mann, der Bach zurückbrachte',
              'Klavierspieler: Frag deine Lehrkraft nach dem Menuett in G oder der Invention Nr. 1']},
        ],
      },
      {
        'title': 'Abschluss: Rückblick und Quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Herzlichen Glückwunsch – du bist am Ende des Kurses angekommen! Ein letzter Rückblick und ein Abschlussquiz über alle vier Wochen.",
        'slides': [
          {'kind': 'timeline', 'title': 'Bachs Leben auf einen Blick', 'rows': [
              ('1685', 'Geboren am 21. März in Eisenach'),
              ('1695', 'Waise – Umzug zu seinem Bruder nach Ohrdruf'),
              ('1703', 'Organist in Arnstadt'),
              ('1708', 'Hoforganist in Weimar'),
              ('1717', 'Kapellmeister in Köthen'),
              ('1723', 'Thomaskantor in Leipzig'),
              ('1750', 'Gestorben am 28. Juli in Leipzig')]},
        ],
        'quiz': [
          ('Welches Amt hatte Bach in Leipzig?', ['Operndirektor', 'Thomaskantor und städtischer Musikdirektor', 'Hoforganist des Königs', 'Professor an der Universität'], 1),
          ('Wie viele von Bachs Kirchenkantaten sind ungefähr erhalten?', ['20', '200', '600', '1.000'], 1),
          ('Wer dirigierte 1829 die berühmte Wiederaufführung der Matthäus-Passion?', ['Beethoven', 'Felix Mendelssohn', 'Mozart', 'Brahms'], 1),
          ('Wie sind die Goldberg-Variationen aufgebaut?', ['Vier Sätze', 'Eine Aria, 30 Variationen und noch einmal die Aria', '24 Präludien und Fugen', 'Sechs Konzerte'], 1),
          ('Welcher König gab Bach das Thema für das Musikalische Opfer?', ['Ludwig XIV.', 'Friedrich der Große', 'Georg II.', 'August der Starke'], 1),
          ('In welchem Jahr starb Bach?', ['1723', '1741', '1750', '1791'], 2),
        ],
      },
    ],
  },
]
