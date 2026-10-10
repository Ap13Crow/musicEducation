# Frédéric Chopin - version française de chopin.py.
COURSE = {
    'slug': 'chopin-vie-et-oeuvre-introduction',
    'language': 'fr',
    'translationOf': 'chopin-life-and-music-introduction',
    'title': 'Frédéric Chopin : vie et œuvre – Une première introduction',
    'shortSummary': 'Quatre semaines avec Frédéric Chopin, le « poète du piano » : de Varsovie aux salons parisiens, George Sand et Nohant – nocturnes, ballades, polonaises et Préludes.',
    'description': (
        "Frédéric Chopin (1810–1849) n’écrivit presque que pour le piano – et changea à jamais sa sonorité. Né près de Varsovie, il quitta la Pologne à 20 ans "
        "pour ne jamais la revoir ; à Paris, il devint le pianiste le plus admiré des salons.\n\n"
        "En quatre semaines, vous suivez sa vie pas à pas :\n"
        "- Semaine 1 – Une enfance polonaise : Varsovie (1810–1830)\n"
        "- Semaine 2 – Paris : le poète du piano (1831–1837)\n"
        "- Semaine 3 – George Sand, Majorque et Nohant (1838–1846)\n"
        "- Semaine 4 – Les dernières années et l’héritage (1847–1849)\n\n"
        "Chaque semaine associe des diapositives illustrées, un documentaire, des interprétations du Concours international Chopin, des enregistrements et partitions "
        "de la bibliothèque mymusic.coach et un court quiz. Aucune connaissance préalable n’est nécessaire. Comptez environ 1 à 2 heures par semaine."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'chopin_delacroix', 'title': 'Chopin', 'subtitle': 'Vie et œuvre – Une première introduction', 'tag': 'Cours de 4 semaines'},
}
FOOTER = 'Frédéric Chopin : vie et œuvre'
PORTRAIT = {'image': 'chopin_delacroix', 'credit': 'Eugène Delacroix, Frédéric Chopin, 1838 (Louvre, domaine public)'}
PHOTO = {'image': 'chopin_photo', 'credit': 'Daguerréotype de Louis-Auguste Bisson, 1849 (domaine public)'}
NOCTURNE = 'cmuygtjik00sp4kktzi6k3k9h'
BALLADE1 = 'cmuygtj4r00m94kktpave15sk'
RAINDROP = 'cmuygtjtv00ui4kkt1fywy6rm'
REVOLUTIONARY = 'cmuygtj5800nd4kktdeqnhk2o'
HEROIC = 'cmuygtjo200tb4kkteday0mft'
BERCEUSE = 'cmuygtj4t00me4kkt04luo6y0'
FUNERAL = 'cmuygtk7u00vs4kktm0j5t5th'

