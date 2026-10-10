# Felix Mendelssohn - a 4-week first-level introduction.
COURSE = {
    'slug': 'felix-mendelssohn-life-and-music-introduction',
    'title': 'Felix Mendelssohn: Life and Music - A First Introduction',
    'shortSummary': 'Four weeks with Felix Mendelssohn: the boy genius of the Octet, the man who brought Bach back to life, the conductor of Leipzig - from Fingal\'s Cave to the Violin Concerto.',
    'description': (
        "Felix Mendelssohn Bartholdy (1809-1847) wrote masterpieces as a teenager, travelled all over Europe, turned the Leipzig Gewandhaus into "
        "one of the best orchestras in the world and revived the music of Bach. He lived only 38 years.\n\n"
        "In four weeks you follow his life step by step:\n"
        "- Week 1 - A Berlin prodigy: Goethe, the Octet and a Midsummer Night's Dream (1809-1826)\n"
        "- Week 2 - Bach reborn and a grand tour: Berlin, Scotland, Italy (1827-1832)\n"
        "- Week 3 - Leipzig: the conductor (1833-1842)\n"
        "- Week 4 - Elijah, the Violin Concerto and a final farewell (1843-1847)\n\n"
        "Every week combines illustrated slides, videos (a documentary, the Gewandhaus Orchestra), recordings and scores from the mymusic.coach "
        "Library - including a 78 rpm record from 1922 - and a short quiz. No previous knowledge is needed. Plan about 1-2 hours per week."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin'],
    'musicStyles': ['Romantic'],
    'cover': {'image': 'felix_portrait', 'title': 'Felix Mendelssohn', 'subtitle': 'Life and Music - A First Introduction', 'tag': '4-week course'},
}
FOOTER = 'Felix Mendelssohn: Life and Music'
PORTRAIT = {'image': 'felix_portrait', 'credit': 'Portrait by Eduard Magnus, 1833 (public domain)'}
HEBRIDES = 'cmuygtj1v00jw4kktiyafru9g'
ITALIAN = 'cmuygtj1x00jy4kktrjjajsc1'
SCOTTISH = 'cmuygtj1y00k04kktq4ubsyp8'
QUARTET6 = 'cmuygtj2j00l34kktdybi56gs'
SPRING_SONG = 'cmv2j38l200sw12if4tl6pbts'

WEEKS = [
  {
    'title': 'Week 1 - A Berlin Prodigy (1809-1826)',
    'lessons': [
      {
        'title': 'Welcome: meet Felix Mendelssohn', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Welcome to the course! Meet Felix Mendelssohn - composer, pianist, conductor, painter and letter writer - and see how the next four weeks work.\n\nTip: all music mentioned in this course is linked from the lessons - open it in the Library, read the scores and earn extra XP for reading or listening to the end.",
        'slides': [
          {'kind': 'title', 'week': 'Week 1', 'title': 'Meet Felix Mendelssohn', 'subtitle': 'A first introduction to his life and music', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Why Mendelssohn?', 'bullets': [
              'Born in Hamburg in 1809 - died in Leipzig in 1847, aged only 38',
              'Wrote masterpieces as a teenager: the Octet at 16, the "Midsummer Night\'s Dream" Overture at 17',
              'Brought Bach\'s St Matthew Passion back to life in 1829',
              'Famous conductor of the Leipzig Gewandhaus Orchestra and founder of the Leipzig Conservatory',
              'Hebrides Overture, "Italian" Symphony, Violin Concerto, the Wedding March']},
          {'kind': 'timeline', 'title': 'Your four weeks', 'rows': [
              ('Week 1', 'A Berlin prodigy: Goethe, the Octet and a Midsummer Night\'s Dream'),
              ('Week 2', 'Bach reborn and a grand tour: Berlin, Scotland, Italy'),
              ('Week 3', 'Leipzig: the conductor'),
              ('Week 4', 'Elijah, the Violin Concerto and a final farewell')]},
          {'kind': 'bullets', 'title': 'Before you start', 'bullets': [
              'Mendelssohn belongs to the early Romantic generation - with Chopin, Schumann and Liszt',
              'He loved clear forms like Mozart - and the colours and moods of Romanticism',
              'His sister Fanny was a great composer too - there is a separate course about her',
              'Painting was his second art: he drew and painted watercolours on all his travels']},
        ],
      },
      {
        'title': 'A gifted family in Berlin', 'type': 'SLIDES', 'minutes': 15,
        'description': "Grandson of a famous philosopher, son of a banker, brother of a brilliant sister: Felix grew up with every advantage - and worked very hard.",
        'slides': [
          {'kind': 'bullets', 'title': 'Hamburg, 3 February 1809', 'bullets': [
              'Second of four children of the banker Abraham Mendelssohn and Lea Salomon',
              'Grandson of the Jewish philosopher Moses Mendelssohn',
              'In 1811 the family moved to Berlin; in 1816 the children were baptised as Lutherans',
              'The family added the name "Bartholdy" - Felix kept "Mendelssohn" as well']},
          {'kind': 'bullets', 'title': 'Lessons from five in the morning', 'bullets': [
              'The children got up at five for lessons: languages, mathematics, drawing, music',
              'Piano with Ludwig Berger, composition with Carl Friedrich Zelter - like his sister Fanny',
              'Between 1821 and 1823 he wrote twelve symphonies for strings as exercises',
              'From 1822 the family held Sunday concerts at home - with a small orchestra to play his new works']},
          {'kind': 'bullets', 'title': 'Twelve years old - with Goethe', 'bullets': [
              'In 1821 Zelter took Felix to Weimar to meet his friend Goethe, then 72',
              'The boy stayed about two weeks and played to Goethe every day',
              'Goethe compared him with the young Mozart - and found Felix even more impressive',
              'They stayed friends until the poet\'s death in 1832']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Born 3 February 1809 in Hamburg, raised in Berlin',
              'Teachers: Ludwig Berger (piano), Carl Friedrich Zelter (composition)',
              '1821: twelve-year-old Felix visits Goethe in Weimar',
              'Twelve string symphonies written as a boy']},
        ],
      },
      {
        'title': 'Watch: Mendelssohn - his life and places', 'type': 'YOUTUBE', 'minutes': 22, 'video': 'https://www.youtube.com/watch?v=3susb6TcHG8',
        'description': "This documentary by opera-inside takes you to the places of Mendelssohn's life - Hamburg, Berlin, Düsseldorf, Leipzig and his travels - with his music all the way.\n\nWhile you watch, look out for:\n1. What did Mendelssohn achieve with Bach's St Matthew Passion?\n2. Which journeys inspired his \"Scottish\" and \"Italian\" symphonies?\n3. Why was Leipzig so important for him?\n\nEverything comes back in the next weeks.",
      },
      {
        'title': 'The Octet and a Midsummer Night\'s Dream', 'type': 'SLIDES', 'minutes': 15, 'xp': 20,
        'description': "Two works by a teenager that are among the miracles of music history - then a quick recap and five questions.",
        'slides': [
          {'kind': 'bullets', 'title': 'The Octet, 1825', 'bullets': [
              'Written in autumn 1825 at the age of 16, as a birthday present for his violin teacher Eduard Rietz',
              'Eight string players: four violins, two violas, two cellos - a "symphony" for chamber group',
              'The light, whispering Scherzo was inspired by the Walpurgis Night scene in Goethe\'s "Faust"',
              'Many musicians consider it a more perfect work than anything Mozart wrote at that age']},
          {'kind': 'bullets', 'title': 'A Midsummer Night\'s Dream, 1826', 'bullets': [
              'At 17, after reading Shakespeare\'s comedy with Fanny, he wrote a concert overture',
              'Four magical wind chords open the door to the fairy world',
              'Listen out for the fairies (fast, quiet violins) and the donkey Bottom (hee-haw in the strings!)',
              '17 years later, in 1842, he wrote more music for the play - including the famous Wedding March']},
          {'kind': 'summary', 'title': 'Week 1 in a nutshell', 'bullets': [
              'Born in Hamburg in 1809, raised in a cultured Berlin family',
              'Taught by Berger and Zelter; visited Goethe at 12',
              '1825: the Octet - aged 16',
              '1826: the "Midsummer Night\'s Dream" Overture - aged 17']},
        ],
        'quiz': [
          ('In which city was Felix Mendelssohn born?', ['Berlin', 'Hamburg', 'Leipzig', 'Vienna'], 1),
          ('Which famous poet did 12-year-old Felix visit in Weimar?', ['Schiller', 'Goethe', 'Heine', 'Shakespeare'], 1),
          ('How old was Mendelssohn when he wrote his Octet?', ['12', '16', '21', '30'], 1),
          ('Which play inspired his overture of 1826?', ['Hamlet', 'A Midsummer Night\'s Dream', 'Romeo and Juliet', 'The Tempest'], 1),
          ('Which famous piece belongs to his later Midsummer Night\'s Dream music (1842)?', ['The Wedding March', 'The Radetzky March', 'The Turkish March', 'The Funeral March'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Week 2 - Bach Reborn and a Grand Tour (1827-1832)',
    'lessons': [
      {
        'title': 'Bach\'s St Matthew Passion, 1829', 'type': 'SLIDES', 'minutes': 15,
        'description': "On 11 March 1829 a 20-year-old conducted a work that had not been heard since Bach's death. It changed music history.",
        'slides': [
          {'kind': 'title', 'week': 'Week 2', 'title': 'Bach reborn and a grand tour', 'subtitle': '1827 - 1832', **PORTRAIT},
          {'kind': 'bullets', 'title': 'A forgotten masterpiece', 'bullets': [
              'After Bach\'s death in 1750 his great choral works were hardly performed',
              'Felix received a copy of the St Matthew Passion as a Christmas present from his grandmother',
              'He studied it with friends - and decided it must be heard again',
              'Zelter, director of the Berlin Sing-Akademie, was doubtful at first']},
          {'kind': 'timeline', 'title': '11 March 1829', 'rows': [
              ('Place', 'The Sing-Akademie in Berlin'),
              ('Conductor', 'Felix Mendelssohn, aged 20 (in a shortened version)'),
              ('Performers', 'A choir of over 150 singers'),
              ('Audience', 'Hegel, Heine and Berlin society - sold out, with hundreds turned away'),
              ('Result', 'The start of the 19th-century Bach revival')]},
          {'kind': 'quote', 'quote': 'To think that it should be an actor and a Jew\'s son who give back to the people the greatest Christian music!', 'by': 'Mendelssohn to the actor Eduard Devrient, who sang Jesus, 1829 (as Devrient remembered it)'},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              '11 March 1829: the St Matthew Passion is heard again, about 100 years after its premiere',
              'Conducted by the 20-year-old Mendelssohn in Berlin',
              'The beginning of the Bach revival - Bach became a "classic" again']},
        ],
      },
      {
        'title': 'Listen: the Hebrides Overture', 'type': 'AUDIO', 'minutes': 12, 'libraryAudio': [HEBRIDES, 0],
        'description': "In the summer of 1829 Mendelssohn travelled through Scotland with his friend Karl Klingemann. On 7 August, on the Isle of Mull, he wrote down 21 bars of music in a letter home \"to show you how extraordinarily the Hebrides affected me\". The next day he sailed to the island of Staffa and Fingal's Cave. The overture - also called \"Fingal's Cave\" - was finished in 1830 and revised in 1832.\n\nListen for:\n1. The opening theme in the violas, cellos and bassoons: rolling like waves\n2. A broad, singing second theme in the cellos and bassoons\n3. Stormy passages - and the quiet clarinet at the end\n\nMusopen recording, public domain. The score and more recordings are in the Library.",
        'library': [(HEBRIDES, 'The Hebrides Overture - full recording')],
      },
      {
        'title': 'A grand tour: Scotland and Italy', 'type': 'SLIDES', 'minutes': 15,
        'description': "Between 1829 and 1832 Mendelssohn saw Britain, Italy, Switzerland and Paris. His travel pictures became symphonies.",
        'slides': [
          {'kind': 'image', 'title': 'Fingal\'s Cave, Staffa', 'text': 'A sea cave of black basalt columns on a tiny Hebridean island. Mendelssohn visited it in August 1829 - he was seasick, but the waves and the echoes stayed with him.', 'image': 'felix_fingal', 'credit': 'Edward Goodall, Fingal\'s Cave, Staffa, 1833 (Yale Center for British Art, CC0)'},
          {'kind': 'timeline', 'title': 'The grand tour, 1829-1832', 'rows': [
              ('1829', 'London - his first concerts there, and Scotland: Holyrood, the Hebrides'),
              ('1830-1831', 'Weimar (a last visit to Goethe), Munich, Vienna, Venice, Florence, Rome, Naples'),
              ('1831', 'Switzerland, then Paris - meets Chopin and Liszt'),
              ('1832', 'London again: the "Hebrides" Overture is performed')]},
          {'kind': 'listen', 'title': 'The "Italian" Symphony', 'work': 'Symphony No. 4 in A major, Op. 90 (first performed in London, 1833)', 'points': [
              'The first movement bursts out with joy - "the jolliest piece I have ever done", Felix wrote from Rome',
              'Second movement: a slow procession - perhaps pilgrims he saw in Naples',
              'The finale is a "saltarello", a fast Roman dance',
              'Open the recording in the Library and listen to the first movement']},
          {'kind': 'bullets', 'title': 'The "Scottish" Symphony', 'bullets': [
              'At the ruined chapel of Holyrood in Edinburgh in 1829 he noted a melody',
              'He finished the symphony only in 1842 - 13 years later',
              'Misty, dark colours: very different from the bright "Italian"',
              'Dedicated to Queen Victoria, whom he visited at Buckingham Palace in 1842']},
        ],
        'library': [(ITALIAN, '"Italian" Symphony - full recording'), (SCOTTISH, '"Scottish" Symphony - full recording')],
      },
      {
        'title': 'Week 2 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of Bach and the grand tour, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 2 in a nutshell', 'bullets': [
              '1829: Mendelssohn conducts Bach\'s St Matthew Passion in Berlin',
              '1829: Scotland and the Hebrides - Fingal\'s Cave',
              '1830-1831: Italy, the inspiration for the "Italian" Symphony',
              '1842: the "Scottish" Symphony is finished at last']},
        ],
        'quiz': [
          ('Which forgotten work did Mendelssohn conduct in Berlin in 1829?', ['Handel\'s Messiah', 'Bach\'s St Matthew Passion', 'Mozart\'s Requiem', 'Haydn\'s Creation'], 1),
          ('What is the other name of the Hebrides Overture?', ['Fingal\'s Cave', 'Scottish Symphony', 'The Sea', 'Calm Sea and Prosperous Voyage'], 0),
          ('Which country inspired his Symphony No. 4?', ['Scotland', 'Italy', 'Switzerland', 'France'], 1),
          ('What kind of piece is the finale of the "Italian" Symphony?', ['A waltz', 'A saltarello, a fast Roman dance', 'A fugue', 'A funeral march'], 1),
          ('To whom did he dedicate the "Scottish" Symphony?', ['Goethe', 'Queen Victoria', 'His sister Fanny', 'The King of Prussia'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 3 - Leipzig: the Conductor (1833-1842)',
    'lessons': [
      {
        'title': 'Leipzig and the Gewandhaus', 'type': 'SLIDES', 'minutes': 15,
        'description': "At 26 Mendelssohn became conductor of the Leipzig Gewandhaus Orchestra - and made it one of the leading orchestras of Europe.",
        'slides': [
          {'kind': 'title', 'week': 'Week 3', 'title': 'Leipzig: the conductor', 'subtitle': '1833 - 1842', **PORTRAIT},
          {'kind': 'timeline', 'title': 'Career steps', 'rows': [
              ('1833', 'Music director in Düsseldorf'),
              ('1835', 'Conductor of the Gewandhaus Orchestra in Leipzig'),
              ('1836', 'First oratorio, "St Paul", premiered in Düsseldorf'),
              ('1837', 'Marries Cécile Jeanrenaud from Frankfurt - they have five children'),
              ('1839', 'First performance of Schubert\'s "Great" C major Symphony')]},
          {'kind': 'bullets', 'title': 'A new kind of conductor', 'bullets': [
              'He was one of the first to conduct with a baton, standing in front of the orchestra',
              'He rehearsed carefully and insisted on precision',
              'His programmes mixed new music with the "classics": Bach, Handel, Mozart, Beethoven',
              'He conducted the premieres of Schumann\'s First Symphony (1841) and of Schubert\'s "Great" C major Symphony']},
          {'kind': 'image', 'title': 'Mendelssohn the painter', 'text': 'Mendelssohn drew and painted wherever he went. This watercolour of 1838 shows the St Thomas Church and School in Leipzig - where Bach had worked a century before.', 'image': 'felix_watercolour', 'credit': 'Felix Mendelssohn, watercolour, 1838 (public domain)'},
        ],
      },
      {
        'title': 'Listen: Songs without Words', 'type': 'AUDIO', 'minutes': 8, 'libraryAudio': [SPRING_SONG, 0],
        'description': "Mendelssohn invented a new kind of piano piece: the \"Song without Words\" - a melody that sings like a voice, over a piano accompaniment. He published eight books of six, and every piano-playing family in the 19th century owned them.\n\nHere is the best-loved of them, the \"Spring Song\" (Op. 62 No. 6, 1842), in an arrangement for harp played by Alberto Salvi on a 78 rpm record from 1922.\n\nListen for:\n1. The melody in the middle, with light, rippling chords around it\n2. The short grace notes at the start of the tune - like birdsong\n3. Then try to sing the melody yourself - it is really a song!\n\nAlso in the Library: \"On Wings of Song\" on a record of 1917, and the duets Op. 63.",
        'library': [(SPRING_SONG, '"Spring Song" - 78 rpm record, 1922'), ('cmv2ivcds00cu12if78ebppkt', '"On Wings of Song" - 78 rpm record, 1917'), ('cmuyfx8j800q42eon7bxmhfla', '"Gruss", Op. 63 No. 3 - interactive score')],
      },
      {
        'title': 'Friends and family', 'type': 'SLIDES', 'minutes': 12,
        'description': "Mendelssohn knew everyone - and wrote thousands of letters. These slides introduce the people around him.",
        'slides': [
          {'kind': 'bullets', 'title': 'Fanny', 'bullets': [
              'His older sister was his first critic and closest musical friend',
              'He published six of her songs under his own name in 1827 and 1830',
              'But for a long time he did not support her wish to publish her own music',
              'In 1846 she published anyway - and he sent her his good wishes']},
          {'kind': 'bullets', 'title': 'Robert and Clara Schumann', 'bullets': [
              'Robert Schumann admired him as "the Mozart of the 19th century"',
              'Clara Schumann played often at the Gewandhaus under Mendelssohn',
              'In Leipzig the three were part of the same musical circle',
              'Robert wrote down his memories of Mendelssohn after his death']},
          {'kind': 'bullets', 'title': 'England', 'bullets': [
              'Mendelssohn visited Britain ten times - he was hugely popular there',
              'Queen Victoria and Prince Albert invited him to Buckingham Palace',
              'His oratorios became part of British musical life for a century']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              '1835: conductor of the Leipzig Gewandhaus Orchestra',
              '1837: marriage to Cécile Jeanrenaud',
              'He premiered Schubert\'s "Great" C major Symphony (1839)',
              '"Songs without Words": a new kind of piano piece']},
        ],
      },
      {
        'title': 'Week 3 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the Leipzig years, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 3 in a nutshell', 'bullets': [
              'Düsseldorf (1833), then Leipzig (1835)',
              'A modern conductor who brought back the "classics"',
              'Premieres of Schubert\'s "Great" C major and Schumann\'s First Symphony',
              'The "Songs without Words" - and a painter\'s eye']},
        ],
        'quiz': [
          ('Which orchestra did Mendelssohn conduct from 1835?', ['The Vienna Philharmonic', 'The Leipzig Gewandhaus Orchestra', 'The Berlin Court Orchestra', 'The London Philharmonic'], 1),
          ('Whose "Great" C major Symphony did he premiere in 1839?', ['Beethoven\'s', 'Schubert\'s', 'Mozart\'s', 'Schumann\'s'], 1),
          ('What is a "Song without Words"?', ['A choral piece', 'A piano piece with a singing melody', 'A song with only "la-la"', 'An opera aria'], 1),
          ('Whom did Mendelssohn marry in 1837?', ['Clara Wieck', 'Cécile Jeanrenaud', 'Jenny Lind', 'Fanny Hensel'], 1),
          ('Which hobby did Mendelssohn practise on all his travels?', ['Photography', 'Watercolour painting', 'Sculpture', 'Gardening'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 4 - Elijah, the Violin Concerto and a Final Farewell (1843-1847)',
    'lessons': [
      {
        'title': 'The Conservatory and Elijah', 'type': 'SLIDES', 'minutes': 15,
        'description': "In his last years Mendelssohn founded a music school, wrote a famous oratorio - and worked far too much.",
        'slides': [
          {'kind': 'bullets', 'title': 'The Leipzig Conservatory, 1843', 'bullets': [
              'Mendelssohn founded the first conservatory in Germany',
              'Teachers included Robert Schumann and the violinist Ferdinand David',
              'Students came from all over Europe - among them later the Norwegian Edvard Grieg',
              'Today it is the University of Music and Theatre "Felix Mendelssohn Bartholdy"']},
          {'kind': 'bullets', 'title': '"Elijah", 1846', 'bullets': [
              'An oratorio about the Old Testament prophet Elijah',
              'First performed at the Birmingham Festival on 26 August 1846, in English',
              'Mendelssohn conducted; the audience demanded eight numbers again',
              'Listen in the Library to "Hear ye, Israel" and "How lovely are the messengers" (from "St Paul") on old records']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              '1843: founds the Leipzig Conservatory',
              '1846: "Elijah" premiered in Birmingham',
              'He worked constantly - as composer, conductor, teacher and organiser']},
        ],
        'library': [('cmv2j30yn00sg12ifb701vuk6', '"Hear ye, Israel" (Elijah) - 78 rpm record, 1922'), ('cmv2j1cnw00pc12if2upsauij', '"How lovely are the messengers" (St Paul) - 78 rpm record, 1920')],
      },
      {
        'title': 'Watch: the Violin Concerto in E minor', 'type': 'YOUTUBE', 'minutes': 36, 'video': 'https://www.youtube.com/watch?v=lzIvElJ0VnI',
        'description': "One of the most loved violin concertos ever written, played by Nikolaj Szeps-Znaider with the Gewandhaus Orchestra under Riccardo Chailly - Mendelssohn's own orchestra.\n\nMendelssohn wrote it for his friend Ferdinand David, the orchestra's leader, and worked on it for six years. David gave the premiere in Leipzig on 13 March 1845.\n\nListen for:\n1. The violin enters almost at once - not after a long orchestral introduction as usual\n2. The cadenza (the soloist's solo) comes in the middle of the first movement, not at the end\n3. A single bassoon note links the first and second movements - the three movements are played without a break",
      },
      {
        'title': 'Listen: a requiem for Fanny', 'type': 'AUDIO', 'minutes': 10, 'libraryAudio': [QUARTET6, 0],
        'description': "On 14 May 1847 Fanny Hensel died suddenly in Berlin. Felix collapsed when he heard the news. During the summer in Switzerland he wrote the String Quartet in F minor, Op. 80 - often called his \"Requiem for Fanny\". It is the most agitated and darkest music he ever wrote.\n\nMendelssohn died in Leipzig on 4 November 1847, after several strokes - less than six months after his sister. He was 38.\n\nListen to the first movement (Musopen recording, public domain):\n1. Restless tremolos from the very first bar\n2. Sudden outbursts and almost no calm\n3. Compare it with the cheerful Octet you met in week 1",
        'library': [(QUARTET6, 'String Quartet No. 6 in F minor, Op. 80 - full recording'), ('cmuygtiti00ge4kktwiu66wcy', 'String Quartet No. 6 - interactive score')],
      },
      {
        'title': 'Final review and quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Congratulations - you have reached the end of the course! One last recap, a look at Mendelssohn's legacy and a final quiz.",
        'slides': [
          {'kind': 'timeline', 'title': 'Mendelssohn\'s life at a glance', 'rows': [
              ('1809', 'Born in Hamburg on 3 February'),
              ('1825-1826', 'The Octet and the "Midsummer Night\'s Dream" Overture'),
              ('1829', 'St Matthew Passion in Berlin; Scotland'),
              ('1835', 'Conductor of the Leipzig Gewandhaus Orchestra'),
              ('1843', 'Founds the Leipzig Conservatory'),
              ('1845-1846', 'Violin Concerto; "Elijah"'),
              ('1847', 'Dies in Leipzig on 4 November')]},
          {'kind': 'bullets', 'title': 'Legacy', 'bullets': [
              'After 1933 the Nazis banned his music because of his Jewish family; his statue in Leipzig was removed in 1936',
              'Today his music is played everywhere again - and a new statue stands in Leipzig since 2008',
              'His Bach revival changed how we think about the music of the past',
              'Continue with the courses on Fanny Hensel, Clara Schumann and Bach']},
        ],
        'quiz': [
          ('Who gave the first performance of the Violin Concerto?', ['Niccolò Paganini', 'Ferdinand David', 'Joseph Joachim', 'Mendelssohn himself'], 1),
          ('Which oratorio was premiered in Birmingham in 1846?', ['Messiah', 'Elijah', 'St Paul', 'The Creation'], 1),
          ('What did Mendelssohn found in Leipzig in 1843?', ['An orchestra', 'The first German conservatory', 'A music magazine', 'A piano factory'], 1),
          ('Which work is often called his "Requiem for Fanny"?', ['The Octet', 'String Quartet in F minor, Op. 80', 'The "Scottish" Symphony', 'Elijah'], 1),
          ('How old was Mendelssohn when he died?', ['38', '48', '56', '72'], 0),
          ('What is unusual about the start of his Violin Concerto?', ['It begins with a drum solo', 'The violin enters almost at once', 'It starts with a choir', 'It has no orchestra'], 1),
        ],
      },
    ],
  },
]
