# Web Synth

A modern, browser-based polyphonic synthesiser built with the Web Audio API, TypeScript, and native Web Components. Create and shape sounds using a modular, testable architecture with multiple oscillators, filters, envelopes, LFOs, and a full suite of effects.

---

## Features

### Sound Generation

- **Multiple Oscillators**: Layer up to 4 oscillators, each with independent waveform, detune, and level.
- **Waveforms**: Sine, Square, Sawtooth, Triangle.
- **Polyphonic/Monophonic**: Play chords or leads.
- **Detune Control**: Fine-tune oscillators for rich, wide sounds.

### Sound Shaping

- **Amplitude Envelope (ADSR)**: Attack, Decay, Sustain, Release controls.
- **Lowpass Filter**: Adjustable cutoff (20Hz–20kHz) and resonance.
- **Filter Envelope**: Separate ADSR for dynamic filter sweeps.
- **LFO Modulation**: Vibrato (pitch), filter wobble, and more.

### Effects

- **Chorus, Phaser, Flanger, Tremolo**: Classic modulation effects.
- **Delay & Reverb**: Spatial and echo effects with wet/dry mix.
- **Distortion**: Adds warmth or grit.
- **Compressor & Parametric EQ**: Dynamics and tone shaping.
- **Spectrum Analyser & Oscilloscope**: Visualise your sound.

### Presets & Settings

- **Factory Presets**: 11 built-in sounds (pads, bass, leads, keys, etc).
- **User Presets**: Save, export, and import your own sounds (JSON).
- **Auto-Save**: Settings persist in browser storage.

### Input Methods

- **Visual Keyboard**: On-screen piano, mouse/touch support.
- **Computer Keyboard**: Play notes with QWERTY keys (see shortcuts).
- **MIDI Support**: Plug in external keyboards/controllers.
- **Octave Selection**: Set upper/lower keyboard octaves.

### Recording

- **Audio Recording**: Capture and download your performance (WebM audio).
- **One-Click Recording**: Simple record/stop button.

---

## Requirements

- [Bun](https://bun.sh) v1.3.0 or higher
- Modern browser with Web Audio API (Chrome, Firefox, Safari, Edge)

---

## Installation

```bash
bun install
```

---

## Development

Start the dev server (with hot reload):

```bash
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Build

```bash
bun run build
bun run preview
```

## Running Tests

```bash
bun test
```

See architecture.md for advanced patterns and troubleshooting.

---

## Architecture Overview

### Modern Modular Design

- **Modules**: Each synthesis/effect block is a self-contained TypeScript class (zero-parameter constructor, no manual DOM wiring).
- **Native Web Components**: UI is built from reusable, framework-free custom elements.
- **Centralised UIConfigService**: All modules access UI controls and bind parameters declaratively, not imperatively.
- **EffectsManager**: Orchestrates the audio effects chain, handles registration, ordering, and routing.
- **Dynamic Banks**: Oscillator and LFO banks support dynamic add/remove with unique IDs and declarative parameter binding.
- **Event-Driven**: UI changes propagate via standard DOM events; modules respond via helpers.
- **Testable**: Architecture is designed for easy mocking and automated testing.

### Project Structure

```
src/
├── core/         # Synth engine, effects manager, voice allocation, settings
├── modules/      # Audio modules (oscillators, envelopes, effects, etc.)
├── components/   # Web components (atoms, molecules, organisms)
├── handlers/     # UI and device event handlers
├── services/     # UIConfigService and helpers
└── main.ts       # App entry point
test/
├── core/         # Core logic tests
├── modules/      # Module tests
└── fixtures/     # Mocks for DOM and Web Audio API
```

For a full developer guide and patterns, see architecture.md.

---

## Browser Compatibility

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support (MIDI may require permission)

---

## Acknowledgments

Built with the Web Audio API and inspired by classic hardware synthesisers.

---

## Resources

- [Web Audio API @ MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Bun Test Runner](https://bun.sh/docs/cli/test)

---

*See architecture.md for in-depth developer documentation, patterns, and troubleshooting.*