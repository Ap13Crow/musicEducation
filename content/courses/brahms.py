# Johannes Brahms - a 4-week first-level introduction.
COURSE = {
    'slug': 'brahms-life-and-music-introduction',
    'title': 'Johannes Brahms: Life and Music - A First Introduction',
    'shortSummary': 'Four weeks with Johannes Brahms: from the harbour city of Hamburg to Vienna - the Schumanns, a German Requiem, the Hungarian Dances, the Lullaby and four great symphonies.',
    'description': (
        "Johannes Brahms (1833-1897) grew up poor in Hamburg, was hailed by Robert Schumann at twenty as the coming genius, and became the great "
        "keeper of the classical tradition in Vienna - while writing some of the warmest, most passionate music of the Romantic age.\n\n"
        "In four weeks you follow his life step by step:\n"
        "- Week 1 - Hamburg: a musician's son (1833-1853)\n"
        "- Week 2 - The Schumanns and a German Requiem (1853-1868)\n"
        "- Week 3 - Vienna and the footsteps of a giant: the symphonies (1862-1885)\n"
        "- Week 4 - Late works, farewell and legacy (1886-1897)\n\n"
        "Every week combines illustrated slides, a documentary and the Berlin Philharmonic, symphonies and a 1913 record from the mymusic.coach "
        "Library, interactive scores of his songs, and a short quiz. No previous knowledge is needed. Plan about 1-2 hours per week."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin', 'Voice'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'brahms_portrait', 'title': 'Brahms', 'subtitle': 'Life and Music - A First Introduction', 'tag': '4-week course'},
}
FOOTER = 'Johannes Brahms: Life and Music'
PORTRAIT = {'image': 'brahms_portrait', 'credit': 'Photograph by C. Brasch, Berlin, 1889 (public domain)'}
YOUNG = {'image': 'brahms_young', 'credit': 'Drawing by Bonaventure Laurens, Düsseldorf 1853 (public domain)'}
SYMPHONY1 = 'cmuygtj1x00jz4kktyutlvk6x'
SYMPHONY4 = 'cmuygtizg00jk4kktfa0bejsv'
CRADLE = 'cmv2iqfgj004a12if6pg0lp0b'
HUNGARIAN5 = 'cmv2is2is007a12ifdj5md9d0'

WEEKS = [
  {
    'title': 'Week 1 - Hamburg: a Musician\'s Son (1833-1853)',
    'lessons': [
      {
        'title': 'Welcome: meet Johannes Brahms', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Welcome to the course! Meet the man with the famous beard - who was once a slim, shy young pianist - and see how the next four weeks work.\n\nTip: all music mentioned in this course is linked from the lessons - open it in the Library, read the scores and earn extra XP for listening or reading to the end.",
        'slides': [
          {'kind': 'title', 'week': 'Week 1', 'title': 'Meet Johannes Brahms', 'subtitle': 'A first introduction to his life and music', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Why Brahms?', 'bullets': [
              'Born in Hamburg in 1833 - died in Vienna in 1897',
              'Four symphonies, two piano concertos, a violin concerto, "A German Requiem"',
              'Over 200 songs, chamber music, piano pieces - and the Hungarian Dances',
              'His "Lullaby" (Wiegenlied) is one of the best-known melodies in the world',
              'He combined the forms of Bach and Beethoven with Romantic warmth']},
          {'kind': 'timeline', 'title': 'Your four weeks', 'rows': [
              ('Week 1', 'Hamburg: a musician\'s son'),
              ('Week 2', 'The Schumanns and a German Requiem'),
              ('Week 3', 'Vienna and the footsteps of a giant: the symphonies'),
              ('Week 4', 'Late works, farewell and legacy')]},
          {'kind': 'bullets', 'title': 'The "three Bs"', 'bullets': [
              'The conductor Hans von Bülow named Bach, Beethoven and Brahms the "three Bs" of music',
              'Brahms was a modern composer who loved the music of the past',
              'He studied old music deeply: Bach, Handel, Schütz, even Renaissance composers',
              'Schoenberg later called him "Brahms the progressive"']},
        ],
      },
      {
        'title': 'A childhood by the harbour', 'type': 'SLIDES', 'minutes': 15,
        'description': "Brahms grew up in a poor family in Hamburg's crowded harbour district. Music was the way out.",
        'slides': [
          {'kind': 'bullets', 'title': 'Hamburg, 7 May 1833', 'bullets': [
              'His father Johann Jakob was a double bass player in dance bands and theatre orchestras',
              'His mother Christiane was a seamstress, 17 years older than her husband',
              'The family lived in small rooms in the old quarter near the harbour',
              'Johannes learned violin and cello from his father - but loved the piano']},
          {'kind': 'bullets', 'title': 'Two good teachers', 'bullets': [
              'At seven he started piano with Otto Friedrich Cossel',
              'Cossel sent him to his own teacher, Eduard Marxsen, one of Hamburg\'s best musicians',
              'Marxsen taught him Bach and Beethoven - and how to compose',
              'At ten Johannes played in public; an offer of an American tour was turned down by his teachers']},
          {'kind': 'bullets', 'title': 'Earning money young', 'bullets': [
              'As a teenager he played piano for dancing in inns and taverns to help his family',
              'He later told friends dark stories about those nights - historians still debate how true they are',
              'He also arranged light music for publishers under false names',
              'And he read everything: poetry, folk songs, history']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Born 7 May 1833 in Hamburg, son of a double bass player',
              'Teachers: Otto Cossel and Eduard Marxsen',
              'A teenager playing for money - and reading and composing in every free hour']},
        ],
      },
      {
        'title': 'Watch: Brahms - his life and places', 'type': 'YOUTUBE', 'minutes': 22, 'video': 'https://www.youtube.com/watch?v=DyVmw5u9vjI',
        'description': "This documentary by opera-inside follows Brahms from Hamburg to Düsseldorf, Vienna and the summer resorts where he composed, with his music all the way.\n\nWhile you watch, look out for:\n1. What role did Robert and Clara Schumann play in his life?\n2. Why did his first symphony take so long?\n3. Where did he spend his summers composing?\n\nEverything comes back in the next weeks.",
      },
      {
        'title': '1853: the road to Düsseldorf - and week 1 quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "In 1853 Brahms set off on a concert tour. By the end of the year he was famous.",
        'slides': [
          {'kind': 'title', 'week': '1853', 'title': 'The road to Düsseldorf', 'subtitle': 'Brahms at 20', **YOUNG},
          {'kind': 'timeline', 'title': 'The year that changed everything', 'rows': [
              ('Spring 1853', 'A tour with the Hungarian violinist Ede Reményi - Brahms hears Hungarian "gypsy" music'),
              ('May 1853', 'In Hanover he meets the great violinist Joseph Joachim, who becomes a lifelong friend'),
              ('June 1853', 'In Weimar he meets Franz Liszt - but does not feel at home in his circle'),
              ('30 Sept 1853', 'With a letter from Joachim, he knocks at the Schumanns\' door in Düsseldorf')]},
          {'kind': 'summary', 'title': 'Week 1 in a nutshell', 'bullets': [
              'Born in Hamburg in 1833, son of a double bass player',
              'Trained by Cossel and Marxsen in Bach and Beethoven',
              'Played for money as a teenager',
              '1853: Reményi, Joachim, Liszt - and the Schumanns']},
        ],
        'quiz': [
          ('In which city was Brahms born?', ['Vienna', 'Hamburg', 'Berlin', 'Leipzig'], 1),
          ('Which instrument did Brahms\'s father play?', ['Piano', 'Double bass', 'Trumpet', 'Organ'], 1),
          ('Who was Brahms\'s main teacher in Hamburg?', ['Eduard Marxsen', 'Robert Schumann', 'Franz Liszt', 'Felix Mendelssohn'], 0),
          ('Which violinist became his lifelong friend in 1853?', ['Ede Reményi', 'Joseph Joachim', 'Niccolò Paganini', 'Pablo de Sarasate'], 1),
          ('Who are the "three Bs" of music?', ['Bach, Beethoven, Brahms', 'Bach, Bruckner, Berlioz', 'Beethoven, Bellini, Bizet', 'Brahms, Bartók, Britten'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Week 2 - The Schumanns and a German Requiem (1853-1868)',
    'lessons': [
      {
        'title': 'Robert and Clara Schumann', 'type': 'SLIDES', 'minutes': 15,
        'description': "Robert Schumann called him a genius in print - then fell ill. Brahms stood by Clara for the rest of her life.",
        'slides': [
          {'kind': 'title', 'week': 'Week 2', 'title': 'The Schumanns and a German Requiem', 'subtitle': '1853 - 1868', **YOUNG},
          {'kind': 'bullets', 'title': '"New Paths", October 1853', 'bullets': [
              'Robert Schumann heard Brahms play his own sonatas and was overwhelmed',
              'In his magazine he wrote an article, "Neue Bahnen" (New Paths)',
              'He called Brahms the young man "called to give ideal expression to the times"',
              'Suddenly the 20-year-old was famous - and under huge pressure']},
          {'kind': 'bullets', 'title': '1854-1856', 'bullets': [
              'In February 1854 Robert Schumann fell gravely ill and was taken to an asylum',
              'Brahms moved to Düsseldorf to help Clara and her seven children',
              'He fell deeply in love with Clara, 14 years older than him',
              'After Robert\'s death in 1856 they stayed close friends for forty years - he never married']},
          {'kind': 'bullets', 'title': 'Piano Concerto No. 1, 1859', 'bullets': [
              'It began as a sonata for two pianos, then a symphony, and became a concerto',
              'Its stormy beginning is often linked with the shock of Schumann\'s illness',
              'At the Leipzig performance in January 1859 the audience hissed',
              'Brahms wrote to Joachim: "I am only experimenting and feeling my way" - and kept going']},
        ],
      },
      {
        'title': 'Listen: the Hungarian Dances', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [HUNGARIAN5, 0],
        'description': "The tour with Reményi in 1853 showed Brahms the fiery style of Hungarian Roma bands. He collected their tunes, and in 1869 he published the first Hungarian Dances for piano four hands. They were a huge success and made him rich.\n\nBrahms called them \"arrangements\", not his own compositions, because most of the melodies were popular tunes. Joachim arranged them for violin and piano.\n\nHere is No. 5 - the most famous - in Joachim's arrangement on an Edison record from 1913.\n\nListen for:\n1. Sudden changes of speed - slow, then very fast\n2. The violin\'s fiery, sobbing style\n3. A cheerful middle section in major\n\nAfterwards, watch the Berlin Philharmonic play the orchestral version in the next lesson.",
        'library': [(HUNGARIAN5, 'Hungarian Dance No. 5 - 78 rpm record, 1913'), ('cmv2is0ce007812if2ho6w8s1', 'Hungarian Dance No. 1 - Philadelphia Orchestra, 1922')],
      },
      {
        'title': 'A German Requiem and the Lullaby', 'type': 'SLIDES', 'minutes': 15,
        'description': "Two very different works from the same years: a great choral requiem for the living - and a lullaby for a friend's baby.",
        'slides': [
          {'kind': 'bullets', 'title': '"Ein deutsches Requiem"', 'bullets': [
              'Brahms\'s mother died in 1865; work on the Requiem became more urgent',
              'Not a Latin mass for the dead: Brahms chose German texts from the Bible himself',
              'It comforts the living: "Blessed are they that mourn, for they shall be comforted"',
              'First performed in Bremen Cathedral on Good Friday 1868; the complete seven movements in Leipzig in 1869',
              'It made Brahms famous across Europe']},
          {'kind': 'listen', 'title': 'The "Lullaby"', 'work': 'Wiegenlied, Op. 49 No. 4 (1868)', 'points': [
              '"Guten Abend, gut\' Nacht" - written for the second son of his friend Bertha Faber',
              'The piano part quotes a Viennese song Bertha used to sing to him years before',
              'A simple, rocking melody that the whole world now knows',
              'Read the score and listen to the great pianist Alfred Cortot play it on a record from 1925']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              '1853: Schumann\'s "New Paths" makes Brahms famous',
              'Lifelong friendship with Clara Schumann',
              '1868-1869: "A German Requiem" - his breakthrough',
              '1868: the Lullaby; 1869: the Hungarian Dances']},
        ],
        'library': [('cmuyfx7o3003t2eon3amkh63k', 'Wiegenlied, Op. 49 No. 4 - interactive score'), (CRADLE, 'Cradle Song - Alfred Cortot, piano, 1925')],
      },
      {
        'title': 'Week 2 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the Schumann years and the Requiem, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 2 in a nutshell', 'bullets': [
              '"New Paths": Schumann\'s famous article about the 20-year-old Brahms',
              '1854: Robert\'s illness; Brahms supports Clara',
              '1859: the First Piano Concerto is hissed in Leipzig',
              '1868: "A German Requiem" - and the Lullaby']},
        ],
        'quiz': [
          ('What was the title of Schumann\'s article about Brahms?', ['"Hats off, gentlemen"', '"New Paths"', '"The Music of the Future"', '"A Young Genius"'], 1),
          ('What is special about the texts of "A German Requiem"?', ['They are in Latin', 'Brahms chose German Bible texts himself', 'They were written by Goethe', 'There are no words'], 1),
          ('For whom did Brahms write his "Lullaby"?', ['Clara Schumann\'s daughter', 'The baby son of his friend Bertha Faber', 'His own son', 'Queen Victoria'], 1),
          ('What happened at the Leipzig performance of his First Piano Concerto in 1859?', ['A huge success', 'The audience hissed', 'It was cancelled', 'Brahms fell ill'], 1),
          ('How did Brahms describe his Hungarian Dances?', ['As his greatest works', 'As arrangements of popular tunes', 'As symphonies', 'As church music'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 3 - Vienna and the Footsteps of a Giant (1862-1885)',
    'lessons': [
      {
        'title': 'Vienna and the First Symphony', 'type': 'SLIDES', 'minutes': 15,
        'description': "Brahms settled in Vienna, the city of Beethoven and Schubert. Writing a symphony after Beethoven took him more than twenty years.",
        'slides': [
          {'kind': 'title', 'week': 'Week 3', 'title': 'Vienna and the footsteps of a giant', 'subtitle': '1862 - 1885', **PORTRAIT},
          {'kind': 'bullets', 'title': 'A Viennese from Hamburg', 'bullets': [
              'Brahms first visited Vienna in 1862 and soon settled there for good',
              'He conducted the Singakademie and later the concerts of the Gesellschaft der Musikfreunde',
              'From 1872 he lived in a modest flat at Karlsgasse 4',
              'Every summer he left the city to compose in the countryside']},
          {'kind': 'quote', 'quote': 'You have no idea how it feels for someone like me to hear behind him the footsteps of a giant like Beethoven.', 'by': 'Brahms, as remembered by the conductor Hermann Levi'},
          {'kind': 'bullets', 'title': 'Symphony No. 1 in C minor, 1876', 'bullets': [
              'First sketches in the 1850s; finished only in 1876, when Brahms was 43',
              'First performed in Karlsruhe on 4 November 1876',
              'The finale\'s great melody sounds like Beethoven\'s "Ode to Joy" - Brahms said "any fool can see that"',
              'Hans von Bülow called it "Beethoven\'s Tenth"']},
        ],
      },
      {
        'title': 'Listen: the First Symphony', 'type': 'AUDIO', 'minutes': 17, 'libraryAudio': [SYMPHONY1, 3],
        'description': "Here is the last movement of the Symphony No. 1 (Musopen recording, public domain) - the moment when, after a long dark struggle, the music breaks through into C major.\n\nListen for:\n1. A slow, mysterious introduction in the minor\n2. A solo horn plays a broad Alpine melody - Brahms had sent it to Clara on a birthday card in 1868 from Switzerland, with the words \"High on the mountain, deep in the valley, I greet you a thousand times\"\n3. A solemn chorale for the trombones\n4. Then the great main theme in the strings - the one that reminded everyone of Beethoven\n\nThe full symphony is in the Library.",
        'library': [(SYMPHONY1, 'Symphony No. 1 in C minor - full recording')],
      },
      {
        'title': 'Watch: Hungarian Dance No. 5', 'type': 'YOUTUBE', 'minutes': 3, 'video': 'https://www.youtube.com/watch?v=QAMxkietiik',
        'description': "Claudio Abbado conducts the Berlin Philharmonic in the orchestral version of the Hungarian Dance No. 5.\n\nCompare it with the 1913 violin record you heard in week 2:\n1. Which version is more fiery?\n2. How does the orchestra use the sudden changes of speed?\n3. Which instruments get the melody?\n\nThink about it: Brahms's light music made him rich - and gave him the freedom to take 20 years over a symphony.",
      },
      {
        'title': 'The great years - and week 3 quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "After the First Symphony the floodgates opened. A recap and five questions.",
        'slides': [
          {'kind': 'timeline', 'title': 'Masterpieces, 1877-1885', 'rows': [
              ('1877', 'Symphony No. 2 - sunny, written in a summer by the Wörthersee lake'),
              ('1878', 'Violin Concerto, for Joseph Joachim'),
              ('1880', 'Academic Festival Overture - thanks for an honorary doctorate, built on student songs'),
              ('1881', 'Piano Concerto No. 2'),
              ('1883', 'Symphony No. 3'),
              ('1885', 'Symphony No. 4')]},
          {'kind': 'bullets', 'title': 'Brahms against Wagner?', 'bullets': [
              'Critics like Eduard Hanslick made Brahms the hero of "absolute" music',
              'Their opponents praised Wagner and Liszt\'s "music of the future"',
              'Newspapers loved the quarrel; Brahms himself admired Wagner\'s skill',
              'Today we can simply enjoy both']},
        ],
        'quiz': [
          ('In which city did Brahms settle?', ['Hamburg', 'Vienna', 'Leipzig', 'Berlin'], 1),
          ('How old was Brahms when his First Symphony was premiered?', ['23', '33', '43', '53'], 2),
          ('Who called the First Symphony "Beethoven\'s Tenth"?', ['Clara Schumann', 'Hans von Bülow', 'Richard Wagner', 'Eduard Hanslick'], 1),
          ('For whom did Brahms write his Violin Concerto?', ['Reményi', 'Joseph Joachim', 'Paganini', 'Clara Schumann'], 1),
          ('What is the Academic Festival Overture built on?', ['Church hymns', 'Student songs', 'Hungarian dances', 'Folk songs from Hamburg'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 4 - Late Works, Farewell and Legacy (1886-1897)',
    'lessons': [
      {
        'title': 'Listen: the Fourth Symphony', 'type': 'AUDIO', 'minutes': 12, 'libraryAudio': [SYMPHONY4, 3],
        'description': "Brahms's last symphony (1885) ends with a movement unlike any other symphony finale: 30 variations over a repeated eight-bar theme - a passacaglia, an old Baroque form. The theme is adapted from the last movement of Bach's Cantata No. 150.\n\nListen (Musopen recording, public domain) for:\n1. The theme: eight loud chords in the winds and trombones\n2. A long, lonely flute solo in the middle, in slow time\n3. The trombones returning with the theme in a solemn chorale\n4. A dramatic, tragic ending in E minor\n\nThis is the old Bach tradition and the Romantic symphony in one movement. The full symphony is in the Library.",
        'library': [(SYMPHONY4, 'Symphony No. 4 in E minor - full recording')],
      },
      {
        'title': 'Late works and farewell', 'type': 'SLIDES', 'minutes': 15,
        'description': "In 1890 Brahms planned to stop composing. A clarinettist changed his mind.",
        'slides': [
          {'kind': 'title', 'week': 'Week 4', 'title': 'Late works and farewell', 'subtitle': '1886 - 1897', **PORTRAIT},
          {'kind': 'bullets', 'title': 'The last chapter', 'bullets': [
              '1890: Brahms thought about retiring',
              '1891: he heard the clarinettist Richard Mühlfeld in Meiningen and wrote four works for him, among them the Clarinet Quintet',
              '1892-1893: twenty short piano pieces, Op. 116-119 - intimate and autumnal',
              'The Intermezzo Op. 118 No. 2 is one of the most loved; the set is dedicated to Clara']},
          {'kind': 'bullets', 'title': '1896-1897', 'bullets': [
              'In May 1896, as Clara Schumann lay dying, he wrote the "Four Serious Songs" on Bible texts',
              'Clara died on 20 May 1896; Brahms nearly missed her funeral after taking the wrong train',
              'He was already ill with liver cancer, the disease that had killed his father',
              'He died in Vienna on 3 April 1897 and is buried near Beethoven and Schubert']},
          {'kind': 'listen', 'title': 'Read along', 'work': 'Intermezzo in A major, Op. 118 No. 2', 'points': [
              'A tender melody that seems to ask a question',
              'The answer is the same melody, turned upside down',
              'A darker middle part - then the question again',
              'Open the score in the Library']},
        ],
        'library': [('cmuygw9cz01vx4kktx94zuyj2', 'Intermezzo, Op. 118 No. 2 - score'), ('cmuyfx7nv003f2eonhfi0j60a', '"O Tod, wie bitter bist du" (Four Serious Songs) - interactive score')],
      },
      {
        'title': 'Read: Brahms\'s songs', 'type': 'SLIDES', 'minutes': 10,
        'description': "Brahms wrote over 200 songs. Here are three you can read in the Library.",
        'slides': [
          {'kind': 'bullets', 'title': 'A songwriter rooted in folk song', 'bullets': [
              'Brahms loved German folk songs and arranged dozens of them',
              'His ideal: a melody so natural it sounds as if it had always existed',
              'He often wrote for low voices - he liked warm, dark colours']},
          {'kind': 'listen', 'title': 'Three songs to read', 'work': 'Songs from the mymusic.coach Library', 'points': [
              '"Von ewiger Liebe" (Op. 43 No. 1): a dramatic dialogue of two lovers',
              '"Die Mainacht" (Op. 43 No. 2): a slow, lonely night in May',
              '"Wie bist du, meine Königin" (Op. 32 No. 9): a rapturous love song',
              'Open the interactive scores and follow the voice and piano']},
          {'kind': 'bullets', 'title': 'Legacy', 'bullets': [
              'Dvořák owed his first breakthrough to Brahms - see the course on Dvořák',
              'Schoenberg admired his techniques of developing a melody',
              'His symphonies and concertos are at the heart of the orchestral repertoire',
              'A friend of Johann Strauss II, he wrote on the fan of Strauss\'s wife Adele the "Blue Danube" theme: "Unfortunately not by Johannes Brahms"']},
        ],
        'library': [('cmuyfx7nw003h2eonnbz6isg0', '"Von ewiger Liebe", Op. 43 - interactive score'), ('cmuyfx7nw003i2eonp5lv7at1', '"Die Mainacht", Op. 43 - interactive score'), ('cmuyfx7rf005t2eonamwbfokb', '"Wie bist du, meine Königin", Op. 32 - interactive score')],
      },
      {
        'title': 'Final review and quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Congratulations - you have reached the end of the course! One last recap and a final quiz across all four weeks.",
        'slides': [
          {'kind': 'timeline', 'title': 'Brahms\'s life at a glance', 'rows': [
              ('1833', 'Born in Hamburg on 7 May'),
              ('1853', 'Joachim, Liszt and the Schumanns; "New Paths"'),
              ('1862', 'First visit to Vienna, soon his home'),
              ('1868', '"A German Requiem"; the Lullaby'),
              ('1876', 'Symphony No. 1'),
              ('1885', 'Symphony No. 4'),
              ('1897', 'Dies in Vienna on 3 April')]},
        ],
        'quiz': [
          ('Which old Baroque form ends the Fourth Symphony?', ['A fugue', 'A passacaglia - variations over a repeated theme', 'A minuet', 'A toccata'], 1),
          ('For which instrument did Brahms write his late chamber works for Mühlfeld?', ['Flute', 'Clarinet', 'Horn', 'Oboe'], 1),
          ('Which piano pieces are dedicated to Clara Schumann?', ['The Hungarian Dances', 'The six pieces Op. 118', 'The Waltzes Op. 39', 'The Ballades Op. 10'], 1),
          ('What did Brahms write as Clara Schumann was dying?', ['A German Requiem', 'The Four Serious Songs', 'The Lullaby', 'Symphony No. 4'], 1),
          ('Where is Brahms buried?', ['In Hamburg', 'In Vienna, near Beethoven and Schubert', 'In Bonn, beside the Schumanns', 'In Leipzig'], 1),
          ('Whose famous waltz did Brahms wish he had written?', ['Chopin\'s Minute Waltz', 'Johann Strauss\'s "Blue Danube"', 'Tchaikovsky\'s Waltz of the Flowers', 'Schubert\'s Ländler'], 1),
        ],
      },
    ],
  },
]
