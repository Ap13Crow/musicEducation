# Felix Mendelssohn - version française de felix.py.
COURSE = {
    'slug': 'felix-mendelssohn-vie-et-oeuvre-introduction',
    'language': 'fr',
    'translationOf': 'felix-mendelssohn-life-and-music-introduction',
    'title': 'Felix Mendelssohn : vie et œuvre – Une première introduction',
    'shortSummary': 'Quatre semaines avec Felix Mendelssohn : le jeune génie de l’Octuor, l’homme qui fit revivre Bach, le chef d’orchestre de Leipzig – de la Grotte de Fingal au Concerto pour violon.',
    'description': (
        "Felix Mendelssohn Bartholdy (1809–1847) écrivit des chefs-d’œuvre dès l’adolescence, voyagea dans toute l’Europe, fit de l’orchestre du Gewandhaus de Leipzig "
        "l’un des meilleurs du monde et ressuscita la musique de Bach. Il ne vécut que 38 ans.\n\n"
        "En quatre semaines, vous suivez sa vie pas à pas :\n"
        "- Semaine 1 – Un enfant prodige berlinois : Goethe, l’Octuor et le Songe d’une nuit d’été (1809–1826)\n"
        "- Semaine 2 – Bach ressuscité et un grand voyage : Berlin, Écosse, Italie (1827–1832)\n"
        "- Semaine 3 – Leipzig : le chef d’orchestre (1833–1842)\n"
        "- Semaine 4 – Elias, le Concerto pour violon et un dernier adieu (1843–1847)\n\n"
        "Chaque semaine associe des diapositives illustrées, des vidéos (un documentaire, l’orchestre du Gewandhaus), des enregistrements et partitions de la bibliothèque "
        "mymusic.coach – dont un 78 tours de 1922 – et un court quiz. Aucune connaissance préalable n’est nécessaire. Comptez environ 1 à 2 heures par semaine."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'felix_portrait', 'title': 'Felix Mendelssohn', 'subtitle': 'Vie et œuvre – Une première introduction', 'tag': 'Cours de 4 semaines'},
}
FOOTER = 'Felix Mendelssohn : vie et œuvre'
PORTRAIT = {'image': 'felix_portrait', 'credit': 'Portrait par Eduard Magnus, 1833 (domaine public)'}
HEBRIDES = 'cmuygtj1v00jw4kktiyafru9g'
ITALIAN = 'cmuygtj1x00jy4kktrjjajsc1'
SCOTTISH = 'cmuygtj1y00k04kktq4ubsyp8'
QUARTET6 = 'cmuygtj2j00l34kktdybi56gs'
SPRING_SONG = 'cmv2j38l200sw12if4tl6pbts'

