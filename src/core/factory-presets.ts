import { Preset } from "./settings-manager";

export const FACTORY_PRESETS: Preset[] = [
  {
    name: "Pad Sound",
    description: "Lush, atmospheric pad with slow attack and long release",
    settings: {
      polyphonic: true,
      masterVolume: 0.3,
      oscillators: [
        { waveform: "sawtooth", detune: -15, level: 1 },
        { waveform: "sawtooth", detune: 0, level: 1 },
        { waveform: "sawtooth", detune: 15, level: 1 }
      ],
      attack: 0.7,
      decay: 0.3,
      sustain: 0.8,
      release: 1.5,
      filterCutoff: 1500,
      filterResonance: 1,
      filterEnvAmount: 300,
      filterAttack: 0.5,
      filterDecay: 0.3,
      filterSustain: 0.7,
      filterRelease: 1,
      lfoWaveform: "sine",
      lfoRate: 1,
      lfoToFilter: 300,
      lfoToPitch: 0,
      reverbDecay: 3,
      reverbMix: 0.4,
      delayTime: 0.375,
      delayFeedback: 0.3,
      delayMix: 0.2
    }
  },
  {
    name: "Pluck Bass",
    description: "Punchy bass with fast attack and short decay",
    settings: {
      polyphonic: false,
      masterVolume: 0.3,
      oscillators: [
        { waveform: "sawtooth", detune: 0, level: 1 },
        { waveform: "sawtooth", detune: -12, level: 0.6 }
      ],
      attack: 0.005,
      decay: 0.2,
      sustain: 0.2,
      release: 0.15,
      filterCutoff: 1200,
      filterResonance: 2,
      filterEnvAmount: 4000,
      filterAttack: 0.001,
      filterDecay: 0.3,
      filterSustain: 0.1,
      filterRelease: 0.2,
      lfoWaveform: "sine",
      lfoRate: 5,
      lfoToFilter: 0,
      lfoToPitch: 0,
      reverbDecay: 0.5,
      reverbMix: 0.1,
      delayTime: 0.375,
      delayFeedback: 0.3,
      delayMix: 0
    }
  },
  {
    name: "Lead Synth",
    description: "Bright lead with vibrato",
    settings: {
      polyphonic: false,
      masterVolume: 0.3,
      oscillators: [
        { waveform: "sawtooth", detune: 0, level: 1 },
        { waveform: "sawtooth", detune: 7, level: 0.8 }
      ],
      attack: 0.02,
      decay: 0.1,
      sustain: 0.9,
      release: 0.3,
      filterCutoff: 3000,
      filterResonance: 3,
      filterEnvAmount: 3000,
      filterAttack: 0.02,
      filterDecay: 0.2,
      filterSustain: 0.6,
      filterRelease: 0.3,
      lfoWaveform: "sine",
      lfoRate: 5,
      lfoToFilter: 0,
      lfoToPitch: 10,
      reverbDecay: 1.5,
      reverbMix: 0.25,
      delayTime: 0.375,
      delayFeedback: 0.3,
      delayMix: 0.15
    }
  },
  {
    name: "Wobble Bass",
    description: "Dubstep-style wobble bass",
    settings: {
      polyphonic: false,
      masterVolume: 0.3,
      oscillators: [
        { waveform: "sawtooth", detune: 0, level: 1 }
      ],
      attack: 0.001,
      decay: 0.1,
      sustain: 1,
      release: 0.1,
      filterCutoff: 500,
      filterResonance: 15,
      filterEnvAmount: 0,
      filterAttack: 0.1,
      filterDecay: 0.3,
      filterSustain: 0.5,
      filterRelease: 0.5,
      lfoWaveform: "square",
      lfoRate: 4,
      lfoToFilter: 2000,
      lfoToPitch: 0,
      reverbDecay: 0.3,
      reverbMix: 0.05,
      delayTime: 0.375,
      delayFeedback: 0.3,
      delayMix: 0
    }
  },
  {
    name: "Piano",
    description: "Acoustic piano-like sound",
    settings: {
      polyphonic: true,
      masterVolume: 0.3,
      oscillators: [
        { waveform: "sine", detune: 0, level: 1 },
        { waveform: "triangle", detune: 0, level: 0.6 },
        { waveform: "square", detune: 0, level: 0.3 }
      ],
      attack: 0.01,
      decay: 0.4,
      sustain: 0.7,
      release: 0.3,
      filterCutoff: 6500,
      filterResonance: 1,
      filterEnvAmount: 0,
      filterAttack: 0.1,
      filterDecay: 0.3,
      filterSustain: 0.5,
      filterRelease: 0.5,
      lfoWaveform: "sine",
      lfoRate: 5,
      lfoToFilter: 0,
      lfoToPitch: 0,
      reverbDecay: 2,
      reverbMix: 0.3,
      delayTime: 0.375,
      delayFeedback: 0.3,
      delayMix: 0
    }
  },
  {
    name: "Organ",
    description: "Classic organ sound",
    settings: {
      polyphonic: true,
      masterVolume: 0.3,
      oscillators: [
        { waveform: "square", detune: 0, level: 1 },
        { waveform: "square", detune: 0, level: 0.7 },
        { waveform: "square", detune: 0, level: 0.5 }
      ],
      attack: 0.2,
      decay: 0.1,
      sustain: 1,
      release: 0.1,
      filterCutoff: 10000,
      filterResonance: 1,
      filterEnvAmount: 0,
      filterAttack: 0.1,
      filterDecay: 0.3,
      filterSustain: 0.5,
      filterRelease: 0.5,
      lfoWaveform: "sine",
      lfoRate: 5,
      lfoToFilter: 0,
      lfoToPitch: 0,
      reverbDecay: 2.5,
      reverbMix: 0.35,
      delayTime: 0.375,
      delayFeedback: 0.3,
      delayMix: 0
    }
  },
  {
    name: "Strings",
    description: "Lush string ensemble",
    settings: {
      polyphonic: true,
      masterVolume: 0.3,
      oscillators: [
        { waveform: "sawtooth", detune: -12, level: 1 },
        { waveform: "sawtooth", detune: 12, level: 1 }
      ],
      attack: 1.5,
      decay: 0.3,
      sustain: 0.95,
      release: 2,
      filterCutoff: 3000,
      filterResonance: 1,
      filterEnvAmount: 0,
      filterAttack: 1,
      filterDecay: 0.5,
      filterSustain: 0.8,
      filterRelease: 1.5,
      lfoWaveform: "sine",
      lfoRate: 5,
      lfoToFilter: 0,
      lfoToPitch: 0,
      reverbDecay: 3.5,
      reverbMix: 0.5,
      delayTime: 0.5,
      delayFeedback: 0.3,
      delayMix: 0.2
    }
  },
  {
    name: "Bass Guitar",
    description: "Electric bass guitar",
    settings: {
      polyphonic: false,
      masterVolume: 0.3,
      oscillators: [
        { waveform: "sawtooth", detune: 0, level: 1 },
        { waveform: "sawtooth", detune: 0, level: 0.6 }
      ],
      attack: 0.008,
      decay: 0.3,
      sustain: 0.4,
      release: 0.15,
      filterCutoff: 1150,
      filterResonance: 2,
      filterEnvAmount: 750,
      filterAttack: 0.005,
      filterDecay: 0.2,
      filterSustain: 0.3,
      filterRelease: 0.1,
      lfoWaveform: "sine",
      lfoRate: 5,
      lfoToFilter: 0,
      lfoToPitch: 0,
      reverbDecay: 0.5,
      reverbMix: 0.1,
      delayTime: 0.375,
      delayFeedback: 0.3,
      delayMix: 0
    }
  },
  {
    name: "Flute",
    description: "Soft flute with vibrato",
    settings: {
      polyphonic: false,
      masterVolume: 0.3,
      oscillators: [
        { waveform: "sine", detune: 0, level: 1 }
      ],
      attack: 0.15,
      decay: 0.1,
      sustain: 0.85,
      release: 0.4,
      filterCutoff: 4000,
      filterResonance: 1,
      filterEnvAmount: 0,
      filterAttack: 0.1,
      filterDecay: 0.3,
      filterSustain: 0.5,
      filterRelease: 0.5,
      lfoWaveform: "sine",
      lfoRate: 4.5,
      lfoToFilter: 0,
      lfoToPitch: 6,
      reverbDecay: 2,
      reverbMix: 0.3,
      delayTime: 0.375,
      delayFeedback: 0.3,
      delayMix: 0.1
    }
  },
  {
    name: "Brass",
    description: "Bold brass section",
    settings: {
      polyphonic: true,
      masterVolume: 0.3,
      oscillators: [
        { waveform: "sawtooth", detune: 0, level: 1 },
        { waveform: "sawtooth", detune: 0, level: 0.8 }
      ],
      attack: 0.075,
      decay: 0.2,
      sustain: 0.95,
      release: 0.3,
      filterCutoff: 3250,
      filterResonance: 4,
      filterEnvAmount: 2500,
      filterAttack: 0.05,
      filterDecay: 0.3,
      filterSustain: 0.7,
      filterRelease: 0.2,
      lfoWaveform: "sine",
      lfoRate: 5,
      lfoToFilter: 0,
      lfoToPitch: 0,  
      reverbDecay: 2,
      reverbMix: 0.25, 
      delayTime: 0.375,
      delayFeedback: 0.3,
      delayMix: 0
    }
  },
  {
    name: "Electric Piano",
    description: "Rhodes-style electric piano",
    settings: {
      polyphonic: true,
      masterVolume: 0.3,
      oscillators: [
        { waveform: "sine", detune: 0, level: 1 },
        { waveform: "triangle", detune: 0, level: 0.7 }
      ],
      attack: 0.01,
      decay: 0.75,
      sustain: 0.5,
      release: 0.4,
      filterCutoff: 8000,
      filterResonance: 1,
      filterEnvAmount: 0,
      filterAttack: 0.1,
      filterDecay: 0.3,
      filterSustain: 0.5,
      filterRelease: 0.5,
      lfoWaveform: "sine",
      lfoRate: 5,
      lfoToFilter: 0,
      lfoToPitch: 0,
      reverbDecay: 1.5,
      reverbMix: 0.2,
      delayTime: 0.15,
      delayFeedback: 0.2,
      delayMix: 0.125
    }
  }
];