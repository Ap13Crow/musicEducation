# Fanny Hensel (née Mendelssohn) - a 4-week first-level introduction.
COURSE = {
    'slug': 'fanny-hensel-life-and-music-introduction',
    'title': 'Fanny Hensel: Life and Music - A First Introduction',
    'shortSummary': 'Four weeks with Fanny Mendelssohn Hensel: a brilliant composer and pianist who wrote over 450 works, ran Berlin\'s finest music salon - and published under her own name only at 40.',
    'description': (
        "Fanny Hensel (1805-1847), born Fanny Mendelssohn, was as gifted as her famous brother Felix - and for most of her life she was not allowed "
        "to make music her profession. She composed more than 450 works anyway: songs, piano pieces, chamber music, choral and orchestral works.\n\n"
        "In four weeks you follow her life step by step:\n"
        "- Week 1 - A Berlin childhood in a family of genius (1805-1820)\n"
        "- Week 2 - \"Only an ornament\"? Songs under her brother's name (1820-1829)\n"
        "- Week 3 - Sunday music and Italy (1829-1840)\n"
        "- Week 4 - \"Das Jahr\" and her own name at last (1841-1847)\n\n"
        "Every week combines illustrated slides, videos (Oxford University Press, Duke University, the WDR Symphony Orchestra), interactive scores "
        "of her songs from the mymusic.coach Library, and a short quiz. No previous knowledge is needed. Plan about 1-2 hours per week."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Voice'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'fanny_portrait', 'title': 'Fanny Hensel', 'subtitle': 'Life and Music - A First Introduction', 'tag': '4-week course'},
}
FOOTER = 'Fanny Hensel: Life and Music'
PORTRAIT = {'image': 'fanny_portrait', 'credit': 'Portrait by Moritz Daniel Oppenheim, 1842 (public domain)'}
YOUNG = {'image': 'fanny_young', 'credit': 'Drawing by Wilhelm Hensel, her future husband, 1829 (public domain)'}

WEEKS = [
  {
    'title': 'Week 1 - A Berlin Childhood in a Family of Genius (1805-1820)',
    'lessons': [
      {
        'title': 'Welcome: meet Fanny Hensel', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Welcome to the course! Meet Fanny Hensel - one of the most gifted composers of the 19th century - and see how the next four weeks work.\n\nTip: her songs are in the mymusic.coach Library as interactive scores - read along, star your favourites and earn extra XP for reading them to the end.",
        'slides': [
          {'kind': 'title', 'week': 'Week 1', 'title': 'Meet Fanny Hensel', 'subtitle': 'A first introduction to her life and music', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Why Fanny Hensel?', 'bullets': [
              'Born Fanny Mendelssohn in Hamburg in 1805 - died in Berlin in 1847',
              'A pianist and composer as gifted as her brother Felix',
              'More than 450 works: songs, piano music, chamber music, choral and orchestral works',
              'For most of her life her family did not allow her to publish',
              'Only in recent decades has much of her music been printed, played and recorded']},
          {'kind': 'timeline', 'title': 'Your four weeks', 'rows': [
              ('Week 1', 'A Berlin childhood in a family of genius'),
              ('Week 2', '"Only an ornament"? Songs under her brother\'s name'),
              ('Week 3', 'Sunday music and Italy'),
              ('Week 4', '"Das Jahr" - and her own name at last')]},
          {'kind': 'bullets', 'title': 'A woman composer in the 1800s', 'bullets': [
              'Women from wealthy families learned music - as an accomplishment, not a career',
              'Performing in public or publishing music was thought unsuitable for a lady',
              'Many women composed anyway - often privately, in salons, or under other names',
              'In this course you will meet a woman who found her own way between these rules']},
        ],
      },
      {
        'title': 'A family of genius', 'type': 'SLIDES', 'minutes': 15,
        'description': "The Mendelssohns were one of the most remarkable families in Europe. Fanny grew up surrounded by ideas, art - and music.",
        'slides': [
          {'kind': 'bullets', 'title': 'Hamburg, 14 November 1805', 'bullets': [
              'Fanny was the eldest of four children of the banker Abraham Mendelssohn and Lea Salomon',
              'Her grandfather was the famous philosopher Moses Mendelssohn',
              'Her mother is said to have remarked at her birth that the baby had "Bach-fugue fingers"',
              'In 1811 the family moved to Berlin']},
          {'kind': 'bullets', 'title': 'Fanny and Felix', 'bullets': [
              'Felix, born in 1809, was her closest companion all her life',
              'They had the same teachers: Ludwig Berger for piano, Carl Friedrich Zelter for composition',
              'They showed each other every new piece and asked each other\'s advice',
              'Both loved Bach - rare at a time when his music was hardly played']},
          {'kind': 'timeline', 'title': 'An extraordinary talent', 'rows': [
              ('1811', 'The family settles in Berlin'),
              ('1816', 'Studies piano in Paris during a family visit'),
              ('1818', 'Aged 13, she plays all 24 preludes of Bach\'s Well-Tempered Clavier, Book 1, from memory for her father'),
              ('1819', 'Her first song: written for her father\'s birthday')]},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Born 14 November 1805 in Hamburg, eldest of four children',
              'Grandfather: the philosopher Moses Mendelssohn',
              'Same training as Felix - with Berger and Zelter',
              'At 13 she played Book 1 of Bach\'s Well-Tempered Clavier from memory']},
        ],
      },
      {
        'title': 'Watch: who was Fanny Mendelssohn?', 'type': 'YOUTUBE', 'minutes': 3, 'video': 'https://www.youtube.com/watch?v=wS1GqLt1k3o',
        'description': "A short introduction by R. Larry Todd, author of the major biography \"Fanny Hensel: The Other Mendelssohn\" (Oxford University Press).\n\nWhile you watch, think about:\n1. Why is she often called \"the other Mendelssohn\"?\n2. Why do you think so much of her music stayed unpublished for so long?\n\nThe next weeks give you the answers.",
      },
      {
        'title': 'Week 1 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "A short recap, a first song to read, and five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 1 in a nutshell', 'bullets': [
              'Born in Hamburg on 14 November 1805, raised in Berlin',
              'Granddaughter of the philosopher Moses Mendelssohn',
              'Taught with Felix by Ludwig Berger and Carl Friedrich Zelter',
              'A prodigy at the keyboard - especially in Bach']},
          {'kind': 'bullets', 'title': 'Read this week', 'bullets': [
              '"Schwanenlied" (Swan Song) from her Opus 1 - a short song on a poem by Heinrich Heine',
              'Notice the gently rocking piano part and how the voice floats above it',
              'Open the interactive score and read along']},
        ],
        'library': [('cmuyfx87200h92eonuq99hup5', '"Schwanenlied", Op. 1 - interactive score')],
        'quiz': [
          ('In which city was Fanny Mendelssohn born?', ['Berlin', 'Hamburg', 'Leipzig', 'Frankfurt'], 1),
          ('Who was her famous grandfather?', ['The composer Johann Sebastian Bach', 'The philosopher Moses Mendelssohn', 'The poet Goethe', 'The banker Rothschild'], 1),
          ('Who taught Fanny and Felix composition?', ['Carl Friedrich Zelter', 'Ludwig van Beethoven', 'Antonio Salieri', 'Carl Czerny'], 0),
          ('What did Fanny play from memory at 13 for her father?', ['A Beethoven sonata', 'Book 1 of Bach\'s Well-Tempered Clavier', 'Mozart\'s piano concertos', 'Her brother\'s first symphony'], 1),
          ('In which year was her brother Felix born?', ['1805', '1809', '1811', '1820'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 2 - "Only an Ornament"? Songs Under Her Brother\'s Name (1820-1829)',
    'lessons': [
      {
        'title': 'A profession for him, an ornament for her', 'type': 'SLIDES', 'minutes': 15,
        'description': "Fanny's father made it very clear what he expected of his daughter. These slides show how she kept composing anyway.",
        'slides': [
          {'kind': 'title', 'week': 'Week 2', 'title': '"Only an ornament"?', 'subtitle': '1820 - 1829', **YOUNG},
          {'kind': 'quote', 'quote': 'Music will perhaps become his profession, while for you it can and must be only an ornament, never the foundation of your being and doing.', 'by': 'Abraham Mendelssohn to Fanny, 1820'},
          {'kind': 'bullets', 'title': 'Composing anyway', 'bullets': [
              'Fanny kept composing: songs, piano pieces, chamber music',
              'Her music was played at home and among friends - not in public',
              'Felix admired her work - but agreed with their father that she should not publish',
              'Her music survived mostly in manuscript, much of it unpublished until the 20th and 21st centuries']},
          {'kind': 'bullets', 'title': 'Under Felix\'s name', 'bullets': [
              'In 1827 and 1830 Felix published six of her songs in his own collections, Op. 8 and Op. 9',
              'Among them: "Italien", "Das Heimweh" and "Suleika und Hatem"',
              'In 1842 Queen Victoria told Felix that "Italien" was her favourite of his songs and sang it for him',
              'Felix had to confess that his sister had written it']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              '1820: her father calls music "only an ornament" for her',
              'She kept composing - for family, friends and the salon',
              'Six of her songs appeared under Felix\'s name',
              'Queen Victoria\'s favourite "Mendelssohn" song was by Fanny']},
        ],
      },
      {
        'title': 'Read: the songs Felix published', 'type': 'SLIDES', 'minutes': 12,
        'description': "Read the three songs by Fanny that appeared in Felix's Op. 8 - including the one Queen Victoria loved.",
        'slides': [
          {'kind': 'listen', 'title': '"Italien" - Queen Victoria\'s favourite', 'work': 'Italien (Op. 8 No. 3, published under Felix\'s name)', 'points': [
              'A poem by Franz Grillparzer about longing for the sunny south',
              'A bright, lively piano part that never stops moving',
              'The melody leaps upward - full of enthusiasm',
              'Open the interactive score in the Library and follow it']},
          {'kind': 'bullets', 'title': 'Two more songs', 'bullets': [
              '"Das Heimweh" (Homesickness) - quiet and inward',
              '"Suleika und Hatem" - a duet on poems from Goethe\'s "West-östlicher Divan"',
              'All three show her gift for melody and her rich, inventive piano writing']},
          {'kind': 'bullets', 'title': 'What makes her songs special', 'bullets': [
              'Bold harmonies - she liked surprising turns',
              'The piano is a full partner, as in Schubert\'s songs',
              'She set poems by the best poets: Goethe, Heine, Eichendorff']},
        ],
        'library': [('cmuyfx85700h32eonpqao4rwp', '"Italien" - interactive score'), ('cmuyfx85700h22eonu1tu63fl', '"Das Heimweh" - interactive score'), ('cmuyfx85800h42eony0mt51hg', '"Suleika und Hatem" - interactive score')],
      },
      {
        'title': 'Watch: a musical mystery solved', 'type': 'YOUTUBE', 'minutes': 5, 'video': 'https://www.youtube.com/watch?v=9asDSXTsko0',
        'description': "In 1828 Fanny wrote a large piano sonata, the \"Easter Sonata\". For a long time it was thought to be lost - and when a manuscript signed \"F. Mendelssohn\" turned up in France in 1970, it was published and recorded as Felix's work. In 2010 the musicologist Angela Mace showed that it was Fanny's.\n\nThis short Duke University video tells the story.\n\nThink about it: how many other works by women might still be filed under someone else's name?",
      },
      {
        'title': 'Week 2 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the 1820s, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 2 in a nutshell', 'bullets': [
              '1820: music should be "only an ornament" for her, says her father',
              '1827-1830: six of her songs appear under Felix\'s name',
              '1828: the "Easter Sonata" - long credited to Felix',
              '1842: Queen Victoria\'s favourite "Mendelssohn" song turns out to be Fanny\'s']},
        ],
        'quiz': [
          ('What did Fanny\'s father say music should be for her?', ['Her profession', 'Only an ornament', 'A hobby for Sundays', 'Forbidden'], 1),
          ('Under whose name were six of Fanny\'s songs first published?', ['Her father\'s', 'Her brother Felix\'s', 'Zelter\'s', 'Anonymously'], 1),
          ('Which of her songs did Queen Victoria sing to Felix?', ['Schwanenlied', 'Italien', 'Gondellied', 'Die Mainacht'], 1),
          ('Who proved in 2010 that the "Easter Sonata" was Fanny\'s?', ['R. Larry Todd', 'Angela Mace', 'Felix Mendelssohn', 'Clara Schumann'], 1),
          ('Which poet wrote the "West-östlicher Divan"?', ['Heine', 'Goethe', 'Schiller', 'Eichendorff'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 3 - Sunday Music and Italy (1829-1840)',
    'lessons': [
      {
        'title': 'Marriage and the Sunday concerts', 'type': 'SLIDES', 'minutes': 15,
        'description': "Marriage to a painter who encouraged her work, and a stage of her own at home: the 1830s gave Fanny new freedom.",
        'slides': [
          {'kind': 'title', 'week': 'Week 3', 'title': 'Sunday music and Italy', 'subtitle': '1829 - 1840', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Wilhelm Hensel', 'bullets': [
              'In 1829 Fanny married the painter Wilhelm Hensel, court painter in Berlin',
              'Unlike her father, he encouraged her to compose - and to publish',
              'Their son Sebastian was born in 1830',
              'Wilhelm drew her portrait many times']},
          {'kind': 'bullets', 'title': 'The "Sonntagsmusiken"', 'bullets': [
              'In the family house at Leipziger Strasse 3 in Berlin she ran regular Sunday concerts',
              'She performed as pianist, conducted a choir and small orchestra - and premiered her own works',
              'Guests included Liszt, Clara Schumann, Gounod and many of Berlin\'s leading figures',
              'Here she had the musical life the concert hall denied her']},
          {'kind': 'timeline', 'title': 'Works of the 1830s', 'rows': [
              ('1831', 'Cantatas for the Sunday concerts'),
              ('c. 1832', 'Overture in C major - her only orchestral overture'),
              ('1834', 'String Quartet in E-flat major'),
              ('1839-1840', 'A journey to Italy with Wilhelm and Sebastian')]},
        ],
        'library': [('cmuygtiqy00f64kktzy68v92b', 'String Quartet in E-flat major - interactive score')],
      },
      {
        'title': 'Watch: the Overture in C major', 'type': 'YOUTUBE', 'minutes': 12, 'video': 'https://www.youtube.com/watch?v=D-j7qj2r5e0',
        'description': "Fanny Hensel's Overture in C major, written around 1832 for her own concerts, is played here by the WDR Symphony Orchestra Cologne under Cristian Măcelaru (ARD Klassik).\n\nListen for:\n1. A slow, solemn introduction\n2. A lively main section with bright woodwind writing\n3. How confidently she handles a full orchestra - although she rarely had one at her disposal\n\nThink about it: for well over a century this piece was hardly ever played. Why might that be?",
      },
      {
        'title': 'Italy: the happiest year', 'type': 'SLIDES', 'minutes': 12,
        'description': "In 1839-40 Fanny spent a year in Italy. In Rome she was admired as a composer as never before - she later called it the happiest time of her life.",
        'slides': [
          {'kind': 'bullets', 'title': 'Rome, 1839-1840', 'bullets': [
              'The Hensels travelled through Italy for about a year',
              'In Rome young French composers of the Villa Medici adored her playing',
              'Among them Charles Gounod, who in his memoirs remembered how she introduced him to Bach and Beethoven',
              'For once she was treated first of all as an artist']},
          {'kind': 'listen', 'title': 'Read a song of the south', 'work': '"Nach Süden" (Towards the South), Op. 10', 'points': [
              'A song of longing for the south - written after the Italian journey',
              'Notice the swinging rhythm and wide, open melody',
              'Compare it with "Gondellied" (Gondola Song) from her Opus 1 - another Italian memory',
              'Open both interactive scores in the Library']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              '1829: marriage to the painter Wilhelm Hensel',
              'The Sunday concerts at Leipziger Strasse 3 - her own stage',
              '1839-1840: a happy year in Italy, admired by Gounod and others']},
        ],
        'library': [('cmuyfx85800h52eonoymq39tg', '"Nach Süden", Op. 10 - interactive score'), ('cmuyfx87800hf2eonpln88msa', '"Gondellied", Op. 1 - interactive score')],
      },
      {
        'title': 'Week 3 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the 1830s, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 3 in a nutshell', 'bullets': [
              '1829: married Wilhelm Hensel, who encouraged her',
              'The Sunday concerts - performing, conducting and premiering her music',
              'Overture in C major and String Quartet in E-flat',
              '1839-1840: Italy, where Gounod and others admired her']},
        ],
        'quiz': [
          ('What was Wilhelm Hensel\'s profession?', ['Composer', 'Painter', 'Banker', 'Poet'], 1),
          ('What were the "Sonntagsmusiken"?', ['Church services', 'Sunday concerts in the family home', 'A music magazine', 'Her piano lessons'], 1),
          ('Which French composer did Fanny inspire in Rome?', ['Debussy', 'Gounod', 'Berlioz', 'Bizet'], 1),
          ('Which orchestral work did she write around 1832?', ['A symphony in D', 'An overture in C major', 'A violin concerto', 'An opera'], 1),
          ('How did Fanny later describe her year in Italy?', ['The most difficult time', 'The happiest time of her life', 'A waste of time', 'A working holiday'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 4 - "Das Jahr" and Her Own Name at Last (1841-1847)',
    'lessons': [
      {
        'title': '"Das Jahr" and the first publications', 'type': 'SLIDES', 'minutes': 15,
        'description': "Inspired by Italy, Fanny wrote her most ambitious piano work - and at 40 she finally decided to publish under her own name.",
        'slides': [
          {'kind': 'bullets', 'title': '"Das Jahr" (The Year), 1841', 'bullets': [
              'Twelve character pieces, one for each month, plus a postlude',
              'Each month is written on paper of a different colour, with a drawing by Wilhelm and a short poem',
              'Quotes from chorales and Bach appear - for Easter, Christmas, New Year',
              'One of the most original piano cycles of the 19th century - published in full only in 1989']},
          {'kind': 'timeline', 'title': 'Her own name', 'rows': [
              ('1846', 'Against her brother\'s advice, she decides to publish'),
              ('1846', 'Op. 1: Six Songs - printed by Bote & Bock in Berlin'),
              ('1846-1847', 'Further songs, piano pieces and choral songs (the "Gartenlieder", Op. 3)'),
              ('1847', 'Piano Trio in D minor, Op. 11 - one of her last works'),
              ('14 May 1847', 'Dies of a stroke during a rehearsal for a Sunday concert, aged 41')]},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              '"Das Jahr": twelve months in music and pictures',
              '1846: first publications under her own name - aged 40',
              'Died on 14 May 1847; Felix died six months later']},
        ],
        'library': [('cmuyfx87700he2eonaax7iup7', '"Morgenständchen", Op. 1 - interactive score'), ('cmuyfx87n00hz2eonpox0xt8f', '"Im Wald" from the Gartenlieder, Op. 3 - interactive score')],
      },
      {
        'title': 'Listen: the "Easter Sonata"', 'type': 'YOUTUBE', 'minutes': 8, 'video': 'https://www.youtube.com/watch?v=R-KSWCt5Pys',
        'description': "Remember the musical mystery from week 2? Here is the finale of the \"Easter Sonata\" (1828), played by Isata Kanneh-Mason on her album dedicated to women composers.\n\nListen for:\n1. \"Allegro con strepito\" - fast and noisy: a stormy, dramatic movement\n2. Echoes of Beethoven, whose late sonatas Fanny knew well\n3. The music of the Passion and Easter - from turmoil to light\n\nFirst performed in public under her own name only in 2012 - 184 years after she wrote it.",
      },
      {
        'title': 'Fanny Hensel today', 'type': 'SLIDES', 'minutes': 12,
        'description': "How a composer who was almost forgotten has become one of the best-known women in music history.",
        'slides': [
          {'kind': 'bullets', 'title': 'Rediscovery', 'bullets': [
              'Most of her manuscripts stayed with the family; many are now in the Berlin State Library',
              'From the 1980s scholars and performers began to publish and record her music',
              'In 2017 Google celebrated her 212th birthday with a Doodle seen around the world',
              'Her songs, the Piano Trio and "Das Jahr" are now regularly performed']},
          {'kind': 'bullets', 'title': 'Why she matters', 'bullets': [
              'A composer of real originality - not "Felix\'s sister"',
              'Her story shows how talent can be held back - and how it can find its own way',
              'She built a musical life of her own in the salon',
              'Many more women composers are being rediscovered today - Clara Schumann, Cécile Chaminade and others']},
          {'kind': 'summary', 'title': 'Where to go next', 'bullets': [
              'Explore more than 30 of her songs in the mymusic.coach Library',
              'Continue with "Felix Mendelssohn" and "Clara Schumann"',
              'Singers and pianists: ask your teacher about "Schwanenlied" or "Italien"']},
        ],
      },
      {
        'title': 'Final review and quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Congratulations - you have reached the end of the course! One last recap and a final quiz across all four weeks.",
        'slides': [
          {'kind': 'timeline', 'title': 'Fanny Hensel\'s life at a glance', 'rows': [
              ('1805', 'Born in Hamburg on 14 November'),
              ('1820', 'Music "only an ornament", writes her father'),
              ('1829', 'Marries the painter Wilhelm Hensel'),
              ('1831', 'Sunday concerts at Leipziger Strasse 3'),
              ('1839-1840', 'A year in Italy'),
              ('1846', 'First publications under her own name'),
              ('1847', 'Dies in Berlin on 14 May')]},
        ],
        'quiz': [
          ('About how many works did Fanny Hensel compose?', ['About 40', 'About 150', 'More than 450', 'Exactly 12'], 2),
          ('What is "Das Jahr"?', ['An opera', 'A cycle of piano pieces for the twelve months', 'A song cycle by Felix', 'A diary'], 1),
          ('How old was Fanny when she first published under her own name?', ['18', '25', 'About 40', 'She never did'], 2),
          ('Who encouraged her to publish?', ['Her father', 'Her husband Wilhelm', 'Zelter', 'Queen Victoria'], 1),
          ('How did Fanny Hensel die?', ['In a carriage accident', 'Of a stroke during a rehearsal', 'Of cholera on a journey', 'In old age'], 1),
          ('Which publisher printed her Op. 1 in 1846?', ['Breitkopf & Härtel', 'Bote & Bock', 'Schott', 'Peters'], 1),
        ],
      },
    ],
  },
]
