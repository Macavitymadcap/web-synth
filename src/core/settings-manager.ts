import type { OscillatorBank } from "./oscillator-bank";
import type { OscillatorSection } from "../components/organisms/oscillator-section";
import type { RangeControl } from "../components/atoms/range-control";
import {
  SynthSettings,
  MasterSettings,
  EnvelopeSettings,
  FilterSettings,
  FilterType,
  LFOSettings,
  ChorusSettings,
  WaveShaperSettings,
  ReverbSettings,
  CompressorSettings,
  DelaySettings,
  Preset,
  TremoloSettings
} from "./settings.model";
import type { PhaserConfig } from "../modules/effects/phaser-module";
import type { NoiseConfig } from "../modules/noise-module";

const STORAGE_KEY = "web-synth-settings";
const USER_PRESETS_KEY = "web-synth-user-presets";

export class SettingsManager {
  private oscillatorBank?: OscillatorBank;

  setOscillatorBank(bank: OscillatorBank): void {
    this.oscillatorBank = bank;
  }

  getCurrentSettings(): SynthSettings {
    return {
      master: this.getMasterSettings(),
      oscillators: this.getOscillatorSettings(),
      envelope: this.getEnvelopeSettings(),
      filter: this.getFilterSettings(),
      lfo: this.getLFOSettings(),
      chorus: this.getChorusSettings(),
      distortion: this.getWaveShaperSettings(),
      compressor: this.getCompressorSettings(),
      reverb: this.getReverbSettings(),
      delay: this.getDelaySettings(),
      phaser: this.getPhaserSettings(),
      noise: this.getNoiseSettings(),
      tremolo: this.getTremoloSettings(),
    };
  }

