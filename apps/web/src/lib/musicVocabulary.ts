// The instrument and style tags a profile, native event or course can carry,
// and what the worker's event/library classifiers tag external content with
// (apps/worker/src/jobs/event-classification.ts keeps an identical copy) - a
// filter or recommendation only matches if both sides use the same words.
// Values are only ever added, never renamed: stored tags must stay valid.

export const INSTRUMENTS = [
  'Piano', 'Keyboard', 'Guitar', 'Electric Guitar', 'Bass Guitar', 'Drums', 'Percussion', 'Voice',
  'Violin', 'Viola', 'Cello', 'Double Bass', 'Harp',
  'Flute', 'Recorder', 'Oboe', 'Clarinet', 'Bassoon', 'Saxophone',
  'Horn', 'Trumpet', 'Trombone', 'Ukulele', 'Accordion',
];

export const MUSIC_STYLES = [
  'Classical', 'Jazz', 'Pop', 'Rock', 'Blues', 'Folk', 'World Music', 'Latin', 'Soul & R&B', 'Hip-Hop',
  'Electronic', 'Musical Theatre', 'Film & Game Music', 'Singer-Songwriter',
  'Early Music', 'Baroque', 'Romantic', 'Contemporary', 'Opera', 'Chamber Music', 'Orchestral', 'Solo Piano',
];
