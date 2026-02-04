import type { OscillatorBank } from "./oscillator-bank";
import type { OscillatorSection } from "../components/oscillator-section";

export interface SynthSettings {
  // Master
  polyphonic: boolean;
  masterVolume: number;
  
  // Oscillators
  oscillators: Array<{
    waveform: OscillatorType;
    detune: number;
    level: number;
  }>;
  
  // Amplitude Envelope
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  
  // Filter
  filterCutoff: number;
  filterResonance: number;
  filterEnvAmount: number;
  filterAttack: number;
  filterDecay: number;
  filterSustain: number;
  filterRelease: number;
  
  // LFO
  lfoWaveform: OscillatorType;
  lfoRate: number;
  lfoToFilter: number;
  lfoToPitch: number;
  
  // Delay
  delayTime: number;
  delayFeedback: number;
  delayMix: number;
}

export interface Preset {
  name: string;
  description?: string;
  settings: SynthSettings;
}

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
      delayTime: 0.15,
      delayFeedback: 0.2,
      delayMix: 0.125
    }
  }
];

const STORAGE_KEY = "web-synth-settings";
const USER_PRESETS_KEY = "web-synth-user-presets";

export class SettingsManager {
  private oscillatorBank?: OscillatorBank;

  setOscillatorBank(bank: OscillatorBank): void {
    this.oscillatorBank = bank;
  }

  getCurrentSettings(): SynthSettings {
    return {
      polyphonic: (document.getElementById("poly") as HTMLInputElement)?.checked ?? true,
      masterVolume: Number.parseFloat((document.getElementById("master-volume") as HTMLInputElement)?.value ?? "0.3"),
      
      oscillators: this.getOscillatorSettings(),
      
      attack: Number.parseFloat((document.getElementById("attack") as HTMLInputElement)?.value ?? "0.01"),
      decay: Number.parseFloat((document.getElementById("decay") as HTMLInputElement)?.value ?? "0.01"),
      sustain: Number.parseFloat((document.getElementById("sustain") as HTMLInputElement)?.value ?? "0.7"),
      release: Number.parseFloat((document.getElementById("release") as HTMLInputElement)?.value ?? "0.5"),
      
      filterCutoff: Number.parseFloat((document.getElementById("filter-cutoff") as HTMLInputElement)?.value ?? "2000"),
      filterResonance: Number.parseFloat((document.getElementById("filter-resonance") as HTMLInputElement)?.value ?? "1"),
      filterEnvAmount: Number.parseFloat((document.getElementById("filter-env-amount") as HTMLInputElement)?.value ?? "2000"),
      filterAttack: Number.parseFloat((document.getElementById("filter-attack") as HTMLInputElement)?.value ?? "0.1"),
      filterDecay: Number.parseFloat((document.getElementById("filter-decay") as HTMLInputElement)?.value ?? "0.3"),
      filterSustain: Number.parseFloat((document.getElementById("filter-sustain") as HTMLInputElement)?.value ?? "0.5"),
      filterRelease: Number.parseFloat((document.getElementById("filter-release") as HTMLInputElement)?.value ?? "0.5"),
      
      lfoWaveform: (document.getElementById("lfo-waveform") as HTMLSelectElement)?.value as OscillatorType ?? "sine",
      lfoRate: Number.parseFloat((document.getElementById("lfo-rate") as HTMLInputElement)?.value ?? "5"),
      lfoToFilter: Number.parseFloat((document.getElementById("lfo-to-filter") as HTMLInputElement)?.value ?? "0"),
      lfoToPitch: Number.parseFloat((document.getElementById("lfo-to-pitch") as HTMLInputElement)?.value ?? "0"),
      
      delayTime: Number.parseFloat((document.getElementById("delay-time") as HTMLInputElement)?.value ?? "0.375"),
      delayFeedback: Number.parseFloat((document.getElementById("delay-feedback") as HTMLInputElement)?.value ?? "0.3"),
      delayMix: Number.parseFloat((document.getElementById("delay-mix") as HTMLInputElement)?.value ?? "0.2")
    };
  }

  private getOscillatorSettings() {
    const section = document.querySelector("oscillator-section") as OscillatorSection;
    if (!section || typeof section.getOscillators !== 'function') {
      return [{ waveform: "sawtooth" as OscillatorType, detune: 0, level: 1 }];
    }
    
    const oscillators = section.getOscillators();
    return oscillators.length > 0 ? oscillators : [{ waveform: "sawtooth" as OscillatorType, detune: 0, level: 1 }];
  }

