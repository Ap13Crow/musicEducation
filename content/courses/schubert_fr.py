# Franz Schubert - version française de schubert.py.
SITE = 'https://mymusic.coach'
SONATA_D958 = f'{SITE}/api/library/items/cmuygtj2n00le4kktmlgfxzji/files/0.audio'

COURSE = {
    'slug': 'schubert-vie-et-lieder-introduction',
    'language': 'fr',
    'translationOf': 'schubert-life-and-songs-introduction',
    'title': 'Franz Schubert : vie et lieder – Une première introduction',
    'shortSummary': 'Quatre semaines avec Franz Schubert : le fils d’un maître d’école viennois qui écrivit plus de 600 lieder, « La Truite » et « Le Voyage d’hiver » – et mourut à 31 ans.',
    'description': (
        "Franz Schubert (1797–1828) ne vécut que 31 ans, presque toujours à Vienne. Il n’eut jamais d’emploi stable, se produisit rarement en public "
        "et ne publia de son vivant qu’une petite partie de sa musique. Il écrivit pourtant plus de 600 lieder, une merveilleuse musique pour piano, "
        "des symphonies et de la musique de chambre – et changea ce que pouvait être une mélodie.\n\n"
        "En quatre semaines, vous suivez sa vie pas à pas :\n"
        "- Semaine 1 – Une enfance viennoise (1797–1814)\n"
        "- Semaine 2 – Le miracle du lied : « Marguerite au rouet » et « Le Roi des aulnes » (1814–1815)\n"
        "- Semaine 3 – Amis, schubertiades et « La Truite » (1816–1824)\n"
        "- Semaine 4 – « Le Voyage d’hiver » et les dernières années (1825–1828)\n\n"
        "Chaque semaine associe des diapositives illustrées, des vidéos, des enregistrements et des partitions interactives de la bibliothèque mymusic.coach, "
        "suivis d’un court quiz. Aucune connaissance préalable n’est nécessaire. Comptez environ 1 à 2 heures par semaine."
    ),
    'level': 'BEGINNER',
    'instruments': ['Voice', 'Piano'],
    'musicStyles': ['Romantic', 'Classical'],
    'cover': {'image': 'schubert_rieder', 'title': 'Schubert', 'subtitle': 'Vie et lieder – Une première introduction', 'tag': 'Cours de 4 semaines'},
}

FOOTER = 'Franz Schubert : vie et lieder'

