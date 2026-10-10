# Claude Debussy - version française de debussy.py.
COURSE = {
    'slug': 'debussy-vie-et-oeuvre-introduction',
    'language': 'fr',
    'translationOf': 'debussy-life-and-music-introduction',
    'title': 'Claude Debussy : vie et œuvre – Une première introduction',
    'shortSummary': 'Quatre semaines avec Claude Debussy : le rebelle du Conservatoire de Paris qui ouvrit la porte à la musique moderne – Clair de lune, le Faune, Pelléas, La Mer et les Préludes.',
    'description': (
        "Claude Debussy (1862–1918) enfreignit les règles d’harmonie qu’on lui enseignait, écouta le gamelan javanais et les estampes japonaises, et écrivit une musique "
        "faite de lumière, d’eau et d’air. Beaucoup de musiciens disent que la musique moderne commence avec lui.\n\n"
        "En quatre semaines, vous suivez sa vie pas à pas :\n"
        "- Semaine 1 – Un rebelle au Conservatoire (1862–1887)\n"
        "- Semaine 2 – Des sons nouveaux : gamelan, poètes et un faune (1887–1898)\n"
        "- Semaine 3 – Pelléas, La Mer et un scandale (1899–1908)\n"
        "- Semaine 4 – Préludes, guerre et dernières années (1909–1918)\n\n"
        "Chaque semaine associe des diapositives illustrées, un documentaire et des interprétations (Deutsche Grammophon, Orchestre philharmonique de Berlin, "
        "hr-Sinfonieorchester), des partitions et mélodies de la bibliothèque mymusic.coach, un disque pour harpe de 1920 et un court quiz. Aucune connaissance préalable "
        "n’est nécessaire. Comptez environ 1 à 2 heures par semaine."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Flute', 'Voice'],
    'musicStyles': ['Impressionist', 'Modern'],
    'cover': {'image': 'debussy_portrait', 'title': 'Debussy', 'subtitle': 'Vie et œuvre – Une première introduction', 'tag': 'Cours de 4 semaines'},
}
FOOTER = 'Claude Debussy : vie et œuvre'
PORTRAIT = {'image': 'debussy_portrait', 'credit': 'Photographie de Nadar, vers 1908 (domaine public)'}
YOUNG = {'image': 'debussy_young', 'credit': 'Marcel Baschet, Claude Debussy, 1884 (musée d’Orsay, domaine public)'}
ARABESQUE_78 = 'cmv2j11e700ow12ifhlp61i9g'

WEEKS = [
  {
    'title': 'Semaine 1 – Un rebelle au Conservatoire (1862–1887)',
    'lessons': [
      {
        'title': 'Bienvenue : à la rencontre de Debussy', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Bienvenue dans ce cours ! Découvrez Claude Debussy – et voyez comment se déroulent les quatre prochaines semaines.\n\nAstuce : toute la musique citée dans le cours est liée depuis les leçons. Ouvrez partitions et mélodies dans la bibliothèque et gagnez des XP supplémentaires en lisant ou en écoutant jusqu’au bout.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 1', 'title': 'À la rencontre de Claude Debussy', 'subtitle': 'Une première introduction à sa vie et à sa musique', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Pourquoi Debussy ?', 'bullets': [
              'Né près de Paris en 1862 – mort à Paris en 1918',
              'Il libéra l’harmonie des anciennes règles : des accords pour leur couleur, non pour leur fonction',
              '« Clair de lune », « Prélude à l’après-midi d’un faune », « La Mer », les Préludes',
              'Un seul opéra : « Pelléas et Mélisande »',
              'Ravel, Stravinsky, les pianistes de jazz et les compositeurs de cinéma ont tous appris de lui']},
          {'kind': 'timeline', 'title': 'Vos quatre semaines', 'rows': [
              ('Semaine 1', 'Un rebelle au Conservatoire'),
              ('Semaine 2', 'Des sons nouveaux : gamelan, poètes et un faune'),
              ('Semaine 3', 'Pelléas, La Mer et un scandale'),
              ('Semaine 4', 'Préludes, guerre et dernières années')]},
          {'kind': 'bullets', 'title': '« Impressionniste » ?', 'bullets': [
              'Les critiques qualifièrent sa musique d’« impressionniste », comme les tableaux de Monet',
              'Debussy détestait l’étiquette – il se sentait plus proche des poètes symbolistes',
              'Sa musique suggère plutôt qu’elle n’affirme : brumes, reflets, clair de lune',
              'Écoutez la couleur, l’atmosphère et le silence autant que la mélodie']},
        ],
      },
      {
        'title': 'D’une boutique de porcelaine au Conservatoire', 'type': 'SLIDES', 'minutes': 15,
        'description': "Debussy venait d’une famille pauvre sans tradition musicale. Une rencontre de hasard fit de lui un pianiste.",
        'slides': [
          {'kind': 'bullets', 'title': 'Saint-Germain-en-Laye, 22 août 1862', 'bullets': [
              'Achille-Claude Debussy naquit à l’ouest de Paris, où ses parents tenaient une boutique de porcelaine',
              'La boutique fit faillite ; la famille partit pour Paris et connut souvent la pauvreté',
              'Il n’alla jamais à l’école – sa mère l’instruisit à la maison',
              'En 1870, une tante l’emmena à Cannes, où il prit ses premières leçons de piano']},
          {'kind': 'bullets', 'title': 'Madame Mauté', 'bullets': [
              'De retour à Paris, Antoinette Mauté de Fleurville remarqua son talent et lui donna des leçons gratuites',
              'Elle disait avoir été l’élève de Chopin – Debussy le crut toute sa vie',
              'Elle était la belle-mère du poète Paul Verlaine, dont il mit plus tard les poèmes en musique',
              'En 1872, à dix ans, il fut admis au Conservatoire de Paris']},
          {'kind': 'bullets', 'title': 'Onze ans au Conservatoire', 'bullets': [
              'Il était un pianiste brillant mais imprévisible',
              'En classe d’harmonie, il jouait des accords étranges qui enfreignaient les règles – et les adorait',
              'À un professeur qui lui demandait quelle règle il suivait, il aurait répondu : « Mon plaisir ! »',
              'Emplois d’été : à partir de 1880, il voyagea comme pianiste attaché à Nadejda von Meck, la protectrice de Tchaïkovski – en Italie, en Suisse et en Russie']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Né le 22 août 1862 à Saint-Germain-en-Laye',
              'Pas d’école – mais des leçons de piano gratuites avec Madame Mauté',
              'Conservatoire de Paris à partir de 1872, à dix ans',
              'Un rebelle en classe d’harmonie']},
        ],
      },
      {
        'title': 'Vidéo : Debussy – sa vie et ses lieux', 'type': 'YOUTUBE', 'minutes': 21, 'video': 'https://www.youtube.com/watch?v=562b30X5Kuo',
        'description': "Ce documentaire d’opera-inside suit Debussy à Paris, à Rome et dans les lieux de sa vie, en musique du début à la fin. La vidéo est en anglais – activez si besoin les sous-titres automatiques de YouTube.\n\nPendant le visionnage, cherchez :\n1. Quel prix envoya Debussy à Rome – et s’y plut-il ?\n2. Quelle musique d’Asie l’impressionna à l’Exposition universelle de 1889 ?\n3. Qui était « Chouchou » ?\n\nTout reviendra dans les semaines suivantes.",
      },
      {
        'title': 'Le prix de Rome – et quiz de la semaine 1', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "En 1884, Debussy remporta le plus important prix français pour jeunes compositeurs. L’endroit où il le mena ne lui plut guère.",
        'slides': [
          {'kind': 'title', 'week': '1884', 'title': 'Le prix de Rome', 'subtitle': 'Debussy à 22 ans', **YOUNG},
          {'kind': 'bullets', 'title': 'Rome, 1885–1887', 'bullets': [
              'Il remporta le prix de Rome en 1884 avec la cantate « L’Enfant prodigue »',
              'Le prix signifiait un séjour de plusieurs années à la Villa Médicis, à Rome',
              'Debussy se sentait seul, regrettait Paris et n’aimait pas le style officiel',
              'Il partit en 1887, plus tôt que prévu – ce portrait fut peint par un autre lauréat, Marcel Baschet']},
          {'kind': 'summary', 'title': 'La semaine 1 en bref', 'bullets': [
              'Né en 1862 ; une famille pauvre ; pas d’école',
              'Le Conservatoire à dix ans – un rebelle de l’harmonie',
              'Pianiste attaché à Nadejda von Meck, protectrice de Tchaïkovski',
              '1884 : prix de Rome ; un séjour malheureux à Rome']},
        ],
        'quiz': [
          ('Où Debussy est-il né ?', ['À Paris', 'À Saint-Germain-en-Laye', 'À Rome', 'À Cannes'], 1),
          ('À quel âge Debussy entra-t-il au Conservatoire de Paris ?', ['Six ans', 'Dix ans', 'Seize ans', 'Vingt ans'], 1),
          ('La protectrice de quel compositeur employa Debussy comme pianiste ?', ['Celle de Wagner', 'Celle de Tchaïkovski', 'Celle de Chopin', 'Celle de Liszt'], 1),
          ('Quel prix Debussy remporta-t-il en 1884 ?', ['Le prix Nobel', 'Le prix de Rome', 'La Légion d’honneur', 'Le prix Chopin'], 1),
          ('Quelle étiquette les critiques donnèrent-ils à sa musique – qu’il détestait ?', ['Romantique', 'Impressionniste', 'Baroque', 'Minimaliste'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 2 – Des sons nouveaux : gamelan, poètes et un faune (1887–1898)',
    'lessons': [
      {
        'title': 'Le gamelan, Wagner et les poètes', 'type': 'SLIDES', 'minutes': 15,
        'description': "De retour à Paris, Debussy chercha sa propre voix. Trois découvertes l’aidèrent à la trouver.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 2', 'title': 'Gamelan, poètes et un faune', 'subtitle': '1887 – 1898', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Trois découvertes', 'bullets': [
              'Wagner : en 1888 et 1889, il alla à Bayreuth – fasciné, puis résolu à ne pas l’imiter',
              'Le gamelan : à l’Exposition universelle de 1889 à Paris, il entendit des musiciens javanais – cloches, gongs, gammes et rythmes nouveaux',
              'La poésie : il fréquenta les « mardis » du poète Stéphane Mallarmé et des écrivains symbolistes',
              'La peinture : il aimait Whistler, Turner et les estampes japonaises']},
          {'kind': 'bullets', 'title': 'La boîte à outils de Debussy', 'bullets': [
              'Les gammes par tons – pas de « maison », un son flottant',
              'Les gammes pentatoniques – cinq notes, comme les touches noires du piano',
              'Des accords qui se déplacent en parallèle, comme des blocs de couleur',
              'Les anciens modes d’église – un son antique et ouvert']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Bayreuth 1888–1889 : Wagner le fascine – et il décide de suivre sa propre voie',
              '1889 : le gamelan javanais à l’Exposition universelle de Paris',
              'Mallarmé et les poètes symbolistes',
              'De nouvelles gammes et de nouveaux accords pour leur couleur']},
        ],
      },
      {
        'title': 'Écouter : la Première Arabesque', 'type': 'AUDIO', 'minutes': 6, 'libraryAudio': [ARABESQUE_78, 0],
        'description': "Les deux Arabesques pour piano (publiées en 1891) sont des œuvres de jeunesse – encore proches de la musique de salon de l’époque, mais déjà pleines des lignes fluides de Debussy. Une arabesque est un ornement sinueux et décoratif.\n\nVoici la Première Arabesque dans un arrangement pour harpe – un instrument dont le son lui va à merveille –, jouée par Ada Sassoli sur un 78 tours de 1920.\n\nÉcoutez :\n1. Des triolets perlés qui coulent comme de l’eau\n2. Une mélodie qui ondule de haut en bas – une « arabesque »\n3. Une partie centrale plus calme et plus enjouée\n\nLisez ensuite la partition pour piano des deux Arabesques dans la bibliothèque.",
        'library': [(ARABESQUE_78, 'Première Arabesque – Ada Sassoli, harpe, 1920'), ('cmuygw9li01zy4kktpwxlhkx9', 'Première Arabesque – partition'), ('cmuygw9li01zz4kktni8kqj43', 'Deuxième Arabesque – partition')],
      },
      {
        'title': 'Vidéo : Prélude à l’après-midi d’un faune', 'type': 'YOUTUBE', 'minutes': 10, 'video': 'https://www.youtube.com/watch?v=tjEdr3MuXTE',
        'description': "Le « Prélude à l’après-midi d’un faune » (1894) s’inspire d’un poème de Mallarmé : par un après-midi brûlant, un faune – mi-homme, mi-bouc – s’éveille, joue de sa flûte et rêve de nymphes. Il fut créé à Paris le 22 décembre 1894.\n\nL’Orchestre philharmonique de Berlin le joue ici dans un enregistrement de 1985, avec Karlheinz Zöller à la flûte solo.\n\nÉcoutez :\n1. Le solo de flûte du début : une mélodie lente et glissante, sans tonalité claire\n2. Les harpes et les cors feutrés – comme une brume d’été\n3. La musique n’« arrive » jamais vraiment – elle dérive, rêve et s’évanouit\n\nLe compositeur Pierre Boulez a dit que la musique moderne s’était éveillée avec cette pièce.",
      },
      {
        'title': 'Bilan de la semaine 2 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années 1890, une mélodie à lire et cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 2 en bref', 'bullets': [
              'Wagner, le gamelan, les poètes symbolistes',
              'Gammes par tons et pentatoniques, accords parallèles',
              '1891 : deux Arabesques pour piano',
              '1894 : Prélude à l’après-midi d’un faune']},
          {'kind': 'listen', 'title': 'À lire : des mélodies sur Verlaine', 'work': '« Mandoline » (1882) et « Il pleure dans mon cœur » des « Ariettes oubliées »', 'points': [
              '« Mandoline » : des donneurs de sérénades qui grattent leurs cordes dans un parc sous la lune – on entend la mandoline au piano',
              '« Il pleure dans mon cœur comme il pleut sur la ville »',
              'Toutes deux sur des poèmes de Paul Verlaine – le gendre de sa première professeure de piano',
              'Ouvrez les partitions interactives dans la bibliothèque']},
        ],
        'library': [('cmuyfx7x400at2eonnx5mi96r', '« Mandoline » – partition interactive'), ('cmuyfx7wy00ag2eon8sl6xs38', '« Il pleure dans mon cœur » – partition interactive'), ('cmuygticx00b04kktc3l0zl6x', 'Quatuor à cordes en sol mineur (1893) – partition interactive')],
        'quiz': [
          ('Quelle musique Debussy entendit-il à l’Exposition universelle de 1889 ?', ['Le jazz américain', 'Le gamelan javanais', 'Le flamenco espagnol', 'Le chant populaire russe'], 1),
          ('Les « mardis » de quel poète Debussy fréquentait-il ?', ['Victor Hugo', 'Stéphane Mallarmé', 'Charles Baudelaire', 'Arthur Rimbaud'], 1),
          ('Quel instrument ouvre le Prélude à l’après-midi d’un faune ?', ['Le hautbois', 'La flûte', 'Le violon', 'La harpe'], 1),
          ('Qu’est-ce qu’une gamme par tons ?', ['Une gamme sur les seules touches noires', 'Une gamme de tons entiers égaux, sans note « maison »', 'Une gamme majeure', 'Une gamme de 12 notes'], 1),
          ('Qui a dit que la musique moderne s’était éveillée avec le Faune ?', ['Igor Stravinsky', 'Pierre Boulez', 'Maurice Ravel', 'Erik Satie'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 3 – Pelléas, La Mer et un scandale (1899–1908)',
    'lessons': [
      {
        'title': 'Pelléas et Mélisande', 'type': 'SLIDES', 'minutes': 15,
        'description': "Pendant dix ans, Debussy travailla à un opéra qui ne ressemble à aucun autre. Sa création en 1902 le rendit célèbre.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 3', 'title': 'Pelléas, La Mer et un scandale', 'subtitle': '1899 – 1908', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Un opéra de murmures', 'bullets': [
              'D’après une pièce symboliste de l’écrivain belge Maurice Maeterlinck',
              'Une jeune fille mystérieuse, Mélisande, deux demi-frères, un sombre château au bord de la mer',
              'Pas de grands airs : les chanteurs disent presque le texte, au rythme naturel du français',
              'L’orchestre peint les atmosphères – forêts, fontaines, ténèbres, la mer']},
          {'kind': 'timeline', 'title': 'La vie et l’œuvre', 'rows': [
              ('1899', 'Il épouse Lilly Texier, mannequin'),
              ('30 avril 1902', 'Création de « Pelléas et Mélisande » à l’Opéra-Comique – d’abord déroutant, puis objet d’un culte'),
              ('1901', 'Il commence à écrire des critiques musicales ; son double ironique est « Monsieur Croche »'),
              ('1905', 'Il révise et publie la « Suite bergamasque », avec « Clair de lune »')]},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              '1902 : « Pelléas et Mélisande » – son seul opéra achevé',
              'Des mots chantés presque comme du français parlé',
              'Il écrivit des critiques pleines d’esprit sous le nom de « Monsieur Croche »']},
        ],
      },
      {
        'title': 'Vidéo : Clair de lune', 'type': 'YOUTUBE', 'minutes': 6, 'video': 'https://www.youtube.com/watch?v=U3u4pQ4WKOk',
        'description': "« Clair de lune » est la troisième pièce de la « Suite bergamasque » – commencée vers 1890 et publiée en 1905. Le titre vient d’un poème de Verlaine sur des danseurs masqués au clair de lune.\n\nSeong-Jin Cho, lauréat du Concours international Chopin 2015, la joue ici pour Deutsche Grammophon.\n\nÉcoutez :\n1. Des accords initiaux très doux – pianissimo – comme un clair de lune sur l’eau\n2. Un rythme flottant : on sent à peine la pulsation\n3. Des arpèges perlés au milieu, quand la lune sort des nuages\n\nOuvrez ensuite la partition dans la bibliothèque – c’est souvent l’une des premières pièces de Debussy qu’apprennent les pianistes.",
        'library': [('cmuygw9lj02004kktg6iplwvl', '« Clair de lune » – partition')],
      },
      {
        'title': 'La Mer et une nouvelle famille', 'type': 'SLIDES', 'minutes': 15,
        'description': "En 1904, Debussy quitta sa femme pour une autre – un scandale à Paris. La même année, il travaillait à son grand portrait de la mer.",
        'slides': [
          {'kind': 'bullets', 'title': 'Scandale', 'bullets': [
              'En 1904, Debussy quitta Lilly pour Emma Bardac, chanteuse et épouse d’un riche banquier',
              'Lilly tenta de se suicider ; beaucoup d’amis se détournèrent de Debussy',
              'Leur fille Claude-Emma, surnommée « Chouchou », naquit en 1905',
              'Claude et Emma se marièrent en 1908']},
          {'kind': 'image', 'title': '« La Mer », 1905', 'text': 'Debussy demanda que l’estampe d’Hokusai « La Grande Vague de Kanagawa » figure sur la couverture de la partition. « La Mer » compte trois parties : De l’aube à midi sur la mer, Jeux de vagues et Dialogue du vent et de la mer.', 'image': 'debussy_wave', 'credit': 'Katsushika Hokusai, La Grande Vague de Kanagawa, vers 1831 (domaine public)'},
          {'kind': 'bullets', 'title': 'Children’s Corner, 1908', 'bullets': [
              'Six pièces pour piano dédiées « à ma chère petite Chouchou, avec les tendres excuses de son père pour ce qui va suivre »',
              'Elles se moquent des exercices de piano (« Doctor Gradus ad Parnassum ») et mettent en scène ses jouets',
              'La dernière, « Golliwogg’s Cakewalk », utilise les rythmes du ragtime américain',
              'Au milieu, elle se moque du début du « Tristan » de Wagner !']},
        ],
      },
      {
        'title': 'Vidéo : La Mer – et quiz de la semaine 3', 'type': 'YOUTUBE', 'minutes': 28, 'xp': 20, 'video': 'https://www.youtube.com/watch?v=y1hWp4pQpAs',
        'description': "Alain Altinoglu dirige le hr-Sinfonieorchester (Orchestre symphonique de la Radio de Francfort) dans « La Mer » – créée à Paris le 15 octobre 1905.\n\nÉcoutez :\n1. « De l’aube à midi sur la mer » : la mer s’éveille lentement ; à la fin, un grand choral de cuivres – le soleil de midi\n2. « Jeux de vagues » (à partir de 9:06) : léger, scintillant, toujours changeant\n3. « Dialogue du vent et de la mer » : tempête et puissance – et une fin éclatante\n\nRépondez ensuite aux cinq questions du quiz de la semaine 3.",
        'quiz': [
          ('Qui écrivit la pièce dont est tiré « Pelléas et Mélisande » ?', ['Victor Hugo', 'Maurice Maeterlinck', 'Paul Verlaine', 'Stéphane Mallarmé'], 1),
          ('Quelle image Debussy voulut-il sur la couverture de « La Mer » ?', ['Un tableau de Monet', '« La Grande Vague » d’Hokusai', 'Une photo de l’Atlantique', 'Un dessin de Delacroix'], 1),
          ('Quel était le surnom de la fille de Debussy ?', ['Mimi', 'Chouchou', 'Lili', 'Coco'], 1),
          ('Quelle pièce de Children’s Corner utilise des rythmes de ragtime ?', ['Doctor Gradus ad Parnassum', 'Golliwogg’s Cakewalk', 'The Snow is Dancing', 'Jimbo’s Lullaby'], 1),
          ('Quelle suite contient « Clair de lune » ?', ['Children’s Corner', 'Suite bergamasque', 'Images', 'Estampes'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 4 – Préludes, guerre et dernières années (1909–1918)',
    'lessons': [
      {
        'title': 'Les Préludes', 'type': 'SLIDES', 'minutes': 15,
        'description': "Entre 1909 et 1913, Debussy écrivit 24 Préludes pour piano – de petits tableaux sonores parfaits.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 4', 'title': 'Préludes, guerre et dernières années', 'subtitle': '1909 – 1918', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Deux livres de Préludes', 'bullets': [
              'Livre 1 publié en 1910, livre 2 en 1913 – douze pièces chacun, comme les 24 Préludes de Chopin',
              'Les titres sont imprimés à la fin de chaque pièce, entre parenthèses – on écoute d’abord, on lit le titre ensuite',
              '« La fille aux cheveux de lin », « La cathédrale engloutie », « Feux d’artifice »',
              'Debussy enregistra aussi certaines de ses œuvres sur rouleaux de piano en 1913']},
          {'kind': 'listen', 'title': 'À lire', 'work': 'Prélude 4, livre 1 : « Les sons et les parfums tournent dans l’air du soir »', 'points': [
              'Un vers de Baudelaire',
              'Doux, lent et plein d’accords riches',
              'Remarquez les nombreuses indications de nuances – la plupart très douces',
              'Ouvrez la partition dans la bibliothèque – et tout le livre 1']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              '24 Préludes en deux livres (1910, 1913)',
              'Les titres à la fin – l’imagination d’abord',
              'Des images de la nature, de légendes, de personnes et de lieux']},
        ],
        'library': [('cmuygw9l901zw4kktfja35cxo', 'Prélude 4, livre 1 – partition'), ('cmuygw9la01zx4kktxk5qnbka', 'Préludes, livre 1 – partition')],
      },
      {
        'title': 'La guerre, la maladie et « musicien français »', 'type': 'SLIDES', 'minutes': 12,
        'description': "Les dernières années de Debussy furent assombries par le cancer et la Première Guerre mondiale. Il écrivit pourtant certaines de ses œuvres les plus originales.",
        'slides': [
          {'kind': 'bullets', 'title': 'Les dernières œuvres', 'bullets': [
              '1909 : Debussy apprit qu’il avait un cancer',
              '1913 : le ballet « Jeux » – deux semaines plus tard, « Le Sacre du printemps » de Stravinsky provoqua une émeute dans le même théâtre',
              '1915 : les douze Études pour piano, dédiées à la mémoire de Chopin',
              '1915–1917 : trois sonates, signées fièrement « Claude Debussy, musicien français »']},
          {'kind': 'bullets', 'title': 'La fin', 'bullets': [
              'Il projetait six sonates pour divers instruments – il en acheva trois : violoncelle, flûte-alto-harpe, violon',
              'La Sonate pour violon (1917) fut sa dernière œuvre achevée et sa dernière apparition publique comme pianiste',
              'Il mourut à Paris le 25 mars 1918, pendant que les canons allemands bombardaient la ville',
              'Chouchou mourut l’année suivante, à 13 ans']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Études (1915), dédiées à la mémoire de Chopin',
              'Trois sonates tardives – « musicien français »',
              'Mort le 25 mars 1918, en pleine guerre']},
        ],
      },
      {
        'title': 'Debussy aujourd’hui', 'type': 'SLIDES', 'minutes': 10,
        'description': "Pourquoi Debussy est l’un des fondateurs de la musique du XXe siècle.",
        'slides': [
          {'kind': 'bullets', 'title': 'Son influence', 'bullets': [
              'Ravel, Stravinsky, Bartók et Messiaen ont tous appris de lui',
              'Des musiciens de jazz comme Bill Evans adoraient ses accords',
              'La musique de film et de jeu vidéo utilise chaque jour ses couleurs et ses textures',
              'Il a montré que le son lui-même – timbre, espace, silence – peut être le sujet de la musique']},
          {'kind': 'summary', 'title': 'Pour aller plus loin', 'bullets': [
              'Lisez ses mélodies sur des poèmes de Verlaine et de Baudelaire dans la bibliothèque',
              'Pianistes : demandez à votre professeur « Clair de lune », une Arabesque ou « La fille aux cheveux de lin »',
              'Continuez avec les cours sur Chopin et Cécile Chaminade']},
        ],
        'library': [('cmuyfx7x200am2eonpe47e1pt', '« Harmonie du soir » (Baudelaire) – partition interactive'), ('cmuyfx7x300aq2eon2cagakpt', '« La Flûte de Pan » (Chansons de Bilitis) – partition interactive')],
      },
      {
        'title': 'Bilan final et quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Félicitations – vous êtes arrivé au bout du cours ! Un dernier résumé et un quiz final sur les quatre semaines.",
        'slides': [
          {'kind': 'timeline', 'title': 'La vie de Debussy en un coup d’œil', 'rows': [
              ('1862', 'Naissance à Saint-Germain-en-Laye le 22 août'),
              ('1872', 'Entrée au Conservatoire de Paris'),
              ('1884', 'Prix de Rome'),
              ('1894', 'Prélude à l’après-midi d’un faune'),
              ('1902', '« Pelléas et Mélisande »'),
              ('1905', '« La Mer » ; naissance de Chouchou'),
              ('1918', 'Mort à Paris le 25 mars')]},
        ],
        'quiz': [
          ('Où sont imprimés les titres des Préludes de Debussy ?', ['En haut', 'À la fin de chaque pièce', 'Seulement dans la table des matières', 'Nulle part'], 1),
          ('Comment Debussy signa-t-il ses sonates tardives ?', ['« Claude de France »', '« Claude Debussy, musicien français »', '« Monsieur Croche »', '« Achille Debussy »'], 1),
          ('À la mémoire de qui ses Études sont-elles dédiées ?', ['Bach', 'Chopin', 'Wagner', 'Mozart'], 1),
          ('Quand Debussy mourut-il ?', ['1902', '1914', '1918', '1925'], 2),
          ('Quel ballet de Stravinsky provoqua une émeute deux semaines après « Jeux » de Debussy ?', ['L’Oiseau de feu', 'Le Sacre du printemps', 'Petrouchka', 'Pulcinella'], 1),
          ('Quel fut le seul opéra achevé de Debussy ?', ['Carmen', 'Pelléas et Mélisande', 'Rusalka', 'L’Enfant prodigue'], 1),
        ],
      },
    ],
  },
]
