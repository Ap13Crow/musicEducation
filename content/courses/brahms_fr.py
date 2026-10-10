# Johannes Brahms - version française de brahms.py.
COURSE = {
    'slug': 'brahms-vie-et-oeuvre-introduction',
    'language': 'fr',
    'translationOf': 'brahms-life-and-music-introduction',
    'title': 'Johannes Brahms : vie et œuvre – Une première introduction',
    'shortSummary': 'Quatre semaines avec Johannes Brahms : du port de Hambourg à Vienne – les Schumann, un Requiem allemand, les Danses hongroises, la Berceuse et quatre grandes symphonies.',
    'description': (
        "Johannes Brahms (1833–1897) grandit pauvre à Hambourg, fut salué à vingt ans par Robert Schumann comme le génie à venir et devint à Vienne "
        "le grand gardien de la tradition classique – tout en écrivant certaines des musiques les plus chaleureuses et passionnées du romantisme.\n\n"
        "En quatre semaines, vous suivez sa vie pas à pas :\n"
        "- Semaine 1 – Hambourg : fils de musicien (1833–1853)\n"
        "- Semaine 2 – Les Schumann et un Requiem allemand (1853–1868)\n"
        "- Semaine 3 – Vienne et les pas d’un géant : les symphonies (1862–1885)\n"
        "- Semaine 4 – Œuvres tardives, adieux et héritage (1886–1897)\n\n"
        "Chaque semaine associe des diapositives illustrées, un documentaire et l’Orchestre philharmonique de Berlin, des symphonies et un disque de 1913 issus "
        "de la bibliothèque mymusic.coach, des partitions interactives de ses lieder et un court quiz. Aucune connaissance préalable n’est nécessaire. "
        "Comptez environ 1 à 2 heures par semaine."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin', 'Voice'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'brahms_portrait', 'title': 'Brahms', 'subtitle': 'Vie et œuvre – Une première introduction', 'tag': 'Cours de 4 semaines'},
}
FOOTER = 'Johannes Brahms : vie et œuvre'
PORTRAIT = {'image': 'brahms_portrait', 'credit': 'Photographie de C. Brasch, Berlin, 1889 (domaine public)'}
YOUNG = {'image': 'brahms_young', 'credit': 'Dessin de Bonaventure Laurens, Düsseldorf, 1853 (domaine public)'}
SYMPHONY1 = 'cmuygtj1x00jz4kktyutlvk6x'
SYMPHONY4 = 'cmuygtizg00jk4kktfa0bejsv'
CRADLE = 'cmv2iqfgj004a12if6pg0lp0b'
HUNGARIAN5 = 'cmv2is2is007a12ifdj5md9d0'

WEEKS = [
  {
    'title': 'Semaine 1 – Hambourg : fils de musicien (1833–1853)',
    'lessons': [
      {
        'title': 'Bienvenue : à la rencontre de Brahms', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Bienvenue dans ce cours ! Découvrez l’homme à la barbe célèbre – qui fut un jour un jeune pianiste mince et timide – et voyez comment se déroulent les quatre prochaines semaines.\n\nAstuce : toute la musique citée dans le cours est liée depuis les leçons. Ouvrez-la dans la bibliothèque, lisez les partitions et gagnez des XP supplémentaires en écoutant ou en lisant jusqu’au bout.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 1', 'title': 'À la rencontre de Johannes Brahms', 'subtitle': 'Une première introduction à sa vie et à sa musique', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Pourquoi Brahms ?', 'bullets': [
              'Né à Hambourg en 1833 – mort à Vienne en 1897',
              'Quatre symphonies, deux concertos pour piano, un concerto pour violon, « Un Requiem allemand »',
              'Plus de 200 lieder, de la musique de chambre, des pièces pour piano – et les Danses hongroises',
              'Sa « Berceuse » (Wiegenlied) est l’une des mélodies les plus connues au monde',
              'Il unit les formes de Bach et de Beethoven à la chaleur romantique']},
          {'kind': 'timeline', 'title': 'Vos quatre semaines', 'rows': [
              ('Semaine 1', 'Hambourg : fils de musicien'),
              ('Semaine 2', 'Les Schumann et un Requiem allemand'),
              ('Semaine 3', 'Vienne et les pas d’un géant : les symphonies'),
              ('Semaine 4', 'Œuvres tardives, adieux et héritage')]},
          {'kind': 'bullets', 'title': 'Les « trois B »', 'bullets': [
              'Le chef d’orchestre Hans von Bülow appela Bach, Beethoven et Brahms les « trois B » de la musique',
              'Brahms était un compositeur moderne qui aimait la musique du passé',
              'Il étudia en profondeur la musique ancienne : Bach, Haendel, Schütz, et même des compositeurs de la Renaissance',
              'Schoenberg l’appela plus tard « Brahms le progressiste »']},
        ],
      },
      {
        'title': 'Une enfance près du port', 'type': 'SLIDES', 'minutes': 15,
        'description': "Brahms grandit dans une famille pauvre du quartier populeux du port de Hambourg. La musique fut son issue.",
        'slides': [
          {'kind': 'bullets', 'title': 'Hambourg, 7 mai 1833', 'bullets': [
              'Son père Johann Jakob était contrebassiste dans des orchestres de danse et de théâtre',
              'Sa mère Christiane était couturière, de 17 ans l’aînée de son mari',
              'La famille vivait dans de petites pièces de la vieille ville, près du port',
              'Johannes apprit le violon et le violoncelle avec son père – mais il aimait le piano']},
          {'kind': 'bullets', 'title': 'Deux bons professeurs', 'bullets': [
              'À sept ans, il commença le piano avec Otto Friedrich Cossel',
              'Cossel l’envoya chez son propre professeur, Eduard Marxsen, l’un des meilleurs musiciens de Hambourg',
              'Marxsen lui enseigna Bach et Beethoven – et la composition',
              'À dix ans, Johannes joua en public ; ses professeurs refusèrent une offre de tournée en Amérique']},
          {'kind': 'bullets', 'title': 'Gagner de l’argent très tôt', 'bullets': [
              'Adolescent, il jouait du piano pour faire danser dans des auberges et des tavernes, pour aider sa famille',
              'Il raconta plus tard à ses amis de sombres histoires sur ces nuits – les historiens débattent encore de leur véracité',
              'Il arrangeait aussi de la musique légère pour des éditeurs sous de faux noms',
              'Et il lisait tout : poésie, chansons populaires, histoire']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Né le 7 mai 1833 à Hambourg, fils d’un contrebassiste',
              'Professeurs : Otto Cossel et Eduard Marxsen',
              'Un adolescent qui jouait pour de l’argent – et lisait et composait à chaque heure libre']},
        ],
      },
      {
        'title': 'Vidéo : Brahms – sa vie et ses lieux', 'type': 'YOUTUBE', 'minutes': 22, 'video': 'https://www.youtube.com/watch?v=DyVmw5u9vjI',
        'description': "Ce documentaire d’opera-inside suit Brahms de Hambourg à Düsseldorf, Vienne et les lieux de villégiature où il composait, en musique du début à la fin. La vidéo est en anglais – activez si besoin les sous-titres automatiques de YouTube.\n\nPendant le visionnage, cherchez :\n1. Quel rôle Robert et Clara Schumann ont-ils joué dans sa vie ?\n2. Pourquoi sa première symphonie lui a-t-elle pris tant de temps ?\n3. Où passait-il ses étés à composer ?\n\nTout reviendra dans les semaines suivantes.",
      },
      {
        'title': '1853 : la route de Düsseldorf – et quiz de la semaine 1', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "En 1853, Brahms partit en tournée. À la fin de l’année, il était célèbre.",
        'slides': [
          {'kind': 'title', 'week': '1853', 'title': 'La route de Düsseldorf', 'subtitle': 'Brahms à 20 ans', **YOUNG},
          {'kind': 'timeline', 'title': 'L’année qui changea tout', 'rows': [
              ('Printemps 1853', 'Une tournée avec le violoniste hongrois Ede Reményi – Brahms découvre la musique « tzigane » hongroise'),
              ('Mai 1853', 'À Hanovre, il rencontre le grand violoniste Joseph Joachim, qui devient un ami pour la vie'),
              ('Juin 1853', 'À Weimar, il rencontre Franz Liszt – mais ne se sent pas à sa place dans son cercle'),
              ('30 sept. 1853', 'Avec une lettre de Joachim, il frappe à la porte des Schumann à Düsseldorf')]},
          {'kind': 'summary', 'title': 'La semaine 1 en bref', 'bullets': [
              'Né à Hambourg en 1833, fils d’un contrebassiste',
              'Formé à Bach et Beethoven par Cossel et Marxsen',
              'Adolescent, il jouait pour gagner de l’argent',
              '1853 : Reményi, Joachim, Liszt – et les Schumann']},
        ],
        'quiz': [
          ('Dans quelle ville Brahms est-il né ?', ['Vienne', 'Hambourg', 'Berlin', 'Leipzig'], 1),
          ('De quel instrument jouait le père de Brahms ?', ['Le piano', 'La contrebasse', 'La trompette', 'L’orgue'], 1),
          ('Qui fut le principal professeur de Brahms à Hambourg ?', ['Eduard Marxsen', 'Robert Schumann', 'Franz Liszt', 'Felix Mendelssohn'], 0),
          ('Quel violoniste devint son ami pour la vie en 1853 ?', ['Ede Reményi', 'Joseph Joachim', 'Niccolò Paganini', 'Pablo de Sarasate'], 1),
          ('Qui sont les « trois B » de la musique ?', ['Bach, Beethoven, Brahms', 'Bach, Bruckner, Berlioz', 'Beethoven, Bellini, Bizet', 'Brahms, Bartók, Britten'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 2 – Les Schumann et un Requiem allemand (1853–1868)',
    'lessons': [
      {
        'title': 'Robert et Clara Schumann', 'type': 'SLIDES', 'minutes': 15,
        'description': "Robert Schumann le proclama génie publiquement – puis tomba malade. Brahms resta aux côtés de Clara jusqu’à la fin de sa vie.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 2', 'title': 'Les Schumann et un Requiem allemand', 'subtitle': '1853 – 1868', **YOUNG},
          {'kind': 'bullets', 'title': '« Voies nouvelles », octobre 1853', 'bullets': [
              'Robert Schumann entendit Brahms jouer ses propres sonates et fut bouleversé',
              'Dans sa revue, il publia un article intitulé « Neue Bahnen » (Voies nouvelles)',
              'Il y présentait Brahms comme le jeune homme « appelé à exprimer de manière idéale la plus haute expression de son temps »',
              'Du jour au lendemain, le jeune homme de 20 ans était célèbre – et sous une énorme pression']},
          {'kind': 'bullets', 'title': '1854–1856', 'bullets': [
              'En février 1854, Robert Schumann tomba gravement malade et fut conduit dans un asile',
              'Brahms s’installa à Düsseldorf pour aider Clara et ses sept enfants',
              'Il tomba profondément amoureux de Clara, de 14 ans son aînée',
              'Après la mort de Robert en 1856, ils restèrent amis intimes pendant quarante ans – il ne se maria jamais']},
          {'kind': 'bullets', 'title': 'Concerto pour piano n° 1, 1859', 'bullets': [
              'Il fut d’abord une sonate pour deux pianos, puis une symphonie, avant de devenir un concerto',
              'Son début orageux est souvent associé au choc de la maladie de Schumann',
              'Lors de l’exécution à Leipzig en janvier 1859, le public siffla',
              'Brahms écrivit à Joachim : « J’expérimente et je tâtonne encore » – et il continua']},
        ],
      },
      {
        'title': 'Écouter : les Danses hongroises', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [HUNGARIAN5, 0],
        'description': "La tournée avec Reményi en 1853 fit découvrir à Brahms le style ardent des orchestres tsiganes hongrois. Il en recueillit les airs et publia en 1869 les premières Danses hongroises pour piano à quatre mains. Elles connurent un immense succès et l’enrichirent.\n\nBrahms les appelait des « arrangements » et non ses propres compositions, car la plupart des mélodies étaient des airs populaires. Joachim les arrangea pour violon et piano.\n\nVoici la n° 5 – la plus célèbre – dans l’arrangement de Joachim, sur un disque Edison de 1913.\n\nÉcoutez :\n1. Les changements de tempo soudains – lent, puis très rapide\n2. Le style ardent et sanglotant du violon\n3. Une partie centrale joyeuse en majeur\n\nRegardez ensuite l’Orchestre philharmonique de Berlin jouer la version pour orchestre dans la leçon suivante.",
        'library': [(HUNGARIAN5, 'Danse hongroise n° 5 – 78 tours, 1913'), ('cmv2is0ce007812if2ho6w8s1', 'Danse hongroise n° 1 – Orchestre de Philadelphie, 1922')],
      },
      {
        'title': 'Un Requiem allemand et la Berceuse', 'type': 'SLIDES', 'minutes': 15,
        'description': "Deux œuvres très différentes des mêmes années : un grand requiem choral pour les vivants – et une berceuse pour le bébé d’une amie.",
        'slides': [
          {'kind': 'bullets', 'title': '« Ein deutsches Requiem »', 'bullets': [
              'La mère de Brahms mourut en 1865 ; le travail sur le Requiem devint plus pressant',
              'Pas une messe des morts en latin : Brahms choisit lui-même des textes bibliques en allemand',
              'Il console les vivants : « Heureux ceux qui pleurent, car ils seront consolés »',
              'Créé dans la cathédrale de Brême le Vendredi saint 1868 ; les sept mouvements complets à Leipzig en 1869',
              'Il rendit Brahms célèbre dans toute l’Europe']},
          {'kind': 'listen', 'title': 'La « Berceuse »', 'work': 'Wiegenlied, op. 49 n° 4 (1868)', 'points': [
              '« Guten Abend, gut’ Nacht » – écrite pour le deuxième fils de son amie Bertha Faber',
              'L’accompagnement cite une chanson viennoise que Bertha lui chantait des années plus tôt',
              'Une mélodie simple et berçante que le monde entier connaît aujourd’hui',
              'Lisez la partition et écoutez le grand pianiste Alfred Cortot la jouer sur un disque de 1925']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              '1853 : les « Voies nouvelles » de Schumann rendent Brahms célèbre',
              'Une amitié de toute une vie avec Clara Schumann',
              '1868–1869 : « Un Requiem allemand » – sa consécration',
              '1868 : la Berceuse ; 1869 : les Danses hongroises']},
        ],
        'library': [('cmuyfx7o3003t2eon3amkh63k', 'Wiegenlied, op. 49 n° 4 – partition interactive'), (CRADLE, 'Berceuse – Alfred Cortot, piano, 1925')],
      },
      {
        'title': 'Bilan de la semaine 2 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années Schumann et du Requiem, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 2 en bref', 'bullets': [
              '« Voies nouvelles » : le célèbre article de Schumann sur Brahms, 20 ans',
              '1854 : maladie de Robert ; Brahms soutient Clara',
              '1859 : le Premier Concerto pour piano est sifflé à Leipzig',
              '1868 : « Un Requiem allemand » – et la Berceuse']},
        ],
        'quiz': [
          ('Quel était le titre de l’article de Schumann sur Brahms ?', ['« Chapeau bas, messieurs »', '« Voies nouvelles »', '« La musique de l’avenir »', '« Un jeune génie »'], 1),
          ('Qu’ont de particulier les textes d’« Un Requiem allemand » ?', ['Ils sont en latin', 'Brahms choisit lui-même des textes bibliques en allemand', 'Ils sont de Goethe', 'Il n’y a pas de paroles'], 1),
          ('Pour qui Brahms écrivit-il sa « Berceuse » ?', ['Pour la fille de Clara Schumann', 'Pour le bébé de son amie Bertha Faber', 'Pour son propre fils', 'Pour la reine Victoria'], 1),
          ('Que se passa-t-il en 1859 à Leipzig lors de son Premier Concerto pour piano ?', ['Un triomphe', 'Le public siffla', 'Il fut annulé', 'Brahms tomba malade'], 1),
          ('Comment Brahms qualifiait-il ses Danses hongroises ?', ['Ses plus grandes œuvres', 'Des arrangements d’airs populaires', 'Des symphonies', 'De la musique d’église'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 3 – Vienne et les pas d’un géant (1862–1885)',
    'lessons': [
      {
        'title': 'Vienne et la Première Symphonie', 'type': 'SLIDES', 'minutes': 15,
        'description': "Brahms s’installa à Vienne, la ville de Beethoven et de Schubert. Écrire une symphonie après Beethoven lui prit plus de vingt ans.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 3', 'title': 'Vienne et les pas d’un géant', 'subtitle': '1862 – 1885', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Un Viennois de Hambourg', 'bullets': [
              'Brahms vint pour la première fois à Vienne en 1862 et s’y établit bientôt pour de bon',
              'Il dirigea la Singakademie, puis les concerts de la Gesellschaft der Musikfreunde',
              'À partir de 1872, il vécut dans un modeste appartement au 4 Karlsgasse',
              'Chaque été, il quittait la ville pour composer à la campagne']},
          {'kind': 'quote', 'quote': 'Tu n’as pas idée de ce que l’on ressent quand on entend toujours derrière soi les pas d’un géant comme lui.', 'by': 'Brahms à propos de Beethoven, selon le souvenir du chef Hermann Levi'},
          {'kind': 'bullets', 'title': 'Symphonie n° 1 en ut mineur, 1876', 'bullets': [
              'Premières esquisses dans les années 1850 ; achevée seulement en 1876, à 43 ans',
              'Créée à Karlsruhe le 4 novembre 1876',
              'La grande mélodie du finale rappelle l’« Ode à la joie » de Beethoven – Brahms dit : « N’importe quel âne le voit »',
              'Hans von Bülow l’appela « la Dixième de Beethoven »']},
        ],
      },
      {
        'title': 'Écouter : la Première Symphonie', 'type': 'AUDIO', 'minutes': 17, 'libraryAudio': [SYMPHONY1, 3],
        'description': "Voici le dernier mouvement de la Symphonie n° 1 (enregistrement Musopen, domaine public) – le moment où, après une longue lutte sombre, la musique éclate en ut majeur.\n\nÉcoutez :\n1. Une introduction lente et mystérieuse en mineur\n2. Un cor solo joue une large mélodie de cor des Alpes – Brahms l’avait envoyée à Clara en 1868 sur une carte d’anniversaire depuis la Suisse, avec ces mots : « Haut sur la montagne, au fond de la vallée, je te salue mille fois »\n3. Un choral solennel des trombones\n4. Puis le grand thème principal aux cordes – celui qui rappelait Beethoven à tous\n\nLa symphonie complète est dans la bibliothèque.",
        'library': [(SYMPHONY1, 'Symphonie n° 1 en ut mineur – enregistrement complet')],
      },
      {
        'title': 'Vidéo : Danse hongroise n° 5', 'type': 'YOUTUBE', 'minutes': 3, 'video': 'https://www.youtube.com/watch?v=QAMxkietiik',
        'description': "Claudio Abbado dirige l’Orchestre philharmonique de Berlin dans la version pour orchestre de la Danse hongroise n° 5.\n\nComparez avec le disque pour violon de 1913 entendu en semaine 2 :\n1. Quelle version est la plus ardente ?\n2. Comment l’orchestre exploite-t-il les changements de tempo soudains ?\n3. Quels instruments reçoivent la mélodie ?\n\nÀ méditer : la musique légère de Brahms l’enrichit – et lui donna la liberté de prendre vingt ans pour une symphonie.",
      },
      {
        'title': 'Les grandes années – et quiz de la semaine 3', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "Après la Première Symphonie, les vannes s’ouvrirent. Un résumé et cinq questions.",
        'slides': [
          {'kind': 'timeline', 'title': 'Chefs-d’œuvre, 1877–1885', 'rows': [
              ('1877', 'Symphonie n° 2 – ensoleillée, écrite en un été au bord du lac Wörthersee'),
              ('1878', 'Concerto pour violon, pour Joseph Joachim'),
              ('1880', 'Ouverture pour une fête académique – remerciement pour un doctorat honoris causa, bâtie sur des chansons d’étudiants'),
              ('1881', 'Concerto pour piano n° 2'),
              ('1883', 'Symphonie n° 3'),
              ('1885', 'Symphonie n° 4')]},
          {'kind': 'bullets', 'title': 'Brahms contre Wagner ?', 'bullets': [
              'Des critiques comme Eduard Hanslick firent de Brahms le héros de la musique « pure »',
              'Leurs adversaires célébraient la « musique de l’avenir » de Wagner et Liszt',
              'Les journaux adoraient la querelle ; Brahms lui-même admirait le métier de Wagner',
              'Aujourd’hui, nous pouvons simplement aimer les deux']},
        ],
        'quiz': [
          ('Dans quelle ville Brahms s’établit-il ?', ['Hambourg', 'Vienne', 'Leipzig', 'Berlin'], 1),
          ('Quel âge avait Brahms lors de la création de sa Première Symphonie ?', ['23 ans', '33 ans', '43 ans', '53 ans'], 2),
          ('Qui appela la Première Symphonie « la Dixième de Beethoven » ?', ['Clara Schumann', 'Hans von Bülow', 'Richard Wagner', 'Eduard Hanslick'], 1),
          ('Pour qui Brahms écrivit-il son Concerto pour violon ?', ['Reményi', 'Joseph Joachim', 'Paganini', 'Clara Schumann'], 1),
          ('Sur quoi repose l’Ouverture pour une fête académique ?', ['Sur des cantiques', 'Sur des chansons d’étudiants', 'Sur des danses hongroises', 'Sur des chansons populaires de Hambourg'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 4 – Œuvres tardives, adieux et héritage (1886–1897)',
    'lessons': [
      {
        'title': 'Écouter : la Quatrième Symphonie', 'type': 'AUDIO', 'minutes': 12, 'libraryAudio': [SYMPHONY4, 3],
        'description': "La dernière symphonie de Brahms (1885) se termine par un mouvement unique parmi les finales de symphonie : 30 variations sur un thème de huit mesures répété – une passacaille, forme baroque ancienne. Le thème est adapté du dernier mouvement de la Cantate n° 150 de Bach.\n\nÉcoutez (enregistrement Musopen, domaine public) :\n1. Le thème : huit accords forte aux vents et aux trombones\n2. Un long solo de flûte solitaire au milieu, dans un tempo lent\n3. Le retour des trombones avec le thème en choral solennel\n4. Une fin dramatique et tragique en mi mineur\n\nLa tradition de Bach et la symphonie romantique réunies en un seul mouvement. La symphonie complète est dans la bibliothèque.",
        'library': [(SYMPHONY4, 'Symphonie n° 4 en mi mineur – enregistrement complet')],
      },
      {
        'title': 'Œuvres tardives et adieux', 'type': 'SLIDES', 'minutes': 15,
        'description': "En 1890, Brahms voulut cesser de composer. Un clarinettiste le fit changer d’avis.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 4', 'title': 'Œuvres tardives et adieux', 'subtitle': '1886 – 1897', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Le dernier chapitre', 'bullets': [
              '1890 : Brahms pensait prendre sa retraite',
              '1891 : à Meiningen, il entendit le clarinettiste Richard Mühlfeld et écrivit pour lui quatre œuvres, dont le Quintette avec clarinette',
              '1892–1893 : vingt courtes pièces pour piano, op. 116–119 – intimes et automnales',
              'L’Intermezzo op. 118 n° 2 est l’un des plus aimés ; le recueil est dédié à Clara']},
          {'kind': 'bullets', 'title': '1896–1897', 'bullets': [
              'En mai 1896, alors que Clara Schumann se mourait, il écrivit les « Quatre chants sérieux » sur des textes bibliques',
              'Clara mourut le 20 mai 1896 ; Brahms faillit manquer ses obsèques après s’être trompé de train',
              'Il était déjà atteint du cancer du foie qui avait emporté son père',
              'Il mourut à Vienne le 3 avril 1897 et repose près de Beethoven et de Schubert']},
          {'kind': 'listen', 'title': 'À lire', 'work': 'Intermezzo en la majeur, op. 118 n° 2', 'points': [
              'Une mélodie tendre qui semble poser une question',
              'La réponse est la même mélodie, renversée',
              'Une partie centrale plus sombre – puis de nouveau la question',
              'Ouvrez la partition dans la bibliothèque']},
        ],
        'library': [('cmuygw9cz01vx4kktx94zuyj2', 'Intermezzo, op. 118 n° 2 – partition'), ('cmuyfx7nv003f2eonhfi0j60a', '« O Tod, wie bitter bist du » (Quatre chants sérieux) – partition interactive')],
      },
      {
        'title': 'Lire : les lieder de Brahms', 'type': 'SLIDES', 'minutes': 10,
        'description': "Brahms écrivit plus de 200 lieder. En voici trois à lire dans la bibliothèque.",
        'slides': [
          {'kind': 'bullets', 'title': 'Un compositeur de lieder enraciné dans la chanson populaire', 'bullets': [
              'Brahms aimait les chansons populaires allemandes et en arrangea des dizaines',
              'Son idéal : une mélodie si naturelle qu’elle semble avoir toujours existé',
              'Il écrivait souvent pour voix graves – il aimait les couleurs chaudes et sombres']},
          {'kind': 'listen', 'title': 'Trois lieder à lire', 'work': 'Lieder de la bibliothèque mymusic.coach', 'points': [
              '« Von ewiger Liebe » (op. 43 n° 1) : un dialogue dramatique entre deux amoureux',
              '« Die Mainacht » (op. 43 n° 2) : une nuit de mai lente et solitaire',
              '« Wie bist du, meine Königin » (op. 32 n° 9) : un chant d’amour extatique',
              'Ouvrez les partitions interactives et suivez la voix et le piano']},
          {'kind': 'bullets', 'title': 'Héritage', 'bullets': [
              'Dvořák dut à Brahms sa première percée – voir le cours sur Dvořák',
              'Schoenberg admirait ses techniques de développement d’une mélodie',
              'Ses symphonies et concertos sont au cœur du répertoire orchestral',
              'Ami de Johann Strauss fils, il écrivit sur l’éventail d’Adele, l’épouse de Strauss, le thème du « Beau Danube bleu » : « Hélas pas de Johannes Brahms »']},
        ],
        'library': [('cmuyfx7nw003h2eonnbz6isg0', '« Von ewiger Liebe », op. 43 – partition interactive'), ('cmuyfx7nw003i2eonp5lv7at1', '« Die Mainacht », op. 43 – partition interactive'), ('cmuyfx7rf005t2eonamwbfokb', '« Wie bist du, meine Königin », op. 32 – partition interactive')],
      },
      {
        'title': 'Bilan final et quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Félicitations – vous êtes arrivé au bout du cours ! Un dernier résumé et un quiz final sur les quatre semaines.",
        'slides': [
          {'kind': 'timeline', 'title': 'La vie de Brahms en un coup d’œil', 'rows': [
              ('1833', 'Naissance à Hambourg le 7 mai'),
              ('1853', 'Joachim, Liszt et les Schumann ; « Voies nouvelles »'),
              ('1862', 'Première visite à Vienne, bientôt sa ville'),
              ('1868', '« Un Requiem allemand » ; la Berceuse'),
              ('1876', 'Symphonie n° 1'),
              ('1885', 'Symphonie n° 4'),
              ('1897', 'Mort à Vienne le 3 avril')]},
        ],
        'quiz': [
          ('Quelle forme baroque ancienne conclut la Quatrième Symphonie ?', ['Une fugue', 'Une passacaille – des variations sur un thème répété', 'Un menuet', 'Une toccata'], 1),
          ('Pour quel instrument Brahms écrivit-il ses œuvres de chambre tardives destinées à Mühlfeld ?', ['La flûte', 'La clarinette', 'Le cor', 'Le hautbois'], 1),
          ('Quelles pièces pour piano sont dédiées à Clara Schumann ?', ['Les Danses hongroises', 'Les six pièces op. 118', 'Les Valses op. 39', 'Les Ballades op. 10'], 1),
          ('Qu’écrivit Brahms pendant que Clara Schumann se mourait ?', ['Un Requiem allemand', 'Les Quatre chants sérieux', 'La Berceuse', 'La Symphonie n° 4'], 1),
          ('Où Brahms est-il enterré ?', ['À Hambourg', 'À Vienne, près de Beethoven et de Schubert', 'À Bonn, auprès des Schumann', 'À Leipzig'], 1),
          ('Quelle valse célèbre Brahms aurait-il aimé avoir écrite ?', ['La Valse « Minute » de Chopin', '« Le Beau Danube bleu » de Johann Strauss', 'La Valse des fleurs de Tchaïkovski', 'Les Ländler de Schubert'], 1),
        ],
      },
    ],
  },
]
