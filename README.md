# Web Synth

A feature-rich, browser-based polyphonic synthesizer built with Web Audio API and TypeScript. Create and shape sounds using multiple oscillators, filters, envelopes, LFO modulation, and delay effects.

## Features

### Sound Generation
- **Multiple Oscillators**: Layer up to multiple oscillators with independent waveform, detune, and level controls
- **Waveforms**: Sine, Square, Sawtooth, and Triangle waves
- **Polyphonic/Monophonic Modes**: Play multiple notes simultaneously or one at a time
- **Detune Control**: Fine-tune each oscillator from -1200 to +1200 cents for chorus and unison effects

### Sound Shaping
- **Amplitude Envelope (ADSR)**: Control attack, decay, sustain, and release of note volume
- **Lowpass Filter**: Shape tone with adjustable cutoff (20Hz-20kHz) and resonance (0.1-30)
- **Filter Envelope**: Independent ADSR envelope for dynamic filter modulation
- **LFO Modulation**: Add vibrato (pitch) and wobble (filter) effects with adjustable rate and depth

### Effects
- **Delay**: Configurable delay time, feedback, and wet/dry mix for spatial effects
- **Master Volume**: Global output level control

### Input Methods
- **Visual Keyboard**: On-screen piano keyboard with mouse/touch support
- **Computer Keyboard**: 
  - Lower octave: Z-M keys (white), S-J keys (black)
  - Upper octave: Q-U keys (white), 2-7 keys (black)
- **MIDI Support**: Connect external MIDI keyboards and controllers
- **Octave Selection**: Independently adjust upper and lower keyboard octaves (2-6)

### Recording
- **Audio Recording**: Capture your performance and download as WebM audio files
- **One-Click Recording**: Start/stop recording with a single button

## Requirements

- [Bun](https://bun.sh) v1.3.0 or higher
- Modern web browser with Web Audio API support (Chrome, Firefox, Safari, Edge)

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

### Basic Sound Design

1. **Start Simple**: Begin with one oscillator to understand the basic sound
2. **Add Oscillators**: Click "Add Oscillator" to layer sounds
3. **Detune for Richness**: Slightly detune multiple oscillators (±10-20 cents) for a fuller sound
4. **Shape with Envelopes**: Adjust ADSR to control how notes start and end
5. **Filter Brightness**: Lower the filter cutoff for darker tones, raise it for brighter sounds
6. **Add Movement**: Use LFO modulation for vibrato and filter wobble effects
7. **Create Space**: Add delay for depth and ambience

### Preset Ideas

**Pad Sound**
- 2-3 sawtooth oscillators, detuned ±10-20 cents
- Attack: 0.5-1s, Sustain: 70-90%, Release: 1-2s
- Filter cutoff: 1000-2000 Hz
- LFO to filter: 200-500 Hz at 0.5-2 Hz rate

**Pluck/Bass**
- 1-2 sawtooth oscillators
- Attack: 0.001-0.01s, Decay: 0.1-0.3s, Sustain: 0-30%, Release: 0.1-0.3s
- Filter envelope amount: 3000-5000 Hz
- Filter attack: 0.001s, Filter decay: 0.2-0.4s

**Lead Synth**
- 1-2 sawtooth oscillators
- Filter cutoff: 2000-4000 Hz with envelope amount: 2000-4000 Hz
- Attack: 0.01-0.05s, Sustain: 80-100%
- LFO to pitch: 5-15 cents at 4-6 Hz for vibrato

**Wobble Bass**
- Sawtooth oscillator
- Low filter cutoff: 200-800 Hz, Resonance: 10-20
- LFO to filter: 1000-3000 Hz with square wave at 1-8 Hz
- Attack: 0.001s, Sustain: 100%

### Keyboard Shortcuts

- **Z-M**: Lower octave white keys (C-B)
- **S, D, G, H, J**: Lower octave black keys (sharps/flats)
- **Q-U**: Upper octave white keys (C-B)
- **2, 3, 5, 6, 7**: Upper octave black keys (sharps/flats)

## Project Structure

```
web-synth/
├── src/
│   ├── components/
│   │   ├── oscillator-control.ts    # Oscillator UI component
│   │   ├── piano-keyboard.ts        # Visual keyboard component
│   │   └── range-control.ts         # Range slider component
│   ├── keys.ts                      # Keyboard mapping and frequencies
│   ├── main.ts                      # Application entry point
│   ├── midi.ts                      # MIDI input handler
│   ├── oscillator-bank.ts           # Oscillator management
│   ├── styles.css                   # Global styles
│   └── synth.ts                     # Core synthesis engine
├── index.html                       # Main HTML document
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite build configuration
└── README.md                        # This file
```

## Technologies

- **TypeScript**: Type-safe JavaScript
- **Web Audio API**: Browser-based audio synthesis
- **Web Components**: Custom HTML elements for UI
- **Vite**: Fast development server and build tool
- **Bun**: JavaScript runtime and package manager

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (MIDI may require user permission)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Acknowledgments

Built with the Web Audio API and inspired by classic hardware synthesizers.