WEEKS = [
  {
    'title': 'Semaine 1 – Un enfant prodige berlinois (1809–1826)',
    'lessons': [
      {
        'title': 'Bienvenue : à la rencontre de Felix Mendelssohn', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Bienvenue dans ce cours ! Découvrez Felix Mendelssohn – compositeur, pianiste, chef d’orchestre, peintre et épistolier – et voyez comment se déroulent les quatre prochaines semaines.\n\nAstuce : toute la musique citée dans le cours est liée depuis les leçons. Ouvrez-la dans la bibliothèque, lisez les partitions et gagnez des XP supplémentaires en lisant ou en écoutant jusqu’au bout.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 1', 'title': 'À la rencontre de Felix Mendelssohn', 'subtitle': 'Une première introduction à sa vie et à sa musique', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Pourquoi Mendelssohn ?', 'bullets': [
              'Né à Hambourg en 1809 – mort à Leipzig en 1847, à seulement 38 ans',
              'Des chefs-d’œuvre dès l’adolescence : l’Octuor à 16 ans, l’ouverture du « Songe d’une nuit d’été » à 17',
              'Il fit revivre en 1829 la Passion selon saint Matthieu de Bach',
              'Célèbre chef de l’orchestre du Gewandhaus de Leipzig et fondateur du Conservatoire de Leipzig',
              'Ouverture « Les Hébrides », Symphonie « Italienne », Concerto pour violon, Marche nuptiale']},
          {'kind': 'timeline', 'title': 'Vos quatre semaines', 'rows': [
              ('Semaine 1', 'Un enfant prodige berlinois : Goethe, l’Octuor et le Songe d’une nuit d’été'),
              ('Semaine 2', 'Bach ressuscité et un grand voyage : Berlin, Écosse, Italie'),
              ('Semaine 3', 'Leipzig : le chef d’orchestre'),
              ('Semaine 4', 'Elias, le Concerto pour violon et un dernier adieu')]},
          {'kind': 'bullets', 'title': 'Avant de commencer', 'bullets': [
              'Mendelssohn appartient à la première génération romantique – avec Chopin, Schumann et Liszt',
              'Il aimait les formes claires comme Mozart – et les couleurs et atmosphères du romantisme',
              'Sa sœur Fanny était elle aussi une grande compositrice – un cours lui est consacré',
              'La peinture était son second art : il dessinait et peignait des aquarelles à chaque voyage']},
        ],
      },
      {
        'title': 'Une famille douée à Berlin', 'type': 'SLIDES', 'minutes': 15,
        'description': "Petit-fils d’un philosophe célèbre, fils de banquier, frère d’une sœur brillante : Felix grandit avec tous les avantages – et travailla très dur.",
        'slides': [
          {'kind': 'bullets', 'title': 'Hambourg, 3 février 1809', 'bullets': [
              'Deuxième des quatre enfants du banquier Abraham Mendelssohn et de Lea Salomon',
              'Petit-fils du philosophe juif Moses Mendelssohn',
              'En 1811, la famille s’installa à Berlin ; en 1816, les enfants furent baptisés luthériens',
              'La famille adopta le nom « Bartholdy » – Felix garda aussi « Mendelssohn »']},
          {'kind': 'bullets', 'title': 'Leçons dès cinq heures du matin', 'bullets': [
              'Les enfants se levaient à cinq heures pour leurs leçons : langues, mathématiques, dessin, musique',
              'Piano avec Ludwig Berger, composition avec Carl Friedrich Zelter – comme sa sœur Fanny',
              'Entre 1821 et 1823, il écrivit douze symphonies pour cordes en guise d’exercices',
              'À partir de 1822, la famille organisa des concerts du dimanche – avec un petit orchestre pour jouer ses nouvelles œuvres']},
          {'kind': 'bullets', 'title': 'Douze ans – chez Goethe', 'bullets': [
              'En 1821, Zelter emmena Felix à Weimar chez son ami Goethe, alors âgé de 72 ans',
              'Le garçon resta environ deux semaines et joua chaque jour pour Goethe',
              'Goethe le compara au jeune Mozart – et trouva Felix plus impressionnant encore',
              'Ils restèrent amis jusqu’à la mort du poète en 1832']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Né le 3 février 1809 à Hambourg, élevé à Berlin',
              'Professeurs : Ludwig Berger (piano), Carl Friedrich Zelter (composition)',
              '1821 : Felix, douze ans, rend visite à Goethe à Weimar',
              'Douze symphonies pour cordes dès l’enfance']},
        ],
      },
      {
        'title': 'Vidéo : Mendelssohn – sa vie et ses lieux', 'type': 'YOUTUBE', 'minutes': 22, 'video': 'https://www.youtube.com/watch?v=3susb6TcHG8',
        'description': "Ce documentaire d’opera-inside vous emmène sur les lieux de la vie de Mendelssohn – Hambourg, Berlin, Düsseldorf, Leipzig et ses voyages – en musique du début à la fin. La vidéo est en anglais – activez si besoin les sous-titres automatiques de YouTube.\n\nPendant le visionnage, cherchez :\n1. Qu’a accompli Mendelssohn avec la Passion selon saint Matthieu de Bach ?\n2. Quels voyages ont inspiré ses symphonies « Écossaise » et « Italienne » ?\n3. Pourquoi Leipzig était-elle si importante pour lui ?\n\nTout reviendra dans les semaines suivantes.",
      },
      {
        'title': 'L’Octuor et le Songe d’une nuit d’été', 'type': 'SLIDES', 'minutes': 15, 'xp': 20,
        'description': "Deux œuvres d’adolescent qui comptent parmi les miracles de l’histoire de la musique – puis un court résumé et cinq questions.",
        'slides': [
          {'kind': 'bullets', 'title': 'L’Octuor, 1825', 'bullets': [
              'Écrit à l’automne 1825, à 16 ans, pour l’anniversaire de son professeur de violon Eduard Rietz',
              'Huit cordes : quatre violons, deux altos, deux violoncelles – une « symphonie » pour formation de chambre',
              'Le scherzo léger et chuchoté s’inspire de la Nuit de Walpurgis du « Faust » de Goethe',
              'Beaucoup de musiciens le jugent plus parfait que tout ce que Mozart écrivit au même âge']},
          {'kind': 'bullets', 'title': 'Le Songe d’une nuit d’été, 1826', 'bullets': [
              'À 17 ans, après avoir lu la comédie de Shakespeare avec Fanny, il écrivit une ouverture de concert',
              'Quatre accords magiques des vents ouvrent la porte du monde des fées',
              'Écoutez les fées (violons rapides et doux) et l’âne Bottom (un « hi-han » aux cordes !)',
              '17 ans plus tard, en 1842, il écrivit d’autres musiques pour la pièce – dont la célèbre Marche nuptiale']},
          {'kind': 'summary', 'title': 'La semaine 1 en bref', 'bullets': [
              'Né en 1809 à Hambourg, élevé dans une famille berlinoise cultivée',
              'Formé par Berger et Zelter ; chez Goethe à 12 ans',
              '1825 : l’Octuor – à 16 ans',
              '1826 : l’ouverture du « Songe d’une nuit d’été » – à 17 ans']},
        ],
        'quiz': [
          ('Dans quelle ville Felix Mendelssohn est-il né ?', ['Berlin', 'Hambourg', 'Leipzig', 'Vienne'], 1),
          ('Quel célèbre poète Felix, douze ans, alla-t-il voir à Weimar ?', ['Schiller', 'Goethe', 'Heine', 'Shakespeare'], 1),
          ('Quel âge avait Mendelssohn quand il écrivit son Octuor ?', ['12 ans', '16 ans', '21 ans', '30 ans'], 1),
          ('Quelle pièce de théâtre inspira son ouverture de 1826 ?', ['Hamlet', 'Le Songe d’une nuit d’été', 'Roméo et Juliette', 'La Tempête'], 1),
          ('Quelle pièce célèbre fait partie de sa musique du Songe d’une nuit d’été de 1842 ?', ['La Marche nuptiale', 'La Marche de Radetzky', 'La Marche turque', 'La Marche funèbre'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 2 – Bach ressuscité et un grand voyage (1827–1832)',
    'lessons': [
      {
        'title': 'La Passion selon saint Matthieu de Bach, 1829', 'type': 'SLIDES', 'minutes': 15,
        'description': "Le 11 mars 1829, un jeune homme de 20 ans dirigea une œuvre que l’on n’avait plus entendue depuis la mort de Bach. Cela changea l’histoire de la musique.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 2', 'title': 'Bach ressuscité et un grand voyage', 'subtitle': '1827 – 1832', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Un chef-d’œuvre oublié', 'bullets': [
              'Après la mort de Bach en 1750, ses grandes œuvres chorales n’étaient presque plus jouées',
              'Felix reçut une copie de la Passion selon saint Matthieu de sa grand-mère pour Noël',
              'Il l’étudia avec des amis – et décida qu’il fallait la faire entendre à nouveau',
              'Zelter, directeur de la Sing-Akademie de Berlin, fut d’abord sceptique']},
          {'kind': 'timeline', 'title': '11 mars 1829', 'rows': [
              ('Lieu', 'La Sing-Akademie de Berlin'),
              ('Direction', 'Felix Mendelssohn, 20 ans (dans une version abrégée)'),
              ('Interprètes', 'Un chœur de plus de 150 chanteurs'),
              ('Public', 'Hegel, Heine et la société berlinoise – complet, des centaines de personnes refoulées'),
              ('Résultat', 'Le début du renouveau Bach au XIXe siècle')]},
          {'kind': 'quote', 'quote': 'Dire que ce sont un comédien et un fils de Juif qui rendent au peuple la plus grande musique chrétienne !', 'by': 'Mendelssohn à l’acteur Eduard Devrient, qui chantait le Christ, 1829 (selon les souvenirs de Devrient)'},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              '11 mars 1829 : la Passion selon saint Matthieu résonne à nouveau, environ 100 ans après sa création',
              'Dirigée par Mendelssohn, 20 ans, à Berlin',
              'Le début du renouveau Bach – Bach redevient un « classique »']},
        ],
      },
      {
        'title': 'Écouter : l’ouverture « Les Hébrides »', 'type': 'AUDIO', 'minutes': 12, 'libraryAudio': [HEBRIDES, 0],
        'description': "À l’été 1829, Mendelssohn voyagea en Écosse avec son ami Karl Klingemann. Le 7 août, sur l’île de Mull, il nota 21 mesures de musique dans une lettre à sa famille, « pour vous faire comprendre à quel point les Hébrides m’ont étrangement ému ». Le lendemain, il navigua jusqu’à l’île de Staffa et la grotte de Fingal. L’ouverture – aussi appelée « La Grotte de Fingal » – fut achevée en 1830 et révisée en 1832.\n\nÉcoutez :\n1. Le thème initial aux altos, violoncelles et bassons : un roulis de vagues\n2. Un second thème large et chantant aux violoncelles et bassons\n3. Des passages orageux – et la clarinette paisible à la fin\n\nEnregistrement Musopen, domaine public. La partition et d’autres enregistrements sont dans la bibliothèque.",
        'library': [(HEBRIDES, 'Ouverture « Les Hébrides » – enregistrement complet')],
      },
      {
        'title': 'Un grand voyage : l’Écosse et l’Italie', 'type': 'SLIDES', 'minutes': 15,
        'description': "Entre 1829 et 1832, Mendelssohn découvrit la Grande-Bretagne, l’Italie, la Suisse et Paris. Ses images de voyage devinrent des symphonies.",
        'slides': [
          {'kind': 'image', 'title': 'La grotte de Fingal, Staffa', 'text': 'Une grotte marine aux colonnes de basalte noir, sur une minuscule île des Hébrides. Mendelssohn la visita en août 1829 – il avait le mal de mer, mais les vagues et l’écho ne le quittèrent plus.', 'image': 'felix_fingal', 'credit': 'Edward Goodall, Fingal’s Cave, Staffa, 1833 (Yale Center for British Art, CC0)'},
          {'kind': 'timeline', 'title': 'Le grand voyage, 1829–1832', 'rows': [
              ('1829', 'Londres – ses premiers concerts là-bas – et l’Écosse : Holyrood, les Hébrides'),
              ('1830–1831', 'Weimar (une dernière visite à Goethe), Munich, Vienne, Venise, Florence, Rome, Naples'),
              ('1831', 'La Suisse, puis Paris – rencontre avec Chopin et Liszt'),
              ('1832', 'De nouveau Londres : l’ouverture « Les Hébrides » est jouée')]},
          {'kind': 'listen', 'title': 'La Symphonie « Italienne »', 'work': 'Symphonie n° 4 en la majeur, op. 90 (créée à Londres en 1833)', 'points': [
              'Le premier mouvement éclate de joie – « la pièce la plus gaie que j’aie faite », écrivit Felix depuis Rome',
              'Deuxième mouvement : une lente procession – peut-être des pèlerins vus à Naples',
              'Le finale est un « saltarello », une danse romaine rapide',
              'Ouvrez l’enregistrement dans la bibliothèque et écoutez le premier mouvement']},
          {'kind': 'bullets', 'title': 'La Symphonie « Écossaise »', 'bullets': [
              'Dans la chapelle en ruine de Holyrood, à Édimbourg, il nota une mélodie en 1829',
              'Il n’acheva la symphonie qu’en 1842 – 13 ans plus tard',
              'Des couleurs sombres et brumeuses : très différente de la lumineuse « Italienne »',
              'Dédiée à la reine Victoria, à qui il rendit visite à Buckingham Palace en 1842']},
        ],
        'library': [(ITALIAN, 'Symphonie « Italienne » – enregistrement complet'), (SCOTTISH, 'Symphonie « Écossaise » – enregistrement complet')],
      },
      {
        'title': 'Bilan de la semaine 2 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé sur Bach et le grand voyage, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 2 en bref', 'bullets': [
              '1829 : Mendelssohn dirige la Passion selon saint Matthieu de Bach à Berlin',
              '1829 : l’Écosse et les Hébrides – la grotte de Fingal',
              '1830–1831 : l’Italie, source de la Symphonie « Italienne »',
              '1842 : la Symphonie « Écossaise » est enfin achevée']},
        ],
        'quiz': [
          ('Quelle œuvre oubliée Mendelssohn dirigea-t-il à Berlin en 1829 ?', ['Le Messie de Haendel', 'La Passion selon saint Matthieu de Bach', 'Le Requiem de Mozart', 'La Création de Haydn'], 1),
          ('Quel est l’autre nom de l’ouverture « Les Hébrides » ?', ['La Grotte de Fingal', 'La Symphonie écossaise', 'La Mer', 'Mer calme et heureux voyage'], 0),
          ('Quel pays inspira sa Symphonie n° 4 ?', ['L’Écosse', 'L’Italie', 'La Suisse', 'La France'], 1),
          ('Quelle sorte de pièce est le finale de la Symphonie « Italienne » ?', ['Une valse', 'Un saltarello, une danse romaine rapide', 'Une fugue', 'Une marche funèbre'], 1),
          ('À qui dédia-t-il la Symphonie « Écossaise » ?', ['À Goethe', 'À la reine Victoria', 'À sa sœur Fanny', 'Au roi de Prusse'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 3 – Leipzig : le chef d’orchestre (1833–1842)',
    'lessons': [
      {
        'title': 'Leipzig et le Gewandhaus', 'type': 'SLIDES', 'minutes': 15,
        'description': "À 26 ans, Mendelssohn devint chef de l’orchestre du Gewandhaus de Leipzig – et en fit l’un des premiers orchestres d’Europe.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 3', 'title': 'Leipzig : le chef d’orchestre', 'subtitle': '1833 – 1842', **PORTRAIT},
          {'kind': 'timeline', 'title': 'Les étapes d’une carrière', 'rows': [
              ('1833', 'Directeur de la musique à Düsseldorf'),
              ('1835', 'Chef de l’orchestre du Gewandhaus de Leipzig'),
              ('1836', 'Premier oratorio, « Paulus », créé à Düsseldorf'),
              ('1837', 'Mariage avec Cécile Jeanrenaud, de Francfort – ils auront cinq enfants'),
              ('1839', 'Création de la « Grande » Symphonie en ut de Schubert')]},
          {'kind': 'bullets', 'title': 'Un nouveau type de chef', 'bullets': [
              'Il fut l’un des premiers à diriger à la baguette, debout face à l’orchestre',
              'Il répétait soigneusement et exigeait la précision',
              'Ses programmes mêlaient musique nouvelle et « classiques » : Bach, Haendel, Mozart, Beethoven',
              'Il dirigea les créations de la Première Symphonie de Schumann (1841) et de la « Grande » Symphonie en ut de Schubert']},
          {'kind': 'image', 'title': 'Mendelssohn peintre', 'text': 'Mendelssohn dessinait et peignait partout où il allait. Cette aquarelle de 1838 montre l’église et l’école Saint-Thomas à Leipzig – là où Bach avait travaillé un siècle plus tôt.', 'image': 'felix_watercolour', 'credit': 'Felix Mendelssohn, aquarelle, 1838 (domaine public)'},
        ],
      },
      {
        'title': 'Écouter : les Romances sans paroles', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [SPRING_SONG, 0],
        'description': "Mendelssohn inventa un nouveau genre de pièce pour piano : la « Romance sans paroles » (Lied ohne Worte) – une mélodie qui chante comme une voix, sur un accompagnement de piano. Il en publia huit recueils de six, et toutes les familles pianistes du XIXe siècle les possédaient.\n\nVoici la plus aimée de toutes, la « Chanson de printemps » (op. 62 n° 6, 1842), dans un arrangement pour harpe joué par Alberto Salvi sur un 78 tours de 1922.\n\nÉcoutez :\n1. La mélodie au centre, entourée d’accords légers et perlés\n2. Les petites appoggiatures au début de la mélodie – comme un chant d’oiseau\n3. Essayez ensuite de chanter la mélodie vous-même – c’est vraiment une chanson !\n\nAussi dans la bibliothèque : « Sur les ailes du chant » sur un disque de 1917, et les duos op. 63.",
        'library': [(SPRING_SONG, '« Chanson de printemps » – 78 tours, 1922'), ('cmv2ivcds00cu12if78ebppkt', '« Sur les ailes du chant » – 78 tours, 1917'), ('cmuyfx8j800q42eon7bxmhfla', '« Gruss », op. 63 n° 3 – partition interactive')],
      },
      {
        'title': 'Amis et famille', 'type': 'SLIDES', 'minutes': 12,
        'description': "Mendelssohn connaissait tout le monde – et écrivit des milliers de lettres. Ces diapositives présentent son entourage.",
        'slides': [
          {'kind': 'bullets', 'title': 'Fanny', 'bullets': [
              'Sa sœur aînée fut sa première critique et sa plus proche amie musicale',
              'En 1827 et 1830, il publia six de ses lieder sous son propre nom',
              'Mais longtemps il ne soutint pas son désir de publier sa propre musique',
              'En 1846, elle publia malgré tout – et il lui envoya sa bénédiction']},
          {'kind': 'bullets', 'title': 'Robert et Clara Schumann', 'bullets': [
              'Robert Schumann l’admirait comme « le Mozart du XIXe siècle »',
              'Clara Schumann joua souvent au Gewandhaus sous la direction de Mendelssohn',
              'À Leipzig, tous trois appartenaient au même cercle musical',
              'Robert mit par écrit ses souvenirs de Mendelssohn après sa mort']},
          {'kind': 'bullets', 'title': 'L’Angleterre', 'bullets': [
              'Mendelssohn se rendit dix fois en Grande-Bretagne – il y était immensément populaire',
              'La reine Victoria et le prince Albert l’invitèrent à Buckingham Palace',
              'Ses oratorios marquèrent la vie musicale britannique pendant un siècle']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              '1835 : chef de l’orchestre du Gewandhaus de Leipzig',
              '1837 : mariage avec Cécile Jeanrenaud',
              'Il créa la « Grande » Symphonie en ut de Schubert (1839)',
              'Les « Romances sans paroles » : un nouveau genre pour piano']},
        ],
      },
      {
        'title': 'Bilan de la semaine 3 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années de Leipzig, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 3 en bref', 'bullets': [
              'Düsseldorf (1833), puis Leipzig (1835)',
              'Un chef moderne qui remit les « classiques » à l’honneur',
              'Créations de la « Grande » Symphonie en ut de Schubert et de la Première de Schumann',
              'Les « Romances sans paroles » – et un œil de peintre']},
        ],
        'quiz': [
          ('Quel orchestre Mendelssohn dirigea-t-il à partir de 1835 ?', ['L’Orchestre philharmonique de Vienne', 'L’orchestre du Gewandhaus de Leipzig', 'La chapelle de la cour de Berlin', 'Le London Philharmonic'], 1),
          ('De qui créa-t-il la « Grande » Symphonie en ut en 1839 ?', ['De Beethoven', 'De Schubert', 'De Mozart', 'De Schumann'], 1),
          ('Qu’est-ce qu’une « Romance sans paroles » ?', ['Une pièce chorale', 'Une pièce pour piano à la mélodie chantante', 'Une chanson sur « la-la »', 'Un air d’opéra'], 1),
          ('Qui Mendelssohn épousa-t-il en 1837 ?', ['Clara Wieck', 'Cécile Jeanrenaud', 'Jenny Lind', 'Fanny Hensel'], 1),
          ('Quel passe-temps Mendelssohn pratiquait-il à chaque voyage ?', ['La photographie', 'L’aquarelle', 'La sculpture', 'Le jardinage'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 4 – Elias, le Concerto pour violon et un dernier adieu (1843–1847)',
    'lessons': [
      {
        'title': 'Le Conservatoire et Elias', 'type': 'SLIDES', 'minutes': 15,
        'description': "Dans ses dernières années, Mendelssohn fonda une école de musique, écrivit un oratorio célèbre – et travailla beaucoup trop.",
        'slides': [
          {'kind': 'bullets', 'title': 'Le Conservatoire de Leipzig, 1843', 'bullets': [
              'Mendelssohn fonda le premier conservatoire d’Allemagne',
              'Parmi les professeurs : Robert Schumann et le violoniste Ferdinand David',
              'Les élèves venaient de toute l’Europe – plus tard aussi le Norvégien Edvard Grieg',
              'Il s’appelle aujourd’hui Hochschule für Musik und Theater « Felix Mendelssohn Bartholdy »']},
          {'kind': 'bullets', 'title': '« Elias », 1846', 'bullets': [
              'Un oratorio sur le prophète Élie de l’Ancien Testament',
              'Créé au festival de Birmingham le 26 août 1846, en anglais',
              'Mendelssohn dirigeait ; le public fit bisser huit numéros',
              'Écoutez dans la bibliothèque « Hear ye, Israel » et « How lovely are the messengers » (de « Paulus ») sur des disques anciens']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              '1843 : fondation du Conservatoire de Leipzig',
              '1846 : création d’« Elias » à Birmingham',
              'Il travaillait sans relâche – compositeur, chef, professeur et organisateur']},
        ],
        'library': [('cmv2j30yn00sg12ifb701vuk6', '« Hear ye, Israel » (Elias) – 78 tours, 1922'), ('cmv2j1cnw00pc12if2upsauij', '« How lovely are the messengers » (Paulus) – 78 tours, 1920')],
      },
      {
        'title': 'Vidéo : le Concerto pour violon en mi mineur', 'type': 'YOUTUBE', 'minutes': 36, 'video': 'https://www.youtube.com/watch?v=lzIvElJ0VnI',
        'description': "L’un des concertos pour violon les plus aimés, joué par Nikolaj Szeps-Znaider avec l’orchestre du Gewandhaus sous la direction de Riccardo Chailly – l’orchestre même de Mendelssohn.\n\nMendelssohn l’écrivit pour son ami Ferdinand David, premier violon de l’orchestre, et y travailla six ans. David en donna la création à Leipzig le 13 mars 1845.\n\nÉcoutez :\n1. Le violon entre presque immédiatement – et non après une longue introduction orchestrale comme d’habitude\n2. La cadence (le solo du soliste) se trouve au milieu du premier mouvement, pas à la fin\n3. Une seule note de basson relie le premier et le deuxième mouvement – les trois mouvements s’enchaînent sans pause",
      },
      {
        'title': 'Écouter : un requiem pour Fanny', 'type': 'AUDIO', 'minutes': 10, 'libraryAudio': [QUARTET6, 0],
        'description': "Le 14 mai 1847, Fanny Hensel mourut subitement à Berlin. Felix s’effondra en apprenant la nouvelle. Pendant l’été, en Suisse, il écrivit le Quatuor à cordes en fa mineur, op. 80 – souvent appelé son « Requiem pour Fanny ». C’est la musique la plus agitée et la plus sombre qu’il ait jamais écrite.\n\nMendelssohn mourut à Leipzig le 4 novembre 1847, après plusieurs attaques – moins de six mois après sa sœur. Il avait 38 ans.\n\nÉcoutez le premier mouvement (enregistrement Musopen, domaine public) :\n1. Des trémolos inquiets dès la première mesure\n2. Des éclats soudains et presque aucun répit\n3. Comparez avec le joyeux Octuor de la semaine 1",
        'library': [(QUARTET6, 'Quatuor à cordes n° 6 en fa mineur, op. 80 – enregistrement complet'), ('cmuygtiti00ge4kktwiu66wcy', 'Quatuor à cordes n° 6 – partition interactive')],
      },
      {
        'title': 'Bilan final et quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Félicitations – vous êtes arrivé au bout du cours ! Un dernier résumé, un regard sur l’héritage de Mendelssohn et un quiz final.",
        'slides': [
          {'kind': 'timeline', 'title': 'La vie de Mendelssohn en un coup d’œil', 'rows': [
              ('1809', 'Naissance à Hambourg le 3 février'),
              ('1825–1826', 'L’Octuor et l’ouverture du « Songe d’une nuit d’été »'),
              ('1829', 'Passion selon saint Matthieu à Berlin ; l’Écosse'),
              ('1835', 'Chef de l’orchestre du Gewandhaus de Leipzig'),
              ('1843', 'Fondation du Conservatoire de Leipzig'),
              ('1845–1846', 'Concerto pour violon ; « Elias »'),
              ('1847', 'Mort à Leipzig le 4 novembre')]},
          {'kind': 'bullets', 'title': 'Héritage', 'bullets': [
              'Après 1933, les nazis interdirent sa musique en raison de ses origines juives ; sa statue de Leipzig fut retirée en 1936',
              'Sa musique est aujourd’hui de nouveau jouée partout – et une nouvelle statue se dresse à Leipzig depuis 2008',
              'Son renouveau Bach a changé notre regard sur la musique du passé',
              'Continuez avec les cours sur Fanny Hensel, Clara Schumann et Bach']},
        ],
        'quiz': [
          ('Qui donna la création du Concerto pour violon ?', ['Niccolò Paganini', 'Ferdinand David', 'Joseph Joachim', 'Mendelssohn lui-même'], 1),
          ('Quel oratorio fut créé à Birmingham en 1846 ?', ['Le Messie', 'Elias', 'Paulus', 'La Création'], 1),
          ('Que fonda Mendelssohn à Leipzig en 1843 ?', ['Un orchestre', 'Le premier conservatoire d’Allemagne', 'Une revue musicale', 'Une fabrique de pianos'], 1),
          ('Quelle œuvre appelle-t-on souvent son « Requiem pour Fanny » ?', ['L’Octuor', 'Le Quatuor à cordes en fa mineur, op. 80', 'La Symphonie « Écossaise »', 'Elias'], 1),
          ('Quel âge avait Mendelssohn à sa mort ?', ['38 ans', '48 ans', '56 ans', '72 ans'], 0),
          ('Qu’a d’inhabituel le début de son Concerto pour violon ?', ['Il commence par un solo de timbales', 'Le violon entre presque tout de suite', 'Il commence par un chœur', 'Il n’y a pas d’orchestre'], 1),
        ],
      },
    ],
  },
]
