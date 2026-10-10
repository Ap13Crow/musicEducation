# Johann Sebastian Bach - a 4-week first-level introduction.
COURSE = {
    'slug': 'bach-life-and-music-introduction',
    'title': 'Johann Sebastian Bach: Life and Music - A First Introduction',
    'shortSummary': 'Four weeks with Johann Sebastian Bach: an orphan from Eisenach who became the great master of the Baroque - organ, Brandenburg Concertos, Goldberg Variations and the St Matthew Passion.',
    'description': (
        "Johann Sebastian Bach (1685-1750) never left Germany, worked as an organist, court musician and church music director - "
        "and wrote music that musicians all over the world still study every day. Composers from Mozart to the Beatles learned from him.\n\n"
        "In four weeks you follow his life step by step:\n"
        "- Week 1 - A family of musicians: Eisenach, Ohrdruf, Lüneburg (1685-1703)\n"
        "- Week 2 - The young organist: Arnstadt, Mühlhausen, Weimar (1703-1717)\n"
        "- Week 3 - Köthen: Brandenburg Concertos and the Well-Tempered Clavier (1717-1723)\n"
        "- Week 4 - Leipzig: cantatas, passions and the Goldberg Variations (1723-1750)\n\n"
        "Every week combines illustrated slides, videos from the Netherlands Bach Society, recordings and scores from the mymusic.coach Library, "
        "and a short quiz. No previous knowledge is needed. Plan about 1-2 hours per week."
    ),
    'level': 'BEGINNER',
    'instruments': ['Piano', 'Violin', 'Cello'],
    'musicStyles': ['Baroque'],
    'cover': {'image': 'bach_portrait', 'title': 'Bach', 'subtitle': 'Life and Music - A First Introduction', 'tag': '4-week course'},
}
FOOTER = 'Johann Sebastian Bach: Life and Music'
PORTRAIT = {'image': 'bach_portrait', 'credit': 'Portrait by Elias Gottlob Haussmann, 1748 (public domain)'}
GOLDBERG = 'cmuygtizf00jj4kktc8xi94bw'

