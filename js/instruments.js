// ── Piano octave + guitar fretboard diagrams ─────────────────────────────
// Both take a list of scale degrees ({ note, degree }) and highlight the
// pitch classes they contain. Notes in the scale are labeled with the
// scale's own spelling (so Gb major shows Cb, not B); notes outside it use
// the default sharp/flat spelling from the enharmonic toggle.
import { notePitchClass } from './theory.js';
import { playTone } from './audio.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

function el(tag, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  if (text != null) node.textContent = text;
  return node;
}

function midiFrequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

// pitch class → { note, degree } for every note in the scale
function scaleMap(degrees) {
  const map = new Map();
  degrees.forEach((d) => map.set(notePitchClass(d.note), d));
  return map;
}

function pressable(node, label, onPress) {
  node.setAttribute('tabindex', '0');
  node.setAttribute('role', 'button');
  node.setAttribute('aria-label', label);
  node.addEventListener('click', onPress);
  node.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPress(); }
  });
}

// ── Piano ──
const WHITE_W = 44;
const WHITE_H = 150;
const BLACK_W = 28;
const BLACK_H = 94;
const WHITE_KEYS = [0, 2, 4, 5, 7, 9, 11];
// pitch class → x of the white-key boundary the black key straddles
const BLACK_KEYS = [[1, 1], [3, 2], [6, 4], [8, 5], [10, 6]];

export function renderPiano(container, degrees, enharmonic) {
  const inScale = scaleMap(degrees);
  const defaults = enharmonic === 'flat' ? FLAT_NAMES : SHARP_NAMES;
  const svg = el('svg', {
    class: 'piano',
    viewBox: `0 0 ${WHITE_W * 7 + 2} ${WHITE_H + 2}`,
    role: 'group',
    'aria-label': 'Piano octave — tap a key to hear it',
  });

  function key(pc, x, w, h, black) {
    const d = inScale.get(pc);
    const name = d ? d.note : defaults[pc];
    const g = el('g', {
      class: `piano-key ${black ? 'black' : 'white'} ${d ? `in-scale deg-${d.degree}` : 'out-scale'}`,
    });
    g.append(el('rect', { x, y: 1, width: w, height: h, rx: black ? 3 : 5 }));
    if (d) {
      g.append(el('circle', { class: 'piano-dot', cx: x + w / 2, cy: h - (black ? 30 : 34), r: black ? 4 : 5 }));
    }
    g.append(el('text', {
      class: 'piano-label',
      x: x + w / 2,
      y: h - (black ? 12 : 14),
      'text-anchor': 'middle',
    }, name));
    pressable(g, `${name}${d ? '' : ' (not in scale)'} — tap to play`,
      () => playTone(midiFrequency(60 + pc)));
    svg.append(g);
  }

  WHITE_KEYS.forEach((pc, i) => key(pc, 1 + i * WHITE_W, WHITE_W, WHITE_H, false));
  BLACK_KEYS.forEach(([pc, boundary]) =>
    key(pc, 1 + boundary * WHITE_W - BLACK_W / 2, BLACK_W, BLACK_H, true));

  container.replaceChildren(svg);
}

// ── Fretboard ──
// Standard tuning, drawn high E on top (as in tab). MIDI numbers per string.
const STRINGS = [
  { name: 'e', midi: 64 },
  { name: 'B', midi: 59 },
  { name: 'G', midi: 55 },
  { name: 'D', midi: 50 },
  { name: 'A', midi: 45 },
  { name: 'E', midi: 40 },
];
const FRETS = 12;
const NUT_X = 44;
const FRET_W = 36;
const TOP = 14;
const STRING_GAP = 22;
const INLAYS = [3, 5, 7, 9];

export function renderFretboard(container, degrees) {
  const inScale = scaleMap(degrees);
  const width = NUT_X + FRETS * FRET_W + 4;
  const bottom = TOP + STRING_GAP * (STRINGS.length - 1);
  const svg = el('svg', {
    class: 'fretboard',
    viewBox: `0 0 ${width} ${bottom + 32}`,
    role: 'group',
    'aria-label': 'Guitar fretboard, standard tuning — tap a dot to hear it',
  });

  const fretX = (f) => NUT_X + f * FRET_W;
  const noteX = (f) => (f === 0 ? NUT_X - 14 : fretX(f) - FRET_W / 2);
  const midY = (TOP + bottom) / 2;

  // inlays
  INLAYS.forEach((f) => svg.append(el('circle', { class: 'fret-inlay', cx: noteX(f), cy: midY, r: 4 })));
  svg.append(
    el('circle', { class: 'fret-inlay', cx: noteX(12), cy: midY - STRING_GAP, r: 4 }),
    el('circle', { class: 'fret-inlay', cx: noteX(12), cy: midY + STRING_GAP, r: 4 }),
  );

  // frets, nut and fret numbers
  for (let f = 1; f <= FRETS; f++) {
    svg.append(el('line', { class: 'fret-wire', x1: fretX(f), y1: TOP, x2: fretX(f), y2: bottom }));
    svg.append(el('text', {
      class: 'fret-num', x: noteX(f), y: bottom + 24, 'text-anchor': 'middle',
    }, String(f)));
  }
  svg.append(el('line', { class: 'fret-nut', x1: NUT_X, y1: TOP - 2, x2: NUT_X, y2: bottom + 2 }));

  // strings + dots
  STRINGS.forEach((s, i) => {
    const y = TOP + i * STRING_GAP;
    svg.append(el('line', {
      class: 'fret-string', x1: NUT_X, y1: y, x2: fretX(FRETS), y2: y,
      'stroke-width': 0.8 + i * 0.3,
    }));
    svg.append(el('text', {
      class: 'string-name', x: 8, y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
    }, s.name));

    for (let f = 0; f <= FRETS; f++) {
      const midi = s.midi + f;
      const d = inScale.get(midi % 12);
      if (!d) continue;
      const g = el('g', { class: `fret-dot deg-${d.degree}${f === 0 ? ' open' : ''}` });
      g.append(
        el('circle', { cx: noteX(f), cy: y, r: 9 }),
        el('text', {
          x: noteX(f), y, 'text-anchor': 'middle', 'dominant-baseline': 'central',
        }, d.note),
      );
      pressable(g, `${d.note} on ${s.name} string, ${f === 0 ? 'open' : `fret ${f}`} — tap to play`,
        () => playTone(midiFrequency(midi)));
      svg.append(g);
    }
  });

  container.replaceChildren(svg);
}
