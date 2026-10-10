# Frédéric Chopin - a 4-week first-level introduction.
COURSE = {
    'slug': 'chopin-life-and-music-introduction',
    'title': 'Frédéric Chopin: Life and Music - A First Introduction',
    'shortSummary': 'Four weeks with Frédéric Chopin, the "poet of the piano": from Warsaw to the salons of Paris, George Sand and Nohant - nocturnes, ballades, polonaises and the Preludes.',
    'description': (
        "Frédéric Chopin (1810-1849) wrote almost only for the piano - and changed forever how it sounds. Born near Warsaw, he left Poland at 20 "
        "and never saw it again; in Paris he became the most admired pianist of the salons.\n\n"
        "In four weeks you follow his life step by step:\n"
        "- Week 1 - A Polish childhood: Warsaw (1810-1830)\n"
        "- Week 2 - Paris: the poet of the piano (1831-1837)\n"
        "- Week 3 - George Sand, Majorca and Nohant (1838-1846)\n"
        "- Week 4 - The last years and the legacy (1847-1849)\n\n"
        "Every week combines illustrated slides, a documentary, performances from the International Chopin Competition, recordings and scores "
        "from the mymusic.coach Library, and a short quiz. No previous knowledge is needed. Plan about 1-2 hours per week."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'chopin_delacroix', 'title': 'Chopin', 'subtitle': 'Life and Music - A First Introduction', 'tag': '4-week course'},
}
FOOTER = 'Frédéric Chopin: Life and Music'
PORTRAIT = {'image': 'chopin_delacroix', 'credit': 'Eugène Delacroix, Frédéric Chopin, 1838 (Louvre, public domain)'}
PHOTO = {'image': 'chopin_photo', 'credit': 'Daguerreotype by Louis-Auguste Bisson, 1849 (public domain)'}
NOCTURNE = 'cmuygtjik00sp4kktzi6k3k9h'
BALLADE1 = 'cmuygtj4r00m94kktpave15sk'
RAINDROP = 'cmuygtjtv00ui4kkt1fywy6rm'
REVOLUTIONARY = 'cmuygtj5800nd4kktdeqnhk2o'
HEROIC = 'cmuygtjo200tb4kkteday0mft'
BERCEUSE = 'cmuygtj4t00me4kkt04luo6y0'
FUNERAL = 'cmuygtk7u00vs4kktm0j5t5th'