  private getMasterSettings(): MasterSettings {
    return {
      polyphonic: (document.getElementById("poly") as HTMLInputElement)?.checked ?? true,
      masterVolume: Number.parseFloat((document.getElementById("master-volume") as HTMLInputElement)?.value ?? "0.3"),
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

  private getEnvelopeSettings(): EnvelopeSettings {
    return {
      attack: Number.parseFloat((document.getElementById("attack") as HTMLInputElement)?.value ?? "0.01"),
      decay: Number.parseFloat((document.getElementById("decay") as HTMLInputElement)?.value ?? "0.01"),
      sustain: Number.parseFloat((document.getElementById("sustain") as HTMLInputElement)?.value ?? "0.7"),
      release: Number.parseFloat((document.getElementById("release") as HTMLInputElement)?.value ?? "0.5"),
    };
  }

  private getFilterSettings(): FilterSettings {
    return {
      type: ((document.getElementById("filter-type") as HTMLSelectElement)?.value ?? "lowpass") as FilterType,
      cutoff: Number.parseFloat((document.getElementById("filter-cutoff") as HTMLInputElement)?.value ?? "2000"),
      resonance: Number.parseFloat((document.getElementById("filter-resonance") as HTMLInputElement)?.value ?? "1"),
      envAmount: Number.parseFloat((document.getElementById("filter-env-amount") as HTMLInputElement)?.value ?? "2000"),
      attack: Number.parseFloat((document.getElementById("filter-attack") as HTMLInputElement)?.value ?? "0.1"),
      decay: Number.parseFloat((document.getElementById("filter-decay") as HTMLInputElement)?.value ?? "0.3"),
      sustain: Number.parseFloat((document.getElementById("filter-sustain") as HTMLInputElement)?.value ?? "0.5"),
      release: Number.parseFloat((document.getElementById("filter-release") as HTMLInputElement)?.value ?? "0.5"),
    };
  }

  private getLFOSettings(): LFOSettings {
    return {
      waveform: (document.getElementById("lfo-waveform") as HTMLSelectElement)?.value as OscillatorType ?? "sine",
      rate: Number.parseFloat((document.getElementById("lfo-rate") as HTMLInputElement)?.value ?? "5"),
      toFilter: Number.parseFloat((document.getElementById("lfo-to-filter") as HTMLInputElement)?.value ?? "0"),
      toPitch: Number.parseFloat((document.getElementById("lfo-to-pitch") as HTMLInputElement)?.value ?? "0"),
    };
  }

  private getChorusSettings(): ChorusSettings {
    return {
      rate: Number.parseFloat((document.getElementById("chorus-rate") as HTMLInputElement)?.value ?? "1.5"),
      depth: Number.parseFloat((document.getElementById("chorus-depth") as HTMLInputElement)?.value ?? "0.5"),
      mix: Number.parseFloat((document.getElementById("chorus-mix") as HTMLInputElement)?.value ?? "0.5"),
    }
  }

  private getWaveShaperSettings(): WaveShaperSettings {
    return {
      drive: Number.parseFloat((document.getElementById("distortion-drive") as HTMLInputElement)?.value ?? "0"),
      blend: Number.parseFloat((document.getElementById("distortion-blend") as HTMLInputElement)?.value ?? "0"),
    };
  }

  private getReverbSettings(): ReverbSettings {
    return {
      decay: Number.parseFloat((document.getElementById("reverb-decay") as HTMLInputElement)?.value ?? "1.5"),
      reverbMix: Number.parseFloat((document.getElementById("reverb-mix") as HTMLInputElement)?.value ?? "0.2"),
    };
  }

  private getCompressorSettings(): CompressorSettings {
    return {
      threshold: Number.parseFloat((document.getElementById("compressor-threshold") as HTMLInputElement)?.value ?? "-24"),
      ratio: Number.parseFloat((document.getElementById("compressor-ratio") as HTMLInputElement)?.value ?? "4"),
      attack: Number.parseFloat((document.getElementById("compressor-attack") as HTMLInputElement)?.value ?? "0.003"),
      release: Number.parseFloat((document.getElementById("compressor-release") as HTMLInputElement)?.value ?? "0.25"),
      knee: Number.parseFloat((document.getElementById("compressor-knee") as HTMLInputElement)?.value ?? "30"),
    };
  }

  private getDelaySettings(): DelaySettings {
    return {
      time: Number.parseFloat((document.getElementById("delay-time") as HTMLInputElement)?.value ?? "0.375"),
      feedback: Number.parseFloat((document.getElementById("delay-feedback") as HTMLInputElement)?.value ?? "0.3"),
      mix: Number.parseFloat((document.getElementById("delay-mix") as HTMLInputElement)?.value ?? "0.2")
    };
  }

  private getPhaserSettings(): PhaserConfig {
    return {
      rate: Number.parseFloat((document.getElementById("phaser-rate") as HTMLInputElement)?.value ?? "0.7"),
      depth: Number.parseFloat((document.getElementById("phaser-depth") as HTMLInputElement)?.value ?? "700"),
      stages: Number.parseInt((document.getElementById("phaser-stages") as HTMLInputElement)?.value ?? "4"),
      feedback: Number.parseFloat((document.getElementById("phaser-feedback") as HTMLInputElement)?.value ?? "0.3"),
      mix: Number.parseFloat((document.getElementById("phaser-mix") as HTMLInputElement)?.value ?? "0.5"),
    };
  }

  private getTremoloSettings(): TremoloSettings {
    return {
      rate: Number.parseFloat((document.getElementById("tremolo-rate") as HTMLInputElement)?.value ?? "5"),
      depth: Number.parseFloat((document.getElementById("tremolo-depth") as HTMLInputElement)?.value ?? "0.5"),
    };
  }

  // Add this method
  private getNoiseSettings(): NoiseConfig {
    return {
      type: ((document.getElementById("noise-type") as HTMLSelectElement)?.value ?? "white") as "white" | "pink" | "brown",
      level: Number.parseFloat((document.getElementById("noise-level") as HTMLInputElement)?.value ?? "0.3"),
      enabled: (document.getElementById("noise-enabled") as HTMLInputElement)?.checked ?? false,
    };
  }

  applySettings(settings: SynthSettings): void {
    this.applyMasterSettings(settings.master);
    this.applyOscillatorSettings(settings.oscillators);
    this.updateOscillatorBank();
    this.applyEnvelopeSettings(settings.envelope);
    this.applyFilterSettings(settings.filter);
    this.applyLFOSettings(settings.lfo);
    this.applyChorusSettings(settings.chorus);
    this.applyWaveShaperSettings(settings.distortion);
    this.applyReverbSettings(settings.reverb);
    this.applyCompressorSettings(settings.compressor);
    this.applyDelaySettings(settings.delay);
    this.applyPhaserSettings(settings.phaser);
    this.applyTremoloSettings(settings.tremolo);

    // Add this line
    if (settings.noise) {
      this.applyNoiseSettings(settings.noise);
    }
  }

  private applyMasterSettings(settings: MasterSettings): void {
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

  private updateOscillatorBank(): void {
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
  }

  private applyEnvelopeSettings(settings: EnvelopeSettings): void {
    this.setControlValue("attack", settings.attack);
    this.setControlValue("decay", settings.decay);
    this.setControlValue("sustain", settings.sustain);
    this.setControlValue("release", settings.release);
  }

  private applyFilterSettings(settings: FilterSettings): void {
    const filterType = document.getElementById("filter-type") as HTMLSelectElement;
    if (filterType) {
      filterType.value = settings.type;
      filterType.dispatchEvent(new Event("change"));
    }

    this.setControlValue("filter-cutoff", settings.cutoff);
    this.setControlValue("filter-resonance", settings.resonance);
    this.setControlValue("filter-env-amount", settings.envAmount);
    this.setControlValue("filter-attack", settings.attack);
    this.setControlValue("filter-decay", settings.decay);
    this.setControlValue("filter-sustain", settings.sustain);
    this.setControlValue("filter-release", settings.release);
  }

  private applyLFOSettings(settings: LFOSettings): void {
    const lfoWave = document.getElementById("lfo-waveform") as HTMLSelectElement;
    if (lfoWave) {
      lfoWave.value = settings.waveform;
      lfoWave.dispatchEvent(new Event("change"));
    }

    this.setControlValue("lfo-rate", settings.rate);
    this.setControlValue("lfo-to-filter", settings.toFilter);
    this.setControlValue("lfo-to-pitch", settings.toPitch);
  }

  private applyChorusSettings(settings: ChorusSettings): void {
    this.setControlValue("chorus-rate", settings.rate);
    this.setControlValue("chorus-depth", settings.depth);
    this.setControlValue("chorus-mix", settings.mix);
  }

  private applyWaveShaperSettings(settings: WaveShaperSettings): void {
    this.setControlValue("distortion-drive", settings.drive);
    this.setControlValue("distortion-blend", settings.blend);
  }

  private applyReverbSettings(settings: ReverbSettings): void {
    this.setControlValue("reverb-decay", settings.decay);
    this.setControlValue("reverb-mix", settings.reverbMix);
  }

  private applyCompressorSettings(settings: CompressorSettings): void {
    this.setControlValue("compressor-threshold", settings.threshold);
    this.setControlValue("compressor-ratio", settings.ratio);
    this.setControlValue("compressor-attack", settings.attack);
    this.setControlValue("compressor-release", settings.release);
    this.setControlValue("compressor-knee", settings.knee);
  }

  private applyDelaySettings(settings: DelaySettings): void {
    this.setControlValue("delay-time", settings.time);
    this.setControlValue("delay-feedback", settings.feedback);
    this.setControlValue("delay-mix", settings.mix);
  }

  private applyPhaserSettings(settings: PhaserConfig): void {
    this.setControlValue("phaser-rate", settings.rate);
    this.setControlValue("phaser-depth", settings.depth);
    this.setControlValue("phaser-stages", settings.stages);
    this.setControlValue("phaser-feedback", settings.feedback);
    this.setControlValue("phaser-mix", settings.mix);
  }

  private applyTremoloSettings(settings: TremoloSettings): void {
    this.setControlValue("tremolo-rate", settings.rate);
    this.setControlValue("tremolo-depth", settings.depth);
  }

  // Add this method
  private applyNoiseSettings(settings: NoiseConfig): void {
    // Set noise type
    const noiseType = document.getElementById("noise-type") as HTMLSelectElement;
    if (noiseType) {
      noiseType.value = settings.type;
      noiseType.dispatchEvent(new Event("change"));
    }

    // Set noise level
    this.setControlValue("noise-level", settings.level);

    // Set noise enabled
    const noiseEnabled = document.getElementById("noise-enabled") as HTMLInputElement;
    if (noiseEnabled) {
      noiseEnabled.checked = settings.enabled;
      noiseEnabled.dispatchEvent(new Event("change"));
    }
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