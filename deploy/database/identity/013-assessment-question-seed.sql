-- Seeds the onboarding assessment question bank. Previously the frontend
-- used a hardcoded 2-theory/1-culture question set and never queried this
-- table at all (assessmentQuestions existed but was unused, and had its own
-- separate bug - see the AssessmentQuestion.question field resolver added
-- alongside this file). Deterministic ids + ON CONFLICT DO NOTHING make this
-- safe to re-apply on every deploy, same idempotency contract as every other
-- file here.
BEGIN;

INSERT INTO "AssessmentQuestion" ("id", "category", "difficulty", "instrument", "prompt", "options", "createdAt") VALUES
  ('seed-theory-01', 'THEORY', 'BEGINNER', NULL, 'How many lines does a standard musical staff have?',
    '[{"id":"a","text":"4","isCorrect":false},{"id":"b","text":"5","isCorrect":true},{"id":"c","text":"6","isCorrect":false},{"id":"d","text":"7","isCorrect":false}]'::jsonb, now()),
  ('seed-theory-02', 'THEORY', 'BEGINNER', NULL, 'How many semitones are in a perfect fifth?',
    '[{"id":"a","text":"5","isCorrect":false},{"id":"b","text":"7","isCorrect":true},{"id":"c","text":"12","isCorrect":false},{"id":"d","text":"4","isCorrect":false}]'::jsonb, now()),
  ('seed-theory-03', 'THEORY', 'BEGINNER', NULL, 'What does a "sharp" symbol (♯) do to a note?',
    '[{"id":"a","text":"Raises it by a semitone","isCorrect":true},{"id":"b","text":"Lowers it by a semitone","isCorrect":false},{"id":"c","text":"Doubles its duration","isCorrect":false},{"id":"d","text":"Mutes it","isCorrect":false}]'::jsonb, now()),
  ('seed-theory-04', 'THEORY', 'INTERMEDIATE', NULL, 'Which clef is typically used for cello music?',
    '[{"id":"a","text":"Treble clef","isCorrect":false},{"id":"b","text":"Alto clef","isCorrect":false},{"id":"c","text":"Bass clef","isCorrect":true},{"id":"d","text":"Soprano clef","isCorrect":false}]'::jsonb, now()),
  ('seed-theory-05', 'THEORY', 'INTERMEDIATE', NULL, 'How many sharps are in the key signature of D major?',
    '[{"id":"a","text":"0","isCorrect":false},{"id":"b","text":"1","isCorrect":false},{"id":"c","text":"2","isCorrect":true},{"id":"d","text":"3","isCorrect":false}]'::jsonb, now()),
  ('seed-theory-06', 'THEORY', 'INTERMEDIATE', NULL, 'What is a "dominant seventh" chord built on scale degree 5 called in Roman numeral analysis?',
    '[{"id":"a","text":"I7","isCorrect":false},{"id":"b","text":"IV7","isCorrect":false},{"id":"c","text":"V7","isCorrect":true},{"id":"d","text":"vi7","isCorrect":false}]'::jsonb, now()),
  ('seed-theory-07', 'THEORY', 'ADVANCED', NULL, 'A modulation to the relative minor of C major moves to which key?',
    '[{"id":"a","text":"A minor","isCorrect":true},{"id":"b","text":"E minor","isCorrect":false},{"id":"c","text":"G minor","isCorrect":false},{"id":"d","text":"D minor","isCorrect":false}]'::jsonb, now()),
  ('seed-theory-08', 'THEORY', 'ADVANCED', NULL, 'In a Neapolitan sixth chord, the root is built on which scale degree, and in what inversion is it normally used?',
    '[{"id":"a","text":"Lowered 2nd, first inversion","isCorrect":true},{"id":"b","text":"Raised 4th, root position","isCorrect":false},{"id":"c","text":"Lowered 6th, second inversion","isCorrect":false},{"id":"d","text":"Raised 7th, root position","isCorrect":false}]'::jsonb, now()),
  ('seed-theory-piano-01', 'THEORY', 'INTERMEDIATE', 'Piano', 'On a piano keyboard, which finger is conventionally used to play middle C in a C major scale, right hand ascending?',
    '[{"id":"a","text":"Thumb (1)","isCorrect":true},{"id":"b","text":"Index (2)","isCorrect":false},{"id":"c","text":"Middle (3)","isCorrect":false},{"id":"d","text":"Pinky (5)","isCorrect":false}]'::jsonb, now()),
  ('seed-theory-violin-01', 'THEORY', 'INTERMEDIATE', 'Violin', 'What are the four open strings of a violin, from lowest to highest?',
    '[{"id":"a","text":"G, D, A, E","isCorrect":true},{"id":"b","text":"C, G, D, A","isCorrect":false},{"id":"c","text":"D, A, E, B","isCorrect":false},{"id":"d","text":"G, C, F, B♭","isCorrect":false}]'::jsonb, now()),

  ('seed-culture-01', 'CULTURE', 'BEGINNER', NULL, 'During which period did Ludwig van Beethoven primarily compose?',
    '[{"id":"a","text":"Baroque","isCorrect":false},{"id":"b","text":"Classical / Early Romantic","isCorrect":true},{"id":"c","text":"Modern","isCorrect":false},{"id":"d","text":"Renaissance","isCorrect":false}]'::jsonb, now()),
  ('seed-culture-02', 'CULTURE', 'BEGINNER', NULL, 'Who composed "The Four Seasons"?',
    '[{"id":"a","text":"Johann Sebastian Bach","isCorrect":false},{"id":"b","text":"Antonio Vivaldi","isCorrect":true},{"id":"c","text":"Wolfgang Amadeus Mozart","isCorrect":false},{"id":"d","text":"Franz Schubert","isCorrect":false}]'::jsonb, now()),
  ('seed-culture-03', 'CULTURE', 'BEGINNER', NULL, 'What era is generally considered to run from roughly 1600 to 1750?',
    '[{"id":"a","text":"Renaissance","isCorrect":false},{"id":"b","text":"Baroque","isCorrect":true},{"id":"c","text":"Classical","isCorrect":false},{"id":"d","text":"Romantic","isCorrect":false}]'::jsonb, now()),
  ('seed-culture-04', 'CULTURE', 'INTERMEDIATE', NULL, 'Which composer is most associated with the Nine Symphonies and the "Ode to Joy"?',
    '[{"id":"a","text":"Johannes Brahms","isCorrect":false},{"id":"b","text":"Ludwig van Beethoven","isCorrect":true},{"id":"c","text":"Gustav Mahler","isCorrect":false},{"id":"d","text":"Franz Liszt","isCorrect":false}]'::jsonb, now()),
  ('seed-culture-05', 'CULTURE', 'INTERMEDIATE', NULL, 'Claude Debussy is most closely associated with which musical movement?',
    '[{"id":"a","text":"Impressionism","isCorrect":true},{"id":"b","text":"Minimalism","isCorrect":false},{"id":"c","text":"Serialism","isCorrect":false},{"id":"d","text":"Neoclassicism","isCorrect":false}]'::jsonb, now()),
  ('seed-culture-06', 'CULTURE', 'INTERMEDIATE', NULL, 'Which of these operas was composed by Giuseppe Verdi?',
    '[{"id":"a","text":"The Magic Flute","isCorrect":false},{"id":"b","text":"La Traviata","isCorrect":true},{"id":"c","text":"Carmen","isCorrect":false},{"id":"d","text":"Tosca","isCorrect":false}]'::jsonb, now()),
  ('seed-culture-07', 'CULTURE', 'ADVANCED', NULL, 'The premiere of which work caused a near-riot in Paris in 1913?',
    '[{"id":"a","text":"Stravinsky''s The Rite of Spring","isCorrect":true},{"id":"b","text":"Ravel''s Boléro","isCorrect":false},{"id":"c","text":"Debussy''s Prélude à l''après-midi d''un faune","isCorrect":false},{"id":"d","text":"Satie''s Gymnopédies","isCorrect":false}]'::jsonb, now()),
  ('seed-culture-08', 'CULTURE', 'ADVANCED', NULL, 'Which twentieth-century technique, pioneered by Arnold Schoenberg, organizes all twelve chromatic pitches with equal weight?',
    '[{"id":"a","text":"Twelve-tone (serial) technique","isCorrect":true},{"id":"b","text":"Minimalism","isCorrect":false},{"id":"c","text":"Aleatoric composition","isCorrect":false},{"id":"d","text":"Modal jazz","isCorrect":false}]'::jsonb, now())
ON CONFLICT ("id") DO NOTHING;

COMMIT;
