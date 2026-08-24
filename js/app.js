import { keyAt, dominantPosition, subdominantPosition, scaleDegrees } from './theory.js';
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
  scaleTable: $('scale-table'),
  playScaleBtn: $('play-scale-btn'),
};

const state = {
  position: 0, // C
  mode: 'sharp',
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

function renderScale(k) {
  els.scaleTable.innerHTML = '';
  scaleDegrees(k).forEach(({ note, degree, name }) => {
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
  const k = keyAt(state.position, state.mode);
  const dominantKey = keyAt(dominantPosition(state.position), state.mode);
  const subdominantKey = keyAt(subdominantPosition(state.position), state.mode);

  wheel.render(state);
  renderInfo(k, dominantKey, subdominantKey);
  renderScale(k);
}

els.enharmonicToggle.addEventListener('change', () => {
  state.mode = els.enharmonicToggle.checked ? 'flat' : 'sharp';
  render();
});

els.playScaleBtn.addEventListener('click', () => {
  const k = keyAt(state.position, state.mode);
  playScale(k.scale);
});

render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