WEEKS = [
  {
    'title': 'Week 1 - A Family of Musicians (1685-1703)',
    'lessons': [
      {
        'title': 'Welcome: meet Johann Sebastian Bach', 'type': 'SLIDES', 'minutes': 10, 'preview': True,
        'description': "Welcome to the course! Meet the man behind the wig and the stern portrait - and see how the next four weeks work.\n\nTip: all music mentioned in this course is linked from the lessons - open it in the Library, read the scores and earn extra XP for reading or listening to the end.",
        'slides': [
          {'kind': 'title', 'week': 'Week 1', 'title': 'Meet Johann Sebastian Bach', 'subtitle': 'A first introduction to his life and music', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Why Bach?', 'bullets': [
              'Born in Eisenach in 1685 - died in Leipzig in 1750',
              'Organist, court musician and church music director - never an opera composer',
              'Over 1,000 works survive: organ and keyboard music, concertos, cantatas, passions',
              'The greatest master of counterpoint: several melodies woven together at once',
              'Mozart, Beethoven, Chopin and Mendelssohn all studied his music']},
          {'kind': 'timeline', 'title': 'Your four weeks', 'rows': [
              ('Week 1', 'A family of musicians (1685-1703)'),
              ('Week 2', 'The young organist (1703-1717)'),
              ('Week 3', 'Köthen: concertos and the Well-Tempered Clavier'),
              ('Week 4', 'Leipzig: cantatas, passions, Goldberg Variations')]},
          {'kind': 'bullets', 'title': 'What does "Baroque" mean?', 'bullets': [
              'The period of music from about 1600 to 1750 - Bach\'s death marks its end',
              'A steady bass line (basso continuo) carries the music',
              'Long, flowing melodies and strong, regular rhythms',
              'Contrasts: loud and soft, soloist and orchestra, one instrument against many']},
          {'kind': 'quote', 'quote': 'The aim and final end of all music should be none other than the glory of God and the refreshment of the soul.', 'by': 'Attributed to Bach, in a figured-bass treatise copied by his pupils (1738)'},
        ],
      },
      {
        'title': 'An orphan in a musical family', 'type': 'SLIDES', 'minutes': 15,
        'description': "Bach came from a family in which almost everyone was a musician. These slides tell the story of his childhood - and of the brother who taught him after he lost both parents.",
        'slides': [
          {'kind': 'bullets', 'title': 'Eisenach, March 1685', 'bullets': [
              'Born on 21 March 1685 in Eisenach, Thuringia, the youngest of eight children',
              'His father Johann Ambrosius was the town musician - a violinist and trumpeter',
              'Over seven generations the Bach family produced more than 50 professional musicians',
              'In some Thuringian towns "a Bach" simply meant "a musician"']},
          {'kind': 'timeline', 'title': 'A hard childhood', 'rows': [
              ('1694', 'His mother Maria Elisabeth dies - Johann Sebastian is nine'),
              ('1695', 'His father dies less than a year later'),
              ('1695', 'He moves to Ohrdruf, to his eldest brother Johann Christoph, an organist'),
              ('1700', 'Aged 15, he walks to Lüneburg and sings in the choir of St Michael\'s School'),
              ('1703', 'First job: violinist at the court of Weimar, then organist in Arnstadt')]},
          {'kind': 'bullets', 'title': 'Learning by copying', 'bullets': [
              'His brother taught him the keyboard',
              'A famous story: young Sebastian secretly copied a locked book of music by moonlight - for months',
              'Copying out other composers\' music was how he learned all his life',
              'In Lüneburg he heard the great organist Georg Böhm and the French music of the nearby court in Celle']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Born 21 March 1685 in Eisenach into a family of musicians',
              'Orphaned at ten, raised by his brother in Ohrdruf',
              'Choirboy in Lüneburg from 1700',
              'He learned by copying and studying the music of others']},
        ],
      },
      {
        'title': 'Watch: Bach\'s life and places', 'type': 'YOUTUBE', 'minutes': 25, 'video': 'https://www.youtube.com/watch?v=qqmhYsF-JrE',
        'description': "This documentary visits the places where Bach lived and worked, from Eisenach to Leipzig.\n\nWhile you watch, look out for:\n1. In which towns did Bach work - and in what order?\n2. Which jobs did he have at courts, and which for churches?\n3. How large was Bach's family?\n\nDon't worry about remembering everything - every part of the story comes back in the next weeks.",
      },
      {
        'title': 'Week 1 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "A short recap of week 1, a first piece to explore, and five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 1 in a nutshell', 'bullets': [
              'Born in Eisenach on 21 March 1685',
              'A family of musicians over seven generations',
              'Orphaned at ten - raised by his brother Johann Christoph',
              'Choirboy at St Michael\'s School in Lüneburg',
              '1703: his first jobs as a musician']},
          {'kind': 'bullets', 'title': 'Explore this week', 'bullets': [
              'The famous "Minuet in G" from the notebook for Anna Magdalena Bach - a first piece for many piano students',
              'Fun fact: researchers found that it was actually written by Christian Petzold - Bach copied it for his family',
              'A historic recording of it from 1924 is in the Library too']},
        ],
        'library': [('cmuygw98a01th4kkt69w3wfcf', 'The Minuet in G from the Anna Magdalena notebook - score'), ('cmv2j6zl4010w12ifusp63hw3', 'Historic recording of the Minuet in G (1924)')],
        'quiz': [
          ('In which town was Johann Sebastian Bach born?', ['Leipzig', 'Eisenach', 'Weimar', 'Hamburg'], 1),
          ('What happened when Bach was nine and ten years old?', ['He became a court musician', 'He lost his mother and then his father', 'He moved to Italy', 'He wrote his first cantata'], 1),
          ('Who looked after young Bach in Ohrdruf?', ['His eldest brother, an organist', 'The Duke of Weimar', 'His uncle in Leipzig', 'A monastery school'], 0),
          ('Where did Bach sing as a choirboy from 1700?', ['Vienna', 'Dresden', 'Lüneburg', 'Lübeck'], 2),
          ('How did Bach learn the music of other composers?', ['From recordings', 'Mostly by copying it out by hand', 'At university', 'Only by ear'], 1),
        ],
      },
    ],
  },
  {
    'title': 'Week 2 - The Young Organist (1703-1717)',
    'lessons': [
      {
        'title': 'Organist in Arnstadt, Mühlhausen and Weimar', 'type': 'SLIDES', 'minutes': 15,
        'description': "Bach was first famous as an organist - and a rather headstrong young employee. Here is how his career began.",
        'slides': [
          {'kind': 'title', 'week': 'Week 2', 'title': 'The young organist', 'subtitle': '1703 - 1717', **PORTRAIT},
          {'kind': 'bullets', 'title': 'Arnstadt: a walk to Lübeck', 'bullets': [
              'In 1703 Bach became organist of the New Church in Arnstadt',
              'In 1705 he walked about 400 km to Lübeck to hear the great organist Dieterich Buxtehude',
              'He was given four weeks\' leave - and stayed about four months',
              'Back home the church council complained about his "strange" harmonies that confused the congregation']},
          {'kind': 'timeline', 'title': 'Stepping stones', 'rows': [
              ('1707', 'Organist in Mühlhausen; marries his cousin Maria Barbara Bach'),
              ('1708', 'Court organist in Weimar'),
              ('1714', 'Promoted to concertmaster - he now composes a cantata every month'),
              ('1717', 'Wants to leave for Köthen - the Duke has him jailed for almost four weeks'),
              ('1717', 'Released "in disgrace" - and starts his new job in Köthen')]},
          {'kind': 'bullets', 'title': 'The king of the organ', 'bullets': [
              'Most of Bach\'s great organ works date from these years',
              'He could test a new organ in minutes - and was asked to inspect organs all his life',
              'His improvisations were legendary: he could invent a fugue on the spot',
              'In 1717 a planned keyboard contest in Dresden ended before it began - his rival Louis Marchand left town early']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Organist in Arnstadt, Mühlhausen and Weimar',
              '1705: the long walk to hear Buxtehude in Lübeck',
              'Weimar: great organ works and his first cantatas',
              'He was so determined to leave Weimar that he was briefly jailed']},
        ],
      },
      {
        'title': 'Watch: a Bach toccata', 'type': 'YOUTUBE', 'minutes': 10, 'video': 'https://www.youtube.com/watch?v=WialMe-8zaU',
        'description': "A toccata (from the Italian \"toccare\", to touch) is a showpiece that lets the player shine. Bart Jacobs plays Bach's Toccata in E minor, BWV 914, for the Netherlands Bach Society.\n\nListen for:\n1. The free, improvised-sounding opening\n2. Sections that change tempo and character - like a series of short scenes\n3. The fugue at the end: one short melody (the subject) enters in one voice after another\n\nThen open the most famous toccata of all, the Toccata and Fugue in D minor, BWV 565, in the Library and look at its dramatic first bars.",
        'library': [('cmuygw8yz01mh4kkthvxs2qic', 'Toccata and Fugue in D minor, BWV 565 - score')],
      },
      {
        'title': 'How a fugue works', 'type': 'SLIDES', 'minutes': 12,
        'description': "The fugue was Bach's favourite form. Once you know the four basic ideas, you can follow almost any fugue.",
        'slides': [
          {'kind': 'bullets', 'title': 'A musical conversation', 'bullets': [
              'A fugue is built from one short melody: the subject',
              'One voice states the subject alone',
              'A second voice answers with the same melody, a little higher or lower',
              'More voices enter, one by one - all of them independent, all equally important']},
          {'kind': 'listen', 'title': 'Follow a fugue', 'work': 'Invention No. 1 in C major, BWV 772', 'points': [
              'Bach\'s two-part Inventions are the perfect first step: two voices only',
              'The short opening figure in the right hand is answered by the left hand',
              'The figure keeps coming back - upside down, higher, lower',
              'Open the score in the Library and mark every place the opening figure appears']},
          {'kind': 'bullets', 'title': 'Why it still matters', 'bullets': [
              'Counterpoint trains you to hear several things at once',
              'Bach wrote the Inventions to teach "a cantabile style of playing" - singing on the keyboard',
              'Pianists still learn them today - and Beethoven, Chopin and many others practised Bach daily']},
        ],
        'library': [('cmuygw92d01pd4kkthosmeill', 'Invention No. 1 in C major, BWV 772 - score')],
      },
      {
        'title': 'Week 2 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of Bach's years as an organist, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 2 in a nutshell', 'bullets': [
              '1703: organist in Arnstadt',
              '1705: on foot to Lübeck to hear Buxtehude',
              '1707: Mühlhausen and marriage to Maria Barbara',
              '1708-1717: court organist and concertmaster in Weimar',
              'The fugue: one subject, several independent voices']},
        ],
        'quiz': [
          ('Which famous organist did Bach walk about 400 km to hear?', ['Georg Friedrich Handel', 'Dieterich Buxtehude', 'Antonio Vivaldi', 'Johann Pachelbel'], 1),
          ('What happened when Bach wanted to leave Weimar in 1717?', ['He got a pay rise', 'The Duke had him jailed for almost four weeks', 'He was sent to Italy', 'He had to pay a large fine'], 1),
          ('What is the "subject" of a fugue?', ['The title of the piece', 'The short main melody that every voice takes up', 'The final chord', 'The person it is dedicated to'], 1),
          ('Whom did Bach marry in 1707?', ['Anna Magdalena Wilcke', 'His cousin Maria Barbara Bach', 'A princess of Köthen', 'Nobody - he married only once, in 1721'], 1),
          ('What does "toccata" come from?', ['The Italian word for "to touch"', 'A town in Germany', 'A dance from France', 'The name of an organ builder'], 0),
        ],
      },
    ],
  },
  {
    'title': 'Week 3 - Köthen: Concertos and the Well-Tempered Clavier (1717-1723)',
    'lessons': [
      {
        'title': 'Court musician in Köthen', 'type': 'SLIDES', 'minutes': 15,
        'description': "At the court of a music-loving young prince, Bach wrote some of the most joyful instrumental music ever composed - and lived through great sorrow.",
        'slides': [
          {'kind': 'title', 'week': 'Week 3', 'title': 'Köthen', 'subtitle': '1717 - 1723', **PORTRAIT},
          {'kind': 'bullets', 'title': 'A prince who loved music', 'bullets': [
              'Prince Leopold of Anhalt-Köthen played the violin, viola da gamba and harpsichord',
              'Bach became his Kapellmeister - director of a fine court orchestra',
              'The court church was Calvinist and used little music - so Bach wrote mostly for instruments',
              'Masterpieces of these years: the cello suites, the violin sonatas and partitas, the Brandenburg Concertos']},
          {'kind': 'timeline', 'title': 'Joy and sorrow', 'rows': [
              ('1720', 'Returning from a journey with the prince, Bach learns that his wife Maria Barbara has died'),
              ('1721', 'He sends six concertos to the Margrave of Brandenburg - the "Brandenburg" Concertos'),
              ('1721', 'Marries Anna Magdalena Wilcke, a court singer'),
              ('1722', 'Completes Book 1 of the Well-Tempered Clavier'),
              ('1723', 'Moves to Leipzig as cantor of St Thomas')]},
          {'kind': 'bullets', 'title': 'The Well-Tempered Clavier', 'bullets': [
              '24 preludes and fugues - one in every major and minor key',
              '"Well-tempered" means a tuning in which all keys sound good',
              'Book 2 followed around 1742: another 24',
              'Pianists call it the "Old Testament" of piano music']},
          {'kind': 'listen', 'title': 'Prelude No. 1 in C major', 'work': 'Well-Tempered Clavier I, BWV 846', 'points': [
              'A single pattern of broken chords from beginning to end',
              'Only the harmony changes - one chord per bar',
              'Listen how tension builds over a long held bass note before the end',
              'Gounod later wrote his "Ave Maria" melody on top of this very prelude']},
        ],
        'library': [('cmuygw94v01qi4kktwlxbfn8g', 'Prelude No. 1 in C major, BWV 846 - score'), ('cmuygw94p01qg4kktleg0qfhx', 'The fugue that follows it'), ('cmuygw8u401ko4kktl6eoo2ed', 'The famous "Air on the G String", BWV 1068 - score')],
      },
      {
        'title': 'Watch: Brandenburg Concerto No. 3', 'type': 'YOUTUBE', 'minutes': 12, 'video': 'https://www.youtube.com/watch?v=qr0f6t2UbOo',
        'description': "In 1721 Bach sent six concertos, beautifully copied out, to Christian Ludwig, Margrave of Brandenburg. The Margrave probably never had them performed - but today they are among the most played Baroque works. The Netherlands Bach Society with Shunske Sato plays the third concerto.\n\nListen for:\n1. Three violins, three violas, three cellos - a concerto for groups of three\n2. The players pass short motifs around like a ball\n3. The \"slow movement\" is just two chords - the players improvise a bridge between the fast movements\n\nDid you know? The first movement of Brandenburg Concerto No. 2 travels through space on the Voyager Golden Record (1977).",
      },
      {
        'title': 'Bach\'s family', 'type': 'SLIDES', 'minutes': 10,
        'description': "Bach had twenty children. Several of his sons became famous composers in their own right.",
        'slides': [
          {'kind': 'bullets', 'title': 'Twenty children', 'bullets': [
              'Seven children with Maria Barbara, thirteen with Anna Magdalena',
              'Only ten survived to adulthood - child mortality was very high',
              'The household was a music school: children, pupils and relatives played together',
              'For Anna Magdalena and the children he compiled the "Notebooks" of easy pieces']},
          {'kind': 'bullets', 'title': 'Musical sons', 'bullets': [
              'Wilhelm Friedemann (1710-1784) - organist in Dresden and Halle',
              'Carl Philipp Emanuel (1714-1788) - court musician to Frederick the Great, then in Hamburg; Haydn and Beethoven admired him',
              'Johann Christian (1735-1782) - "the London Bach", who befriended the eight-year-old Mozart',
              'For decades after 1750 "Bach" usually meant one of the sons, not the father']},
          {'kind': 'summary', 'title': 'Remember', 'bullets': [
              'Köthen: Brandenburg Concertos, cello suites, Well-Tempered Clavier',
              '1720: death of Maria Barbara; 1721: marriage to Anna Magdalena',
              'Twenty children - three sons became famous composers']},
        ],
      },
      {
        'title': 'Week 3 review and quiz', 'type': 'SLIDES', 'minutes': 10, 'xp': 20,
        'description': "Recap of the Köthen years, then five questions.",
        'slides': [
          {'kind': 'summary', 'title': 'Week 3 in a nutshell', 'bullets': [
              '1717-1723: Kapellmeister to Prince Leopold of Köthen',
              'Instrumental masterpieces: cello suites, violin partitas, Brandenburg Concertos',
              '1722: Well-Tempered Clavier, Book 1 - 24 preludes and fugues',
              '1721: marriage to the singer Anna Magdalena Wilcke']},
        ],
        'library': [('cmuygw8tt01k94kktr0aiwa4q', 'A cello suite to explore: the Prélude of Suite No. 6')],
        'quiz': [
          ('Why did Bach write mostly instrumental music in Köthen?', ['He disliked singers', 'The court church used little music', 'There was no organ in town', 'The prince was deaf'], 1),
          ('To whom are the "Brandenburg" Concertos dedicated?', ['The King of Prussia', 'The Margrave of Brandenburg', 'Prince Leopold', 'The city of Leipzig'], 1),
          ('How many preludes and fugues are in Book 1 of the Well-Tempered Clavier?', ['12', '24', '30', '48'], 1),
          ('Which composer wrote an "Ave Maria" on top of Bach\'s Prelude in C major?', ['Schubert', 'Gounod', 'Verdi', 'Mozart'], 1),
          ('Which of Bach\'s sons was known as "the London Bach"?', ['Carl Philipp Emanuel', 'Wilhelm Friedemann', 'Johann Christian', 'Johann Christoph'], 2),
        ],
      },
    ],
  },
  {
    'title': 'Week 4 - Leipzig: Cantatas, Passions and the Goldberg Variations (1723-1750)',
    'lessons': [
      {
        'title': 'Cantor of St Thomas', 'type': 'SLIDES', 'minutes': 15,
        'description': "For the last 27 years of his life Bach was responsible for the music of Leipzig's main churches - an enormous workload that produced some of his greatest music.",
        'slides': [
          {'kind': 'image', 'title': 'Leipzig, 1723', 'text': 'Bach became cantor of the St Thomas School and music director of the city\'s main churches. He taught the boys of the school, rehearsed the choirs and wrote music for every Sunday.', 'image': 'bach_leipzig', 'credit': 'St Thomas Church and School, Leipzig, engraving, 1735 (public domain)'},
          {'kind': 'bullets', 'title': 'A cantata every week', 'bullets': [
              'In his first years he wrote a new cantata for almost every Sunday and feast day',
              'About 200 of his church cantatas survive',
              'Each one combines choruses, arias, recitatives and a chorale - a hymn the congregation knew']},
          {'kind': 'timeline', 'title': 'Masterworks of the Leipzig years', 'rows': [
              ('1724', 'St John Passion'),
              ('1727', 'St Matthew Passion'),
              ('1734', 'Christmas Oratorio'),
              ('1741', 'Goldberg Variations published'),
              ('1747', 'The Musical Offering - on a theme by King Frederick the Great'),
              ('1749', 'Mass in B minor completed')]},
          {'kind': 'bullets', 'title': 'The last years', 'bullets': [
              'In 1747 he visited Frederick the Great in Potsdam and improvised on the king\'s own theme',
              'His eyesight failed; two operations in 1750 by the travelling eye surgeon John Taylor went badly',
              'Bach died on 28 July 1750 in Leipzig',
              'His last great project, The Art of Fugue, remained unfinished']},
        ],
      },
      {
        'title': 'Listen: the Goldberg Variations', 'type': 'AUDIO', 'minutes': 5, 'libraryAudio': [GOLDBERG, 0],
        'description': "Published in 1741, the Goldberg Variations are an Aria followed by 30 variations and the Aria again. A famous story - told by Bach's first biographer Forkel in 1802, and probably more legend than fact - says they were written for Count Keyserlingk, who could not sleep, and his young harpsichordist Johann Gottlieb Goldberg.\n\nHere you hear the Aria, the gentle theme at the start (Musopen recording, public domain).\n\nListen for:\n1. A slow, ornamented melody - like a sarabande, a stately dance\n2. The bass line: the variations are built on this bass, not on the melody\n3. Afterwards, open the full recording in the Library: every third variation is a canon, in which one voice imitates another\n\nAll 32 tracks and the scores of every variation are in the Library.",
        'library': [(GOLDBERG, 'The complete Goldberg Variations - all 32 tracks'), ('cmuygw97m01sa4kktvp0yth9e', 'The Aria - score'), ('cmuygw97r01si4kkt998of1zs', 'Variation 3: the first canon - score')],
      },
      {
        'title': 'Bach\'s legacy', 'type': 'SLIDES', 'minutes': 12,
        'description': "After his death Bach was almost forgotten by the public - until a 20-year-old called Felix Mendelssohn brought him back.",
        'slides': [
          {'kind': 'bullets', 'title': 'Forgotten - and rediscovered', 'bullets': [
              'After 1750 Bach\'s style seemed old-fashioned - but musicians kept studying his keyboard works',
              'Mozart and Beethoven copied and played his fugues',
              'On 11 March 1829 Felix Mendelssohn conducted the St Matthew Passion in Berlin - its first performance since Bach\'s death',
              'It started the "Bach revival" that continues to this day']},
          {'kind': 'bullets', 'title': 'Bach today', 'bullets': [
              'His works are numbered in the Bach-Werke-Verzeichnis: BWV 1 to over 1,100',
              'Three Bach pieces fly on the Voyager Golden Record, now beyond our solar system',
              'Jazz musicians, rock bands and film composers borrow his ideas',
              'Every serious pianist, organist, violinist and cellist plays Bach']},
          {'kind': 'quote', 'quote': 'Not Bach - Meer sollte er heissen.', 'by': 'Beethoven\'s pun: "He should not be called Bach (brook) but Meer (ocean)" - reported by his contemporaries'},
          {'kind': 'summary', 'title': 'Where to go next', 'bullets': [
              'Explore hundreds of Bach scores in the mymusic.coach Library',
              'Continue with "Felix Mendelssohn" - the man who brought Bach back',
              'Pianists: ask your teacher about the Minuet in G or Invention No. 1']},
        ],
      },
      {
        'title': 'Final review and quiz', 'type': 'SLIDES', 'minutes': 12, 'xp': 30,
        'description': "Congratulations - you have reached the end of the course! One last recap and a final quiz across all four weeks.",
        'slides': [
          {'kind': 'timeline', 'title': 'Bach\'s life at a glance', 'rows': [
              ('1685', 'Born in Eisenach on 21 March'),
              ('1695', 'Orphaned - moves to his brother in Ohrdruf'),
              ('1703', 'Organist in Arnstadt'),
              ('1708', 'Court organist in Weimar'),
              ('1717', 'Kapellmeister in Köthen'),
              ('1723', 'Cantor of St Thomas, Leipzig'),
              ('1750', 'Dies in Leipzig on 28 July')]},
        ],
        'quiz': [
          ('What was Bach\'s job in Leipzig?', ['Opera director', 'Cantor of St Thomas and city music director', 'Court organist to the king', 'Professor at the university'], 1),
          ('About how many of Bach\'s church cantatas survive?', ['20', '200', '600', '1,000'], 1),
          ('Who conducted the famous 1829 revival of the St Matthew Passion?', ['Beethoven', 'Felix Mendelssohn', 'Mozart', 'Brahms'], 1),
          ('What is the structure of the Goldberg Variations?', ['Four movements', 'An aria, 30 variations and the aria again', '24 preludes and fugues', 'Six concertos'], 1),
          ('Which king gave Bach the theme for The Musical Offering?', ['Louis XIV', 'Frederick the Great', 'George II', 'Augustus the Strong'], 1),
          ('In which year did Bach die?', ['1723', '1741', '1750', '1791'], 2),
        ],
      },
    ],
  },
]
