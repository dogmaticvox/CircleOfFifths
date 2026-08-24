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

// Scale degrees for the selected key's major scale: [{ note, degree, name }]
export function scaleDegrees(k) {
  return k.scale.map((note, i) => ({
    note,
    degree: i + 1,
    name: DEGREE_NAMES[i],
  }));
}

// ── Modes ────────────────────────────────────────────────────────────────
// Each mode is defined by its interval pattern (semitones above the tonic).
// Modes are built on the selected tonic itself (parallel modes), not on a
// degree of its relative major — e.g. "D Dorian" starts and ends on D.
export const MODES = [
  { id: 'ionian', label: 'MAJOR SCALE', pattern: [0, 2, 4, 5, 7, 9, 11] },
  { id: 'dorian', label: 'DORIAN', pattern: [0, 2, 3, 5, 7, 9, 10] },
  { id: 'phrygian', label: 'PHRYGIAN', pattern: [0, 1, 3, 5, 7, 8, 10] },
  { id: 'lydian', label: 'LYDIAN', pattern: [0, 2, 4, 6, 7, 9, 11] },
  { id: 'mixolydian', label: 'MIXOLYDIAN', pattern: [0, 2, 4, 5, 7, 9, 10] },
  { id: 'aeolian', label: 'MINOR', pattern: [0, 2, 3, 5, 7, 8, 10] },
  { id: 'locrian', label: 'LOCRIAN', pattern: [0, 1, 3, 5, 6, 8, 10] },
];

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NATURAL_PITCH = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const ACCIDENTAL_STR = { '-2': 'bb', '-1': 'b', 0: '', 1: '#', 2: '##' };

function notePitchClass(note) {
  let semitone = NATURAL_PITCH[note[0]];
  for (let i = 1; i < note.length; i++) {
    semitone += note[i] === '#' ? 1 : note[i] === 'b' ? -1 : 0;
  }
  return ((semitone % 12) + 12) % 12;
}

// Spells a diatonic scale from `tonicName` (e.g. "Gb") using a semitone
// interval pattern, walking the letter names in order from the tonic and
// picking whichever accidental (natural through double sharp/flat) lands
// each letter on the pattern's target pitch class.
function diatonicScale(tonicName, pattern) {
  const tonicPitch = notePitchClass(tonicName);
  const startIdx = LETTERS.indexOf(tonicName[0]);

  return pattern.map((interval, i) => {
    const letter = LETTERS[(startIdx + i) % 7];
    const targetPitch = (tonicPitch + interval) % 12;
    const natural = NATURAL_PITCH[letter];
    let best = null;
    for (let off = -2; off <= 2; off++) {
      if (((natural + off) % 12 + 12) % 12 === targetPitch) { best = off; break; }
    }
    return letter + (ACCIDENTAL_STR[best] ?? '');
  });
}

// Scale degrees for `tonicName` in the given mode: [{ note, degree, name }]
export function modeScaleDegrees(tonicName, modeId) {
  const mode = MODES.find((m) => m.id === modeId) ?? MODES[0];
  const notes = diatonicScale(tonicName, mode.pattern);
  const seventhName = mode.id === 'ionian' || mode.id === 'lydian' ? 'Leading Tone' : 'Subtonic';
  const names = [...DEGREE_NAMES.slice(0, 6), seventhName];
  return notes.map((note, i) => ({ note, degree: i + 1, name: names[i] }));
}
