# Beethoven - version française de beethoven.py.
SITE = 'https://mymusic.coach'
EROICA = f'{SITE}/api/library/items/cmuygtj1r00jr4kktm2vrvx1p/files/0.audio'
EGMONT = f'{SITE}/api/library/items/cmuygtj1o00jn4kktbx3ydpyk/files/0.audio'

COURSE = {
    'slug': 'beethoven-vie-et-oeuvre-introduction',
    'language': 'fr',
    'translationOf': 'beethoven-life-and-music-introduction',
    'title': 'Beethoven : vie et œuvre – Une première introduction',
    'shortSummary': 'Quatre semaines avec Ludwig van Beethoven : d’une enfance difficile à Bonn jusqu’à la Neuvième Symphonie – sa vie, sa surdité et la musique qui a tout changé.',
    'description': (
        "Ludwig van Beethoven (1770–1827) est l’un des compositeurs les plus célèbres de tous les temps – et l’un des plus surprenants. "
        "Vedette du piano à Vienne, il perdit l’ouïe avant ses trente ans et écrivit pourtant une musique qui sonne encore neuve deux siècles plus tard.\n\n"
        "En quatre semaines, vous suivez sa vie pas à pas :\n"
        "- Semaine 1 – Bonn : une enfance musicale (1770–1792)\n"
        "- Semaine 2 – Vienne : le jeune virtuose du piano (1792–1802)\n"
        "- Semaine 3 – Crise et héroïsme : la surdité, l’Eroica et la Cinquième (1802–1814)\n"
        "- Semaine 4 – Les dernières années et la Neuvième Symphonie (1815–1827)\n\n"
        "Chaque semaine associe des diapositives illustrées, de courtes vidéos, des enregistrements à écouter et des partitions de la bibliothèque mymusic.coach, "
        "suivis d’un court quiz. Aucune connaissance préalable n’est nécessaire – juste de la curiosité et un casque. Comptez environ 1 à 2 heures par semaine."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin'],
    'musicStyles': ['Classical', 'Romantic'],
    'cover': {'image': 'beethoven_stieler', 'title': 'Beethoven', 'subtitle': 'Vie et œuvre – Une première introduction', 'tag': 'Cours de 4 semaines'},
}

FOOTER = 'Beethoven : vie et œuvre'

WEEKS = [
  {
    'title': 'Semaine 1 – Bonn : une enfance musicale (1770–1792)',
    'lessons': [
      {
        'title': 'Bienvenue : à la rencontre de Beethoven',
        'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': (
            "Bienvenue dans ce cours ! Cette première leçon vous donne un aperçu des quatre semaines à venir et une première image de l’homme "
            "derrière le célèbre visage sévère. Parcourez les diapositives à votre rythme.\n\n"
            "Astuce : chaque morceau cité dans le cours est lié depuis les leçons – vous pouvez l’ouvrir dans la bibliothèque, "
            "le marquer comme favori et gagner des XP supplémentaires en lisant ou en écoutant jusqu’au bout."
        ),
        'slides': [
          {'kind': 'title', 'week': 'Semaine 1', 'title': 'À la rencontre de Ludwig van Beethoven', 'subtitle': 'Une première introduction à sa vie et à sa musique', 'image': 'beethoven_stieler', 'credit': 'Portrait par Joseph Karl Stieler, 1820 (domaine public)'},
          {'kind': 'bullets', 'title': 'Pourquoi Beethoven ?', 'bullets': [
              'Né à Bonn en 1770 – mort à Vienne en 1827',
              'Un pianiste célébré, devenu le compositeur le plus admiré de son temps',
              'Il perdit l’ouïe – et continua de composer pendant 25 ans',
              'Il fit le pont entre deux époques : le style classique de Haydn et Mozart et le romantisme naissant',
              'Sa musique est jouée chaque jour quelque part dans le monde']},
          {'kind': 'timeline', 'title': 'Vos quatre semaines', 'rows': [
              ('Semaine 1', 'Bonn – une enfance musicale (1770–1792)'),
              ('Semaine 2', 'Vienne – le jeune virtuose du piano (1792–1802)'),
              ('Semaine 3', 'Crise et héroïsme – surdité, Eroica, Cinquième Symphonie'),
              ('Semaine 4', 'Les dernières années et la Neuvième Symphonie (1815–1827)')]},
          {'kind': 'bullets', 'title': 'Comment fonctionne ce cours', 'bullets': [
              'Des diapositives comme celles-ci expliquent l’histoire et la musique',
              'Des vidéos vous montrent de grands orchestres et pianistes',
              'Des enregistrements et partitions de la bibliothèque mymusic.coach pour aller plus loin',
              'Un court quiz à la fin de chaque semaine – vous gagnez des XP au fil du cours',
              'Marquez chaque leçon comme terminée une fois finie']},
          {'kind': 'quote', 'quote': 'La musique est une révélation plus haute que toute sagesse et toute philosophie.', 'by': 'Attribué à Ludwig van Beethoven (rapporté par Bettina von Arnim)'},
        ],
      },
      {
        'title': 'Grandir à Bonn',
        'type': 'SLIDES', 'minutes': 15,
        'description': (
            "Beethoven ne fut pas un enfant prodige insouciant. Son père le poussait durement, sa famille peinait à joindre les deux bouts, "
            "et à 16 ans il perdit sa mère. Ces diapositives racontent ses 22 premières années à Bonn – et les personnes qui crurent en lui."
        ),
        'slides': [
          {'kind': 'image', 'title': 'Bonn, décembre 1770', 'text': 'Ludwig van Beethoven fut baptisé le 17 décembre 1770 à Bonn, alors capitale de l’électorat de Cologne. Sa famille vivait dans cette maison de la Bonngasse – aujourd’hui le musée Beethoven-Haus.', 'image': 'bonn_house', 'credit': 'Photo : Sir James, CC BY-SA 3.0, via Wikimedia Commons'},
          {'kind': 'bullets', 'title': 'Une famille de musiciens de cour', 'bullets': [
              'Son grand-père, lui aussi prénommé Ludwig, était maître de chapelle à la cour de Bonn',
              'Son père Johann était ténor à la chapelle de la cour – et un professeur strict, souvent dur',
              'Johann espérait exhiber son fils comme un « second Mozart »',
              'Le jeune Ludwig donna son premier concert public à Cologne en mars 1778, à sept ans']},
          {'kind': 'bullets', 'title': 'Un vrai professeur : Christian Gottlob Neefe', 'bullets': [
              'L’organiste de la cour Neefe devint le professeur de Beethoven vers 1781',
              'Il lui fit travailler « Le Clavier bien tempéré » de Bach – la meilleure école pour un claviériste',
              'En 1782, la première composition de Beethoven fut imprimée : des variations sur une marche de Dressler',
              'Il devint bientôt organiste adjoint et joua de l’alto dans l’orchestre de la cour']},
          {'kind': 'timeline', 'title': 'Grandir vite', 'rows': [
              ('1778', 'Premier concert public à Cologne'),
              ('1782', 'Première œuvre publiée'),
              ('1787', 'Bref voyage à Vienne – sa mère tombe malade, il rentre en hâte ; elle meurt en juillet'),
              ('1789', 'Il prend en charge ses deux jeunes frères'),
              ('1792', 'Il quitte Bonn pour Vienne – pour toujours')]},
          {'kind': 'quote', 'quote': 'Par un travail assidu, vous recevrez l’esprit de Mozart des mains de Haydn.', 'by': 'Le comte Ferdinand Waldstein, dans l’album d’adieu de Beethoven, octobre 1792'},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Né à Bonn en 1770 dans une famille de musiciens de cour',
              'Une enfance difficile avec un père exigeant',
              'Neefe lui donna une solide formation musicale',
              'Des amis comme le comte Waldstein l’envoyèrent étudier à Vienne auprès de Haydn']},
        ],
      },
      {
        'title': 'Vidéo : la vie de Beethoven et ses lieux',
        'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=yl7HqahLCDk',
        'description': (
            "Ce documentaire vous emmène sur les lieux où Beethoven a vécu et travaillé – de Bonn à Vienne. "
            "La vidéo est en anglais – activez si besoin les sous-titres automatiques de YouTube.\n\n"
            "Pendant le visionnage, cherchez :\n"
            "1. Quelles personnes ont soutenu le jeune Beethoven à Bonn ?\n"
            "2. Comment sa vie a-t-elle changé quand il s’est installé à Vienne ?\n"
            "3. Quand a-t-il remarqué ses premiers problèmes d’audition ?\n\n"
            "Pas besoin de tout retenir – les semaines suivantes reviennent en détail sur chaque partie de l’histoire."
        ),
      },
      {
        'title': 'Bilan de la semaine 1 et quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Un court résumé de la semaine 1, puis cinq questions. Prenez votre temps – vous pouvez refaire le quiz si vous le souhaitez.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 1 en bref', 'bullets': [
              'Baptisé à Bonn le 17 décembre 1770',
              'Son père Johann : ambitieux et sévère',
              'Son professeur Neefe : Bach, l’orgue, une première publication en 1782',
              'Sa mère mourut en 1787 – Beethoven devint chef de famille',
              '1792 : départ pour Vienne, pour étudier avec Joseph Haydn']},
          {'kind': 'bullets', 'title': 'À écouter cette semaine', 'bullets': [
              'Ouvrez « Für Elise » (Lettre à Élise) dans la bibliothèque et suivez la partition – Beethoven l’écrivit bien plus tard (1810), mais c’est la première pièce idéale à explorer',
              'Essayez les Sept Variations WoO 78 – les variations étaient la façon préférée du jeune Beethoven de briller au piano']},
        ],
        'library': [('cmuygw9ct01vp4kkttmshx9kc', 'Une première partition à explorer – suivez-la en écoutant un enregistrement'), ('cmuygw9cu01vq4kkt3n10qs6q', 'Variations : comment le jeune Beethoven brillait au piano'), ('cmv2iui6i00bc12ifvera3oo4', 'Enregistrement historique : le Menuet en sol, joué par la violoniste Maud Powell en 1916')],
        'quiz': [
          ('Dans quelle ville Beethoven est-il né ?', ['Vienne', 'Bonn', 'Salzbourg', 'Leipzig'], 1),
          ('Quel était le poste du grand-père de Beethoven ?', ['Maître de chapelle à la cour de Bonn', 'Facteur de pianos', 'Chanteur d’opéra à Vienne', 'Organiste à Leipzig'], 0),
          ('Quel professeur fit découvrir au jeune Beethoven « Le Clavier bien tempéré » de Bach ?', ['Joseph Haydn', 'Antonio Salieri', 'Christian Gottlob Neefe', 'Wolfgang Amadeus Mozart'], 2),
          ('Pourquoi Beethoven rentra-t-il en hâte de Vienne en 1787 ?', ['Il n’avait plus d’argent', 'Sa mère était gravement malade', 'Le prince-électeur le rappelait', 'Il avait échoué à une audition'], 1),
          ('Avec qui Beethoven devait-il étudier en s’installant à Vienne en 1792 ?', ['Joseph Haydn', 'Jean-Sébastien Bach', 'Franz Schubert', 'Christoph Willibald Gluck'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 2 – Vienne : le jeune virtuose (1792–1802)',
    'lessons': [
      {
        'title': 'Une vedette du piano à Vienne',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Vienne était la capitale musicale de l’Europe. En quelques années, le jeune homme de Bonn devint son pianiste le plus passionnant – et un compositeur dont on parlait.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 2', 'title': 'Vienne : le jeune virtuose', 'subtitle': '1792 – 1802', 'image': 'beethoven_young', 'credit': 'Beethoven en 1801, gravure de Carl Traugott Riedel (domaine public)'},
          {'kind': 'bullets', 'title': 'Leçons avec les maîtres', 'bullets': [
              'Beethoven arriva à Vienne en novembre 1792',
              'Il prit des leçons avec Joseph Haydn – et, en secret, avec d’autres professeurs',
              'Plus tard, il étudia le contrepoint avec Albrechtsberger et l’écriture vocale italienne avec Salieri',
              'Haydn était fier de lui, mais les deux fortes personnalités ne s’entendaient pas toujours']},
          {'kind': 'bullets', 'title': 'Des amis dans la noblesse', 'bullets': [
              'À Vienne, la musique se faisait dans les salons de l’aristocratie',
              'Le prince Karl Lichnowsky offrit à Beethoven un logement et une pension annuelle',
              'Beethoven devint célèbre pour ses improvisations – et remporta plusieurs « duels » pianistiques',
              'Il se comportait d’égal à égal avec les princes – chose rare pour un musicien de l’époque']},
          {'kind': 'timeline', 'title': 'Premiers succès', 'rows': [
              ('1795', 'Trois trios avec piano publiés comme Opus 1 – un grand succès'),
              ('1795', 'Premier concert public à Vienne'),
              ('1799', 'Sonate pour piano « Pathétique », op. 13'),
              ('1800', 'Création de la Première Symphonie'),
              ('1801', 'Sonate pour piano op. 27 n° 2 – plus tard surnommée « Clair de lune »')]},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Vienne 1792 : études avec Haydn et d’autres',
              'Soutenu par des mécènes aristocrates comme le prince Lichnowsky',
              'D’abord célèbre comme pianiste et improvisateur, puis comme compositeur',
              'En 1800 : sonates pour piano, musique de chambre, une première symphonie']},
        ],
      },
      {
        'title': 'Écouter : la Sonate « Pathétique »',
        'type': 'YOUTUBE', 'minutes': 15, 'video': 'https://www.youtube.com/watch?v=hcczxDKkYhU',
        'description': (
            "La Sonate pour piano n° 8 en ut mineur, op. 13 – publiée en 1799 sous le titre « Grande Sonate pathétique » – rendit le jeune Beethoven célèbre dans toute l’Europe. "
            "Le pianiste Fabian Müller en joue le premier mouvement.\n\n"
            "Écoutez :\n"
            "1. Les accords lents et lourds du début (Grave) – comme un rideau dramatique qui s’ouvre\n"
            "2. Le passage soudain à un Allegro rapide et agité\n"
            "3. Le retour de l’introduction lente – deux fois ! – avant la fin du mouvement\n\n"
            "Ouvrez ensuite la partition de la bibliothèque ci-dessous et suivez les premières mesures : voyez-vous comme les premiers accords sont denses ?"
        ),
        'library': [('cmuygw9af01u44kktp3bdmamc', 'La partition du premier mouvement – suivez les accords du début'), ('cmuygw9ag01u64kktocu8ro7g', 'Le célèbre deuxième mouvement lent'), ('cmv2incvt000q12ifkpjahud0', 'Un enregistrement centenaire : le mouvement lent arrangé pour violon, Marjorie Hayward (1921)')],
      },
      {
        'title': 'La Sonate « Clair de lune »',
        'type': 'SLIDES', 'minutes': 12,
        'description': "Sans doute la pièce pour piano la plus célèbre jamais écrite – mais Beethoven ne l’a jamais appelée « Clair de lune ». Ces diapositives expliquent d’où vient ce nom et ce qui rend cette musique si particulière.",
        'slides': [
          {'kind': 'bullets', 'title': 'Sonate « quasi una fantasia »', 'bullets': [
              'Sonate pour piano n° 14 en ut dièse mineur, op. 27 n° 2, écrite en 1801',
              'Beethoven l’appela une sonate « presque comme une fantaisie » – libre et inhabituelle dans sa forme',
              'Dédiée à sa jeune élève, la comtesse Giulietta Guicciardi',
              'Le nom « Clair de lune » vient du critique Ludwig Rellstab – en 1832, après la mort de Beethoven']},
          {'kind': 'listen', 'title': 'Guide d’écoute : premier mouvement', 'work': 'Adagio sostenuto', 'points': [
              'De doux triolets qui coulent du début à la fin – « comme un lac au clair de lune », écrivit Rellstab',
              'Une mélodie simple et triste flotte au-dessus',
              'Les notes graves de la basse donnent à la musique sa couleur sombre',
              'Beethoven demande la pédale forte – le son doit être doux et estompé']},
          {'kind': 'bullets', 'title': 'Une fin surprenante', 'bullets': [
              'Au premier mouvement calme succède un court Allegretto léger',
              'Le finale (Presto agitato) est une tempête – rapide, fort et dramatique',
              'Au lieu de l’ordre rapide-lent-rapide, la sonate va du calme à la fureur']},
          {'kind': 'summary', 'title': 'À vous de jouer', 'bullets': [
              'Ouvrez la partition dans la bibliothèque et observez le motif de triolets aux deux mains',
              'Écoutez le premier mouvement et comptez les triolets : 1-2-3, 1-2-3 …',
              'Pianistes : le début est jouable dès le début du niveau intermédiaire – demandez à votre professeur !']},
        ],
        'library': [('cmuygw9ap01ui4kktgbansj59', 'Premier mouvement – suivez les triolets'), ('cmuygw9ao01uh4kktal1dz7ue', 'La sonate complète')],
      },
      {
        'title': 'Bilan de la semaine 2 et quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des premières années viennoises de Beethoven, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 2 en bref', 'bullets': [
              'Vienne 1792 : leçons avec Haydn, Albrechtsberger et Salieri',
              'Des mécènes comme le prince Lichnowsky le soutenaient',
              'Opus 1 (1795) : trois trios avec piano',
              'Sonates « Pathétique » (1799) et « Clair de lune » (1801)',
              'Création de la Première Symphonie en 1800']},
        ],
        'quiz': [
          ('Quel compositeur célèbre donna des leçons à Beethoven à Vienne ?', ['Joseph Haydn', 'Johann Strauss', 'Franz Liszt', 'Felix Mendelssohn'], 0),
          ('Qui donna son surnom à la Sonate « Clair de lune » ?', ['Beethoven lui-même', 'Son éditeur en 1801', 'Le critique Ludwig Rellstab, après la mort de Beethoven', 'La comtesse Giulietta Guicciardi'], 2),
          ('Comment Beethoven appela-t-il la Sonate « Clair de lune » ?', ['Sonata quasi una fantasia', 'Sonate pathétique', 'Sonata appassionata', 'Sonate au clair de lune'], 0),
          ('Dans quelle tonalité est la Sonate « Pathétique » ?', ['Ut majeur', 'Ut mineur', 'Ré mineur', 'Mi bémol majeur'], 1),
          ('En 1800, Beethoven créa …', ['son unique opéra', 'sa Première Symphonie', 'sa Neuvième Symphonie', 'sa dernière sonate pour piano'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 3 – Crise et héroïsme (1802–1814)',
    'lessons': [
      {
        'title': 'Perdre l’ouïe : le Testament de Heiligenstadt',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Vers 28 ans, Beethoven s’aperçut qu’il devenait sourd. En 1802, il écrivit à ce sujet une lettre bouleversante – et décida de vivre pour son art.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 3', 'title': 'Crise et héroïsme', 'subtitle': '1802 – 1814', 'image': 'beethoven_maehler', 'credit': 'Portrait par Joseph Willibrord Mähler, 1804–1805 (domaine public)'},
          {'kind': 'bullets', 'title': 'Un musicien qui devient sourd', 'bullets': [
              'Dès 1798 environ, Beethoven entendit des sifflements et des bourdonnements dans ses oreilles',
              'Son audition se dégrada lentement – les médecins ne pouvaient rien',
              'Il le cacha pendant des années : un musicien sourd semblait impensable',
              'En 1802, son médecin l’envoya se reposer au village de Heiligenstadt, près de Vienne']},
          {'kind': 'image', 'title': 'Heiligenstadt, octobre 1802', 'text': 'Dans cette maison, Beethoven écrivit une longue lettre à ses frères Carl et Johann. Il ne l’envoya jamais – on la retrouva dans ses papiers après sa mort. On l’appelle aujourd’hui le « Testament de Heiligenstadt ».', 'image': 'heiligenstadt_house', 'credit': 'Photo : Michael Kranewitter, CC BY-SA 3.0, via Wikimedia Commons'},
          {'kind': 'quote', 'quote': 'Seul l’art m’a retenu. Ah, il me semblait impossible de quitter le monde avant d’avoir produit tout ce que je sentais en moi.', 'by': 'Testament de Heiligenstadt, 6 octobre 1802'},
          {'kind': 'summary', 'title': 'Un tournant', 'bullets': [
              'Beethoven choisit de continuer à vivre – pour sa musique',
              'Juste après la crise, sa musique devint plus audacieuse et plus vaste',
              'Les historiens appellent les années suivantes sa période « héroïque »']},
        ],
      },
      {
        'title': 'Écouter : la Symphonie « Eroica »',
        'type': 'AUDIO', 'minutes': 16, 'video': EROICA,
        'description': (
            "La Symphonie n° 3 en mi bémol majeur, op. 55 – l’« Eroica » (1803–1804) – était plus longue et plus audacieuse que toutes les symphonies précédentes. "
            "Beethoven voulait d’abord la dédier à Napoléon Bonaparte. Quand Napoléon se couronna empereur en 1804, "
            "Beethoven – selon son élève Ferdinand Ries – déchira la page de titre avec colère. La symphonie parut finalement "
            "« pour célébrer le souvenir d’un grand homme ».\n\n"
            "Vous entendez ici le premier mouvement (Allegro con brio), joué par le Czech National Symphony Orchestra (Musopen, domaine public).\n\n"
            "Écoutez :\n"
            "1. Deux accords brefs et forts tout au début – comme quelqu’un qui frappe à la porte\n"
            "2. Le thème principal aux violoncelles, construit sur un simple accord arpégé\n"
            "3. Des accords durs et heurtés au milieu du mouvement – Beethoven voulait faire sentir une lutte\n\n"
            "La symphonie complète, avec ses quatre mouvements, est dans la bibliothèque ci-dessous."
        ),
        'library': [('cmuygtj1r00jr4kktm2vrvx1p', 'L’« Eroica » complète – les quatre mouvements')],
      },
      {
        'title': 'Vidéo : la Symphonie n° 5',
        'type': 'YOUTUBE', 'minutes': 35, 'video': 'https://www.youtube.com/watch?v=9aDEq3u5huA',
        'description': (
            "Pa-pa-pa-pam ! Le début de la Cinquième Symphonie (1808) est le motif de quatre notes le plus célèbre de la musique. "
            "Regardez l’Orchestre philharmonique de Berlin et Herbert von Karajan jouer la symphonie entière.\n\n"
            "Écoutez :\n"
            "1. Combien de fois le rythme brève-brève-brève-longue revient dans le premier mouvement\n"
            "2. Le passage doux et mystérieux qui mène sans interruption au dernier mouvement\n"
            "3. Le finale éclatant en ut majeur – de l’ombre à la lumière\n\n"
            "La Cinquième fut créée le 22 décembre 1808 à Vienne, lors d’un concert d’environ quatre heures – "
            "avec la Sixième Symphonie (« Pastorale ») et le Quatrième Concerto pour piano."
        ),
        'library': [('cmuygw9az01v34kktsjuawo4n', 'Partition du premier mouvement – repérez le motif de quatre notes'), ('cmuygw9b001v54kktkgrbtz51', 'La symphonie entière arrangée pour piano')],
      },
      {
        'title': 'Bilan de la semaine 3 et quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années héroïques, un enregistrement bonus et le quiz de la semaine 3.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 3 en bref', 'bullets': [
              'Dès 1798 environ : Beethoven perd peu à peu l’ouïe',
              '1802 : le Testament de Heiligenstadt – il choisit de vivre pour son art',
              '1804 : l’« Eroica » – d’abord destinée à Napoléon',
              '1808 : Cinquième et Sixième Symphonies créées le même soir',
              '1805–1814 : son unique opéra, « Fidelio », sur le courage et la liberté']},
          {'kind': 'bullets', 'title': 'Écoute bonus', 'bullets': [
              'L’ouverture d’Egmont (1810) est dans la bibliothèque – une musique pour la pièce de Goethe sur un héros qui combat pour la liberté',
              'Écoutez le début sombre et lent et la fin triomphale']},
        ],
        'library': [('cmuygtj1o00jn4kktbx3ydpyk', 'Bonus : l’ouverture d’Egmont'), ('cmuygw9b101va4kktcabhhrvp', 'Un air de Fidelio, son unique opéra')],
        'quiz': [
          ('Qu’est-ce que le « Testament de Heiligenstadt » ?', ['Une symphonie', 'Une lettre à ses frères sur sa surdité', 'Un contrat avec son éditeur', 'Une église de Vienne'], 1),
          ('À qui Beethoven voulait-il d’abord dédier l’« Eroica » ?', ['Napoléon Bonaparte', 'Joseph Haydn', 'Le prince Lichnowsky', 'L’empereur François'], 0),
          ('Quel rythme ouvre la Cinquième Symphonie ?', ['Longue-longue-brève', 'Brève-brève-brève-longue', 'Longue-brève-longue-brève', 'Brève-longue-brève-longue'], 1),
          ('En quelle année les Cinquième et Sixième Symphonies furent-elles créées ?', ['1792', '1800', '1808', '1824'], 2),
          ('Comment s’appelle l’unique opéra de Beethoven ?', ['Don Giovanni', 'Fidelio', 'Egmont', 'La Flûte enchantée'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 4 – Les dernières années et la Neuvième (1815–1827)',
    'lessons': [
      {
        'title': 'La musique du silence',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Dans ses dernières années, Beethoven était presque totalement sourd. Il conversait par écrit avec ses visiteurs – et composa certaines des œuvres les plus profondes jamais écrites.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 4', 'title': 'Les dernières années', 'subtitle': '1815 – 1827', 'image': 'beethoven_stieler', 'credit': 'Portrait par Joseph Karl Stieler, 1820 (domaine public)'},
          {'kind': 'bullets', 'title': 'Une vie difficile', 'bullets': [
              'À partir de 1818 environ, les visiteurs écrivaient leurs questions dans des « cahiers de conversation » – environ 140 sont conservés',
              'Après la mort de son frère Carl (1815), il mena une longue bataille juridique pour élever son neveu Karl',
              'Il déménageait souvent, se querellait avec ses domestiques – et s’inquiétait pour l’argent',
              'Pourtant, il composait lentement, soigneusement et avec une immense ambition']},
          {'kind': 'bullets', 'title': 'Les chefs-d’œuvre tardifs', 'bullets': [
              'Les cinq dernières sonates pour piano, jusqu’à l’op. 111 (1822)',
              'La « Missa solemnis », une immense mise en musique de la messe catholique (1823)',
              'La Neuvième Symphonie avec chœur (1824)',
              'Les derniers quatuors à cordes (1825–1826) – une musique si nouvelle que beaucoup d’auditeurs restèrent perplexes']},
          {'kind': 'image', 'title': 'Vienne, 7 mai 1824', 'text': 'La Neuvième Symphonie fut créée au Kärntnertortheater. Beethoven se tenait à côté du chef. À la fin, il ne pouvait pas entendre les applaudissements – la chanteuse Caroline Unger le fit se retourner pour qu’il voie le public en liesse.', 'image': 'kaerntnertor', 'credit': 'Le Kärntnertortheater, Vienne, 1830 (domaine public)'},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Presque totalement sourd : les cahiers de conversation',
              'Œuvres tardives : Missa solemnis, dernières sonates et derniers quatuors',
              'Création de la Neuvième le 7 mai 1824 à Vienne']},
        ],
      },
      {
        'title': 'Vidéo : l’« Ode à la joie »',
        'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=q0EjVVjJraA',
        'description': (
            "Pour le dernier mouvement de sa Neuvième Symphonie, Beethoven fit ce que personne n’avait fait avant lui : il ajouta des chanteurs et un chœur. "
            "Les paroles sont le poème de Friedrich Schiller « An die Freude » (Ode à la joie) : « Alle Menschen werden Brüder » – tous les hommes deviennent frères.\n\n"
            "Écoutez :\n"
            "1. L’orchestre cite d’abord des passages des mouvements précédents – et les rejette\n"
            "2. La célèbre mélodie de la joie, d’abord tout doucement aux violoncelles et contrebasses\n"
            "3. Un baryton solo qui chante « O Freunde, nicht diese Töne ! » – « Ô amis, pas ces sons-là ! »\n\n"
            "Le saviez-vous ? Depuis 1985, la mélodie de la joie est l’hymne officiel de l’Union européenne."
        ),
      },
      {
        'title': 'L’héritage de Beethoven',
        'type': 'SLIDES', 'minutes': 12,
        'description': "Beethoven mourut en 1827 – et devint une légende. Pourquoi sa musique compte-t-elle encore aujourd’hui ?",
        'slides': [
          {'kind': 'image', 'title': 'Vienne, 29 mars 1827', 'text': 'Beethoven mourut le 26 mars 1827. Trois jours plus tard, des milliers de personnes suivirent son cortège funèbre à travers Vienne. Parmi les porteurs de flambeau se trouvait un jeune compositeur : Franz Schubert.', 'image': 'beethoven_funeral', 'credit': 'Le cortège funèbre de Beethoven, Franz Xaver Stöber, 1827 (domaine public)'},
          {'kind': 'bullets', 'title': 'Ce que Beethoven a changé', 'bullets': [
              'Le compositeur comme artiste, et non comme serviteur : il écrivait ce qu’il voulait écrire',
              'Des formes plus vastes : symphonies, sonates et quatuors plus longs',
              'Une musique qui raconte une histoire – de la lutte à la victoire',
              'Les compositeurs après lui – Brahms, Wagner, Mahler – se mesurèrent à lui']},
          {'kind': 'bullets', 'title': 'Beethoven aujourd’hui', 'bullets': [
              'L’« Ode à la joie » est l’hymne de l’Europe',
              'Le début de la Cinquième Symphonie est connu dans le monde entier',
              '« Für Elise » est l’une des premières pièces apprises par beaucoup d’élèves pianistes',
              'Sa musique résonne dans les salles de concert, les films, les écoles – et aux Jeux olympiques']},
          {'kind': 'summary', 'title': 'Pour aller plus loin', 'bullets': [
              'Explorez les partitions et enregistrements de Beethoven dans la bibliothèque mymusic.coach',
              'Continuez avec « Franz Schubert : vie et lieder » – le compositeur qui porta un flambeau à ses funérailles',
              'Ou réservez une leçon avec votre professeur et jouez votre premier morceau de Beethoven']},
        ],
              'library': [('cmv2iqckr004212ifexdxgvnx', 'Beethoven dans les années 1910 : Jascha Heifetz joue le « Chœur des derviches » (1917)'), ('cmuygtj1r00jr4kktm2vrvx1p', 'L’« Eroica » à nouveau – maintenant que vous connaissez toute l’histoire')],
      },
      {
        'title': 'Bilan final et quiz',
        'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Félicitations – vous êtes arrivé au bout du cours ! Un dernier résumé et un quiz final sur les quatre semaines.",
        'slides': [
          {'kind': 'timeline', 'title': 'La vie de Beethoven en un coup d’œil', 'rows': [
              ('1770', 'Baptisé à Bonn le 17 décembre'),
              ('1792', 'S’installe à Vienne, étudie avec Haydn'),
              ('1802', 'Testament de Heiligenstadt'),
              ('1804', 'Symphonie « Eroica »'),
              ('1808', 'Cinquième et Sixième Symphonies'),
              ('1824', 'Création de la Neuvième Symphonie'),
              ('1827', 'Mort à Vienne le 26 mars')]},
          {'kind': 'quote', 'quote': 'Je veux saisir le destin à la gorge ; il ne parviendra certainement pas à me faire plier tout à fait.', 'by': 'Beethoven dans une lettre à son ami Franz Wegeler, novembre 1801'},
        ],
        'quiz': [
          ('Quel âge avait Beethoven quand il s’installa définitivement à Vienne ?', ['Environ 12 ans', 'Environ 22 ans', 'Environ 32 ans', 'Environ 42 ans'], 1),
          ('Comment ses visiteurs conversaient-ils avec Beethoven dans ses dernières années ?', ['En langue des signes', 'Par écrit, dans des cahiers de conversation', 'Uniquement par l’intermédiaire de son neveu', 'Uniquement avec un cornet acoustique'], 1),
          ('Qu’avait de nouveau la Neuvième Symphonie ?', ['Elle était écrite pour piano', 'Des chanteurs et un chœur dans le dernier mouvement', 'Un seul mouvement', 'C’était sa première symphonie'], 1),
          ('Le poème de qui est chanté dans l’« Ode à la joie » ?', ['Goethe', 'Schiller', 'Heine', 'Müller'], 1),
          ('Quel compositeur porta un flambeau aux funérailles de Beethoven ?', ['Franz Schubert', 'Joseph Haydn', 'Richard Wagner', 'Johannes Brahms'], 0),
          ('Depuis 1985, la mélodie de l’« Ode à la joie » est …', ['l’hymne de l’Union européenne', 'l’hymne de l’Allemagne', 'l’hymne olympique', 'l’hymne de l’Autriche'], 0),
        ],
      },
    ],
  },
]
