import { ParametricEQConfig } from '../modules/effects/parametric-eq-module';
import type { NoiseConfig } from '../modules/noise-module';

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

export type CompressorSettings = {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  knee: number;
};

export type ChorusSettings = {
  rate: number;
  depth: number;
  mix: number;
};

export type PhaserSettings = {
  rate: number;
  depth: number;
  stages: number;
  feedback: number;
  mix: number;
};

export type TremoloSettings = {
  rate: number;
  depth: number;
};

export type FlangerSettings = {
  rate: number;
  depth: number;
  feedback: number;
  mix: number;
};

export type DelaySettings = {
  time: number;
  feedback: number;
  mix: number;
};

export type WaveShaperSettings = {
  drive: number;
  blend: number;
};

export type ReverbSettings = {
  decay: number;
  reverbMix: number;
};

export interface SynthSettings {
  master: MasterSettings;
  oscillators: OscillatorSettings[];
  envelope: EnvelopeSettings;
  filter: FilterSettings;
  lfos: LFOSettings[];
  noise: NoiseConfig;

  compressor: CompressorSettings;
  chorus: ChorusSettings;
  phaser: PhaserSettings;
  tremolo: TremoloSettings;
  flanger: FlangerSettings;
  delay: DelaySettings;
  distortion: WaveShaperSettings;
  reverb: ReverbSettings;
  eq: ParametricEQConfig;
}

export interface Preset {
  name: string;
  description?: string;
  settings: SynthSettings;
}
