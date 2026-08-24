// ── Circle of fifths data layer ─────────────────────────────────────────
// Twelve positions in fifths order, starting at C, going clockwise (0 = C,
// 1 = G, 2 = D … 11 = F). Positions 5, 6 and 7 have two valid spellings
// (sharp/flat enharmonic pairs); every other position has one canonical
// spelling used regardless of the enharmonic toggle.

const SHARP_ORDER = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'];
const FLAT_ORDER = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'];

export const DEGREE_NAMES = [
  'Tonic', 'Supertonic', 'Mediant', 'Subdominant',
  'Dominant', 'Submediant', 'Leading Tone',
];

// name: major key name · minor: relative minor name (no "m" suffix)
// accidental/count: key signature · scale: the 7 scale notes in order
function key(name, minor, accidental, count, scale) {
  return {
    name,
    minor,
    accidental,
    count,
    accidentalNotes: count === 0 ? [] : (accidental === '#' ? SHARP_ORDER : FLAT_ORDER).slice(0, count),
    scale,
  };
}

// Each entry is { sharp, flat }. sharp === flat for unambiguous positions.
const C = key('C', 'A', null, 0, ['C', 'D', 'E', 'F', 'G', 'A', 'B']);
const G = key('G', 'E', '#', 1, ['G', 'A', 'B', 'C', 'D', 'E', 'F#']);
const D = key('D', 'B', '#', 2, ['D', 'E', 'F#', 'G', 'A', 'B', 'C#']);
const A = key('A', 'F#', '#', 3, ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#']);
const E = key('E', 'C#', '#', 4, ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#']);
const B = key('B', 'G#', '#', 5, ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#']);
const Cb = key('Cb', 'Ab', 'b', 7, ['Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Ab', 'Bb']);
const FSharp = key('F#', 'D#', '#', 6, ['F#', 'G#', 'A#', 'B', 'C#', 'D#', 'E#']);
const Gb = key('Gb', 'Eb', 'b', 6, ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F']);
const CSharp = key('C#', 'A#', '#', 7, ['C#', 'D#', 'E#', 'F#', 'G#', 'A#', 'B#']);
const Db = key('Db', 'Bb', 'b', 5, ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C']);
const Ab = key('Ab', 'F', 'b', 4, ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G']);
const Eb = key('Eb', 'C', 'b', 3, ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D']);
const Bb = key('Bb', 'G', 'b', 2, ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A']);
const F = key('F', 'D', 'b', 1, ['F', 'G', 'A', 'Bb', 'C', 'D', 'E']);

export const POSITIONS = [
  { sharp: C, flat: C },
  { sharp: G, flat: G },
  { sharp: D, flat: D },
  { sharp: A, flat: A },
  { sharp: E, flat: E },
  { sharp: B, flat: Cb },
  { sharp: FSharp, flat: Gb },
  { sharp: CSharp, flat: Db },
  { sharp: Ab, flat: Ab },
  { sharp: Eb, flat: Eb },
  { sharp: Bb, flat: Bb },
  { sharp: F, flat: F },
];

export function keyAt(position, mode) {
  const p = ((position % 12) + 12) % 12;
  return POSITIONS[p][mode];
}

export function dominantPosition(position) {
  return ((position % 12) + 12 + 1) % 12;
}

export function subdominantPosition(position) {
  return ((position % 12) + 12 - 1) % 12;
}

// Scale degrees for the selected key: [{ note, degree, name }]
export function scaleDegrees(k) {
  return k.scale.map((note, i) => ({
    note,
    degree: i + 1,
    name: DEGREE_NAMES[i],
  }));
}
