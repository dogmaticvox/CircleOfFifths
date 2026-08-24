// ── Web Audio tone playback ─────────────────────────────────────────────
// Pure oscillator synthesis, no audio files. One shared AudioContext,
// created lazily on first user gesture (required by browser autoplay rules).

const PITCH_CLASS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

let ctx = null;
function getContext() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function pitchClass(note) {
  let semitone = PITCH_CLASS[note[0]];
  for (let i = 1; i < note.length; i++) {
    semitone += note[i] === '#' ? 1 : note[i] === 'b' ? -1 : 0;
  }
  return ((semitone % 12) + 12) % 12;
}

// Frequencies for a scale, ascending from octave 4, wrapping the octave up
// whenever the next note's pitch class would otherwise fall below the last.
export function scaleFrequencies(notes) {
  let octave = 4;
  let lastClass = -1;
  return notes.map((note) => {
    const cls = pitchClass(note);
    if (cls <= lastClass) octave += 1;
    lastClass = cls;
    const midi = (octave + 1) * 12 + cls;
    return 440 * Math.pow(2, (midi - 69) / 12);
  });
}

export function noteFrequency(note) {
  return scaleFrequencies([note])[0];
}

export function playTone(freq, { duration = 0.55, delay = 0, gain = 0.22 } = {}) {
  const audio = getContext();
  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const env = audio.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, start);
  env.gain.setValueAtTime(0, start);
  env.gain.linearRampToValueAtTime(gain, start + 0.015);
  env.gain.linearRampToValueAtTime(gain * 0.7, start + duration * 0.6);
  env.gain.linearRampToValueAtTime(0, start + duration);
  osc.connect(env).connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

export function playScale(notes, { noteDuration = 0.32, gap = 0.34 } = {}) {
  const freqs = scaleFrequencies(notes);
  freqs.forEach((freq, i) => {
    playTone(freq, { duration: noteDuration, delay: i * gap });
  });
  return freqs.length * gap;
}