WEEKS = [
  {
    'title': 'Week 1 - A Polish Childhood: Warsaw (1810-1830)',
    'lessons': [
      {
        'title': 'Welcome: meet Frédéric Chopin', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Welcome to the course! Meet the \"poet of the piano\" - and see how the next four weeks work.\n\nTip: all music mentioned in this course is linked from the lessons - open the recordings and scores in the Library and earn extra XP for listening or reading to the end.",
        'slides': [
          {'kind': 'title', 'week': 'Week 1', 'title': 'Meet Frédéric Chopin', 'subtitle': 'A first introduction to his life and music', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Why Chopin?', 'bullets': [
              'Born near Warsaw in 1810 - died in Paris in 1849, aged 39',
              'Almost every one of his works includes the piano',
              'He created new kinds of piano pieces: the ballade, and his own nocturnes, études and preludes',
              'Polish dances - mazurkas and polonaises - became art music in his hands',
              'Today he is probably the most-played composer by pianists all over the world']},
          {'kind': 'timeline', 'title': 'Your four weeks', 'rows': [
              ('Week 1', 'A Polish childhood: Warsaw'),
              ('Week 2', 'Paris: the poet of the piano'),
              ('Week 3', 'George Sand, Majorca and Nohant'),
              ('Week 4', 'The last years and the legacy')]},
          {'kind': 'bullets', 'title': 'The piano in Chopin\'s time', 'bullets': [
              'Pianos were becoming bigger, louder and richer in sound',
              'Paris was the capital of piano-making: Pleyel and Érard',
              'Chopin loved Pleyel pianos for their soft, singing tone',
              'His secret: making the piano "sing" like an opera voice']},
        ],
      },
      {
        'title': 'A childhood in Warsaw', 'type': 'SLIDES', 'minutes': 15,
        'description': "A French father, a Polish mother, a city full of music: how a boy from Warsaw became a celebrity at the age of eight.",
        'slides': [
          {'kind': 'bullets', 'title': 'Żelazowa Wola, 1810', 'bullets': [
              'Born in the village of Żelazowa Wola, west of Warsaw - on 1 March 1810, the date he and his family celebrated (his baptism record says 22 February)',
              'His father Nicolas Chopin was a Frenchman who taught French in Warsaw',
              'His mother Justyna was Polish and played the piano',
              'A few months later the family moved to Warsaw']},
          {'kind': 'timeline', 'title': 'A child prodigy', 'rows': [
              ('1816', 'Piano lessons with Wojciech Żywny, a Bach and Mozart lover'),
              ('1817', 'Aged 7: his first printed work, a Polonaise in G minor'),
              ('1818', 'First public concert, aged 8 - "a second Mozart", wrote the Warsaw papers'),
              ('1826-1829', 'Studies composition at the Warsaw conservatory with Józef Elsner')]},
          {'kind': 'quote', 'quote': 'Chopin, Fryderyk: outstanding ability, musical genius.', 'by': 'Józef Elsner, in his final report on his student, 1829'},
          {'kind': 'listen', 'title': 'His first published work', 'work': 'Polonaise in G minor (1817) - by a seven-year-old', 'points': [
              'A polonaise is a stately Polish dance in three beats',
              'Simple, but with real character',
              'Open the recording in the Library - and compare it with the "Heroic" Polonaise in week 3']},
        ],
        'library': [('cmuygtjr400u24kkt14g9zilc', 'Polonaise in G minor - written at the age of seven')],
      },
      {
        'title': 'Watch: Chopin - his life, his places and his music', 'type': 'YOUTUBE', 'minutes': 28, 'video': 'https://www.youtube.com/watch?v=n7Pk5uhl4JM',
        'description': "This documentary by opera-inside follows Chopin from Żelazowa Wola and Warsaw to Paris, Majorca and Nohant, with his music all the way.\n\nWhile you watch, look out for:\n1. Why did Chopin leave Poland - and why did he never return?\n2. Who was George Sand?\n3. Where did he write the 24 Preludes?\n\nEverything comes back in the next weeks.",
      },
      {
        'title': 'Leaving Poland - and week 1 quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "In November 1830 Chopin left Warsaw for Vienna. Three weeks later Poland rose against Russia - and he could never go home again.",
        'slides': [
          {'kind': 'bullets', 'title': 'Farewell, Warsaw', 'bullets': [
              '1829: a successful debut in Vienna',
              '1830: his two piano concertos are first performed in Warsaw',
              '2 November 1830: he leaves Poland - friends give him a cup of Polish earth',
              '29 November 1830: the November Uprising against Russian rule begins']},
          {'kind': 'listen', 'title': 'The "Revolutionary" Étude', 'work': 'Étude in C minor, Op. 10 No. 12', 'points': [
              'In September 1831, in Stuttgart, Chopin heard that Warsaw had fallen to the Russian army',
              'His diary from those days is full of despair',
              'According to tradition this étude was his answer: a storm in the left hand, cries in the right',
              'Two and a half minutes of fury - open the recording in the Library']},
          {'kind': 'summary', 'title': 'Week 1 in a nutshell', 'bullets': [
              'Born near Warsaw in 1810; French father, Polish mother',
              'A child star: first published piece at 7, first concert at 8',
              'Studied with Żywny and Elsner',
              '1830: left Poland - never to return']},
        ],
        'library': [(REVOLUTIONARY, '"Revolutionary" Étude, Op. 10 No. 12 - recording'), ('cmuygw9fx01y04kktfxw2tvje', '"Revolutionary" Étude - score')],
        'quiz': [
          ('Where was Chopin born?', ['In Paris', 'In Żelazowa Wola near Warsaw', 'In Kraków', 'In Vienna'], 1),
          ('Where did Chopin\'s father come from?', ['Poland', 'France', 'Germany', 'Russia'], 1),
          ('What was Chopin\'s first printed work, at the age of 7?', ['A nocturne', 'A polonaise', 'A piano concerto', 'A song'], 1),
          ('Which event began shortly after Chopin left Warsaw in 1830?', ['The French Revolution', 'The November Uprising against Russia', 'The Congress of Vienna', 'The Napoleonic Wars'], 1),
          ('Which étude is linked with the fall of Warsaw in 1831?', ['The "Black Keys" Étude', 'The "Revolutionary" Étude', 'The "Butterfly" Étude', 'The "Winter Wind" Étude'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 2 - Paris: the Poet of the Piano (1831-1837)',
    'lessons': [
      {
        'title': 'A Pole in Paris', 'type': 'SLIDES', 'minutes': 15,
        'description': "Paris in the 1830s was full of Polish exiles, great pianists and rich salons. Chopin found his place there quickly.",
        'slides': [
          {'kind': 'title', 'week': 'Week 2', 'title': 'Paris: the poet of the piano', 'subtitle': '1831 - 1837', **PORTRAIT},
          {'kind': 'quote', 'quote': 'Hats off, gentlemen - a genius!', 'by': 'Robert Schumann, reviewing Chopin\'s Variations Op. 2, 1831'},
          {'kind': 'bullets', 'title': 'The salon, not the concert hall', 'bullets': [
              'Autumn 1831: Chopin arrives in Paris; his first Paris concert is in February 1832 at the Salle Pleyel',
              'He disliked big halls and gave only about 30 public concerts in his whole life',
              'He played instead in the salons of aristocrats and bankers - like the Rothschilds',
              'He earned his living by teaching wealthy pupils and selling his music to publishers']},
          {'kind': 'bullets', 'title': 'Friends in Paris', 'bullets': [
              'Franz Liszt, the great virtuoso - a friend and rival',
              'The painter Eugène Delacroix - one of his closest friends',
              'Polish exiles like the poet Adam Mickiewicz',
              'Felix Mendelssohn, Vincenzo Bellini and Hector Berlioz']},
        ],
      },
      {
        'title': 'Listen: the Nocturne in E-flat major', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [NOCTURNE, 0],
        'description': "A nocturne is a \"night piece\": a dreamy, singing melody over a gently rocking accompaniment. The Irish composer John Field invented the name - Chopin made the nocturne famous. He published 21 of them.\n\nThe Nocturne in E-flat major, Op. 9 No. 2 (published 1832) is the most famous of all (Musopen recording, public domain).\n\nListen for:\n1. The left hand: a low bass note, then two chords - like a slow waltz\n2. The right hand sings like an opera singer - Chopin loved Bellini's operas\n3. Each time the melody returns it has more ornaments - small, fast decorations\n\nFollow along in the score, or compare it with the violinist Mischa Elman's version on a 78 rpm record from 1924.",
        'library': [(NOCTURNE, 'Nocturne Op. 9 No. 2 - recording'), ('cmuygw9ik01yx4kkth8o2buwb', 'Nocturne Op. 9 No. 2 - score'), ('cmv2iv6gr00cc12if7rl3la76', 'Nocturne Op. 9 No. 2 for violin - Mischa Elman, 1924')],
      },
      {
        'title': 'Watch: the First Ballade', 'type': 'YOUTUBE', 'minutes': 10, 'video': 'https://www.youtube.com/watch?v=BjZsTeSvwe4',
        'description': "Chopin invented the \"ballade\" for piano: a long, dramatic story told without words. The Ballade No. 1 in G minor, Op. 23 was finished in 1835. Schumann wrote that Chopin told him it was his favourite.\n\nHere it is played by Martín García García at the 18th International Chopin Competition in Warsaw (2021) - the competition, held every five years since 1927, is one of the most important in the world.\n\nListen for:\n1. A slow, questioning introduction\n2. The first theme: a sad, swaying melody in G minor\n3. The second theme: warm and calm - it returns later in full glory\n4. The furious coda at the end\n\nAfterwards, open the score and a full recording in the Library.",
        'library': [('cmuygw9fy01y24kkthv67wxx8', 'First Ballade - score'), (BALLADE1, 'First Ballade - recording')],
      },
      {
        'title': 'Week 2 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the early Paris years, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 2 in a nutshell', 'bullets': [
              '1831: arrives in Paris; Schumann: "Hats off, gentlemen - a genius!"',
              'A salon pianist and teacher rather than a concert virtuoso',
              'Nocturnes: singing "night pieces"',
              'The Ballade: a new kind of dramatic piano piece']},
          {'kind': 'bullets', 'title': 'Read along: the Minute Waltz', 'bullets': [
              'Waltzes were the fashionable dance of Paris',
              'The "Minute Waltz", Op. 64 No. 1, does not last a minute: "minute" means "small"',
              'It is said to show a little dog chasing its tail',
              'Open the score and the recording in the Library']},
        ],
        'library': [('cmuygw9if01yt4kkt2o428xyb', '"Minute Waltz" - score'), ('cmuygtkaq00wv4kktlh1mwpgf', '"Minute Waltz" - recording')],
        'quiz': [
          ('Who wrote "Hats off, gentlemen - a genius!" about Chopin?', ['Liszt', 'Robert Schumann', 'Mendelssohn', 'Berlioz'], 1),
          ('Where did Chopin prefer to play?', ['In big concert halls', 'In private salons', 'In churches', 'In opera houses'], 1),
          ('What is a nocturne?', ['A fast dance', 'A dreamy "night piece"', 'A study for technique', 'A piece for orchestra'], 1),
          ('Which kind of piano piece did Chopin invent?', ['The sonata', 'The ballade', 'The fugue', 'The waltz'], 1),
          ('What does "minute" in "Minute Waltz" mean?', ['It lasts one minute', 'Small', 'Very fast', 'Written in a minute'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 3 - George Sand, Majorca and Nohant (1838-1846)',
    'lessons': [
      {
        'title': 'George Sand and a winter in Majorca', 'type': 'SLIDES', 'minutes': 15,
        'description': "In 1836 Chopin met the novelist George Sand. Their nine years together were the most productive of his life.",
        'slides': [
          {'kind': 'title', 'week': 'Week 3', 'title': 'George Sand, Majorca and Nohant', 'subtitle': '1838 - 1846', **PORTRAIT},
          {'kind': 'image', 'title': 'George Sand', 'text': 'Born Aurore Dupin, she wrote under a man\'s name, sometimes wore men\'s clothes and was one of the most famous writers in France. Liszt introduced her to Chopin in 1836; from 1838 they were a couple.', 'image': 'george_sand', 'credit': 'Eugène Delacroix, George Sand, 1838 (public domain)'},
          {'kind': 'bullets', 'title': 'Majorca, winter 1838-1839', 'bullets': [
              'Sand took Chopin and her two children to Majorca, hoping the sun would help his weak lungs',
              'It rained for weeks; they ended up in an old monastery at Valldemossa',
              'Chopin was very ill - and finished his 24 Preludes there on a small local piano until his Pleyel arrived',
              'Delacroix painted the couple together in 1838 - the painting was later cut in two']},
          {'kind': 'listen', 'title': 'The "Raindrop" Prelude', 'work': 'Prelude in D-flat major, Op. 28 No. 15', 'points': [
              'One repeated note sounds through the whole piece - like rain on the roof',
              'The middle section turns dark and heavy, as in a bad dream',
              'George Sand described Chopin playing in the rain at Valldemossa',
              'The nickname is not by Chopin - open the recording and decide for yourself']},
        ],
        'library': [(RAINDROP, '"Raindrop" Prelude - recording'), ('cmuygw9fy01y54kkt3wpqkzcf', '"Raindrop" Prelude - score'), ('cmuygw9ib01yh4kkte87nhbsf', 'Prelude No. 4 in E minor - score')],
      },
      {
        'title': 'Summers at Nohant', 'type': 'SLIDES', 'minutes': 12,
        'description': "Most summers from 1839 to 1846 Chopin spent at George Sand's country house in Nohant, in the middle of France. There he wrote many of his greatest works.",
        'slides': [
          {'kind': 'bullets', 'title': 'Life at Nohant', 'bullets': [
              'Winters in Paris for teaching and the salons; summers in the country to compose',
              'Guests included Delacroix, Liszt and the singer Pauline Viardot',
              'Chopin worked slowly and painfully, rewriting a page again and again',
              'Sand wrote that he would spend six weeks on a single page']},
          {'kind': 'timeline', 'title': 'Works of the Nohant years', 'rows': [
              ('1839', 'Piano Sonata No. 2 in B-flat minor, with the Funeral March'),
              ('1842', 'Polonaise in A-flat major, Op. 53, "Heroic"; Ballade No. 4'),
              ('1844', 'Berceuse (lullaby) and Piano Sonata No. 3'),
              ('1845-1846', 'Barcarolle and Polonaise-Fantaisie; Cello Sonata')]},
          {'kind': 'listen', 'title': 'Two contrasts', 'work': '"Heroic" Polonaise, Op. 53 - and the Berceuse, Op. 57', 'points': [
              'The "Heroic" Polonaise: proud, brilliant - a symbol of Poland',
              'Listen for the thundering octaves in the left hand in the middle section',
              'The Berceuse: a lullaby over a single rocking bass pattern repeated throughout',
              'Both recordings are in the Library']},
        ],
        'library': [(HEROIC, '"Heroic" Polonaise, Op. 53 - recording'), (BERCEUSE, 'Berceuse, Op. 57 - recording')],
      },
      {
        'title': 'Watch: Andante spianato and Grande Polonaise', 'type': 'YOUTUBE', 'minutes': 15, 'video': 'https://www.youtube.com/watch?v=B4DzzgBxpx4',
        'description': "Bruce (Xiaoyu) Liu plays the Andante spianato and Grande Polonaise brillante, Op. 22 at the 18th International Chopin Competition in 2021 - a competition he went on to win.\n\nChopin wrote the Polonaise in Warsaw and Vienna in 1830-31 for piano and orchestra and added the calm Andante spianato (\"smooth\") in Paris in 1834. It is often played, as here, by piano alone.\n\nListen for:\n1. The smooth, quiet Andante - like water\n2. A fanfare announcing the Polonaise\n3. The sparkling, brilliant style that made Chopin famous as a young virtuoso",
      },
      {
        'title': 'Week 3 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the George Sand years, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 3 in a nutshell', 'bullets': [
              '1836: meets the writer George Sand',
              '1838-1839: a winter in Majorca - the 24 Preludes',
              '1839-1846: summers at Nohant - his most productive years',
              '"Heroic" Polonaise, Berceuse, Barcarolle, Sonatas']},
        ],
        'quiz': [
          ('What was George Sand\'s real name?', ['Pauline Viardot', 'Aurore Dupin', 'Marie d\'Agoult', 'Jane Stirling'], 1),
          ('Where did Chopin finish his 24 Preludes?', ['In Nohant', 'In Majorca', 'In Warsaw', 'In London'], 1),
          ('Which prelude has the nickname "Raindrop"?', ['No. 4 in E minor', 'No. 15 in D-flat major', 'No. 20 in C minor', 'No. 1 in C major'], 1),
          ('Where did Chopin spend his summers from 1839 to 1846?', ['In Majorca', 'At Nohant', 'In Warsaw', 'In Switzerland'], 1),
          ('What is a berceuse?', ['A march', 'A lullaby', 'A dance', 'A study'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 4 - The Last Years and the Legacy (1847-1849)',
    'lessons': [
      {
        'title': 'Parting, Britain and the last concert', 'type': 'SLIDES', 'minutes': 15,
        'description': "In 1847 Chopin and George Sand parted. Ill and almost unable to compose, he made a last long journey.",
        'slides': [
          {'kind': 'title', 'week': 'Week 4', 'title': 'The last years', 'subtitle': '1847 - 1849', **PHOTO},
          {'kind': 'timeline', 'title': 'The last journey', 'rows': [
              ('1847', 'A painful break with George Sand, after quarrels involving her children'),
              ('Feb 1848', 'His last concert in Paris, at the Salle Pleyel'),
              ('1848', 'Seven months in England and Scotland, invited by his pupil Jane Stirling'),
              ('16 Nov 1848', 'His last public performance: a charity concert for Polish refugees in London'),
              ('17 Oct 1849', 'Dies in Paris, aged 39 - probably of tuberculosis')]},
          {'kind': 'bullets', 'title': 'Farewell', 'bullets': [
              'At his funeral in the Madeleine church, Mozart\'s Requiem was sung, as he had wished',
              'He was buried in the Père Lachaise cemetery in Paris',
              'His sister Ludwika took his heart to Warsaw, as he had asked',
              'It rests in a pillar of the Holy Cross Church there']},
          {'kind': 'image', 'title': 'The only photograph', 'text': 'This daguerreotype from 1849, the last year of his life, is one of only two photographs of Chopin. Compare it with Delacroix\'s portrait from 1838.', **PHOTO},
        ],
      },
      {
        'title': 'Listen: the Funeral March', 'type': 'AUDIO', 'minutes': 10, 'libraryAudio': [FUNERAL, 0],
        'description': "The Funeral March was written in 1837 and became the slow movement of the Piano Sonata No. 2 in B-flat minor (1839). It was played at Chopin's own burial - and later at the funerals of statesmen around the world.\n\nListen for (Musopen recording, public domain):\n1. Heavy chords in the left hand, like slow, tolling bells\n2. A gentle, consoling melody in the middle - like a memory\n3. The return of the march\n\nThe full sonata score is in the Library.",
        'library': [(FUNERAL, 'Sonata No. 2: Funeral March - recording'), ('cmuygw9ie01yp4kktflm0uegd', 'Sonata No. 2 - score')],
      },
      {
        'title': 'Chopin today', 'type': 'SLIDES', 'minutes': 12,
        'description': "Why Chopin is still at the centre of piano playing - and of Polish identity.",
        'slides': [
          {'kind': 'bullets', 'title': 'Chopin\'s piano', 'bullets': [
              'Pedalling that blends sounds into a cloud of colour',
              'Rubato: "stolen time" - the melody bends while the accompaniment stays steady',
              'Études that are both exercises and real music',
              'Liszt, Debussy, Rachmaninoff and many others learned from him']},
          {'kind': 'bullets', 'title': 'A Polish symbol', 'bullets': [
              'Mazurkas and polonaises kept Polish music alive while Poland was not a free country',
              'The International Chopin Competition has been held in Warsaw since 1927',
              'Warsaw\'s airport and a music university are named after him',
              'His birthplace in Żelazowa Wola is a museum']},
          {'kind': 'summary', 'title': 'Where to go next', 'bullets': [
              'Explore more than 150 Chopin recordings and scores in the mymusic.coach Library',
              'Pianists: ask your teacher about a Prelude (No. 4, 6 or 7) or a Waltz',
              'Continue with the courses on Felix Mendelssohn, Clara Schumann and Debussy']},
        ],
      },
      {
        'title': 'Final review and quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Congratulations - you have reached the end of the course! One last recap and a final quiz across all four weeks.",
        'slides': [
          {'kind': 'timeline', 'title': 'Chopin\'s life at a glance', 'rows': [
              ('1810', 'Born in Żelazowa Wola near Warsaw'),
              ('1817', 'First printed work, aged 7'),
              ('1830', 'Leaves Poland forever'),
              ('1831', 'Arrives in Paris'),
              ('1838-1839', 'Majorca with George Sand: the 24 Preludes'),
              ('1839-1846', 'Summers at Nohant'),
              ('1849', 'Dies in Paris on 17 October')]},
        ],
        'quiz': [
          ('For which instrument did Chopin write almost all his music?', ['Violin', 'Piano', 'Organ', 'Voice'], 1),
          ('Which two Polish dances did Chopin raise to art music?', ['Waltz and minuet', 'Mazurka and polonaise', 'Polka and galop', 'Tarantella and saltarello'], 1),
          ('What is "rubato"?', ['A kind of piano', 'Flexible, "stolen" time in the melody', 'A fast ending', 'A type of pedal'], 1),
          ('Which music was sung at Chopin\'s funeral?', ['His own Funeral March', 'Mozart\'s Requiem', 'Bach\'s St Matthew Passion', 'Beethoven\'s Ninth'], 1),
          ('Where is Chopin\'s heart kept?', ['In Paris', 'In the Holy Cross Church in Warsaw', 'In Nohant', 'In Majorca'], 1),
          ('Since when has the International Chopin Competition been held?', ['1849', '1900', '1927', '1990'], 2),
        ],
      },
    ],
  },
]
