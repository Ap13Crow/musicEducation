# Composer courses

4-week first-level courses (16 lessons, 21 quiz questions each), taught by Helene (Camille) Bruneau (teacher profile cmtagq6za000lmhras87yoj4r), sold at CHF 10 (free with
mymusic.coach Plus, for the teacher's subscribers and students, and for
invited people - apps/api/src/lib/courseAccess.ts).

- One module per course - all course content (`beethoven.py`, `schubert.py`,
  `bach.py`, `mozart.py`, `fanny.py`, `felix.py`, `chopin.py`, `clara.py`,
  `brahms.py`, `dvorak.py`, `debussy.py`; `chaminade.py` still to write): lesson texts, slide
  decks, quizzes, YouTube/audio sources, Library references.
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
