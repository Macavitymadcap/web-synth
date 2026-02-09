import { Preset } from "./settings.model";

export const FACTORY_PRESETS: Preset[] = [
  {
    name: "Warm Pad",
    description: "Lush atmospheric pad with subtle chorus detune",
    settings: {
      master: { polyphonic: true, masterVolume: 0.25 },
      oscillators: [
        { waveform: "sawtooth", detune: 0, level: 0.8 },
        { waveform: "sawtooth", detune: 0, level: 1 },
        { waveform: "sawtooth", detune: 0, level: 0.8 }
      ],
      envelope: { attack: 0.8, decay: 0.4, sustain: 0.85, release: 1.2 },
      filter: {
        type: "lowpass", cutoff: 1200, resonance: 0.5, envAmount: 800,
        attack: 1, decay: 0.5, sustain: 0.7, release: 1
      },
      lfo: { waveform: "sine", rate: 0.3, toFilter: 150, toPitch: 0 },
      chorus: { rate: 0.3, depth: 20, mix: 0.4 },
      reverb: { decay: 3.5, reverbMix: 0.45 },
      delay: { time: 0.5, feedback: 0.25, mix: 0.15 },
      distortion: { drive: 0.5, blend: 0.15 },
      compressor: {
        threshold: -28, ratio: 3, attack: 0.08, release: 0.4, knee: 18
      },
      phaser: { rate: 0.7, depth: 700, stages: 4, feedback: 0.3, mix: 0.5 },
      noise: { enabled: false, type: "white", level: 0.1}
    }
  },
  {
    name: "Sub Bass",
    description: "Deep sine wave bass",
    settings: {
      master: { polyphonic: false, masterVolume: 0.35 },
      oscillators: [
        { waveform: "sine", detune: 0, level: 1 },
        { waveform: "triangle", detune: 0, level: 0.3 }
      ],
      envelope: { attack: 0.005, decay: 0.15, sustain: 0.8, release: 0.2 },
      filter: {
        type: "lowpass", cutoff: 300, resonance: 0.5, envAmount: 200,
        attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.15
      },
      lfo: { waveform: "sine", rate: 5, toFilter: 0, toPitch: 0 },
      chorus: { rate: 0.5, depth: 0, mix: 0 },
      reverb: { decay: 0.3, reverbMix: 0.05 },
      delay: { time: 0.375, feedback: 0.2, mix: 0 },
      distortion: { drive: 0.2, blend: 0.1 },
      compressor: {
        threshold: -18, ratio: 6, attack: 0.01, release: 0.18, knee: 8
      },
      phaser: { rate: 0.5, depth: 200, stages: 2, feedback: 0.1, mix: 0 },
      noise: { enabled: false, type: "white", level: 0.1}
    }
  },
  {
    name: "Bright Lead",
    description: "Cutting sawtooth lead with slight vibrato",
    settings: {
      master: { polyphonic: false, masterVolume: 0.28 },
      oscillators: [
        { waveform: "sawtooth", detune: 0, level: 1 },
        { waveform: "sawtooth", detune: 0, level: 1 }
      ],
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.9, release: 0.25 },
      filter: {
        type: "notch", cutoff: 4000, resonance: 2, envAmount: 2500,
        attack: 0.02, decay: 0.15, sustain: 0.7, release: 0.2
      },
      lfo: { waveform: "sine", rate: 4.5, toFilter: 0, toPitch: 8 },
      chorus: { rate: 0.5, depth: 12, mix: 0.25 },
      reverb: { decay: 1.2, reverbMix: 0.2 },
      delay: { time: 0.375, feedback: 0.3, mix: 0.15 },
      distortion: { drive: 2.5, blend: 0.3 },
      compressor: {
        threshold: -22, ratio: 4, attack: 0.015, release: 0.22, knee: 12
      },
      phaser: { rate: 1.2, depth: 900, stages: 4, feedback: 0.4, mix: 0.35 },
      noise: { enabled: false, type: "white", level: 0.1}
    }
  },
  {
    name: "Pluck Bass",
    description: "Percussive bass with fast decay",
    settings: {
      master: { polyphonic: false, masterVolume: 0.32 },
      oscillators: [
        { waveform: "sawtooth", detune: 0, level: 1 },
        { waveform: "square", detune: 0, level: 0.4 }
      ],
      envelope: { attack: 0.001, decay: 0.3, sustain: 0.15, release: 0.1 },
      filter: {
        type: "bandpass", cutoff: 800, resonance: 3, envAmount: 3000,
        attack: 0.001, decay: 0.2, sustain: 0.1, release: 0.1
      },
      lfo: { waveform: "sine", rate: 5, toFilter: 0, toPitch: 0 },
      chorus: { rate: 0.5, depth: 0, mix: 0 },
      reverb: { decay: 0.5, reverbMix: 0.1 },
      delay: { time: 0.375, feedback: 0.2, mix: 0 },
      distortion: { drive: 1.5, blend: 0.25 },
      compressor: {
        threshold: -16, ratio: 7, attack: 0.01, release: 0.12, knee: 6
      },
      phaser: { rate: 0.8, depth: 400, stages: 2, feedback: 0.2, mix: 0.15 },
      noise: { enabled: false, type: "white", level: 0.1}
    }
  },
  {
    name: "Wobble Bass",
    description: "LFO modulated filter for wobble effect",
    settings: {
      master: { polyphonic: false, masterVolume: 0.3 },
      oscillators: [
        { waveform: "sawtooth", detune: 0, level: 1 }
      ],
      envelope: { attack: 0.005, decay: 0.05, sustain: 1, release: 0.1 },
      filter: {
        type: "lowpass", cutoff: 400, resonance: 12, envAmount: 0,
        attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.1
      },
      lfo: { waveform: "square", rate: 6, toFilter: 1800, toPitch: 0 },
      chorus: { rate: 0.5, depth: 0, mix: 0 },
      reverb: { decay: 0.3, reverbMix: 0.05 },
      delay: { time: 0.375, feedback: 0.2, mix: 0 },
      distortion: { drive: 2.2, blend: 0.35 },
      compressor: {
        threshold: -14, ratio: 8, attack: 0.008, release: 0.11, knee: 7
      },
      phaser: { rate: 1.5, depth: 1200, stages: 4, feedback: 0.5, mix: 0.25 },
      noise: { enabled: false, type: "white", level: 0.1}
    }
  },
  {
    name: "Soft Keys",
    description: "Mellow electric piano-like sound",
    settings: {
      master: { polyphonic: true, masterVolume: 0.28 },
      oscillators: [
        { waveform: "sine", detune: 0, level: 1 },
        { waveform: "triangle", detune: 0, level: 0.5 }
      ],
      envelope: { attack: 0.008, decay: 0.6, sustain: 0.4, release: 0.5 },
      filter: {
        type: "lowshelf", cutoff: 3500, resonance: 0.8, envAmount: 500,
        attack: 0.01, decay: 0.4, sustain: 0.6, release: 0.4
      },
      lfo: { waveform: "sine", rate: 5, toFilter: 0, toPitch: 0 },
      chorus: { rate: 0.3, depth: 18, mix: 0.35 },
      reverb: { decay: 1.8, reverbMix: 0.25 },
      delay: { time: 0.25, feedback: 0.15, mix: 0.1 },
      distortion: { drive: 0.01, blend: 0.1 },
      compressor: {
        threshold: -26, ratio: 2.5, attack: 0.04, release: 0.3, knee: 14
      },
      phaser: { rate: 0.4, depth: 350, stages: 3, feedback: 0.15, mix: 0.18 },
      noise: { enabled: false, type: "white", level: 0.1}
    }
  },
  {
    name: "Drawbar Organ",
    description: "Classic organ with harmonic drawbars",
    settings: {
      master: { polyphonic: true, masterVolume: 0.27 },
      oscillators: [
        { waveform: "sine", detune: 0, level: 1 },
        { waveform: "sine", detune: 1200, level: 0.7 },
        { waveform: "sine", detune: 1900, level: 0.5 }
      ],
      envelope: { attack: 0.01, decay: 0.05, sustain: 1, release: 0.05 },
      filter: {
        type: "allpass", cutoff: 8000, resonance: 0.5, envAmount: 0,
        attack: 0.01, decay: 0.1, sustain: 1, release: 0.05
      },
      lfo: { waveform: "sine", rate: 6, toFilter: 0, toPitch: 0 },
      chorus: { rate: 0.5, depth: 25, mix: 0.5 },
      reverb: { decay: 2.5, reverbMix: 0.3 },
      delay: { time: 0.375, feedback: 0.2, mix: 0 },
      distortion: { drive: 0, blend: 0 },
      compressor: {
        threshold: -30, ratio: 2, attack: 0.05, release: 0.18, knee: 10
      },
      phaser: { rate: 0.3, depth: 200, stages: 4, feedback: 0.2, mix: 0.12 },
      noise: { enabled: false, type: "white", level: 0.1}
    }
  },
  {
    name: "String Ensemble",
    description: "Rich layered strings with slow attack",
    settings: {
      master: { polyphonic: true, masterVolume: 0.26 },
      oscillators: [
        { waveform: "sawtooth", detune: -4, level: 0.9 },
        { waveform: "sawtooth", detune: 0, level: 1 },
        { waveform: "sawtooth", detune: 4, level: 0.9 }
      ],
      envelope: { attack: 1.2, decay: 0.3, sustain: 0.9, release: 1.5 },
      filter: {
        type: "lowpass", cutoff: 2500, resonance: 0.8, envAmount: 400,
        attack: 1, decay: 0.4, sustain: 0.85, release: 1.2
      },
      lfo: { waveform: "sine", rate: 0.5, toFilter: 100, toPitch: 0 },
      chorus: { rate: 0.3, depth: 22, mix: 0.5 },
      reverb: { decay: 3.5, reverbMix: 0.5 },
      delay: { time: 0.5, feedback: 0.25, mix: 0.2 },
      distortion: { drive: 0.3, blend: 0.1 },
      compressor: {
        threshold: -32, ratio: 2.2, attack: 0.12, release: 0.7, knee: 16
      },
      phaser: { rate: 0.5, depth: 600, stages: 4, feedback: 0.25, mix: 0.22 },
      noise: { enabled: true, type: "brown", level: 0.04}
    }
  },
  {
    name: "Synth Brass",
    description: "Bold sawtooth brass with moderate attack",
    settings: {
      master: { polyphonic: true, masterVolume: 0.29 },
      oscillators: [
        { waveform: "sawtooth", detune: -2, level: 0.85 },
        { waveform: "sawtooth", detune: 0, level: 1 },
        { waveform: "sawtooth", detune: 2, level: 0.85 }
      ],
      envelope: { attack: 0.06, decay: 0.2, sustain: 0.9, release: 0.25 },
      filter: {
        type: "bandpass", cutoff: 2800, resonance: 3, envAmount: 2000,
        attack: 0.05, decay: 0.25, sustain: 0.75, release: 0.2
      },
      lfo: { waveform: "sine", rate: 5, toFilter: 0, toPitch: 0 },
      chorus: { rate: 0.4, depth: 15, mix: 0.3 },
      reverb: { decay: 1.8, reverbMix: 0.25 },
      delay: { time: 0.375, feedback: 0.2, mix: 0 },
      distortion: { drive: 1.2, blend: 0.18 },
      compressor: {
        threshold: -20, ratio: 4.5, attack: 0.02, release: 0.19, knee: 10
      },
      phaser: { rate: 0.7, depth: 400, stages: 3, feedback: 0.18, mix: 0.13 },
      noise: { enabled: true, type: "pink", level: 0.06}
    }
  },
  {
    name: "Simple Flute",
    description: "Pure sine wave with gentle vibrato",
    settings: {
      master: { polyphonic: false, masterVolume: 0.3 },
      oscillators: [
        { waveform: "sine", detune: 0, level: 1 }
      ],
      envelope: { attack: 0.12, decay: 0.08, sustain: 0.85, release: 0.35 },
      filter: {
        type: "lowshelf", cutoff: 3500, resonance: 0.5, envAmount: 300,
        attack: 0.1, decay: 0.1, sustain: 0.8, release: 0.3
      },
      lfo: { waveform: "sine", rate: 4.8, toFilter: 0, toPitch: 5 },
      chorus: { rate: 0.4, depth: 10, mix: 0.2 },
      reverb: { decay: 2.2, reverbMix: 0.35 },
      delay: { time: 0.375, feedback: 0.25, mix: 0.1 },
      distortion: { drive: 0, blend: 0 },
      compressor: {
        threshold: -34, ratio: 2, attack: 0.09, release: 0.25, knee: 8
      },
      phaser: { rate: 0.2, depth: 150, stages: 2, feedback: 0.1, mix: 0.08 },
      noise: { enabled: true, type: "pink", level: 0.02}
    }
  },
  {
    name: "Arp Pluck",
    description: "Bright plucky sound ideal for arpeggios",
    settings: {
      master: { polyphonic: true, masterVolume: 0.28 },
      oscillators: [
        { waveform: "square", detune: -2, level: 1 },
        { waveform: "square", detune: 2, level: 1 }
      ],
      envelope: { attack: 0.002, decay: 0.25, sustain: 0.2, release: 0.15 },
      filter: {
        type: "highpass", cutoff: 3500, resonance: 4, envAmount: 3500,
        attack: 0.002, decay: 0.2, sustain: 0.2, release: 0.1
      },
      lfo: { waveform: "sine", rate: 5, toFilter: 0, toPitch: 0 },
      chorus: { rate: 0.6, depth: 15, mix: 0.3 },
      reverb: { decay: 1.5, reverbMix: 0.3 },
      delay: { time: 0.1875, feedback: 0.4, mix: 0.3 },
      distortion: { drive: 0.8, blend: 0.2 },
      compressor: {
        threshold: -24, ratio: 3.5, attack: 0.012, release: 0.13, knee: 9
      },
      phaser: { rate: 1.1, depth: 800, stages: 3, feedback: 0.3, mix: 0.2 },
      noise: { enabled: false, type: "white", level: 0.1}
    }
  },
  {
    name: "Bell Tone",
    description: "Metallic bell-like sound with harmonic overtones",
    settings: {
      master: { polyphonic: true, masterVolume: 0.27 },
      oscillators: [
        { waveform: "sine", detune: 0, level: 1 },
        { waveform: "sine", detune: 1900, level: 0.4 },
        { waveform: "sine", detune: 3100, level: 0.25 }
      ],
      envelope: { attack: 0.001, decay: 1.2, sustain: 0.3, release: 0.8 },
      filter: {
        type: "notch", cutoff: 8000, resonance: 0.5, envAmount: 0,
        attack: 0.001, decay: 0.8, sustain: 0.5, release: 0.6
      },
      lfo: { waveform: "sine", rate: 5, toFilter: 0, toPitch: 0 },
      chorus: { rate: 0.5, depth: 12, mix: 0.25 },
      reverb: { decay: 3, reverbMix: 0.4 },
      delay: { time: 0.25, feedback: 0.35, mix: 0.25 },
      distortion: { drive: 0.2, blend: 0.1 },
      compressor: {
        threshold: -26, ratio: 2.8, attack: 0.03, release: 0.31, knee: 11
      },
      phaser: { rate: 0.9, depth: 1000, stages: 4, feedback: 0.35, mix: 0.28 },
      noise: { enabled: true, type: "white", level: 0.03}
    }
  },
  {
    name: "Gritty Lead",
    description: "Aggressive distorted lead with lots of edge",
    settings: {
      master: { polyphonic: false, masterVolume: 0.22 },
      oscillators: [
        { waveform: "sawtooth", detune: 0, level: 1 },
        { waveform: "square", detune: 0, level: 0.5 }
      ],
      envelope: { attack: 0.01, decay: 0.08, sustain: 0.7, release: 0.18 },
      filter: {
        type: "peaking", cutoff: 3200, resonance: 1.5, envAmount: 1200,
        attack: 0.01, decay: 0.1, sustain: 0.6, release: 0.12
      },
      lfo: { waveform: "sine", rate: 5, toFilter: 0, toPitch: 0 },
      chorus: { rate: 0.3, depth: 10, mix: 0.18 },
      reverb: { decay: 0.7, reverbMix: 0.18 },
      delay: { time: 0.18, feedback: 0.22, mix: 0.12 },
      distortion: { drive: 6, blend: 0.7 },
      compressor: {
        threshold: -20, ratio: 5, attack: 0.01, release: 0.15, knee: 10
      },
      phaser: { rate: 1.7, depth: 1200, stages: 4, feedback: 0.5, mix: 0.3 },
      noise: { enabled: false, type: "white", level: 0.1}
    }
  },
  {
    name: "Lo-Fi Crunch",
    description: "Dirty, crushed sound for lo-fi and retro vibes",
    settings: {
      master: { polyphonic: true, masterVolume: 0.18 },
      oscillators: [
        { waveform: "square", detune: 0, level: 1 },
        { waveform: "triangle", detune: 0, level: 0.4 }
      ],
      envelope: { attack: 0.005, decay: 0.12, sustain: 0.3, release: 0.18 },
      filter: {
        type: "lowpass", cutoff: 1800, resonance: 2.2, envAmount: 800,
        attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.1
      },
      lfo: { waveform: "triangle", rate: 2.5, toFilter: 0, toPitch: 0 },
      chorus: { rate: 0.2, depth: 6, mix: 0.1 },
      reverb: { decay: 0.5, reverbMix: 0.08 },
      delay: { time: 0.12, feedback: 0.18, mix: 0.08 },
      distortion: { drive: 8, blend: 0.6 },
      compressor: {
        threshold: -12, ratio: 9, attack: 0.006, release: 0.09, knee: 5
      },
      phaser: { rate: 0.6, depth: 400, stages: 2, feedback: 0.18, mix: 0.12 },
      noise: { enabled: true, type: "pink", level: 0.12}
    }
  },
  {
    name: "Wind Texture",
    description: "Ethereal wind sound with sweeping filter",
    settings: {
      master: { polyphonic: true, masterVolume: 0.2 },
      oscillators: [
        { waveform: "sine", detune: 0, level: 0.15 }
      ],
      envelope: { attack: 1.8, decay: 0.4, sustain: 0.85, release: 2.5 },
      filter: {
        type: "highpass", cutoff: 2000, resonance: 1.5, envAmount: 1500,
        attack: 1.5, decay: 0.8, sustain: 0.75, release: 2
      },
      lfo: { waveform: "sine", rate: 0.25, toFilter: 1200, toPitch: 0 },
      chorus: { rate: 0.4, depth: 40, mix: 0.7 },
      reverb: { decay: 5, reverbMix: 0.75 },
      delay: { time: 1, feedback: 0.5, mix: 0.4 },
      distortion: { drive: 0, blend: 0 },
      compressor: {
        threshold: -38, ratio: 1.8, attack: 0.3, release: 1.5, knee: 25
      },
      phaser: { rate: 0.2, depth: 800, stages: 8, feedback: 0.5, mix: 0.5 },
      noise: { enabled: true, type: "pink", level: 0.95 }
    }
  },
];