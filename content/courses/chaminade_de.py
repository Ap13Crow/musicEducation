# Cécile Chaminade - deutsche Fassung von chaminade.py.
COURSE = {
    'slug': 'chaminade-leben-und-werk-einfuehrung',
    'language': 'de',
    'translationOf': 'chaminade-life-and-music-introduction',
    'title': 'Cécile Chaminade: Leben und Werk – Eine erste Einführung',
    'shortSummary': 'Vier Wochen mit Cécile Chaminade: eine Pariser Pianistin und Komponistin, deren Musik sich hunderttausendfach verkaufte, die durch Amerika tourte und als erste Komponistin in die Ehrenlegion aufgenommen wurde.',
    'description': (
        "Cécile Chaminade (1857–1944) war eine der berühmtesten Komponistinnen ihrer Zeit: Ihre Klavierstücke und Lieder standen in jedem Haushalt, "
        "Hunderte „Chaminade Clubs“ trafen sich in Amerika, und sie spielte für Queen Victoria. Dann geriet sie fast in Vergessenheit.\n\n"
        "In vier Wochen folgst du ihrem Leben Schritt für Schritt:\n"
        "- Woche 1 – Eine Pariser Kindheit: „mein kleiner Mozart“ (1857–1880)\n"
        "- Woche 2 – Ballett, Konzertstück und Konzertetüden (1880–1892)\n"
        "- Woche 3 – Lieder, England und das Concertino (1892–1907)\n"
        "- Woche 4 – Amerika, die Ehrenlegion und die Wiederentdeckung (1908–1944)\n\n"
        "Jede Woche verbindet illustrierte Folien, Videos (France Musique, Emmanuel Pahud mit dem Münchner Rundfunkorchester), Schellackplatten der 1920er-Jahre "
        "mit Fritz Kreisler aus der mymusic.coach-Bibliothek, interaktive Noten ihrer Lieder und ein kurzes Quiz. Vorkenntnisse sind nicht nötig. "
        "Plane etwa 1–2 Stunden pro Woche ein."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Flute', 'Voice'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'chaminade_portrait', 'title': 'Cécile Chaminade', 'subtitle': 'Leben und Werk – Eine erste Einführung', 'tag': '4-Wochen-Kurs'},
}
FOOTER = 'Cécile Chaminade: Leben und Werk'
PORTRAIT = {'image': 'chaminade_portrait', 'credit': 'Cécile Chaminade, Fotografie, 1913 (gemeinfrei)'}
YOUNG = {'image': 'chaminade_young', 'credit': 'Fotografie von H. S. Mendelssohn, London, 1890 (gemeinfrei)'}
SCARF = 'cmv2j70x6011012ifhfctd2w7'
FLATTERER = 'cmv2j7098010y12ifgv210i3o'
SERENADE = 'cmv2ixxlm00i212if0ykwfcf1'
PIERRETTE = 'cmv2ivpas00do12ifn83m4zsw'

WEEKS = [
  {
    'title': 'Woche 1 – Eine Pariser Kindheit: „mein kleiner Mozart“ (1857–1880)',
    'lessons': [
      {
        'title': 'Willkommen: Cécile Chaminade', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Willkommen im Kurs! Lerne Cécile Chaminade kennen – Pianistin, Komponistin und internationale Berühmtheit – und sieh, wie die nächsten vier Wochen ablaufen.\n\nTipp: Ihre Lieder findest du in der mymusic.coach-Bibliothek als interaktive Noten, ihre Klaviermusik auf Schellackplatten der 1920er-Jahre – markiere deine Favoriten und sammle zusätzliche XP, wenn du bis zum Ende liest oder hörst.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 1', 'title': 'Cécile Chaminade', 'subtitle': 'Eine erste Einführung in ihr Leben und ihre Musik', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Warum Chaminade?', 'bullets': [
              'Geboren 1857 in Paris – gestorben 1944 in Monte Carlo',
              'Rund 400 Werke: Klavierstücke, über 100 Lieder, ein Ballett, eine Oper, ein Flötenconcertino',
              'Eine der meistverkauften Komponistinnen und Komponisten ihrer Zeit, in Europa und Amerika',
              'Eine Konzertpianistin, die über 30 Jahre mit ihrer eigenen Musik auf Tournee ging',
              '1913 als erste Komponistin zum Ritter der Ehrenlegion ernannt']},
          {'kind': 'timeline', 'title': 'Deine vier Wochen', 'rows': [
              ('Woche 1', 'Eine Pariser Kindheit: „mein kleiner Mozart“'),
              ('Woche 2', 'Ballett, Konzertstück und Konzertetüden'),
              ('Woche 3', 'Lieder, England und das Concertino'),
              ('Woche 4', 'Amerika, die Ehrenlegion und die Wiederentdeckung')]},
          {'kind': 'bullets', 'title': 'Musik im Wohnzimmer', 'bullets': [
              'Um 1900 stand in fast jedem bürgerlichen Haushalt ein Klavier',
              'Verlage verkauften riesige Mengen kurzer Klavierstücke und Lieder für Laien',
              'Chaminade schrieb genau diese Musik – elegant, melodiös, nicht zu schwer',
              'Sie machte sie berühmt und wohlhabend – und brachte ihr später den abschätzigen Ruf einer „Salonkomponistin“ ein']},
        ],
      },
      {
        'title': 'Ein begabtes Mädchen in Paris', 'type': 'SLIDES', 'minutes': 15,
        'description': "Ihr Vater wollte nicht, dass sie am Conservatoire studierte. Ein berühmter Nachbar erkannte ihr Talent.",
        'slides': [
          {'kind': 'bullets', 'title': 'Paris, 8. August 1857', 'bullets': [
              'Cécile Louise Stéphanie Chaminade wurde in eine wohlhabende Pariser Familie geboren',
              'Ihre Mutter, Pianistin und Sängerin, gab ihr den ersten Unterricht',
              'Schon mit etwa acht Jahren komponierte sie kleine Stücke – darunter Kirchenmusik',
              'Ihr Vater arbeitete für eine Versicherungsgesellschaft und spielte als Amateur Geige']},
          {'kind': 'bullets', 'title': '„Mein kleiner Mozart“', 'bullets': [
              'Die Familie verbrachte die Sommer in Le Vésinet bei Paris, wo Georges Bizet – der Komponist von „Carmen“ – ein Nachbar war',
              'Bizet war von ihrer Musik entzückt und soll sie „mon petit Mozart“ genannt haben',
              'Félix Le Couppey, Professor am Conservatoire, riet, sie solle dort studieren',
              'Ihr Vater lehnte ab: Das Conservatoire sei kein passender Ort für ein Mädchen ihres Standes']},
          {'kind': 'bullets', 'title': 'Stattdessen Privatunterricht', 'bullets': [
              'Sie wurde privat von Lehrern des Conservatoire unterrichtet',
              'Klavier bei Félix Le Couppey, Harmonielehre und Kontrapunkt bei Augustin Savard',
              'Komposition bei Benjamin Godard, einem erfolgreichen Komponisten der Zeit',
              'Eine hervorragende Ausbildung – aber ohne die Diplome und Preise, die Männern Türen öffneten']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              'Geboren am 8. August 1857 in Paris',
              'Erster Unterricht bei der Mutter; Komponieren ab etwa acht Jahren',
              'Bizets „kleiner Mozart“ – aber kein Conservatoire, auf Wunsch des Vaters',
              'Privatunterricht bei Le Couppey, Savard und Godard']},
        ],
      },
      {
        'title': 'Video: Great Composers – Cécile Chaminade', 'type': 'YOUTUBE', 'minutes': 6, 'video': 'https://www.youtube.com/watch?v=n5K8UBhShV4',
        'description': "Eine kurze Einführung aus der Reihe „Classical Nerd“: wer Chaminade war, wie berühmt sie wurde – und warum sie vergessen wurde. Das Video ist auf Englisch – schalte bei Bedarf die automatischen Untertitel von YouTube ein.\n\nAchte beim Anschauen auf Folgendes:\n1. Was waren die „Chaminade Clubs“?\n2. Warum taten Kritiker ihre Musik später ab?\n3. Welches ihrer Stücke spielt bis heute fast jede Flötistin und jeder Flötist?\n\nAlles kommt in den nächsten Wochen wieder.",
      },
      {
        'title': 'Ein erstes Konzert – und Quiz zu Woche 1', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "Mit Anfang zwanzig trat Chaminade öffentlich auf. Eine kurze Zusammenfassung und fünf Fragen.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 1', 'title': 'Auf der Bühne', 'subtitle': 'Eine junge Pianistin und Komponistin', **YOUNG},
          {'kind': 'bullets', 'title': 'In die Konzertwelt', 'bullets': [
              'Ab Ende der 1870er-Jahre spielte sie ihre eigene Musik in den Konzerten und Salons von Paris',
              'Ihre Musik wurde bald von Pariser Verlagen gedruckt und auch von anderen Pianisten gespielt',
              '1880 wurde ihr Klaviertrio Nr. 1 von der angesehenen Société nationale de musique aufgeführt',
              'Sie war stets ihre beste Interpretin – Pianistin und Komponistin in einer Person']},
          {'kind': 'summary', 'title': 'Woche 1 auf einen Blick', 'bullets': [
              'Eine Pariser Kindheit in einer musikalischen Familie',
              'Von Bizet ermutigt, vom Vater gebremst',
              'Privatunterricht bei führenden Lehrern',
              'Ab Ende der 1870er-Jahre eine Pianistin, die ihre eigene Musik spielt']},
        ],
        'quiz': [
          ('In welcher Stadt wurde Cécile Chaminade geboren?', ['Lyon', 'Paris', 'Marseille', 'Brüssel'], 1),
          ('Welcher Komponist soll sie „mein kleiner Mozart“ genannt haben?', ['Gounod', 'Georges Bizet', 'Massenet', 'Debussy'], 1),
          ('Warum studierte sie nicht am Pariser Conservatoire?', ['Sie fiel durch die Prüfung', 'Ihr Vater lehnte ab', 'Frauen waren gesetzlich ausgeschlossen', 'Sie lebte im Ausland'], 1),
          ('Wer unterrichtete sie in Komposition?', ['Benjamin Godard', 'César Franck', 'Gabriel Fauré', 'Camille Saint-Saëns'], 0),
          ('Mit welcher Art von Musik wurde Chaminade berühmt?', ['Mit Sinfonien', 'Mit kurzen Klavierstücken und Liedern', 'Mit Messen', 'Mit Opern'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 2 – Ballett, Konzertstück und Konzertetüden (1880–1892)',
    'lessons': [
      {
        'title': 'Große Werke: Bühne und Orchester', 'type': 'SLIDES', 'minutes': 15,
        'description': "In den 1880er-Jahren schrieb Chaminade ihre größten Werke – für die Bühne und für Orchester.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 2', 'title': 'Ballett, Konzertstück und Etüden', 'subtitle': '1880 – 1892', **YOUNG},
          {'kind': 'timeline', 'title': 'Große Pläne', 'rows': [
              ('1882', '„La Sévillane“, eine komische Oper, privat im Haus ihrer Familie in Paris aufgeführt'),
              ('1886', 'Sechs Konzertetüden, op. 35 – darunter „Automne“ (Herbst)'),
              ('1888', '„Callirhoë“, ein Ballett, uraufgeführt in Marseille'),
              ('1888', 'Konzertstück für Klavier und Orchester; „Les Amazones“, eine dramatische Sinfonie mit Chor')]},
          {'kind': 'bullets', 'title': '„Keine Frau, die komponiert“', 'bullets': [
              'Manche Kritiker lobten ihre großen Werke; andere fanden sie „zu männlich“ für eine Frau',
              'Der Komponist Ambroise Thomas soll gesagt haben: „Das ist keine Frau, die komponiert, sondern ein Komponist, der eine Frau ist“',
              'Große Werke wurden selten aufgeführt – besonders bei einer Frau ohne offizielle Ämter',
              'Kurze Stücke und Lieder dagegen verkauften sich – und sie schrieb immer mehr davon']},
          {'kind': 'summary', 'title': 'Merke dir', 'bullets': [
              '1882: „La Sévillane“ (Oper)',
              '1888: „Callirhoë“ (Ballett), Konzertstück, „Les Amazones“',
              'Große Werke wurden gelobt – aber selten gespielt']},
        ],
      },
      {
        'title': 'Hören: der Schleiertanz', 'type': 'AUDIO', 'minutes': 5, 'libraryAudio': [SCARF, 0],
        'description': "Das Ballett „Callirhoë“ (1888) erzählt eine Geschichte aus dem alten Griechenland. Eine Nummer daraus, der „Pas des écharpes“ (Schleiertanz), wurde zu einem der meistverkauften Klavierstücke seiner Zeit – gedruckt in unzähligen Ausgaben und Bearbeitungen.\n\nHier spielt ihn der Pianist Hans Barth auf einer Platte von 1924 (Library of Congress National Jukebox).\n\nAchte auf:\n1. Eine leichte, wiegende Melodie – Tänzerinnen mit langen Schleiern\n2. Zarte, funkelnde Verzierungen in der rechten Hand\n3. Einen kurzen, lyrischeren Mittelteil\n\nEbenfalls in der Bibliothek: „La Lisonjera“ (Die Schmeichlerin), ein weiteres Lieblingsstück, gespielt von Hans Barth.",
        'library': [(SCARF, 'Schleiertanz (Callirhoë) – Hans Barth, Klavier, 1924'), (FLATTERER, 'Die Schmeichlerin (La Lisonjera) – Hans Barth, Klavier, 1924')],
      },
      {
        'title': 'Video: „Automne“', 'type': 'YOUTUBE', 'minutes': 7, 'video': 'https://www.youtube.com/watch?v=n2-_ZRi7HNg',
        'description': "„Automne“ (Herbst) ist die zweite ihrer Sechs Konzertetüden, op. 35 (1886), und ihr berühmtestes Klavierstück. Die britisch-kanadische Pianistin Valerie Tryon spielt es hier.\n\nEine Etüde ist eine Studie – ein Stück, das eine bestimmte Fertigkeit übt. Chaminades Konzertetüden sind zugleich echte Konzertmusik, wie die von Chopin.\n\nAchte auf:\n1. Eine ruhige, melancholische Melodie über fließenden Akkorden – Herbstlaub\n2. Einen stürmischen, virtuosen Mittelteil – ein Herbststurm\n3. Die Rückkehr der ruhigen Melodie am Schluss\n\nKlavierspieler: Frag deine Lehrkraft, ob „Automne“ zu dir passen könnte – ein Lieblingsstück fortgeschrittener Schülerinnen und Schüler.",
      },
      {
        'title': 'Rückblick Woche 2 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der 1880er-Jahre, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 2 auf einen Blick', 'bullets': [
              'Eine Oper, ein Ballett, ein Konzertstück und eine dramatische Sinfonie',
              'Der Schleiertanz aus „Callirhoë“ wird ein Hit',
              '„Automne“: ihre berühmteste Konzertetüde',
              'Lob für ihr Talent – aber wenige Aufführungen ihrer großen Werke']},
        ],
        'quiz': [
          ('Was ist „Callirhoë“?', ['Eine Oper', 'Ein Ballett', 'Ein Lied', 'Ein Flötenstück'], 1),
          ('Welches Erfolgsstück stammt aus „Callirhoë“?', ['Automne', 'Der Schleiertanz', 'La Lisonjera', 'Pierrette'], 1),
          ('Was bedeutet „Automne“?', ['Frühling', 'Herbst', 'Winter', 'Nacht'], 1),
          ('Was ist eine Etüde?', ['Ein Tanz', 'Eine Studie für eine bestimmte Fertigkeit', 'Ein Lied ohne Worte', 'Eine Ouvertüre'], 1),
          ('Welcher Komponist soll sie „einen Komponisten, der eine Frau ist“ genannt haben?', ['Ambroise Thomas', 'Bizet', 'Godard', 'Debussy'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Woche 3 – Lieder, England und das Concertino (1892–1907)',
    'lessons': [
      {
        'title': 'Mélodies: Chaminades Lieder', 'type': 'SLIDES', 'minutes': 15,
        'description': "Chaminade schrieb mehr als 100 Lieder – französische „mélodies“. Sie verkauften sich in riesigen Auflagen. Lies drei davon in der Bibliothek.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 3', 'title': 'Lieder, England und das Concertino', 'subtitle': '1892 – 1907', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Eine Bestseller-Liedkomponistin', 'bullets': [
              'Ihre Lieder waren für Laien zu Hause geschrieben – und wurden auch von berühmten Profis gesungen',
              'Klare Melodien, reiche Klavierstimmen, Gedichte über Liebe, Natur und Jahreszeiten',
              '„L’anneau d’argent“ (Der silberne Ring, 1891) war einer ihrer größten Erfolge',
              'Mehr als 25 ihrer Lieder stehen als interaktive Noten in der Bibliothek']},
          {'kind': 'listen', 'title': '„L’anneau d’argent“', 'work': 'Der silberne Ring – Gedicht von Rosemonde Gérard', 'points': [
              'Eine Frau betrachtet den schlichten Silberring, den ihr Geliebter ihr schenkte',
              'Er ist ihr mehr wert als Gold oder Juwelen',
              'Eine sanft fließende Melodie mit warmer Klavierbegleitung',
              'Öffne die interaktiven Noten und lies mit']},
          {'kind': 'listen', 'title': 'Zwei weitere zum Lesen', 'work': '„L’été“ und „Chanson de neige“', 'points': [
              '„L’été“ (Sommer): ein glänzendes, fröhliches Lied voller Vogelgesang – ein Lieblingsstück von Sopranistinnen',
              '„Chanson de neige“ (Schneelied): leicht und zart',
              'Vergleiche, wie das Klavier in jedem Lied die Jahreszeit malt']},
        ],
        'library': [('cmuyfx7u800842eon5ytahxtq', '„L’anneau d’argent“ – interaktive Noten'), ('cmuyfx7u900852eontnl5q51m', '„L’été“ – interaktive Noten'), ('cmuyfx7u5007s2eonmxwdmsei', '„Chanson de neige“ – interaktive Noten')],
      },
      {
        'title': 'England und Queen Victoria', 'type': 'SLIDES', 'minutes': 12,
        'description': "England liebte Chaminade – von den Londoner Konzertsälen bis Schloss Windsor.",
        'slides': [
          {'kind': 'bullets', 'title': 'Ein Star in England', 'bullets': [
              'Ab 1892 reiste sie fast jedes Jahr auf Tournee nach England',
              'In London spielte sie ihre eigene Musik vor vollen Sälen',
              'Queen Victoria bewunderte ihre Musik und lud sie 1897 nach Schloss Windsor ein',
              '1901 machte sie in London einige der ersten Grammophonaufnahmen einer Komponistin']},
          {'kind': 'bullets', 'title': 'Ehe', 'bullets': [
              '1901 heiratete sie Louis-Mathieu Carbonel, einen viele Jahre älteren Musikverleger aus Marseille',
              'Er starb 1907; sie heiratete nicht wieder',
              'Sie spielte und komponierte weiter – auf Tournee zu gehen war auch ihr Lebensunterhalt']},
          {'kind': 'listen', 'title': 'Hören: zwei leichte Lieblingsstücke', 'work': '„Pierrette“ (Air de ballet) und die „Sérénade espagnole“', 'points': [
              '„Pierrette“: ein anmutiger kleiner Tanz für Klavier – Cecil Elliott, 1925',
              'Die „Sérénade espagnole“, von Fritz Kreisler für Violine bearbeitet',
              'Kreisler spielt sie selbst, mit seinem Bruder Hugo, auf einer Platte von 1922',
              'Beide findest du in der Bibliothek']},
        ],
        'library': [(PIERRETTE, '„Pierrette“ – Cecil Elliott, 1925'), (SERENADE, '„Sérénade espagnole“ – Fritz und Hugo Kreisler, 1922')],
      },
      {
        'title': 'Video: das Flötenconcertino', 'type': 'YOUTUBE', 'minutes': 9, 'video': 'https://www.youtube.com/watch?v=BKjelbbWGEk',
        'description': "Das Concertino für Flöte, op. 107 (1902) entstand als Prüfungsstück für die Flötenklassen des Pariser Conservatoire – und wurde Chaminades meistgespieltes Werk. Jede Flötistin und jeder Flötist kennt es.\n\nHier spielt es Emmanuel Pahud, Soloflötist der Berliner Philharmoniker, mit dem Münchner Rundfunkorchester unter Ivan Repušić (ARD Klassik).\n\nAchte auf:\n1. Eine lange, singende Melodie – die Flöte als Stimme\n2. Brillante schnelle Läufe, die Finger und Atem des Spielers prüfen\n3. Eine kurze Kadenz für den Solisten allein gegen Ende",
      },
      {
        'title': 'Rückblick Woche 3 und Quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Zusammenfassung der Jahre des Ruhms, dann fünf Fragen.",
        'slides': [
          {'kind': 'summary', 'title': 'Woche 3 auf einen Blick', 'bullets': [
              'Mehr als 100 Lieder – „L’anneau d’argent“ ein Bestseller',
              'Jährliche Englandtourneen; Queen Victoria lädt sie nach Windsor ein (1897)',
              '1901: frühe Aufnahmen in London; Heirat mit Louis-Mathieu Carbonel',
              '1902: das Flötenconcertino – bis heute überall gespielt']},
        ],
        'quiz': [
          ('Was ist eine französische „mélodie“?', ['Ein Tanz', 'Ein Kunstlied', 'Eine Klavieretüde', 'Eine Opernarie'], 1),
          ('Welche Monarchin lud Chaminade nach Schloss Windsor ein?', ['Queen Victoria', 'König Eduard VII.', 'Königin Elisabeth', 'König Georg V.'], 0),
          ('Wofür wurde das Flötenconcertino geschrieben?', ['Für eine königliche Hochzeit', 'Als Prüfungsstück für das Conservatoire', 'Für einen Film', 'Für ihren Mann'], 1),
          ('Wer bearbeitete die „Sérénade espagnole“ für Violine?', ['Jascha Heifetz', 'Fritz Kreisler', 'Pablo de Sarasate', 'Joseph Joachim'], 1),
          ('Was tat Chaminade 1901 in London, das neu war?', ['Sie dirigierte eine Oper', 'Sie machte Grammophonaufnahmen', 'Sie gründete eine Schule', 'Sie spielte bei den Proms'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Woche 4 – Amerika, die Ehrenlegion und die Wiederentdeckung (1908–1944)',
    'lessons': [
      {
        'title': 'Amerika, 1908', 'type': 'SLIDES', 'minutes': 15,
        'description': "In Amerika war Chaminade ein Begriff – lange bevor sie je dort war.",
        'slides': [
          {'kind': 'title', 'week': 'Woche 4', 'title': 'Amerika und die Ehrenlegion', 'subtitle': '1908 – 1944', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Die Chaminade Clubs', 'bullets': [
              'Ab den 1890er-Jahren entstanden in den ganzen USA Musikclubs mit ihrem Namen',
              'Die meisten wurden von Frauen geführt, die sich trafen, um Musik zu spielen und zu singen – oft ihre',
              'Ihre Stücke gehörten im ganzen Land zum Standardrepertoire des Klavierunterrichts']},
          {'kind': 'bullets', 'title': 'Die Amerika-Tournee', 'bullets': [
              'Im Herbst 1908 reiste sie durch die USA und spielte ihre eigene Musik in etwa einem Dutzend Städten',
              'Ihr erstes Konzert dort fand in der Carnegie Hall in New York statt',
              'Das Publikum war begeistert; manche Kritiker urteilten weniger freundlich über „Salonmusik“',
              'Präsident Theodore Roosevelt empfing sie im Weißen Haus']},
          {'kind': 'bullets', 'title': 'Ehrenlegion, 1913', 'bullets': [
              '1913 ernannte Frankreich sie zum Ritter (chevalier) der Ehrenlegion',
              'Sie war die erste Komponistin, die diese Ehre erhielt',
              'Bis dahin hatte sie rund 400 Werke veröffentlicht']},
        ],
      },
      {
        'title': 'Video: eine vergessene Pionierin (auf Französisch)', 'type': 'YOUTUBE', 'minutes': 7, 'video': 'https://www.youtube.com/watch?v=Gz9Qw5srgw0',
        'description': "Dieser kurze Film von France Musique, dem öffentlichen französischen Klassiksender, ist auf Französisch – schalte bei Bedarf die Untertitel und die automatische Übersetzung von YouTube ein.\n\n„Cécile Chaminade, compositrice pionnière et star internationale oubliée“ – eine Komponistin als Pionierin und ein vergessener internationaler Star. Er erzählt, wie sie ihre Karriere aufbaute, wie groß ihr Ruhm war – und wie er verblasste.\n\nDenk darüber nach: Wie viel vom Ruhm einer Komponistin hängt von der Musik ab – und wie viel von der Mode?",
      },
      {
        'title': 'Die letzten Jahre und die Wiederentdeckung', 'type': 'SLIDES', 'minutes': 12,
        'description': "Chaminade lebte bis 1944 – lange genug, um zu erleben, wie ihre Musik aus der Mode kam. Heute kehrt sie zurück.",
        'slides': [
          {'kind': 'bullets', 'title': 'Die letzten Jahre', 'bullets': [
              'Nach dem Ersten Weltkrieg änderte sich der Musikgeschmack: Debussy, Ravel, Strawinsky, Jazz',
              'Ihre Musik galt nun als altmodische „Salonmusik“',
              'Gesundheitlich angeschlagen, komponierte sie weniger und lebte in Südfrankreich',
              'Sie starb am 13. April 1944 in Monte Carlo, mit 86 Jahren']},
          {'kind': 'bullets', 'title': 'Wiederentdeckung', 'bullets': [
              'Ab den 1980er-Jahren begannen Pianisten und Sänger, ihre Musik wieder aufzunehmen',
              'Das Flötenconcertino verschwand nie aus dem Repertoire',
              'Ihre Lieder, Klavierstücke und Klaviertrios werden neu aufgeführt und erforscht',
              'Sie ist eine zentrale Figur der Geschichte der Frauen in der Musik – und der Hausmusik']},
          {'kind': 'summary', 'title': 'Wie es weitergeht', 'bullets': [
              'Lies ihre Lieder in der Bibliothek: „Rosemonde“, „Villanelle“, „Ritournelle“',
              'Klavierspieler: Probier den Schleiertanz oder „Pierrette“; Flötisten: das Concertino',
              'Weiter mit den Kursen über Fanny Hensel, Clara Schumann und Debussy']},
        ],
        'library': [('cmuyfx7ua00892eonm8r2xzdu', '„Rosemonde“ – interaktive Noten'), ('cmuyfx7ud008e2eonig6dymeq', '„Villanelle“ – interaktive Noten')],
      },
      {
        'title': 'Abschluss: Rückblick und Quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Herzlichen Glückwunsch – du bist am Ende des Kurses angekommen! Ein letzter Rückblick und ein Abschlussquiz über alle vier Wochen.",
        'slides': [
          {'kind': 'timeline', 'title': 'Chaminades Leben auf einen Blick', 'rows': [
              ('1857', 'Geboren am 8. August in Paris'),
              ('1888', '„Callirhoë“ und das Konzertstück'),
              ('1892', 'Beginn ihrer jährlichen Englandtourneen'),
              ('1902', 'Flötenconcertino'),
              ('1908', 'Tournee durch die USA'),
              ('1913', 'Ehrenlegion'),
              ('1944', 'Gestorben am 13. April in Monte Carlo')]},
        ],
        'quiz': [
          ('Was waren die „Chaminade Clubs“?', ['Tennisclubs', 'Amerikanische Musikclubs mit ihrem Namen', 'Pariser Nachtclubs', 'Fanclubs in England'], 1),
          ('Wo gab Chaminade ihr erstes Konzert in Amerika?', ['Boston Symphony Hall', 'Carnegie Hall, New York', 'Im Weißen Haus', 'Chicago Orchestra Hall'], 1),
          ('Welche Ehrung erhielt sie 1913?', ['Den Prix de Rome', 'Die Ehrenlegion', 'Einen Nobelpreis', 'Einen Adelstitel'], 1),
          ('Welches ihrer Werke blieb immer im Repertoire?', ['La Sévillane', 'Das Flötenconcertino', 'Les Amazones', 'Callirhoë vollständig'], 1),
          ('Wo starb Chaminade?', ['In Paris', 'In Monte Carlo', 'In New York', 'In London'], 1),
          ('Wie viele Werke schrieb Chaminade ungefähr?', ['Etwa 40', 'Etwa 400', 'Etwa 4.000', 'Etwa 14'], 1),
        ],
      },
    ],
  },
]
