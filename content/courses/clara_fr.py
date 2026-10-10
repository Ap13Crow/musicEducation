# Clara Schumann (née Wieck) - version française de clara.py.
COURSE = {
    'slug': 'clara-schumann-vie-et-oeuvre-introduction',
    'language': 'fr',
    'translationOf': 'clara-schumann-life-and-music-introduction',
    'title': 'Clara Schumann : vie et œuvre – Une première introduction',
    'shortSummary': 'Quatre semaines avec Clara Schumann : enfant prodige, la plus grande pianiste de son siècle, compositrice, épouse de Robert Schumann, amie de Brahms – et plus de soixante ans de carrière.',
    'description': (
        "Clara Schumann (1819–1896), née Clara Wieck, fut une vedette du piano à onze ans, compositrice à treize et, pendant plus de soixante ans, "
        "l’une des musiciennes les plus admirées d’Europe – tout en élevant sept enfants et en faisant vivre sa famille.\n\n"
        "En quatre semaines, vous suivez sa vie pas à pas :\n"
        "- Semaine 1 – Leipzig : une enfant prodige (1819–1835)\n"
        "- Semaine 2 – Clara et Robert : un amour contre la volonté de son père (1835–1840)\n"
        "- Semaine 3 – Compositrice, mère, virtuose (1840–1856)\n"
        "- Semaine 4 – Quarante années de plus sur scène (1856–1896)\n\n"
        "Chaque semaine associe des diapositives illustrées, un documentaire et une interprétation de son Trio avec piano (Carnegie Hall), des partitions interactives "
        "de ses lieder issues de la bibliothèque mymusic.coach, un enregistrement historique et un court quiz. Aucune connaissance préalable n’est nécessaire. "
        "Comptez environ 1 à 2 heures par semaine."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Voice'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'clara_portrait', 'title': 'Clara Schumann', 'subtitle': 'Vie et œuvre – Une première introduction', 'tag': 'Cours de 4 semaines'},
}
FOOTER = 'Clara Schumann : vie et œuvre'
PORTRAIT = {'image': 'clara_portrait', 'credit': 'Photographie de Franz Hanfstaengl, 1857 (domaine public)'}
COUPLE = {'image': 'clara_robert', 'credit': 'Clara et Robert Schumann, lithographie d’Eduard Kaiser, 1847 (domaine public)'}
TRAUMEREI = 'cmv2iz1yr00k812if2gksf8vb'

WEEKS = [
  {
    'title': 'Semaine 1 – Leipzig : une enfant prodige (1819–1835)',
    'lessons': [
      {
        'title': 'Bienvenue : à la rencontre de Clara Schumann', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Bienvenue dans ce cours ! Découvrez Clara Schumann – pianiste, compositrice, pédagogue et l’une des musiciennes les plus remarquables du XIXe siècle – et voyez comment se déroulent les quatre prochaines semaines.\n\nAstuce : ses lieder sont dans la bibliothèque mymusic.coach sous forme de partitions interactives – lisez-les, marquez vos préférés et gagnez des XP supplémentaires en les lisant jusqu’au bout.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 1', 'title': 'À la rencontre de Clara Schumann', 'subtitle': 'Une première introduction à sa vie et à sa musique', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Pourquoi Clara Schumann ?', 'bullets': [
              'Née Clara Wieck à Leipzig en 1819 – morte à Francfort en 1896',
              'L’une des plus grandes pianistes du XIXe siècle – plus de 60 ans sur scène',
              'Compositrice : un concerto pour piano, un trio avec piano, des lieder, des pièces pour piano',
              'Épouse du compositeur Robert Schumann, amie proche de Johannes Brahms',
              'Pendant des années, c’est elle qui gagna l’argent d’une famille de sept enfants']},
          {'kind': 'timeline', 'title': 'Vos quatre semaines', 'rows': [
              ('Semaine 1', 'Leipzig : une enfant prodige'),
              ('Semaine 2', 'Clara et Robert : un amour contre la volonté de son père'),
              ('Semaine 3', 'Compositrice, mère, virtuose'),
              ('Semaine 4', 'Quarante années de plus sur scène')]},
          {'kind': 'bullets', 'title': 'Une musicienne professionnelle', 'bullets': [
              'Contrairement à Fanny Hensel, Clara fut formée dès l’enfance pour une carrière publique',
              'Son père planifia chaque étape – des leçons aux tournées',
              'Elle devint célèbre dans toute l’Europe – à une époque où peu de femmes avaient un métier',
              'Mais composer, lui disait-on – et elle finit par le croire –, était une affaire d’hommes']},
        ],
      },
      {
        'title': 'L’élève de son père', 'type': 'SLIDES', 'minutes': 15,
        'description': "Friedrich Wieck avait un plan : sa fille serait une grande pianiste. Ces diapositives suivent l’enfance extraordinaire de Clara.",
        'slides': [
          {'kind': 'bullets', 'title': 'Leipzig, 13 septembre 1819', 'bullets': [
              'Son père Friedrich Wieck était professeur de piano et vendait des pianos ; sa mère Marianne Tromlitz était chanteuse et pianiste',
              'Ses parents se séparèrent quand elle avait quatre ans ; Clara resta avec son père',
              'Elle ne parla presque pas jusqu’à l’âge de quatre ans environ',
              'Dès cinq ans, son père lui donna des leçons quotidiennes : piano, théorie, violon, chant, composition']},
          {'kind': 'timeline', 'title': 'Une enfant vedette', 'rows': [
              ('1828', 'À 9 ans : première apparition au Gewandhaus de Leipzig'),
              ('1830', 'À 11 ans : son premier concert en soliste au Gewandhaus'),
              ('1831', 'Elle joue pour Goethe à Weimar, qui lui offre une médaille à son effigie'),
              ('1831–1832', 'Une tournée à Paris avec son père'),
              ('1831', 'Publication de son op. 1 : quatre polonaises')]},
          {'kind': 'bullets', 'title': 'Un nouveau pensionnaire', 'bullets': [
              'En 1830, un jeune étudiant en droit, Robert Schumann, s’installa chez les Wieck pour étudier le piano',
              'Il avait neuf ans de plus que Clara',
              'Il lui racontait des histoires de fantômes et jouait avec elle et ses frères',
              'Personne n’imaginait encore ce qui arriverait cinq ans plus tard']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Née le 13 septembre 1819 à Leipzig',
              'Formée chaque jour par son père, Friedrich Wieck',
              'À 11 ans : premier concert en soliste au Gewandhaus',
              'Robert Schumann vient vivre dans la maison comme élève de son père']},
        ],
      },
      {
        'title': 'Vidéo : à la rencontre de Robert et Clara Schumann', 'type': 'YOUTUBE', 'minutes': 12, 'video': 'https://www.youtube.com/watch?v=NK6HLaZ4kp4',
        'description': "Ce documentaire du Bachfest Malaysia présente Robert et Clara Schumann – leur vie, leur amour et leur musique. La vidéo est en anglais – activez si besoin les sous-titres automatiques de YouTube.\n\nPendant le visionnage, cherchez :\n1. Pourquoi le père de Clara combattit-il son mariage ?\n2. Comment Clara et Robert s’influencèrent-ils mutuellement en musique ?\n3. Qu’arriva-t-il à Robert en 1854 ?\n\nTout reviendra dans les semaines suivantes.",
      },
      {
        'title': 'Un concerto à quatorze ans – et quiz de la semaine 1', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "À 13 ans, Clara commença un concerto pour piano. Puis un court résumé et cinq questions.",
        'slides': [
          {'kind': 'bullets', 'title': 'Concerto pour piano en la mineur, op. 7', 'bullets': [
              'Commencé en 1833, quand Clara avait 13 ans ; le dernier mouvement fut orchestré avec l’aide de Robert',
              'Créé le 9 novembre 1835 au Gewandhaus – Clara au piano, Felix Mendelssohn à la direction',
              'Les trois mouvements s’enchaînent sans interruption',
              'Le mouvement lent est un duo intime pour piano et violoncelle solo – une idée inhabituelle à l’époque']},
          {'kind': 'summary', 'title': 'La semaine 1 en bref', 'bullets': [
              'Née à Leipzig en 1819 ; formée par son père dès cinq ans',
              'Premier concert en soliste au Gewandhaus à 11 ans ; elle joue pour Goethe',
              'Un concerto pour piano achevé à 16 ans, créé sous la direction de Mendelssohn',
              'Robert Schumann vit dans la maison comme élève de son père']},
        ],
        'quiz': [
          ('Dans quelle ville Clara Schumann est-elle née ?', ['Dresde', 'Leipzig', 'Francfort', 'Vienne'], 1),
          ('Qui fut le premier et principal professeur de Clara ?', ['Felix Mendelssohn', 'Son père, Friedrich Wieck', 'Robert Schumann', 'Franz Liszt'], 1),
          ('Quel célèbre poète l’entendit jouer en 1831 ?', ['Heine', 'Goethe', 'Schiller', 'Eichendorff'], 1),
          ('Qui dirigea la création de son Concerto pour piano en 1835 ?', ['Robert Schumann', 'Felix Mendelssohn', 'Johannes Brahms', 'Son père'], 1),
          ('Pourquoi Robert Schumann vivait-il chez les Wieck ?', ['C’était un cousin', 'Il était l’élève de piano de son père', 'Il y louait une boutique', 'Il était son professeur'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 2 – Clara et Robert : un amour contre la volonté de son père (1835–1840)',
    'lessons': [
      {
        'title': 'Des fiançailles secrètes', 'type': 'SLIDES', 'minutes': 15,
        'description': "Clara et Robert tombèrent amoureux quand elle avait seize ans. Son père fit tout pour les séparer.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 2', 'title': 'Clara et Robert', 'subtitle': '1835 – 1840', **COUPLE},
          {'kind': 'bullets', 'title': 'L’amour et l’interdit', 'bullets': [
              'En 1835, Clara et Robert tombèrent amoureux ; en 1837, ils se fiancèrent en secret',
              'Friedrich Wieck interdit tout contact – Robert avait peu d’argent et un avenir incertain',
              'Pendant de longues périodes, ils ne purent que s’écrire, souvent en cachette',
              'Leur musique devint un langage secret : ils se citaient mutuellement leurs thèmes']},
          {'kind': 'bullets', 'title': 'Vienne, 1838', 'bullets': [
              'Lors d’une tournée à Vienne en 1837–1838, Clara fit sensation',
              'À 18 ans, elle fut nommée virtuose de la chambre impériale et royale – la plus haute distinction autrichienne pour un musicien',
              'Exceptionnel pour une protestante, une étrangère – et si jeune',
              'Même le poète Franz Grillparzer écrivit un poème sur son jeu']},
          {'kind': 'timeline', 'title': 'Au tribunal par amour', 'rows': [
              ('1839', 'Clara et Robert poursuivent son père en justice pour obtenir le droit de se marier'),
              ('1840', 'Le tribunal leur donne raison'),
              ('12 septembre 1840', 'Ils se marient dans l’église du village de Schönefeld, près de Leipzig – la veille de ses 21 ans')]},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              '1837 : des fiançailles secrètes',
              '1838 : virtuose de la chambre impériale et royale à Vienne',
              '12 septembre 1840 : mariage, après un procès contre son père']},
        ],
      },
      {
        'title': 'Écouter : une musique pour Clara', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [TRAUMEREI, 0],
        'description': "Pendant les années de séparation, Robert écrivit beaucoup de ses plus belles œuvres pour piano – et Clara était dans toutes. En 1838, il lui écrivit qu’elle lui avait dit un jour qu’il lui semblait parfois un enfant – de là naquirent les « Scènes d’enfants » (Kinderszenen), une trentaine de petites pièces dont il garda treize.\n\nLa septième est « Rêverie » (Träumerei) – ici dans une version pour violoncelle, jouée par le violoncelliste belge Maurice Dambois sur un 78 tours de 1919.\n\nÉcoutez :\n1. Une seule mélodie courte et simple, qui monte et redescend encore et encore\n2. Comment les harmonies en dessous changent à chaque fois\n3. Puis demandez-vous : qu’a pu entendre Clara dans cette musique ?\n\nEn 1840, l’année de leur mariage, Robert écrivit plus de 100 lieder. Son cadeau de mariage fut le recueil « Myrthen » (Myrtes), qui s’ouvre sur « Widmung » (Dédicace).",
        'library': [(TRAUMEREI, 'Robert Schumann : « Rêverie » – Maurice Dambois, violoncelle, 1919'), ('cmv2iwhqx00f212ifgakf8i8u', 'Robert Schumann : Romance en fa dièse majeur – Olga Samaroff, piano, 1924')],
      },
      {
        'title': 'Lire : les lieder de Clara', 'type': 'SLIDES', 'minutes': 12,
        'description': "En 1841, Clara et Robert publièrent un recueil de lieder commun. Lisez les trois lieder de Clara qu’il contient.",
        'slides': [
          {'kind': 'bullets', 'title': 'Douze lieder du « Liebesfrühling »', 'bullets': [
              'Des poèmes de Friedrich Rückert, mis en musique par Robert et Clara',
              'Publiés en 1841 comme op. 37 de Robert et op. 12 de Clara – sans préciser qui avait écrit quel lied',
              'Les trois de Clara : « Er ist gekommen in Sturm und Regen », « Liebst du um Schönheit » et « Warum willst du and’re fragen »',
              'Les critiques ne parvenaient souvent pas à distinguer leurs lieder']},
          {'kind': 'listen', 'title': '« Liebst du um Schönheit »', 'work': '« Si tu aimes pour la beauté » – Lieder, op. 12', 'points': [
              '« Si tu aimes pour la beauté, ne m’aime pas – aime le soleil »',
              'Chaque strophe donne une raison de ne pas aimer : la beauté, la jeunesse, les trésors',
              'La dernière : « Si tu aimes par amour – oh oui, aime-moi ! »',
              'Remarquez comme la musique se réchauffe dans la dernière strophe – ouvrez la partition interactive']},
          {'kind': 'listen', 'title': '« Er ist gekommen in Sturm und Regen »', 'work': '« Il est venu dans la tempête et la pluie » – Lieder, op. 12', 'points': [
              'Une partie de piano orageuse et pressante – on entend la pluie',
              'La voix est essoufflée d’émotion',
              'Une chanson d’amour qui est aussi un tableau de la nature',
              'Comparez-la avec « Widmung » de Robert si vous la connaissez']},
        ],
        'library': [('cmuyfx8w200ye2eony5s6x9v2', '« Liebst du um Schönheit » – partition interactive'), ('cmuyfx8w200yd2eon215aey0k', '« Er ist gekommen in Sturm und Regen » – partition interactive'), ('cmuyfx8w300yf2eonkr9ncs19', '« Warum willst du and’re fragen » – partition interactive')],
      },
      {
        'title': 'Bilan de la semaine 2 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé de l’histoire d’amour, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 2 en bref', 'bullets': [
              '1835–1840 : Clara et Robert amoureux – contre la volonté de son père',
              '1838 : la plus haute distinction autrichienne pour un musicien, à 18 ans',
              '1840 : un procès – et le mariage le 12 septembre',
              '1841 : des lieder communs sur des poèmes de Rückert']},
        ],
        'quiz': [
          ('Pourquoi Clara et Robert allèrent-ils au tribunal ?', ['Pour de l’argent', 'Pour obtenir le droit de se marier', 'Pour un manuscrit volé', 'Pour un contrat de concert'], 1),
          ('Quand Clara et Robert se marièrent-ils ?', ['1835', '1838', '1840', '1854'], 2),
          ('Quelle distinction Clara reçut-elle à Vienne en 1838 ?', ['Une médaille d’or de Goethe', 'Virtuose de la chambre impériale et royale', 'Citoyenne d’honneur de Vienne', 'Maître de chapelle de la cour'], 1),
          ('Quel poète écrivit les textes de leurs lieder communs de 1841 ?', ['Heine', 'Friedrich Rückert', 'Goethe', 'Schiller'], 1),
          ('Que signifie « Träumerei » ?', ['Valse', 'Rêverie', 'Enfance', 'Adieu'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 3 – Compositrice, mère, virtuose (1840–1856)',
    'lessons': [
      {
        'title': 'Deux carrières sous un même toit', 'type': 'SLIDES', 'minutes': 15,
        'description': "Le mariage apporta le bonheur – et un difficile exercice d’équilibre entre les enfants, la composition de Robert et sa propre carrière.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 3', 'title': 'Compositrice, mère, virtuose', 'subtitle': '1840 – 1856', **COUPLE},
          {'kind': 'bullets', 'title': 'Un journal à deux', 'bullets': [
              'Clara et Robert tenaient ensemble un journal conjugal, écrivant à tour de rôle',
              'Ils étudiaient ensemble des fugues de Bach et des partitions',
              'Mais quand Robert composait, Clara ne pouvait pas travailler son piano – le logement était trop petit',
              'Entre 1841 et 1854, elle mit au monde huit enfants ; sept survécurent à la petite enfance']},
          {'kind': 'timeline', 'title': 'Lieux et œuvres', 'rows': [
              ('1844', 'Une longue tournée en Russie ; la famille s’installe à Dresde'),
              ('1846', 'Trio avec piano en sol mineur, op. 17 – sa plus grande œuvre de chambre'),
              ('1850', 'Installation à Düsseldorf, où Robert devient directeur de la musique'),
              ('1853', 'Trois Romances pour violon et piano, op. 22 ; Variations sur un thème de Robert, op. 20')]},
          {'kind': 'quote', 'quote': 'Rien ne surpasse la joie de créer, ne serait-ce que parce qu’on y gagne des heures d’oubli de soi.', 'by': 'Clara Schumann, journal, 1853'},
        ],
      },
      {
        'title': 'Vidéo : le Trio avec piano en sol mineur', 'type': 'YOUTUBE', 'minutes': 30, 'video': 'https://www.youtube.com/watch?v=H_Pc04tZzmg',
        'description': "Le Trio avec piano en sol mineur, op. 17 (1846) de Clara Schumann, joué par l’Ensemble Connect au Carnegie Hall.\n\nC’était l’œuvre la plus ambitieuse de Clara ; Robert écrivit son propre premier Trio avec piano l’année suivante. L’influence de Mendelssohn est nette – sa voix personnelle aussi.\n\nÉcoutez :\n1. Premier mouvement : un thème sombre et chantant au violon sur un piano fluide\n2. Deuxième mouvement : un « Scherzo » gracieux au tempo de menuet\n3. Troisième mouvement : un mouvement lent plein de tendresse\n4. Finale : un passage à la manière d’une fugue (un fugato) – Clara aimait Bach\n\nÀ méditer : pourquoi une compositrice capable d’une telle musique doutait-elle si souvent de son talent ?",
      },
      {
        'title': 'Brahms et la catastrophe de 1854', 'type': 'SLIDES', 'minutes': 15,
        'description': "En 1853, un jeune homme de Hambourg frappa à la porte des Schumann. Quelques mois plus tard, la vie de Clara s’effondra.",
        'slides': [
          {'kind': 'bullets', 'title': 'Johannes Brahms, 1853', 'bullets': [
              'Le 30 septembre 1853, Brahms, 20 ans, rendit visite aux Schumann à Düsseldorf',
              'Robert le présenta dans un article comme le génie à venir – « Voies nouvelles »',
              'Brahms et le violoniste Joseph Joachim devinrent les amis de toute une vie pour Clara',
              'Pendant plus de quarante ans, Brahms lui montra chacune de ses nouvelles œuvres']},
          {'kind': 'bullets', 'title': '1854', 'bullets': [
              'Robert souffrait depuis longtemps de dépressions ; en février 1854, sa maladie s’aggrava fortement',
              'Il se jeta dans le Rhin, fut sauvé et demanda à être conduit dans un asile à Endenich, près de Bonn',
              'Pendant plus de deux ans, les médecins interdirent à Clara de le voir',
              'Elle ne le revit que deux jours avant sa mort, le 29 juillet 1856']},
          {'kind': 'bullets', 'title': 'Elle renonce à composer', 'bullets': [
              'Après 1853, Clara n’écrivit presque plus de musique',
              'Elle avait sept enfants à nourrir – et devint le soutien de famille en tant que pianiste de tournée',
              'Brahms aida la famille à Düsseldorf pendant ses tournées',
              'Dès 1839, elle avait écrit : « Une femme ne doit pas vouloir composer – aucune n’en a encore été capable. Devrais-je être celle-là ? »']},
          {'kind': 'listen', 'title': 'Ses derniers lieder', 'work': '« Die stille Lotosblume » (1843) et les Six Lieder, op. 23 (1853)', 'points': [
              '« Die stille Lotosblume » : la fleur de lotus sur un lac paisible – se termine sur un accord ouvert, sans résolution',
              'Op. 23 : six lieder d’après « Jucunde » de Hermann Rollett – parmi ses dernières œuvres',
              'Ouvrez les partitions interactives et lisez-les']},
        ],
        'library': [('cmuyfx8u000y62eonvrbwvse4', '« Die stille Lotosblume » – partition interactive'), ('cmuyfx8u200yc2eonu34mmw4s', '« O Lust, o Lust », op. 23 – partition interactive')],
      },
      {
        'title': 'Bilan de la semaine 3 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années de mariage, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 3 en bref', 'bullets': [
              'Compositrice, pianiste de concert et mère de huit enfants',
              '1846 : Trio avec piano en sol mineur, op. 17',
              '1853 : Brahms et Joachim deviennent des amis pour la vie',
              '1854 : effondrement de Robert ; il meurt en 1856 – Clara cesse de composer']},
        ],
        'quiz': [
          ('Quelle est la plus grande œuvre de chambre de Clara ?', ['Un quatuor à cordes', 'Le Trio avec piano en sol mineur, op. 17', 'Une sonate pour violon', 'Un octuor'], 1),
          ('Qui frappa à la porte des Schumann en 1853 ?', ['Franz Liszt', 'Johannes Brahms', 'Richard Wagner', 'Frédéric Chopin'], 1),
          ('Quel violoniste devint l’ami de toute une vie de Clara ?', ['Niccolò Paganini', 'Joseph Joachim', 'Ferdinand David', 'Pablo de Sarasate'], 1),
          ('Quand Robert Schumann mourut-il ?', ['1847', '1854', '1856', '1896'], 2),
          ('Que fit Clara après 1854 pour faire vivre sa famille ?', ['Elle ouvrit une boutique', 'Elle partit en tournée comme pianiste', 'Elle se remaria', 'Elle vendit les manuscrits de Robert'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 4 – Quarante années de plus sur scène (1856–1896)',
    'lessons': [
      {
        'title': 'La reine du piano', 'type': 'SLIDES', 'minutes': 15,
        'description': "Pendant quatre décennies après la mort de Robert, Clara parcourut l’Europe. Elle changea la façon de donner des concerts – et de jouer du piano.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 4', 'title': 'Quarante années de plus sur scène', 'subtitle': '1856 – 1896', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Une pianiste d’un genre nouveau', 'bullets': [
              'Elle donna bien plus d’un millier de concerts dans toute l’Europe ; elle se rendit de nombreuses fois en Angleterre',
              'Elle fut l’une des premières à jouer régulièrement de mémoire',
              'Elle jouait de la musique exigeante – Bach, Beethoven, Chopin, Schumann, Brahms – et pas seulement des pièces de virtuosité',
              'Elle défendit la musique de Robert et publia plus tard l’édition de ses œuvres complètes']},
          {'kind': 'timeline', 'title': 'Les dernières années', 'rows': [
              ('1856', 'Robert meurt ; Clara poursuit sa carrière'),
              ('1863', 'Elle passe désormais ses étés à Baden-Baden'),
              ('1878', 'Professeure principale de piano au nouveau Conservatoire Hoch de Francfort'),
              ('1891', 'Son dernier concert public, à Francfort'),
              ('20 mai 1896', 'Meurt à Francfort à 76 ans ; inhumée auprès de Robert à Bonn')]},
          {'kind': 'bullets', 'title': 'La pédagogue', 'bullets': [
              'À Francfort, elle eut des élèves venus de toute l’Europe et d’Amérique',
              'Elle exigeait un son chantant et la fidélité à la partition',
              'Ses élèves transmirent son style au XXe siècle']},
        ],
      },
      {
        'title': 'Lire : « Lorelei »', 'type': 'SLIDES', 'minutes': 10,
        'description': "La « Lorelei » de Clara (1843) met en musique le célèbre poème de Heinrich Heine sur la sirène du Rhin – et la montre sous son jour le plus dramatique.",
        'slides': [
          {'kind': 'listen', 'title': '« Lorelei » (1843)', 'work': 'Lied sur un poème de Heinrich Heine', 'points': [
              'La Lorelei est assise sur un rocher au-dessus du Rhin et peigne ses cheveux d’or',
              'Son chant est si beau que les bateliers oublient les rochers – et sombrent',
              'La partie de piano de Clara coule comme le fleuve du début à la fin',
              'Très différente de la célèbre version populaire de Friedrich Silcher – ouvrez la partition interactive']},
          {'kind': 'summary', 'title': 'Les lieder de Clara dans la bibliothèque', 'bullets': [
              'Op. 12 et op. 13 (1840–1844) : Rückert, Heine et Geibel',
              'Op. 23 (1853) : six lieder sur des poèmes de Hermann Rollett',
              'Des lieder isolés comme « Lorelei » et « Die gute Nacht »',
              '17 de ses lieder sont dans la bibliothèque sous forme de partitions interactives']},
        ],
        'library': [('cmuyfx8w900yh2eon7yibchvi', '« Lorelei » – partition interactive'), ('cmuyfx8tz00y12eon3xbau5mx', '« Ich stand in dunklen Träumen », op. 13 – partition interactive')],
      },
      {
        'title': 'Clara Schumann aujourd’hui', 'type': 'SLIDES', 'minutes': 10,
        'description': "Comment on se souvient de Clara – et pourquoi sa musique est de plus en plus jouée.",
        'slides': [
          {'kind': 'bullets', 'title': 'Dans les mémoires', 'bullets': [
              'Dans la dernière série de billets allemands avant l’euro, elle figurait sur le billet de 100 marks',
              'Son bicentenaire, en 2019, suscita concerts, enregistrements et livres dans le monde entier',
              'Son Concerto pour piano, son Trio avec piano et ses Romances op. 22 sont de nouveau au répertoire',
              'Ses journaux et ses correspondances avec Robert et Brahms comptent parmi les grands documents du romantisme']},
          {'kind': 'summary', 'title': 'Pour aller plus loin', 'bullets': [
              'Continuez avec « Johannes Brahms », « Felix Mendelssohn » et « Fanny Hensel »',
              'Chanteurs : demandez à votre professeur « Liebst du um Schönheit »',
              'Pianistes : cherchez ses « Romances » et ses « Soirées musicales »']},
        ],
      },
      {
        'title': 'Bilan final et quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Félicitations – vous êtes arrivé au bout du cours ! Un dernier résumé et un quiz final sur les quatre semaines.",
        'slides': [
          {'kind': 'timeline', 'title': 'La vie de Clara Schumann en un coup d’œil', 'rows': [
              ('1819', 'Naissance à Leipzig le 13 septembre'),
              ('1830', 'Premier concert en soliste au Gewandhaus, à 11 ans'),
              ('1835', 'Création de son Concerto pour piano'),
              ('1840', 'Mariage avec Robert Schumann'),
              ('1846', 'Trio avec piano en sol mineur'),
              ('1853–1856', 'Brahms ; maladie et mort de Robert'),
              ('1896', 'Morte à Francfort le 20 mai')]},
        ],
        'quiz': [
          ('Pendant combien de temps Clara se produisit-elle en public ?', ['Environ 10 ans', 'Environ 30 ans', 'Plus de 60 ans', 'Seulement enfant'], 2),
          ('Qu’avaient d’inhabituel les concerts de Clara ?', ['Elle ne jouait que sa propre musique', 'Elle jouait souvent de mémoire', 'Elle jouait toujours avec orchestre', 'Elle ne jouait jamais Beethoven'], 1),
          ('Où Clara enseigna-t-elle à partir de 1878 ?', ['Au Conservatoire de Leipzig', 'Au Conservatoire Hoch de Francfort', 'Au Conservatoire de Paris', 'À la Royal Academy de Londres'], 1),
          ('Sur quel billet Clara Schumann figurait-elle ?', ['Le billet allemand de 100 marks', 'Le billet suisse de 50 francs', 'Le billet de 10 euros', 'Le billet autrichien de 1000 schillings'], 0),
          ('Sur quel poème repose son lied « Lorelei » ?', ['Goethe', 'Heinrich Heine', 'Rückert', 'Eichendorff'], 1),
          ('Combien de ses enfants survécurent à la petite enfance ?', ['Trois', 'Cinq', 'Sept', 'Neuf'], 2),
        ],
      },
    ],
  },
]
