# Docs site guide

## Site Structure

### Chapter 1: How to Use Web Synth
A practical guide walking through every module, expanding on the info popovers. Aimed at someone who wants to make sounds but doesn't necessarily know synthesis theory.

**Sections:**
1. **Getting Started** — Opening the app, first sound, using presets
2. **Playing Notes** — Visual keyboard, computer keyboard mapping, MIDI setup, octave selection
3. **Oscillators** — Waveform selection, layering, detune for width/unison
4. **Noise Generator** — White/pink/brown noise, when to use each, blending with oscillators
5. **Amplitude Envelope (ADSR)** — What each stage does musically, practical examples (pluck vs pad vs organ)
6. **Filter** — Filter types explained musically, cutoff, resonance, envelope amount, filter envelope
7. **LFOs** — What modulation feels like, routing to filter vs pitch, adding multiple LFOs
8. **Effects Chain** — One section per effect, ordered as they appear in the signal chain:
   - Compressor
   - Parametric EQ
   - Chorus
   - Phaser
   - Tremolo
   - Flanger
   - Delay
   - Distortion
   - Reverb
9. **Visualisers** — Reading the spectrum analyser and oscilloscope
10. **Presets & Settings** — Loading, saving, exporting/importing, auto-save behaviour
11. **Recording** — Capturing and downloading performances

### Chapter 2: How Synthesis Works
Educational content following the signal flow diagram. Each section explains the concept, then shows it working via interactive examples (placeholder `<demo>` tags you can replace with embedded synth snippets or diagrams later).

**Sections:**
1. **What is a Synthesiser?** — Subtractive synthesis overview, analogue vs digital, the Web Audio API as your engine
2. **Oscillators & Waveforms** — Sine, square, sawtooth, triangle explained with harmonics. Why layering and detuning creates width.
3. **Amplitude Envelopes** — ADSR concept, how it shapes a note's life cycle, the maths behind `linearRampToValueAtTime`
4. **Filters** — Lowpass, highpass, bandpass, notch, allpass, shelving, peaking. Cutoff, resonance/Q, and what they do to the frequency spectrum.
5. **Filter Envelopes** — Modulating cutoff over time, how envelope amount scales the sweep
6. **Low-Frequency Oscillators (LFOs)** — Modulation sources, vibrato (pitch), wobble (filter), combining multiple LFOs
7. **Noise** — White, pink, brown noise spectra, use in synthesis (breath, percussion, texture)
8. **The Effects Chain** — Why order matters, serial routing
   - **Dynamics** — Compression: threshold, ratio, attack, release, knee
   - **Equalization** — Parametric EQ bands, shelving vs peaking, surgical vs broad
   - **Modulation Effects** — Chorus (multiple delayed voices), phaser (allpass notches), tremolo (amplitude modulation), flanger (short modulated delay + feedback)
   - **Time-Based Effects** — Delay (echo, feedback loops), reverb (convolution, impulse responses)
   - **Distortion** — Waveshaping, soft clipping, the `tanh` curve
9. **Polyphony & Voice Management** — How multiple notes play simultaneously, monophonic vs polyphonic, voice allocation
10. **The Web Audio API** — AudioContext, nodes, the graph model, `AudioParam` scheduling, `currentTime`

### Chapter 3: Code Specification
API-style reference for developers wanting to understand, extend, or contribute. Draws from `architecture.md` but restructured as a formal spec.

**Sections:**
1. **Architecture Overview** — Modular design, UIConfigService pattern, event-driven updates
2. **Project Structure** — Directory layout with descriptions
3. **UIConfigService API** — Element access, config parsing, binding helpers (`bindAudioParams`, `bindGainParam`, `onInput`, `onSelect`), safe access methods
4. **Modules**
   - **BaseEffectModule Interface** — `EffectNodes`, `initialize`, `getInput/Output`, `isInitialized`, `getConfig`
   - **Effect Modules** — Per-module config types and behaviour (compressor, chorus, phaser, etc.)
   - **EnvelopeModule** — Amp and filter modes, `applyEnvelope`, `applyRelease`
   - **FilterModule** — `createFilter`, envelope integration, LFO routing
   - **LFOModule** — Dynamic ID pattern, routing outputs, multi-instance
   - **NoiseModule** — Buffer generation, noise types, per-voice creation
   - **MasterModule** — AudioContext lifecycle, master gain
5. **Core**
   - **Synth** — Orchestration, `ensureAudio`, `playFrequency`, `stopVoice`, `updateLFOs`
   - **EffectsManager** — Registration, initialization order, chain building, querying
   - **OscillatorBank** — Config from UI, creating/starting/stopping oscillators
   - **VoiceManager** — Voice allocation, LFO combination, polyphonic/monophonic, release scheduling
   - **SettingsManager** — Read/write all params, preset system, localStorage
6. **Components**
   - **Atoms** — `range-control`, `neon-select`, `toggle-switch`, `neon-button`, `neon-label`, `subsection-header`
   - **Molecules** — `controls-group`, `adsr-controls`, `bank-item`, `bank-section`, `effect-module`
   - **Organisms** — Module-specific wrappers, visual keyboard, spectrum analyser, oscilloscope
7. **Handlers** — Keyboard, MIDI, octave, oscillator management, LFO management, recording
8. **Signal Flow** — The full routing diagram with node-level detail
9. **Adding New Modules** — Step-by-step guide (effect module, dynamic bank module)
10. **Testing** — Mock setup, event-driven testing pattern, multi-instance testing
11. **Preset Schema** — Full `SynthSettings` type definition, factory preset format

---

## File Layout

```
docs/
├── guide/
│   ├── 01-getting-started.md
│   ├── 02-playing-notes.md
│   ├── 03-oscillators.md
│   ├── 04-noise-generator.md
│   ├── 05-amplitude-envelope.md
│   ├── 06-filter.md
│   ├── 07-lfos.md
│   ├── 08-effects.md
│   ├── 09-visualisers.md
│   ├── 10-presets-settings.md
│   └── 11-recording.md
├── synthesis/
│   ├── 01-what-is-a-synthesiser.md
│   ├── 02-oscillators-waveforms.md
│   ├── 03-amplitude-envelopes.md
│   ├── 04-filters.md
│   ├── 05-filter-envelopes.md
│   ├── 06-lfos.md
│   ├── 07-noise.md
│   ├── 08-effects-chain.md
│   ├── 09-polyphony-voices.md
│   └── 10-web-audio-api.md
├── spec/
│   ├── 01-architecture.md
│   ├── 02-project-structure.md
│   ├── 03-ui-config-service.md
│   ├── 04-modules.md
│   ├── 05-core.md
│   ├── 06-components.md
│   ├── 07-handlers.md
│   ├── 08-signal-flow.md
│   ├── 09-adding-modules.md
│   ├── 10-testing.md
│   └── 11-preset-schema.md
└── index.md
```

---
