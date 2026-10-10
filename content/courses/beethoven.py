# Beethoven - a 4-week first-level introduction. Content for the seed
# (render_slides.py -> PNG slides, seed.mjs -> database).
SITE = 'https://mymusic.coach'
EROICA = f'{SITE}/api/library/items/cmuygtj1r00jr4kktm2vrvx1p/files/0.audio'
EGMONT = f'{SITE}/api/library/items/cmuygtj1o00jn4kktbx3ydpyk/files/0.audio'

COURSE = {
    'slug': 'beethoven-life-and-music-introduction',
    'title': 'Beethoven: Life and Music - A First Introduction',
    'shortSummary': 'Four weeks with Ludwig van Beethoven: from a hard childhood in Bonn to the Ninth Symphony - his life, his deafness and the music that changed everything.',
    'description': (
        "Ludwig van Beethoven (1770-1827) is one of the most famous composers who ever lived - and one of the most surprising. "
        "He was a piano star in Vienna, lost his hearing in his twenties, and still wrote music that sounds new two hundred years later.\n\n"
        "In four weeks you follow his life step by step:\n"
        "- Week 1 - Bonn: a musical childhood (1770-1792)\n"
        "- Week 2 - Vienna: the young piano virtuoso (1792-1802)\n"
        "- Week 3 - Crisis and heroism: deafness, the Eroica and the Fifth (1802-1814)\n"
        "- Week 4 - The late years and the Ninth Symphony (1815-1827)\n\n"
        "Every week combines illustrated slides, short videos, recordings to listen to and scores from the mymusic.coach Library, "
        "followed by a short quiz. No previous knowledge is needed - just curiosity and a pair of headphones. Plan about 1-2 hours per week."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin'],
    'musicStyles': ['Classical', 'Romantic'],
    'cover': {'image': 'beethoven_stieler', 'title': 'Beethoven', 'subtitle': 'Life and Music - A First Introduction', 'tag': '4-week course'},
}

FOOTER = 'Beethoven: Life and Music'

WEEKS = [
  {
    'title': 'Week 1 - Bonn: A Musical Childhood (1770-1792)',
    'lessons': [
      {
        'title': 'Welcome: meet Beethoven',
        'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': (
            "Welcome to the course! In this first lesson you get an overview of the next four weeks and a first impression of the person "
            "behind the famous stern face. Click through the slides at your own pace.\n\n"
            "Tip: every piece of music mentioned in this course is linked from the lessons - you can open it in the Library, "
            "star it as a favourite and earn extra XP for reading or listening to the end."
        ),
        'slides': [
          {'kind': 'title', 'week': 'Week 1', 'title': 'Meet Ludwig van Beethoven', 'subtitle': 'A first introduction to his life and music', 'image': 'beethoven_stieler', 'credit': 'Portrait by Joseph Karl Stieler, 1820 (public domain)'},
          {'kind': 'bullets', 'title': 'Why Beethoven?', 'bullets': [
              'Born in Bonn in 1770 - died in Vienna in 1827',
              'A celebrated pianist who became the most admired composer of his time',
              'Lost his hearing - and kept composing for 25 more years',
              'Bridged two eras: the Classical style of Haydn and Mozart and the coming Romantic age',
              'His music is still played somewhere in the world every single day']},
          {'kind': 'timeline', 'title': 'Your four weeks', 'rows': [
              ('Week 1', 'Bonn - a musical childhood (1770-1792)'),
              ('Week 2', 'Vienna - the young piano virtuoso (1792-1802)'),
              ('Week 3', 'Crisis and heroism - deafness, Eroica, Fifth Symphony'),
              ('Week 4', 'The late years and the Ninth Symphony (1815-1827)')]},
          {'kind': 'bullets', 'title': 'How this course works', 'bullets': [
              'Slides like these explain the story and the music',
              'Videos let you see great orchestras and pianists perform',
              'Recordings and scores from the mymusic.coach Library to explore further',
              'A short quiz at the end of every week - earn XP as you go',
              'Mark each lesson complete when you are done']},
          {'kind': 'quote', 'quote': 'Music is a higher revelation than all wisdom and philosophy.', 'by': 'Attributed to Ludwig van Beethoven (reported by Bettina von Arnim)'},
        ],
      },
      {
        'title': 'Growing up in Bonn',
        'type': 'SLIDES', 'minutes': 15,
        'description': (
            "Beethoven did not grow up as a carefree child prodigy. His father pushed him hard, his family struggled, "
            "and at 16 he lost his mother. These slides tell the story of his first 22 years in Bonn - and of the people who believed in him."
        ),
        'slides': [
          {'kind': 'image', 'title': 'Bonn, December 1770', 'text': 'Ludwig van Beethoven was baptised on 17 December 1770 in Bonn, then the capital of the Electorate of Cologne. His family lived in this house in the Bonngasse - today the Beethoven-Haus museum.', 'image': 'bonn_house', 'credit': 'Photo: Sir James, CC BY-SA 3.0, via Wikimedia Commons'},
          {'kind': 'bullets', 'title': 'A family of court musicians', 'bullets': [
              'His grandfather, also called Ludwig, was music director (Kapellmeister) at the Bonn court',
              'His father Johann was a tenor in the court chapel - and a strict, often harsh teacher',
              'Johann hoped to show off his son as a "second Mozart"',
              'Young Ludwig gave his first public concert in Cologne in March 1778, aged seven']},
          {'kind': 'bullets', 'title': 'A real teacher: Christian Gottlob Neefe', 'bullets': [
              'The court organist Neefe became Beethoven\'s teacher around 1781',
              'He taught him Bach\'s "Well-Tempered Clavier" - the best training a keyboard player could get',
              'In 1782 Beethoven\'s first composition was printed: variations on a march by Dressler',
              'Soon he worked as assistant organist and played viola in the court orchestra']},
          {'kind': 'timeline', 'title': 'Growing up fast', 'rows': [
              ('1778', 'First public concert in Cologne'),
              ('1782', 'First published work'),
              ('1787', 'Short trip to Vienna - his mother falls ill, he hurries home; she dies in July'),
              ('1789', 'Takes responsibility for his two younger brothers'),
              ('1792', 'Leaves Bonn for Vienna - for good')]},
          {'kind': 'quote', 'quote': 'You will receive the spirit of Mozart from the hands of Haydn.', 'by': 'Count Ferdinand Waldstein, in Beethoven\'s farewell album, October 1792'},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Born in Bonn in 1770 into a family of court musicians',
              'A difficult childhood with a demanding father',
              'Neefe gave him a solid musical education',
              'Friends like Count Waldstein sent him to Vienna to study with Haydn']},
        ],
      },
      {
        'title': 'Watch: Beethoven\'s life and places',
        'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=yl7HqahLCDk',
        'description': (
            "This documentary takes you to the places where Beethoven lived and worked - from Bonn to Vienna.\n\n"
            "While you watch, look out for:\n"
            "1. Which people in Bonn supported the young Beethoven?\n"
            "2. How did his life change when he moved to Vienna?\n"
            "3. When did he first notice problems with his hearing?\n\n"
            "You don't need to remember everything - the next weeks go into each part of the story in more detail."
        ),
      },
      {
        'title': 'Week 1 review and quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "A short recap of week 1, then five questions. Take your time - you can try the quiz again if you like.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 1 in a nutshell', 'bullets': [
              'Baptised in Bonn on 17 December 1770',
              'Father Johann: ambitious and strict',
              'Teacher Neefe: Bach, organ, first publication in 1782',
              'Mother died in 1787 - Beethoven became head of the family',
              '1792: off to Vienna to study with Joseph Haydn']},
          {'kind': 'bullets', 'title': 'Listen this week', 'bullets': [
              'Open "Für Elise" in the Library and follow the score - Beethoven wrote it much later (1810), but it is the perfect first piece to explore',
              'Try the Seven Variations WoO 78 - variations were the young Beethoven\'s favourite way to show off at the piano']},
        ],
        'library': [('cmuygw9ct01vp4kkttmshx9kc', 'A first score to explore - follow it while you listen to a recording'), ('cmuygw9cu01vq4kkt3n10qs6q', 'Variations: how the young Beethoven showed off at the piano'), ('cmv2iui6i00bc12ifvera3oo4', 'Historic recording: the Minuet in G, played by violinist Maud Powell in 1916')],
        'quiz': [
          ('In which city was Beethoven born?', ['Vienna', 'Bonn', 'Salzburg', 'Leipzig'], 1),
          ('What was the job of Beethoven\'s grandfather?', ['Music director at the Bonn court', 'Piano maker', 'Opera singer in Vienna', 'Organist in Leipzig'], 0),
          ('Which teacher introduced the young Beethoven to Bach\'s "Well-Tempered Clavier"?', ['Joseph Haydn', 'Antonio Salieri', 'Christian Gottlob Neefe', 'Wolfgang Amadeus Mozart'], 2),
          ('Why did Beethoven hurry back from Vienna in 1787?', ['He had no money left', 'His mother was seriously ill', 'The Elector called him back', 'He failed an audition'], 1),
          ('With whom was Beethoven supposed to study when he moved to Vienna in 1792?', ['Joseph Haydn', 'Johann Sebastian Bach', 'Franz Schubert', 'Christoph Willibald Gluck'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Week 2 - Vienna: The Young Virtuoso (1792-1802)',
    'lessons': [
      {
        'title': 'A piano star in Vienna',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Vienna was the music capital of Europe. Within a few years the young man from Bonn became its most exciting pianist - and a composer people talked about.",
        'slides': [
          {'kind': 'title', 'week': 'Week 2', 'title': 'Vienna: the young virtuoso', 'subtitle': '1792 - 1802', 'image': 'beethoven_young', 'credit': 'Beethoven in 1801, engraving by Carl Traugott Riedel (public domain)'},
          {'kind': 'bullets', 'title': 'Lessons with the masters', 'bullets': [
              'Beethoven arrived in Vienna in November 1792',
              'He took lessons with Joseph Haydn - and secretly also with other teachers',
              'Later he studied counterpoint with Albrechtsberger and Italian vocal writing with Salieri',
              'Haydn was proud of him, but the two strong personalities did not always agree']},
          {'kind': 'bullets', 'title': 'Friends among the nobility', 'bullets': [
              'Music in Vienna happened in the salons of the aristocracy',
              'Prince Karl Lichnowsky gave Beethoven a home and an annual allowance',
              'Beethoven became famous for his improvisations - and won several piano "duels"',
              'He behaved as an equal to princes - unusual for a musician at the time']},
          {'kind': 'timeline', 'title': 'First successes', 'rows': [
              ('1795', 'Three Piano Trios published as his Opus 1 - a big success'),
              ('1795', 'First public concert in Vienna'),
              ('1799', 'Piano Sonata "Pathétique", Op. 13'),
              ('1800', 'First Symphony premiered'),
              ('1801', 'Piano Sonata Op. 27 No. 2 - later called "Moonlight"')]},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Vienna 1792: study with Haydn and others',
              'Supported by aristocratic patrons such as Prince Lichnowsky',
              'Famous first as a pianist and improviser, then as a composer',
              'By 1800: piano sonatas, chamber music, a first symphony']},
        ],
      },
      {
        'title': 'Listen: the "Pathétique" Sonata',
        'type': 'YOUTUBE', 'minutes': 15, 'video': 'https://www.youtube.com/watch?v=hcczxDKkYhU',
        'description': (
            "The Piano Sonata No. 8 in C minor, Op. 13 - published in 1799 as the \"Grande Sonate pathétique\" - made the young Beethoven famous across Europe. "
            "Pianist Fabian Müller plays the first movement.\n\n"
            "Listen for:\n"
            "1. The slow, heavy chords at the beginning (Grave) - like a dramatic curtain opening\n"
            "2. The sudden switch to a fast, restless Allegro\n"
            "3. The slow introduction coming back - twice! - before the movement ends\n\n"
            "Then open the score from the Library below and follow the opening bars: can you see how dense the first chords are?"
        ),
        'library': [('cmuygw9af01u44kktp3bdmamc', 'The score of the first movement - follow the opening chords'), ('cmuygw9ag01u64kktocu8ro7g', 'The famous slow second movement'), ('cmv2incvt000q12ifkpjahud0', 'A 100-year-old recording: the slow movement arranged for violin, Marjorie Hayward (1921)')],
      },
      {
        'title': 'The "Moonlight" Sonata',
        'type': 'SLIDES', 'minutes': 12,
        'description': "Probably the most famous piano piece ever written - but Beethoven never called it \"Moonlight\". These slides explain where the name comes from and what makes the music so special.",
        'slides': [
          {'kind': 'bullets', 'title': 'Sonata "quasi una fantasia"', 'bullets': [
              'Piano Sonata No. 14 in C-sharp minor, Op. 27 No. 2, written in 1801',
              'Beethoven called it a sonata "almost like a fantasy" - free and unusual in form',
              'Dedicated to his young pupil, Countess Giulietta Guicciardi',
              'The name "Moonlight" came from the critic Ludwig Rellstab - in 1832, after Beethoven\'s death']},
          {'kind': 'listen', 'title': 'Listening guide: first movement', 'work': 'Adagio sostenuto', 'points': [
              'Gentle triplets that flow all the way through - "like a lake in moonlight", Rellstab wrote',
              'A simple, sad melody floats on top',
              'Deep bass notes give the music its dark colour',
              'Beethoven asks for the sustaining pedal - the sound should be soft and blurred']},
          {'kind': 'bullets', 'title': 'A surprising finish', 'bullets': [
              'The calm first movement is followed by a short, light Allegretto',
              'The finale (Presto agitato) is a storm - fast, loud and dramatic',
              'Instead of a fast-slow-fast order, the sonata grows from calm to fury']},
          {'kind': 'summary', 'title': 'Try it yourself', 'bullets': [
              'Open the score in the Library and look at the triplet pattern in the left and right hand',
              'Listen to the first movement and count the triplets: 1-2-3, 1-2-3 ...',
              'Pianists: the opening is playable at an early-intermediate level - ask your teacher!']},
        ],
        'library': [('cmuygw9ap01ui4kktgbansj59', 'First movement - follow the triplets'), ('cmuygw9ao01uh4kktal1dz7ue', 'The complete sonata')],
      },
      {
        'title': 'Week 2 review and quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of Beethoven's first Vienna years, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 2 in a nutshell', 'bullets': [
              'Vienna 1792: lessons with Haydn, Albrechtsberger and Salieri',
              'Patrons like Prince Lichnowsky supported him',
              'Opus 1 (1795): three piano trios',
              '"Pathétique" (1799) and "Moonlight" (1801) sonatas',
              'First Symphony premiered in 1800']},
        ],
        'quiz': [
          ('Which famous composer gave Beethoven lessons in Vienna?', ['Joseph Haydn', 'Johann Strauss', 'Franz Liszt', 'Felix Mendelssohn'], 0),
          ('Who gave the "Moonlight" Sonata its nickname?', ['Beethoven himself', 'His publisher in 1801', 'The critic Ludwig Rellstab, after Beethoven\'s death', 'Countess Giulietta Guicciardi'], 2),
          ('What did Beethoven call the "Moonlight" Sonata?', ['Sonata quasi una fantasia', 'Sonata pathétique', 'Sonata appassionata', 'Moonlight sonata'], 0),
          ('In which key is the "Pathétique" Sonata?', ['C major', 'C minor', 'D minor', 'E-flat major'], 1),
          ('In 1800 Beethoven premiered ...', ['his only opera', 'his First Symphony', 'his Ninth Symphony', 'his last piano sonata'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 3 - Crisis and Heroism (1802-1814)',
    'lessons': [
      {
        'title': 'Losing his hearing: the Heiligenstadt Testament',
        'type': 'SLIDES', 'minutes': 15,
        'description': "Around the age of 28 Beethoven noticed that he was going deaf. In 1802 he wrote a moving letter about it - and decided to live for his art.",
        'slides': [
          {'kind': 'title', 'week': 'Week 3', 'title': 'Crisis and heroism', 'subtitle': '1802 - 1814', 'image': 'beethoven_maehler', 'credit': 'Portrait by Joseph Willibrord Mähler, 1804-05 (public domain)'},
          {'kind': 'bullets', 'title': 'A musician going deaf', 'bullets': [
              'From about 1798 Beethoven heard ringing and buzzing in his ears',
              'His hearing got slowly worse - doctors could not help',
              'He hid it for years: a deaf musician seemed unthinkable',
              'In 1802 his doctor sent him to rest in the village of Heiligenstadt near Vienna']},
          {'kind': 'image', 'title': 'Heiligenstadt, October 1802', 'text': 'In this house Beethoven wrote a long letter to his brothers Carl and Johann. He never sent it - it was found among his papers after his death. Today we call it the "Heiligenstadt Testament".', 'image': 'heiligenstadt_house', 'credit': 'Photo: Michael Kranewitter, CC BY-SA 3.0, via Wikimedia Commons'},
          {'kind': 'quote', 'quote': 'It was only my art that held me back. Ah, it seemed impossible to leave the world until I had brought forth all that I felt was within me.', 'by': 'Heiligenstadt Testament, 6 October 1802'},
          {'kind': 'summary', 'title': 'A turning point', 'bullets': [
              'Beethoven chose to go on living - for his music',
              'Right after the crisis, his music became bolder and bigger',
              'Historians call the next years his "heroic" period']},
        ],
      },
      {
        'title': 'Listen: the "Eroica" Symphony',
        'type': 'AUDIO', 'minutes': 16, 'video': EROICA,
        'description': (
            "Symphony No. 3 in E-flat major, Op. 55 - the \"Eroica\" (1803-04) - was longer and more daring than any symphony before it. "
            "Beethoven first wanted to dedicate it to Napoleon Bonaparte. When Napoleon crowned himself emperor in 1804, "
            "Beethoven - according to his pupil Ferdinand Ries - tore up the title page in anger. The symphony was finally published "
            "\"to celebrate the memory of a great man\".\n\n"
            "Here you hear the first movement (Allegro con brio), played by the Czech National Symphony Orchestra (Musopen, public domain).\n\n"
            "Listen for:\n"
            "1. Two short, loud chords at the very start - like a knock on the door\n"
            "2. The main theme in the cellos, built on a simple broken chord\n"
            "3. Harsh, clashing chords in the middle of the movement - Beethoven wanted the listener to feel a struggle\n\n"
            "The whole symphony, with all four movements, is in the Library below."
        ),
        'library': [('cmuygtj1r00jr4kktm2vrvx1p', 'The complete "Eroica" - all four movements')],
      },
      {
        'title': 'Watch: Symphony No. 5',
        'type': 'YOUTUBE', 'minutes': 35, 'video': 'https://www.youtube.com/watch?v=9aDEq3u5huA',
        'description': (
            "Ta-ta-ta-taaa! The opening of the Fifth Symphony (1808) is the most famous four-note motif in music. "
            "Watch the Berliner Philharmoniker and Herbert von Karajan perform the whole symphony.\n\n"
            "Listen for:\n"
            "1. How often the short-short-short-long rhythm returns in the first movement\n"
            "2. The quiet, mysterious passage that leads without a break into the last movement\n"
            "3. The bright C major finale - from darkness to light\n\n"
            "The Fifth was premiered on 22 December 1808 in Vienna, in a concert that lasted about four hours - "
            "together with the Sixth Symphony (\"Pastoral\") and the Fourth Piano Concerto."
        ),
        'library': [('cmuygw9az01v34kktsjuawo4n', 'Score of the first movement - spot the four-note motif'), ('cmuygw9b001v54kktkgrbtz51', 'The whole symphony arranged for piano')],
      },
      {
        'title': 'Week 3 review and quiz',
        'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the heroic years, a bonus recording, and the week 3 quiz.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 3 in a nutshell', 'bullets': [
              'From about 1798: Beethoven slowly loses his hearing',
              '1802: the Heiligenstadt Testament - he chooses to live for his art',
              '1804: the "Eroica" - originally meant for Napoleon',
              '1808: Fifth and Sixth Symphonies premiered on the same evening',
              '1805-1814: his only opera, "Fidelio", about courage and freedom']},
          {'kind': 'bullets', 'title': 'Bonus listening', 'bullets': [
              'The Egmont Overture (1810) is in the Library - music for Goethe\'s play about a hero who fights for freedom',
              'Listen for the dark, slow opening and the triumphant ending']},
        ],
        'library': [('cmuygtj1o00jn4kktbx3ydpyk', 'Bonus: the Egmont Overture'), ('cmuygw9b101va4kktcabhhrvp', 'An aria from Fidelio, his only opera')],
        'quiz': [
          ('What is the "Heiligenstadt Testament"?', ['A symphony', 'A letter to his brothers about his deafness', 'A contract with his publisher', 'A church in Vienna'], 1),
          ('To whom did Beethoven first want to dedicate the "Eroica"?', ['Napoleon Bonaparte', 'Joseph Haydn', 'Prince Lichnowsky', 'Emperor Franz'], 0),
          ('Which rhythm opens the Fifth Symphony?', ['Long-long-short', 'Short-short-short-long', 'Long-short-long-short', 'Short-long-short-long'], 1),
          ('In what year were the Fifth and Sixth Symphonies first performed?', ['1792', '1800', '1808', '1824'], 2),
          ('What is the name of Beethoven\'s only opera?', ['Don Giovanni', 'Fidelio', 'Egmont', 'The Magic Flute'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 4 - The Late Years and the Ninth (1815-1827)',
    'lessons': [
      {
        'title': 'Music from silence',
        'type': 'SLIDES', 'minutes': 15,
        'description': "In his last years Beethoven was almost completely deaf. He talked with visitors in writing - and composed some of the most profound music ever written.",
        'slides': [
          {'kind': 'title', 'week': 'Week 4', 'title': 'The late years', 'subtitle': '1815 - 1827', 'image': 'beethoven_stieler', 'credit': 'Portrait by Joseph Karl Stieler, 1820 (public domain)'},
          {'kind': 'bullets', 'title': 'A difficult life', 'bullets': [
              'From about 1818 visitors wrote their questions in "conversation books" - around 140 survive',
              'After his brother Carl\'s death (1815) he fought a long legal battle to raise his nephew Karl',
              'He often moved flats, quarrelled with servants - and worried about money',
              'Yet he composed slowly, carefully and with enormous ambition']},
          {'kind': 'bullets', 'title': 'The late masterpieces', 'bullets': [
              'The last five piano sonatas, up to Op. 111 (1822)',
              'The "Missa solemnis", a huge setting of the Catholic Mass (1823)',
              'The Ninth Symphony with chorus (1824)',
              'The late string quartets (1825-26) - music so new that many listeners were puzzled']},
          {'kind': 'image', 'title': 'Vienna, 7 May 1824', 'text': 'The Ninth Symphony was premiered at the Kärntnertortheater. Beethoven stood beside the conductor. At the end he could not hear the applause - the singer Caroline Unger turned him round so he could see the cheering audience.', 'image': 'kaerntnertor', 'credit': 'The Kärntnertortheater, Vienna, 1830 (public domain)'},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Almost totally deaf: conversation books',
              'Late works: Missa solemnis, late sonatas and quartets',
              'Ninth Symphony premiered on 7 May 1824 in Vienna']},
        ],
      },
      {
        'title': 'Watch: "Ode to Joy"',
        'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=q0EjVVjJraA',
        'description': (
            "For the last movement of his Ninth Symphony Beethoven did something nobody had done before: he added singers and a choir. "
            "The words are Friedrich Schiller's poem \"An die Freude\" (Ode to Joy): \"Alle Menschen werden Brüder\" - all people become brothers.\n\n"
            "Listen for:\n"
            "1. The orchestra first quoting music from the earlier movements - and rejecting it\n"
            "2. The famous joy melody, first very quietly in the cellos and basses\n"
            "3. A solo baritone singing \"O Freunde, nicht diese Töne!\" - \"Oh friends, not these sounds!\"\n\n"
            "Did you know? Since 1985 the joy melody has been the official anthem of the European Union."
        ),
      },
      {
        'title': 'Beethoven\'s legacy',
        'type': 'SLIDES', 'minutes': 12,
        'description': "Beethoven died in 1827 - and became a legend. Why does his music still matter today?",
        'slides': [
          {'kind': 'image', 'title': 'Vienna, 29 March 1827', 'text': 'Beethoven died on 26 March 1827. Three days later many thousands of people followed his funeral procession through Vienna. Among the torchbearers was a young composer: Franz Schubert.', 'image': 'beethoven_funeral', 'credit': 'Beethoven\'s funeral procession, Franz Xaver Stöber, 1827 (public domain)'},
          {'kind': 'bullets', 'title': 'What changed because of Beethoven', 'bullets': [
              'The composer as an artist, not a servant: he wrote what he wanted to write',
              'Bigger forms: longer symphonies, sonatas and quartets',
              'Music that tells a story - from struggle to victory',
              'Composers after him - Brahms, Wagner, Mahler - measured themselves against him']},
          {'kind': 'bullets', 'title': 'Beethoven today', 'bullets': [
              'The "Ode to Joy" is the anthem of Europe',
              'The Fifth Symphony\'s opening is known around the world',
              '"Für Elise" is one of the first pieces many piano students learn',
              'His music is played in concert halls, films, schools - and at the Olympic Games']},
          {'kind': 'summary', 'title': 'Where to go next', 'bullets': [
              'Explore the Beethoven scores and recordings in the mymusic.coach Library',
              'Continue with "Franz Schubert: Life and Songs" - the composer who carried a torch at his funeral',
              'Or book a lesson with your teacher and play your first Beethoven piece']},
        ],
              'library': [('cmv2iqckr004212ifexdxgvnx', 'Beethoven in the 1910s: Jascha Heifetz plays the "Chorus of Dervishes" (1917)'), ('cmuygtj1r00jr4kktm2vrvx1p', 'The "Eroica" again - now that you know the whole story')],
      },
      {
        'title': 'Final review and quiz',
        'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Congratulations - you have reached the end of the course! One last recap and a final quiz across all four weeks.",
        'slides': [
          {'kind': 'timeline', 'title': 'Beethoven\'s life at a glance', 'rows': [
              ('1770', 'Baptised in Bonn on 17 December'),
              ('1792', 'Moves to Vienna, studies with Haydn'),
              ('1802', 'Heiligenstadt Testament'),
              ('1804', '"Eroica" Symphony'),
              ('1808', 'Fifth and Sixth Symphonies'),
              ('1824', 'Ninth Symphony premiered'),
              ('1827', 'Dies in Vienna on 26 March')]},
          {'kind': 'quote', 'quote': 'I will seize Fate by the throat; it shall certainly never wholly overcome me.', 'by': 'Beethoven in a letter to his friend Franz Wegeler, November 1801'},
        ],
        'quiz': [
          ('How old was Beethoven when he moved to Vienna for good?', ['About 12', 'About 22', 'About 32', 'About 42'], 1),
          ('How did visitors talk with Beethoven in his last years?', ['In sign language', 'By writing in conversation books', 'Through his nephew only', 'With an ear trumpet only'], 1),
          ('What was new about the Ninth Symphony?', ['It was written for piano', 'It has singers and a choir in the last movement', 'It has only one movement', 'It was his first symphony'], 1),
          ('Whose poem is sung in the "Ode to Joy"?', ['Goethe', 'Schiller', 'Heine', 'Müller'], 1),
          ('Which composer was a torchbearer at Beethoven\'s funeral?', ['Franz Schubert', 'Joseph Haydn', 'Richard Wagner', 'Johannes Brahms'], 0),
          ('Since 1985 the "Ode to Joy" melody has been ...', ['the anthem of the European Union', 'the anthem of Germany', 'the Olympic hymn', 'the anthem of Austria'], 0),
        ],
      },
    ],
  },
]