WEEKS = [
  {
    'title': 'Semaine 1 – Une enfance polonaise : Varsovie (1810–1830)',
    'lessons': [
      {
        'title': 'Bienvenue : à la rencontre de Chopin', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Bienvenue dans ce cours ! Découvrez le « poète du piano » – et voyez comment se déroulent les quatre prochaines semaines.\n\nAstuce : toute la musique citée dans le cours est liée depuis les leçons. Ouvrez enregistrements et partitions dans la bibliothèque et gagnez des XP supplémentaires en écoutant ou en lisant jusqu’au bout.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 1', 'title': 'À la rencontre de Frédéric Chopin', 'subtitle': 'Une première introduction à sa vie et à sa musique', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Pourquoi Chopin ?', 'bullets': [
              'Né près de Varsovie en 1810 – mort à Paris en 1849, à 39 ans',
              'Presque toutes ses œuvres font appel au piano',
              'Il créa de nouveaux genres de pièces pour piano : la ballade, et ses nocturnes, études et préludes si personnels',
              'Des danses polonaises – mazurkas et polonaises – devinrent entre ses mains de la grande musique',
              'Il est sans doute aujourd’hui le compositeur le plus joué par les pianistes du monde entier']},
          {'kind': 'timeline', 'title': 'Vos quatre semaines', 'rows': [
              ('Semaine 1', 'Une enfance polonaise : Varsovie'),
              ('Semaine 2', 'Paris : le poète du piano'),
              ('Semaine 3', 'George Sand, Majorque et Nohant'),
              ('Semaine 4', 'Les dernières années et l’héritage')]},
          {'kind': 'bullets', 'title': 'Le piano au temps de Chopin', 'bullets': [
              'Les pianos devenaient plus grands, plus puissants et plus riches en sonorité',
              'Paris était la capitale de la facture de pianos : Pleyel et Érard',
              'Chopin aimait les pianos Pleyel pour leur son doux et chantant',
              'Son secret : faire « chanter » le piano comme une voix d’opéra']},
        ],
      },
      {
        'title': 'Une enfance à Varsovie', 'type': 'SLIDES', 'minutes': 15,
        'description': "Un père français, une mère polonaise, une ville pleine de musique : comment un garçon de Varsovie devint célèbre à huit ans.",
        'slides': [
          {'kind': 'bullets', 'title': 'Żelazowa Wola, 1810', 'bullets': [
              'Né au village de Żelazowa Wola, à l’ouest de Varsovie – le 1er mars 1810, date que lui et sa famille fêtaient (son acte de baptême indique le 22 février)',
              'Son père Nicolas Chopin était un Français qui enseignait le français à Varsovie',
              'Sa mère Justyna était polonaise et jouait du piano',
              'Quelques mois plus tard, la famille s’installa à Varsovie']},
          {'kind': 'timeline', 'title': 'Un enfant prodige', 'rows': [
              ('1816', 'Leçons de piano avec Wojciech Żywny, amoureux de Bach et de Mozart'),
              ('1817', 'À 7 ans : sa première œuvre imprimée, une Polonaise en sol mineur'),
              ('1818', 'Premier concert public à 8 ans – « un second Mozart », écrivent les journaux de Varsovie'),
              ('1826–1829', 'Études de composition au conservatoire de Varsovie avec Józef Elsner')]},
          {'kind': 'quote', 'quote': 'Chopin, Fryderyk : capacités exceptionnelles, génie musical.', 'by': 'Józef Elsner, dans son rapport final sur son élève, 1829'},
          {'kind': 'listen', 'title': 'Sa première œuvre publiée', 'work': 'Polonaise en sol mineur (1817) – par un enfant de sept ans', 'points': [
              'Une polonaise est une danse polonaise noble, à trois temps',
              'Simple, mais pleine de caractère',
              'Ouvrez l’enregistrement dans la bibliothèque – et comparez avec la Polonaise « Héroïque » de la semaine 3']},
        ],
        'library': [('cmuygtjr400u24kkt14g9zilc', 'Polonaise en sol mineur – écrite à sept ans')],
      },
      {
        'title': 'Vidéo : Chopin – sa vie, ses lieux et sa musique', 'type': 'YOUTUBE', 'minutes': 28, 'video': 'https://www.youtube.com/watch?v=n7Pk5uhl4JM',
        'description': "Ce documentaire d’opera-inside suit Chopin de Żelazowa Wola et Varsovie jusqu’à Paris, Majorque et Nohant, en musique du début à la fin. La vidéo est en anglais – activez si besoin les sous-titres automatiques de YouTube.\n\nPendant le visionnage, cherchez :\n1. Pourquoi Chopin quitta-t-il la Pologne – et pourquoi n’y revint-il jamais ?\n2. Qui était George Sand ?\n3. Où écrivit-il les 24 Préludes ?\n\nTout reviendra dans les semaines suivantes.",
      },
      {
        'title': 'Quitter la Pologne – et quiz de la semaine 1', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "En novembre 1830, Chopin quitta Varsovie pour Vienne. Trois semaines plus tard, la Pologne se souleva contre la Russie – et il ne put jamais rentrer.",
        'slides': [
          {'kind': 'bullets', 'title': 'Adieu, Varsovie', 'bullets': [
              '1829 : des débuts réussis à Vienne',
              '1830 : ses deux concertos pour piano sont créés à Varsovie',
              '2 novembre 1830 : il quitte la Pologne – ses amis lui offrent une coupe de terre polonaise',
              '29 novembre 1830 : l’insurrection de Novembre contre la domination russe commence']},
          {'kind': 'listen', 'title': 'L’Étude « Révolutionnaire »', 'work': 'Étude en ut mineur, op. 10 n° 12', 'points': [
              'En septembre 1831, à Stuttgart, Chopin apprit que Varsovie était tombée aux mains de l’armée russe',
              'Son journal de ces jours-là est rempli de désespoir',
              'Selon la tradition, cette étude fut sa réponse : une tempête à la main gauche, des cris à la main droite',
              'Deux minutes et demie de fureur – ouvrez l’enregistrement dans la bibliothèque']},
          {'kind': 'summary', 'title': 'La semaine 1 en bref', 'bullets': [
              'Né près de Varsovie en 1810 ; père français, mère polonaise',
              'Une vedette précoce : première œuvre imprimée à 7 ans, premier concert à 8',
              'Formé par Żywny et Elsner',
              '1830 : il quitte la Pologne – pour toujours']},
        ],
        'library': [(REVOLUTIONARY, 'Étude « Révolutionnaire », op. 10 n° 12 – enregistrement'), ('cmuygw9fx01y04kktfxw2tvje', 'Étude « Révolutionnaire » – partition')],
        'quiz': [
          ('Où Chopin est-il né ?', ['À Paris', 'À Żelazowa Wola, près de Varsovie', 'À Cracovie', 'À Vienne'], 1),
          ('D’où venait le père de Chopin ?', ['De Pologne', 'De France', 'D’Allemagne', 'De Russie'], 1),
          ('Quelle fut la première œuvre imprimée de Chopin, à 7 ans ?', ['Un nocturne', 'Une polonaise', 'Un concerto pour piano', 'Une mélodie'], 1),
          ('Quel événement commença peu après le départ de Chopin de Varsovie en 1830 ?', ['La Révolution française', 'L’insurrection de Novembre contre la Russie', 'Le congrès de Vienne', 'Les guerres napoléoniennes'], 1),
          ('Quelle étude associe-t-on à la chute de Varsovie en 1831 ?', ['L’Étude « sur les touches noires »', 'L’Étude « Révolutionnaire »', 'L’Étude « Papillon »', 'L’Étude « Vent d’hiver »'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 2 – Paris : le poète du piano (1831–1837)',
    'lessons': [
      {
        'title': 'Un Polonais à Paris', 'type': 'SLIDES', 'minutes': 15,
        'description': "Le Paris des années 1830 regorgeait d’exilés polonais, de grands pianistes et de salons fortunés. Chopin y trouva vite sa place.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 2', 'title': 'Paris : le poète du piano', 'subtitle': '1831 – 1837', **PORTRAIT},
          {'kind': 'quote', 'quote': 'Chapeau bas, messieurs, un génie !', 'by': 'Robert Schumann, à propos des Variations op. 2 de Chopin, 1831'},
          {'kind': 'bullets', 'title': 'Le salon plutôt que la salle de concert', 'bullets': [
              'Automne 1831 : Chopin arrive à Paris ; son premier concert parisien a lieu en février 1832 à la salle Pleyel',
              'Il n’aimait pas les grandes salles et ne donna qu’une trentaine de concerts publics dans toute sa vie',
              'Il jouait plutôt dans les salons d’aristocrates et de banquiers – comme les Rothschild',
              'Il vivait des leçons données à des élèves fortunés et de la vente de ses œuvres aux éditeurs']},
          {'kind': 'bullets', 'title': 'Amis à Paris', 'bullets': [
              'Franz Liszt, le grand virtuose – ami et rival',
              'Le peintre Eugène Delacroix – l’un de ses plus proches amis',
              'Des exilés polonais comme le poète Adam Mickiewicz',
              'Felix Mendelssohn, Vincenzo Bellini et Hector Berlioz']},
        ],
      },
      {
        'title': 'Écouter : le Nocturne en mi bémol majeur', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [NOCTURNE, 0],
        'description': "Un nocturne est une « pièce de nuit » : une mélodie rêveuse et chantante sur un accompagnement doucement berçant. Le compositeur irlandais John Field inventa le nom – Chopin rendit le nocturne célèbre. Il en publia 21.\n\nLe Nocturne en mi bémol majeur, op. 9 n° 2 (publié en 1832) est le plus célèbre de tous (enregistrement Musopen, domaine public).\n\nÉcoutez :\n1. La main gauche : une basse grave, puis deux accords – comme une valse lente\n2. La main droite chante comme une cantatrice – Chopin adorait les opéras de Bellini\n3. À chaque retour, la mélodie est plus ornée – de petites décorations rapides\n\nSuivez la partition, ou comparez avec la version du violoniste Mischa Elman sur un 78 tours de 1924.",
        'library': [(NOCTURNE, 'Nocturne op. 9 n° 2 – enregistrement'), ('cmuygw9ik01yx4kkth8o2buwb', 'Nocturne op. 9 n° 2 – partition'), ('cmv2iv6gr00cc12if7rl3la76', 'Nocturne op. 9 n° 2 pour violon – Mischa Elman, 1924')],
      },
      {
        'title': 'Vidéo : la Première Ballade', 'type': 'YOUTUBE', 'minutes': 10, 'video': 'https://www.youtube.com/watch?v=BjZsTeSvwe4',
        'description': "Chopin inventa la ballade pour piano : un long récit dramatique sans paroles. La Ballade n° 1 en sol mineur, op. 23 fut achevée en 1835. Schumann rapporta que Chopin lui avait dit qu’elle était sa préférée.\n\nMartín García García la joue ici au 18e Concours international Chopin de Varsovie (2021) – organisé tous les cinq ans depuis 1927, c’est l’un des concours les plus importants au monde.\n\nÉcoutez :\n1. Une introduction lente et interrogative\n2. Le premier thème : une mélodie triste et balancée en sol mineur\n3. Le second thème : chaleureux et calme – il revient plus tard dans toute sa splendeur\n4. La coda furieuse de la fin\n\nOuvrez ensuite la partition et un enregistrement complet dans la bibliothèque.",
        'library': [('cmuygw9fy01y24kkthv67wxx8', 'Première Ballade – partition'), (BALLADE1, 'Première Ballade – enregistrement')],
      },
      {
        'title': 'Bilan de la semaine 2 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des premières années parisiennes, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 2 en bref', 'bullets': [
              '1831 : arrivée à Paris ; Schumann : « Chapeau bas, messieurs, un génie ! »',
              'Pianiste de salon et professeur plutôt que virtuose de concert',
              'Les nocturnes : des « pièces de nuit » chantantes',
              'La ballade : un nouveau genre dramatique pour piano']},
          {'kind': 'bullets', 'title': 'À lire : la Valse « Minute »', 'bullets': [
              'La valse était la danse à la mode à Paris',
              'La Valse « Minute », op. 64 n° 1, ne dure pas une minute : « minute » signifie « minuscule »',
              'Elle montrerait un petit chien tournant après sa queue',
              'Ouvrez la partition et l’enregistrement dans la bibliothèque']},
        ],
        'library': [('cmuygw9if01yt4kkt2o428xyb', 'Valse « Minute » – partition'), ('cmuygtkaq00wv4kktlh1mwpgf', 'Valse « Minute » – enregistrement')],
        'quiz': [
          ('Qui écrivit à propos de Chopin : « Chapeau bas, messieurs, un génie ! » ?', ['Liszt', 'Robert Schumann', 'Mendelssohn', 'Berlioz'], 1),
          ('Où Chopin préférait-il jouer ?', ['Dans les grandes salles de concert', 'Dans les salons privés', 'Dans les églises', 'Dans les opéras'], 1),
          ('Qu’est-ce qu’un nocturne ?', ['Une danse rapide', 'Une « pièce de nuit » rêveuse', 'Un exercice de technique', 'Une pièce pour orchestre'], 1),
          ('Quel genre de pièce pour piano Chopin inventa-t-il ?', ['La sonate', 'La ballade', 'La fugue', 'La valse'], 1),
          ('Que signifie « minute » dans la Valse « Minute » ?', ['Elle dure une minute', 'Minuscule', 'Très rapide', 'Écrite en une minute'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 3 – George Sand, Majorque et Nohant (1838–1846)',
    'lessons': [
      {
        'title': 'George Sand et un hiver à Majorque', 'type': 'SLIDES', 'minutes': 15,
        'description': "En 1836, Chopin rencontra la romancière George Sand. Leurs neuf années communes furent les plus fécondes de sa vie.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 3', 'title': 'George Sand, Majorque et Nohant', 'subtitle': '1838 – 1846', **PORTRAIT},
          {'kind': 'image', 'title': 'George Sand', 'text': 'Née Aurore Dupin, elle écrivait sous un nom d’homme, portait parfois des vêtements masculins et était l’une des écrivaines les plus célèbres de France. Liszt la présenta à Chopin en 1836 ; à partir de 1838, ils formèrent un couple.', 'image': 'george_sand', 'credit': 'Eugène Delacroix, George Sand, 1838 (domaine public)'},
          {'kind': 'bullets', 'title': 'Majorque, hiver 1838–1839', 'bullets': [
              'Sand emmena Chopin et ses deux enfants à Majorque, espérant que le soleil soignerait ses poumons fragiles',
              'Il plut pendant des semaines ; ils finirent dans un ancien monastère à Valldemossa',
              'Chopin, très malade, y acheva ses 24 Préludes sur un petit piano local en attendant l’arrivée de son Pleyel',
              'Delacroix peignit le couple ensemble en 1838 – le tableau fut plus tard coupé en deux']},
          {'kind': 'listen', 'title': 'Le Prélude « La Goutte d’eau »', 'work': 'Prélude en ré bémol majeur, op. 28 n° 15', 'points': [
              'Une seule note répétée traverse toute la pièce – comme la pluie sur le toit',
              'La partie centrale devient sombre et lourde, comme un mauvais rêve',
              'George Sand a décrit Chopin jouant sous la pluie à Valldemossa',
              'Le surnom n’est pas de Chopin – ouvrez l’enregistrement et jugez par vous-même']},
        ],
        'library': [(RAINDROP, 'Prélude « La Goutte d’eau » – enregistrement'), ('cmuygw9fy01y54kkt3wpqkzcf', 'Prélude « La Goutte d’eau » – partition'), ('cmuygw9ib01yh4kkte87nhbsf', 'Prélude n° 4 en mi mineur – partition')],
      },
      {
        'title': 'Les étés à Nohant', 'type': 'SLIDES', 'minutes': 12,
        'description': "De 1839 à 1846, Chopin passa la plupart de ses étés dans la maison de campagne de George Sand à Nohant, au centre de la France. Il y écrivit beaucoup de ses plus grandes œuvres.",
        'slides': [
          {'kind': 'bullets', 'title': 'La vie à Nohant', 'bullets': [
              'L’hiver à Paris pour les leçons et les salons ; l’été à la campagne pour composer',
              'Parmi les invités : Delacroix, Liszt et la cantatrice Pauline Viardot',
              'Chopin travaillait lentement et douloureusement, réécrivant une page encore et encore',
              'Sand raconte qu’il pouvait passer six semaines sur une seule page']},
          {'kind': 'timeline', 'title': 'Les œuvres des années de Nohant', 'rows': [
              ('1839', 'Sonate pour piano n° 2 en si bémol mineur, avec la Marche funèbre'),
              ('1842', 'Polonaise en la bémol majeur, op. 53, « Héroïque » ; Ballade n° 4'),
              ('1844', 'Berceuse et Sonate pour piano n° 3'),
              ('1845–1846', 'Barcarolle et Polonaise-Fantaisie ; Sonate pour violoncelle')]},
          {'kind': 'listen', 'title': 'Deux contrastes', 'work': 'Polonaise « Héroïque », op. 53 – et la Berceuse, op. 57', 'points': [
              'La Polonaise « Héroïque » : fière, brillante – un symbole de la Pologne',
              'Écoutez les octaves tonitruantes de la main gauche dans la partie centrale',
              'La Berceuse : une berceuse sur un unique motif de basse balancé, répété du début à la fin',
              'Les deux enregistrements sont dans la bibliothèque']},
        ],
        'library': [(HEROIC, 'Polonaise « Héroïque », op. 53 – enregistrement'), (BERCEUSE, 'Berceuse, op. 57 – enregistrement')],
      },
      {
        'title': 'Vidéo : Andante spianato et Grande Polonaise', 'type': 'YOUTUBE', 'minutes': 15, 'video': 'https://www.youtube.com/watch?v=B4DzzgBxpx4',
        'description': "Bruce (Xiaoyu) Liu joue l’Andante spianato et Grande Polonaise brillante, op. 22 au 18e Concours international Chopin en 2021 – qu’il remporta ensuite.\n\nChopin écrivit la Polonaise à Varsovie et à Vienne en 1830–1831 pour piano et orchestre, et ajouta le calme Andante spianato (« aplani ») à Paris en 1834. On la joue souvent, comme ici, au piano seul.\n\nÉcoutez :\n1. L’Andante lisse et doux – comme de l’eau\n2. Une fanfare qui annonce la Polonaise\n3. Le style étincelant et brillant qui rendit le jeune virtuose Chopin célèbre",
      },
      {
        'title': 'Bilan de la semaine 3 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années George Sand, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 3 en bref', 'bullets': [
              '1836 : rencontre avec la romancière George Sand',
              '1838–1839 : un hiver à Majorque – les 24 Préludes',
              '1839–1846 : les étés à Nohant – ses années les plus fécondes',
              'Polonaise « Héroïque », Berceuse, Barcarolle, sonates']},
        ],
        'quiz': [
          ('Quel était le vrai nom de George Sand ?', ['Pauline Viardot', 'Aurore Dupin', 'Marie d’Agoult', 'Jane Stirling'], 1),
          ('Où Chopin acheva-t-il ses 24 Préludes ?', ['À Nohant', 'À Majorque', 'À Varsovie', 'À Londres'], 1),
          ('Quel prélude est surnommé « La Goutte d’eau » ?', ['Le n° 4 en mi mineur', 'Le n° 15 en ré bémol majeur', 'Le n° 20 en ut mineur', 'Le n° 1 en ut majeur'], 1),
          ('Où Chopin passa-t-il ses étés de 1839 à 1846 ?', ['À Majorque', 'À Nohant', 'À Varsovie', 'En Suisse'], 1),
          ('Qu’est-ce qu’une berceuse ?', ['Une marche', 'Une chanson pour endormir un enfant', 'Une danse', 'Une étude'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 4 – Les dernières années et l’héritage (1847–1849)',
    'lessons': [
      {
        'title': 'La rupture, la Grande-Bretagne et le dernier concert', 'type': 'SLIDES', 'minutes': 15,
        'description': "En 1847, Chopin et George Sand se séparèrent. Malade et presque incapable de composer, il fit un dernier long voyage.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 4', 'title': 'Les dernières années', 'subtitle': '1847 – 1849', **PHOTO},
          {'kind': 'timeline', 'title': 'Le dernier voyage', 'rows': [
              ('1847', 'Une douloureuse rupture avec George Sand, après des querelles autour de ses enfants'),
              ('Févr. 1848', 'Son dernier concert parisien, salle Pleyel'),
              ('1848', 'Sept mois en Angleterre et en Écosse, à l’invitation de son élève Jane Stirling'),
              ('16 nov. 1848', 'Sa dernière apparition publique : un concert de bienfaisance pour les réfugiés polonais à Londres'),
              ('17 oct. 1849', 'Meurt à Paris à 39 ans – probablement de la tuberculose')]},
          {'kind': 'bullets', 'title': 'L’adieu', 'bullets': [
              'À ses funérailles à l’église de la Madeleine, on chanta le Requiem de Mozart, comme il l’avait souhaité',
              'Il fut inhumé au cimetière du Père-Lachaise à Paris',
              'Sa sœur Ludwika rapporta son cœur à Varsovie, comme il l’avait demandé',
              'Il repose dans un pilier de l’église Sainte-Croix']},
          {'kind': 'image', 'title': 'La seule photographie', 'text': 'Ce daguerréotype de 1849, dernière année de sa vie, est l’une des deux seules photographies de Chopin. Comparez-le avec le portrait de Delacroix de 1838.', **PHOTO},
        ],
      },
      {
        'title': 'Écouter : la Marche funèbre', 'type': 'AUDIO', 'minutes': 10, 'libraryAudio': [FUNERAL, 0],
        'description': "La Marche funèbre fut écrite en 1837 et devint le mouvement lent de la Sonate pour piano n° 2 en si bémol mineur (1839). Elle fut jouée à l’inhumation de Chopin lui-même – puis aux funérailles d’hommes d’État du monde entier.\n\nÉcoutez (enregistrement Musopen, domaine public) :\n1. De lourds accords à la main gauche, comme des cloches qui sonnent lentement\n2. Une mélodie douce et consolante au milieu – comme un souvenir\n3. Le retour de la marche\n\nLa partition complète de la sonate est dans la bibliothèque.",
        'library': [(FUNERAL, 'Sonate n° 2 : Marche funèbre – enregistrement'), ('cmuygw9ie01yp4kktflm0uegd', 'Sonate n° 2 – partition')],
      },
      {
        'title': 'Chopin aujourd’hui', 'type': 'SLIDES', 'minutes': 12,
        'description': "Pourquoi Chopin reste au cœur du jeu pianistique – et de l’identité polonaise.",
        'slides': [
          {'kind': 'bullets', 'title': 'Le piano de Chopin', 'bullets': [
              'Une pédale qui fond les sons en un nuage de couleurs',
              'Le rubato : le « temps volé » – la mélodie fléchit pendant que l’accompagnement reste stable',
              'Des études qui sont à la fois des exercices et de la vraie musique',
              'Liszt, Debussy, Rachmaninov et bien d’autres ont appris de lui']},
          {'kind': 'bullets', 'title': 'Un symbole polonais', 'bullets': [
              'Mazurkas et polonaises firent vivre la musique polonaise quand la Pologne n’était pas libre',
              'Le Concours international Chopin a lieu à Varsovie depuis 1927',
              'L’aéroport de Varsovie et une université de musique portent son nom',
              'Sa maison natale à Żelazowa Wola est un musée']},
          {'kind': 'summary', 'title': 'Pour aller plus loin', 'bullets': [
              'Explorez plus de 150 enregistrements et partitions de Chopin dans la bibliothèque mymusic.coach',
              'Pianistes : demandez à votre professeur un prélude (n° 4, 6 ou 7) ou une valse',
              'Continuez avec les cours sur Felix Mendelssohn, Clara Schumann et Debussy']},
        ],
      },
      {
        'title': 'Bilan final et quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Félicitations – vous êtes arrivé au bout du cours ! Un dernier résumé et un quiz final sur les quatre semaines.",
        'slides': [
          {'kind': 'timeline', 'title': 'La vie de Chopin en un coup d’œil', 'rows': [
              ('1810', 'Naissance à Żelazowa Wola, près de Varsovie'),
              ('1817', 'Première œuvre imprimée, à 7 ans'),
              ('1830', 'Quitte la Pologne pour toujours'),
              ('1831', 'Arrivée à Paris'),
              ('1838–1839', 'Majorque avec George Sand : les 24 Préludes'),
              ('1839–1846', 'Les étés à Nohant'),
              ('1849', 'Mort à Paris le 17 octobre')]},
        ],
        'quiz': [
          ('Pour quel instrument Chopin écrivit-il presque toute sa musique ?', ['Le violon', 'Le piano', 'L’orgue', 'La voix'], 1),
          ('Quelles deux danses polonaises Chopin éleva-t-il au rang de grande musique ?', ['La valse et le menuet', 'La mazurka et la polonaise', 'La polka et le galop', 'La tarentelle et le saltarello'], 1),
          ('Qu’est-ce que le « rubato » ?', ['Un type de piano', 'Un temps souple, « volé », dans la mélodie', 'Une fin rapide', 'Un type de pédale'], 1),
          ('Quelle musique fut chantée aux funérailles de Chopin ?', ['Sa propre Marche funèbre', 'Le Requiem de Mozart', 'La Passion selon saint Matthieu', 'La Neuvième de Beethoven'], 1),
          ('Où le cœur de Chopin est-il conservé ?', ['À Paris', 'À l’église Sainte-Croix de Varsovie', 'À Nohant', 'À Majorque'], 1),
          ('Depuis quand existe le Concours international Chopin ?', ['1849', '1900', '1927', '1990'], 2),
        ],
      },
    ],
  },
]
