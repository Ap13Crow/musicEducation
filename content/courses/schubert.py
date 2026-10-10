# Franz Schubert - a 4-week first-level introduction. Content for the seed
# (render_slides.py -> PNG slides, seed.mjs -> database).
SITE = 'https://mymusic.coach'
SONATA_D958 = f'{SITE}/api/library/items/cmuygtj2n00le4kktmlgfxzji/files/0.audio'

COURSE = {
    'slug': 'schubert-life-and-songs-introduction',
    'title': 'Franz Schubert: Life and Songs - A First Introduction',
    'shortSummary': 'Four weeks with Franz Schubert: the schoolmaster\'s son from Vienna who wrote over 600 songs, the "Trout" and "Winterreise" - and died at only 31.',
    'description': (
        "Franz Schubert (1797-1828) lived only 31 years, almost all of them in Vienna. He never had a steady job, rarely performed in public "
        "and published only a small part of his music in his lifetime. Yet he wrote more than 600 songs, wonderful piano music, "
        "symphonies and chamber music - and changed what a song could be.\n\n"
        "In four weeks you follow his life step by step:\n"
        "- Week 1 - A Viennese childhood (1797-1814)\n"
        "- Week 2 - The song miracle: \"Gretchen am Spinnrade\" and \"Erlkönig\" (1814-1815)\n"
        "- Week 3 - Friends, Schubertiades and the \"Trout\" (1816-1824)\n"
        "- Week 4 - \"Winterreise\" and the last years (1825-1828)\n\n"
        "Every week combines illustrated slides, videos, recordings and interactive scores from the mymusic.coach Library, "
        "followed by a short quiz. No previous knowledge is needed. Plan about 1-2 hours per week."
    ),
    'level': 'BEGINNER',
    'instruments': ['Voice', 'Piano'],
    'musicStyles': ['Romantic', 'Classical'],
    'cover': {'image': 'schubert_rieder', 'title': 'Schubert', 'subtitle': 'Life and Songs - A First Introduction', 'tag': '4-week course'},
}

FOOTER = 'Franz Schubert: Life and Songs'

