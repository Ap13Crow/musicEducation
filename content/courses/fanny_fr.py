# Fanny Hensel (née Mendelssohn) - version française de fanny.py.
COURSE = {
    'slug': 'fanny-hensel-vie-et-oeuvre-introduction',
    'language': 'fr',
    'translationOf': 'fanny-hensel-life-and-music-introduction',
    'title': 'Fanny Hensel : vie et œuvre – Une première introduction',
    'shortSummary': 'Quatre semaines avec Fanny Mendelssohn Hensel : compositrice et pianiste brillante, auteure de plus de 450 œuvres, animatrice du plus beau salon musical de Berlin – qui ne publia sous son nom qu’à 40 ans.',
    'description': (
        "Fanny Hensel (1805–1847), née Fanny Mendelssohn, était aussi douée que son célèbre frère Felix – et pourtant, presque toute sa vie, "
        "on ne lui permit pas de faire de la musique son métier. Elle composa malgré tout plus de 450 œuvres : lieder, pièces pour piano, musique de chambre, œuvres chorales et orchestrales.\n\n"
        "En quatre semaines, vous suivez sa vie pas à pas :\n"
        "- Semaine 1 – Une enfance berlinoise dans une famille de génies (1805–1820)\n"
        "- Semaine 2 – « Seulement un ornement » ? Des lieder sous le nom de son frère (1820–1829)\n"
        "- Semaine 3 – Les musiques du dimanche et l’Italie (1829–1840)\n"
        "- Semaine 4 – « Das Jahr » et enfin son propre nom (1841–1847)\n\n"
        "Chaque semaine associe des diapositives illustrées, des vidéos (Oxford University Press, Duke University, Orchestre symphonique de la WDR), "
        "des partitions interactives de ses lieder issues de la bibliothèque mymusic.coach et un court quiz. Aucune connaissance préalable n’est nécessaire. "
        "Comptez environ 1 à 2 heures par semaine."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Voice'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'fanny_portrait', 'title': 'Fanny Hensel', 'subtitle': 'Vie et œuvre – Une première introduction', 'tag': 'Cours de 4 semaines'},
}
FOOTER = 'Fanny Hensel : vie et œuvre'
PORTRAIT = {'image': 'fanny_portrait', 'credit': 'Portrait par Moritz Daniel Oppenheim, 1842 (domaine public)'}
YOUNG = {'image': 'fanny_young', 'credit': 'Dessin de Wilhelm Hensel, son futur mari, 1829 (domaine public)'}

WEEKS = [
  {
    'title': 'Semaine 1 – Une enfance berlinoise dans une famille de génies (1805–1820)',
    'lessons': [
      {
        'title': 'Bienvenue : à la rencontre de Fanny Hensel', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Bienvenue dans ce cours ! Découvrez Fanny Hensel – l’une des compositrices les plus douées du XIXe siècle – et voyez comment se déroulent les quatre prochaines semaines.\n\nAstuce : ses lieder sont dans la bibliothèque mymusic.coach sous forme de partitions interactives – lisez-les, marquez vos préférés et gagnez des XP supplémentaires en les lisant jusqu’au bout.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 1', 'title': 'À la rencontre de Fanny Hensel', 'subtitle': 'Une première introduction à sa vie et à sa musique', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Pourquoi Fanny Hensel ?', 'bullets': [
              'Née Fanny Mendelssohn à Hambourg en 1805 – morte à Berlin en 1847',
              'Pianiste et compositrice, aussi douée que son frère Felix',
              'Plus de 450 œuvres : lieder, piano, musique de chambre, œuvres chorales et orchestrales',
              'Presque toute sa vie, sa famille ne l’autorisa pas à publier',
              'Ce n’est que depuis quelques décennies qu’une grande partie de sa musique est imprimée, jouée et enregistrée']},
          {'kind': 'timeline', 'title': 'Vos quatre semaines', 'rows': [
              ('Semaine 1', 'Une enfance berlinoise dans une famille de génies'),
              ('Semaine 2', '« Seulement un ornement » ? Des lieder sous le nom de son frère'),
              ('Semaine 3', 'Les musiques du dimanche et l’Italie'),
              ('Semaine 4', '« Das Jahr » – et enfin son propre nom')]},
          {'kind': 'bullets', 'title': 'Être compositrice au XIXe siècle', 'bullets': [
              'Les femmes de familles aisées apprenaient la musique – comme agrément, pas comme métier',
              'Se produire en public ou publier de la musique passait pour inconvenant pour une dame',
              'Beaucoup composèrent malgré tout – souvent en privé, dans les salons ou sous d’autres noms',
              'Dans ce cours, vous rencontrerez une femme qui trouva sa propre voie entre ces règles']},
        ],
      },
      {
        'title': 'Une famille de génies', 'type': 'SLIDES', 'minutes': 15,
        'description': "Les Mendelssohn étaient l’une des familles les plus remarquables d’Europe. Fanny grandit entourée d’idées, d’art – et de musique.",
        'slides': [
          {'kind': 'bullets', 'title': 'Hambourg, 14 novembre 1805', 'bullets': [
              'Fanny était l’aînée des quatre enfants du banquier Abraham Mendelssohn et de Lea Salomon',
              'Son grand-père était le célèbre philosophe Moses Mendelssohn',
              'Sa mère aurait remarqué à sa naissance que le bébé avait des « doigts à fugues de Bach »',
              'En 1811, la famille s’installa à Berlin']},
          {'kind': 'bullets', 'title': 'Fanny et Felix', 'bullets': [
              'Felix, né en 1809, fut toute sa vie son plus proche compagnon',
              'Ils eurent les mêmes professeurs : Ludwig Berger pour le piano, Carl Friedrich Zelter pour la composition',
              'Ils se montraient chaque nouvelle pièce et se demandaient conseil',
              'Tous deux aimaient Bach – chose rare à une époque où sa musique n’était presque plus jouée']},
          {'kind': 'timeline', 'title': 'Un talent extraordinaire', 'rows': [
              ('1811', 'La famille s’établit à Berlin'),
              ('1816', 'Leçons de piano à Paris lors d’un séjour familial'),
              ('1818', 'À 13 ans, elle joue de mémoire pour son père les 24 préludes du premier livre du Clavier bien tempéré de Bach'),
              ('1819', 'Son premier lied : pour l’anniversaire de son père')]},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Née le 14 novembre 1805 à Hambourg, aînée de quatre enfants',
              'Grand-père : le philosophe Moses Mendelssohn',
              'La même formation que Felix – avec Berger et Zelter',
              'À 13 ans, elle jouait de mémoire le premier livre du Clavier bien tempéré']},
        ],
      },
      {
        'title': 'Vidéo : qui était Fanny Mendelssohn ?', 'type': 'YOUTUBE', 'minutes': 3, 'video': 'https://www.youtube.com/watch?v=wS1GqLt1k3o',
        'description': "Une courte introduction de R. Larry Todd, auteur de la grande biographie « Fanny Hensel: The Other Mendelssohn » (Oxford University Press). La vidéo est en anglais – activez si besoin les sous-titres automatiques de YouTube.\n\nPendant le visionnage, réfléchissez :\n1. Pourquoi l’appelle-t-on souvent « l’autre Mendelssohn » ?\n2. Pourquoi tant de sa musique est-elle restée si longtemps inédite ?\n\nLes semaines suivantes vous donneront les réponses.",
      },
      {
        'title': 'Bilan de la semaine 1 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Un court résumé, un premier lied à lire et cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 1 en bref', 'bullets': [
              'Née à Hambourg le 14 novembre 1805, élevée à Berlin',
              'Petite-fille du philosophe Moses Mendelssohn',
              'Formée avec Felix par Ludwig Berger et Carl Friedrich Zelter',
              'Une prodige du clavier – surtout dans Bach']},
          {'kind': 'bullets', 'title': 'À lire cette semaine', 'bullets': [
              '« Schwanenlied » (Chant du cygne), de son Opus 1 – un court lied sur un poème de Heinrich Heine',
              'Remarquez l’accompagnement de piano doucement berçant et la voix qui flotte au-dessus',
              'Ouvrez la partition interactive et lisez-la']},
        ],
        'library': [('cmuyfx87200h92eonuq99hup5', '« Schwanenlied », op. 1 – partition interactive')],
        'quiz': [
          ('Dans quelle ville Fanny Mendelssohn est-elle née ?', ['Berlin', 'Hambourg', 'Leipzig', 'Francfort'], 1),
          ('Qui était son célèbre grand-père ?', ['Le compositeur Jean-Sébastien Bach', 'Le philosophe Moses Mendelssohn', 'Le poète Goethe', 'Le banquier Rothschild'], 1),
          ('Qui enseigna la composition à Fanny et Felix ?', ['Carl Friedrich Zelter', 'Ludwig van Beethoven', 'Antonio Salieri', 'Carl Czerny'], 0),
          ('Que joua Fanny de mémoire, à 13 ans, pour son père ?', ['Une sonate de Beethoven', 'Le premier livre du Clavier bien tempéré de Bach', 'Les concertos pour piano de Mozart', 'La première symphonie de son frère'], 1),
          ('En quelle année naquit son frère Felix ?', ['1805', '1809', '1811', '1820'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 2 – « Seulement un ornement » ? Des lieder sous le nom de son frère (1820–1829)',
    'lessons': [
      {
        'title': 'Un métier pour lui, un ornement pour elle', 'type': 'SLIDES', 'minutes': 15,
        'description': "Le père de Fanny dit très clairement ce qu’il attendait de sa fille. Ces diapositives montrent comment elle continua pourtant à composer.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 2', 'title': '« Seulement un ornement » ?', 'subtitle': '1820 – 1829', **YOUNG},
          {'kind': 'quote', 'quote': 'La musique deviendra peut-être son métier, alors que pour toi elle ne peut et ne doit être qu’un ornement, jamais le fondement de ton être et de ton action.', 'by': 'Abraham Mendelssohn à Fanny, 1820'},
          {'kind': 'bullets', 'title': 'Composer malgré tout', 'bullets': [
              'Fanny continua de composer : lieder, pièces pour piano, musique de chambre',
              'Sa musique se jouait à la maison et entre amis – pas en public',
              'Felix admirait ses œuvres – mais pensait comme leur père qu’elle ne devait pas publier',
              'Sa musique survécut surtout en manuscrit ; une grande partie ne fut imprimée qu’aux XXe et XXIe siècles']},
          {'kind': 'bullets', 'title': 'Sous le nom de Felix', 'bullets': [
              'En 1827 et 1830, Felix publia six de ses lieder dans ses propres recueils, op. 8 et op. 9',
              'Parmi eux : « Italien », « Das Heimweh » et « Suleika und Hatem »',
              'En 1842, la reine Victoria dit à Felix que « Italien » était son lied préféré et le lui chanta',
              'Felix dut avouer que c’était sa sœur qui l’avait écrit']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              '1820 : pour elle, la musique ne serait « qu’un ornement », écrit son père',
              'Elle continua de composer – pour la famille, les amis et le salon',
              'Six de ses lieder parurent sous le nom de Felix',
              'Le lied « de Mendelssohn » préféré de la reine Victoria était de Fanny']},
        ],
      },
      {
        'title': 'Lire : les lieder publiés par Felix', 'type': 'SLIDES', 'minutes': 12,
        'description': "Lisez les trois lieder de Fanny parus dans l’op. 8 de Felix – dont celui qu’aimait tant la reine Victoria.",
        'slides': [
          {'kind': 'listen', 'title': '« Italien » – le préféré de la reine Victoria', 'work': 'Italien (op. 8 n° 3, publié sous le nom de Felix)', 'points': [
              'Un poème de Franz Grillparzer sur la nostalgie du Sud ensoleillé',
              'Une partie de piano lumineuse et vive qui ne s’arrête jamais',
              'La mélodie s’élance vers le haut – pleine d’enthousiasme',
              'Ouvrez la partition interactive dans la bibliothèque et suivez-la']},
          {'kind': 'bullets', 'title': 'Deux autres lieder', 'bullets': [
              '« Das Heimweh » (Le mal du pays) – calme et intérieur',
              '« Suleika und Hatem » – un duo sur des poèmes du « Divan occidental-oriental » de Goethe',
              'Tous trois montrent son don mélodique et son écriture pianistique riche et inventive']},
          {'kind': 'bullets', 'title': 'Ce qui rend ses lieder particuliers', 'bullets': [
              'Des harmonies audacieuses – elle aimait les tournures surprenantes',
              'Le piano est un partenaire à part entière, comme dans les lieder de Schubert',
              'Elle mit en musique les meilleurs poètes : Goethe, Heine, Eichendorff']},
        ],
        'library': [('cmuyfx85700h32eonpqao4rwp', '« Italien » – partition interactive'), ('cmuyfx85700h22eonu1tu63fl', '« Das Heimweh » – partition interactive'), ('cmuyfx85800h42eony0mt51hg', '« Suleika und Hatem » – partition interactive')],
      },
      {
        'title': 'Vidéo : un mystère musical résolu', 'type': 'YOUTUBE', 'minutes': 5, 'video': 'https://www.youtube.com/watch?v=9asDSXTsko0',
        'description': "En 1828, Fanny écrivit une grande sonate pour piano, la « Sonate de Pâques ». On la crut longtemps perdue – et quand un manuscrit signé « F. Mendelssohn » réapparut en France en 1970, elle fut publiée et enregistrée comme une œuvre de Felix. En 2010, la musicologue Angela Mace démontra qu’elle était de Fanny.\n\nCette courte vidéo de l’université Duke raconte l’histoire. Elle est en anglais – activez si besoin les sous-titres automatiques.\n\nÀ méditer : combien d’autres œuvres de femmes sont encore classées sous le nom de quelqu’un d’autre ?",
      },
      {
        'title': 'Bilan de la semaine 2 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années 1820, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 2 en bref', 'bullets': [
              '1820 : la musique ne doit être pour elle « qu’un ornement », dit son père',
              '1827–1830 : six de ses lieder paraissent sous le nom de Felix',
              '1828 : la « Sonate de Pâques » – longtemps attribuée à Felix',
              '1842 : le lied « de Mendelssohn » préféré de la reine Victoria se révèle être de Fanny']},
        ],
        'quiz': [
          ('Selon son père, que devait être la musique pour Fanny ?', ['Son métier', 'Seulement un ornement', 'Un passe-temps du dimanche', 'Interdite'], 1),
          ('Sous quel nom six lieder de Fanny furent-ils d’abord publiés ?', ['Celui de son père', 'Celui de son frère Felix', 'Celui de Zelter', 'Anonymement'], 1),
          ('Lequel de ses lieder la reine Victoria chanta-t-elle à Felix ?', ['Schwanenlied', 'Italien', 'Gondellied', 'Die Mainacht'], 1),
          ('Qui démontra en 2010 que la « Sonate de Pâques » était de Fanny ?', ['R. Larry Todd', 'Angela Mace', 'Felix Mendelssohn', 'Clara Schumann'], 1),
          ('Quel poète écrivit le « Divan occidental-oriental » ?', ['Heine', 'Goethe', 'Schiller', 'Eichendorff'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 3 – Les musiques du dimanche et l’Italie (1829–1840)',
    'lessons': [
      {
        'title': 'Le mariage et les concerts du dimanche', 'type': 'SLIDES', 'minutes': 15,
        'description': "Un mariage avec un peintre qui l’encourageait, et une scène à elle dans la maison familiale : les années 1830 apportèrent à Fanny une liberté nouvelle.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 3', 'title': 'Musiques du dimanche et Italie', 'subtitle': '1829 – 1840', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Wilhelm Hensel', 'bullets': [
              'En 1829, Fanny épousa le peintre Wilhelm Hensel, peintre de la cour à Berlin',
              'Contrairement à son père, il l’encouragea à composer – et à publier',
              'Leur fils Sebastian naquit en 1830',
              'Wilhelm fit son portrait de nombreuses fois']},
          {'kind': 'bullets', 'title': 'Les « Sonntagsmusiken »', 'bullets': [
              'Dans la maison familiale, au 3 Leipziger Strasse à Berlin, elle organisait des concerts réguliers le dimanche',
              'Elle y jouait du piano, dirigeait un chœur et un petit orchestre – et créait ses propres œuvres',
              'Parmi les invités : Liszt, Clara Schumann, Gounod et de nombreuses personnalités berlinoises',
              'Elle y trouvait la vie musicale que la salle de concert lui refusait']},
          {'kind': 'timeline', 'title': 'Œuvres des années 1830', 'rows': [
              ('1831', 'Cantates pour les concerts du dimanche'),
              ('vers 1832', 'Ouverture en do majeur – sa seule ouverture pour orchestre'),
              ('1834', 'Quatuor à cordes en mi bémol majeur'),
              ('1839–1840', 'Un voyage en Italie avec Wilhelm et Sebastian')]},
        ],
        'library': [('cmuygtiqy00f64kktzy68v92b', 'Quatuor à cordes en mi bémol majeur – partition interactive')],
      },
      {
        'title': 'Vidéo : l’Ouverture en do majeur', 'type': 'YOUTUBE', 'minutes': 12, 'video': 'https://www.youtube.com/watch?v=D-j7qj2r5e0',
        'description': "L’Ouverture en do majeur de Fanny Hensel, écrite vers 1832 pour ses propres concerts, jouée ici par l’Orchestre symphonique de la WDR de Cologne sous la direction de Cristian Măcelaru (ARD Klassik).\n\nÉcoutez :\n1. Une introduction lente et solennelle\n2. Une partie principale animée aux bois lumineux\n3. L’assurance avec laquelle elle manie un orchestre complet – alors qu’elle en disposait rarement\n\nÀ méditer : pendant bien plus d’un siècle, cette pièce ne fut presque jamais jouée. Pourquoi, selon vous ?",
      },
      {
        'title': 'L’Italie : l’année la plus heureuse', 'type': 'SLIDES', 'minutes': 12,
        'description': "En 1839–1840, Fanny passa un an en Italie. À Rome, elle fut admirée comme compositrice comme jamais auparavant – elle en parla plus tard comme du temps le plus heureux de sa vie.",
        'slides': [
          {'kind': 'bullets', 'title': 'Rome, 1839–1840', 'bullets': [
              'Les Hensel voyagèrent environ un an à travers l’Italie',
              'À Rome, les jeunes compositeurs français de la Villa Médicis adoraient son jeu',
              'Parmi eux Charles Gounod, qui raconta dans ses mémoires comment elle lui fit découvrir Bach et Beethoven',
              'Pour une fois, on la traitait d’abord en artiste']},
          {'kind': 'listen', 'title': 'Lire un chant du Sud', 'work': '« Nach Süden » (Vers le Sud), op. 10', 'points': [
              'Un chant de nostalgie du Sud – écrit après le voyage en Italie',
              'Remarquez le rythme balancé et la mélodie large et ouverte',
              'Comparez-le avec « Gondellied » (Chant de gondole) de son Opus 1 – un autre souvenir italien',
              'Ouvrez les deux partitions interactives dans la bibliothèque']},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              '1829 : mariage avec le peintre Wilhelm Hensel',
              'Les concerts du dimanche au 3 Leipziger Strasse – sa propre scène',
              '1839–1840 : une année heureuse en Italie, admirée par Gounod et d’autres']},
        ],
        'library': [('cmuyfx85800h52eonoymq39tg', '« Nach Süden », op. 10 – partition interactive'), ('cmuyfx87800hf2eonpln88msa', '« Gondellied », op. 1 – partition interactive')],
      },
      {
        'title': 'Bilan de la semaine 3 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années 1830, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 3 en bref', 'bullets': [
              '1829 : mariage avec Wilhelm Hensel, qui l’encourageait',
              'Les concerts du dimanche – jouer, diriger, créer sa propre musique',
              'Ouverture en do majeur et Quatuor à cordes en mi bémol',
              '1839–1840 : l’Italie, où Gounod et d’autres l’admiraient']},
        ],
        'quiz': [
          ('Quel était le métier de Wilhelm Hensel ?', ['Compositeur', 'Peintre', 'Banquier', 'Poète'], 1),
          ('Qu’étaient les « Sonntagsmusiken » ?', ['Des offices religieux', 'Des concerts du dimanche dans la maison familiale', 'Une revue musicale', 'Ses leçons de piano'], 1),
          ('Quel compositeur français Fanny inspira-t-elle à Rome ?', ['Debussy', 'Gounod', 'Berlioz', 'Bizet'], 1),
          ('Quelle œuvre pour orchestre écrivit-elle vers 1832 ?', ['Une symphonie en ré', 'Une ouverture en do majeur', 'Un concerto pour violon', 'Un opéra'], 1),
          ('Comment Fanny décrivit-elle plus tard son année en Italie ?', ['Le temps le plus difficile', 'Le temps le plus heureux de sa vie', 'Du temps perdu', 'Des vacances studieuses'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 4 – « Das Jahr » et enfin son propre nom (1841–1847)',
    'lessons': [
      {
        'title': '« Das Jahr » et les premières publications', 'type': 'SLIDES', 'minutes': 15,
        'description': "Inspirée par l’Italie, Fanny écrivit son œuvre pour piano la plus ambitieuse – et à 40 ans, elle décida enfin de publier sous son propre nom.",
        'slides': [
          {'kind': 'bullets', 'title': '« Das Jahr » (L’Année), 1841', 'bullets': [
              'Douze pièces de caractère, une pour chaque mois, plus un postlude',
              'Chaque mois est écrit sur un papier de couleur différente, avec un dessin de Wilhelm et un court poème',
              'Des citations de chorals et de Bach apparaissent – pour Pâques, Noël, le Nouvel An',
              'L’un des cycles pour piano les plus originaux du XIXe siècle – publié intégralement seulement en 1989']},
          {'kind': 'timeline', 'title': 'Son propre nom', 'rows': [
              ('1846', 'Contre l’avis de son frère, elle décide de publier'),
              ('1846', 'Op. 1 : Six lieder – imprimés chez Bote & Bock à Berlin'),
              ('1846–1847', 'D’autres lieder, des pièces pour piano et des chœurs (les « Gartenlieder », op. 3)'),
              ('1847', 'Trio avec piano en ré mineur, op. 11 – l’une de ses dernières œuvres'),
              ('14 mai 1847', 'Meurt d’une attaque pendant la répétition d’un concert du dimanche, à 41 ans')]},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              '« Das Jahr » : douze mois en musique et en images',
              '1846 : premières publications sous son nom – à 40 ans',
              'Morte le 14 mai 1847 ; Felix mourut six mois plus tard']},
        ],
        'library': [('cmuyfx87700he2eonaax7iup7', '« Morgenständchen », op. 1 – partition interactive'), ('cmuyfx87n00hz2eonpox0xt8f', '« Im Wald », des Gartenlieder op. 3 – partition interactive')],
      },
      {
        'title': 'Écouter : la « Sonate de Pâques »', 'type': 'YOUTUBE', 'minutes': 8, 'video': 'https://www.youtube.com/watch?v=R-KSWCt5Pys',
        'description': "Vous vous souvenez du mystère musical de la semaine 2 ? Voici le finale de la « Sonate de Pâques » (1828), joué par Isata Kanneh-Mason sur son album consacré aux compositrices.\n\nÉcoutez :\n1. « Allegro con strepito » – rapide et bruyant : un mouvement orageux et dramatique\n2. Des échos de Beethoven, dont Fanny connaissait bien les dernières sonates\n3. La musique de la Passion et de Pâques – du tumulte à la lumière\n\nElle ne fut jouée en public sous son nom qu’en 2012 – 184 ans après sa composition.",
      },
      {
        'title': 'Fanny Hensel aujourd’hui', 'type': 'SLIDES', 'minutes': 12,
        'description': "Comment une compositrice presque oubliée est devenue l’une des femmes les plus connues de l’histoire de la musique.",
        'slides': [
          {'kind': 'bullets', 'title': 'Redécouverte', 'bullets': [
              'La plupart de ses manuscrits restèrent dans la famille ; beaucoup sont aujourd’hui à la Bibliothèque d’État de Berlin',
              'À partir des années 1980, chercheurs et interprètes commencèrent à publier et enregistrer sa musique',
              'En 2017, Google célébra son 212e anniversaire avec un Doodle vu dans le monde entier',
              'Ses lieder, le Trio avec piano et « Das Jahr » sont aujourd’hui régulièrement joués']},
          {'kind': 'bullets', 'title': 'Pourquoi elle compte', 'bullets': [
              'Une compositrice d’une vraie originalité – pas seulement « la sœur de Felix »',
              'Son histoire montre comment un talent peut être freiné – et trouver malgré tout son chemin',
              'Elle se construisit une vie musicale à elle dans son salon',
              'Bien d’autres compositrices sont redécouvertes aujourd’hui – Clara Schumann, Cécile Chaminade et d’autres']},
          {'kind': 'summary', 'title': 'Pour aller plus loin', 'bullets': [
              'Explorez plus de 30 de ses lieder dans la bibliothèque mymusic.coach',
              'Continuez avec « Felix Mendelssohn » et « Clara Schumann »',
              'Chanteurs et pianistes : demandez à votre professeur « Schwanenlied » ou « Italien »']},
        ],
      },
      {
        'title': 'Bilan final et quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Félicitations – vous êtes arrivé au bout du cours ! Un dernier résumé et un quiz final sur les quatre semaines.",
        'slides': [
          {'kind': 'timeline', 'title': 'La vie de Fanny Hensel en un coup d’œil', 'rows': [
              ('1805', 'Naissance à Hambourg le 14 novembre'),
              ('1820', 'La musique, « seulement un ornement », écrit son père'),
              ('1829', 'Mariage avec le peintre Wilhelm Hensel'),
              ('1831', 'Concerts du dimanche au 3 Leipziger Strasse'),
              ('1839–1840', 'Une année en Italie'),
              ('1846', 'Premières publications sous son nom'),
              ('1847', 'Morte à Berlin le 14 mai')]},
        ],
        'quiz': [
          ('Environ combien d’œuvres Fanny Hensel composa-t-elle ?', ['Environ 40', 'Environ 150', 'Plus de 450', 'Exactement 12'], 2),
          ('Qu’est-ce que « Das Jahr » ?', ['Un opéra', 'Un cycle de pièces pour piano sur les douze mois', 'Un cycle de lieder de Felix', 'Un journal intime'], 1),
          ('Quel âge avait Fanny lorsqu’elle publia pour la première fois sous son nom ?', ['18 ans', '25 ans', 'Environ 40 ans', 'Jamais'], 2),
          ('Qui l’encouragea à publier ?', ['Son père', 'Son mari Wilhelm', 'Zelter', 'La reine Victoria'], 1),
          ('Comment Fanny Hensel mourut-elle ?', ['Dans un accident de calèche', 'D’une attaque pendant une répétition', 'Du choléra en voyage', 'De vieillesse'], 1),
          ('Quel éditeur imprima son op. 1 en 1846 ?', ['Breitkopf & Härtel', 'Bote & Bock', 'Schott', 'Peters'], 1),
        ],
      },
    ],
  },
]
