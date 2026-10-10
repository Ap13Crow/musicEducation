# Cécile Chaminade - a 4-week first-level introduction.
COURSE = {
    'slug': 'chaminade-life-and-music-introduction',
    'title': 'Cécile Chaminade: Life and Music - A First Introduction',
    'shortSummary': 'Four weeks with Cécile Chaminade: a Parisian pianist-composer whose music sold in hundreds of thousands of copies, who toured America and was the first woman composer in the Légion d\'honneur.',
    'description': (
        "Cécile Chaminade (1857-1944) was one of the most famous composers of her time: her piano pieces and songs were in every home, "
        "hundreds of \"Chaminade Clubs\" met in America, and she played for Queen Victoria. Then she was almost forgotten.\n\n"
        "In four weeks you follow her life step by step:\n"
        "- Week 1 - A Parisian childhood: \"my little Mozart\" (1857-1880)\n"
        "- Week 2 - Ballet, concert piece and concert études (1880-1892)\n"
        "- Week 3 - Songs, England and the Concertino (1892-1907)\n"
        "- Week 4 - America, the Légion d'honneur and rediscovery (1908-1944)\n\n"
        "Every week combines illustrated slides, videos (France Musique, Emmanuel Pahud with the Munich Radio Orchestra), records from the 1920s "
        "with Fritz Kreisler from the mymusic.coach Library, interactive scores of her songs, and a short quiz. No previous knowledge is needed. "
        "Plan about 1-2 hours per week."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Flute', 'Voice'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'chaminade_portrait', 'title': 'Cécile Chaminade', 'subtitle': 'Life and Music - A First Introduction', 'tag': '4-week course'},
}
FOOTER = 'Cécile Chaminade: Life and Music'
PORTRAIT = {'image': 'chaminade_portrait', 'credit': 'Cécile Chaminade, photograph, 1913 (public domain)'}
YOUNG = {'image': 'chaminade_young', 'credit': 'Photograph by H. S. Mendelssohn, London, 1890 (public domain)'}
SCARF = 'cmv2j70x6011012ifhfctd2w7'
FLATTERER = 'cmv2j7098010y12ifgv210i3o'
SERENADE = 'cmv2ixxlm00i212if0ykwfcf1'
PIERRETTE = 'cmv2ivpas00do12ifn83m4zsw'

WEEKS = [
  {
    'title': 'Week 1 - A Parisian Childhood: "My Little Mozart" (1857-1880)',
    'lessons': [
      {
        'title': 'Welcome: meet Cécile Chaminade', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Welcome to the course! Meet Cécile Chaminade - pianist, composer and international celebrity - and see how the next four weeks work.\n\nTip: her songs are in the mymusic.coach Library as interactive scores, and her piano music on records from the 1920s - star your favourites and earn extra XP for reading or listening to the end.",
        'slides': [
          {'kind': 'title', 'week': 'Week 1', 'title': 'Meet Cécile Chaminade', 'subtitle': 'A first introduction to her life and music', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Why Chaminade?', 'bullets': [
              'Born in Paris in 1857 - died in Monte Carlo in 1944',
              'Around 400 works: piano pieces, more than 100 songs, a ballet, an opera, a flute concertino',
              'One of the best-selling composers of her time, in Europe and America',
              'A concert pianist who toured with her own music for over 30 years',
              'In 1913 the first woman composer to be made a knight of the Légion d\'honneur']},
          {'kind': 'timeline', 'title': 'Your four weeks', 'rows': [
              ('Week 1', 'A Parisian childhood: "my little Mozart"'),
              ('Week 2', 'Ballet, concert piece and concert études'),
              ('Week 3', 'Songs, England and the Concertino'),
              ('Week 4', 'America, the Légion d\'honneur and rediscovery')]},
          {'kind': 'bullets', 'title': 'Music in the home', 'bullets': [
              'Around 1900 almost every middle-class home had a piano',
              'Publishers sold huge numbers of short piano pieces and songs for amateurs',
              'Chaminade wrote exactly this music - elegant, tuneful, not too difficult',
              'It made her famous and rich - and later made critics look down on her as a "salon composer"']},
        ],
      },
      {
        'title': 'A gifted girl in Paris', 'type': 'SLIDES', 'minutes': 15,
        'description': "Her father did not want her to study at the Conservatoire. A famous neighbour saw her talent.",
        'slides': [
          {'kind': 'bullets', 'title': 'Paris, 8 August 1857', 'bullets': [
              'Cécile Louise Stéphanie Chaminade was born into a well-off Paris family',
              'Her mother, a pianist and singer, gave her her first lessons',
              'She composed small pieces - some of them church music - from the age of about eight',
              'Her father worked for an insurance company and played the violin as an amateur']},
          {'kind': 'bullets', 'title': '"My little Mozart"', 'bullets': [
              'The family spent summers at Le Vésinet, near Paris, where Georges Bizet - the composer of "Carmen" - was a neighbour',
              'Bizet was charmed by her music and is said to have called her "my little Mozart"',
              'Félix Le Couppey, a professor at the Conservatoire, advised that she should study there',
              'Her father refused: the Conservatoire was not a proper place for a girl of her class']},
          {'kind': 'bullets', 'title': 'Private lessons instead', 'bullets': [
              'She studied privately with teachers from the Conservatoire',
              'Piano with Félix Le Couppey, harmony and counterpoint with Augustin Savard',
              'Composition with Benjamin Godard, a successful composer of the time',
              'An excellent training - but without the diplomas and prizes that opened doors for men']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Born 8 August 1857 in Paris',
              'First lessons from her mother; composing from about the age of eight',
              'Bizet\'s "little Mozart" - but no Conservatoire, by her father\'s wish',
              'Private lessons with Le Couppey, Savard and Godard']},
        ],
      },
      {
        'title': 'Watch: Great Composers - Cécile Chaminade', 'type': 'YOUTUBE', 'minutes': 6, 'video': 'https://www.youtube.com/watch?v=n5K8UBhShV4',
        'description': "A short introduction from the series \"Classical Nerd\": who Chaminade was, how famous she became - and why she was forgotten.\n\nWhile you watch, look out for:\n1. What were the \"Chaminade Clubs\"?\n2. Why did critics later dismiss her music?\n3. Which piece by her is still played by almost every flautist?\n\nEverything comes back in the next weeks.",
      },
      {
        'title': 'A first concert - and week 1 quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "At eighteen Chaminade began to play in public. A short recap and five questions.",
        'slides': [
          {'kind': 'title', 'week': 'Week 1', 'title': 'On stage', 'subtitle': 'A young pianist-composer', **YOUNG},
          {'kind': 'bullets', 'title': 'Into the concert world', 'bullets': [
              'From the late 1870s she played her own music in the concerts and salons of Paris',
              'Her music was soon printed by Paris publishers and played by other pianists too',
              'In 1880 her Piano Trio No. 1 was performed by the respected Société nationale de musique',
              'She was always her own best performer - pianist and composer in one']},
          {'kind': 'summary', 'title': 'Week 1 in a nutshell', 'bullets': [
              'A Parisian childhood in a musical family',
              'Encouraged by Bizet, held back by her father',
              'Private training with leading teachers',
              'A pianist-composer playing her own music from her late teens']},
        ],
        'quiz': [
          ('In which city was Cécile Chaminade born?', ['Lyon', 'Paris', 'Marseille', 'Brussels'], 1),
          ('Which composer is said to have called her "my little Mozart"?', ['Gounod', 'Georges Bizet', 'Massenet', 'Debussy'], 1),
          ('Why did she not study at the Paris Conservatoire?', ['She failed the exam', 'Her father refused', 'Women were banned by law', 'She lived abroad'], 1),
          ('Who taught her composition?', ['Benjamin Godard', 'César Franck', 'Gabriel Fauré', 'Camille Saint-Saëns'], 0),
          ('What kind of music made Chaminade famous?', ['Symphonies', 'Short piano pieces and songs', 'Church masses', 'Operas'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 2 - Ballet, Concert Piece and Concert Études (1880-1892)',
    'lessons': [
      {
        'title': 'Large works: stage and orchestra', 'type': 'SLIDES', 'minutes': 15,
        'description': "In the 1880s Chaminade wrote her largest works - for the stage and for orchestra.",
        'slides': [
          {'kind': 'title', 'week': 'Week 2', 'title': 'Ballet, concert piece and études', 'subtitle': '1880 - 1892', **YOUNG},
          {'kind': 'timeline', 'title': 'Big ambitions', 'rows': [
              ('1882', '"La Sévillane", a comic opera, performed privately at her family\'s home in Paris'),
              ('1886', 'Six Concert Études, Op. 35 - among them "Automne" (Autumn)'),
              ('1888', '"Callirhoë", a ballet, premiered in Marseille'),
              ('1888', 'Concertstück for piano and orchestra; "Les Amazones", a dramatic symphony with choir')]},
          {'kind': 'bullets', 'title': '"Not a woman who composes"', 'bullets': [
              'Some critics praised her large works; others said they were "too masculine" for a woman',
              'The composer Ambroise Thomas is said to have remarked: "This is not a woman who composes, but a composer who is a woman"',
              'Big works were hard to get performed - especially for a woman without official posts',
              'Short pieces and songs, on the other hand, sold - and she wrote more and more of them']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              '1882: "La Sévillane" (opera)',
              '1888: "Callirhoë" (ballet), Concertstück, "Les Amazones"',
              'Large works were praised - but rarely performed']},
        ],
      },
      {
        'title': 'Listen: the Scarf Dance', 'type': 'AUDIO', 'minutes': 5, 'libraryAudio': [SCARF, 0],
        'description': "The ballet \"Callirhoë\" (1888) tells a story from ancient Greece. One number from it, the \"Pas des écharpes\" (Scarf Dance), became one of the best-selling piano pieces of its time - it was printed in countless editions and arrangements.\n\nHere it is played by the pianist Hans Barth on a record from 1924 (Library of Congress National Jukebox).\n\nListen for:\n1. A light, swaying melody - dancers moving with long scarves\n2. Delicate, sparkling decorations in the right hand\n3. A short, more lyrical middle section\n\nAlso in the Library: \"The Flatterer\" (La Lisonjera), another favourite, played by Hans Barth.",
        'library': [(SCARF, 'Scarf Dance (Callirhoë) - Hans Barth, piano, 1924'), (FLATTERER, 'The Flatterer (La Lisonjera) - Hans Barth, piano, 1924')],
      },
      {
        'title': 'Watch: "Automne"', 'type': 'YOUTUBE', 'minutes': 7, 'video': 'https://www.youtube.com/watch?v=n2-_ZRi7HNg',
        'description': "\"Automne\" (Autumn) is the second of her Six Concert Études, Op. 35 (1886), and her most famous piano piece. The British-Canadian pianist Valerie Tryon plays it here.\n\nAn étude is a study - a piece that trains a particular skill. Chaminade's concert études are real concert music too, like Chopin's.\n\nListen for:\n1. A calm, melancholy melody over flowing chords - autumn leaves\n2. A stormy, virtuosic middle section - an autumn gale\n3. The return of the calm melody at the end\n\nPianists: ask your teacher whether \"Automne\" might suit you - it is a favourite with advanced students.",
      },
      {
        'title': 'Week 2 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the 1880s, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 2 in a nutshell', 'bullets': [
              'An opera, a ballet, a concert piece and a dramatic symphony',
              'The Scarf Dance from "Callirhoë" becomes a hit',
              '"Automne": her most famous concert étude',
              'Praise for her talent - but few performances of her large works']},
        ],
        'quiz': [
          ('What is "Callirhoë"?', ['An opera', 'A ballet', 'A song', 'A flute piece'], 1),
          ('Which hit piece comes from "Callirhoë"?', ['Automne', 'The Scarf Dance', 'The Flatterer', 'Pierrette'], 1),
          ('What does "Automne" mean?', ['Spring', 'Autumn', 'Winter', 'Night'], 1),
          ('What is an étude?', ['A dance', 'A study for a particular skill', 'A song without words', 'An overture'], 1),
          ('Which composer is said to have called her "a composer who is a woman"?', ['Ambroise Thomas', 'Bizet', 'Godard', 'Debussy'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Week 3 - Songs, England and the Concertino (1892-1907)',
    'lessons': [
      {
        'title': 'Mélodies: Chaminade\'s songs', 'type': 'SLIDES', 'minutes': 15,
        'description': "Chaminade wrote more than 100 songs - French \"mélodies\". They sold in huge numbers. Read three of them in the Library.",
        'slides': [
          {'kind': 'title', 'week': 'Week 3', 'title': 'Songs, England and the Concertino', 'subtitle': '1892 - 1907', **PORTRAIT},
          {'kind': 'bullets', 'title': 'A best-selling songwriter', 'bullets': [
              'Her songs were written for amateur singers at home - and sung by famous professionals too',
              'Clear melodies, rich piano parts, poems about love, nature and the seasons',
              '"L\'anneau d\'argent" (The Silver Ring, 1891) was one of her greatest successes',
              'The Library has more than 25 of her songs as interactive scores']},
          {'kind': 'listen', 'title': '"L\'anneau d\'argent"', 'work': 'The Silver Ring - poem by Rosemonde Gérard', 'points': [
              'A woman looks at the simple silver ring her beloved gave her',
              'It is worth more to her than gold or jewels',
              'A gentle, flowing melody with a warm piano part',
              'Open the interactive score and read along']},
          {'kind': 'listen', 'title': 'Two more to read', 'work': '"L\'été" and "Chanson de neige"', 'points': [
              '"L\'été" (Summer): a brilliant, joyful song full of birdsong - a favourite of sopranos',
              '"Chanson de neige" (Snow Song): light and delicate',
              'Compare the way the piano paints the season in each song']},
        ],
        'library': [('cmuyfx7u800842eon5ytahxtq', '"L\'anneau d\'argent" - interactive score'), ('cmuyfx7u900852eontnl5q51m', '"L\'été" - interactive score'), ('cmuyfx7u5007s2eonmxwdmsei', '"Chanson de neige" - interactive score')],
      },
      {
        'title': 'England and Queen Victoria', 'type': 'SLIDES', 'minutes': 12,
        'description': "England loved Chaminade - from London concert halls to Windsor Castle.",
        'slides': [
          {'kind': 'bullets', 'title': 'A star in England', 'bullets': [
              'From 1892 she toured England almost every year',
              'She played her own music to full halls in London',
              'Queen Victoria admired her music and invited her to Windsor Castle in 1897',
              'In 1901 she made some of the first gramophone recordings by a woman composer, in London']},
          {'kind': 'bullets', 'title': 'Marriage', 'bullets': [
              'In 1901 she married Louis-Mathieu Carbonel, a music publisher from Marseille, many years older than her',
              'He died in 1907; she did not remarry',
              'She kept performing and composing - touring was also how she earned her living']},
          {'kind': 'listen', 'title': 'Listen: two light favourites', 'work': '"Pierrette" (air de ballet) and the "Sérénade espagnole"', 'points': [
              '"Pierrette": a graceful little dance for piano - Cecil Elliott, 1925',
              'The "Sérénade espagnole", arranged for violin by Fritz Kreisler',
              'Kreisler plays it himself, with his brother Hugo, on a record from 1922',
              'Both are in the Library']},
        ],
        'library': [(PIERRETTE, '"Pierrette" - Cecil Elliott, 1925'), (SERENADE, '"Sérénade espagnole" - Fritz and Hugo Kreisler, 1922')],
      },
      {
        'title': 'Watch: the Flute Concertino', 'type': 'YOUTUBE', 'minutes': 9, 'video': 'https://www.youtube.com/watch?v=BKjelbbWGEk',
        'description': "The Concertino for flute, Op. 107 (1902) was written as a test piece for the flute exams of the Paris Conservatoire - and it became Chaminade's most performed work. Every flautist knows it.\n\nHere Emmanuel Pahud, principal flute of the Berlin Philharmonic, plays it with the Munich Radio Orchestra under Ivan Repušić (ARD Klassik).\n\nListen for:\n1. A long, singing melody - the flute as a voice\n2. Brilliant fast runs that test the player's fingers and breath\n3. A short cadenza for the soloist alone near the end",
      },
      {
        'title': 'Week 3 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the years of fame, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 3 in a nutshell', 'bullets': [
              'More than 100 songs - "L\'anneau d\'argent" a best-seller',
              'Yearly tours of England; Queen Victoria invites her to Windsor (1897)',
              '1901: early recordings in London; marriage to Louis-Mathieu Carbonel',
              '1902: the Flute Concertino - still played everywhere']},
        ],
        'quiz': [
          ('What is a French "mélodie"?', ['A dance', 'An art song', 'A piano étude', 'An opera aria'], 1),
          ('Which monarch invited Chaminade to Windsor Castle?', ['Queen Victoria', 'King Edward VII', 'Queen Elizabeth', 'King George V'], 0),
          ('Why was the Flute Concertino written?', ['For a royal wedding', 'As a test piece for Conservatoire exams', 'For a film', 'For her husband'], 1),
          ('Who arranged the "Sérénade espagnole" for violin?', ['Jascha Heifetz', 'Fritz Kreisler', 'Pablo de Sarasate', 'Joseph Joachim'], 1),
          ('What did Chaminade do in London in 1901 that was new?', ['Conducted an opera', 'Made gramophone recordings', 'Opened a school', 'Played at the Proms'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 4 - America, the Légion d\'honneur and Rediscovery (1908-1944)',
    'lessons': [
      {
        'title': 'America, 1908', 'type': 'SLIDES', 'minutes': 15,
        'description': "In America Chaminade was a household name - long before she ever went there.",
        'slides': [
          {'kind': 'title', 'week': 'Week 4', 'title': 'America and the Légion d\'honneur', 'subtitle': '1908 - 1944', **PORTRAIT},
          {'kind': 'bullets', 'title': 'The Chaminade Clubs', 'bullets': [
              'From the 1890s, music clubs named after her sprang up all over the United States',
              'Most were run by women, who met to play and sing music - often hers',
              'Her pieces were standard fare for piano students across the country']},
          {'kind': 'bullets', 'title': 'The American tour', 'bullets': [
              'In autumn 1908 she toured the United States, playing her own music in about a dozen cities',
              'Her first concert there was at Carnegie Hall in New York',
              'Audiences were enthusiastic; some critics were less kind about "salon music"',
              'She was received at the White House by President Theodore Roosevelt']},
          {'kind': 'bullets', 'title': 'Légion d\'honneur, 1913', 'bullets': [
              'In 1913 France made her a knight (chevalier) of the Légion d\'honneur',
              'She was the first woman composer to receive this honour',
              'By then she had published around 400 works']},
        ],
      },
      {
        'title': 'Watch: a pioneer, forgotten (in French)', 'type': 'YOUTUBE', 'minutes': 7, 'video': 'https://www.youtube.com/watch?v=Gz9Qw5srgw0',
        'description': "This short film by France Musique, the French public classical radio, is in French - switch on YouTube's subtitles and automatic translation if you need them.\n\n\"Cécile Chaminade, compositrice pionnière et star internationale oubliée\" - a pioneering composer and a forgotten international star. It tells how she built her career, how big her fame was, and how it faded.\n\nThink about it: how much of a composer's fame depends on music, and how much on fashion?",
      },
      {
        'title': 'The last years and rediscovery', 'type': 'SLIDES', 'minutes': 12,
        'description': "Chaminade lived until 1944 - long enough to see her music go out of fashion. Today it is coming back.",
        'slides': [
          {'kind': 'bullets', 'title': 'The last years', 'bullets': [
              'Musical taste changed after the First World War: Debussy, Ravel, Stravinsky, jazz',
              'Her music was now seen as old-fashioned "salon music"',
              'In poor health, she composed less and lived in the south of France',
              'She died in Monte Carlo on 13 April 1944, aged 86']},
          {'kind': 'bullets', 'title': 'Rediscovery', 'bullets': [
              'From the 1980s pianists and singers began to record her music again',
              'The Flute Concertino never left the repertoire',
              'Her songs, piano pieces and Piano Trios are being performed and studied anew',
              'She is a central figure in the history of women in music - and of music in the home']},
          {'kind': 'summary', 'title': 'Where to go next', 'bullets': [
              'Read her songs in the Library: "Rosemonde", "Villanelle", "Ritournelle"',
              'Pianists: try the Scarf Dance or "Pierrette"; flautists: the Concertino',
              'Continue with the courses on Fanny Hensel, Clara Schumann and Debussy']},
        ],
        'library': [('cmuyfx7ua00892eonm8r2xzdu', '"Rosemonde" - interactive score'), ('cmuyfx7ud008e2eonig6dymeq', '"Villanelle" - interactive score')],
      },
      {
        'title': 'Final review and quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Congratulations - you have reached the end of the course! One last recap and a final quiz across all four weeks.",
        'slides': [
          {'kind': 'timeline', 'title': 'Chaminade\'s life at a glance', 'rows': [
              ('1857', 'Born in Paris on 8 August'),
              ('1888', '"Callirhoë" and the Concertstück'),
              ('1892', 'Start of her yearly tours of England'),
              ('1902', 'Flute Concertino'),
              ('1908', 'Tour of the United States'),
              ('1913', 'Légion d\'honneur'),
              ('1944', 'Dies in Monte Carlo on 13 April')]},
        ],
        'quiz': [
          ('What were the "Chaminade Clubs"?', ['Tennis clubs', 'American music clubs named after her', 'Paris nightclubs', 'Fan clubs in England'], 1),
          ('Where did Chaminade give her first American concert?', ['Boston Symphony Hall', 'Carnegie Hall, New York', 'The White House', 'Chicago Orchestra Hall'], 1),
          ('Which honour did she receive in 1913?', ['The Prix de Rome', 'The Légion d\'honneur', 'A Nobel Prize', 'A royal title'], 1),
          ('Which of her works has always stayed in the repertoire?', ['La Sévillane', 'The Flute Concertino', 'Les Amazones', 'Callirhoë in full'], 1),
          ('Where did Chaminade die?', ['Paris', 'Monte Carlo', 'New York', 'London'], 1),
          ('About how many works did Chaminade write?', ['About 40', 'About 400', 'About 4,000', 'About 14'], 1),
        ],
      },
    ],
  },
]