WEEKS = [
  {
    'title': 'Week 1 - A Viennese Childhood (1797-1814)',
    'lessons': [
      {
        'title': 'Welcome: meet Franz Schubert',
        'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': (
            "Welcome to the course! In this first lesson you meet Franz Schubert and get an overview of the next four weeks.\n\n"
            "Tip: most songs in this course are in the mymusic.coach Library as interactive scores - you can read along while they play, "
            "star them as favourites and earn extra XP for reading them to the end."
        ),
        'slides': [
          {'kind': 'title', 'week': 'Week 1', 'title': 'Meet Franz Schubert', 'subtitle': 'A first introduction to his life and songs', 'image': 'schubert_rieder', 'credit': 'Portrait by Wilhelm August Rieder, 1875, after his watercolour of 1825 (public domain)'},
          {'kind': 'bullets', 'title': 'Why Schubert?', 'bullets': [
              'Born in Vienna in 1797 - died there in 1828, only 31 years old',
              'Wrote more than 600 songs (Lieder) for voice and piano',
              'Made the piano an equal partner of the singer',
              'Also wrote symphonies, chamber music and piano pieces that are loved worldwide',
              'Most of his music became famous only after his death']},
          {'kind': 'timeline', 'title': 'Your four weeks', 'rows': [
              ('Week 1', 'A Viennese childhood (1797-1814)'),
              ('Week 2', 'The song miracle: "Gretchen" and "Erlkönig"'),
              ('Week 3', 'Friends, Schubertiades and the "Trout"'),
              ('Week 4', '"Winterreise" and the last years (1825-1828)')]},
          {'kind': 'bullets', 'title': 'What is a Lied?', 'bullets': [
              '"Lied" (plural "Lieder") is German for "song"',
              'A poem set to music for one singer and piano',
              'Schubert chose poems by Goethe, Schiller, Müller and his own friends',
              'In his songs the piano paints the scene: a spinning wheel, a galloping horse, a stream']},
          {'kind': 'quote', 'quote': 'When I wished to sing of love, it turned to pain. And when I wanted to sing of pain, it turned to love.', 'by': 'Franz Schubert, "My Dream", 1822'},
        ],
      },
      {
        'title': 'Growing up in Vienna',
        'type': 'SLIDES', 'minutes': 15,
        'description': "A schoolmaster's son, a family string quartet and a choirboy at the imperial court: these slides tell the story of Schubert's first 17 years.",
        'slides': [
          {'kind': 'bullets', 'title': 'Vienna, 31 January 1797', 'bullets': [
              'Born in the suburb of Himmelpfortgrund, just outside the old city of Vienna',
              'His father Franz Theodor ran a small school; his mother Elisabeth had been a cook',
              'He was one of fourteen children - only five survived childhood',
              'Music was part of everyday life at home']},
          {'kind': 'bullets', 'title': 'A musical family', 'bullets': [
              'His father taught him the violin, his brother Ignaz the piano',
              'The family played string quartets together - Franz played the viola',
              'The local church choirmaster Michael Holzer said: "Whenever I wanted to teach him something new, he already knew it"']},
          {'kind': 'timeline', 'title': 'A choirboy at the imperial court', 'rows': [
              ('1808', 'Wins a place as a choirboy in the imperial court chapel - and a free school place at the Stadtkonvikt'),
              ('1808-1812', 'Plays violin in the school orchestra: symphonies by Haydn, Mozart and Beethoven'),
              ('from 1812', 'Lessons in composition with the court composer Antonio Salieri'),
              ('1812', 'His voice breaks - his time as a choirboy ends'),
              ('1814', 'Trains as a teacher and helps at his father\'s school')]},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Born 31 January 1797 in Vienna, son of a schoolmaster',
              'Violin, piano and viola at home - a family string quartet',
              'Choirboy and pupil at the Stadtkonvikt from 1808',
              'Composition lessons with Antonio Salieri',
              '1814: assistant teacher - but his heart belonged to music']},
        ],
      },
      {
        'title': 'Watch: Schubert\'s life and places',
        'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=Zi7qHY-TkvY',
        'description': (
            "This documentary visits the places where Schubert lived and worked and introduces the people who mattered most to him.\n\n"
            "While you watch, look out for:\n"
            "1. Where in Vienna was Schubert born?\n"
            "2. Who were his most important friends?\n"
            "3. How many times did Schubert move house - and why?\n\n"
            "Don't worry about remembering everything - each part of the story comes back in the next weeks."
        ),
      },
      {
        'title': 'Week 1 review and quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "A short recap of week 1, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 1 in a nutshell', 'bullets': [
              'Born in Vienna on 31 January 1797',
              'Son of a schoolmaster - one of five surviving children',
              'Family string quartet: Franz on the viola',
              '1808: choirboy at the imperial court chapel',
              'Lessons with Antonio Salieri']},
          {'kind': 'bullets', 'title': 'Listen this week', 'bullets': [
              'Open "Heidenröslein" in the Library: a simple, folk-like song Schubert wrote at 18',
              'Notice how short it is - and how the same music returns for every verse']},
        ],
        'library': [('cmuyfx8r900w92eon5eyc7x6t', 'A first song to explore: simple, short and famous'), ('cmv2iotfk002c12ifqkn9m9ge', 'Historic recording: Fritz Kreisler plays Schubert\'s Rosamunde ballet music (1917)')],
        'quiz': [
          ('In which city was Franz Schubert born?', ['Salzburg', 'Vienna', 'Graz', 'Munich'], 1),
          ('What was his father\'s job?', ['Court musician', 'Schoolmaster', 'Piano maker', 'Priest'], 1),
          ('Which instrument did Schubert play in the family string quartet?', ['Cello', 'Viola', 'Flute', 'Double bass'], 1),
          ('Where did Schubert sing as a boy?', ['In the imperial court chapel', 'At St. Thomas Church in Leipzig', 'At the opera', 'In a monastery in Salzburg'], 0),
          ('Which famous court composer taught Schubert composition?', ['Joseph Haydn', 'Ludwig van Beethoven', 'Antonio Salieri', 'Carl Czerny'], 2),
        ],
      },
    ],
  },
  {
    'title': 'Week 2 - The Song Miracle (1814-1815)',
    'lessons': [
      {
        'title': '"Gretchen am Spinnrade": a masterpiece at 17',
        'type': 'SLIDES', 'minutes': 15,
        'description': "On 19 October 1814 the 17-year-old Schubert wrote a song that many call the birth of the German Lied. Read along with the interactive score from the Library.",
        'slides': [
          {'kind': 'title', 'week': 'Week 2', 'title': 'The song miracle', 'subtitle': '1814 - 1815', 'image': 'schubert_klimt', 'credit': 'Gustav Klimt, "Schubert at the Piano", 1899 (public domain)'},
          {'kind': 'bullets', 'title': 'Gretchen at the spinning wheel', 'bullets': [
              'Words from Goethe\'s play "Faust": young Gretchen thinks of Faust, whom she loves',
              '"Meine Ruh\' ist hin, mein Herz ist schwer" - "My peace is gone, my heart is heavy"',
              'Schubert wrote it on 19 October 1814 - he was 17 years old',
              'Many historians call this day the birthday of the German Lied']},
          {'kind': 'listen', 'title': 'Listen for the spinning wheel', 'work': 'Gretchen am Spinnrade, D 118', 'points': [
              'The right hand of the piano turns and turns - the spinning wheel',
              'The left hand repeats a steady pattern - the treadle under Gretchen\'s foot',
              'At "sein Kuss!" (his kiss) the music stops - the wheel stands still',
              'Slowly, unevenly, the wheel starts again ...']},
          {'kind': 'summary', 'title': 'Why it matters', 'bullets': [
              'The piano does not just accompany - it tells part of the story',
              'One musical idea (the wheel) holds the whole song together',
              'Open the interactive score in the Library and watch the spinning figure in the piano part']},
        ],
        'library': [('cmuyfx8tx00xw2eonufiq20fa', 'Interactive score - watch the spinning wheel in the piano part')],
      },
      {
        'title': '"Erlkönig": four voices, one singer',
        'type': 'SLIDES', 'minutes': 15,
        'description': "A father rides through the night with his sick child, and the Erl-King calls the boy. Schubert turned Goethe's ballad into a three-minute drama - for one singer and piano.",
        'slides': [
          {'kind': 'bullets', 'title': 'The story', 'bullets': [
              'A father gallops through a dark, windy night, holding his son',
              'The boy sees the Erl-King, a spirit who tempts him with games and gifts',
              'The father tries to calm him: "It is only mist ... the wind in the leaves"',
              'When they arrive home, the child is dead']},
          {'kind': 'bullets', 'title': 'One singer - four characters', 'bullets': [
              'The narrator: in the middle of the voice, calm and serious',
              'The father: low and steady',
              'The son: high and more and more frightened',
              'The Erl-King: sweet and friendly - in a major key']},
          {'kind': 'listen', 'title': 'Listening guide', 'work': 'Erlkönig, D 328', 'points': [
              'Fast repeated octaves in the piano - the galloping horse (and a challenge for every pianist!)',
              'A growling figure in the bass - the wind and the dark forest',
              'The boy\'s cry "Mein Vater, mein Vater!" rises higher each time',
              'The gallop stops - and the last words are spoken almost without music: "war tot" (was dead)']},
          {'kind': 'timeline', 'title': 'From student work to Opus 1', 'rows': [
              ('1815', 'Schubert writes "Erlkönig" - he is 18'),
              ('1815', 'In this single year he writes about 140 songs'),
              ('7 March 1821', 'The baritone Johann Michael Vogl sings it in a public concert in Vienna - a sensation'),
              ('April 1821', 'Friends pay to publish it: "Erlkönig" becomes Schubert\'s Opus 1')]},
        ],
        'library': [('cmuyfx8tt00xu2eon15eoa2sb', 'Interactive score - follow the four characters'), ('cmuygwa5m02as4kktbztoivs2', 'The printed score (PDF)'), ('cmv2j2nc000ri12iflfzaiwgz', 'Historic recording: Robert Leonhardt sings "Erlkönig" (1921)')],
      },
      {
        'title': 'Watch: "Erlkönig" animated',
        'type': 'YOUTUBE', 'minutes': 8, 'video': 'https://www.youtube.com/watch?v=sElBd0Wv1L8',
        'description': (
            "An animated film of Schubert's \"Erlkönig\". Watch it twice:\n\n"
            "1. The first time, just enjoy the story.\n"
            "2. The second time, listen only to the piano: when does the galloping stop? What happens in the music when the Erl-King speaks?\n\n"
            "Then open the score from the Library in the previous lesson and find the place where the music almost stops."
        ),
      },
      {
        'title': 'Week 2 review and quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the song miracle, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 2 in a nutshell', 'bullets': [
              '19 October 1814: "Gretchen am Spinnrade" - the piano becomes the spinning wheel',
              '1815: about 140 songs in a single year',
              '"Erlkönig": one singer, four characters, a galloping piano',
              '1821: "Erlkönig" published as Opus 1, paid for by friends']},
        ],
        'quiz': [
          ('From which work by Goethe does the text of "Gretchen am Spinnrade" come?', ['Faust', 'Werther', 'Egmont', 'Wilhelm Meister'], 0),
          ('How old was Schubert when he wrote "Gretchen am Spinnrade"?', ['12', '17', '25', '31'], 1),
          ('What does the piano imitate in "Gretchen am Spinnrade"?', ['A storm', 'A spinning wheel', 'Church bells', 'A horse'], 1),
          ('How many characters does the singer portray in "Erlkönig"?', ['One', 'Two', 'Four', 'Six'], 2),
          ('How does "Erlkönig" end?', ['With a wedding', 'The child is dead', 'The Erl-King disappears', 'The father finds help'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 3 - Friends, Schubertiades and the "Trout" (1816-1824)',
    'lessons': [
      {
        'title': 'Schubert and his friends',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Schubert never had a steady job. A circle of loyal friends gave him rooms, money, poems - and an audience: the Schubertiades.",
        'slides': [
          {'kind': 'title', 'week': 'Week 3', 'title': 'Friends and Schubertiades', 'subtitle': '1816 - 1824', 'image': 'schubertiade', 'credit': 'Julius Schmid, "Schubertiade", 1897 (public domain)'},
          {'kind': 'bullets', 'title': 'A circle of friends', 'bullets': [
              'Joseph von Spaun - school friend who brought his songs to Goethe',
              'Franz von Schober - gave Schubert a room and wrote poems for him',
              'Johann Mayrhofer - poet; Schubert set nearly fifty of his poems',
              'Johann Michael Vogl - a famous opera baritone who sang Schubert\'s songs everywhere',
              'Painters such as Moritz von Schwind and Leopold Kupelwieser']},
          {'kind': 'bullets', 'title': 'What was a Schubertiade?', 'bullets': [
              'An evening in a friend\'s home devoted to Schubert\'s music',
              'Songs, piano duets, dances - often with Schubert at the piano',
              'Poetry readings, games, wine and long conversations',
              'His friends called him "Schwammerl" - little mushroom - because he was short and round']},
          {'kind': 'timeline', 'title': 'Years of freedom - and worry', 'rows': [
              ('1818', 'Gives up teaching; summer as music teacher to the Esterházy family in Zseliz'),
              ('1819', 'Travels to Upper Austria with Vogl; writes the "Trout" Quintet'),
              ('1822', 'Symphony in B minor - the "Unfinished"'),
              ('late 1822', 'Falls seriously ill - his health never fully recovers'),
              ('1823', 'The song cycle "Die schöne Müllerin"')]},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Friends gave Schubert rooms, money, poems and an audience',
              'Schubertiades: musical evenings at home',
              'From 1818 he lived as a freelance composer',
              'The "Unfinished" Symphony has only two movements - nobody knows exactly why']},
        ],
              'library': [('cmv2iy5yt00im12ifkvh31t43', 'Historic recording: the "Unfinished" Symphony, Philadelphia Orchestra under Leopold Stokowski (1924)'), ('cmv2iumnh00bm12ifzo8xv1z2', 'Historic recording: "Moment Musical", Philadelphia Orchestra (1922)')],
      },
      {
        'title': 'Watch: Schubert\'s friends and poets',
        'type': 'YOUTUBE', 'minutes': 60, 'video': 'https://www.youtube.com/watch?v=wyxnjA1Xyng',
        'description': (
            "The pianist Graham Johnson, one of the world's great experts on Schubert's songs, tells the story of the years 1816-1820 "
            "- when Schubert lived with the poet Johann Mayrhofer - with singers performing the songs at Wigmore Hall, London.\n\n"
            "This is a long video: watch it in parts if you like. Listen for:\n"
            "1. How Mayrhofer's dark poems differ from Goethe's\n"
            "2. How Schubert's piano writing describes nature - water, wind, night\n"
            "3. Songs you already know from this course"
        ),
      },
      {
        'title': 'Listen: "Die Forelle" and the "Trout" Quintet',
        'type': 'YOUTUBE', 'minutes': 40, 'video': 'https://www.youtube.com/watch?v=J_nKAXM9CY8',
        'description': (
            "In 1817 Schubert wrote the song \"Die Forelle\" (The Trout): a fisherman muddies the clear water to catch a lively trout. "
            "Two years later, a music lover in the town of Steyr asked for a piano quintet - with variations on that song. "
            "The result is the \"Trout\" Quintet, D 667, for piano, violin, viola, cello and double bass.\n\n"
            "Here the Schubert Ensemble plays the complete quintet live at Wigmore Hall.\n\n"
            "Listen for:\n"
            "1. The rippling piano figures - water again!\n"
            "2. In the fourth movement: the song melody, then variations - each instrument gets a turn\n"
            "3. The double bass - unusual in a quintet - gives the sound its warm, deep floor\n\n"
            "First read the song itself in the Library: the piano's leaping figure is the trout darting through the water."
        ),
        'library': [('cmuyfx8tu00xv2eonaugi8dph', 'The song "Die Forelle" - interactive score')],
      },
      {
        'title': 'Week 3 review and quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the freelance years, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 3 in a nutshell', 'bullets': [
              'Friends: Spaun, Schober, Mayrhofer, the singer Vogl',
              'Schubertiades - music, poetry and friendship at home',
              '1818: Schubert gives up teaching for good',
              '1819: the "Trout" Quintet, with variations on his song',
              '1822: the "Unfinished" Symphony - and a serious illness']},
        ],
        'quiz': [
          ('What was a "Schubertiade"?', ['A music festival in Salzburg', 'An evening with Schubert\'s music at a friend\'s home', 'A church service', 'A type of dance'], 1),
          ('Which singer made Schubert\'s songs known?', ['Johann Michael Vogl', 'Caroline Unger', 'Jenny Lind', 'Franz Liszt'], 0),
          ('On which song are the variations in the "Trout" Quintet based?', ['Erlkönig', 'Die Forelle', 'Heidenröslein', 'Ave Maria'], 1),
          ('Which instrument makes the "Trout" Quintet unusual?', ['Flute', 'Double bass', 'Harp', 'Clarinet'], 1),
          ('What is special about the "Unfinished" Symphony?', ['It has no slow movement', 'It has only two movements', 'It was written for choir', 'It was never performed'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 4 - "Winterreise" and the Last Years (1825-1828)',
    'lessons': [
      {
        'title': '"Winterreise": a journey through winter',
        'type': 'SLIDES', 'minutes': 15,
        'description': "In 1827 Schubert wrote 24 songs about a lonely traveller in winter. His friends were shocked by how dark they were - today \"Winterreise\" is one of the greatest works in all of music.",
        'slides': [
          {'kind': 'title', 'week': 'Week 4', 'title': 'Winterreise and the last years', 'subtitle': '1825 - 1828', 'image': 'schubert_rieder', 'credit': 'Portrait by Wilhelm August Rieder, 1875, after his watercolour of 1825 (public domain)'},
          {'kind': 'bullets', 'title': 'A song cycle', 'bullets': [
              '24 songs on poems by Wilhelm Müller, written in 1827',
              'A young man, rejected in love, leaves town on a winter night',
              'He wanders through snow and ice: a linden tree, a frozen river, a crow, a signpost',
              'There is no happy ending - the last song meets a poor hurdy-gurdy man']},
          {'kind': 'listen', 'title': 'Three songs to discover', 'work': 'Winterreise, D 911', 'points': [
              'No. 1 "Gute Nacht" - steady walking steps in the piano: the journey begins',
              'No. 5 "Der Lindenbaum" - the rustling leaves of a linden tree, a melody almost like a folk song',
              'No. 24 "Der Leiermann" - an empty, repeating drone: the hurdy-gurdy man in the cold']},
          {'kind': 'quote', 'quote': 'I will sing you a cycle of terrifying songs. They have affected me more than has been the case with any other songs.', 'by': 'Schubert to his friends, as remembered by Joseph von Spaun'},
          {'kind': 'summary', 'title': 'Try it yourself', 'bullets': [
              'Open "Gute Nacht" and "Der Lindenbaum" in the Library and read along',
              'Count the steady quavers in "Gute Nacht" - the walking never stops',
              'In "Der Leiermann", look at the bass: the same two notes over and over']},
        ],
        'library': [('cmuyfx8ri00x22eonjl2tvyhp', 'No. 1 "Gute Nacht" - the journey begins'), ('cmuyfx8rj00x62eonfpjqbi34', 'No. 5 "Der Lindenbaum"'), ('cmuyfx8tq00xn2eonv1bdee2j', 'No. 24 "Der Leiermann" - the last song')],
      },
      {
        'title': 'Watch: "Winterreise" live',
        'type': 'YOUTUBE', 'minutes': 75, 'video': 'https://www.youtube.com/watch?v=tnuvs2w7ges',
        'description': (
            "The tenor Ian Bostridge - who also wrote a whole book about \"Winterreise\" - performs the complete cycle live.\n\n"
            "You don't have to watch all 24 songs at once. Start with the first song (\"Gute Nacht\"), then jump to "
            "\"Der Lindenbaum\" (No. 5) and finish with the last song, \"Der Leiermann\".\n\n"
            "Listen for: how the singer changes colour - warm memories in major keys, cold reality in minor keys."
        ),
      },
      {
        'title': '1828: the final year',
        'type': 'AUDIO', 'minutes': 15, 'video': SONATA_D958,
        'description': (
            "Schubert's last year was astonishingly productive. On 26 March 1828 - exactly one year after Beethoven's death - he gave the only "
            "public concert of his own music in his lifetime; it was a success. In the following months he wrote the great C major String Quintet, "
            "the songs later published as \"Schwanengesang\" (Swan Song), and three large piano sonatas.\n\n"
            "Schubert died on 19 November 1828, only 31 years old. At his own wish he was buried near Beethoven. "
            "His friend, the poet Franz Grillparzer, wrote the epitaph: \"The art of music here entombed a rich possession, but even far fairer hopes.\"\n\n"
            "Here you hear the first movement (Allegro) of the Piano Sonata in C minor, D 958 - one of those last three sonatas - played by Paul Pitman "
            "(Musopen, public domain). Listen for the stormy opening - Schubert was thinking of Beethoven - and the gentle second theme that answers it."
        ),
        'library': [('cmuygtj2n00le4kktmlgfxzji', 'The complete Sonata in C minor, D 958'), ('cmuyfx8re00wr2eonxcjach5b', '"Ständchen" from Schwanengesang - interactive score'), ('cmv2iprf6002y12if6z3yxwje', 'Sergei Rachmaninoff plays his own piano arrangement of a Schubert song (1925)'), ('cmv2iogtd001q12ifdoqiegny', 'Jascha Heifetz plays Schubert\'s "Ave Maria" (1924)')],
      },
      {
        'title': 'Final review and quiz',
        'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Congratulations - you have reached the end of the course! One last recap and a final quiz across all four weeks.",
        'slides': [
          {'kind': 'timeline', 'title': 'Schubert\'s life at a glance', 'rows': [
              ('1797', 'Born in Vienna on 31 January'),
              ('1808', 'Choirboy at the imperial court chapel'),
              ('1814', '"Gretchen am Spinnrade"'),
              ('1815', '"Erlkönig" - about 140 songs in one year'),
              ('1819', 'The "Trout" Quintet'),
              ('1827', '"Winterreise" - torchbearer at Beethoven\'s funeral'),
              ('1828', 'Dies in Vienna on 19 November, aged 31')]},
          {'kind': 'bullets', 'title': 'Where to go next', 'bullets': [
              'Explore more than 150 Schubert scores and recordings in the mymusic.coach Library',
              'Continue with "Beethoven: Life and Music" - the composer Schubert admired most',
              'Singers and pianists: ask your teacher about a first Schubert song - "Heidenröslein" is a good start']},
        ],
        'quiz': [
          ('How many songs did Schubert write?', ['About 60', 'About 200', 'More than 600', 'Exactly 24'], 2),
          ('Who wrote the poems of "Winterreise"?', ['Goethe', 'Wilhelm Müller', 'Schiller', 'Heine'], 1),
          ('How many songs are there in "Winterreise"?', ['12', '20', '24', '30'], 2),
          ('What did Schubert do at Beethoven\'s funeral in 1827?', ['He conducted the orchestra', 'He carried a torch', 'He gave a speech', 'He did not attend'], 1),
          ('How old was Schubert when he died?', ['31', '45', '56', '27'], 0),
          ('What happened on 26 March 1828?', ['Schubert\'s only public concert of his own music', 'The premiere of "Erlkönig"', 'Schubert\'s wedding', 'The publication of "Winterreise"'], 0),
        ],
      },
    ],
  },
]
