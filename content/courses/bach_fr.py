# Jean-Sébastien Bach - version française de bach.py.
COURSE = {
    'slug': 'bach-vie-et-oeuvre-introduction',
    'language': 'fr',
    'translationOf': 'bach-life-and-music-introduction',
    'title': 'Jean-Sébastien Bach : vie et œuvre – Une première introduction',
    'shortSummary': 'Quatre semaines avec Jean-Sébastien Bach : un orphelin d’Eisenach devenu le grand maître du baroque – orgue, Concertos brandebourgeois, Variations Goldberg et Passion selon saint Matthieu.',
    'description': (
        "Jean-Sébastien Bach (1685–1750) n’a jamais quitté l’Allemagne. Organiste, musicien de cour et directeur de la musique d’église, "
        "il a écrit une musique que les musiciens du monde entier travaillent encore chaque jour. De Mozart aux Beatles, les compositeurs ont appris de lui.\n\n"
        "En quatre semaines, vous suivez sa vie pas à pas :\n"
        "- Semaine 1 – Une famille de musiciens : Eisenach, Ohrdruf, Lunebourg (1685–1703)\n"
        "- Semaine 2 – Le jeune organiste : Arnstadt, Mühlhausen, Weimar (1703–1717)\n"
        "- Semaine 3 – Köthen : les Concertos brandebourgeois et Le Clavier bien tempéré (1717–1723)\n"
        "- Semaine 4 – Leipzig : cantates, passions et Variations Goldberg (1723–1750)\n\n"
        "Chaque semaine associe des diapositives illustrées, des vidéos de la Nederlandse Bachvereniging, des enregistrements et partitions de la bibliothèque mymusic.coach "
        "et un court quiz. Aucune connaissance préalable n’est nécessaire. Comptez environ 1 à 2 heures par semaine."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin', 'Cello'],
    'musicStyles': ['Baroque'],
    'cover': {'image': 'bach_portrait', 'title': 'Bach', 'subtitle': 'Vie et œuvre – Une première introduction', 'tag': 'Cours de 4 semaines'},
}
FOOTER = 'Jean-Sébastien Bach : vie et œuvre'
PORTRAIT = {'image': 'bach_portrait', 'credit': 'Portrait par Elias Gottlob Haussmann, 1748 (domaine public)'}
GOLDBERG = 'cmuygtizf00jj4kktc8xi94bw'

WEEKS = [
  {
    'title': 'Semaine 1 – Une famille de musiciens (1685–1703)',
    'lessons': [
      {
        'title': 'Bienvenue : à la rencontre de Bach', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Bienvenue dans ce cours ! Découvrez l’homme derrière la perruque et le portrait sévère – et voyez comment se déroulent les quatre prochaines semaines.\n\nAstuce : toute la musique citée dans le cours est liée depuis les leçons. Ouvrez-la dans la bibliothèque, lisez les partitions et gagnez des XP supplémentaires en lisant ou en écoutant jusqu’au bout.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 1', 'title': 'À la rencontre de Jean-Sébastien Bach', 'subtitle': 'Une première introduction à sa vie et à sa musique', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Pourquoi Bach ?', 'bullets': [
              'Né à Eisenach en 1685 – mort à Leipzig en 1750',
              'Organiste, musicien de cour et directeur de la musique d’église – jamais compositeur d’opéras',
              'Plus de 1 000 œuvres conservées : orgue et clavier, concertos, cantates, passions',
              'Le plus grand maître du contrepoint : plusieurs mélodies tissées ensemble',
              'Mozart, Beethoven, Chopin et Mendelssohn ont tous étudié sa musique']},
          {'kind': 'timeline', 'title': 'Vos quatre semaines', 'rows': [
              ('Semaine 1', 'Une famille de musiciens (1685–1703)'),
              ('Semaine 2', 'Le jeune organiste (1703–1717)'),
              ('Semaine 3', 'Köthen : concertos et Clavier bien tempéré'),
              ('Semaine 4', 'Leipzig : cantates, passions, Variations Goldberg')]},
          {'kind': 'bullets', 'title': 'Que veut dire « baroque » ?', 'bullets': [
              'La période musicale d’environ 1600 à 1750 – la mort de Bach en marque la fin',
              'Une ligne de basse continue (basse continue) porte la musique',
              'De longues mélodies fluides et des rythmes forts et réguliers',
              'Des contrastes : fort et doux, soliste et orchestre, un instrument contre plusieurs']},
          {'kind': 'quote', 'quote': 'Le but et la fin ultime de toute musique ne devraient être que la gloire de Dieu et le délassement de l’âme.', 'by': 'Attribué à Bach, dans un traité de basse continue recopié par ses élèves (1738)'},
        ],
      },
      {
        'title': 'Un orphelin dans une famille de musiciens', 'type': 'SLIDES', 'minutes': 15,
        'description': "Bach venait d’une famille où presque tout le monde était musicien. Ces diapositives racontent son enfance – et le frère qui l’a formé après la mort de ses deux parents.",
        'slides': [
          {'kind': 'bullets', 'title': 'Eisenach, mars 1685', 'bullets': [
              'Né le 21 mars 1685 à Eisenach, en Thuringe, cadet de huit enfants',
              'Son père Johann Ambrosius était musicien de la ville – violoniste et trompettiste',
              'En sept générations, la famille Bach a compté plus de 50 musiciens professionnels',
              'Dans certaines villes de Thuringe, « un Bach » voulait simplement dire « un musicien »']},
          {'kind': 'timeline', 'title': 'Une enfance difficile', 'rows': [
              ('1694', 'Sa mère Maria Elisabeth meurt – Jean-Sébastien a neuf ans'),
              ('1695', 'Son père meurt moins d’un an plus tard'),
              ('1695', 'Il part à Ohrdruf chez son frère aîné Johann Christoph, organiste'),
              ('1700', 'À 15 ans, il rejoint Lunebourg à pied et chante dans le chœur de l’école Saint-Michel'),
              ('1703', 'Premier emploi : violoniste à la cour de Weimar, puis organiste à Arnstadt')]},
          {'kind': 'bullets', 'title': 'Apprendre en recopiant', 'bullets': [
              'Son frère lui enseigna le clavier',
              'Une histoire célèbre : le jeune Sébastien recopia en secret, au clair de lune, un cahier de musique sous clé – pendant des mois',
              'Recopier la musique des autres compositeurs fut toute sa vie sa manière d’apprendre',
              'À Lunebourg, il entendit le grand organiste Georg Böhm et la musique française de la cour voisine de Celle']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Né le 21 mars 1685 à Eisenach, dans une famille de musiciens',
              'Orphelin à dix ans, élevé par son frère à Ohrdruf',
              'Choriste à Lunebourg à partir de 1700',
              'Il apprenait en recopiant et en étudiant la musique des autres']},
        ],
      },
      {
        'title': 'Vidéo : la vie de Bach et ses lieux', 'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=qqmhYsF-JrE',
        'description': "Ce documentaire visite les lieux où Bach a vécu et travaillé, d’Eisenach à Leipzig. La vidéo est en anglais – activez si besoin les sous-titres automatiques de YouTube.\n\nPendant le visionnage, cherchez :\n1. Dans quelles villes Bach a-t-il travaillé – et dans quel ordre ?\n2. Quels postes a-t-il occupés à la cour, et lesquels à l’église ?\n3. Quelle était la taille de la famille Bach ?\n\nPas besoin de tout retenir : chaque partie de l’histoire reviendra dans les semaines suivantes.",
      },
      {
        'title': 'Bilan de la semaine 1 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Un court résumé de la semaine 1, une première pièce à découvrir et cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 1 en bref', 'bullets': [
              'Né à Eisenach le 21 mars 1685',
              'Une famille de musiciens sur sept générations',
              'Orphelin à dix ans – élevé par son frère Johann Christoph',
              'Choriste à l’école Saint-Michel de Lunebourg',
              '1703 : ses premiers postes de musicien']},
          {'kind': 'bullets', 'title': 'À découvrir cette semaine', 'bullets': [
              'Le célèbre « Menuet en sol » du Petit Livre d’Anna Magdalena Bach – le premier morceau de piano de beaucoup d’élèves',
              'Le saviez-vous ? Les chercheurs ont montré qu’il est en réalité de Christian Petzold – Bach l’a recopié pour sa famille',
              'Un enregistrement historique de 1924 se trouve aussi dans la bibliothèque']},
        ],
        'library': [('cmuygw98a01th4kkt69w3wfcf', 'Le Menuet en sol du Petit Livre d’Anna Magdalena – partition'), ('cmv2j6zl4010w12ifusp63hw3', 'Enregistrement historique du Menuet en sol (1924)')],
        'quiz': [
          ('Dans quelle ville Jean-Sébastien Bach est-il né ?', ['Leipzig', 'Eisenach', 'Weimar', 'Hambourg'], 1),
          ('Que s’est-il passé quand Bach avait neuf et dix ans ?', ['Il est devenu musicien de cour', 'Il a perdu sa mère puis son père', 'Il est parti en Italie', 'Il a écrit sa première cantate'], 1),
          ('Qui s’est occupé du jeune Bach à Ohrdruf ?', ['Son frère aîné, organiste', 'Le duc de Weimar', 'Son oncle de Leipzig', 'Une école de monastère'], 0),
          ('Où Bach a-t-il chanté comme choriste à partir de 1700 ?', ['Vienne', 'Dresde', 'Lunebourg', 'Lübeck'], 2),
          ('Comment Bach apprenait-il la musique des autres compositeurs ?', ['Grâce à des enregistrements', 'Surtout en la recopiant à la main', 'À l’université', 'Uniquement à l’oreille'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 2 – Le jeune organiste (1703–1717)',
    'lessons': [
      {
        'title': 'Organiste à Arnstadt, Mühlhausen et Weimar', 'type': 'SLIDES', 'minutes': 15,
        'description': "Bach fut d’abord célèbre comme organiste – et comme jeune employé plutôt têtu. Voici comment sa carrière a commencé.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 2', 'title': 'Le jeune organiste', 'subtitle': '1703 – 1717', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Arnstadt : à pied jusqu’à Lübeck', 'bullets': [
              'En 1703, Bach devint organiste de la Nouvelle Église d’Arnstadt',
              'En 1705, il parcourut environ 400 km à pied jusqu’à Lübeck pour entendre le grand organiste Dieterich Buxtehude',
              'Il avait obtenu quatre semaines de congé – il resta environ quatre mois',
              'De retour, le consistoire se plaignit de ses harmonies « étranges » qui déroutaient les fidèles']},
          {'kind': 'timeline', 'title': 'Les étapes', 'rows': [
              ('1707', 'Organiste à Mühlhausen ; mariage avec sa cousine Maria Barbara Bach'),
              ('1708', 'Organiste de la cour à Weimar'),
              ('1714', 'Promu Konzertmeister – il compose désormais une cantate par mois'),
              ('1717', 'Il veut partir pour Köthen – le duc le fait emprisonner près de quatre semaines'),
              ('1717', 'Libéré « en disgrâce » – il prend son nouveau poste à Köthen')]},
          {'kind': 'bullets', 'title': 'Le roi de l’orgue', 'bullets': [
              'La plupart des grandes œuvres pour orgue de Bach datent de ces années',
              'Il pouvait tester un orgue neuf en quelques minutes – on l’appela toute sa vie comme expert d’orgues',
              'Ses improvisations étaient légendaires : il inventait une fugue sur-le-champ',
              'En 1717, un concours prévu à Dresde n’eut jamais lieu – son rival Louis Marchand quitta la ville avant']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Organiste à Arnstadt, Mühlhausen et Weimar',
              '1705 : la longue marche jusqu’à Lübeck pour entendre Buxtehude',
              'Weimar : grandes œuvres pour orgue et premières cantates',
              'Si décidé à quitter Weimar qu’il fut brièvement emprisonné']},
        ],
      },
      {
        'title': 'Vidéo : une toccata de Bach', 'type': 'YOUTUBE', 'minutes': 10, 'video': 'https://www.youtube.com/watch?v=WialMe-8zaU',
        'description': "Une toccata (de l’italien « toccare », toucher) est une pièce de bravoure qui met l’interprète en valeur. Bart Jacobs joue la Toccata en mi mineur, BWV 914, pour la Nederlandse Bachvereniging.\n\nÉcoutez :\n1. Le début libre, qui sonne comme une improvisation\n2. Des sections qui changent de tempo et de caractère – comme une suite de courtes scènes\n3. La fugue finale : une courte mélodie (le sujet) entre dans une voix après l’autre\n\nOuvrez ensuite la toccata la plus célèbre de toutes, Toccata et fugue en ré mineur, BWV 565, dans la bibliothèque et regardez ses premières mesures dramatiques.",
        'library': [('cmuygw8yz01mh4kkthvxs2qic', 'Toccata et fugue en ré mineur, BWV 565 – partition')],
      },
      {
        'title': 'Comment fonctionne une fugue', 'type': 'SLIDES', 'minutes': 12,
        'description': "La fugue était la forme préférée de Bach. Avec quatre idées de base, vous pourrez suivre presque n’importe quelle fugue.",
        'slides': [
          {'kind': 'bullets', 'title': 'Une conversation musicale', 'bullets': [
              'Une fugue naît d’une courte mélodie : le sujet',
              'Une voix expose le sujet seule',
              'Une deuxième voix répond avec la même mélodie, un peu plus haut ou plus bas',
              'D’autres voix entrent l’une après l’autre – toutes indépendantes, toutes aussi importantes']},
          {'kind': 'listen', 'title': 'Suivre une fugue', 'work': 'Invention n° 1 en do majeur, BWV 772', 'points': [
              'Les Inventions à deux voix de Bach sont le premier pas idéal : deux voix seulement',
              'La courte figure initiale de la main droite reçoit la réponse de la main gauche',
              'La figure revient sans cesse – renversée, plus haut, plus bas',
              'Ouvrez la partition dans la bibliothèque et marquez chaque apparition de la figure initiale']},
          {'kind': 'bullets', 'title': 'Pourquoi c’est toujours important', 'bullets': [
              'Le contrepoint apprend à entendre plusieurs choses à la fois',
              'Bach écrivit les Inventions pour enseigner « une manière chantante de jouer » – chanter au clavier',
              'Les pianistes les apprennent encore aujourd’hui – Beethoven, Chopin et bien d’autres travaillaient Bach chaque jour']},
        ],
        'library': [('cmuygw92d01pd4kkthosmeill', 'Invention n° 1 en do majeur, BWV 772 – partition')],
      },
      {
        'title': 'Bilan de la semaine 2 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années d’organiste de Bach, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 2 en bref', 'bullets': [
              '1703 : organiste à Arnstadt',
              '1705 : à pied jusqu’à Lübeck pour entendre Buxtehude',
              '1707 : Mühlhausen et mariage avec Maria Barbara',
              '1708–1717 : organiste de la cour et Konzertmeister à Weimar',
              'La fugue : un sujet, plusieurs voix indépendantes']},
        ],
        'quiz': [
          ('Quel célèbre organiste Bach a-t-il voulu entendre en marchant environ 400 km ?', ['Georg Friedrich Haendel', 'Dieterich Buxtehude', 'Antonio Vivaldi', 'Johann Pachelbel'], 1),
          ('Que s’est-il passé quand Bach a voulu quitter Weimar en 1717 ?', ['Il a été augmenté', 'Le duc l’a fait emprisonner près de quatre semaines', 'Il a été envoyé en Italie', 'Il a dû payer une lourde amende'], 1),
          ('Qu’est-ce que le « sujet » d’une fugue ?', ['Le titre de la pièce', 'La courte mélodie principale reprise par chaque voix', 'L’accord final', 'Le dédicataire de l’œuvre'], 1),
          ('Qui Bach a-t-il épousé en 1707 ?', ['Anna Magdalena Wilcke', 'Sa cousine Maria Barbara Bach', 'Une princesse de Köthen', 'Personne – il ne s’est marié qu’une fois, en 1721'], 1),
          ('D’où vient le mot « toccata » ?', ['Du mot italien pour « toucher »', 'D’une ville d’Allemagne', 'D’une danse française', 'Du nom d’un facteur d’orgues'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 3 – Köthen : concertos et Clavier bien tempéré (1717–1723)',
    'lessons': [
      {
        'title': 'Musicien de cour à Köthen', 'type': 'SLIDES', 'minutes': 15,
        'description': "À la cour d’un jeune prince passionné de musique, Bach écrivit certaines des œuvres instrumentales les plus joyeuses jamais composées – et connut un grand chagrin.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 3', 'title': 'Köthen', 'subtitle': '1717 – 1723', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Un prince qui aimait la musique', 'bullets': [
              'Le prince Léopold d’Anhalt-Köthen jouait du violon, de la viole de gambe et du clavecin',
              'Bach devint son maître de chapelle – à la tête d’un excellent orchestre de cour',
              'L’église de la cour était calviniste et utilisait peu de musique – Bach écrivit donc surtout pour les instruments',
              'Chefs-d’œuvre de ces années : les suites pour violoncelle, les sonates et partitas pour violon, les Concertos brandebourgeois']},
          {'kind': 'timeline', 'title': 'Joie et chagrin', 'rows': [
              ('1720', 'Au retour d’un voyage avec le prince, Bach apprend la mort de sa femme Maria Barbara'),
              ('1721', 'Il envoie six concertos au margrave de Brandebourg – les Concertos « brandebourgeois »'),
              ('1721', 'Il épouse Anna Magdalena Wilcke, chanteuse de la cour'),
              ('1722', 'Il achève le premier livre du Clavier bien tempéré'),
              ('1723', 'Il part pour Leipzig comme cantor de Saint-Thomas')]},
          {'kind': 'bullets', 'title': 'Le Clavier bien tempéré', 'bullets': [
              '24 préludes et fugues – un dans chaque tonalité majeure et mineure',
              '« Bien tempéré » désigne un accord dans lequel toutes les tonalités sonnent bien',
              'Le deuxième livre suivit vers 1742 : 24 de plus',
              'Les pianistes l’appellent « l’Ancien Testament » de la musique pour piano']},
          {'kind': 'listen', 'title': 'Prélude n° 1 en do majeur', 'work': 'Clavier bien tempéré I, BWV 846', 'points': [
              'Un seul motif d’accords brisés du début à la fin',
              'Seule l’harmonie change – un accord par mesure',
              'Écoutez la tension monter au-dessus d’une longue note tenue à la basse avant la fin',
              'Gounod écrivit plus tard sa mélodie de l’« Ave Maria » sur ce prélude même']},
        ],
        'library': [('cmuygw94v01qi4kktwlxbfn8g', 'Prélude n° 1 en do majeur, BWV 846 – partition'), ('cmuygw94p01qg4kktleg0qfhx', 'La fugue qui le suit'), ('cmuygw8u401ko4kktl6eoo2ed', 'Le célèbre « Air » de la Suite BWV 1068 – partition')],
      },
      {
        'title': 'Vidéo : Concerto brandebourgeois n° 3', 'type': 'YOUTUBE', 'minutes': 12, 'video': 'https://www.youtube.com/watch?v=qr0f6t2UbOo',
        'description': "En 1721, Bach envoya six concertos soigneusement recopiés à Christian Ludwig, margrave de Brandebourg. Le margrave ne les fit sans doute jamais jouer – ils comptent aujourd’hui parmi les œuvres baroques les plus jouées. La Nederlandse Bachvereniging, avec Shunske Sato, joue le troisième concerto.\n\nÉcoutez :\n1. Trois violons, trois altos, trois violoncelles – un concerto pour groupes de trois\n2. Les musiciens se lancent de courts motifs comme une balle\n3. Le « mouvement lent » n’est fait que de deux accords – les musiciens improvisent un pont entre les mouvements rapides\n\nLe saviez-vous ? Le premier mouvement du Concerto brandebourgeois n° 2 voyage dans l’espace sur le Voyager Golden Record (1977).",
      },
      {
        'title': 'La famille de Bach', 'type': 'SLIDES', 'minutes': 10,
        'description': "Bach eut vingt enfants. Plusieurs de ses fils devinrent eux-mêmes des compositeurs célèbres.",
        'slides': [
          {'kind': 'bullets', 'title': 'Vingt enfants', 'bullets': [
              'Sept enfants avec Maria Barbara, treize avec Anna Magdalena',
              'Dix seulement atteignirent l’âge adulte – la mortalité infantile était très élevée',
              'La maison était une école de musique : enfants, élèves et parents jouaient ensemble',
              'Pour Anna Magdalena et les enfants, il réunit les « Petits Livres » de pièces faciles']},
          {'kind': 'bullets', 'title': 'Des fils musiciens', 'bullets': [
              'Wilhelm Friedemann (1710–1784) – organiste à Dresde et à Halle',
              'Carl Philipp Emanuel (1714–1788) – musicien de Frédéric le Grand, puis à Hambourg ; Haydn et Beethoven l’admiraient',
              'Johann Christian (1735–1782) – « le Bach de Londres », ami du petit Mozart âgé de huit ans',
              'Pendant des décennies après 1750, « Bach » désignait le plus souvent l’un des fils, pas le père']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Köthen : Concertos brandebourgeois, suites pour violoncelle, Clavier bien tempéré',
              '1720 : mort de Maria Barbara ; 1721 : mariage avec Anna Magdalena',
              'Vingt enfants – trois fils devinrent des compositeurs célèbres']},
        ],
      },
      {
        'title': 'Bilan de la semaine 3 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années de Köthen, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 3 en bref', 'bullets': [
              '1717–1723 : maître de chapelle du prince Léopold de Köthen',
              'Chefs-d’œuvre instrumentaux : suites pour violoncelle, partitas pour violon, Concertos brandebourgeois',
              '1722 : Clavier bien tempéré, livre 1 – 24 préludes et fugues',
              '1721 : mariage avec la chanteuse Anna Magdalena Wilcke']},
        ],
        'library': [('cmuygw8tt01k94kktr0aiwa4q', 'Une suite pour violoncelle à découvrir : le Prélude de la Suite n° 6')],
        'quiz': [
          ('Pourquoi Bach écrivit-il surtout de la musique instrumentale à Köthen ?', ['Il n’aimait pas les chanteurs', 'L’église de la cour utilisait peu de musique', 'Il n’y avait pas d’orgue en ville', 'Le prince était sourd'], 1),
          ('À qui les Concertos « brandebourgeois » sont-ils dédiés ?', ['Au roi de Prusse', 'Au margrave de Brandebourg', 'Au prince Léopold', 'À la ville de Leipzig'], 1),
          ('Combien de préludes et fugues compte le premier livre du Clavier bien tempéré ?', ['12', '24', '30', '48'], 1),
          ('Quel compositeur écrivit un « Ave Maria » sur le Prélude en do majeur de Bach ?', ['Schubert', 'Gounod', 'Verdi', 'Mozart'], 1),
          ('Lequel des fils de Bach était surnommé « le Bach de Londres » ?', ['Carl Philipp Emanuel', 'Wilhelm Friedemann', 'Johann Christian', 'Johann Christoph'], 2),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 4 – Leipzig : cantates, passions et Variations Goldberg (1723–1750)',
    'lessons': [
      {
        'title': 'Cantor de Saint-Thomas', 'type': 'SLIDES', 'minutes': 15,
        'description': "Pendant les 27 dernières années de sa vie, Bach fut responsable de la musique des principales églises de Leipzig – une charge énorme d’où sont nées certaines de ses plus grandes œuvres.",
        'slides': [
          {'kind': 'image', 'title': 'Leipzig, 1723', 'text': 'Bach devint cantor de l’école Saint-Thomas et directeur de la musique des principales églises de la ville. Il enseignait aux élèves, faisait répéter les chœurs et écrivait de la musique pour chaque dimanche.', 'image': 'bach_leipzig', 'credit': 'Église et école Saint-Thomas, Leipzig, gravure, 1735 (domaine public)'},
          {'kind': 'bullets', 'title': 'Une cantate par semaine', 'bullets': [
              'Ses premières années, il écrivit une nouvelle cantate pour presque chaque dimanche et jour de fête',
              'Environ 200 de ses cantates d’église sont conservées',
              'Chacune réunit chœurs, airs, récitatifs et un choral – un cantique que l’assemblée connaissait']},
          {'kind': 'timeline', 'title': 'Chefs-d’œuvre des années de Leipzig', 'rows': [
              ('1724', 'Passion selon saint Jean'),
              ('1727', 'Passion selon saint Matthieu'),
              ('1734', 'Oratorio de Noël'),
              ('1741', 'Publication des Variations Goldberg'),
              ('1747', 'L’Offrande musicale – sur un thème du roi Frédéric le Grand'),
              ('1749', 'Achèvement de la Messe en si mineur')]},
          {'kind': 'bullets', 'title': 'Les dernières années', 'bullets': [
              'En 1747, il rendit visite à Frédéric le Grand à Potsdam et improvisa sur le thème du roi',
              'Sa vue baissa ; deux opérations en 1750 par l’oculiste itinérant John Taylor tournèrent mal',
              'Bach mourut le 28 juillet 1750 à Leipzig',
              'Son dernier grand projet, L’Art de la fugue, resta inachevé']},
        ],
      },
      {
        'title': 'Écouter : les Variations Goldberg', 'type': 'AUDIO', 'minutes': 5, 'libraryAudio': [GOLDBERG, 0],
        'description': "Publiées en 1741, les Variations Goldberg se composent d’une Aria, de 30 variations et de l’Aria reprise. Une histoire célèbre – racontée en 1802 par Forkel, le premier biographe de Bach, et sans doute plus légende que réalité – dit qu’elles furent écrites pour le comte Keyserlingk, insomniaque, et son jeune claveciniste Johann Gottlieb Goldberg.\n\nVous entendez ici l’Aria, le thème paisible du début (enregistrement Musopen, domaine public).\n\nÉcoutez :\n1. Une mélodie lente et ornée – comme une sarabande, une danse noble\n2. La basse : les variations sont construites sur cette basse, pas sur la mélodie\n3. Ouvrez ensuite l’enregistrement complet dans la bibliothèque : une variation sur trois est un canon, où une voix imite une autre\n\nLes 32 plages et les partitions de chaque variation sont dans la bibliothèque.",
        'library': [(GOLDBERG, 'Les Variations Goldberg complètes – les 32 plages'), ('cmuygw97m01sa4kktvp0yth9e', 'L’Aria – partition'), ('cmuygw97r01si4kkt998of1zs', 'Variation 3 : le premier canon – partition')],
      },
      {
        'title': 'L’héritage de Bach', 'type': 'SLIDES', 'minutes': 12,
        'description': "Après sa mort, Bach fut presque oublié du public – jusqu’à ce qu’un jeune homme de 20 ans, Felix Mendelssohn, le fasse revivre.",
        'slides': [
          {'kind': 'bullets', 'title': 'Oublié – puis redécouvert', 'bullets': [
              'Après 1750, le style de Bach parut démodé – mais les musiciens continuèrent d’étudier ses œuvres pour clavier',
              'Mozart et Beethoven recopiaient et jouaient ses fugues',
              'Le 11 mars 1829, Felix Mendelssohn dirigea la Passion selon saint Matthieu à Berlin – sa première exécution depuis la mort de Bach',
              'Ce fut le début du « renouveau Bach », qui continue aujourd’hui']},
          {'kind': 'bullets', 'title': 'Bach aujourd’hui', 'bullets': [
              'Ses œuvres sont numérotées dans le Bach-Werke-Verzeichnis : BWV 1 à plus de 1 100',
              'Trois pièces de Bach voyagent sur le Voyager Golden Record, désormais au-delà du système solaire',
              'Musiciens de jazz, groupes de rock et compositeurs de films reprennent ses idées',
              'Tout pianiste, organiste, violoniste ou violoncelliste sérieux joue Bach']},
          {'kind': 'quote', 'quote': 'Nicht Bach – Meer sollte er heißen.', 'by': 'Jeu de mots de Beethoven : « Il ne devrait pas s’appeler Bach (ruisseau) mais Meer (océan) » – rapporté par ses contemporains'},
          {'kind': 'summary', 'title': 'Pour aller plus loin', 'bullets': [
              'Explorez des centaines de partitions de Bach dans la bibliothèque mymusic.coach',
              'Continuez avec « Felix Mendelssohn » – l’homme qui a fait revivre Bach',
              'Pianistes : demandez à votre professeur le Menuet en sol ou l’Invention n° 1']},
        ],
      },
      {
        'title': 'Bilan final et quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Félicitations – vous êtes arrivé au bout du cours ! Un dernier résumé et un quiz final sur les quatre semaines.",
        'slides': [
          {'kind': 'timeline', 'title': 'La vie de Bach en un coup d’œil', 'rows': [
              ('1685', 'Naissance à Eisenach le 21 mars'),
              ('1695', 'Orphelin – part chez son frère à Ohrdruf'),
              ('1703', 'Organiste à Arnstadt'),
              ('1708', 'Organiste de la cour à Weimar'),
              ('1717', 'Maître de chapelle à Köthen'),
              ('1723', 'Cantor de Saint-Thomas à Leipzig'),
              ('1750', 'Mort à Leipzig le 28 juillet')]},
        ],
        'quiz': [
          ('Quel était le poste de Bach à Leipzig ?', ['Directeur d’opéra', 'Cantor de Saint-Thomas et directeur de la musique de la ville', 'Organiste de la cour du roi', 'Professeur à l’université'], 1),
          ('Environ combien de cantates d’église de Bach sont conservées ?', ['20', '200', '600', '1 000'], 1),
          ('Qui dirigea en 1829 la célèbre reprise de la Passion selon saint Matthieu ?', ['Beethoven', 'Felix Mendelssohn', 'Mozart', 'Brahms'], 1),
          ('Comment les Variations Goldberg sont-elles construites ?', ['Quatre mouvements', 'Une aria, 30 variations et l’aria reprise', '24 préludes et fugues', 'Six concertos'], 1),
          ('Quel roi donna à Bach le thème de L’Offrande musicale ?', ['Louis XIV', 'Frédéric le Grand', 'George II', 'Auguste le Fort'], 1),
          ('En quelle année Bach est-il mort ?', ['1723', '1741', '1750', '1791'], 2),
        ],
      },
    ],
  },
]
