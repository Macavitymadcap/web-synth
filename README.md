# Web Synth

A feature-rich, browser-based polyphonic synthesiser built with the Web Audio
API and TypeScript. Create and shape sounds using multiple oscillators, filters, 
envelopes, LFO modulation, and delay effects.

## Features

### Sound Generation

* **Multiple Oscillators**: Layer up to multiple oscillators with independent waveform, detune, and level controls
* **Waveforms**: Sine, Square, Sawtooth, and Triangle waves
* **Polyphonic/Monophonic Modes**: Play multiple notes simultaneously or one at a time
* **Detune Control**: Fine-tune each oscillator from -1200 to +1200 cents for chorus and unison effects

### Sound Shaping

* **Amplitude Envelope (ADSR)**: Control attack, decay, sustain, and release of note volume
* **Lowpass Filter**: Shape tone with adjustable cutoff (20Hz-20kHz) and resonance (0.1-30)
* **Filter Envelope**: Independent ADSR envelope for dynamic filter modulation
* **LFO Modulation**: Add vibrato (pitch) and wobble (filter) effects with adjustable rate and depth

### Effects

* **Reverb**: Simulate room acoustics with adjustable decay and wet/dry mix for spatial effects
* **Delay**: Configurable delay time, feedback, and wet/dry mix for spatial effects
* **Master Volume**: Global output level control

### Presets & Settings

* **Factory Presets**: 11 built-in instrument presets including:
  - Pad Sound (lush, atmospheric)
  - Pluck Bass (punchy, tight)
  - Lead Synth (bright with vibrato)
  - Wobble Bass (dubstep-style)
  - Piano, Organ, Strings
  - Electric Piano, Bass Guitar
  - Flute, Brass
* **User Presets**: Save your custom sounds with names and descriptions
* **Export/Import**: Share settings as JSON files
* **Auto-Save**: Current settings automatically persist in browser storage

### Input Methods

* **Visual Keyboard**: On-screen piano keyboard with mouse/touch support
* **Computer Keyboard**: 
  - Lower octave: Z-M keys (white), S-J keys (black)
  - Upper octave: Q-U keys (white), 2-7 keys (black)
* **MIDI Support**: Connect external MIDI keyboards and controllers
* **Octave Selection**: Independently adjust upper and lower keyboard octaves (2-6)

### Recording

* **Audio Recording**: Capture your performance and download as WebM audio files
* **One-Click Recording**: Start/stop recording with a single button

## Requirements

* [Bun](https://bun.sh) v1.3.0 or higher
* Modern web browser with Web Audio API support (Chrome, Firefox, Safari, Edge)

## Installation

```bash
bun install
```

## Development

Run the development server with hot-reload:

```bash
bun run dev
```

The synth will be available at `http://localhost:5173`

## Production Build

Build the project for production:

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

## Usage Guide

### Getting Started with Presets

1. **Load a Preset**: Select from the factory presets dropdown (Pad Sound, Pluck Bass, Lead Synth, etc.)
2. **Click "Load"**: Apply the preset settings to hear the sound
3. **Experiment**: Adjust any parameters to customize the sound
4. **Save Custom Presets**: Click "Save As..." to store your modifications
5. **Export/Import**: Share your settings as JSON files with others

### Basic Sound Design

1. **Start Simple**: Begin with one oscillator to understand the basic sound
2. **Add Oscillators**: Click "Add Oscillator" to layer sounds
3. **Detune for Richness**: Slightly detune multiple oscillators (±10-20 cents) for a fuller sound
4. **Shape with Envelopes**: Adjust ADSR to control how notes start and end
5. **Filter Brightness**: Lower the filter cutoff for darker tones, raise it for brighter sounds
6. **Add Movement**: Use LFO modulation for vibrato and filter wobble effects
7. **Create Space**: Add delay for depth and ambience

### Keyboard Shortcuts

* **Z-M**: Lower octave white keys (C-B)
* **S, D, G, H, J**: Lower octave black keys (sharps/flats)
* **Q-U**: Upper octave white keys (C-B)
* **2, 3, 5, 6, 7**: Upper octave black keys (sharps/flats)

### Architecture Overview

**Core Layer** (`core/`)
* Contains the fundamental synthesiser logic
* `synth.ts` orchestrates all modules and manages the audio context
* `oscillator-bank.ts` handles multiple oscillator creation and management
* `keys.ts` maps keyboard inputs to musical frequencies
* `settings-manager.ts` manages presets, settings persistence, and import/export

**Audio Layer** (`audio/`)
* Handles audio input/output concerns
* `midi.ts` manages MIDI device connections and note events

**Modules Layer** (`modules/`)
* Self-contained audio processing units
* Each module encapsulates a specific synthesis component (envelopes, filters, LFO, etc.)
* Modules expose configuration interfaces and Web Audio node connections
* Designed for reusability and testability

**Components Layer** (`components/`)
* Custom web components for the user interface
* Built with native Web Components API
* Encapsulate both UI and behaviour
* `preset-selector.ts` provides the preset management interface

**Handlers Layer** (`handlers/`)
* Event handlers and UI interaction logic
* Separated from core audio logic for better maintainability
* Each handler manages a specific aspect of user interaction

## Browser Compatibility

* Chrome/Edge: Full support
* Firefox: Full support
* Safari: Full support (MIDI may require user permission)

## License

MIT

## Acknowledgments

Built with the Web Audio API and inspired by classic hardware synthesisers.
