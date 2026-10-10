# Antonín Dvořák - a 4-week first-level introduction.
COURSE = {
    'slug': 'dvorak-life-and-music-introduction',
    'title': 'Antonín Dvořák: Life and Music - A First Introduction',
    'shortSummary': 'Four weeks with Antonín Dvořák: a village butcher\'s son who became the voice of Czech music - Slavonic Dances, the "New World" Symphony, the "American" Quartet and Rusalka.',
    'description': (
        "Antonín Dvořák (1841-1904) grew up in a Bohemian village inn, played the viola in a Prague theatre orchestra for nine years - and became "
        "one of the most loved composers in the world, celebrated in London and New York.\n\n"
        "In four weeks you follow his life step by step:\n"
        "- Week 1 - From the village to Prague (1841-1873)\n"
        "- Week 2 - Brahms, the Slavonic Dances and fame (1874-1884)\n"
        "- Week 3 - The New World (1884-1895)\n"
        "- Week 4 - Home again: Humoresque, Rusalka and legacy (1895-1904)\n\n"
        "Every week combines illustrated slides, performances by the Berlin Philharmonic and the Pavel Haas Quartet, historic records by Fritz "
        "Kreisler and the Flonzaley Quartet from the mymusic.coach Library, scores, and a short quiz. No previous knowledge is needed. Plan about 1-2 hours per week."
    ),
    'level': 'BEGINNER',
    'instruments': ['Violin', 'Viola', 'Cello', 'Piano'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'dvorak_portrait', 'title': 'Dvořák', 'subtitle': 'Life and Music - A First Introduction', 'tag': '4-week course'},
}
FOOTER = 'Antonín Dvořák: Life and Music'
PORTRAIT = {'image': 'dvorak_portrait', 'credit': 'Antonín Dvořák, photograph, 1882 (public domain)'}
SLAVONIC = 'cmv2ixgfj00go12if8myhxypi'
QUARTET10 = 'cmuygtj1p00jo4kkty6s5jmia'
AMERICAN = 'cmuygtj1q00jq4kktrtycsxum'
HUMORESQUE = 'cmv2irtks007212ifp9xj9u4x'
MOTHER = 'cmv2j3jon00tq12ifnjkgcgxn'

