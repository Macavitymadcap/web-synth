export type OscillatorType = "sine" | "square" | "sawtooth" | "triangle" | "custom";

export type FilterType = "lowpass" | "highpass" | "bandpass" | "notch" | "allpass" | "lowshelf" | "highshelf" | "peaking";

export type MasterSettings = {
  polyphonic: boolean;
  masterVolume: number;
};

export type OscillatorSettings = {
  waveform: OscillatorType;
  detune: number;
  level: number;
};

export type EnvelopeSettings = {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
};

export type FilterSettings = {
  type: FilterType;
  cutoff: number;
  resonance: number;
  envAmount: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
};

export type LFOSettings = {
  waveform: OscillatorType;
  rate: number;
  toFilter: number;
  toPitch: number;
};

export type ChorusSettings = {
  rate: number;
  depth: number;
  mix: number;
};

export type ReverbSettings = {
  decay: number;
  reverbMix: number;
};

export type WaveShaperSettings = {
  drive: number;
  blend: number;
};

export type DelaySettings = {
  time: number;
  feedback: number;
  mix: number;
};

export type CompressorSettings = {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  knee: number;
};

export interface SynthSettings {
  master: MasterSettings;
  oscillators: OscillatorSettings[];
  envelope: EnvelopeSettings;
  filter: FilterSettings;
  lfo: LFOSettings;
  chorus: ChorusSettings;
  reverb: ReverbSettings;
  compressor: CompressorSettings;
  waveshaper: WaveShaperSettings;
  delay: DelaySettings;
}

export interface Preset {
  name: string;
  description?: string;
  settings: SynthSettings;
}
