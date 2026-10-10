# Clara Schumann (née Wieck) - a 4-week first-level introduction.
COURSE = {
    'slug': 'clara-schumann-life-and-music-introduction',
    'title': 'Clara Schumann: Life and Music - A First Introduction',
    'shortSummary': 'Four weeks with Clara Schumann: child prodigy, the greatest woman pianist of her century, composer, wife of Robert Schumann, friend of Brahms - and a career of more than sixty years.',
    'description': (
        "Clara Schumann (1819-1896), born Clara Wieck, was a star pianist at eleven, a composer at thirteen and for over sixty years one of the "
        "most admired musicians in Europe - while raising seven children and supporting her family.\n\n"
        "In four weeks you follow her life step by step:\n"
        "- Week 1 - Leipzig: a child prodigy (1819-1835)\n"
        "- Week 2 - Clara and Robert: a love against her father's will (1835-1840)\n"
        "- Week 3 - Composer, mother, virtuoso (1840-1856)\n"
        "- Week 4 - Forty more years on the concert stage (1856-1896)\n\n"
        "Every week combines illustrated slides, a documentary and a performance of her Piano Trio (Carnegie Hall), interactive scores of her "
        "songs from the mymusic.coach Library, a historic recording, and a short quiz. No previous knowledge is needed. Plan about 1-2 hours per week."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Voice'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'clara_portrait', 'title': 'Clara Schumann', 'subtitle': 'Life and Music - A First Introduction', 'tag': '4-week course'},
}
FOOTER = 'Clara Schumann: Life and Music'
PORTRAIT = {'image': 'clara_portrait', 'credit': 'Photograph by Franz Hanfstaengl, 1857 (public domain)'}
COUPLE = {'image': 'clara_robert', 'credit': 'Clara and Robert Schumann, lithograph by Eduard Kaiser, 1847 (public domain)'}
TRAUMEREI = 'cmv2iz1yr00k812if2gksf8vb'

WEEKS = [
  {
    'title': 'Week 1 - Leipzig: a Child Prodigy (1819-1835)',
    'lessons': [
      {
        'title': 'Welcome: meet Clara Schumann', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Welcome to the course! Meet Clara Schumann - pianist, composer, teacher and one of the most remarkable musicians of the 19th century - and see how the next four weeks work.\n\nTip: her songs are in the mymusic.coach Library as interactive scores - read along, star your favourites and earn extra XP for reading them to the end.",
        'slides': [
          {'kind': 'title', 'week': 'Week 1', 'title': 'Meet Clara Schumann', 'subtitle': 'A first introduction to her life and music', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Why Clara Schumann?', 'bullets': [
              'Born Clara Wieck in Leipzig in 1819 - died in Frankfurt in 1896',
              'One of the greatest pianists of the 19th century - on stage for more than 60 years',
              'A composer: a piano concerto, a piano trio, songs, piano pieces',
              'Wife of the composer Robert Schumann, close friend of Johannes Brahms',
              'For years she earned the money for a family with seven children']},
          {'kind': 'timeline', 'title': 'Your four weeks', 'rows': [
              ('Week 1', 'Leipzig: a child prodigy'),
              ('Week 2', 'Clara and Robert: a love against her father\'s will'),
              ('Week 3', 'Composer, mother, virtuoso'),
              ('Week 4', 'Forty more years on the concert stage')]},
          {'kind': 'bullets', 'title': 'A professional musician', 'bullets': [
              'Unlike Fanny Hensel, Clara was trained from childhood for a public career',
              'Her father planned every step of it - from her lessons to her concert tours',
              'She became famous across Europe - at a time when few women had a profession at all',
              'But composing, she was told and came to believe, was a man\'s business']},
        ],
      },
      {
        'title': 'Her father\'s pupil', 'type': 'SLIDES', 'minutes': 15,
        'description': "Friedrich Wieck had a plan: his daughter would be a great pianist. These slides follow Clara's extraordinary childhood.",
        'slides': [
          {'kind': 'bullets', 'title': 'Leipzig, 13 September 1819', 'bullets': [
              'Her father Friedrich Wieck was a piano teacher and sold pianos; her mother Marianne Tromlitz was a singer and pianist',
              'Her parents separated when she was four; Clara stayed with her father',
              'She hardly spoke until she was about four years old',
              'From the age of five her father gave her daily lessons: piano, theory, violin, singing, composition']},
          {'kind': 'timeline', 'title': 'A child star', 'rows': [
              ('1828', 'Aged 9: first appearance at the Leipzig Gewandhaus'),
              ('1830', 'Aged 11: her first solo concert at the Gewandhaus'),
              ('1831', 'Plays for Goethe in Weimar, who gives her a medal with his portrait'),
              ('1831-1832', 'A concert tour to Paris with her father'),
              ('1831', 'Her Op. 1 is published: four Polonaises')]},
          {'kind': 'bullets', 'title': 'A new lodger', 'bullets': [
              'In 1830 a young law student, Robert Schumann, moved into the Wieck house to study piano',
              'He was nine years older than Clara',
              'He told her ghost stories and played games with her and her brothers',
              'Nobody yet imagined what would happen five years later']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Born 13 September 1819 in Leipzig',
              'Trained every day by her father, Friedrich Wieck',
              'At 11: first solo concert in the Gewandhaus',
              'Robert Schumann comes to live in the house as her father\'s pupil']},
        ],
      },
      {
        'title': 'Watch: Encountering Robert and Clara Schumann', 'type': 'YOUTUBE', 'minutes': 12, 'video': 'https://www.youtube.com/watch?v=NK6HLaZ4kp4',
        'description': "This documentary from Bachfest Malaysia introduces Robert and Clara Schumann - their lives, their love and their music.\n\nWhile you watch, look out for:\n1. Why did Clara's father fight against her marriage?\n2. How did Clara and Robert influence each other's music?\n3. What happened to Robert in 1854?\n\nEverything comes back in the next weeks.",
      },
      {
        'title': 'A concerto at fourteen - and week 1 quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "Clara began a piano concerto at the age of 13. Then a short recap and five questions.",
        'slides': [
          {'kind': 'bullets', 'title': 'Piano Concerto in A minor, Op. 7', 'bullets': [
              'Begun in 1833 when Clara was 13; the last movement was orchestrated with Robert\'s help',
              'First performed on 9 November 1835 at the Gewandhaus - Clara played, Felix Mendelssohn conducted',
              'The three movements flow into each other without a break',
              'The slow movement is a quiet duet for piano and solo cello - an unusual idea at the time']},
          {'kind': 'summary', 'title': 'Week 1 in a nutshell', 'bullets': [
              'Born in Leipzig in 1819; trained by her father from the age of five',
              'First solo concert at the Gewandhaus at 11; played for Goethe',
              'A piano concerto finished at 16, premiered under Mendelssohn',
              'Robert Schumann lives in the house as her father\'s pupil']},
        ],
        'quiz': [
          ('In which city was Clara Schumann born?', ['Dresden', 'Leipzig', 'Frankfurt', 'Vienna'], 1),
          ('Who was Clara\'s first and main teacher?', ['Felix Mendelssohn', 'Her father, Friedrich Wieck', 'Robert Schumann', 'Franz Liszt'], 1),
          ('Which famous poet heard her play in 1831?', ['Heine', 'Goethe', 'Schiller', 'Eichendorff'], 1),
          ('Who conducted the premiere of her Piano Concerto in 1835?', ['Robert Schumann', 'Felix Mendelssohn', 'Johannes Brahms', 'Her father'], 1),
          ('Why did Robert Schumann live in the Wieck house?', ['He was a cousin', 'He was her father\'s piano pupil', 'He rented a shop there', 'He was her teacher'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 2 - Clara and Robert: a Love Against Her Father\'s Will (1835-1840)',
    'lessons': [
      {
        'title': 'A secret engagement', 'type': 'SLIDES', 'minutes': 15,
        'description': "Clara and Robert fell in love when she was sixteen. Her father did everything to separate them.",
        'slides': [
          {'kind': 'title', 'week': 'Week 2', 'title': 'Clara and Robert', 'subtitle': '1835 - 1840', **COUPLE},
          {'kind': 'bullets', 'title': 'Love and a ban', 'bullets': [
              'In 1835 Clara and Robert fell in love; in 1837 they became secretly engaged',
              'Friedrich Wieck forbade any contact - Robert had little money and an uncertain future',
              'For long periods they could only write letters, often sent in secret',
              'Their music became a secret language: they quoted each other\'s themes']},
          {'kind': 'bullets', 'title': 'Vienna, 1838', 'bullets': [
              'During a tour of Vienna in 1837-38 Clara became a sensation',
              'At 18 she was named Imperial and Royal Chamber Virtuoso - the highest Austrian honour for a musician',
              'Unusual for a Protestant, a foreigner - and so young',
              'Even the poet Franz Grillparzer wrote a poem about her playing']},
          {'kind': 'timeline', 'title': 'To court for love', 'rows': [
              ('1839', 'Clara and Robert take her father to court to be allowed to marry'),
              ('1840', 'The court decides in their favour'),
              ('12 September 1840', 'They marry in the village church of Schönefeld near Leipzig - the day before her 21st birthday')]},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              '1837: a secret engagement',
              '1838: Imperial and Royal Chamber Virtuoso in Vienna',
              '12 September 1840: marriage, after a court case against her father']},
        ],
      },
      {
        'title': 'Listen: music for Clara', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [TRAUMEREI, 0],
        'description': "In the years of their separation Robert wrote many of his best piano works - and Clara was in all of them. In 1838 he wrote to her that she had once said he sometimes seemed like a child to her - and from that came the \"Scenes from Childhood\" (Kinderszenen), thirty little pieces from which he kept thirteen.\n\nThe seventh is \"Träumerei\" (Dreaming) - here in a version for cello, played by the Belgian cellist Maurice Dambois on a 78 rpm record from 1919.\n\nListen for:\n1. One short, simple melody that rises and falls, again and again\n2. How the harmonies underneath change each time\n3. Then think: what might Clara have heard in this music?\n\nIn 1840, the year of their wedding, Robert wrote more than 100 songs. His wedding present to her was the song collection \"Myrthen\" (Myrtles), which opens with \"Widmung\" (Dedication).",
        'library': [(TRAUMEREI, 'Robert Schumann: "Träumerei" - Maurice Dambois, cello, 1919'), ('cmv2iwhqx00f212ifgakf8i8u', 'Robert Schumann: Romance in F-sharp major - Olga Samaroff, piano, 1924')],
      },
      {
        'title': 'Read: Clara\'s songs', 'type': 'SLIDES', 'minutes': 12,
        'description': "In 1841 Clara and Robert published a joint song collection. Read her three songs from it.",
        'slides': [
          {'kind': 'bullets', 'title': 'Twelve songs from "Liebesfrühling"', 'bullets': [
              'Poems by Friedrich Rückert, set to music by both Robert and Clara',
              'Published in 1841 as Robert\'s Op. 37 and Clara\'s Op. 12 - without saying who wrote which song',
              'Clara\'s three: "Er ist gekommen in Sturm und Regen", "Liebst du um Schönheit" and "Warum willst du and\'re fragen"',
              'Critics often could not tell their songs apart']},
          {'kind': 'listen', 'title': '"Liebst du um Schönheit"', 'work': '"If you love for beauty" - Lieder, Op. 12', 'points': [
              '"If you love for beauty, do not love me - love the sun"',
              'Each verse names a reason not to love: beauty, youth, treasure',
              'The last verse: "If you love for love - oh yes, love me!"',
              'Notice how the music grows warmer in the last verse - open the interactive score']},
          {'kind': 'listen', 'title': '"Er ist gekommen in Sturm und Regen"', 'work': '"He came in storm and rain" - Lieder, Op. 12', 'points': [
              'A stormy, driving piano part - you hear the rain',
              'The voice is breathless with excitement',
              'A love song that is also a picture of nature',
              'Compare it with Robert\'s "Widmung" if you know it']},
        ],
        'library': [('cmuyfx8w200ye2eony5s6x9v2', '"Liebst du um Schönheit" - interactive score'), ('cmuyfx8w200yd2eon215aey0k', '"Er ist gekommen in Sturm und Regen" - interactive score'), ('cmuyfx8w300yf2eonkr9ncs19', '"Warum willst du and\'re fragen" - interactive score')],
      },
      {
        'title': 'Week 2 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the love story, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 2 in a nutshell', 'bullets': [
              '1835-1840: Clara and Robert in love - against her father\'s will',
              '1838: the highest Austrian honour for a musician, at 18',
              '1840: a court case - and the wedding on 12 September',
              '1841: joint songs on poems by Rückert']},
        ],
        'quiz': [
          ('Why did Clara and Robert go to court?', ['Over money', 'To be allowed to marry', 'About a stolen manuscript', 'About a concert contract'], 1),
          ('When did Clara and Robert marry?', ['1835', '1838', '1840', '1854'], 2),
          ('Which honour did Clara receive in Vienna in 1838?', ['A gold medal from Goethe', 'Imperial and Royal Chamber Virtuoso', 'Honorary citizen of Vienna', 'Court Kapellmeister'], 1),
          ('Which poet wrote the texts of their joint songs of 1841?', ['Heine', 'Friedrich Rückert', 'Goethe', 'Schiller'], 1),
          ('What does "Träumerei" mean?', ['Waltz', 'Dreaming', 'Childhood', 'Farewell'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 3 - Composer, Mother, Virtuoso (1840-1856)',
    'lessons': [
      {
        'title': 'Two careers in one house', 'type': 'SLIDES', 'minutes': 15,
        'description': "Married life brought joy - and a hard balancing act between children, Robert's composing and her own career.",
        'slides': [
          {'kind': 'title', 'week': 'Week 3', 'title': 'Composer, mother, virtuoso', 'subtitle': '1840 - 1856', **COUPLE},
          {'kind': 'bullets', 'title': 'A shared diary', 'bullets': [
              'Clara and Robert kept a marriage diary together, writing in turn',
              'They studied Bach fugues and scores together',
              'But when Robert composed, Clara could not practise - the house was too small',
              'Between 1841 and 1854 she gave birth to eight children; seven survived infancy']},
          {'kind': 'timeline', 'title': 'Places and works', 'rows': [
              ('1844', 'A long tour to Russia; the family moves to Dresden'),
              ('1846', 'Piano Trio in G minor, Op. 17 - her largest chamber work'),
              ('1850', 'Move to Düsseldorf, where Robert becomes music director'),
              ('1853', 'Three Romances for violin and piano, Op. 22; Variations on a theme by Robert, Op. 20')]},
          {'kind': 'quote', 'quote': 'There is nothing that surpasses the joy of creation, if only because through it one wins hours of self-forgetfulness.', 'by': 'Clara Schumann, diary, 1853'},
        ],
      },
      {
        'title': 'Watch: the Piano Trio in G minor', 'type': 'YOUTUBE', 'minutes': 30, 'video': 'https://www.youtube.com/watch?v=H_Pc04tZzmg',
        'description': "Clara Schumann's Piano Trio in G minor, Op. 17 (1846) played by Ensemble Connect at Carnegie Hall.\n\nIt was Clara's most ambitious work, and Robert wrote his own first Piano Trio the next year. Mendelssohn's influence is clear - and so is her own voice.\n\nListen for:\n1. First movement: a dark, songful theme in the violin over flowing piano\n2. Second movement: a graceful \"Scherzo\" in the tempo of a minuet\n3. Third movement: a tender slow movement\n4. Finale: a passage in the style of a fugue (a fugato) - Clara loved Bach\n\nThink about it: why did a composer who wrote such music so often doubt her talent?",
      },
      {
        'title': 'Brahms and the catastrophe of 1854', 'type': 'SLIDES', 'minutes': 15,
        'description': "In 1853 a young man from Hamburg knocked at the Schumanns' door. A few months later Clara's life fell apart.",
        'slides': [
          {'kind': 'bullets', 'title': 'Johannes Brahms, 1853', 'bullets': [
              'On 30 September 1853 the 20-year-old Brahms visited the Schumanns in Düsseldorf',
              'Robert announced him in an article as the coming genius - "New Paths"',
              'Brahms and the violinist Joseph Joachim became Clara\'s lifelong friends',
              'Brahms showed her every new work for more than forty years']},
          {'kind': 'bullets', 'title': '1854', 'bullets': [
              'Robert had long suffered from depressions; in February 1854 his illness grew much worse',
              'He threw himself into the Rhine, was rescued, and asked to be taken to an asylum at Endenich near Bonn',
              'For over two years the doctors did not allow Clara to see him',
              'She saw him again only two days before he died, on 29 July 1856']},
          {'kind': 'bullets', 'title': 'She gives up composing', 'bullets': [
              'After 1853 Clara wrote almost no more music',
              'She had seven children to feed - and became the family\'s breadwinner as a touring pianist',
              'Brahms helped the family in Düsseldorf while she toured',
              'Already in 1839 she had written: "A woman must not desire to compose - there has never yet been one able to do it. Should I expect to be the one?"']},
          {'kind': 'listen', 'title': 'Her last songs', 'work': '"Die stille Lotosblume" (1843) and the Six Songs, Op. 23 (1853)', 'points': [
              '"Die stille Lotosblume": the lotus flower on a quiet lake - ends on an open, unanswered chord',
              'Op. 23: six songs from "Jucunde" by Hermann Rollett - among her last works',
              'Open the interactive scores and read them']},
        ],
        'library': [('cmuyfx8u000y62eonvrbwvse4', '"Die stille Lotosblume" - interactive score'), ('cmuyfx8u200yc2eonu34mmw4s', '"O Lust, o Lust", Op. 23 - interactive score')],
      },
      {
        'title': 'Week 3 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the married years, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 3 in a nutshell', 'bullets': [
              'Composer, concert pianist and mother of eight',
              '1846: Piano Trio in G minor, Op. 17',
              '1853: Brahms and Joachim become lifelong friends',
              '1854: Robert\'s breakdown; he dies in 1856 - Clara stops composing']},
        ],
        'quiz': [
          ('What is Clara\'s largest chamber work?', ['A string quartet', 'The Piano Trio in G minor, Op. 17', 'A violin sonata', 'An octet'], 1),
          ('Who knocked at the Schumanns\' door in 1853?', ['Franz Liszt', 'Johannes Brahms', 'Richard Wagner', 'Frédéric Chopin'], 1),
          ('Which violinist became Clara\'s lifelong friend?', ['Niccolò Paganini', 'Joseph Joachim', 'Ferdinand David', 'Pablo de Sarasate'], 1),
          ('When did Robert Schumann die?', ['1847', '1854', '1856', '1896'], 2),
          ('What did Clara do after 1854 to support her family?', ['She opened a shop', 'She toured as a concert pianist', 'She remarried', 'She sold Robert\'s manuscripts'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 4 - Forty More Years on the Concert Stage (1856-1896)',
    'lessons': [
      {
        'title': 'The queen of the piano', 'type': 'SLIDES', 'minutes': 15,
        'description': "For four decades after Robert's death Clara toured Europe. She changed how concerts were given - and how the piano was played.",
        'slides': [
          {'kind': 'title', 'week': 'Week 4', 'title': 'Forty more years on stage', 'subtitle': '1856 - 1896', **PORTRAIT},
          {'kind': 'bullets', 'title': 'A new kind of pianist', 'bullets': [
              'She gave well over a thousand concerts across Europe; she visited England many times',
              'She was one of the first pianists to play from memory regularly',
              'She played serious music - Bach, Beethoven, Chopin, Schumann, Brahms - not only showpieces',
              'She championed Robert\'s music and later edited his complete works']},
          {'kind': 'timeline', 'title': 'The later years', 'rows': [
              ('1856', 'Robert dies; Clara continues her career'),
              ('1863', 'Settles in Baden-Baden for the summers'),
              ('1878', 'Principal piano teacher at the new Hoch Conservatory in Frankfurt'),
              ('1891', 'Her last public concert, in Frankfurt'),
              ('20 May 1896', 'Dies in Frankfurt, aged 76; buried beside Robert in Bonn')]},
          {'kind': 'bullets', 'title': 'Teacher', 'bullets': [
              'In Frankfurt she taught pupils from all over Europe and America',
              'She insisted on a singing tone and faithfulness to the score',
              'Her pupils carried her style into the 20th century']},
        ],
      },
      {
        'title': 'Read: "Lorelei"', 'type': 'SLIDES', 'minutes': 10,
        'description': "Clara's \"Lorelei\" (1843) sets Heinrich Heine's famous poem about the siren on the Rhine - and shows her at her most dramatic.",
        'slides': [
          {'kind': 'listen', 'title': '"Lorelei" (1843)', 'work': 'Song on a poem by Heinrich Heine', 'points': [
              'The Lorelei sits on a rock above the Rhine and combs her golden hair',
              'Her song is so beautiful that boatmen forget the rocks - and sink',
              'Clara\'s piano part rushes like the river from beginning to end',
              'Very different from Friedrich Silcher\'s famous folk-like setting - open the interactive score']},
          {'kind': 'summary', 'title': 'Clara\'s songs in the Library', 'bullets': [
              'Op. 12 and Op. 13 (1840-1844): Rückert, Heine and Geibel',
              'Op. 23 (1853): six songs on poems by Hermann Rollett',
              'Single songs such as "Lorelei" and "Die gute Nacht"',
              '17 of her songs are in the Library as interactive scores']},
        ],
        'library': [('cmuyfx8w900yh2eon7yibchvi', '"Lorelei" - interactive score'), ('cmuyfx8tz00y12eon3xbau5mx', '"Ich stand in dunklen Träumen", Op. 13 - interactive score')],
      },
      {
        'title': 'Clara Schumann today', 'type': 'SLIDES', 'minutes': 10,
        'description': "How Clara is remembered - and why her music is played more and more.",
        'slides': [
          {'kind': 'bullets', 'title': 'Remembered', 'bullets': [
              'In the last series of German banknotes before the euro she was pictured on the 100-mark note',
              'Her bicentenary in 2019 brought concerts, recordings and books all over the world',
              'Her Piano Concerto, Piano Trio and Romances Op. 22 are now standard repertoire again',
              'Her diaries and letters with Robert and Brahms are some of the great documents of Romanticism']},
          {'kind': 'summary', 'title': 'Where to go next', 'bullets': [
              'Continue with "Johannes Brahms", "Felix Mendelssohn" and "Fanny Hensel"',
              'Singers: ask your teacher about "Liebst du um Schönheit"',
              'Pianists: look for her "Romances" and "Soirées musicales"']},
        ],
      },
      {
        'title': 'Final review and quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Congratulations - you have reached the end of the course! One last recap and a final quiz across all four weeks.",
        'slides': [
          {'kind': 'timeline', 'title': 'Clara Schumann\'s life at a glance', 'rows': [
              ('1819', 'Born in Leipzig on 13 September'),
              ('1830', 'First solo concert at the Gewandhaus, aged 11'),
              ('1835', 'Premiere of her Piano Concerto'),
              ('1840', 'Marries Robert Schumann'),
              ('1846', 'Piano Trio in G minor'),
              ('1853-1856', 'Brahms; Robert\'s illness and death'),
              ('1896', 'Dies in Frankfurt on 20 May')]},
        ],
        'quiz': [
          ('For how long did Clara perform in public?', ['About 10 years', 'About 30 years', 'More than 60 years', 'Only as a child'], 2),
          ('What was unusual about Clara\'s concerts?', ['She played only her own music', 'She often played from memory', 'She always played with an orchestra', 'She never played Beethoven'], 1),
          ('Where did Clara teach from 1878?', ['Leipzig Conservatory', 'Hoch Conservatory in Frankfurt', 'Paris Conservatoire', 'Royal Academy in London'], 1),
          ('Which banknote showed Clara Schumann?', ['The German 100-mark note', 'The Swiss 50-franc note', 'The 10-euro note', 'The Austrian 1000-schilling note'], 0),
          ('On whose poem is her song "Lorelei" based?', ['Goethe', 'Heinrich Heine', 'Rückert', 'Eichendorff'], 1),
          ('How many of her children survived infancy?', ['Three', 'Five', 'Seven', 'Nine'], 2),
        ],
      },
    ],
  },
]
