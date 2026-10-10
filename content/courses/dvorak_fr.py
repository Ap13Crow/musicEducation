# Antonín Dvořák - version française de dvorak.py.
COURSE = {
    'slug': 'dvorak-vie-et-oeuvre-introduction',
    'language': 'fr',
    'translationOf': 'dvorak-life-and-music-introduction',
    'title': 'Antonín Dvořák : vie et œuvre – Une première introduction',
    'shortSummary': 'Quatre semaines avec Antonín Dvořák : un fils de boucher de village devenu la voix de la musique tchèque – Danses slaves, Symphonie « du Nouveau Monde », Quatuor « Américain » et Rusalka.',
    'description': (
        "Antonín Dvořák (1841–1904) grandit dans une auberge de village en Bohême, joua de l’alto pendant neuf ans dans un orchestre de théâtre à Prague – et devint "
        "l’un des compositeurs les plus aimés au monde, fêté à Londres et à New York.\n\n"
        "En quatre semaines, vous suivez sa vie pas à pas :\n"
        "- Semaine 1 – Du village à Prague (1841–1873)\n"
        "- Semaine 2 – Brahms, les Danses slaves et la gloire (1874–1884)\n"
        "- Semaine 3 – Le Nouveau Monde (1884–1895)\n"
        "- Semaine 4 – Le retour : Humoresque, Rusalka et héritage (1895–1904)\n\n"
        "Chaque semaine associe des diapositives illustrées, des interprétations de l’Orchestre philharmonique de Berlin et du Quatuor Pavel Haas, des enregistrements historiques "
        "de Fritz Kreisler et du Quatuor Flonzaley issus de la bibliothèque mymusic.coach, des partitions et un court quiz. Aucune connaissance préalable n’est nécessaire. "
        "Comptez environ 1 à 2 heures par semaine."
    ),
    'level': 'BEGINNER',
    'instruments': ['Violin', 'Viola', 'Cello', 'Piano'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'dvorak_portrait', 'title': 'Dvořák', 'subtitle': 'Vie et œuvre – Une première introduction', 'tag': 'Cours de 4 semaines'},
}
FOOTER = 'Antonín Dvořák : vie et œuvre'
PORTRAIT = {'image': 'dvorak_portrait', 'credit': 'Antonín Dvořák, photographie, 1882 (domaine public)'}
SLAVONIC = 'cmv2ixgfj00go12if8myhxypi'
QUARTET10 = 'cmuygtj1p00jo4kkty6s5jmia'
AMERICAN = 'cmuygtj1q00jq4kktrtycsxum'
HUMORESQUE = 'cmv2irtks007212ifp9xj9u4x'
MOTHER = 'cmv2j3jon00tq12ifnjkgcgxn'

