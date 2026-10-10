# Wolfgang Amadeus Mozart - version française de mozart.py.
COURSE = {
    'slug': 'mozart-vie-et-oeuvre-introduction',
    'language': 'fr',
    'translationOf': 'mozart-life-and-music-introduction',
    'title': 'Wolfgang Amadeus Mozart : vie et œuvre – Une première introduction',
    'shortSummary': 'Quatre semaines avec Mozart : l’enfant prodige de Salzbourg qui parcourut l’Europe, conquit Vienne et écrivit La Flûte enchantée et le Requiem avant de mourir à 35 ans.',
    'description': (
        "Wolfgang Amadeus Mozart (1756–1791) donna ses premiers concerts à six ans, écrivit sa première symphonie à huit et composa plus de 600 œuvres "
        "en seulement 35 ans de vie – opéras, symphonies, concertos, musique de chambre et musique sacrée.\n\n"
        "En quatre semaines, vous suivez sa vie pas à pas :\n"
        "- Semaine 1 – L’enfant prodige de Salzbourg (1756–1766)\n"
        "- Semaine 2 – Grandir sur les routes, puis s’affranchir (1766–1781)\n"
        "- Semaine 3 – Vienne : musicien indépendant, Les Noces de Figaro et Don Giovanni (1781–1788)\n"
        "- Semaine 4 – Les dernières années : La Flûte enchantée et le Requiem (1788–1791)\n\n"
        "Chaque semaine associe des diapositives illustrées, des vidéos (dont la Reine de la nuit au Royal Opera House), des enregistrements et partitions "
        "de la bibliothèque mymusic.coach et un court quiz. Aucune connaissance préalable n’est nécessaire. Comptez environ 1 à 2 heures par semaine."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin', 'Voice'],
    'musicStyles': ['Classical', 'Opera'],
    'cover': {'image': 'mozart_portrait', 'title': 'Mozart', 'subtitle': 'Vie et œuvre – Une première introduction', 'tag': 'Cours de 4 semaines'},
}
FOOTER = 'Wolfgang Amadeus Mozart : vie et œuvre'
PORTRAIT = {'image': 'mozart_portrait', 'credit': 'Portrait posthume par Barbara Krafft, 1819 (domaine public)'}
SYMPHONY_40 = 'cmuygtj2l00l84kktos5ni9rf'

WEEKS = [
  {
    'title': 'Semaine 1 – L’enfant prodige de Salzbourg (1756–1766)',
    'lessons': [
      {
        'title': 'Bienvenue : à la rencontre de Mozart', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Bienvenue dans ce cours ! Découvrez Wolfgang Amadeus Mozart et voyez comment se déroulent les quatre prochaines semaines.\n\nAstuce : toute la musique citée dans le cours est liée depuis les leçons. Ouvrez-la dans la bibliothèque, lisez les partitions et gagnez des XP supplémentaires en lisant ou en écoutant jusqu’au bout.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 1', 'title': 'À la rencontre de Wolfgang Amadeus Mozart', 'subtitle': 'Une première introduction à sa vie et à sa musique', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Pourquoi Mozart ?', 'bullets': [
              'Né à Salzbourg en 1756 – mort à Vienne en 1791, à seulement 35 ans',
              'Un enfant prodige qui parcourut l’Europe pendant des années avec sa famille',
              'Il écrivit dans tous les genres de son temps – et excella dans chacun',
              'Ses opéras comptent parmi les plus joués au monde',
              'Avec Haydn et Beethoven, le grand maître du style classique']},
          {'kind': 'timeline', 'title': 'Vos quatre semaines', 'rows': [
              ('Semaine 1', 'L’enfant prodige de Salzbourg (1756–1766)'),
              ('Semaine 2', 'Grandir sur les routes – puis s’affranchir (1766–1781)'),
              ('Semaine 3', 'Vienne : Figaro et Don Giovanni (1781–1788)'),
              ('Semaine 4', 'La Flûte enchantée et le Requiem (1788–1791)')]},
          {'kind': 'bullets', 'title': 'Qu’est-ce que le style « classique » ?', 'bullets': [
              'La musique d’environ 1750 à 1820 : Haydn, Mozart, le jeune Beethoven',
              'Des mélodies claires et chantantes sur un accompagnement simple',
              'Des phrases équilibrées – comme des questions et des réponses',
              'De nouvelles formes devenues la norme : la symphonie, le quatuor à cordes, la sonate']},
          {'kind': 'quote', 'quote': 'La mélodie est l’essence de la musique.', 'by': 'Attribué à Wolfgang Amadeus Mozart'},
        ],
      },
      {
        'title': 'Un enfant prodige en tournée', 'type': 'SLIDES', 'minutes': 15,
        'description': "Avant ses dix ans, Mozart avait joué devant une impératrice, un roi et une reine, et s’était fait entendre à Paris et à Londres. Ces diapositives racontent comment.",
        'slides': [
          {'kind': 'image', 'title': 'Salzbourg, 27 janvier 1756', 'text': 'Johannes Chrysostomus Wolfgangus Theophilus Mozart est né dans cette maison de la Getreidegasse. « Theophilus » signifie « aimé de Dieu » – en latin « Amadeus », le nom qu’il aima utiliser plus tard.', 'image': 'mozart_birthplace', 'credit': 'Maison natale de Mozart, Salzbourg (photo : Immanuel Giel, domaine public)'},
          {'kind': 'bullets', 'title': 'Père et professeur : Leopold Mozart', 'bullets': [
              'Leopold était violoniste et compositeur à la cour du prince-archevêque de Salzbourg',
              'Sa méthode de violon, publiée en 1756, fut utilisée dans toute l’Europe',
              'Il enseigna lui-même à Wolfgang et à sa sœur aînée Maria Anna – « Nannerl »',
              'Wolfgang écrivit ses premières petites pièces à cinq ans ; Leopold les nota']},
          {'kind': 'timeline', 'title': 'Sur les routes', 'rows': [
              ('1762', 'Premiers voyages : Munich, puis Vienne – il joue devant l’impératrice Marie-Thérèse'),
              ('1763–1766', 'Le « grand voyage » : trois ans et demi à travers l’Allemagne, Paris, Londres et les Pays-Bas'),
              ('1764', 'Londres : amitié avec Johann Christian Bach ; sa première symphonie'),
              ('1764', 'À Paris, ses premières œuvres sont imprimées – des sonates pour clavier et violon'),
              ('1766', 'Retour à Salzbourg')]},
          {'kind': 'bullets', 'title': 'Se montrer – et apprendre', 'bullets': [
              'Le public le mettait à l’épreuve : jouer avec un tissu sur les touches, nommer des notes, déchiffrer n’importe quoi',
              'Mais les tournées furent surtout une école : Wolfgang absorbait chaque style entendu',
              'Nannerl était elle aussi une brillante claviériste – mais, étant une fille, sa carrière s’arrêta à l’âge adulte']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Né à Salzbourg le 27 janvier 1756',
              'Formé par son père Leopold, avec sa sœur Nannerl',
              'Une tournée européenne de trois ans et demi à partir de sept ans',
              'Londres : J. C. Bach et sa première symphonie']},
        ],
      },
      {
        'title': 'Vidéo : la vie de Mozart et ses lieux', 'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=fC0_h3-ZH0Q',
        'description': "Ce documentaire visite les lieux où Mozart a vécu et travaillé – de Salzbourg à Vienne, à travers l’Europe. La vidéo est en anglais – activez si besoin les sous-titres automatiques de YouTube.\n\nPendant le visionnage, cherchez :\n1. Quelles villes la famille Mozart a-t-elle visitées pendant ses tournées ?\n2. Pourquoi Mozart a-t-il quitté Salzbourg pour de bon ?\n3. Lesquels de ses opéras ont été créés à Prague ?\n\nPas besoin de tout retenir : chaque partie reviendra dans les semaines suivantes.",
      },
      {
        'title': 'Bilan de la semaine 1 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Un court résumé, une première pièce à découvrir et cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 1 en bref', 'bullets': [
              'Né à Salzbourg le 27 janvier 1756',
              'Son père Leopold : violoniste, compositeur et professeur',
              'Sa sœur Nannerl : une claviériste douée',
              '1763–1766 : le grand voyage – Paris, Londres, les Pays-Bas',
              'Première symphonie à Londres, à huit ans']},
          {'kind': 'bullets', 'title': 'À découvrir cette semaine', 'bullets': [
              'Les 12 Variations de Mozart sur « Ah ! vous dirai-je, maman » – l’air que l’on chante aussi sur « Twinkle, Twinkle, Little Star »',
              'Il les écrivit à Vienne vers 1781–1782 – elles montrent à merveille comment il aimait jouer avec une mélodie simple',
              'Ouvrez la partition et retrouvez l’air dans chaque variation']},
        ],
        'library': [('cmuygwa26027v4kktd1gb78bx', 'Variations sur « Ah ! vous dirai-je, maman » – partition')],
        'quiz': [
          ('Dans quelle ville Mozart est-il né ?', ['Vienne', 'Salzbourg', 'Prague', 'Munich'], 1),
          ('Qui fut le premier professeur de Mozart ?', ['Joseph Haydn', 'Son père Leopold', 'Johann Christian Bach', 'Antonio Salieri'], 1),
          ('Comment s’appelait la sœur de Mozart, elle aussi claviériste douée ?', ['Constanze', 'Nannerl (Maria Anna)', 'Aloysia', 'Fanny'], 1),
          ('Où Mozart écrivit-il sa première symphonie, à huit ans ?', ['Salzbourg', 'Paris', 'Londres', 'Rome'], 2),
          ('Quel air est « Ah ! vous dirai-je, maman » ?', ['Joyeux anniversaire', 'L’air de « Twinkle, Twinkle, Little Star »', 'Frère Jacques', 'Douce nuit'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 2 – Grandir sur les routes, puis s’affranchir (1766–1781)',
    'lessons': [
      {
        'title': 'L’Italie, Salzbourg et la recherche d’un poste', 'type': 'SLIDES', 'minutes': 15,
        'description': "Adolescent, Mozart conquit l’Italie. Jeune homme, il se sentit prisonnier à Salzbourg – jusqu’à sa rupture de 1781.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 2', 'title': 'Grandir – et s’affranchir', 'subtitle': '1766 – 1781', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Triomphe en Italie', 'bullets': [
              'Entre 1769 et 1773, Mozart et son père firent trois voyages en Italie',
              'À Rome, il entendit à la chapelle Sixtine le « Miserere » secret d’Allegri et le nota de mémoire',
              'Le pape le fit chevalier de l’Éperon d’or',
              'Son opéra « Mitridate » (1770) fut un succès à Milan – il avait 14 ans']},
          {'kind': 'image', 'title': 'Une famille de musiciens', 'text': 'La famille vers 1780 : Nannerl et Wolfgang au clavier, Leopold avec son violon. Leur mère Anna Maria, morte en 1778, figure en portrait au mur.', 'image': 'mozart_family', 'credit': 'Johann Nepomuk della Croce, la famille Mozart, vers 1780 (domaine public)'},
          {'kind': 'timeline', 'title': 'Des années de frustration', 'rows': [
              ('1773', 'De retour à Salzbourg, musicien de cour du sévère prince-archevêque Colloredo'),
              ('1777–1779', 'À la recherche d’un poste à Mannheim et à Paris – sans succès'),
              ('1778', 'Sa mère meurt à Paris, où elle l’accompagnait'),
              ('1781', 'Succès à Munich avec l’opéra « Idomeneo »'),
              ('1781', 'À Vienne, il se brouille avec Colloredo ; l’intendant de l’archevêque, le comte Arco, le met dehors d’un coup de pied')]},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Trois voyages en Italie à l’adolescence',
              'Des années malheureuses de musicien de cour à Salzbourg',
              '1778 : mort de sa mère à Paris',
              '1781 : il quitte le service de l’archevêque et s’installe à Vienne']},
        ],
      },
      {
        'title': 'Écouter : la Sonate en do majeur « facile »', 'type': 'SLIDES', 'minutes': 12,
        'description': "Mozart l’appelait une petite sonate « pour débutants » – c’est aujourd’hui l’une des pièces pour piano les plus jouées au monde. Un exemple parfait du style classique.",
        'slides': [
          {'kind': 'bullets', 'title': 'Une sonate « pour débutants »', 'bullets': [
              'Sonate pour piano n° 16 en do majeur, K. 545, écrite à Vienne en 1788',
              'Mozart la nota comme « une petite sonate pour clavier pour débutants »',
              'Surnommée « Sonata facile » – la sonate facile',
              'Simple à lire – mais difficile à jouer parfaitement']},
          {'kind': 'listen', 'title': 'La forme sonate, pas à pas', 'work': 'Sonate en do majeur, K. 545 – premier mouvement', 'points': [
              'Exposition : un premier thème lumineux en do majeur, des gammes, un second thème en sol majeur',
              'Développement : les thèmes voyagent dans d’autres tonalités',
              'Réexposition : le premier thème revient – étonnamment en fa majeur',
              'Tout est équilibré : deux mesures de question, deux mesures de réponse']},
          {'kind': 'bullets', 'title': 'À vous de jouer', 'bullets': [
              'Ouvrez la partition dans la bibliothèque et trouvez le second thème',
              'Pianistes : le premier mouvement est un classique du niveau intermédiaire – demandez à votre professeur',
              'Le numéro K. : Ludwig von Köchel catalogua les œuvres de Mozart en 1862 – « K. » ou « KV » renvoie à son catalogue']},
        ],
        'library': [('cmuygwa2w028y4kkteja74k7w', 'Sonata facile, K. 545 – partition du premier mouvement'), ('cmuygwa2d02864kktojtpwodb', 'Rondo alla turca de la K. 331 – partition')],
      },
      {
        'title': 'Écouter : la Symphonie n° 40', 'type': 'AUDIO', 'minutes': 6, 'libraryAudio': [SYMPHONY_40, 0],
        'description': "À l’été 1788, Mozart écrivit ses trois dernières symphonies en six semaines environ. La n° 40 en sol mineur est l’une des deux seules qu’il écrivit dans une tonalité mineure – inquiète, pressante et inoubliable.\n\nVous entendez ici le premier mouvement, Molto allegro (Musopen, domaine public).\n\nÉcoutez :\n1. Le célèbre thème commence doucement aux violons sur un accompagnement nerveux des altos\n2. Une figure soupirante de deux notes qui revient sans cesse\n3. La musique ne se repose presque jamais – même le doux second thème semble inquiet\n\nLes quatre mouvements sont dans la bibliothèque.",
        'library': [(SYMPHONY_40, 'Symphonie n° 40 en sol mineur – les quatre mouvements')],
      },
      {
        'title': 'Bilan de la semaine 2 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé de la jeunesse de Mozart, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 2 en bref', 'bullets': [
              '1769–1773 : trois voyages en Italie',
              'Rome : il nota de mémoire le « Miserere » d’Allegri',
              'Salzbourg : musicien de cour sous l’archevêque Colloredo',
              '1781 : rupture avec l’archevêque – une vie indépendante à Vienne',
              'La forme sonate : exposition, développement, réexposition']},
        ],
        'quiz': [
          ('Qu’est-ce que Mozart nota de mémoire à Rome ?', ['Une fugue de Bach', 'Le « Miserere » d’Allegri', 'Un opéra de Gluck', 'Un hymne pontifical'], 1),
          ('Où la mère de Mozart mourut-elle en 1778 ?', ['Salzbourg', 'Vienne', 'Paris', 'Mannheim'], 2),
          ('Que se passa-t-il à Vienne en 1781 ?', ['Mozart devint compositeur de la cour', 'Il rompit avec l’archevêque de Salzbourg', 'Il rencontra Beethoven', 'Il épousa l’amie de Nannerl'], 1),
          ('Que signifie le « K. » des œuvres de Mozart ?', ['Köchel, qui catalogua ses œuvres', 'Clé (Key)', 'Klavier', 'Kapellmeister'], 0),
          ('Dans quelle tonalité est la Symphonie n° 40 ?', ['Do majeur', 'Sol mineur', 'Ré majeur', 'Mi bémol majeur'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 3 – Vienne : Figaro et Don Giovanni (1781–1788)',
    'lessons': [
      {
        'title': 'Une vedette indépendante à Vienne', 'type': 'SLIDES', 'minutes': 15,
        'description': "Mozart fut l’un des premiers grands compositeurs à vivre sans poste fixe – en enseignant, en jouant, en publiant et en écrivant des opéras.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 3', 'title': 'Vienne', 'subtitle': '1781 – 1788', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Une nouvelle vie', 'bullets': [
              '1782 : il épouse Constanze Weber – contre l’avis de son père',
              '1782 : son opéra allemand « L’Enlèvement au sérail » triomphe',
              'Il donne des concerts par souscription où il joue ses propres concertos pour piano',
              'Joseph Haydn à Leopold : « Votre fils est le plus grand compositeur que je connaisse, en personne ou de nom »']},
          {'kind': 'timeline', 'title': 'Les grands opéras', 'rows': [
              ('1786', '« Les Noces de Figaro » – livret de Lorenzo Da Ponte, Vienne'),
              ('1787', '« Don Giovanni » – créé à Prague, qui adorait Mozart'),
              ('1790', '« Così fan tutte » – le troisième opéra avec Da Ponte'),
              ('1791', '« La Flûte enchantée » – un Singspiel allemand pour un théâtre de faubourg')]},
          {'kind': 'bullets', 'title': 'Pourquoi Figaro était audacieux', 'bullets': [
              'D’après une pièce de Beaumarchais, interdite à Vienne parce qu’elle se moquait de la noblesse',
              'Les domestiques sont plus malins que leur maître, le comte',
              'Mozart donne à chaque personnage sa propre voix – même dans les ensembles où six personnes chantent à la fois',
              'La semaine prochaine : le dernier opéra de Mozart, « La Flûte enchantée »']},
        ],
        'library': [('cmuygtj2k00l54kkt8rbn0eup', 'Ouverture des « Noces de Figaro » – enregistrement')],
      },
      {
        'title': 'Vidéo : la Reine de la nuit', 'type': 'YOUTUBE', 'minutes': 5, 'video': 'https://www.youtube.com/watch?v=YuBeBjqKSGQ',
        'description': "L’un des airs les plus célèbres – et les plus difficiles – jamais écrits : « Der Hölle Rache » de la Reine de la nuit, dans La Flûte enchantée (1791). Diana Damrau le chante au Royal Opera House de Londres.\n\nÉcoutez :\n1. La fureur dans chaque note : la Reine ordonne à sa fille de tuer son ennemi\n2. Les vocalises – des traits fulgurants et des notes piquées\n3. Le contre-fa (fa5) – l’une des notes les plus aiguës du répertoire lyrique courant\n\nMozart écrivit le rôle pour sa belle-sœur Josepha Hofer, dont les aigus étaient exceptionnels.",
      },
      {
        'title': 'Écouter : l’ouverture de La Flûte enchantée', 'type': 'AUDIO', 'minutes': 7, 'libraryAudio': ['cmuygtj2j00l44kktgboi8jvw', 0],
        'description': "L’ouverture de La Flûte enchantée commence par trois accords solennels – le chiffre trois joue un rôle symbolique dans tout l’opéra, plein d’allusions à la franc-maçonnerie (Mozart était franc-maçon).\n\nÉcoutez :\n1. Les trois accords majestueux du début\n2. Un thème rapide et affairé, à la manière d’une fugue, aux violons\n3. Les accords reviennent au milieu – trois fois trois\n\nUn enregistrement historique de la même ouverture (1922) se trouve aussi dans la bibliothèque.",
        'library': [('cmuygtj2j00l44kktgboi8jvw', 'Ouverture de La Flûte enchantée'), ('cmv2j3by200t612if33bed6o6', 'Enregistrement historique de l’ouverture (1922)'), ('cmuygwa2y02944kktpiqlsu40', 'Un air de La Flûte enchantée – partition')],
      },
      {
        'title': 'Bilan de la semaine 3 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années viennoises, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 3 en bref', 'bullets': [
              '1782 : mariage avec Constanze Weber ; « L’Enlèvement au sérail »',
              'Concerts par souscription et concertos pour piano',
              'Opéras avec Lorenzo Da Ponte : Figaro, Don Giovanni, Così fan tutte',
              'Prague adorait Mozart : Don Giovanni y fut créé en 1787']},
        ],
        'quiz': [
          ('Qui Mozart épousa-t-il en 1782 ?', ['Aloysia Weber', 'Constanze Weber', 'Nannerl Mozart', 'Josepha Hofer'], 1),
          ('Qui écrivit les livrets de Figaro, Don Giovanni et Così fan tutte ?', ['Schikaneder', 'Lorenzo Da Ponte', 'Goethe', 'Beaumarchais'], 1),
          ('Dans quelle ville Don Giovanni fut-il créé ?', ['Vienne', 'Salzbourg', 'Prague', 'Milan'], 2),
          ('Quel célèbre compositeur appela Mozart « le plus grand compositeur que je connaisse » ?', ['Bach', 'Haydn', 'Salieri', 'Gluck'], 1),
          ('Quel personnage chante « Der Hölle Rache » ?', ['Pamina', 'La Reine de la nuit', 'Papageno', 'Susanna'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 4 – La Flûte enchantée et le Requiem (1788–1791)',
    'lessons': [
      {
        'title': 'La dernière année', 'type': 'SLIDES', 'minutes': 15,
        'description': "1791 fut l’une des années les plus fécondes de la vie de Mozart – et la dernière.",
        'slides': [
          {'kind': 'bullets', 'title': 'Soucis d’argent', 'bullets': [
              'À partir de 1788, l’Autriche était en guerre contre l’Empire ottoman – moins de concerts, moins d’argent',
              'Mozart emprunta à des amis ; ses lettres montrent une réelle inquiétude',
              'Pourtant, il continua de composer à un rythme stupéfiant']},
          {'kind': 'timeline', 'title': '1791', 'rows': [
              ('Janvier', 'Son dernier concerto pour piano, le n° 27 en si bémol'),
              ('Septembre', '« La clemenza di Tito » pour un couronnement à Prague'),
              ('30 septembre', 'Création de « La Flûte enchantée » à Vienne – un immense succès'),
              ('Octobre', 'Concerto pour clarinette pour son ami Anton Stadler'),
              ('5 décembre', 'Mozart meurt à 35 ans, le Requiem inachevé')]},
          {'kind': 'bullets', 'title': 'Le mystérieux Requiem', 'bullets': [
              'En 1791, un inconnu commanda anonymement une messe des morts',
              'Le commanditaire était le comte Walsegg, qui voulait la faire passer pour son œuvre',
              'Mozart mourut avant de l’achever ; son élève Franz Xaver Süssmayr la compléta',
              'Les légendes de poison et de rivalité avec Salieri ne sont que des légendes']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              '1791 : La Flûte enchantée, le Concerto pour clarinette, le dernier concerto pour piano',
              'Mozart mourut le 5 décembre 1791, à 35 ans',
              'Le Requiem fut achevé par Süssmayr']},
        ],
      },
      {
        'title': 'Vidéo : le Requiem', 'type': 'YOUTUBE', 'minutes': 55, 'video': 'https://www.youtube.com/watch?v=Dp2SJN4UiE4',
        'description': "L’Orchestre national de France et le Chœur de Radio France, sous la direction de James Gaffigan, interprètent le Requiem en ré mineur, K. 626, de Mozart (France Musique).\n\nInutile de tout regarder d’un coup. Commencez par :\n1. L’Introït : un début lent et sombre avec cors de basset et bassons\n2. Le « Dies irae » – le jour de colère – une tempête soudaine\n3. Le « Lacrimosa » : Mozart n’en écrivit que les huit premières mesures avant de mourir\n\nÉcoutez comment Mozart, auteur de tant de musique lumineuse, sonne dans sa dernière œuvre.",
      },
      {
        'title': 'L’héritage de Mozart', 'type': 'SLIDES', 'minutes': 12,
        'description': "Pourquoi jouons-nous encore Mozart plus de 230 ans plus tard ?",
        'slides': [
          {'kind': 'bullets', 'title': 'Ce que Mozart nous a donné', 'bullets': [
              'Des opéras avec de vraies personnes sur scène – drôles, cruelles, tendres, tout à la fois',
              'Le concerto pour piano comme dialogue entre soliste et orchestre',
              'Un équilibre parfait entre forme et émotion',
              'Plus de 600 œuvres, cataloguées par Köchel : de K. 1 à K. 626 (le Requiem)']},
          {'kind': 'bullets', 'title': 'Mozart aujourd’hui', 'bullets': [
              'La Flûte enchantée et Les Noces de Figaro comptent parmi les opéras les plus joués au monde',
              'Beethoven vint à Vienne en 1787 dans l’espoir d’étudier avec lui',
              'Salzbourg le célèbre avec son festival et le Mozarteum',
              'Des générations de pianistes commencent par ses sonates']},
          {'kind': 'summary', 'title': 'Pour aller plus loin', 'bullets': [
              'Explorez les partitions et enregistrements de Mozart dans la bibliothèque mymusic.coach',
              'Continuez avec « Beethoven : vie et œuvre » – le compositeur venu à Vienne pour le rencontrer',
              'Pianistes : demandez à votre professeur la Sonata facile, K. 545']},
        ],
        'library': [('cmuygtj2k00l74kktecmzg0qb', 'Quatuor « Les Dissonances », K. 465 – dédié à Haydn'), ('cmuygwa2v028w4kkt5jd7ul9j', 'Le lied « Abendempfindung » – partition')],
      },
      {
        'title': 'Bilan final et quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Félicitations – vous êtes arrivé au bout du cours ! Un dernier résumé et un quiz final sur les quatre semaines.",
        'slides': [
          {'kind': 'timeline', 'title': 'La vie de Mozart en un coup d’œil', 'rows': [
              ('1756', 'Naissance à Salzbourg le 27 janvier'),
              ('1763–1766', 'Le grand voyage à travers l’Europe'),
              ('1769–1773', 'Trois voyages en Italie'),
              ('1781', 'S’installe à Vienne comme musicien indépendant'),
              ('1786', 'Les Noces de Figaro'),
              ('1791', 'La Flûte enchantée ; mort le 5 décembre')]},
        ],
        'quiz': [
          ('Quel âge avait Mozart à sa mort ?', ['35', '45', '56', '27'], 0),
          ('Qui acheva le Requiem de Mozart ?', ['Salieri', 'Franz Xaver Süssmayr', 'Leopold Mozart', 'Haydn'], 1),
          ('Pour qui Mozart écrivit-il son Concerto pour clarinette ?', ['Anton Stadler', 'Le comte Walsegg', 'L’empereur Joseph II', 'Lorenzo Da Ponte'], 0),
          ('Quel opéra fut créé à Vienne le 30 septembre 1791 ?', ['Don Giovanni', 'La Flûte enchantée', 'Idomeneo', 'Les Noces de Figaro'], 1),
          ('Qui commanda secrètement le Requiem ?', ['Le comte Walsegg', 'L’empereur', 'Salieri', 'Constanze'], 0),
          ('À quelle œuvre correspond le numéro Köchel K. 626 ?', ['La Flûte enchantée', 'Le Requiem', 'La Symphonie n° 40', 'La Sonata facile'], 1),
        ],
      },
    ],
  },
]
