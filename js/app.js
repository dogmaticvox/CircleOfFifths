import {
  keyAt, dominantPosition, subdominantPosition, modeScaleDegrees,
  MODES, pentatonicDegrees, pentatonicLabel,
} from './theory.js';
import { renderPiano, renderFretboard } from './instruments.js';
import { createWheel } from './wheel.js';
import { noteFrequency, playScale, playTone } from './audio.js';

const $ = (id) => document.getElementById(id);

const els = {
  wheelWrap: $('wheel-wrap'),
  enharmonicToggle: $('enharmonic-toggle'),
  signature: $('kf-signature'),
  relative: $('kf-relative'),
  dominant: $('kf-dominant'),
  subdominant: $('kf-subdominant'),
  modeSelect: $('mode-select'),
  scaleTable: $('scale-table'),
  playScaleBtn: $('play-scale-btn'),
  pianoWrap: $('piano-wrap'),
  pianoCaption: $('piano-caption'),
  fretWrap: $('fretboard-wrap'),
  fretCaption: $('fret-caption'),
  viewSelects: [$('piano-view-select'), $('fret-view-select')],
};

const state = {
  position: 0, // C
  enharmonic: 'sharp',
  scaleMode: 'ionian',
  instrumentView: 'full', // 'full' | 'pentatonic' — shared by piano + fretboard
};

const wheel = createWheel(els.wheelWrap, {
  onSelect(position) {
    state.position = position;
    render();
  },
});

function signatureText(k) {
  if (k.count === 0) return 'No sharps or flats';
  const word = k.accidental === '#' ? 'sharp' : 'flat';
  return `${k.count} ${word}${k.count === 1 ? '' : 's'} — ${k.accidentalNotes.join(', ')}`;
}

function renderInfo(k, dominantKey, subdominantKey) {
  els.signature.textContent = signatureText(k);
  els.relative.textContent = `${k.minor} minor`;
  els.dominant.textContent = `${dominantKey.name} major`;
  els.subdominant.textContent = `${subdominantKey.name} major`;
}

function renderScale(degrees) {
  els.scaleTable.innerHTML = '';
  degrees.forEach(({ note, degree, name }) => {
    const row = document.createElement('button');
    row.className = `scale-row deg-${degree}`;
    row.setAttribute('role', 'listitem');
    row.setAttribute('aria-label', `${name}, ${note} — tap to play`);
    row.innerHTML = `
      <span class="scale-degree-num">${degree}</span>
      <span class="scale-note">${note}</span>
      <span class="scale-degree-name">${name}</span>
    `;
    row.addEventListener('click', () => playTone(noteFrequency(note)));
    els.scaleTable.appendChild(row);
  });
}

function render() {
  const k = keyAt(state.position, state.enharmonic);
  const dominantKey = keyAt(dominantPosition(state.position), state.enharmonic);
  const subdominantKey = keyAt(subdominantPosition(state.position), state.enharmonic);
  const degrees = modeScaleDegrees(k.name, state.scaleMode);

  wheel.render({ position: state.position, mode: state.enharmonic });
  renderInfo(k, dominantKey, subdominantKey);
  renderScale(degrees);
  renderInstruments(k, degrees);
}

function renderInstruments(k, degrees) {
  const pentatonic = state.instrumentView === 'pentatonic';
  const shown = pentatonic ? pentatonicDegrees(degrees, state.scaleMode) : degrees;
  const modeLabel = (MODES.find((m) => m.id === state.scaleMode) ?? MODES[0]).label;
  const caption = `${k.name} ${pentatonic ? pentatonicLabel(state.scaleMode) : modeLabel.toLowerCase()}`
    + ` — ${shown.map((d) => d.note).join(' ')}`;

  els.pianoCaption.textContent = caption;
  els.fretCaption.textContent = caption;
  els.viewSelects.forEach((sel) => { sel.value = state.instrumentView; });
  renderPiano(els.pianoWrap, shown, state.enharmonic);
  renderFretboard(els.fretWrap, shown);
}

els.enharmonicToggle.addEventListener('change', () => {
  state.enharmonic = els.enharmonicToggle.checked ? 'flat' : 'sharp';
  render();
});

els.modeSelect.addEventListener('change', () => {
  state.scaleMode = els.modeSelect.value;
  render();
});

els.viewSelects.forEach((sel) => sel.addEventListener('change', () => {
  state.instrumentView = sel.value;
  render();
}));

els.playScaleBtn.addEventListener('click', () => {
  const k = keyAt(state.position, state.enharmonic);
  const notes = modeScaleDegrees(k.name, state.scaleMode).map((d) => d.note);
  playScale(notes);
});

render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