  applySettings(settings: SynthSettings): void {
    // Master controls
    const poly = document.getElementById("poly") as HTMLInputElement;
    if (poly) {
      poly.checked = settings.polyphonic;
      poly.dispatchEvent(new Event("change"));
    }
    
    const masterVol = document.getElementById("master-volume") as HTMLInputElement;
    if (masterVol) {
      masterVol.value = settings.masterVolume.toString();
      masterVol.dispatchEvent(new Event("input"));
    }
    
    // Oscillators - apply to UI first, then to oscillator bank
    this.applyOscillatorSettings(settings.oscillators);
    
    // Update oscillator bank after UI is updated
    if (this.oscillatorBank) {
      // Give the UI time to update
      setTimeout(() => {
        const section = document.querySelector("oscillator-section") as OscillatorSection;
        if (section && typeof section.getOscillators === 'function') {
          const configs = section.getOscillators();
          this.oscillatorBank!.setConfigs(configs);
        }
      }, 0);
    }
    
    // Amplitude envelope
    this.setControlValue("attack", settings.attack);
    this.setControlValue("decay", settings.decay);
    this.setControlValue("sustain", settings.sustain);
    this.setControlValue("release", settings.release);
    
    // Filter
    this.setControlValue("filter-cutoff", settings.filterCutoff);
    this.setControlValue("filter-resonance", settings.filterResonance);
    this.setControlValue("filter-env-amount", settings.filterEnvAmount);
    this.setControlValue("filter-attack", settings.filterAttack);
    this.setControlValue("filter-decay", settings.filterDecay);
    this.setControlValue("filter-sustain", settings.filterSustain);
    this.setControlValue("filter-release", settings.filterRelease);
    
    // LFO
    const lfoWave = document.getElementById("lfo-waveform") as HTMLSelectElement;
    if (lfoWave) {
      lfoWave.value = settings.lfoWaveform;
      lfoWave.dispatchEvent(new Event("change"));
    }
    
    this.setControlValue("lfo-rate", settings.lfoRate);
    this.setControlValue("lfo-to-filter", settings.lfoToFilter);
    this.setControlValue("lfo-to-pitch", settings.lfoToPitch);
    
    // Delay
    this.setControlValue("delay-time", settings.delayTime);
    this.setControlValue("delay-feedback", settings.delayFeedback);
    this.setControlValue("delay-mix", settings.delayMix);
  }

  private setControlValue(id: string, value: number): void {
    const control = document.getElementById(id) as HTMLInputElement;
    if (control) {
      control.value = value.toString();
      // Trigger both input and change events
      control.dispatchEvent(new Event("input", { bubbles: true }));
      control.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  private applyOscillatorSettings(oscillators: Array<{ waveform: OscillatorType; detune: number; level: number }>): void {
    const section = document.querySelector("oscillator-section") as OscillatorSection;
    if (!section) return;
    
    // Clear existing oscillators
    section.clearAll();
    
    // Ensure we have at least one oscillator
    const oscToAdd = oscillators.length > 0 ? oscillators : [{ waveform: "sawtooth" as OscillatorType, detune: 0, level: 1 }];
    
    // Add new oscillators
    for (const osc of oscToAdd) {
      section.addOscillator(osc.waveform, osc.detune, osc.level);
    }
  }

  saveToLocalStorage(): void {
    const settings = this.getCurrentSettings();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  loadFromLocalStorage(): SynthSettings | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored) as SynthSettings;
    } catch {
      return null;
    }
  }

  exportToJSON(): string {
    const settings = this.getCurrentSettings();
    return JSON.stringify(settings, null, 2);
  }

  importFromJSON(json: string): boolean {
    try {
      const settings = JSON.parse(json) as SynthSettings;
      this.applySettings(settings);
      return true;
    } catch {
      return false;
    }
  }

  saveUserPreset(name: string, description?: string): void {
    const presets = this.getUserPresets();
    const settings = this.getCurrentSettings();
    
    presets.push({ name, description, settings });
    localStorage.setItem(USER_PRESETS_KEY, JSON.stringify(presets));
  }

  getUserPresets(): Preset[] {
    const stored = localStorage.getItem(USER_PRESETS_KEY);
    if (!stored) return [];
    
    try {
      return JSON.parse(stored) as Preset[];
    } catch {
      return [];
    }
  }

  deleteUserPreset(name: string): void {
    const presets = this.getUserPresets().filter(p => p.name !== name);
    localStorage.setItem(USER_PRESETS_KEY, JSON.stringify(presets));
  }
}