WEEKS = [
  {
    'title': 'Semaine 1 – Une enfance viennoise (1797–1814)',
    'lessons': [
      {
        'title': 'Bienvenue : à la rencontre de Schubert',
        'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': (
            "Bienvenue dans ce cours ! Dans cette première leçon, vous rencontrez Franz Schubert et découvrez le programme des quatre prochaines semaines.\n\n"
            "Astuce : la plupart des lieder de ce cours sont dans la bibliothèque mymusic.coach sous forme de partitions interactives – vous pouvez les suivre pendant l’écoute, "
            "les marquer comme favoris et gagner des XP supplémentaires en les lisant jusqu’au bout."
        ),
        'slides': [
          {'kind': 'title', 'week': 'Semaine 1', 'title': 'À la rencontre de Franz Schubert', 'subtitle': 'Une première introduction à sa vie et à ses lieder', 'image': 'schubert_rieder', 'credit': 'Portrait par Wilhelm August Rieder, 1875, d’après son aquarelle de 1825 (domaine public)'},
          {'kind': 'bullets', 'title': 'Pourquoi Schubert ?', 'bullets': [
              'Né à Vienne en 1797 – mort dans la même ville en 1828, à seulement 31 ans',
              'Il écrivit plus de 600 lieder pour voix et piano',
              'Il fit du piano un partenaire à part entière du chanteur',
              'Il écrivit aussi des symphonies, de la musique de chambre et des pièces pour piano aimées dans le monde entier',
              'La plus grande partie de sa musique ne devint célèbre qu’après sa mort']},
          {'kind': 'timeline', 'title': 'Vos quatre semaines', 'rows': [
              ('Semaine 1', 'Une enfance viennoise (1797–1814)'),
              ('Semaine 2', 'Le miracle du lied : « Marguerite » et « Le Roi des aulnes »'),
              ('Semaine 3', 'Amis, schubertiades et « La Truite »'),
              ('Semaine 4', '« Le Voyage d’hiver » et les dernières années (1825–1828)')]},
          {'kind': 'bullets', 'title': 'Qu’est-ce qu’un lied ?', 'bullets': [
              '« Lied » (pluriel « Lieder ») signifie « chant » en allemand',
              'Un poème mis en musique pour une voix et piano',
              'Schubert choisissait des poèmes de Goethe, Schiller, Müller et de ses propres amis',
              'Dans ses lieder, le piano peint la scène : un rouet, un cheval au galop, un ruisseau']},
          {'kind': 'quote', 'quote': 'Quand je voulais chanter l’amour, il se changeait en douleur. Et quand je voulais chanter la douleur, elle se changeait en amour.', 'by': 'Franz Schubert, « Mon rêve », 1822'},
        ],
      },
      {
        'title': 'Grandir à Vienne',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Un fils de maître d’école, un quatuor familial et un petit chanteur à la cour impériale : ces diapositives racontent les 17 premières années de Schubert.",
        'slides': [
          {'kind': 'bullets', 'title': 'Vienne, 31 janvier 1797', 'bullets': [
              'Né dans le faubourg de Himmelpfortgrund, juste à l’extérieur de la vieille ville de Vienne',
              'Son père Franz Theodor dirigeait une petite école ; sa mère Elisabeth avait été cuisinière',
              'Il était l’un de quatorze enfants – cinq seulement survécurent à l’enfance',
              'La musique faisait partie de la vie quotidienne à la maison']},
          {'kind': 'bullets', 'title': 'Une famille musicienne', 'bullets': [
              'Son père lui apprit le violon, son frère Ignaz le piano',
              'La famille jouait des quatuors à cordes – Franz tenait l’alto',
              'Le maître de chapelle de la paroisse, Michael Holzer, disait : « Chaque fois que je voulais lui apprendre quelque chose de nouveau, il le savait déjà »']},
          {'kind': 'timeline', 'title': 'Petit chanteur à la cour impériale', 'rows': [
              ('1808', 'Il devient petit chanteur de la chapelle de la cour impériale – avec une place gratuite au Stadtkonvikt'),
              ('1808–1812', 'Il joue du violon dans l’orchestre de l’école : des symphonies de Haydn, Mozart et Beethoven'),
              ('dès 1812', 'Leçons de composition avec le compositeur de la cour Antonio Salieri'),
              ('1812', 'Sa voix mue – son temps de petit chanteur s’achève'),
              ('1814', 'Il se forme comme instituteur et aide à l’école de son père')]},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Né le 31 janvier 1797 à Vienne, fils d’un maître d’école',
              'Violon, piano et alto à la maison – un quatuor familial',
              'Petit chanteur et élève du Stadtkonvikt à partir de 1808',
              'Leçons de composition avec Antonio Salieri',
              '1814 : instituteur adjoint – mais son cœur appartenait à la musique']},
        ],
      },
      {
        'title': 'Vidéo : la vie de Schubert et ses lieux',
        'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=Zi7qHY-TkvY',
        'description': (
            "Ce documentaire visite les lieux où Schubert a vécu et travaillé et présente les personnes qui comptaient le plus pour lui. "
            "La vidéo est en anglais – activez si besoin les sous-titres automatiques de YouTube.\n\n"
            "Pendant le visionnage, cherchez :\n"
            "1. Où, à Vienne, Schubert est-il né ?\n"
            "2. Qui étaient ses amis les plus importants ?\n"
            "3. Combien de fois Schubert a-t-il déménagé – et pourquoi ?\n\n"
            "Pas besoin de tout retenir – chaque partie de l’histoire reviendra dans les semaines suivantes."
        ),
      },
      {
        'title': 'Bilan de la semaine 1 et quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Un court résumé de la semaine 1, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 1 en bref', 'bullets': [
              'Né à Vienne le 31 janvier 1797',
              'Fils d’un maître d’école – l’un des cinq enfants survivants',
              'Quatuor familial : Franz à l’alto',
              '1808 : petit chanteur de la chapelle de la cour impériale',
              'Leçons avec Antonio Salieri']},
          {'kind': 'bullets', 'title': 'À écouter cette semaine', 'bullets': [
              'Ouvrez « Heidenröslein » (La petite rose sauvage) dans la bibliothèque : un lied simple, de style populaire, écrit par Schubert à 18 ans',
              'Remarquez comme il est court – et comme la même musique revient à chaque strophe']},
        ],
        'library': [('cmuyfx8r900w92eon5eyc7x6t', 'Un premier lied à découvrir : simple, court et célèbre'), ('cmv2iotfk002c12ifqkn9m9ge', 'Enregistrement historique : Fritz Kreisler joue la musique de ballet de Rosamunde de Schubert (1917)')],
        'quiz': [
          ('Dans quelle ville Franz Schubert est-il né ?', ['Salzbourg', 'Vienne', 'Graz', 'Munich'], 1),
          ('Quel était le métier de son père ?', ['Musicien de cour', 'Maître d’école', 'Facteur de pianos', 'Prêtre'], 1),
          ('De quel instrument Schubert jouait-il dans le quatuor familial ?', ['Le violoncelle', 'L’alto', 'La flûte', 'La contrebasse'], 1),
          ('Où Schubert chantait-il enfant ?', ['À la chapelle de la cour impériale', 'À l’église Saint-Thomas de Leipzig', 'À l’opéra', 'Dans un monastère de Salzbourg'], 0),
          ('Quel célèbre compositeur de la cour enseigna la composition à Schubert ?', ['Joseph Haydn', 'Ludwig van Beethoven', 'Antonio Salieri', 'Carl Czerny'], 2),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 2 – Le miracle du lied (1814–1815)',
    'lessons': [
      {
        'title': '« Marguerite au rouet » : un chef-d’œuvre à 17 ans',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Le 19 octobre 1814, Schubert, 17 ans, écrivit un lied que beaucoup considèrent comme la naissance du lied allemand. Suivez-le avec la partition interactive de la bibliothèque.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 2', 'title': 'Le miracle du lied', 'subtitle': '1814 – 1815', 'image': 'schubert_klimt', 'credit': 'Gustav Klimt, « Schubert au piano », 1899 (domaine public)'},
          {'kind': 'bullets', 'title': 'Marguerite au rouet', 'bullets': [
              'Les paroles viennent du « Faust » de Goethe : la jeune Marguerite (Gretchen) pense à Faust, qu’elle aime',
              '« Meine Ruh’ ist hin, mein Herz ist schwer » – « Mon repos s’est enfui, mon cœur est lourd »',
              'Schubert l’écrivit le 19 octobre 1814 – il avait 17 ans',
              'Beaucoup d’historiens voient dans ce jour l’anniversaire du lied allemand']},
          {'kind': 'listen', 'title': 'Écoutez le rouet', 'work': 'Gretchen am Spinnrade, D 118', 'points': [
              'La main droite du piano tourne sans cesse – le rouet',
              'La main gauche répète un motif régulier – la pédale sous le pied de Marguerite',
              'Sur « sein Kuss ! » (son baiser), la musique s’arrête – le rouet s’immobilise',
              'Lentement, de façon irrégulière, le rouet repart …']},
          {'kind': 'summary', 'title': 'Pourquoi c’est important', 'bullets': [
              'Le piano n’accompagne pas seulement – il raconte une partie de l’histoire',
              'Une seule idée musicale (le rouet) tient tout le lied',
              'Ouvrez la partition interactive dans la bibliothèque et observez le motif du rouet au piano']},
        ],
        'library': [('cmuyfx8tx00xw2eonufiq20fa', 'Partition interactive – observez le rouet dans la partie de piano')],
      },
      {
        'title': '« Le Roi des aulnes » : quatre voix, un chanteur',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Un père chevauche dans la nuit avec son enfant malade, et le Roi des aulnes appelle le garçon. Schubert fit de la ballade de Goethe un drame de trois minutes – pour un chanteur et piano.",
        'slides': [
          {'kind': 'bullets', 'title': 'L’histoire', 'bullets': [
              'Un père galope dans une nuit sombre et venteuse, tenant son fils dans ses bras',
              'Le garçon voit le Roi des aulnes, un esprit qui l’attire avec des jeux et des cadeaux',
              'Le père tente de le rassurer : « C’est une traînée de brume … le vent dans les feuilles sèches »',
              'Quand ils arrivent, l’enfant est mort']},
          {'kind': 'bullets', 'title': 'Un chanteur – quatre personnages', 'bullets': [
              'Le narrateur : dans le médium de la voix, calme et grave',
              'Le père : grave et posé',
              'Le fils : aigu et de plus en plus effrayé',
              'Le Roi des aulnes : doux et aimable – en majeur']},
          {'kind': 'listen', 'title': 'Guide d’écoute', 'work': 'Erlkönig, D 328', 'points': [
              'Des octaves rapides et répétées au piano – le cheval au galop (et un défi pour tout pianiste !)',
              'Un motif grondant à la basse – le vent et la forêt obscure',
              'Le cri du garçon « Mein Vater, mein Vater ! » (Mon père, mon père !) monte chaque fois plus haut',
              'Le galop s’arrête – et les derniers mots sont dits presque sans musique : « war tot » (était mort)']},
          {'kind': 'timeline', 'title': 'D’une œuvre d’élève à l’Opus 1', 'rows': [
              ('1815', 'Schubert écrit « Le Roi des aulnes » – il a 18 ans'),
              ('1815', 'Cette seule année, il écrit environ 140 lieder'),
              ('7 mars 1821', 'Le baryton Johann Michael Vogl le chante lors d’un concert public à Vienne – un triomphe'),
              ('Avril 1821', 'Des amis financent l’édition : « Le Roi des aulnes » devient l’Opus 1 de Schubert')]},
        ],
        'library': [('cmuyfx8tt00xu2eon15eoa2sb', 'Partition interactive – suivez les quatre personnages'), ('cmuygwa5m02as4kktbztoivs2', 'La partition imprimée (PDF)'), ('cmv2j2nc000ri12iflfzaiwgz', 'Enregistrement historique : Robert Leonhardt chante « Erlkönig » (1921)')],
      },
      {
        'title': 'Vidéo : « Le Roi des aulnes » en animation',
        'type': 'YOUTUBE', 'minutes': 8, 'video': 'https://www.youtube.com/watch?v=sElBd0Wv1L8',
        'description': (
            "Un film d’animation sur « Erlkönig » de Schubert. Regardez-le deux fois :\n\n"
            "1. La première fois, laissez-vous simplement porter par l’histoire.\n"
            "2. La seconde fois, n’écoutez que le piano : quand le galop s’arrête-t-il ? Que se passe-t-il dans la musique quand le Roi des aulnes parle ?\n\n"
            "Ouvrez ensuite la partition de la bibliothèque de la leçon précédente et trouvez l’endroit où la musique s’arrête presque."
        ),
      },
      {
        'title': 'Bilan de la semaine 2 et quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé du miracle du lied, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 2 en bref', 'bullets': [
              '19 octobre 1814 : « Marguerite au rouet » – le piano devient le rouet',
              '1815 : environ 140 lieder en une seule année',
              '« Le Roi des aulnes » : un chanteur, quatre personnages, un piano au galop',
              '1821 : « Le Roi des aulnes » publié comme Opus 1, payé par des amis']},
        ],
        'quiz': [
          ('De quelle œuvre de Goethe vient le texte de « Marguerite au rouet » ?', ['Faust', 'Werther', 'Egmont', 'Wilhelm Meister'], 0),
          ('Quel âge avait Schubert quand il écrivit « Marguerite au rouet » ?', ['12 ans', '17 ans', '25 ans', '31 ans'], 1),
          ('Qu’imite le piano dans « Marguerite au rouet » ?', ['Une tempête', 'Un rouet', 'Des cloches', 'Un cheval'], 1),
          ('Combien de personnages le chanteur incarne-t-il dans « Le Roi des aulnes » ?', ['Un', 'Deux', 'Quatre', 'Six'], 2),
          ('Comment se termine « Le Roi des aulnes » ?', ['Par un mariage', 'L’enfant est mort', 'Le Roi des aulnes disparaît', 'Le père trouve de l’aide'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 3 – Amis, schubertiades et « La Truite » (1816–1824)',
    'lessons': [
      {
        'title': 'Schubert et ses amis',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Schubert n’eut jamais d’emploi stable. Un cercle d’amis fidèles lui offrit chambres, argent, poèmes – et un public : les schubertiades.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 3', 'title': 'Amis et schubertiades', 'subtitle': '1816 – 1824', 'image': 'schubertiade', 'credit': 'Julius Schmid, « Schubertiade », 1897 (domaine public)'},
          {'kind': 'bullets', 'title': 'Un cercle d’amis', 'bullets': [
              'Joseph von Spaun – ami d’école, qui envoya ses lieder à Goethe',
              'Franz von Schober – offrit une chambre à Schubert et écrivit des poèmes pour lui',
              'Johann Mayrhofer – poète ; Schubert mit en musique près de cinquante de ses poèmes',
              'Johann Michael Vogl – célèbre baryton d’opéra qui chantait partout les lieder de Schubert',
              'Des peintres comme Moritz von Schwind et Leopold Kupelwieser']},
          {'kind': 'bullets', 'title': 'Qu’était une schubertiade ?', 'bullets': [
              'Une soirée chez des amis, consacrée à la musique de Schubert',
              'Lieder, pièces à quatre mains, danses – souvent avec Schubert au piano',
              'Lectures de poèmes, jeux, vin et longues conversations',
              'Ses amis l’appelaient « Schwammerl » – petit champignon – parce qu’il était petit et rond']},
          {'kind': 'timeline', 'title': 'Des années de liberté – et d’inquiétude', 'rows': [
              ('1818', 'Il renonce à l’enseignement ; été comme professeur de musique de la famille Esterházy à Zseliz'),
              ('1819', 'Voyage en Haute-Autriche avec Vogl ; il écrit le Quintette « La Truite »'),
              ('1822', 'Symphonie en si mineur – l’« Inachevée »'),
              ('fin 1822', 'Il tombe gravement malade – sa santé ne s’en remettra jamais tout à fait'),
              ('1823', 'Le cycle de lieder « La Belle Meunière »')]},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Ses amis donnèrent à Schubert chambres, argent, poèmes et un public',
              'Les schubertiades : des soirées musicales à la maison',
              'À partir de 1818, il vécut comme compositeur indépendant',
              'La Symphonie « Inachevée » n’a que deux mouvements – personne ne sait exactement pourquoi']},
        ],
              'library': [('cmv2iy5yt00im12ifkvh31t43', 'Enregistrement historique : la Symphonie « Inachevée », Orchestre de Philadelphie sous Leopold Stokowski (1924)'), ('cmv2iumnh00bm12ifzo8xv1z2', 'Enregistrement historique : « Moment musical », Orchestre de Philadelphie (1922)')],
      },
      {
        'title': 'Vidéo : les amis et les poètes de Schubert',
        'type': 'YOUTUBE', 'minutes': 60, 'video': 'https://www.youtube.com/watch?v=wyxnjA1Xyng',
        'description': (
            "Le pianiste Graham Johnson, l’un des plus grands spécialistes des lieder de Schubert, raconte les années 1816–1820 "
            "– quand Schubert vivait avec le poète Johann Mayrhofer – tandis que des chanteurs interprètent les lieder au Wigmore Hall de Londres. "
            "Les explications sont en anglais, les lieder en allemand.\n\n"
            "C’est une longue vidéo : regardez-la en plusieurs fois si vous le souhaitez. Écoutez :\n"
            "1. Comment les poèmes sombres de Mayrhofer diffèrent de ceux de Goethe\n"
            "2. Comment l’écriture pianistique de Schubert décrit la nature – l’eau, le vent, la nuit\n"
            "3. Des lieder que vous connaissez déjà grâce à ce cours"
        ),
      },
      {
        'title': 'Écouter : « La Truite » et le Quintette « La Truite »',
        'type': 'YOUTUBE', 'minutes': 40, 'video': 'https://www.youtube.com/watch?v=J_nKAXM9CY8',
        'description': (
            "En 1817, Schubert écrivit le lied « Die Forelle » (La Truite) : un pêcheur trouble l’eau claire pour attraper une truite vive. "
            "Deux ans plus tard, un mélomane de la ville de Steyr lui demanda un quintette avec piano – avec des variations sur ce lied. "
            "Ce fut le Quintette « La Truite », D 667, pour piano, violon, alto, violoncelle et contrebasse.\n\n"
            "Le Schubert Ensemble joue ici le quintette complet en direct au Wigmore Hall.\n\n"
            "Écoutez :\n"
            "1. Les figures perlées du piano – encore l’eau !\n"
            "2. Dans le quatrième mouvement : la mélodie du lied, puis des variations – chaque instrument a son tour\n"
            "3. La contrebasse – inhabituelle dans un quintette – qui donne au son une assise chaude et profonde\n\n"
            "Lisez d’abord le lied lui-même dans la bibliothèque : le motif bondissant du piano, c’est la truite qui file dans l’eau."
        ),
        'library': [('cmuyfx8tu00xv2eonaugi8dph', 'Le lied « Die Forelle » – partition interactive')],
      },
      {
        'title': 'Bilan de la semaine 3 et quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années de liberté, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 3 en bref', 'bullets': [
              'Ses amis : Spaun, Schober, Mayrhofer, le chanteur Vogl',
              'Les schubertiades – musique, poésie et amitié à la maison',
              '1818 : Schubert abandonne définitivement l’enseignement',
              '1819 : le Quintette « La Truite », avec des variations sur son lied',
              '1822 : la Symphonie « Inachevée » – et une grave maladie']},
        ],
        'quiz': [
          ('Qu’était une « schubertiade » ?', ['Un festival à Salzbourg', 'Une soirée consacrée à la musique de Schubert chez des amis', 'Un office religieux', 'Une danse'], 1),
          ('Quel chanteur fit connaître les lieder de Schubert ?', ['Johann Michael Vogl', 'Caroline Unger', 'Jenny Lind', 'Franz Liszt'], 0),
          ('Sur quel lied reposent les variations du Quintette « La Truite » ?', ['Erlkönig', 'Die Forelle', 'Heidenröslein', 'Ave Maria'], 1),
          ('Quel instrument rend le Quintette « La Truite » inhabituel ?', ['La flûte', 'La contrebasse', 'La harpe', 'La clarinette'], 1),
          ('Qu’a de particulier la Symphonie « Inachevée » ?', ['Elle n’a pas de mouvement lent', 'Elle n’a que deux mouvements', 'Elle est écrite pour chœur', 'Elle n’a jamais été jouée'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 4 – « Le Voyage d’hiver » et les dernières années (1825–1828)',
    'lessons': [
      {
        'title': '« Le Voyage d’hiver » : un voyage à travers l’hiver',
        'type': 'SLIDES', 'minutes': 15,
        'description': "En 1827, Schubert écrivit 24 lieder sur un voyageur solitaire en hiver. Ses amis furent bouleversés par leur noirceur – aujourd’hui, « Winterreise » compte parmi les plus grandes œuvres de toute la musique.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 4', 'title': 'Le Voyage d’hiver et les dernières années', 'subtitle': '1825 – 1828', 'image': 'schubert_rieder', 'credit': 'Portrait par Wilhelm August Rieder, 1875, d’après son aquarelle de 1825 (domaine public)'},
          {'kind': 'bullets', 'title': 'Un cycle de lieder', 'bullets': [
              '24 lieder sur des poèmes de Wilhelm Müller, écrits en 1827',
              'Un jeune homme, éconduit en amour, quitte la ville par une nuit d’hiver',
              'Il erre dans la neige et la glace : un tilleul, une rivière gelée, une corneille, un poteau indicateur',
              'Il n’y a pas de fin heureuse – le dernier lied rencontre un pauvre joueur de vielle']},
          {'kind': 'listen', 'title': 'Trois lieder à découvrir', 'work': 'Winterreise, D 911', 'points': [
              'N° 1 « Gute Nacht » (Bonne nuit) – des pas réguliers au piano : le voyage commence',
              'N° 5 « Der Lindenbaum » (Le Tilleul) – le bruissement des feuilles, une mélodie presque populaire',
              'N° 24 « Der Leiermann » (Le Joueur de vielle) – un bourdon vide et répété : le joueur de vielle dans le froid']},
          {'kind': 'quote', 'quote': 'Je vais vous chanter un cycle de lieder terrifiants. Ils m’ont plus bouleversé que cela n’a jamais été le cas avec d’autres lieder.', 'by': 'Schubert à ses amis, selon le souvenir de Joseph von Spaun'},
          {'kind': 'summary', 'title': 'À vous de jouer', 'bullets': [
              'Ouvrez « Gute Nacht » et « Der Lindenbaum » dans la bibliothèque et suivez la partition',
              'Comptez les croches régulières de « Gute Nacht » – la marche ne s’arrête jamais',
              'Dans « Der Leiermann », regardez la basse : les deux mêmes notes, encore et encore']},
        ],
        'library': [('cmuyfx8ri00x22eonjl2tvyhp', 'N° 1 « Gute Nacht » – le voyage commence'), ('cmuyfx8rj00x62eonfpjqbi34', 'N° 5 « Der Lindenbaum »'), ('cmuyfx8tq00xn2eonv1bdee2j', 'N° 24 « Der Leiermann » – le dernier lied')],
      },
      {
        'title': 'Vidéo : « Le Voyage d’hiver » en concert',
        'type': 'YOUTUBE', 'minutes': 75, 'video': 'https://www.youtube.com/watch?v=tnuvs2w7ges',
        'description': (
            "Le ténor Ian Bostridge – qui a aussi écrit tout un livre sur « Winterreise » – interprète le cycle complet en concert.\n\n"
            "Inutile de regarder les 24 lieder d’un coup. Commencez par le premier (« Gute Nacht »), passez ensuite à "
            "« Der Lindenbaum » (n° 5) et terminez par le dernier, « Der Leiermann ».\n\n"
            "Écoutez comme le chanteur change de couleur – souvenirs chaleureux en majeur, réalité glacée en mineur."
        ),
      },
      {
        'title': '1828 : la dernière année',
        'type': 'AUDIO', 'minutes': 15, 'video': SONATA_D958,
        'description': (
            "La dernière année de Schubert fut étonnamment féconde. Le 26 mars 1828 – un an jour pour jour après la mort de Beethoven – il donna le seul "
            "concert public de sa propre musique de toute sa vie ; ce fut un succès. Dans les mois suivants, il écrivit le grand Quintette à cordes en ut majeur, "
            "les lieder publiés plus tard sous le titre « Schwanengesang » (Le Chant du cygne) et trois grandes sonates pour piano.\n\n"
            "Schubert mourut le 19 novembre 1828, à 31 ans seulement. Selon son souhait, il fut enterré près de Beethoven. "
            "Son ami le poète Franz Grillparzer écrivit l’épitaphe : « La musique a enseveli ici un riche trésor, mais de bien plus belles espérances encore. »\n\n"
            "Vous entendez ici le premier mouvement (Allegro) de la Sonate pour piano en ut mineur, D 958 – l’une de ces trois dernières sonates –, joué par Paul Pitman "
            "(Musopen, domaine public). Écoutez le début orageux – Schubert pensait à Beethoven – et le doux second thème qui lui répond."
        ),
        'library': [('cmuygtj2n00le4kktmlgfxzji', 'La Sonate en ut mineur, D 958, complète'), ('cmuyfx8re00wr2eonxcjach5b', '« Ständchen » (Sérénade) du Chant du cygne – partition interactive'), ('cmv2iprf6002y12if6z3yxwje', 'Sergueï Rachmaninov joue son propre arrangement pour piano d’un lied de Schubert (1925)'), ('cmv2iogtd001q12ifdoqiegny', 'Jascha Heifetz joue l’« Ave Maria » de Schubert (1924)')],
      },
      {
        'title': 'Bilan final et quiz',
        'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Félicitations – vous êtes arrivé au bout du cours ! Un dernier résumé et un quiz final sur les quatre semaines.",
        'slides': [
          {'kind': 'timeline', 'title': 'La vie de Schubert en un coup d’œil', 'rows': [
              ('1797', 'Naissance à Vienne le 31 janvier'),
              ('1808', 'Petit chanteur de la chapelle de la cour impériale'),
              ('1814', '« Marguerite au rouet »'),
              ('1815', '« Le Roi des aulnes » – environ 140 lieder en un an'),
              ('1819', 'Le Quintette « La Truite »'),
              ('1827', '« Le Voyage d’hiver » – porteur de flambeau aux funérailles de Beethoven'),
              ('1828', 'Mort à Vienne le 19 novembre, à 31 ans')]},
          {'kind': 'bullets', 'title': 'Pour aller plus loin', 'bullets': [
              'Explorez plus de 150 partitions et enregistrements de Schubert dans la bibliothèque mymusic.coach',
              'Continuez avec « Beethoven : vie et œuvre » – le compositeur que Schubert admirait le plus',
              'Chanteurs et pianistes : demandez à votre professeur un premier lied de Schubert – « Heidenröslein » est un bon début']},
        ],
        'quiz': [
          ('Combien de lieder Schubert écrivit-il ?', ['Environ 60', 'Environ 200', 'Plus de 600', 'Exactement 24'], 2),
          ('Qui écrivit les poèmes du « Voyage d’hiver » ?', ['Goethe', 'Wilhelm Müller', 'Schiller', 'Heine'], 1),
          ('Combien de lieder compte « Le Voyage d’hiver » ?', ['12', '20', '24', '30'], 2),
          ('Que fit Schubert aux funérailles de Beethoven en 1827 ?', ['Il dirigea l’orchestre', 'Il porta un flambeau', 'Il prononça un discours', 'Il n’y assista pas'], 1),
          ('Quel âge avait Schubert à sa mort ?', ['31 ans', '45 ans', '56 ans', '27 ans'], 0),
          ('Que se passa-t-il le 26 mars 1828 ?', ['Le seul concert public de Schubert consacré à sa propre musique', 'La création du « Roi des aulnes »', 'Le mariage de Schubert', 'La publication du « Voyage d’hiver »'], 0),
        ],
      },
    ],
  },
]
