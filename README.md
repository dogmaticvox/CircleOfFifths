# C05

A neon, installable PWA reference for the circle of fifths — key signatures,
relationships and scales, right on your phone.

Sibling to [Clipper](https://github.com/dogmaticvox/Clipper),
[Shifter](https://github.com/dogmaticvox/Shifter) and
[Splicer](https://github.com/dogmaticvox/Splicer): same theme, same card
layout, same no-build-step plumbing. Unlike the others, C05 does no audio
file handling — it's a pure data-and-display tool, with a bit of Web Audio
tone playback for ear training.

**Features**

- 🎡 **Interactive wheel** — tap any of the 12 major keys on the circle of
  fifths; the relative minor sits on the inner ring at the same position
- 🔦 **Spatial highlighting** — selecting a key lights up its dominant (V)
  and subdominant (IV) neighbors on the wheel, not just in text
- ♯/♭ **Enharmonic toggle** — flip F#/Gb, C#/Db and B/Cb between sharp and
  flat spelling; the wheel and every panel re-render to match
- 📋 **Key info** — sharps/flats and which notes they are, relative minor,
  dominant and subdominant, all at a glance
- 🎼 **Scale breakdown** — the 7 notes of the selected key with scale-degree
  names (Tonic … Leading Tone/Subtonic); tonic, mediant and dominant are
  color-coded
- 🌀 **Modes** — a dropdown next to the scale switches between the seven
  diatonic modes (Major/Ionian, Dorian, Phrygian, Lydian, Mixolydian,
  Minor/Aeolian, Locrian), all built on the selected tonic itself
- 🎹 **Piano octave** — one octave from C to B with every key labeled;
  keys outside the current scale are greyed out, and the tonic, 3rd and 5th
  are color-coded like the scale table
- 🎸 **Guitar fretboard** — standard tuning, open strings through the 12th
  fret, with a dot (and note name) on every fret/string that's in the scale
- 🖐 **Full scale / pentatonic** — a dropdown on the piano and fretboard
  switches both between the full 7-note scale and its pentatonic subset
  (major pentatonic for major-3rd modes, minor pentatonic for the rest)
- 🔊 **Tone playback** — tap a note to hear it, or hit **PLAY SCALE** to hear
  the current mode's 7 notes in sequence — pure `OscillatorNode` synthesis,
  no audio files
- 📴 **Offline-first** — installs to your home screen and works with no
  connection

## Install on your phone

1. Enable hosting once: repo **Settings → Pages → Source: GitHub Actions**
   (the included workflow deploys automatically on every push to `main`).
2. Open **https://dogmaticvox.github.io/CircleOfFifths/** on your phone.
3. Add it to your home screen:
   - **Android/Chrome**: tap the install prompt, or ⋮ menu → *Add to Home screen*
   - **iOS/Safari**: Share sheet → *Add to Home Screen*

## Local development

No build step — it's plain HTML/CSS/JS. Serve the folder over HTTP and open it:

```sh
python3 -m http.server 8080
# → http://localhost:8080
```

## How it works

- `js/theory.js` is the data layer: all 12 key positions (in fifths order),
  their signatures, relative minors and major scales, with the three
  sharp/flat enharmonic pairs (B/Cb, F#/Gb, C#/Db) modeled explicitly.
  Dominant and subdominant are just "one position clockwise/counter-clockwise"
  on the same table — the wheel geometry and the music theory share one
  source of truth. Modes are spelled generally rather than hardcoded: each
  mode is a semitone interval pattern from the tonic, and `diatonicScale()`
  walks the seven letter names outward from the tonic, picking whichever
  accidental (natural through double sharp/flat) lands each letter on the
  pattern's target pitch — the same routine that gets "D Dorian" as
  `D E F G A B C` also handles the rare double-sharp spellings that a mode
  like Lydian forces on an already sharp-heavy tonic (C# Lydian's 4th is F##).
- `js/wheel.js` draws the SVG wheel (two concentric donut-slice rings, one
  wedge per fifth) and reports clicks/keyboard selection back to the app.
- `js/instruments.js` draws the piano octave and fretboard as SVG from the
  current list of scale degrees; tap any piano key or fretboard dot to hear it.
- `js/audio.js` is a small Web Audio helper: note names to frequencies
  (equal temperament, A4 = 440 Hz) and short sine-tone playback with a
  clipped envelope so notes don't click.
- `sw.js` precaches every asset so the installed app works fully offline.
