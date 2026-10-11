# Courses (English, German, French)

Composer courses: 4-week first-level courses (16 lessons, 21 quiz questions each), taught by Helene (Camille) Bruneau (teacher profile cmtagq6za000lmhras87yoj4r), sold at CHF 10 (free with
mymusic.coach Plus, for the teacher's subscribers and students, and for
invited people - apps/api/src/lib/courseAccess.ts).

- One module per course and language - all course content (lesson texts,
  slide decks, quizzes, YouTube/audio sources, Library references). Twelve
  English originals (`beethoven.py`, `schubert.py`, `bach.py`, `mozart.py`,
  `fanny.py`, `felix.py`, `chopin.py`, `clara.py`, `brahms.py`, `dvorak.py`,
  `debussy.py`, `chaminade.py`), each with a German (`*_de.py`) and a French
  (`*_fr.py`) edition. An edition sets `COURSE['language']` and
  `COURSE['translationOf']` (the original's slug); everything but the words
  must match the original - check with
  `python3 -I tools/check_translation.py bach bach_de bach_fr`.
  Videos stay the same in every language; their descriptions say when a
  video is in another language.
- `render_slides.py` - renders slides (1600x900) and covers (1200x675) to PNG
  plus `manifest.json`, in the Playwright container:
  `docker run --rm -v "$PWD":/w -w /w mcr.microsoft.com/playwright/python:v1.47.0-jammy sh -c 'pip install -q playwright==1.47.0; python3 -I render_slides.py beethoven out/beethoven'`
- `assets/` - not committed: the images listed in `images.tsv` (Wikimedia
  Commons, public domain / CC BY-SA - credits are on the slides) saved as
  `<key>.jpg`, and the Playfair Display + Inter woff2 files in `assets/fonts/`.
- `seedCourses.mjs` - runs inside the API pod: uploads slides to the media
  store and (re)builds the courses. A course with enrollments is left alone
  unless `FORCE=1`.
  `tar -C out -cf - beethoven schubert | kubectl -n mymusic-coach exec -i deploy/api -- sh -c 'mkdir -p /tmp/courses && tar -xf - -C /tmp/courses'`
  then `kubectl -n mymusic-coach exec -i deploy/api -- sh -c 'cat > /tmp/seed.mjs && cd /app && node /tmp/seed.mjs /tmp/courses <teacherProfileId>' < seedCourses.mjs`

- `lesson.libraryAudio = [itemId, fileIndex]` plays a Library recording in an
  AUDIO lesson (the mirrored `/api/library/items/<id>/files/<i>.audio` when
  available, otherwise the file's source URL).
- `tools/` - helpers used while writing: `checkids.py` checks every Library id
  in a course module against a catalogue dump; `findAudio.mjs` (TERMS=a,b) and
  `itemInfo.mjs` (IDS=...) look up Library items in the API pod (prepend the
  DATABASE_URL prelude from seedCourses.mjs). Videos are checked with YouTube
  oEmbed (embeddable, channel) before use.
- Editions are linked by `Course.translationKey` (migration 054; the English
  slug): the course page shows the other languages, the list filters by
  language, and the membership counts a course once across its languages.

## Solfège year (music theory)

Three 16-week courses that together cover a year of music reading and theory
(category Music Theory, same teacher and price): `solfege1.py` (beginner:
staff, clefs, rhythm, accidentals, scales, intervals), `solfege2.py`
(intermediate: keys, minor, interval qualities, compound time, triads,
cadences, alto clef, form), `solfege3.py` (advanced: modes, seventh chords,
non-chord tones, SATB, figured bass, secondary dominants, modulation,
transposing instruments, score reading, sonata form). 48 lessons and 240-280
quiz questions each.

- Written once in three languages: every text is `L(en, de, fr)`; music is
  ABC notation written once (abcjs renders it), so all editions share it.
  `solfege_common.build(COURSE, FOOTER, WEEKS, lang)` turns the source into
  a plain module; `solfege1.py` is itself the English edition,
  `solfege1_de.py` / `solfege1_fr.py` build the others.
- Note names follow each language: `{n:F#4}` in any text becomes F♯ / Fis /
  fa♯ (German H for B, B for B♭, Es/As; French fixed do). Key, interval,
  chord and mode names come from `key_name`, `interval_name`, `triad_name`,
  `seventh_name`, `mode_name` (e.g. fis-Moll, si bémol majeur, große Terz).
- Many questions are generated from theory helpers that spell intervals,
  scales, key signatures and chords correctly (`q_note`, `q_interval`,
  `q_key`, `q_triad`, `q_seventh`, `q_mode`); `question()` shuffles options
  deterministically, the same way in every language.
- Slide kinds `notation` (abc + text/points) and `keyboard` (piano keys with
  labels/highlights); a quiz question may carry a 4th item `{'abc': ...}`,
  rendered to a picture (`QuizQuestion.imageUrl`, shown above the answers).
  `assets/js/abcjs-basic-min.js` (abcjs 6.4.4, MIT) must be in the assets
  folder for rendering.
- Four-part examples (`satb`) are hand-checked for parallel fifths/octaves;
  keep that up when editing them.
