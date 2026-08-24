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
- 🎼 **Scale breakdown** — the 7 notes of the major scale with scale-degree
  names (Tonic … Leading Tone); tonic, mediant and dominant are color-coded
- 🔊 **Tone playback** — tap a note to hear it, or hit **PLAY SCALE** to hear
  all 7 notes in sequence — pure `OscillatorNode` synthesis, no audio files
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
  source of truth.
- `js/wheel.js` draws the SVG wheel (two concentric donut-slice rings, one
  wedge per fifth) and reports clicks/keyboard selection back to the app.
- `js/audio.js` is a small Web Audio helper: note names to frequencies
  (equal temperament, A4 = 440 Hz) and short sine-tone playback with a
  clipped envelope so notes don't click.
- `sw.js` precaches every asset so the installed app works fully offline.
