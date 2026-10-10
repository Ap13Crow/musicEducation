# Claude Debussy - a 4-week first-level introduction.
COURSE = {
    'slug': 'debussy-life-and-music-introduction',
    'title': 'Claude Debussy: Life and Music - A First Introduction',
    'shortSummary': 'Four weeks with Claude Debussy: the rebel of the Paris Conservatoire who opened the door to modern music - Clair de lune, the Faun, Pelléas, La Mer and the Préludes.',
    'description': (
        "Claude Debussy (1862-1918) broke the rules of harmony he was taught, listened to Javanese gamelan and Japanese prints, and wrote music "
        "of light, water and air. Many musicians say that modern music begins with him.\n\n"
        "In four weeks you follow his life step by step:\n"
        "- Week 1 - A rebel at the Conservatoire (1862-1887)\n"
        "- Week 2 - New sounds: gamelan, poets and a faun (1887-1898)\n"
        "- Week 3 - Pelléas, La Mer and scandal (1899-1908)\n"
        "- Week 4 - Préludes, war and the last years (1909-1918)\n\n"
        "Every week combines illustrated slides, a documentary and performances (Deutsche Grammophon, the Berlin Philharmonic, the "
        "hr-Sinfonieorchester), scores and songs from the mymusic.coach Library, a 1920 harp record, and a short quiz. No previous knowledge is needed. "
        "Plan about 1-2 hours per week."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Flute', 'Voice'],
    'musicStyles': ['Impressionist', 'Modern'],
    'cover': {'image': 'debussy_portrait', 'title': 'Debussy', 'subtitle': 'Life and Music - A First Introduction', 'tag': '4-week course'},
}
FOOTER = 'Claude Debussy: Life and Music'
PORTRAIT = {'image': 'debussy_portrait', 'credit': 'Photograph by Nadar, c. 1908 (public domain)'}
YOUNG = {'image': 'debussy_young', 'credit': 'Marcel Baschet, Claude Debussy, 1884 (Musée d\'Orsay, public domain)'}
ARABESQUE_78 = 'cmv2j11e700ow12ifhlp61i9g'

WEEKS = [
  {
    'title': 'Week 1 - A Rebel at the Conservatoire (1862-1887)',
    'lessons': [
      {
        'title': 'Welcome: meet Claude Debussy', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Welcome to the course! Meet Claude Debussy - and see how the next four weeks work.\n\nTip: all music mentioned in this course is linked from the lessons - open the scores and songs in the Library and earn extra XP for reading or listening to the end.",
        'slides': [
          {'kind': 'title', 'week': 'Week 1', 'title': 'Meet Claude Debussy', 'subtitle': 'A first introduction to his life and music', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Why Debussy?', 'bullets': [
              'Born near Paris in 1862 - died in Paris in 1918',
              'He freed harmony from the old rules: chords for their colour, not their function',
              '"Clair de lune", "Prélude à l\'après-midi d\'un faune", "La Mer", the Préludes',
              'One opera: "Pelléas et Mélisande"',
              'Ravel, Stravinsky, jazz pianists and film composers all learned from him']},
          {'kind': 'timeline', 'title': 'Your four weeks', 'rows': [
              ('Week 1', 'A rebel at the Conservatoire'),
              ('Week 2', 'New sounds: gamelan, poets and a faun'),
              ('Week 3', 'Pelléas, La Mer and scandal'),
              ('Week 4', 'Préludes, war and the last years')]},
          {'kind': 'bullets', 'title': '"Impressionist"?', 'bullets': [
              'Critics called his music "impressionist", like the paintings of Monet',
              'Debussy disliked the label - he felt closer to the Symbolist poets',
              'His music suggests rather than states: mist, reflections, moonlight',
              'Listen for colour, atmosphere and silence as much as for melody']},
        ],
      },
      {
        'title': 'From a china shop to the Conservatoire', 'type': 'SLIDES', 'minutes': 15,
        'description': "Debussy came from a poor family with no musical tradition. A chance meeting made him a pianist.",
        'slides': [
          {'kind': 'bullets', 'title': 'Saint-Germain-en-Laye, 22 August 1862', 'bullets': [
              'Achille-Claude Debussy was born west of Paris, where his parents had a china shop',
              'The shop failed; the family moved to Paris and was often poor',
              'He never went to school - his mother taught him at home',
              'In 1870 an aunt took him to Cannes, where he had his first piano lessons']},
          {'kind': 'bullets', 'title': 'Madame Mauté', 'bullets': [
              'Back in Paris, Antoinette Mauté de Fleurville noticed his talent and taught him for free',
              'She said she had studied with Chopin - Debussy believed it all his life',
              'She was the mother-in-law of the poet Paul Verlaine, whose poems he later set to music',
              'In 1872, aged ten, he was accepted at the Paris Conservatoire']},
          {'kind': 'bullets', 'title': 'Eleven years at the Conservatoire', 'bullets': [
              'He was a brilliant but unpredictable pianist',
              'In harmony class he played strange chords that broke the rules - and loved them',
              'When a teacher asked which rule he followed, he is said to have answered: "My pleasure!"',
              'Summer jobs: from 1880 he travelled as house pianist to Nadezhda von Meck, Tchaikovsky\'s patron - to Italy, Switzerland and Russia']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Born 22 August 1862 in Saint-Germain-en-Laye',
              'No school - but free piano lessons from Madame Mauté',
              'Paris Conservatoire from 1872, aged ten',
              'A rebel in harmony class']},
        ],
      },
      {
        'title': 'Watch: Debussy - his life and places', 'type': 'YOUTUBE', 'minutes': 21, 'video': 'https://www.youtube.com/watch?v=562b30X5Kuo',
        'description': "This documentary by opera-inside follows Debussy through Paris, Rome and the places of his life, with his music all the way.\n\nWhile you watch, look out for:\n1. Which prize took Debussy to Rome - and did he like it there?\n2. Which music from Asia impressed him at the World\'s Fair of 1889?\n3. Who was \"Chouchou\"?\n\nEverything comes back in the next weeks.",
      },
      {
        'title': 'The Prix de Rome - and week 1 quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "In 1884 Debussy won France's most important prize for young composers. He was not happy about where it took him.",
        'slides': [
          {'kind': 'title', 'week': '1884', 'title': 'The Prix de Rome', 'subtitle': 'Debussy at 22', **YOUNG},
          {'kind': 'bullets', 'title': 'Rome, 1885-1887', 'bullets': [
              'He won the Prix de Rome in 1884 with the cantata "L\'enfant prodigue" (The Prodigal Son)',
              'The prize meant a stay of several years at the Villa Medici in Rome',
              'Debussy felt lonely and homesick for Paris, and disliked the official style',
              'He left in 1887, earlier than planned - this portrait was painted by a fellow prize-winner, Marcel Baschet']},
          {'kind': 'summary', 'title': 'Week 1 in a nutshell', 'bullets': [
              'Born in 1862; a poor family; no school',
              'Conservatoire at ten - a rebel in harmony',
              'House pianist to Tchaikovsky\'s patron Nadezhda von Meck',
              '1884: Prix de Rome; an unhappy time in Rome']},
        ],
        'quiz': [
          ('Where was Debussy born?', ['In Paris', 'In Saint-Germain-en-Laye', 'In Rome', 'In Cannes'], 1),
          ('At what age did Debussy enter the Paris Conservatoire?', ['Six', 'Ten', 'Sixteen', 'Twenty'], 1),
          ('Which composer\'s patron employed Debussy as house pianist?', ['Wagner\'s', 'Tchaikovsky\'s', 'Chopin\'s', 'Liszt\'s'], 1),
          ('Which prize did Debussy win in 1884?', ['The Nobel Prize', 'The Prix de Rome', 'The Légion d\'honneur', 'The Chopin Prize'], 1),
          ('Which label did critics give his music - though he disliked it?', ['Romantic', 'Impressionist', 'Baroque', 'Minimalist'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 2 - New Sounds: Gamelan, Poets and a Faun (1887-1898)',
    'lessons': [
      {
        'title': 'Gamelan, Wagner and the poets', 'type': 'SLIDES', 'minutes': 15,
        'description': "Back in Paris, Debussy searched for his own voice. Three discoveries helped him find it.",
        'slides': [
          {'kind': 'title', 'week': 'Week 2', 'title': 'Gamelan, poets and a faun', 'subtitle': '1887 - 1898', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Three discoveries', 'bullets': [
              'Wagner: in 1888 and 1889 he went to Bayreuth - fascinated, then determined not to copy him',
              'Gamelan: at the 1889 World\'s Fair in Paris he heard Javanese musicians - bells, gongs, new scales and rhythms',
              'Poetry: he joined the Tuesday evenings of the poet Stéphane Mallarmé and the Symbolist writers',
              'Painting: he loved Whistler, Turner and Japanese prints']},
          {'kind': 'bullets', 'title': 'Debussy\'s musical toolkit', 'bullets': [
              'Whole-tone scales - no "home" note, a floating sound',
              'Pentatonic scales - five notes, like the black keys of the piano',
              'Chords that move in parallel, like blocks of colour',
              'Old church modes - an ancient, open sound']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Bayreuth 1888-1889: Wagner fascinates him - and he decides to go his own way',
              '1889: Javanese gamelan at the Paris World\'s Fair',
              'Mallarmé and the Symbolist poets',
              'New scales and chords used for colour']},
        ],
      },
      {
        'title': 'Listen: the First Arabesque', 'type': 'AUDIO', 'minutes': 6, 'libraryAudio': [ARABESQUE_78, 0],
        'description': "The two Arabesques for piano (published in 1891) are early works - still close to the salon music of the time, but already full of Debussy's flowing lines. An arabesque is an ornamental, curving decoration.\n\nHere is the First Arabesque in an arrangement for harp - an instrument whose sound suits it perfectly - played by Ada Sassoli on a 78 rpm record from 1920.\n\nListen for:\n1. Rippling triplets that flow like water\n2. A melody that curves up and down - an \"arabesque\"\n3. A calmer, more playful middle section\n\nAfterwards, read the piano score of both Arabesques in the Library.",
        'library': [(ARABESQUE_78, 'First Arabesque - Ada Sassoli, harp, 1920'), ('cmuygw9li01zy4kktpwxlhkx9', 'First Arabesque - score'), ('cmuygw9li01zz4kktni8kqj43', 'Second Arabesque - score')],
      },
      {
        'title': 'Watch: Prelude to the Afternoon of a Faun', 'type': 'YOUTUBE', 'minutes': 10, 'video': 'https://www.youtube.com/watch?v=tjEdr3MuXTE',
        'description': "\"Prélude à l'après-midi d'un faune\" (1894) is based on a poem by Mallarmé: on a hot afternoon, a faun - half man, half goat - wakes up, plays his pipe and dreams of nymphs. It was first performed in Paris on 22 December 1894.\n\nHere it is played by the Berlin Philharmonic in a 1985 recording, with Karlheinz Zöller as solo flute.\n\nListen for:\n1. The opening flute solo: a slow, sliding melody with no clear key\n2. Soft harps and horns - like a summer haze\n3. The music never really \"arrives\" - it drifts, dreams and fades away\n\nThe composer Pierre Boulez said that modern music awakened with this piece.",
      },
      {
        'title': 'Week 2 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the 1890s, a song to read, and five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 2 in a nutshell', 'bullets': [
              'Wagner, gamelan, the Symbolist poets',
              'Whole-tone and pentatonic scales, parallel chords',
              '1891: two Arabesques for piano',
              '1894: Prelude to the Afternoon of a Faun']},
          {'kind': 'listen', 'title': 'Read along: Verlaine songs', 'work': '"Mandoline" (1882) and "Il pleure dans mon coeur" from "Ariettes oubliées"', 'points': [
              '"Mandoline": serenaders strumming in a moonlit park - you hear the mandolin in the piano',
              '"Il pleure dans mon coeur": "Tears fall in my heart as rain falls on the town"',
              'Both on poems by Paul Verlaine - the son-in-law of his first piano teacher',
              'Open the interactive scores in the Library']},
        ],
        'library': [('cmuyfx7x400at2eonnx5mi96r', '"Mandoline" - interactive score'), ('cmuyfx7wy00ag2eon8sl6xs38', '"Il pleure dans mon coeur" - interactive score'), ('cmuygticx00b04kktc3l0zl6x', 'String Quartet in G minor (1893) - interactive score')],
        'quiz': [
          ('What kind of music did Debussy hear at the 1889 World\'s Fair?', ['American jazz', 'Javanese gamelan', 'Spanish flamenco', 'Russian folk song'], 1),
          ('Which poet\'s Tuesday evenings did Debussy attend?', ['Victor Hugo', 'Stéphane Mallarmé', 'Charles Baudelaire', 'Arthur Rimbaud'], 1),
          ('Which instrument opens the Prelude to the Afternoon of a Faun?', ['Oboe', 'Flute', 'Violin', 'Harp'], 1),
          ('What is a whole-tone scale?', ['A scale of only black keys', 'A scale of equal whole steps with no "home" note', 'A major scale', 'A scale with 12 notes'], 1),
          ('Who said that modern music awakened with the Faun?', ['Igor Stravinsky', 'Pierre Boulez', 'Maurice Ravel', 'Erik Satie'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 3 - Pelléas, La Mer and Scandal (1899-1908)',
    'lessons': [
      {
        'title': 'Pelléas et Mélisande', 'type': 'SLIDES', 'minutes': 15,
        'description': "For ten years Debussy worked on an opera unlike any other. Its premiere in 1902 made him famous.",
        'slides': [
          {'kind': 'title', 'week': 'Week 3', 'title': 'Pelléas, La Mer and scandal', 'subtitle': '1899 - 1908', **PORTRAIT},
          {'kind': 'bullets', 'title': 'An opera of whispers', 'bullets': [
              'Based on a Symbolist play by the Belgian writer Maurice Maeterlinck',
              'A mysterious girl, Mélisande, two half-brothers, a gloomy castle by the sea',
              'No big arias: the singers almost speak, following the natural rhythm of French',
              'The orchestra paints the moods - forests, wells, darkness, the sea']},
          {'kind': 'timeline', 'title': 'Life and work', 'rows': [
              ('1899', 'Marries Lilly Texier, a dressmaker\'s model'),
              ('30 April 1902', 'Premiere of "Pelléas et Mélisande" at the Opéra-Comique - first puzzled, then a cult'),
              ('1901', 'Starts writing music criticism; his ironic alter ego is "Monsieur Croche"'),
              ('1905', 'Revises and publishes the "Suite bergamasque", with "Clair de lune"')]},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              '1902: "Pelléas et Mélisande" - his only completed opera',
              'Words sung almost as spoken French',
              'He wrote witty criticism as "Monsieur Croche"']},
        ],
      },
      {
        'title': 'Watch: Clair de lune', 'type': 'YOUTUBE', 'minutes': 6, 'video': 'https://www.youtube.com/watch?v=U3u4pQ4WKOk',
        'description': "\"Clair de lune\" (Moonlight) is the third piece of the \"Suite bergamasque\" - begun around 1890 and published in 1905. The title comes from a poem by Verlaine about masked dancers in moonlight.\n\nHere it is played by Seong-Jin Cho, winner of the International Chopin Competition 2015, for Deutsche Grammophon.\n\nListen for:\n1. Very soft opening chords - pianissimo - like moonlight on water\n2. A floating rhythm: you can hardly feel the beat\n3. Rippling arpeggios in the middle, as the moon comes out from the clouds\n\nAfterwards, open the score in the Library - it is often one of the first Debussy pieces pianists learn.",
        'library': [('cmuygw9lj02004kktg6iplwvl', '"Clair de lune" - score')],
      },
      {
        'title': 'La Mer and a new family', 'type': 'SLIDES', 'minutes': 15,
        'description': "In 1904 Debussy left his wife for another woman - a scandal in Paris. In the same year he was writing his great portrait of the sea.",
        'slides': [
          {'kind': 'bullets', 'title': 'Scandal', 'bullets': [
              'In 1904 Debussy left Lilly for Emma Bardac, a singer and the wife of a wealthy banker',
              'Lilly attempted suicide; many friends turned away from Debussy',
              'Their daughter Claude-Emma, called "Chouchou", was born in 1905',
              'Claude and Emma married in 1908']},
          {'kind': 'image', 'title': '"La Mer", 1905', 'text': 'Debussy asked for Hokusai\'s print "The Great Wave off Kanagawa" to be put on the cover of the score. "La Mer" (The Sea) has three movements: from dawn to noon on the sea, play of the waves, and dialogue of the wind and the sea.', 'image': 'debussy_wave', 'credit': 'Katsushika Hokusai, The Great Wave off Kanagawa, c. 1831 (public domain)'},
          {'kind': 'bullets', 'title': 'Children\'s Corner, 1908', 'bullets': [
              'Six piano pieces dedicated to Chouchou "with her father\'s tender apologies for what follows"',
              'They make fun of piano exercises ("Doctor Gradus ad Parnassum") and show her toys',
              'The last one, "Golliwogg\'s Cakewalk", uses American ragtime rhythms',
              'In the middle it mocks the opening of Wagner\'s "Tristan"!']},
        ],
      },
      {
        'title': 'Watch: La Mer - and week 3 quiz', 'type': 'YOUTUBE', 'minutes': 28, 'xp': 20, 'video': 'https://www.youtube.com/watch?v=y1hWp4pQpAs',
        'description': "Alain Altinoglu conducts the hr-Sinfonieorchester (Frankfurt Radio Symphony) in \"La Mer\" - first performed in Paris on 15 October 1905.\n\nListen for:\n1. \"From dawn to noon on the sea\": the sea wakes slowly; at the end, a great brass chorale - the sun at noon\n2. \"Play of the waves\" (from 9:06): light, sparkling, always changing\n3. \"Dialogue of the wind and the sea\": storm and power - and a brilliant ending\n\nThen answer the five quiz questions on week 3.",
        'quiz': [
          ('Who wrote the play on which "Pelléas et Mélisande" is based?', ['Victor Hugo', 'Maurice Maeterlinck', 'Paul Verlaine', 'Stéphane Mallarmé'], 1),
          ('Which picture did Debussy want on the cover of "La Mer"?', ['A painting by Monet', 'Hokusai\'s "Great Wave"', 'A photo of the Atlantic', 'A drawing by Delacroix'], 1),
          ('What was the nickname of Debussy\'s daughter?', ['Mimi', 'Chouchou', 'Lili', 'Coco'], 1),
          ('Which piece from Children\'s Corner uses ragtime rhythms?', ['Doctor Gradus ad Parnassum', 'Golliwogg\'s Cakewalk', 'The Snow is Dancing', 'Jimbo\'s Lullaby'], 1),
          ('Which suite contains "Clair de lune"?', ['Children\'s Corner', 'Suite bergamasque', 'Images', 'Estampes'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 4 - Préludes, War and the Last Years (1909-1918)',
    'lessons': [
      {
        'title': 'The Préludes', 'type': 'SLIDES', 'minutes': 15,
        'description': "Between 1909 and 1913 Debussy wrote 24 Préludes for piano - small, perfect pictures in sound.",
        'slides': [
          {'kind': 'title', 'week': 'Week 4', 'title': 'Préludes, war and the last years', 'subtitle': '1909 - 1918', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Two books of Préludes', 'bullets': [
              'Book 1 published in 1910, Book 2 in 1913 - twelve pieces each, like Chopin\'s 24 Preludes',
              'The titles are printed at the end of each piece, in brackets - first listen, then read the title',
              '"La fille aux cheveux de lin" (The girl with the flaxen hair), "La cathédrale engloutie" (The sunken cathedral), "Feux d\'artifice" (Fireworks)',
              'Debussy also recorded some of his own music on piano rolls in 1913']},
          {'kind': 'listen', 'title': 'Read along', 'work': 'Prélude 4, Book 1: "Les sons et les parfums tournent dans l\'air du soir"', 'points': [
              '"Sounds and scents swirl in the evening air" - a line by Baudelaire',
              'Soft, slow and full of rich chords',
              'Notice the many dynamic markings - most of them very quiet',
              'Open the score in the Library - and the whole of Book 1']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              '24 Préludes in two books (1910, 1913)',
              'Titles at the end - imagination first',
              'Images of nature, legends, people and places']},
        ],
        'library': [('cmuygw9l901zw4kktfja35cxo', 'Prélude 4, Book 1 - score'), ('cmuygw9la01zx4kktxk5qnbka', 'Préludes, Book 1 - score')],
      },
      {
        'title': 'War, illness and "musicien français"', 'type': 'SLIDES', 'minutes': 12,
        'description': "Debussy's last years were overshadowed by cancer and the First World War. He still wrote some of his most original music.",
        'slides': [
          {'kind': 'bullets', 'title': 'The last works', 'bullets': [
              '1909: Debussy learned that he had cancer',
              '1913: the ballet "Jeux" - two weeks later Stravinsky\'s "Rite of Spring" caused a riot in the same theatre',
              '1915: the twelve Études for piano, dedicated to the memory of Chopin',
              '1915-1917: three sonatas, signed proudly "Claude Debussy, musicien français"']},
          {'kind': 'bullets', 'title': 'The end', 'bullets': [
              'He planned six sonatas for different instruments - he completed three: cello, flute-viola-harp, violin',
              'The Violin Sonata (1917) was his last finished work and his last public appearance as pianist',
              'He died in Paris on 25 March 1918, while German guns were shelling the city',
              'Chouchou died the next year, aged 13']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Études (1915), dedicated to Chopin\'s memory',
              'Three late sonatas - "musicien français"',
              'Died on 25 March 1918, during the war']},
        ],
      },
      {
        'title': 'Debussy today', 'type': 'SLIDES', 'minutes': 10,
        'description': "Why Debussy is one of the founders of 20th-century music.",
        'slides': [
          {'kind': 'bullets', 'title': 'His influence', 'bullets': [
              'Ravel, Stravinsky, Bartók and Messiaen all learned from him',
              'Jazz musicians like Bill Evans loved his chords',
              'Film and video-game music uses his colours and textures every day',
              'He showed that sound itself - timbre, space, silence - can be the subject of music']},
          {'kind': 'summary', 'title': 'Where to go next', 'bullets': [
              'Read his songs on poems by Verlaine and Baudelaire in the Library',
              'Pianists: ask your teacher about "Clair de lune", an Arabesque or "The girl with the flaxen hair"',
              'Continue with the courses on Chopin and Cécile Chaminade']},
        ],
        'library': [('cmuyfx7x200am2eonpe47e1pt', '"Harmonie du soir" (Baudelaire) - interactive score'), ('cmuyfx7x300aq2eon2cagakpt', '"La flûte de Pan" (Chansons de Bilitis) - interactive score')],
      },
      {
        'title': 'Final review and quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Congratulations - you have reached the end of the course! One last recap and a final quiz across all four weeks.",
        'slides': [
          {'kind': 'timeline', 'title': 'Debussy\'s life at a glance', 'rows': [
              ('1862', 'Born in Saint-Germain-en-Laye on 22 August'),
              ('1872', 'Enters the Paris Conservatoire'),
              ('1884', 'Prix de Rome'),
              ('1894', 'Prelude to the Afternoon of a Faun'),
              ('1902', '"Pelléas et Mélisande"'),
              ('1905', '"La Mer"; Chouchou is born'),
              ('1918', 'Dies in Paris on 25 March')]},
        ],
        'quiz': [
          ('Where are the titles of Debussy\'s Préludes printed?', ['At the top', 'At the end of each piece', 'Only in the table of contents', 'Nowhere'], 1),
          ('How did Debussy sign his late sonatas?', ['"Claude de France"', '"Claude Debussy, musicien français"', '"Monsieur Croche"', '"Achille Debussy"'], 1),
          ('To whose memory are his Études dedicated?', ['Bach', 'Chopin', 'Wagner', 'Mozart'], 1),
          ('When did Debussy die?', ['1902', '1914', '1918', '1925'], 2),
          ('Which ballet by Stravinsky caused a riot two weeks after Debussy\'s "Jeux"?', ['The Firebird', 'The Rite of Spring', 'Petrushka', 'Pulcinella'], 1),
          ('What was Debussy\'s only completed opera?', ['Carmen', 'Pelléas et Mélisande', 'Rusalka', 'The Prodigal Son'], 1),
        ],
      },
    ],
  },
]