WEEKS = [
  {
    'title': 'Semaine 1 – Du village à Prague (1841–1873)',
    'lessons': [
      {
        'title': 'Bienvenue : à la rencontre de Dvořák', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Bienvenue dans ce cours ! Découvrez Antonín Dvořák – et voyez comment se déroulent les quatre prochaines semaines.\n\nAstuce : toute la musique citée dans le cours est liée depuis les leçons. Ouvrez enregistrements et partitions dans la bibliothèque et gagnez des XP supplémentaires en écoutant ou en lisant jusqu’au bout.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 1', 'title': 'À la rencontre d’Antonín Dvořák', 'subtitle': 'Une première introduction à sa vie et à sa musique', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Pourquoi Dvořák ?', 'bullets': [
              'Né dans un village de Bohême en 1841 – mort à Prague en 1904',
              'Neuf symphonies – la dernière « du Nouveau Monde »',
              'Les Danses slaves, le Concerto pour violoncelle, le Quatuor « Américain », l’opéra « Rusalka »',
              'Il fit entrer les chants et les danses de Bohême dans la salle de concert',
              'Prononcez « DVOR-jak » – le « ř » est un son propre au tchèque']},
          {'kind': 'timeline', 'title': 'Vos quatre semaines', 'rows': [
              ('Semaine 1', 'Du village à Prague'),
              ('Semaine 2', 'Brahms, les Danses slaves et la gloire'),
              ('Semaine 3', 'Le Nouveau Monde'),
              ('Semaine 4', 'Le retour : Humoresque, Rusalka et héritage')]},
          {'kind': 'bullets', 'title': 'La Bohême au XIXe siècle', 'bullets': [
              'La Bohême – aujourd’hui le cœur de la République tchèque – faisait partie de l’Empire d’Autriche',
              'L’allemand était la langue de l’administration et des classes instruites',
              'Les artistes tchèques voulaient que leur langue, leur histoire et leur musique soient respectées',
              'Bedřich Smetana et Dvořák devinrent les voix musicales de ce mouvement']},
        ],
      },
      {
        'title': 'Une enfance à l’auberge du village', 'type': 'SLIDES', 'minutes': 15,
        'description': "Dvořák devait devenir boucher, comme son père. La musique en décida autrement.",
        'slides': [
          {'kind': 'image', 'title': 'Nelahozeves, 8 septembre 1841', 'text': 'Antonín naquit dans cette maison d’un village au bord de la Vltava, au nord de Prague. Son père František était boucher et aubergiste du village – et jouait de la cithare pour les bals. Antonín était l’aîné de quatorze enfants.', 'image': 'dvorak_birthplace', 'credit': 'Maison natale de Dvořák à Nelahozeves (photo, domaine public)'},
          {'kind': 'bullets', 'title': 'Apprendre la musique', 'bullets': [
              'L’instituteur du village lui apprit le violon ; il jouait dans la fanfare du village et à l’église',
              'À 12 ans, on l’envoya à Zlonice apprendre l’allemand – indispensable pour toute carrière',
              'L’organiste Antonín Liehmann lui y enseigna l’orgue, l’alto, le piano et la théorie musicale',
              'Son père voulait toujours qu’il reprenne la boucherie']},
          {'kind': 'timeline', 'title': 'Vers Prague', 'rows': [
              ('1857–1859', 'Études à l’École d’orgue de Prague'),
              ('1859', 'Altiste dans l’orchestre de danse populaire de Karel Komzák'),
              ('1862', 'L’orchestre devient le noyau de celui du nouveau Théâtre provisoire tchèque'),
              ('1866', 'Bedřich Smetana devient chef d’orchestre du théâtre')]},
          {'kind': 'summary', 'title': 'À retenir', 'bullets': [
              'Né le 8 septembre 1841 à Nelahozeves, fils d’un boucher-aubergiste',
              'Il apprit l’orgue, l’alto et la théorie avec Antonín Liehmann à Zlonice',
              'École d’orgue de Prague, 1857–1859']},
        ],
      },
      {
        'title': 'Écouter : la vie et la musique de Dvořák', 'type': 'YOUTUBE', 'minutes': 30, 'video': 'https://www.youtube.com/watch?v=YnVymt9mu8U',
        'description': "Un documentaire sonore de WETA Classical, la radio classique publique de Washington. Il raconte l’histoire de Dvořák « des débuts modestes à la gloire », avec beaucoup de musique. L’émission est en anglais et longue – écoutez la première demi-heure maintenant et le reste plus tard dans le cours. Les sous-titres automatiques de YouTube peuvent aider.\n\nPendant l’écoute, cherchez :\n1. Qui aida Dvořák à trouver son premier grand éditeur ?\n2. Pourquoi partit-il en Amérique ?\n3. Qu’est-ce qui lui manquait le plus loin de chez lui ?",
      },
      {
        'title': 'Neuf ans à l’orchestre – et quiz de la semaine 1', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "La vraie école de Dvořák fut la fosse d’orchestre. Un court résumé et cinq questions.",
        'slides': [
          {'kind': 'bullets', 'title': 'Altiste au théâtre', 'bullets': [
              'De 1862 à 1871, il joua de l’alto dans l’orchestre du Théâtre provisoire',
              'Il apprit de l’intérieur les opéras de Mozart, Rossini, Verdi et Smetana',
              'En 1863, il joua sous la direction de Richard Wagner, venu diriger ses propres œuvres à Prague',
              'Il composait la nuit – symphonies, quatuors, un opéra – et en brûla une partie plus tard']},
          {'kind': 'bullets', 'title': 'Premier succès, 1873', 'bullets': [
              'Son hymne patriotique « Les Héritiers de la Montagne Blanche » fut un succès à Prague',
              'En 1873, il épousa Anna Čermáková, chanteuse ; ils eurent neuf enfants',
              'Il avait quitté l’orchestre en 1871 ; à partir de 1874, il fut organiste de l’église Saint-Adalbert à Prague',
              'Il avait 32 ans – et restait presque inconnu hors de Prague']},
          {'kind': 'summary', 'title': 'La semaine 1 en bref', 'bullets': [
              'Une enfance villageoise à Nelahozeves',
              'École d’orgue de Prague, puis neuf ans d’altiste au théâtre',
              'Apprendre en jouant : Mozart, Verdi, Wagner, Smetana',
              '1873 : premier succès, mariage avec Anna Čermáková']},
        ],
        'quiz': [
          ('Quel était le métier du père de Dvořák ?', ['Organiste', 'Boucher et aubergiste', 'Instituteur', 'Paysan'], 1),
          ('Pourquoi le jeune Dvořák fut-il envoyé à Zlonice ?', ['Pour apprendre l’allemand', 'Pour étudier le droit', 'Pour travailler à l’usine', 'Pour devenir prêtre'], 0),
          ('De quel instrument Dvořák jouait-il à l’orchestre du théâtre ?', ['Le violon', 'L’alto', 'Le cor', 'La contrebasse'], 1),
          ('Quel compositeur célèbre dirigea l’orchestre du théâtre à partir de 1866 ?', ['Brahms', 'Smetana', 'Liszt', 'Janáček'], 1),
          ('Qui Dvořák épousa-t-il en 1873 ?', ['Josefina Čermáková', 'Anna Čermáková', 'Clara Wieck', 'Bertha Faber'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 2 – Brahms, les Danses slaves et la gloire (1874–1884)',
    'lessons': [
      {
        'title': 'Une lettre de Brahms', 'type': 'SLIDES', 'minutes': 15,
        'description': "Une bourse d’État pour artistes sans ressources attira sur Dvořák l’attention de Johannes Brahms – et changea sa vie.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 2', 'title': 'Brahms, les Danses slaves et la gloire', 'subtitle': '1874 – 1884', **PORTRAIT},
          {'kind': 'bullets', 'title': 'La bourse de l’État autrichien', 'bullets': [
              'En 1874, Dvořák obtint une bourse d’État destinée aux jeunes artistes sans ressources – puis de nouveau les années suivantes',
              'Dans le jury : le critique Eduard Hanslick – et Johannes Brahms',
              'Brahms fut profondément impressionné par les « Duos moraves » de Dvořák',
              'En 1877, il le recommanda à son propre éditeur, Fritz Simrock, à Berlin']},
          {'kind': 'bullets', 'title': 'Les Danses slaves, 1878', 'bullets': [
              'Simrock demanda des danses dans l’esprit des Danses hongroises de Brahms',
              'Dvořák écrivit huit Danses slaves pour piano à quatre mains, puis pour orchestre',
              'Elles reposent sur des rythmes de danses tchèques comme le furiant et la polka – mais les mélodies sont de lui',
              'Un immense succès : les magasins de musique furent dévalisés et les orchestres les jouèrent partout']},
          {'kind': 'bullets', 'title': 'Stabat Mater', 'bullets': [
              'Entre 1875 et 1877, Dvořák et Anna perdirent trois jeunes enfants',
              'Il fit de son chagrin une grande mise en musique du « Stabat Mater » – Marie au pied de la croix',
              'Son exécution à Londres en 1883 le rendit célèbre en Angleterre']},
        ],
      },
      {
        'title': 'Écouter : une Danse slave', 'type': 'AUDIO', 'minutes': 6, 'libraryAudio': [SLAVONIC, 0],
        'description': "Le grand violoniste Fritz Kreisler aimait la musique de Dvořák et arrangea plusieurs Danses slaves pour violon et piano. Il en joue ici une lui-même, avec Carl Lamson au piano, sur un 78 tours de 1917.\n\nÉcoutez :\n1. Une mélodie mélancolique et chantante – typique du son « slave » de Dvořák\n2. De petits glissandos et ornements au violon – comme un violoneux populaire\n3. Comment l’humeur passe de la tristesse à l’espièglerie\n\nAussi dans la bibliothèque : deux autres Danses slaves jouées par Jascha Heifetz en 1922.",
        'library': [(SLAVONIC, 'Danse slave – Fritz Kreisler, violon, 1917'), ('cmv2ixh4q00gq12ifx2upgais', 'Danse slave n° 2 – Jascha Heifetz, 1922'), ('cmv2ixhra00gs12ifluucbdpw', 'Danse slave n° 3 – Jascha Heifetz, 1922')],
      },
      {
        'title': 'Écouter : la « Doumka »', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [QUARTET10, 1],
        'description': "Après les Danses slaves, tout le monde voulait de la musique « slave » de Dvořák. Le Quatuor à cordes en mi bémol majeur, op. 51 (1879) fut commandé par le premier violon du célèbre Quatuor florentin – qui demandait exactement cela.\n\nLe deuxième mouvement est une « doumka » : une forme slave qui alterne une lamentation lente et triste et une danse rapide et sauvage. Dvořák l’adorait – il écrivit même plus tard tout un trio avec piano fait de doumkas, le Trio « Dumky ».\n\nÉcoutez (enregistrement Musopen, domaine public) :\n1. Une mélodie mélancolique sur des accords pincés, comme à la guitare\n2. Le passage soudain à une danse rapide et joyeuse\n3. Le retour de la tristesse\n\nLa partition du quatuor est dans la bibliothèque.",
        'library': [(QUARTET10, 'Quatuor à cordes n° 10 en mi bémol majeur, op. 51 – enregistrement'), ('cmuygtidh00c14kktnzbxdgch', 'Quatuor à cordes n° 10 – partition interactive')],
      },
      {
        'title': 'Bilan de la semaine 2 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années de percée, puis cinq questions.",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 2 en bref', 'bullets': [
              '1874 : la bourse de l’État autrichien ; Brahms dans le jury',
              '1877 : Brahms le recommande à l’éditeur Simrock',
              '1878 : les Danses slaves le rendent célèbre',
              'Stabat Mater – une musique née du chagrin ; 1884 : premier voyage à Londres']},
        ],
        'quiz': [
          ('Quel compositeur célèbre aida Dvořák à trouver un éditeur ?', ['Wagner', 'Brahms', 'Liszt', 'Tchaïkovski'], 1),
          ('Quel éditeur publia les Danses slaves ?', ['Simrock', 'Breitkopf & Härtel', 'Ricordi', 'Novello'], 0),
          ('Sur quel modèle les Danses slaves furent-elles écrites ?', ['Les Mazurkas de Chopin', 'Les Danses hongroises de Brahms', 'Les Rhapsodies hongroises de Liszt', 'Les Valses de Strauss'], 1),
          ('Qu’est-ce qu’une « doumka » ?', ['Une polka tchèque', 'Une forme slave entre lamentation et danse rapide', 'Un cantique', 'Une sorte de cornemuse'], 1),
          ('Qu’est-ce qui inspira le Stabat Mater de Dvořák ?', ['Une commande du pape', 'La mort de trois de ses enfants', 'Un voyage à Rome', 'Son mariage'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 3 – Le Nouveau Monde (1884–1895)',
    'lessons': [
      {
        'title': 'De Londres à New York', 'type': 'SLIDES', 'minutes': 15,
        'description': "L’Angleterre accueillit Dvořák en héros. Puis vint d’Amérique une offre qu’il ne pouvait refuser.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 3', 'title': 'Le Nouveau Monde', 'subtitle': '1884 – 1895', **PORTRAIT},
          {'kind': 'timeline', 'title': 'La gloire internationale', 'rows': [
              ('1884', 'Il dirige son Stabat Mater au Royal Albert Hall de Londres – le premier de neuf voyages en Angleterre'),
              ('1885', 'Symphonie n° 7, écrite pour la Philharmonic Society de Londres'),
              ('1889', 'Symphonie n° 8'),
              ('1891', 'Docteur honoris causa de Cambridge ; professeur au Conservatoire de Prague ; le Trio « Dumky »')]},
          {'kind': 'bullets', 'title': 'Une invitation en Amérique', 'bullets': [
              'Jeannette Thurber, fondatrice du National Conservatory of Music de New York, l’invita à en prendre la direction',
              'Le salaire valait plusieurs fois ce qu’il gagnait à Prague',
              'En septembre 1892, il arriva à New York avec sa femme et deux de leurs enfants',
              'Le conservatoire était ouvert aux femmes et aux étudiants noirs – chose rare à l’époque']},
          {'kind': 'bullets', 'title': 'Une musique pour l’Amérique', 'bullets': [
              'Son élève Harry T. Burleigh lui chantait des spirituals afro-américains',
              'Dvořák déclara aux journaux américains que la musique future de l’Amérique devait naître de ces mélodies et de la musique amérindienne',
              'Beaucoup d’Américains furent surpris – certains, fâchés',
              'Burleigh devint plus tard un chanteur célèbre et un arrangeur de spirituals']},
        ],
      },
      {
        'title': 'Vidéo : Symphonie « du Nouveau Monde » – Largo', 'type': 'YOUTUBE', 'minutes': 14, 'video': 'https://www.youtube.com/watch?v=acurczH-Yt8',
        'description': "La Symphonie n° 9 en mi mineur, « du Nouveau Monde », fut créée par le New York Philharmonic au Carnegie Hall le 16 décembre 1893 – un triomphe. Voici le mouvement lent, le Largo, joué par l’Orchestre philharmonique de Berlin.\n\nÉcoutez :\n1. Les accords solennels des cuivres au début\n2. La célèbre mélodie du cor anglais – si proche d’un spiritual qu’elle devint plus tard la chanson « Goin’ Home », sur des paroles de son élève William Arms Fisher\n3. Une partie centrale agitée – et un moment où reviennent des thèmes des autres mouvements\n\nEnvie d’entendre toute la symphonie ? L’interprétation complète du hr-Sinfonieorchester est sur YouTube : youtube.com/watch?v=jOofzffyDSA",
      },
      {
        'title': 'Spillville et le Quatuor « Américain »', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': ['cmv2iw83r00ei12ifvohs4sv4', 0],
        'description': "À l’été 1893, la famille Dvořák séjourna à Spillville, dans l’Iowa – un petit village d’immigrés tchèques. Dvořák tenait l’orgue de l’église, se promenait dans les bois et écoutait les oiseaux. En un peu plus de deux semaines, en juin, il écrivit le Quatuor à cordes en fa majeur, op. 96 – l’« Américain ».\n\nVoici le mouvement lent, le Lento, joué en 1925 par le Quatuor Flonzaley – l’un des premiers grands quatuors à cordes à enregistrer des disques.\n\nÉcoutez :\n1. Une longue mélodie triste au violon, puis au violoncelle – le mal du pays, peut-être\n2. Un accompagnement simple et régulier aux autres instruments\n3. Des mélodies pentatoniques (à cinq notes), comme dans les musiques populaires du monde entier\n\nAussi dans la bibliothèque : le quatuor complet (Musopen) et la partition.",
        'library': [('cmv2iw83r00ei12ifvohs4sv4', 'Quatuor « Américain » : Lento – Quatuor Flonzaley, 1925'), (AMERICAN, 'Quatuor « Américain » – enregistrement complet'), ('cmuygtidi00c34kktknas3av8', 'Quatuor « Américain » – partition interactive')],
      },
      {
        'title': 'Bilan de la semaine 3 et quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Résumé des années américaines, puis cinq questions. Si vous avez le temps, regardez le Quatuor « Américain » complet par le Quatuor Pavel Haas : youtube.com/watch?v=cb3jPORwL74",
        'slides': [
          {'kind': 'summary', 'title': 'La semaine 3 en bref', 'bullets': [
              'Neuf voyages en Angleterre ; Symphonies n° 7 et 8',
              '1892–1895 : directeur du National Conservatory de New York',
              '1893 : la Symphonie « du Nouveau Monde » au Carnegie Hall',
              '1893 : le Quatuor « Américain », écrit à Spillville, dans l’Iowa']},
        ],
        'quiz': [
          ('Qui invita Dvořák à New York ?', ['Andrew Carnegie', 'Jeannette Thurber', 'Leonard Bernstein', 'Harry T. Burleigh'], 1),
          ('Où la Symphonie « du Nouveau Monde » fut-elle créée ?', ['Au Royal Albert Hall de Londres', 'Au Carnegie Hall de New York', 'Au Rudolfinum de Prague', 'Au Musikverein de Vienne'], 1),
          ('Quel instrument joue la célèbre mélodie du Largo ?', ['La flûte', 'Le cor anglais', 'La trompette', 'Le violon'], 1),
          ('Où Dvořák écrivit-il le Quatuor « Américain » ?', ['New York', 'Spillville, dans l’Iowa', 'Chicago', 'Prague'], 1),
          ('Quel élève chantait des spirituals à Dvořák ?', ['William Arms Fisher', 'Harry T. Burleigh', 'Scott Joplin', 'George Gershwin'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Semaine 4 – Le retour : Humoresque, Rusalka et héritage (1895–1904)',
    'lessons': [
      {
        'title': 'Écouter : Humoresque', 'type': 'AUDIO', 'minutes': 5, 'libraryAudio': [HUMORESQUE, 0],
        'description': "À l’été 1894, en vacances chez lui en Bohême, Dvořák écrivit huit courtes pièces pour piano, les Humoresques op. 101 – à partir d’esquisses de ses carnets américains. La n° 7 en sol bémol majeur devint l’une des mélodies les plus célèbres au monde.\n\nLa voici dans la version pour violon de Fritz Kreisler, jouée par Kreisler lui-même sur un disque de 1911.\n\nÉcoutez :\n1. Un rythme pointé et sautillant – léger et plein d’humour\n2. Un passage soudain vers un mineur plus grave au milieu\n3. Le célèbre son chaleureux de Kreisler et ses glissandos délicats\n\nAussi dans la bibliothèque : la version de Mischa Elman de 1919.",
        'library': [(HUMORESQUE, 'Humoresque – Fritz Kreisler, violon, 1911'), ('cmv2irz2c007412ifpn7kiyef', 'Humoresque – Mischa Elman, violon, 1919')],
      },
      {
        'title': 'Chez lui : le Concerto pour violoncelle et Rusalka', 'type': 'SLIDES', 'minutes': 15,
        'description': "Dvořák rentra en Bohême en 1895 et ne la quitta plus. Ses dernières années lui donnèrent un grand concerto – et son opéra le plus populaire.",
        'slides': [
          {'kind': 'title', 'week': 'Semaine 4', 'title': 'Le retour', 'subtitle': '1895 – 1904', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Le Concerto pour violoncelle, 1894–1895', 'bullets': [
              'Écrit à New York pendant son dernier hiver américain',
              'Brahms se serait exclamé : « Pourquoi ne savais-je pas qu’on pouvait écrire un concerto pour violoncelle comme celui-là ? »',
              'De retour chez lui, il réécrivit la fin en mémoire de sa belle-sœur Josefina, son premier amour, qui venait de mourir',
              'C’est peut-être le plus aimé de tous les concertos pour violoncelle']},
          {'kind': 'bullets', 'title': '« Rusalka », 1901', 'bullets': [
              'Un opéra-conte : une ondine tombe amoureuse d’un prince et renonce à sa voix pour devenir humaine',
              'Créé au Théâtre national de Prague le 31 mars 1901',
              'Le « Chant à la lune » de Rusalka est l’un des airs de soprano les plus aimés',
              'Regardez-le dans la leçon suivante']},
          {'kind': 'timeline', 'title': 'Les dernières années', 'rows': [
              ('1895', 'Retour définitif à Prague'),
              ('1896', 'Dernier voyage à Londres ; poèmes symphoniques sur des contes tchèques'),
              ('1901', '« Rusalka » ; directeur du Conservatoire de Prague ; ses 60 ans fêtés dans tout le pays'),
              ('1er mai 1904', 'Meurt à Prague à 62 ans ; inhumé au cimetière de Vyšehrad')]},
        ],
      },
      {
        'title': 'Vidéo : le « Chant à la lune »', 'type': 'YOUTUBE', 'minutes': 6, 'video': 'https://www.youtube.com/watch?v=ZAJmU_pmWJk',
        'description': "La soprano slovaque Lucia Popp chante « Měsíčku na nebi hlubokém » – « Lune, haut dans le ciel profond » – extrait du premier acte de Rusalka.\n\nRusalka demande à la lune de dire au prince qu’elle l’aime.\n\nÉcoutez :\n1. La harpe et les cordes scintillantes – un clair de lune sur l’eau\n2. Une longue mélodie flottante qui monte toujours plus haut\n3. La langue tchèque – chantée selon la forme des mots\n\nPour voir l’opéra sur scène, la bande-annonce de la production du Royal Opera House est ici : youtube.com/watch?v=KJMp4ps_CZ0",
      },
      {
        'title': 'Bilan final et quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Félicitations – vous êtes arrivé au bout du cours ! Un dernier résumé, un chant à lire et un quiz final.",
        'slides': [
          {'kind': 'timeline', 'title': 'La vie de Dvořák en un coup d’œil', 'rows': [
              ('1841', 'Naissance à Nelahozeves le 8 septembre'),
              ('1862–1871', 'Altiste à l’orchestre du Théâtre provisoire'),
              ('1878', 'Danses slaves – la gloire internationale'),
              ('1884', 'Premier voyage en Angleterre'),
              ('1892–1895', 'Directeur à New York ; Symphonie « du Nouveau Monde »'),
              ('1901', '« Rusalka »'),
              ('1904', 'Mort à Prague le 1er mai')]},
          {'kind': 'listen', 'title': 'À lire : « Chansons que ma mère m’a apprises »', 'work': 'Mélodies tziganes, op. 55 n° 4 (1880)', 'points': [
              'Le chant d’une mère qui pleurait en chantant pour son enfant – et maintenant l’enfant pleure à son tour',
              'L’une de ses mélodies les plus célèbres',
              'Lisez la partition – puis écoutez la soprano Geraldine Farrar la chanter en 1922']},
        ],
        'library': [('cmuygw9qm021b4kkto9nvmeeq', '« Als die alte Mutter » (Chansons que ma mère m’a apprises) – partition'), (MOTHER, '« Songs My Mother Taught Me » – Geraldine Farrar, 1922')],
        'quiz': [
          ('Quelle pièce de Dvořák Kreisler rendit-il célèbre au violon ?', ['Le Concerto pour violoncelle', 'L’Humoresque n° 7', 'Le Largo', 'Rusalka'], 1),
          ('Qui est Rusalka ?', ['Une danse tchèque', 'Une ondine dans un opéra-conte', 'Un village près de Prague', 'Un quatuor à cordes'], 1),
          ('À qui Rusalka chante-t-elle son air célèbre ?', ['Au soleil', 'À la lune', 'À la rivière', 'À la mère du prince'], 1),
          ('Où Dvořák écrivit-il son Concerto pour violoncelle ?', ['Prague', 'New York', 'Londres', 'Vienne'], 1),
          ('En quelle année Dvořák mourut-il ?', ['1895', '1901', '1904', '1914'], 2),
          ('Où Dvořák est-il enterré ?', ['À Nelahozeves', 'Au cimetière de Vyšehrad à Prague', 'Au cimetière central de Vienne', 'À Spillville'], 1),
        ],
      },
    ],
  },
]
