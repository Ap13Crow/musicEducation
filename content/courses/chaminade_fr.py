# Cécile Chaminade - version française de chaminade.py.
COURSE = {
    'slug': 'chaminade-vie-et-oeuvre-introduction',
    'language': 'fr',
    'translationOf': 'chaminade-life-and-music-introduction',
    'title': 'Cécile Chaminade : vie et œuvre – Une première introduction',
    'shortSummary': 'Quatre semaines avec Cécile Chaminade : une pianiste-compositrice parisienne dont la musique se vendit à des centaines de milliers d’exemplaires, qui fit une tournée en Amérique et fut la première compositrice décorée de la Légion d’honneur.',
    'description': (
        "Cécile Chaminade (1857–1944) fut l’une des compositrices les plus célèbres de son temps : ses pièces pour piano et ses mélodies étaient dans tous les foyers, "
        "des centaines de « Chaminade Clubs » se réunissaient en Amérique, et elle joua pour la reine Victoria. Puis elle tomba presque dans l’oubli.\n\n"
        "En quatre semaines, vous suivez sa vie pas à pas :\n"
        "- Semaine 1 – Une enfance parisienne : « mon petit Mozart » (1857–1880)\n"
        "- Semaine 2 – Ballet, Konzertstück et études de concert (1880–1892)\n"
        "- Semaine 3 – Mélodies, Angleterre et Concertino (1892–1907)\n"
        "- Semaine 4 – L’Amérique, la Légion d’honneur et la redécouverte (1908–1944)\n\n"
        "Chaque semaine associe des diapositives illustrées, des vidéos (France Musique, Emmanuel Pahud avec l’Orchestre de la Radio de Munich), des disques des années 1920 "
        "avec Fritz Kreisler issus de la bibliothèque mymusic.coach, des partitions interactives de ses mélodies et un court quiz. Aucune connaissance préalable n’est nécessaire. "
        "Comptez environ 1 à 2 heures par semaine."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Flute', 'Voice'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'chaminade_portrait', 'title': 'Cécile Chaminade', 'subtitle': 'Vie et œuvre – Une première introduction', 'tag': 'Cours de 4 semaines'},
}
FOOTER = 'Cécile Chaminade : vie et œuvre'
PORTRAIT = {'image': 'chaminade_portrait', 'credit': 'Cécile Chaminade, photographie, 1913 (domaine public)'}
YOUNG = {'image': 'chaminade_young', 'credit': 'Photographie de H. S. Mendelssohn, Londres, 1890 (domaine public)'}
SCARF = 'cmv2j70x6011012ifhfctd2w7'
FLATTERER = 'cmv2j7098010y12ifgv210i3o'
SERENADE = 'cmv2ixxlm00i212if0ykwfcf1'
PIERRETTE = 'cmv2ivpas00do12ifn83m4zsw'

WEEKS = [
  {
    'title': 'Semaine 1 – Une enfance parisienne : « mon petit Mozart » (1857–1880)',
    'lessons': [
      {
        'title': 'Bienvenue : à la rencontre de Cécile Chaminade', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Bienvenue dans ce cours ! Découvrez Cécile Chaminade – pianiste, compositrice et célébrité internationale – et voyez comment se déroulent les quatre prochaines semaines.\n\nAstuce : ses mélodies sont dans la bibliothèque mymusic.coach sous forme de partitions interactives, et sa musique pour piano sur des disques des années 1920 – marquez vos favoris et gagnez des XP supplémentaires en lisant ou en écoutant jusqu’au bout.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 1', 'title': 'À la rencontre de Cécile Chaminade', 'subtitle': 'Une première introduction à sa vie et à sa musique', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Pourquoi Chaminade ?', 'bullets': [
              'Née à Paris en 1857 – morte à Monte-Carlo en 1944',
              'Environ 400 œuvres : pièces pour piano, plus de 100 mélodies, un ballet, un opéra, un concertino pour flûte',
              'L’une des compositrices les plus vendues de son temps, en Europe comme en Amérique',
              'Une pianiste de concert qui partit en tournée avec sa propre musique pendant plus de 30 ans',
              'En 1913, première compositrice nommée chevalier de la Légion d’honneur']},
          {'kind': 'timeline', 'title': 'Vos quatre semaines', 'rows': [
              ('Semaine 1', 'Une enfance parisienne : « mon petit Mozart »'),
              ('Semaine 2', 'Ballet, Konzertstück et études de concert'),
              ('Semaine 3', 'Mélodies, Angleterre et Concertino'),
              ('Semaine 4', 'L’Amérique, la Légion d’honneur et la redécouverte')]},
          {'kind': 'bullets', 'title': 'La musique à la maison', 'bullets': [
              'Vers 1900, presque chaque foyer bourgeois possédait un piano',
              'Les éditeurs vendaient d’énormes quantités de courtes pièces pour piano et de mélodies pour amateurs',
              'Chaminade écrivit exactement cette musique – élégante, mélodieuse, pas trop difficile',
              'Elle la rendit célèbre et riche – et lui valut plus tard le mépris des critiques pour la « musique de salon »']},
        ],
      },
      {
        'title': 'Une enfant douée à Paris', 'type': 'SLIDES', 'minutes': 15,
        'description': "Son père ne voulait pas qu’elle étudie au Conservatoire. Un voisin célèbre remarqua son talent.",
        'slides': [
          {'kind': 'bullets', 'title': 'Paris, 8 août 1857', 'bullets': [
              'Cécile Louise Stéphanie Chaminade naquit dans une famille parisienne aisée',
              'Sa mère, pianiste et chanteuse, lui donna ses premières leçons',
              'Elle composa de petites pièces – dont de la musique religieuse – dès l’âge de huit ans environ',
              'Son père travaillait pour une compagnie d’assurances et jouait du violon en amateur']},
          {'kind': 'bullets', 'title': '« Mon petit Mozart »', 'bullets': [
              'La famille passait l’été au Vésinet, près de Paris, où Georges Bizet – le compositeur de « Carmen » – était son voisin',
              'Bizet, charmé par sa musique, l’aurait appelée « mon petit Mozart »',
              'Félix Le Couppey, professeur au Conservatoire, conseilla qu’elle y étudie',
              'Son père refusa : le Conservatoire n’était pas un lieu convenable pour une jeune fille de son milieu']},
          {'kind': 'bullets', 'title': 'Des leçons particulières à la place', 'bullets': [
              'Elle étudia en privé avec des professeurs du Conservatoire',
              'Le piano avec Félix Le Couppey, l’harmonie et le contrepoint avec Augustin Savard',
              'La composition avec Benjamin Godard, compositeur à succès de l’époque',
              'Une excellente formation – mais sans les diplômes et les prix qui ouvraient les portes aux hommes']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Née le 8 août 1857 à Paris',
              'Premières leçons avec sa mère ; elle compose dès huit ans environ',
              'Le « petit Mozart » de Bizet – mais pas de Conservatoire, par la volonté de son père',
              'Leçons particulières avec Le Couppey, Savard et Godard']},
        ],
      },
      {
        'title': 'Vidéo : Great Composers – Cécile Chaminade', 'type': 'YOUTUBE', 'minutes': 6, 'video': 'https://www.youtube.com/watch?v=n5K8UBhShV4',
        'description': "Une courte introduction de la série « Classical Nerd » : qui était Chaminade, jusqu’où alla sa célébrité – et pourquoi elle fut oubliée. La vidéo est en anglais – activez si besoin les sous-titres automatiques de YouTube.\n\nPendant le visionnage, cherchez :\n1. Qu’étaient les « Chaminade Clubs » ?\n2. Pourquoi les critiques dénigrèrent-ils plus tard sa musique ?\n3. Quelle pièce de Chaminade presque tous les flûtistes jouent-ils encore ?\n\nTout reviendra dans les semaines suivantes.",
      },
      {
        'title': 'Un premier concert – et quiz de la semaine 1', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "À la fin des années 1870, Chaminade commença à jouer en public. Un court résumé et cinq questions.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 1', 'title': 'Sur scène', 'subtitle': 'Une jeune pianiste-compositrice', **YOUNG},
          {'kind': 'bullets', 'title': 'Dans le monde du concert', 'bullets': [
              'À partir de la fin des années 1870, elle joua sa propre musique dans les concerts et les salons parisiens',
              'Sa musique fut bientôt imprimée par des éditeurs parisiens et jouée par d’autres pianistes',
              'En 1880, son Trio avec piano n° 1 fut joué par la respectée Société nationale de musique',
              'Elle fut toujours sa meilleure interprète – pianiste et compositrice à la fois']},
          {'kind': 'summary', 'title': 'La semaine 1 en bref', 'bullets': [
              'Une enfance parisienne dans une famille musicienne',
              'Encouragée par Bizet, freinée par son père',
              'Une formation privée auprès de grands professeurs',
              'Dès la fin des années 1870, une pianiste qui joue sa propre musique']},
        ],
        'quiz': [
          ('Dans quelle ville Cécile Chaminade est-elle née ?', ['Lyon', 'Paris', 'Marseille', 'Bruxelles'], 1),
          ('Quel compositeur l’aurait appelée « mon petit Mozart » ?', ['Gounod', 'Georges Bizet', 'Massenet', 'Debussy'], 1),
          ('Pourquoi n’étudia-t-elle pas au Conservatoire de Paris ?', ['Elle échoua à l’examen', 'Son père refusa', 'La loi l’interdisait aux femmes', 'Elle vivait à l’étranger'], 1),
          ('Qui lui enseigna la composition ?', ['Benjamin Godard', 'César Franck', 'Gabriel Fauré', 'Camille Saint-Saëns'], 0),
          ('Quel genre de musique rendit Chaminade célèbre ?', ['Des symphonies', 'De courtes pièces pour piano et des mélodies', 'Des messes', 'Des opéras'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 2 – Ballet, Konzertstück et études de concert (1880–1892)',
    'lessons': [
      {
        'title': 'Les grandes œuvres : la scène et l’orchestre', 'type': 'SLIDES', 'minutes': 15,
        'description': "Dans les années 1880, Chaminade écrivit ses plus grandes œuvres – pour la scène et pour l’orchestre.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 2', 'title': 'Ballet, Konzertstück et études', 'subtitle': '1880 – 1892', **YOUNG},
          {'kind': 'timeline', 'title': 'De grandes ambitions', 'rows': [
              ('1882', '« La Sévillane », opéra-comique, joué en privé chez sa famille à Paris'),
              ('1886', 'Six Études de concert, op. 35 – dont « Automne »'),
              ('1888', '« Callirhoë », ballet, créé à Marseille'),
              ('1888', 'Konzertstück pour piano et orchestre ; « Les Amazones », symphonie dramatique avec chœur')]},
          {'kind': 'bullets', 'title': '« Pas une femme qui compose »', 'bullets': [
              'Certains critiques louèrent ses grandes œuvres ; d’autres les trouvèrent « trop viriles » pour une femme',
              'Le compositeur Ambroise Thomas aurait dit : « Ce n’est pas une femme qui compose, c’est un compositeur qui est une femme »',
              'Les grandes œuvres étaient difficiles à faire jouer – surtout pour une femme sans poste officiel',
              'Les pièces courtes et les mélodies, elles, se vendaient – et elle en écrivit de plus en plus']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              '1882 : « La Sévillane » (opéra)',
              '1888 : « Callirhoë » (ballet), Konzertstück, « Les Amazones »',
              'Des grandes œuvres saluées – mais rarement jouées']},
        ],
      },
      {
        'title': 'Écouter : le Pas des écharpes', 'type': 'AUDIO', 'minutes': 5, 'libraryAudio': [SCARF, 0],
        'description': "Le ballet « Callirhoë » (1888) raconte une histoire de la Grèce antique. L’un de ses numéros, le « Pas des écharpes », devint l’une des pièces pour piano les plus vendues de son temps – imprimée dans d’innombrables éditions et arrangements.\n\nLe pianiste Hans Barth le joue ici sur un disque de 1924 (Library of Congress National Jukebox).\n\nÉcoutez :\n1. Une mélodie légère et balancée – des danseuses avec de longues écharpes\n2. De délicats ornements scintillants à la main droite\n3. Une courte partie centrale plus lyrique\n\nAussi dans la bibliothèque : « La Lisonjera » (La Flatteuse), une autre pièce favorite, jouée par Hans Barth.",
        'library': [(SCARF, 'Pas des écharpes (Callirhoë) – Hans Barth, piano, 1924'), (FLATTERER, 'La Flatteuse (La Lisonjera) – Hans Barth, piano, 1924')],
      },
      {
        'title': 'Vidéo : « Automne »', 'type': 'YOUTUBE', 'minutes': 7, 'video': 'https://www.youtube.com/watch?v=n2-_ZRi7HNg',
        'description': "« Automne » est la deuxième de ses Six Études de concert, op. 35 (1886), et sa pièce pour piano la plus célèbre. La pianiste britanno-canadienne Valerie Tryon la joue ici.\n\nUne étude travaille une compétence particulière. Les études de concert de Chaminade sont aussi de la vraie musique de concert, comme celles de Chopin.\n\nÉcoutez :\n1. Une mélodie calme et mélancolique sur des accords fluides – les feuilles d’automne\n2. Une partie centrale orageuse et virtuose – une tempête d’automne\n3. Le retour de la mélodie calme à la fin\n\nPianistes : demandez à votre professeur si « Automne » pourrait vous convenir – c’est une pièce favorite des élèves avancés.",
      },
      {
        'title': 'Bilan de la semaine 2 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années 1880, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 2 en bref', 'bullets': [
              'Un opéra, un ballet, un Konzertstück et une symphonie dramatique',
              'Le Pas des écharpes de « Callirhoë » devient un succès',
              '« Automne » : sa plus célèbre étude de concert',
              'Son talent est salué – mais ses grandes œuvres sont peu jouées']},
        ],
        'quiz': [
          ('Qu’est-ce que « Callirhoë » ?', ['Un opéra', 'Un ballet', 'Une mélodie', 'Une pièce pour flûte'], 1),
          ('Quel succès vient de « Callirhoë » ?', ['Automne', 'Le Pas des écharpes', 'La Lisonjera', 'Pierrette'], 1),
          ('Dans quelle saison nous plonge l’étude « Automne » ?', ['Le printemps', 'L’automne', 'L’hiver', 'L’été'], 1),
          ('Qu’est-ce qu’une étude ?', ['Une danse', 'Une pièce qui travaille une compétence particulière', 'Une romance sans paroles', 'Une ouverture'], 1),
          ('Quel compositeur aurait dit d’elle : « un compositeur qui est une femme » ?', ['Ambroise Thomas', 'Bizet', 'Godard', 'Debussy'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 3 – Mélodies, Angleterre et Concertino (1892–1907)',
    'lessons': [
      {
        'title': 'Les mélodies de Chaminade', 'type': 'SLIDES', 'minutes': 15,
        'description': "Chaminade écrivit plus de 100 mélodies. Elles se vendirent en quantités énormes. Lisez-en trois dans la bibliothèque.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 3', 'title': 'Mélodies, Angleterre et Concertino', 'subtitle': '1892 – 1907', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Une auteure de mélodies à succès', 'bullets': [
              'Ses mélodies étaient écrites pour des chanteurs amateurs – et chantées aussi par de grands professionnels',
              'Des mélodies claires, des parties de piano riches, des poèmes sur l’amour, la nature et les saisons',
              '« L’Anneau d’argent » (1891) fut l’un de ses plus grands succès',
              'Plus de 25 de ses mélodies sont dans la bibliothèque sous forme de partitions interactives']},
          {'kind': 'listen', 'title': '« L’Anneau d’argent »', 'work': 'Poème de Rosemonde Gérard', 'points': [
              'Une femme regarde le simple anneau d’argent que lui a offert son bien-aimé',
              'Il vaut plus pour elle que l’or ou les bijoux',
              'Une mélodie douce et fluide sur une partie de piano chaleureuse',
              'Ouvrez la partition interactive et suivez-la']},
          {'kind': 'listen', 'title': 'Deux autres à lire', 'work': '« L’Été » et « Chanson de neige »', 'points': [
              '« L’Été » : une mélodie éclatante et joyeuse, pleine de chants d’oiseaux – une favorite des sopranos',
              '« Chanson de neige » : légère et délicate',
              'Comparez comment le piano peint la saison dans chaque mélodie']},
        ],
        'library': [('cmuyfx7u800842eon5ytahxtq', '« L’Anneau d’argent » – partition interactive'), ('cmuyfx7u900852eontnl5q51m', '« L’Été » – partition interactive'), ('cmuyfx7u5007s2eonmxwdmsei', '« Chanson de neige » – partition interactive')],
      },
      {
        'title': 'L’Angleterre et la reine Victoria', 'type': 'SLIDES', 'minutes': 12,
        'description': "L’Angleterre adorait Chaminade – des salles de concert londoniennes jusqu’au château de Windsor.",
        'slides': [
          {'kind': 'bullets', 'title': 'Une vedette en Angleterre', 'bullets': [
              'À partir de 1892, elle partit presque chaque année en tournée en Angleterre',
              'Elle jouait sa propre musique devant des salles combles à Londres',
              'La reine Victoria admirait sa musique et l’invita au château de Windsor en 1897',
              'En 1901, elle réalisa à Londres certains des premiers enregistrements de gramophone d’une compositrice']},
          {'kind': 'bullets', 'title': 'Le mariage', 'bullets': [
              'En 1901, elle épousa Louis-Mathieu Carbonel, éditeur de musique marseillais, de nombreuses années son aîné',
              'Il mourut en 1907 ; elle ne se remaria pas',
              'Elle continua de jouer et de composer – les tournées étaient aussi son gagne-pain']},
          {'kind': 'listen', 'title': 'Écouter : deux pièces légères favorites', 'work': '« Pierrette » (air de ballet) et la « Sérénade espagnole »', 'points': [
              '« Pierrette » : une petite danse gracieuse pour piano – Cecil Elliott, 1925',
              'La « Sérénade espagnole », arrangée pour violon par Fritz Kreisler',
              'Kreisler la joue lui-même, avec son frère Hugo, sur un disque de 1922',
              'Les deux sont dans la bibliothèque']},
        ],
        'library': [(PIERRETTE, '« Pierrette » – Cecil Elliott, 1925'), (SERENADE, '« Sérénade espagnole » – Fritz et Hugo Kreisler, 1922')],
      },
      {
        'title': 'Vidéo : le Concertino pour flûte', 'type': 'YOUTUBE', 'minutes': 9, 'video': 'https://www.youtube.com/watch?v=BKjelbbWGEk',
        'description': "Le Concertino pour flûte, op. 107 (1902) fut écrit comme morceau de concours pour la classe de flûte du Conservatoire de Paris – et devint l’œuvre la plus jouée de Chaminade. Tous les flûtistes le connaissent.\n\nEmmanuel Pahud, flûte solo de l’Orchestre philharmonique de Berlin, le joue ici avec l’Orchestre de la Radio de Munich sous la direction d’Ivan Repušić (ARD Klassik).\n\nÉcoutez :\n1. Une longue mélodie chantante – la flûte comme une voix\n2. De brillants traits rapides qui mettent à l’épreuve les doigts et le souffle\n3. Une courte cadence pour le soliste seul vers la fin",
      },
      {
        'title': 'Bilan de la semaine 3 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années de gloire, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 3 en bref', 'bullets': [
              'Plus de 100 mélodies – « L’Anneau d’argent », un best-seller',
              'Des tournées annuelles en Angleterre ; la reine Victoria l’invite à Windsor (1897)',
              '1901 : premiers enregistrements à Londres ; mariage avec Louis-Mathieu Carbonel',
              '1902 : le Concertino pour flûte – joué partout encore aujourd’hui']},
        ],
        'quiz': [
          ('Dans quel genre Chaminade écrivit-elle plus de 100 œuvres ?', ['La danse', 'La mélodie (le chant avec piano)', 'L’étude pour piano', 'L’air d’opéra'], 1),
          ('Quelle souveraine invita Chaminade au château de Windsor ?', ['La reine Victoria', 'Le roi Édouard VII', 'La reine Élisabeth', 'Le roi George V'], 0),
          ('Pour quelle occasion le Concertino pour flûte fut-il écrit ?', ['Un mariage royal', 'Un concours du Conservatoire', 'Un film', 'Son mari'], 1),
          ('Qui arrangea la « Sérénade espagnole » pour violon ?', ['Jascha Heifetz', 'Fritz Kreisler', 'Pablo de Sarasate', 'Joseph Joachim'], 1),
          ('Que fit Chaminade de nouveau à Londres en 1901 ?', ['Elle dirigea un opéra', 'Elle fit des enregistrements de gramophone', 'Elle ouvrit une école', 'Elle joua aux Proms'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 4 – L’Amérique, la Légion d’honneur et la redécouverte (1908–1944)',
    'lessons': [
      {
        'title': 'L’Amérique, 1908', 'type': 'SLIDES', 'minutes': 15,
        'description': "En Amérique, Chaminade était un nom familier – bien avant qu’elle n’y aille.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 4', 'title': 'L’Amérique et la Légion d’honneur', 'subtitle': '1908 – 1944', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Les Chaminade Clubs', 'bullets': [
              'À partir des années 1890, des clubs de musique portant son nom apparurent dans tous les États-Unis',
              'La plupart étaient animés par des femmes, qui se réunissaient pour jouer et chanter de la musique – souvent la sienne',
              'Ses pièces faisaient partie du répertoire de base des élèves pianistes dans tout le pays']},
          {'kind': 'bullets', 'title': 'La tournée américaine', 'bullets': [
              'À l’automne 1908, elle fit une tournée aux États-Unis, jouant sa propre musique dans une douzaine de villes',
              'Son premier concert eut lieu au Carnegie Hall de New York',
              'Le public fut enthousiaste ; certains critiques furent moins tendres envers la « musique de salon »',
              'Le président Theodore Roosevelt la reçut à la Maison-Blanche']},
          {'kind': 'bullets', 'title': 'La Légion d’honneur, 1913', 'bullets': [
              'En 1913, la France la nomma chevalier de la Légion d’honneur',
              'Elle fut la première compositrice à recevoir cette distinction',
              'Elle avait alors publié environ 400 œuvres']},
        ],
      },
      {
        'title': 'Vidéo : une pionnière oubliée', 'type': 'YOUTUBE', 'minutes': 7, 'video': 'https://www.youtube.com/watch?v=Gz9Qw5srgw0',
        'description': "« Cécile Chaminade, compositrice pionnière et star internationale oubliée » – un court film de France Musique. Il raconte comment elle construisit sa carrière, l’ampleur de sa célébrité – et comment celle-ci s’effaça.\n\nÀ méditer : quelle part de la gloire d’une compositrice dépend de la musique – et quelle part de la mode ?",
      },
      {
        'title': 'Les dernières années et la redécouverte', 'type': 'SLIDES', 'minutes': 12,
        'description': "Chaminade vécut jusqu’en 1944 – assez longtemps pour voir sa musique passer de mode. Aujourd’hui, elle revient.",
        'slides': [
          {'kind': 'bullets', 'title': 'Les dernières années', 'bullets': [
              'Le goût musical changea après la Première Guerre mondiale : Debussy, Ravel, Stravinsky, le jazz',
              'Sa musique fut désormais considérée comme une « musique de salon » démodée',
              'De santé fragile, elle composa moins et vécut dans le sud de la France',
              'Elle mourut à Monte-Carlo le 13 avril 1944, à 86 ans']},
          {'kind': 'bullets', 'title': 'La redécouverte', 'bullets': [
              'À partir des années 1980, pianistes et chanteurs recommencèrent à enregistrer sa musique',
              'Le Concertino pour flûte n’a jamais quitté le répertoire',
              'Ses mélodies, ses pièces pour piano et ses trios avec piano sont de nouveau joués et étudiés',
              'Elle est une figure centrale de l’histoire des femmes en musique – et de la musique à la maison']},
          {'kind': 'summary', 'title': 'Pour aller plus loin', 'bullets': [
              'Lisez ses mélodies dans la bibliothèque : « Rosemonde », « Villanelle », « Ritournelle »',
              'Pianistes : essayez le Pas des écharpes ou « Pierrette » ; flûtistes : le Concertino',
              'Continuez avec les cours sur Fanny Hensel, Clara Schumann et Debussy']},
        ],
        'library': [('cmuyfx7ua00892eonm8r2xzdu', '« Rosemonde » – partition interactive'), ('cmuyfx7ud008e2eonig6dymeq', '« Villanelle » – partition interactive')],
      },
      {
        'title': 'Bilan final et quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Félicitations – vous êtes arrivé au bout du cours ! Un dernier résumé et un quiz final sur les quatre semaines.",
        'slides': [
          {'kind': 'timeline', 'title': 'La vie de Chaminade en un coup d’œil', 'rows': [
              ('1857', 'Naissance à Paris le 8 août'),
              ('1888', '« Callirhoë » et le Konzertstück'),
              ('1892', 'Début de ses tournées annuelles en Angleterre'),
              ('1902', 'Concertino pour flûte'),
              ('1908', 'Tournée aux États-Unis'),
              ('1913', 'Légion d’honneur'),
              ('1944', 'Morte à Monte-Carlo le 13 avril')]},
        ],
        'quiz': [
          ('Qu’étaient les « Chaminade Clubs » ?', ['Des clubs de tennis', 'Des clubs de musique américains portant son nom', 'Des cabarets parisiens', 'Des fan-clubs en Angleterre'], 1),
          ('Où Chaminade donna-t-elle son premier concert américain ?', ['Au Boston Symphony Hall', 'Au Carnegie Hall de New York', 'À la Maison-Blanche', 'À l’Orchestra Hall de Chicago'], 1),
          ('Quelle distinction reçut-elle en 1913 ?', ['Le prix de Rome', 'La Légion d’honneur', 'Un prix Nobel', 'Un titre de noblesse'], 1),
          ('Laquelle de ses œuvres est toujours restée au répertoire ?', ['La Sévillane', 'Le Concertino pour flûte', 'Les Amazones', 'Callirhoë en entier'], 1),
          ('Où Chaminade est-elle morte ?', ['À Paris', 'À Monte-Carlo', 'À New York', 'À Londres'], 1),
          ('Environ combien d’œuvres Chaminade écrivit-elle ?', ['Environ 40', 'Environ 400', 'Environ 4 000', 'Environ 14'], 1),
        ],
      },
    ],
  },
]