WEEKS = [
  {
    'title': 'Week 1 - From the Village to Prague (1841-1873)',
    'lessons': [
      {
        'title': 'Welcome: meet Antonín Dvořák', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Welcome to the course! Meet Antonín Dvořák - and see how the next four weeks work.\n\nTip: all music mentioned in this course is linked from the lessons - open the recordings and scores in the Library and earn extra XP for listening or reading to the end.",
        'slides': [
          {'kind': 'title', 'week': 'Week 1', 'title': 'Meet Antonín Dvořák', 'subtitle': 'A first introduction to his life and music', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Why Dvořák?', 'bullets': [
              'Born in a Bohemian village in 1841 - died in Prague in 1904',
              'Nine symphonies - the last one "From the New World"',
              'Slavonic Dances, the Cello Concerto, the "American" Quartet, the opera "Rusalka"',
              'He brought the songs and dances of Bohemia into the concert hall',
              'Say it like this: "DVOR-zhahk" - the "ř" is a special Czech sound']},
          {'kind': 'timeline', 'title': 'Your four weeks', 'rows': [
              ('Week 1', 'From the village to Prague'),
              ('Week 2', 'Brahms, the Slavonic Dances and fame'),
              ('Week 3', 'The New World'),
              ('Week 4', 'Home again: Humoresque, Rusalka and legacy')]},
          {'kind': 'bullets', 'title': 'Bohemia in the 1800s', 'bullets': [
              'Bohemia - today the heart of the Czech Republic - was part of the Austrian Empire',
              'German was the language of government and the educated classes',
              'Czech artists wanted their own language, history and music to be respected',
              'Bedřich Smetana and Dvořák became the musical voices of this movement']},
        ],
      },
      {
        'title': 'A childhood at the village inn', 'type': 'SLIDES', 'minutes': 15,
        'description': "Dvořák was meant to become a butcher, like his father. Music had other plans.",
        'slides': [
          {'kind': 'image', 'title': 'Nelahozeves, 8 September 1841', 'text': 'Antonín was born in this house in a village on the Vltava river, north of Prague. His father František was the village butcher and innkeeper - and played the zither at dances. Antonín was the eldest of fourteen children.', 'image': 'dvorak_birthplace', 'credit': 'Dvořák\'s birthplace in Nelahozeves (photo, public domain)'},
          {'kind': 'bullets', 'title': 'Learning music', 'bullets': [
              'The village schoolmaster taught him violin; he played in the village band and in church',
              'At 12 he was sent to Zlonice to learn German - needed for any career',
              'There the organist Antonín Liehmann taught him organ, viola, piano and music theory',
              'His father still wanted him to take over the butcher\'s shop']},
          {'kind': 'timeline', 'title': 'To Prague', 'rows': [
              ('1857-1859', 'Studies at the Prague Organ School'),
              ('1859', 'Plays viola in Karel Komzák\'s popular dance band'),
              ('1862', 'The band becomes the core of the orchestra of the new Czech Provisional Theatre'),
              ('1866', 'Bedřich Smetana becomes the theatre\'s conductor')]},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Born 8 September 1841 in Nelahozeves, son of a butcher and innkeeper',
              'Learned organ, viola and theory from Antonín Liehmann in Zlonice',
              'Prague Organ School 1857-1859']},
        ],
      },
      {
        'title': 'Listen: the life and music of Dvořák', 'type': 'YOUTUBE', 'minutes': 30, 'video': 'https://www.youtube.com/watch?v=YnVymt9mu8U',
        'description': "An audio documentary by WETA Classical, the public classical radio station of Washington, D.C. It tells Dvořák's story \"from humble beginnings to stardom\" with lots of his music. The whole programme is long - listen to the first half hour now and come back to the rest later in the course.\n\nWhile you listen, look out for:\n1. Who helped Dvořák get his first big publisher?\n2. Why did he go to America?\n3. What did he miss most when he was away from home?",
      },
      {
        'title': 'Nine years in the orchestra - and week 1 quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 20,
        'description': "Dvořák's real school was the orchestra pit. A short recap and five questions.",
        'slides': [
          {'kind': 'bullets', 'title': 'A viola player in the theatre', 'bullets': [
              'From 1862 to 1871 he played viola in the Provisional Theatre orchestra',
              'He learned the operas of Mozart, Rossini, Verdi and Smetana from the inside',
              'In 1863 he played under Richard Wagner, who conducted his own music in Prague',
              'He composed at night - symphonies, quartets, an opera - and burned some of it later']},
          {'kind': 'bullets', 'title': 'First success, 1873', 'bullets': [
              'His patriotic hymn "The Heirs of the White Mountain" was a success in Prague',
              'In 1873 he married Anna Čermáková, a singer; they had nine children',
              'He had left the orchestra in 1871; from 1874 he was organist at St Adalbert\'s Church in Prague',
              'He was 32 - and still almost unknown outside Prague']},
          {'kind': 'summary', 'title': 'Week 1 in a nutshell', 'bullets': [
              'A village childhood in Nelahozeves',
              'Organ School in Prague, then nine years as a theatre viola player',
              'Learned by playing: Mozart, Verdi, Wagner, Smetana',
              '1873: first success, marriage to Anna Čermáková']},
        ],
        'quiz': [
          ('What was the profession of Dvořák\'s father?', ['Organist', 'Butcher and innkeeper', 'Teacher', 'Farmer'], 1),
          ('Why was young Dvořák sent to Zlonice?', ['To learn German', 'To study law', 'To work in a factory', 'To become a priest'], 0),
          ('Which instrument did Dvořák play in the theatre orchestra?', ['Violin', 'Viola', 'Horn', 'Double bass'], 1),
          ('Which famous composer conducted the theatre orchestra from 1866?', ['Brahms', 'Smetana', 'Liszt', 'Janáček'], 1),
          ('Whom did Dvořák marry in 1873?', ['Josefina Čermáková', 'Anna Čermáková', 'Clara Wieck', 'Bertha Faber'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 2 - Brahms, the Slavonic Dances and Fame (1874-1884)',
    'lessons': [
      {
        'title': 'A letter from Brahms', 'type': 'SLIDES', 'minutes': 15,
        'description': "A state grant for poor artists brought Dvořák to the attention of Johannes Brahms - and changed his life.",
        'slides': [
          {'kind': 'title', 'week': 'Week 2', 'title': 'Brahms, the Slavonic Dances and fame', 'subtitle': '1874 - 1884', **PORTRAIT},
          {'kind': 'bullets', 'title': 'The Austrian State Stipendium', 'bullets': [
              'In 1874 Dvořák won a state grant for young, poor artists - and again in later years',
              'On the jury: the critic Eduard Hanslick - and Johannes Brahms',
              'Brahms was deeply impressed by Dvořák\'s "Moravian Duets"',
              'In 1877 he recommended him to his own publisher, Fritz Simrock in Berlin']},
          {'kind': 'bullets', 'title': 'Slavonic Dances, 1878', 'bullets': [
              'Simrock asked for dances like Brahms\'s Hungarian Dances',
              'Dvořák wrote eight Slavonic Dances for piano four hands, then for orchestra',
              'They are based on Czech dance rhythms like the furiant and the polka - but the tunes are his own',
              'A huge success: music shops sold out, and orchestras everywhere played them']},
          {'kind': 'bullets', 'title': 'Stabat Mater', 'bullets': [
              'Between 1875 and 1877 Dvořák and Anna lost three young children',
              'He turned his grief into a large setting of the "Stabat Mater" - Mary at the cross',
              'Its performance in London in 1883 made him famous in England']},
        ],
      },
      {
        'title': 'Listen: a Slavonic Dance', 'type': 'AUDIO', 'minutes': 6, 'libraryAudio': [SLAVONIC, 0],
        'description': "The great violinist Fritz Kreisler loved Dvořák's music and arranged several Slavonic Dances for violin and piano. Here he plays one himself, with Carl Lamson at the piano, on a 78 rpm record from 1917.\n\nListen for:\n1. A melancholy, singing melody - typical of Dvořák's \"Slavonic\" sound\n2. Small slides and ornaments in the violin - like a folk fiddler\n3. How the mood changes from sad to playful\n\nAlso in the Library: two more Slavonic Dances played by Jascha Heifetz in 1922.",
        'library': [(SLAVONIC, 'Slavonic Dance - Fritz Kreisler, violin, 1917'), ('cmv2ixh4q00gq12ifx2upgais', 'Slavonic Dance No. 2 - Jascha Heifetz, 1922'), ('cmv2ixhra00gs12ifluucbdpw', 'Slavonic Dance No. 3 - Jascha Heifetz, 1922')],
      },
      {
        'title': 'Listen: the "Dumka"', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [QUARTET10, 1],
        'description': "After the Slavonic Dances, everyone wanted \"Slavonic\" music from Dvořák. The String Quartet in E-flat major, Op. 51 (1879) was commissioned by the leader of the famous Florentine Quartet - who asked for exactly that.\n\nThe second movement is a \"Dumka\": a Slavic form that switches between a slow, sad lament and a fast, wild dance. Dvořák loved it - later he even wrote a whole piano trio of dumkas, the \"Dumky\" Trio.\n\nListen (Musopen recording, public domain) for:\n1. A melancholy melody over plucked, guitar-like chords\n2. The sudden switch into a quick, happy dance\n3. The return of the sadness\n\nThe score of the quartet is in the Library.",
        'library': [(QUARTET10, 'String Quartet No. 10 in E-flat major, Op. 51 - recording'), ('cmuygtidh00c14kktnzbxdgch', 'String Quartet No. 10 - interactive score')],
      },
      {
        'title': 'Week 2 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the breakthrough years, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 2 in a nutshell', 'bullets': [
              '1874: the Austrian State Stipendium; Brahms on the jury',
              '1877: Brahms recommends him to the publisher Simrock',
              '1878: the Slavonic Dances make him famous',
              'Stabat Mater - music from grief; 1884: first visit to London']},
        ],
        'quiz': [
          ('Which famous composer helped Dvořák find a publisher?', ['Wagner', 'Brahms', 'Liszt', 'Tchaikovsky'], 1),
          ('Which publisher printed the Slavonic Dances?', ['Simrock', 'Breitkopf & Härtel', 'Ricordi', 'Novello'], 0),
          ('Which work were the Slavonic Dances modelled on?', ['Chopin\'s Mazurkas', 'Brahms\'s Hungarian Dances', 'Liszt\'s Hungarian Rhapsodies', 'Strauss\'s Waltzes'], 1),
          ('What is a "dumka"?', ['A Czech polka', 'A Slavic form switching between lament and fast dance', 'A church hymn', 'A kind of bagpipe'], 1),
          ('What inspired Dvořák\'s Stabat Mater?', ['A commission from the Pope', 'The death of three of his children', 'A visit to Rome', 'His wedding'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 3 - The New World (1884-1895)',
    'lessons': [
      {
        'title': 'From London to New York', 'type': 'SLIDES', 'minutes': 15,
        'description': "England welcomed Dvořák like a hero. Then came an offer from America he could not refuse.",
        'slides': [
          {'kind': 'title', 'week': 'Week 3', 'title': 'The New World', 'subtitle': '1884 - 1895', **PORTRAIT},
          {'kind': 'timeline', 'title': 'International fame', 'rows': [
              ('1884', 'Conducts his Stabat Mater in London\'s Royal Albert Hall - the first of nine visits to England'),
              ('1885', 'Symphony No. 7, written for the Philharmonic Society of London'),
              ('1889', 'Symphony No. 8'),
              ('1891', 'Honorary doctorate from Cambridge; professor at the Prague Conservatory; the "Dumky" Trio')]},
          {'kind': 'bullets', 'title': 'An invitation to America', 'bullets': [
              'Jeannette Thurber, founder of the National Conservatory of Music in New York, invited him to be its director',
              'The salary was many times what he earned in Prague',
              'In September 1892 he arrived in New York with his wife and two of their children',
              'The conservatory was open to women and to Black students - unusual at the time']},
          {'kind': 'bullets', 'title': 'Music for America', 'bullets': [
              'His student Harry T. Burleigh sang him African American spirituals',
              'Dvořák told American newspapers that the future music of America should grow from these melodies and from Native American music',
              'Many Americans were surprised - some were angry',
              'Burleigh later became a famous singer and composer of spiritual arrangements']},
        ],
      },
      {
        'title': 'Watch: the "New World" Symphony - Largo', 'type': 'YOUTUBE', 'minutes': 14, 'video': 'https://www.youtube.com/watch?v=acurczH-Yt8',
        'description': "The Symphony No. 9 in E minor, \"From the New World\" was first performed by the New York Philharmonic in Carnegie Hall on 16 December 1893 - a triumph. Here is the slow movement, the Largo, played by the Berlin Philharmonic.\n\nListen for:\n1. Solemn chords in the brass at the start\n2. The famous melody on the cor anglais (English horn) - so much like a spiritual that it later became the song \"Goin' Home\", with words by Dvořák's student William Arms Fisher\n3. A restless middle section - and a moment where themes from the other movements return\n\nWant to hear the whole symphony? The hr-Sinfonieorchester's complete performance is on YouTube: youtube.com/watch?v=jOofzffyDSA",
      },
      {
        'title': 'Spillville and the "American" Quartet', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': ['cmv2iw83r00ei12ifvohs4sv4', 0],
        'description': "In summer 1893 the Dvořák family stayed in Spillville, Iowa - a small village of Czech immigrants. Dvořák played the organ in the church, walked in the woods and listened to the birds. In little more than two weeks in June he wrote the String Quartet in F major, Op. 96 - the \"American\".\n\nHere is the slow movement, the Lento, played by the Flonzaley Quartet - one of the first great string quartets to make records - in 1925.\n\nListen for:\n1. A long, sad melody on the violin, then the cello - homesick, perhaps\n2. Simple, steady accompaniment in the other instruments\n3. Pentatonic (five-note) melodies, as in folk music all over the world\n\nAlso in the Library: the complete quartet (Musopen) and the score.",
        'library': [('cmv2iw83r00ei12ifvohs4sv4', '"American" Quartet: Lento - Flonzaley Quartet, 1925'), (AMERICAN, '"American" Quartet - full recording'), ('cmuygtidi00c34kktknas3av8', '"American" Quartet - interactive score')],
      },
      {
        'title': 'Week 3 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the American years, then five questions. Watch the Pavel Haas Quartet play the whole \"American\" Quartet if you have time: youtube.com/watch?v=cb3jPORwL74",
        'slides': [
          {'kind': 'summary', 'title': 'Week 3 in a nutshell', 'bullets': [
              'Nine visits to England; Symphonies No. 7 and 8',
              '1892-1895: director of the National Conservatory in New York',
              '1893: the "New World" Symphony at Carnegie Hall',
              '1893: the "American" Quartet, written in Spillville, Iowa']},
        ],
        'quiz': [
          ('Who invited Dvořák to New York?', ['Andrew Carnegie', 'Jeannette Thurber', 'Leonard Bernstein', 'Harry T. Burleigh'], 1),
          ('Where was the "New World" Symphony first performed?', ['Royal Albert Hall, London', 'Carnegie Hall, New York', 'Rudolfinum, Prague', 'Musikverein, Vienna'], 1),
          ('Which instrument plays the famous Largo melody?', ['Flute', 'Cor anglais (English horn)', 'Trumpet', 'Violin'], 1),
          ('Where did Dvořák write the "American" Quartet?', ['New York', 'Spillville, Iowa', 'Chicago', 'Prague'], 1),
          ('Which student sang spirituals to Dvořák?', ['William Arms Fisher', 'Harry T. Burleigh', 'Scott Joplin', 'George Gershwin'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 4 - Home Again: Humoresque, Rusalka and Legacy (1895-1904)',
    'lessons': [
      {
        'title': 'Listen: Humoresque', 'type': 'AUDIO', 'minutes': 5, 'libraryAudio': [HUMORESQUE, 0],
        'description': "In summer 1894, on holiday at home in Bohemia, Dvořák wrote eight short piano pieces called Humoresques, Op. 101 - using sketches from his American notebooks. No. 7 in G-flat major became one of the most famous melodies in the world.\n\nHere it is in Fritz Kreisler's version for violin, played by Kreisler himself on a record from 1911.\n\nListen for:\n1. A skipping, dotted rhythm - light and humorous\n2. A sudden turn into a more serious minor key in the middle\n3. Kreisler's famous warm tone and gentle slides\n\nAlso in the Library: Mischa Elman's version from 1919.",
        'library': [(HUMORESQUE, 'Humoresque - Fritz Kreisler, violin, 1911'), ('cmv2irz2c007412ifpn7kiyef', 'Humoresque - Mischa Elman, violin, 1919')],
      },
      {
        'title': 'Home: the Cello Concerto and Rusalka', 'type': 'SLIDES', 'minutes': 15,
        'description': "Dvořák returned to Bohemia in 1895 and never left again. His last years brought a great concerto - and his most popular opera.",
        'slides': [
          {'kind': 'title', 'week': 'Week 4', 'title': 'Home again', 'subtitle': '1895 - 1904', **PORTRAIT},
          {'kind': 'bullets', 'title': 'The Cello Concerto, 1894-1895', 'bullets': [
              'Written in New York in his last American winter',
              'Brahms is said to have exclaimed: "Why on earth didn\'t I know that one could write a cello concerto like this?"',
              'Back home, he rewrote the ending in memory of his sister-in-law Josefina, his first love, who had just died',
              'It is perhaps the most loved of all cello concertos']},
          {'kind': 'bullets', 'title': '"Rusalka", 1901', 'bullets': [
              'A fairy-tale opera: a water nymph falls in love with a prince and gives up her voice to become human',
              'First performed at the National Theatre in Prague on 31 March 1901',
              'Rusalka\'s "Song to the Moon" is one of the best-loved soprano arias',
              'Watch it in the next lesson']},
          {'kind': 'timeline', 'title': 'The last years', 'rows': [
              ('1895', 'Returns to Prague for good'),
              ('1896', 'Last visit to London; symphonic poems on Czech fairy tales'),
              ('1901', '"Rusalka"; director of the Prague Conservatory; 60th birthday celebrated across the nation'),
              ('1 May 1904', 'Dies in Prague, aged 62; buried in the Vyšehrad cemetery')]},
        ],
      },
      {
        'title': 'Watch: the "Song to the Moon"', 'type': 'YOUTUBE', 'minutes': 6, 'video': 'https://www.youtube.com/watch?v=ZAJmU_pmWJk',
        'description': "The Slovak soprano Lucia Popp sings \"Měsíčku na nebi hlubokém\" - \"Moon, high in the deep sky\" - from Act 1 of Rusalka.\n\nRusalka asks the moon to tell the prince that she loves him.\n\nListen for:\n1. Shimmering harp and strings - moonlight on the water\n2. A long, floating melody that rises higher and higher\n3. The Czech language - sung to the shape of the words\n\nTo see the opera on stage, the Royal Opera's trailer for their production is here: youtube.com/watch?v=KJMp4ps_CZ0",
      },
      {
        'title': 'Final review and quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Congratulations - you have reached the end of the course! One last recap, a song to read and a final quiz.",
        'slides': [
          {'kind': 'timeline', 'title': 'Dvořák\'s life at a glance', 'rows': [
              ('1841', 'Born in Nelahozeves on 8 September'),
              ('1862-1871', 'Viola player in the Provisional Theatre orchestra'),
              ('1878', 'Slavonic Dances - international fame'),
              ('1884', 'First visit to England'),
              ('1892-1895', 'Director in New York; "New World" Symphony'),
              ('1901', '"Rusalka"'),
              ('1904', 'Dies in Prague on 1 May')]},
          {'kind': 'listen', 'title': 'Read along: "Songs My Mother Taught Me"', 'work': 'Gypsy Songs, Op. 55 No. 4 (1880)', 'points': [
              'A song about a mother who wept as she sang to her child - and now the child weeps too',
              'One of his most famous melodies',
              'Read the score - then listen to the soprano Geraldine Farrar sing it in 1922']},
        ],
        'library': [('cmuygw9qm021b4kkto9nvmeeq', '"Als die alte Mutter" (Songs My Mother Taught Me) - score'), (MOTHER, '"Songs My Mother Taught Me" - Geraldine Farrar, 1922')],
        'quiz': [
          ('Which piece by Dvořák did Kreisler make famous on the violin?', ['The Cello Concerto', 'Humoresque No. 7', 'The Largo', 'Rusalka'], 1),
          ('What is Rusalka?', ['A Czech dance', 'A water nymph in a fairy-tale opera', 'A village near Prague', 'A string quartet'], 1),
          ('Whom does Rusalka sing to in her famous aria?', ['The sun', 'The moon', 'The river', 'The prince\'s mother'], 1),
          ('Where did Dvořák write his Cello Concerto?', ['Prague', 'New York', 'London', 'Vienna'], 1),
          ('In which year did Dvořák die?', ['1895', '1901', '1904', '1914'], 2),
          ('Where is Dvořák buried?', ['Nelahozeves', 'Vyšehrad cemetery in Prague', 'Vienna Central Cemetery', 'Spillville'], 1),
        ],
      },
    ],
  },
]
