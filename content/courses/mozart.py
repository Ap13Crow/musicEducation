# Wolfgang Amadeus Mozart - a 4-week first-level introduction.
COURSE = {
    'slug': 'mozart-life-and-music-introduction',
    'title': 'Wolfgang Amadeus Mozart: Life and Music - A First Introduction',
    'shortSummary': 'Four weeks with Mozart: the child prodigy from Salzburg who toured Europe, conquered Vienna and wrote The Magic Flute and the Requiem before he died at 35.',
    'description': (
        "Wolfgang Amadeus Mozart (1756-1791) gave his first concerts at six, wrote his first symphony at eight and composed more than 600 works "
        "in a life of only 35 years - operas, symphonies, concertos, chamber music and church music.\n\n"
        "In four weeks you follow his life step by step:\n"
        "- Week 1 - The wonder child from Salzburg (1756-1766)\n"
        "- Week 2 - Growing up on the road, and breaking free (1766-1781)\n"
        "- Week 3 - Vienna: freelance star, Figaro and Don Giovanni (1781-1788)\n"
        "- Week 4 - The last years: The Magic Flute and the Requiem (1788-1791)\n\n"
        "Every week combines illustrated slides, videos (including the Royal Opera's Queen of the Night), recordings and scores from the "
        "mymusic.coach Library, and a short quiz. No previous knowledge is needed. Plan about 1-2 hours per week."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin', 'Voice'],
    'musicStyles': ['Classical', 'Opera'],
    'cover': {'image': 'mozart_portrait', 'title': 'Mozart', 'subtitle': 'Life and Music - A First Introduction', 'tag': '4-week course'},
}
FOOTER = 'Wolfgang Amadeus Mozart: Life and Music'
PORTRAIT = {'image': 'mozart_portrait', 'credit': 'Posthumous portrait by Barbara Krafft, 1819 (public domain)'}
SYMPHONY_40 = 'cmuygtj2l00l84kktos5ni9rf'

WEEKS = [
  {
    'title': 'Week 1 - The Wonder Child from Salzburg (1756-1766)',
    'lessons': [
      {
        'title': 'Welcome: meet Mozart', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Welcome to the course! Meet Wolfgang Amadeus Mozart and see how the next four weeks work.\n\nTip: all music mentioned in this course is linked from the lessons - open it in the Library, read the scores and earn extra XP for reading or listening to the end.",
        'slides': [
          {'kind': 'title', 'week': 'Week 1', 'title': 'Meet Wolfgang Amadeus Mozart', 'subtitle': 'A first introduction to his life and music', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Why Mozart?', 'bullets': [
              'Born in Salzburg in 1756 - died in Vienna in 1791, aged only 35',
              'A child prodigy who toured Europe for years with his family',
              'Wrote in every genre of his time - and excelled in all of them',
              'His operas are among the most performed in the world',
              'Together with Haydn and Beethoven, the great master of the Classical style']},
          {'kind': 'timeline', 'title': 'Your four weeks', 'rows': [
              ('Week 1', 'The wonder child from Salzburg (1756-1766)'),
              ('Week 2', 'Growing up on the road - and breaking free (1766-1781)'),
              ('Week 3', 'Vienna: Figaro and Don Giovanni (1781-1788)'),
              ('Week 4', 'The Magic Flute and the Requiem (1788-1791)')]},
          {'kind': 'bullets', 'title': 'What is the "Classical" style?', 'bullets': [
              'The music of roughly 1750 to 1820: Haydn, Mozart, the young Beethoven',
              'Clear, singable melodies with simple accompaniments',
              'Balanced phrases - like questions and answers',
              'New forms that became standard: the symphony, the string quartet, the sonata']},
          {'kind': 'quote', 'quote': 'Melody is the essence of music.', 'by': 'Attributed to Wolfgang Amadeus Mozart'},
        ],
      },
      {
        'title': 'A prodigy on tour', 'type': 'SLIDES', 'minutes': 15,
        'description': "Before he was ten, Mozart had played for an empress, a king and a queen and been heard in Paris and London. These slides tell how.",
        'slides': [
          {'kind': 'image', 'title': 'Salzburg, 27 January 1756', 'text': 'Johannes Chrysostomus Wolfgangus Theophilus Mozart was born in this house in the Getreidegasse. "Theophilus" means "loved by God" - in Latin "Amadeus", the name he later liked to use.', 'image': 'mozart_birthplace', 'credit': 'Mozart\'s birthplace, Salzburg (photo: Immanuel Giel, public domain)'},
          {'kind': 'bullets', 'title': 'Father and teacher: Leopold Mozart', 'bullets': [
              'Leopold was a violinist and composer at the court of the Prince-Archbishop of Salzburg',
              'His violin method, published in 1756, was used all over Europe',
              'He taught Wolfgang and his older sister Maria Anna - "Nannerl" - himself',
              'Wolfgang wrote his first little pieces at five; Leopold wrote them down']},
          {'kind': 'timeline', 'title': 'On the road', 'rows': [
              ('1762', 'First journeys: Munich, then Vienna - he plays for Empress Maria Theresa'),
              ('1763-1766', 'The "grand tour": three and a half years through Germany, Paris, London and the Netherlands'),
              ('1764', 'London: friendship with Johann Christian Bach; his first symphony'),
              ('1764', 'In Paris his first works are printed - sonatas for keyboard and violin'),
              ('1766', 'Home to Salzburg')]},
          {'kind': 'bullets', 'title': 'Showing off - and learning', 'bullets': [
              'Audiences tested him: playing with a cloth over the keys, naming notes, sight-reading anything',
              'But the tours were above all a school: Wolfgang absorbed every style he heard',
              'Nannerl was a brilliant keyboard player too - but as a girl her career ended when she grew up']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Born in Salzburg on 27 January 1756',
              'Taught by his father Leopold, together with his sister Nannerl',
              'Three-and-a-half-year tour of Europe from age seven',
              'London: J. C. Bach and his first symphony']},
        ],
      },
      {
        'title': 'Watch: Mozart\'s life and places', 'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=fC0_h3-ZH0Q',
        'description': "This documentary visits the places where Mozart lived and worked - from Salzburg across Europe to Vienna.\n\nWhile you watch, look out for:\n1. Which cities did the Mozart family visit on their tours?\n2. Why did Mozart leave Salzburg for good?\n3. Which of his operas were first performed in Prague?\n\nYou don't need to remember everything - every part comes back in the next weeks.",
      },
      {
        'title': 'Week 1 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "A short recap, a first piece to explore, and five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 1 in a nutshell', 'bullets': [
              'Born in Salzburg on 27 January 1756',
              'Father Leopold: violinist, composer and teacher',
              'Sister Nannerl: a gifted keyboard player',
              '1763-1766: the grand tour - Paris, London, the Netherlands',
              'First symphony in London at eight']},
          {'kind': 'bullets', 'title': 'Explore this week', 'bullets': [
              'Mozart\'s 12 Variations on "Ah vous dirai-je, Maman" - the tune you know as "Twinkle, Twinkle, Little Star"',
              'He wrote them in Vienna around 1781-82, but they show perfectly how he loved to play with a simple melody',
              'Open the score and find the tune in each variation']},
        ],
        'library': [('cmuygwa26027v4kktd1gb78bx', '"Ah vous dirai-je, Maman" variations - score')],
        'quiz': [
          ('In which city was Mozart born?', ['Vienna', 'Salzburg', 'Prague', 'Munich'], 1),
          ('Who was Mozart\'s first teacher?', ['Joseph Haydn', 'His father Leopold', 'Johann Christian Bach', 'Antonio Salieri'], 1),
          ('What was the name of Mozart\'s sister, also a gifted keyboard player?', ['Constanze', 'Nannerl (Maria Anna)', 'Aloysia', 'Fanny'], 1),
          ('Where did Mozart write his first symphony, aged eight?', ['Salzburg', 'Paris', 'London', 'Rome'], 2),
          ('Which melody is "Ah vous dirai-je, Maman"?', ['Happy Birthday', 'Twinkle, Twinkle, Little Star', 'Frère Jacques', 'Silent Night'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 2 - Growing Up on the Road, and Breaking Free (1766-1781)',
    'lessons': [
      {
        'title': 'Italy, Salzburg and the search for a job', 'type': 'SLIDES', 'minutes': 15,
        'description': "As a teenager Mozart conquered Italy. As a young man he felt trapped in Salzburg - until he broke free in 1781.",
        'slides': [
          {'kind': 'title', 'week': 'Week 2', 'title': 'Growing up - and breaking free', 'subtitle': '1766 - 1781', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Triumph in Italy', 'bullets': [
              'Between 1769 and 1773 Mozart and his father made three journeys to Italy',
              'In Rome he heard Allegri\'s secret "Miserere" in the Sistine Chapel and wrote it down from memory',
              'The Pope made him a Knight of the Golden Spur',
              'His opera "Mitridate" (1770) was a success in Milan - he was 14']},
          {'kind': 'image', 'title': 'A musical family', 'text': 'The family around 1780: Nannerl and Wolfgang at the keyboard, Leopold with his violin. Their mother Anna Maria, who died in 1778, appears as a portrait on the wall.', 'image': 'mozart_family', 'credit': 'Johann Nepomuk della Croce, the Mozart family, c. 1780 (public domain)'},
          {'kind': 'timeline', 'title': 'Years of frustration', 'rows': [
              ('1773', 'Back in Salzburg, as court musician to the strict Prince-Archbishop Colloredo'),
              ('1777-1779', 'Job hunting in Mannheim and Paris - without success'),
              ('1778', 'His mother dies in Paris while travelling with him'),
              ('1781', 'Success in Munich with the opera "Idomeneo"'),
              ('1781', 'In Vienna he quarrels with Colloredo; the Archbishop\'s steward, Count Arco, shows him out with a kick')]},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Three journeys to Italy as a teenager',
              'Unhappy years as court musician in Salzburg',
              '1778: death of his mother in Paris',
              '1781: he leaves the Archbishop\'s service and settles in Vienna']},
        ],
      },
      {
        'title': 'Listen: the Piano Sonata in C major "facile"', 'type': 'SLIDES', 'minutes': 12,
        'description': "Mozart called it a little sonata \"for beginners\" - today it is one of the most played piano pieces in the world. A perfect example of the Classical style.",
        'slides': [
          {'kind': 'bullets', 'title': 'A sonata "for beginners"', 'bullets': [
              'Piano Sonata No. 16 in C major, K. 545, written in Vienna in 1788',
              'Mozart listed it as "a little keyboard sonata for beginners"',
              'Nicknamed "Sonata facile" - the easy sonata',
              'Simple to read - but hard to play perfectly']},
          {'kind': 'listen', 'title': 'Sonata form, step by step', 'work': 'Sonata in C major, K. 545 - first movement', 'points': [
              'Exposition: a bright first theme in C major, running scales, a second theme in G major',
              'Development: the themes travel through other keys',
              'Recapitulation: the first theme returns - surprisingly in F major',
              'Everything is balanced: two-bar question, two-bar answer']},
          {'kind': 'bullets', 'title': 'Try it yourself', 'bullets': [
              'Open the score in the Library and find the second theme',
              'Pianists: the first movement is a classic intermediate piece - ask your teacher',
              'Count the K. number: Ludwig von Köchel catalogued Mozart\'s works in 1862 - "K." or "KV" is his number']},
        ],
        'library': [('cmuygwa2w028y4kkteja74k7w', 'Sonata facile, K. 545 - first movement score'), ('cmuygwa2d02864kktojtpwodb', 'Rondo alla Turca from K. 331 - score')],
      },
      {
        'title': 'Listen: Symphony No. 40', 'type': 'AUDIO', 'minutes': 6, 'libraryAudio': [SYMPHONY_40, 0],
        'description': "In the summer of 1788 Mozart wrote his last three symphonies in about six weeks. No. 40 in G minor is one of only two symphonies he wrote in a minor key - restless, urgent and unforgettable.\n\nHere you hear the first movement, Molto allegro (Musopen, public domain).\n\nListen for:\n1. The famous theme starts quietly in the violins over a nervous accompaniment in the violas\n2. A sighing figure of two notes that keeps returning\n3. The music hardly ever rests - even the gentle second theme feels uneasy\n\nAll four movements are in the Library.",
        'library': [(SYMPHONY_40, 'Symphony No. 40 in G minor - all four movements')],
      },
      {
        'title': 'Week 2 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of Mozart's youth, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 2 in a nutshell', 'bullets': [
              '1769-1773: three journeys to Italy',
              'Rome: he wrote down Allegri\'s "Miserere" from memory',
              'Salzburg: court musician under Archbishop Colloredo',
              '1781: break with the Archbishop - a freelance life in Vienna',
              'Sonata form: exposition, development, recapitulation']},
        ],
        'quiz': [
          ('What did Mozart write down from memory in Rome?', ['A Bach fugue', 'Allegri\'s "Miserere"', 'An opera by Gluck', 'A papal hymn'], 1),
          ('Where did Mozart\'s mother die in 1778?', ['Salzburg', 'Vienna', 'Paris', 'Mannheim'], 2),
          ('What happened in Vienna in 1781?', ['Mozart became court composer', 'He broke with the Archbishop of Salzburg', 'He met Beethoven', 'He married Nannerl\'s friend'], 1),
          ('What does "K." in Mozart\'s works stand for?', ['Köchel, who catalogued his works', 'Key', 'Klavier', 'Kapellmeister'], 0),
          ('In which key is Symphony No. 40?', ['C major', 'G minor', 'D major', 'E-flat major'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 3 - Vienna: Figaro and Don Giovanni (1781-1788)',
    'lessons': [
      {
        'title': 'A freelance star in Vienna', 'type': 'SLIDES', 'minutes': 15,
        'description': "Mozart was one of the first great composers to live without a permanent post - teaching, performing, publishing and writing operas.",
        'slides': [
          {'kind': 'title', 'week': 'Week 3', 'title': 'Vienna', 'subtitle': '1781 - 1788', **PORTRAIT},
          {'kind': 'bullets', 'title': 'A new life', 'bullets': [
              '1782: he marries Constanze Weber - against his father\'s wishes',
              '1782: his German opera "The Abduction from the Seraglio" is a hit',
              'He gives subscription concerts, playing his own piano concertos',
              'Joseph Haydn tells Leopold: "Your son is the greatest composer known to me in person or by name"']},
          {'kind': 'timeline', 'title': 'The great operas', 'rows': [
              ('1786', '"The Marriage of Figaro" - libretto by Lorenzo Da Ponte, Vienna'),
              ('1787', '"Don Giovanni" - premiered in Prague, which adored Mozart'),
              ('1790', '"Così fan tutte" - the third Da Ponte opera'),
              ('1791', '"The Magic Flute" - a German Singspiel for a suburban theatre')]},
          {'kind': 'bullets', 'title': 'Why Figaro was daring', 'bullets': [
              'Based on a play by Beaumarchais that was banned in Vienna for mocking the nobility',
              'The servants are cleverer than their master, the Count',
              'Mozart gives every character a voice of their own - even in ensembles where six people sing at once',
              'Next week: Mozart\'s last opera, "The Magic Flute"']},
        ],
        'library': [('cmuygtj2k00l54kkt8rbn0eup', 'Overture to "The Marriage of Figaro" - recording')],
      },
      {
        'title': 'Watch: the Queen of the Night', 'type': 'YOUTUBE', 'minutes': 5, 'video': 'https://www.youtube.com/watch?v=YuBeBjqKSGQ',
        'description': "One of the most famous - and most difficult - arias ever written: the Queen of the Night's \"Der Hölle Rache\" from The Magic Flute (1791). Diana Damrau sings it at the Royal Opera House, London.\n\nListen for:\n1. Fury in every note: the Queen orders her daughter to kill her enemy\n2. The coloratura - lightning-fast runs and staccato notes\n3. The top F (F6) - one of the highest notes in the standard opera repertoire\n\nMozart wrote the part for his sister-in-law Josepha Hofer, who had exceptional high notes.",
      },
      {
        'title': 'Listen: the Magic Flute overture', 'type': 'AUDIO', 'minutes': 7, 'libraryAudio': ['cmuygtj2j00l44kktgboi8jvw', 0],
        'description': "The overture to The Magic Flute begins with three solemn chords - the number three plays a symbolic role throughout the opera, which is full of references to Freemasonry (Mozart was a Freemason).\n\nListen for:\n1. The three majestic chords at the start\n2. A quick, bustling fugue-like theme in the violins\n3. The three chords return in the middle - three times three\n\nA historic 1922 recording of the same overture is in the Library too.",
        'library': [('cmuygtj2j00l44kktgboi8jvw', 'The Magic Flute overture'), ('cmv2j3by200t612if33bed6o6', 'Historic recording of the overture (1922)'), ('cmuygwa2y02944kktpiqlsu40', 'An aria from The Magic Flute - score')],
      },
      {
        'title': 'Week 3 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the Vienna years, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 3 in a nutshell', 'bullets': [
              '1782: marriage to Constanze Weber; "The Abduction from the Seraglio"',
              'Subscription concerts and piano concertos',
              'Operas with Lorenzo Da Ponte: Figaro, Don Giovanni, Così fan tutte',
              'Prague loved Mozart: Don Giovanni premiered there in 1787']},
        ],
        'quiz': [
          ('Whom did Mozart marry in 1782?', ['Aloysia Weber', 'Constanze Weber', 'Nannerl Mozart', 'Josepha Hofer'], 1),
          ('Who wrote the librettos for Figaro, Don Giovanni and Così fan tutte?', ['Schikaneder', 'Lorenzo Da Ponte', 'Goethe', 'Beaumarchais'], 1),
          ('In which city was Don Giovanni first performed?', ['Vienna', 'Salzburg', 'Prague', 'Milan'], 2),
          ('Which famous composer called Mozart "the greatest composer known to me"?', ['Bach', 'Haydn', 'Salieri', 'Gluck'], 1),
          ('Which character sings "Der Hölle Rache"?', ['Pamina', 'The Queen of the Night', 'Papageno', 'Susanna'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 4 - The Magic Flute and the Requiem (1788-1791)',
    'lessons': [
      {
        'title': 'The last year', 'type': 'SLIDES', 'minutes': 15,
        'description': "1791 was one of the most productive years of Mozart's life - and his last.",
        'slides': [
          {'kind': 'bullets', 'title': 'Money worries', 'bullets': [
              'From 1788 Vienna was at war with the Ottoman Empire - fewer concerts, less money',
              'Mozart borrowed from friends; his letters show real worry',
              'Yet he kept composing at an astonishing pace']},
          {'kind': 'timeline', 'title': '1791', 'rows': [
              ('January', 'His last piano concerto, No. 27 in B-flat'),
              ('September', '"La clemenza di Tito" for a coronation in Prague'),
              ('30 September', '"The Magic Flute" opens in Vienna - a huge success'),
              ('October', 'Clarinet Concerto for his friend Anton Stadler'),
              ('5 December', 'Mozart dies, aged 35, with the Requiem unfinished')]},
          {'kind': 'bullets', 'title': 'The mysterious Requiem', 'bullets': [
              'A stranger commissioned a Requiem Mass anonymously in 1791',
              'The patron was Count Walsegg, who wanted to pass it off as his own work',
              'Mozart died before finishing it; his pupil Franz Xaver Süssmayr completed it',
              'Legends about poison and rivalry with Salieri are just that - legends']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              '1791: The Magic Flute, the Clarinet Concerto, the last piano concerto',
              'Mozart died on 5 December 1791, aged 35',
              'The Requiem was completed by Süssmayr']},
        ],
      },
      {
        'title': 'Watch: the Requiem', 'type': 'YOUTUBE', 'minutes': 55, 'video': 'https://www.youtube.com/watch?v=Dp2SJN4UiE4',
        'description': "The Orchestre national de France and the Chœur de Radio France, conducted by James Gaffigan, perform Mozart's Requiem in D minor, K. 626.\n\nYou don't have to watch it all at once. Start with:\n1. The Introitus: a slow, dark opening with basset horns and bassoons\n2. The \"Dies irae\" - the day of wrath - a sudden storm\n3. The \"Lacrimosa\": Mozart wrote only its first eight bars before he died\n\nListen to how Mozart, the composer of so much bright music, sounds in his last work.",
      },
      {
        'title': 'Mozart\'s legacy', 'type': 'SLIDES', 'minutes': 12,
        'description': "Why do we still play Mozart more than 230 years later?",
        'slides': [
          {'kind': 'bullets', 'title': 'What Mozart gave us', 'bullets': [
              'Operas with real people on stage - funny, cruel, tender, all at once',
              'The piano concerto as a dialogue between soloist and orchestra',
              'Perfect balance of form and feeling',
              'Over 600 works, catalogued by Köchel: K. 1 to K. 626 (the Requiem)']},
          {'kind': 'bullets', 'title': 'Mozart today', 'bullets': [
              'The Magic Flute and Figaro are among the most performed operas worldwide',
              'Beethoven came to Vienna in 1787 hoping to study with him',
              'Salzburg celebrates him with an annual festival and the Mozarteum',
              'Generations of pianists start with his sonatas']},
          {'kind': 'summary', 'title': 'Where to go next', 'bullets': [
              'Explore Mozart\'s scores and recordings in the mymusic.coach Library',
              'Continue with "Beethoven: Life and Music" - the composer who came to Vienna to meet him',
              'Pianists: ask your teacher about the Sonata facile, K. 545']},
        ],
        'library': [('cmuygtj2k00l74kktecmzg0qb', 'String Quartet "Dissonance", K. 465 - dedicated to Haydn'), ('cmuygwa2v028w4kkt5jd7ul9j', 'The song "Abendempfindung" - score')],
      },
      {
        'title': 'Final review and quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Congratulations - you have reached the end of the course! One last recap and a final quiz across all four weeks.",
        'slides': [
          {'kind': 'timeline', 'title': 'Mozart\'s life at a glance', 'rows': [
              ('1756', 'Born in Salzburg on 27 January'),
              ('1763-1766', 'The grand tour of Europe'),
              ('1769-1773', 'Three journeys to Italy'),
              ('1781', 'Settles in Vienna as a freelance musician'),
              ('1786', 'The Marriage of Figaro'),
              ('1791', 'The Magic Flute; dies on 5 December')]},
        ],
        'quiz': [
          ('How old was Mozart when he died?', ['35', '45', '56', '27'], 0),
          ('Who completed Mozart\'s Requiem?', ['Salieri', 'Franz Xaver Süssmayr', 'Leopold Mozart', 'Haydn'], 1),
          ('For whom did Mozart write his Clarinet Concerto?', ['Anton Stadler', 'Count Walsegg', 'Emperor Joseph II', 'Lorenzo Da Ponte'], 0),
          ('Which opera opened in Vienna on 30 September 1791?', ['Don Giovanni', 'The Magic Flute', 'Idomeneo', 'The Marriage of Figaro'], 1),
          ('Who secretly commissioned the Requiem?', ['Count Walsegg', 'The Emperor', 'Salieri', 'Constanze'], 0),
          ('What does Köchel number K. 626 stand for?', ['The Magic Flute', 'The Requiem', 'Symphony No. 40', 'The Sonata facile'], 1),
        ],
      },
    ],
  },
]
