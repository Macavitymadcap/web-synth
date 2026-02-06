import type { OscillatorBank } from "./oscillator-bank";
import type { OscillatorSection } from "../components/oscillator-section";
import type { RangeControl } from "../components/range-control";

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

  // Chorus
  chorusRate: number;
  chorusDepth: number;
  chorusMix: number;
  
  // Reverb
  reverbDecay: number;
  reverbMix: number;
  
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
      
      chorusRate: Number.parseFloat((document.getElementById("chorus-rate") as HTMLInputElement)?.value ?? "1.5"),
      chorusDepth: Number.parseFloat((document.getElementById("chorus-depth") as HTMLInputElement)?.value ?? "0.5"),
      chorusMix: Number.parseFloat((document.getElementById("chorus-mix") as HTMLInputElement)?.value ?? "0.5"),

      reverbDecay: Number.parseFloat((document.getElementById("reverb-decay") as HTMLInputElement)?.value ?? "1.5"),
      reverbMix: Number.parseFloat((document.getElementById("reverb-mix") as HTMLInputElement)?.value ?? "0.2"),

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
    
    // Chorus
    this.setControlValue("chorus-rate", settings.chorusRate);
    this.setControlValue("chorus-depth", settings.chorusDepth);
    this.setControlValue("chorus-mix", settings.chorusMix);

    // Reverb
    this.setControlValue("reverb-decay", settings.reverbDecay);
    this.setControlValue("reverb-mix", settings.reverbMix);

    // Delay
    this.setControlValue("delay-time", settings.delayTime);
    this.setControlValue("delay-feedback", settings.delayFeedback);
    this.setControlValue("delay-mix", settings.delayMix);
  }

  private setControlValue(id: string, value: number): void {
  const element = document.getElementById(id);
  if (!element) return;
  
  // Check if it's a RangeControl custom element
  if (element.tagName.toLowerCase() === 'range-control') {
    const rangeControl = element as RangeControl;
    if (rangeControl.setValue) {
      rangeControl.setValue(value);
    }
  } else {
    // It's a regular input element
    const control = element as HTMLInputElement;
    control.value = value.toString();
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