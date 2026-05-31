import type { OscillatorBank, OscillatorConfig } from "./oscillator-bank";
import type { BankSection } from "../components/molecules/bank-section";
import type { RangeControl } from "../components/atoms/range-control";
import {
  SynthSettings,
  MasterSettings,
  EnvelopeSettings,
  FilterSettings,
  FilterType,
  OscillatorType,
  ArpeggiatorSettings,
  DEFAULT_ARPEGGIATOR_SETTINGS,
  LFOSettings,
  ChorusSettings,
  WaveShaperSettings,
  ReverbSettings,
  CompressorSettings,
  DelaySettings,
  Preset,
  TremoloSettings,
  FlangerSettings
} from "./settings.model";
import type { PhaserConfig } from "../modules/effects/phaser-module";
import type { NoiseConfig, NoiseModule } from "../modules/noise-module";
import { ParametricEQConfig } from "../modules/effects/parametric-eq-module";
import { EnvelopeModule } from "../modules/envelope-module";
import { FilterModule } from "../modules/filter-module";
import { MasterModule } from "../modules/master-module";
import { EffectsManager } from "./effects-manager";
import { UIConfigService } from "../services/ui-config-service";

const STORAGE_KEY = "web-synth-settings";
const USER_PRESETS_KEY = "web-synth-user-presets";

export class SettingsManager {
  private readonly oscillatorBank?: OscillatorBank;
  private readonly effectsManager?: EffectsManager;
  private readonly ampEnvelope?: EnvelopeModule;
  private readonly filterModule?: FilterModule;
  private readonly filterEnvelope?: EnvelopeModule;
  private readonly noiseModule?: NoiseModule;
  private readonly masterModule?: MasterModule;

  configure(deps: {
    oscillatorBank: OscillatorBank;
    effectsManager: EffectsManager;
    ampEnvelope: EnvelopeModule;
    filterModule: FilterModule;
    filterEnvelope: EnvelopeModule;
    noiseModule: NoiseModule;
    masterModule: MasterModule;
  }): void {
    Object.assign(this, deps);
  }

  getCurrentSettings(): SynthSettings {
    return {
      master: this.getMasterSettings(),
      oscillators: this.getOscillatorSettings(),
      envelope: this.getEnvelopeSettings(),
      filter: this.getFilterSettings(),
      lfos: this.getLFOSettings(),
      arpeggiator: this.getArpeggiatorSettings(),
      chorus: this.getChorusSettings(),
      distortion: this.getDistortionSettings(),
      compressor: this.getCompressorSettings(),
      reverb: this.getReverbSettings(),
      delay: this.getDelaySettings(),
      phaser: this.getPhaserSettings(),
      noise: this.getNoiseSettings(),
      tremolo: this.getTremoloSettings(),
      flanger: this.getFlangerSettings(),
      eq: this.getEQSettings(),
    };
  }

  private getEffectConfig<T>(id: string, fallback: T): T {
    const module = this.effectsManager?.getEffect(id);
    return (module?.getConfig() as T) ?? fallback;
  }

  private getMasterSettings(): MasterSettings {
    const volume = this.masterModule?.getConfig().volume ?? 0.3;
    const polyEl = UIConfigService.tryGetControl<HTMLInputElement>("poly");
    return {
      polyphonic: polyEl?.checked ?? true,
      masterVolume: volume,
    };
  }

  private getOscillatorSettings() {
    const section = document.querySelector("bank-section[prefix='osc']") as BankSection;
    if (!section || typeof section.getItems !== 'function') {
      return [{ waveform: "sawtooth" as OscillatorType, detune: 0, level: 1 }];
    }

    const items = section.getItems();
    // Map to properly typed oscillator configs
    const oscillators = items.map(item => ({
      waveform: item.waveform as OscillatorType,
      detune: Number(item.detune),
      level: Number(item.level)
    }));

    return oscillators.length > 0 ? oscillators : [{ waveform: "sawtooth" as OscillatorType, detune: 0, level: 1 }];
  }

  private getEnvelopeSettings(): EnvelopeSettings {
    return this.ampEnvelope?.getConfig() ?? {
      attack: 0.01, decay: 0.01, sustain: 0.7, release: 0.5
    };
  }

  private getFilterSettings(): FilterSettings {
    const filter = this.filterModule?.getConfig() ?? {
      type: "lowpass" as FilterType, cutoff: 2000, resonance: 1, amount: 2000
    };
    const env = this.filterEnvelope?.getConfig() ?? {
      attack: 0.1, decay: 0.3, sustain: 0.5, release: 0.5
    };
    return {
      type: filter.type as FilterType,
      cutoff: filter.cutoff,
      resonance: filter.resonance,
      amount: filter.amount,
      ...env,
    };
  }

  private getLFOSettings(): LFOSettings[] {
    const section = document.querySelector("bank-section[prefix='lfo']") as BankSection;
    if (!section || typeof section.getItems !== 'function') {
      return [{ waveform: "sine" as OscillatorType, rate: 5, toFilter: 0, toPitch: 0 }];
    }

    const items = section.getItems();
    // Map to properly typed LFO configs
    const lfos = items.map(item => ({
      waveform: item.waveform as OscillatorType,
      rate: Number(item.rate),
      toFilter: Number(item['to-filter'] || item.toFilter), // Handle both kebab-case and camelCase
      toPitch: Number(item['to-pitch'] || item.toPitch)
    }));

    return lfos.length > 0 ? lfos : [{ waveform: "sine" as OscillatorType, rate: 5, toFilter: 0, toPitch: 0 }];
  }

  private getArpeggiatorSettings(): ArpeggiatorSettings {
    return { ...DEFAULT_ARPEGGIATOR_SETTINGS };
  }

  private getChorusSettings(): ChorusSettings {
    return this.getEffectConfig('chorus', { rate: 1.5, depth: 0.5, mix: 0.5 });
  }

  private getDistortionSettings(): WaveShaperSettings {
    return this.getEffectConfig('distortion', { drive: 0, blend: 0 });
  }

  private getReverbSettings(): ReverbSettings {
    return this.getEffectConfig('reverb', { decay: 1.5, mix: 0.2 })
  }

  private getCompressorSettings(): CompressorSettings {
    return this.getEffectConfig('compressor', {
      threshold: -24, ratio: 4, attack: 0.003, release: 0.25, knee: 30
    });
  }

  private getDelaySettings(): DelaySettings {
    return this.getEffectConfig('delay', { time: 0.375, feedback: 0.3, mix: 0.2 });
  }

  private getPhaserSettings(): PhaserConfig {
    return this.getEffectConfig('phaser', {
      rate: 0.7, depth: 700, stages: 4, feedback: 0.3, mix: 0.5
    });
  }

  private getTremoloSettings(): TremoloSettings {
    return this.getEffectConfig('tremolo', { rate: 5, depth: 0.5 });
  }

  private getFlangerSettings(): FlangerSettings {
    return this.getEffectConfig('flanger', { rate: 0.5, depth: 2, feedback: 0.5, mix: 0.5 });
  }

  private getNoiseSettings(): NoiseConfig {
    return this.noiseModule?.getConfig() ?? { type: 'white', level: 0.3, enabled: false };
  }

  private getEQSettings(): ParametricEQConfig {
    return this.getEffectConfig('parametric-eq', {
      lowShelf: { frequency: 80, gain: 0, q: 1, type: 'lowshelf' as BiquadFilterType },
      lowMid: { frequency: 250, gain: 0, q: 1, type: 'peaking' as BiquadFilterType },
      mid: { frequency: 1000, gain: 0, q: 1, type: 'peaking' as BiquadFilterType },
      highMid: { frequency: 4000, gain: 0, q: 1, type: 'peaking' as BiquadFilterType },
      highShelf: { frequency: 12000, gain: 0, q: 1, type: 'highshelf' as BiquadFilterType },
    });
  }

  applySettings(settings: SynthSettings): void {
    const normalizedSettings = this.normalizeSettings(settings);

    this.applyMasterSettings(normalizedSettings.master);
    this.applyOscillatorSettings(normalizedSettings.oscillators);
    this.applyEnvelopeSettings(normalizedSettings.envelope);
    this.applyFilterSettings(normalizedSettings.filter);
    this.applyLFOSettings(normalizedSettings.lfos);

    this.applyCompressorSettings(normalizedSettings.compressor);
    this.applyChorusSettings(normalizedSettings.chorus);
    this.applyPhaserSettings(normalizedSettings.phaser);
    this.applyTremoloSettings(normalizedSettings.tremolo);
    this.applyDelaySettings(normalizedSettings.delay);
    this.applyWaveShaperSettings(normalizedSettings.distortion);
    this.applyReverbSettings(normalizedSettings.reverb);
    this.applyFlangerSettings(normalizedSettings.flanger);
    if (normalizedSettings.noise) {
      this.applyNoiseSettings(normalizedSettings.noise);
    }
    if (normalizedSettings.eq) {
      this.applyEQSettings(normalizedSettings.eq);
    }
  }

  private normalizeSettings(settings: SynthSettings): SynthSettings {
    return {
      ...settings,
      arpeggiator: {
        ...DEFAULT_ARPEGGIATOR_SETTINGS,
        ...settings.arpeggiator,
      },
    };
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
    const section = document.querySelector("bank-section[prefix='osc']") as BankSection;
    if (!section) return;
  
    // Replace all items
    section.setItems(oscillators);
  
    // Immediately sync OscillatorBank configs
    if (this.oscillatorBank) {
      this.oscillatorBank.setConfigs(section.getItems() as OscillatorConfig[]);
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
    this.setControlValue("filter-amount", settings.amount);
    this.setControlValue("filter-attack", settings.attack);
    this.setControlValue("filter-decay", settings.decay);
    this.setControlValue("filter-sustain", settings.sustain);
    this.setControlValue("filter-release", settings.release);
  }

  private applyLFOSettings(lfos: LFOSettings[]): void {
    const section = document.querySelector("bank-section[prefix='lfo']") as BankSection;
    if (!section) return;

    // Ensure we have at least one LFO
    const lfosToAdd = lfos.length > 0 ? lfos : [{ waveform: "sine" as OscillatorType, rate: 5, toFilter: 0, toPitch: 0 }];

    // Replace all items
    section.setItems(lfosToAdd);
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
    this.setControlValue("reverb-mix", settings.mix);
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

  private applyFlangerSettings(settings: FlangerSettings): void {
    this.setControlValue("flanger-rate", settings.rate);
    this.setControlValue("flanger-depth", settings.depth);
    this.setControlValue("flanger-feedback", settings.feedback);
    this.setControlValue("flanger-mix", settings.mix);
  }

  private applyNoiseSettings(settings: NoiseConfig): void {
    const noiseType = document.getElementById("noise-type") as HTMLSelectElement;
    if (noiseType) {
      noiseType.value = settings.type;
      noiseType.dispatchEvent(new Event("change"));
    }

    this.setControlValue("noise-level", settings.level);

    const noiseEnabled = document.getElementById("noise-enabled") as HTMLInputElement;
    if (noiseEnabled) {
      noiseEnabled.checked = settings.enabled;
      noiseEnabled.dispatchEvent(new Event("change"));
    }
  }

  private setControlValue(id: string, value: number): void {
    const element = document.getElementById(id);
    if (!element) return;

    if (element.tagName.toLowerCase() === 'range-control') {
      const rangeControl = element as RangeControl;
      if (rangeControl.setValue) {
        rangeControl.setValue(value);
      }
    } else {
      const control = element as HTMLInputElement;
      control.value = value.toString();
      control.dispatchEvent(new Event("input", { bubbles: true }));
      control.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  private applyEQSettings(eq: ParametricEQConfig): void {
    this.setParametricEq('eq-low-shelf-freq', eq.lowShelf.frequency);
    this.setParametricEq('eq-low-shelf-gain', eq.lowShelf.gain);
    this.setParametricEq('eq-low-shelf-q', eq.lowShelf.q);

    this.setParametricEq('eq-low-mid-freq', eq.lowMid.frequency);
    this.setParametricEq('eq-low-mid-gain', eq.lowMid.gain);
    this.setParametricEq('eq-low-mid-q', eq.lowMid.q);

    this.setParametricEq('eq-mid-freq', eq.mid.frequency);
    this.setParametricEq('eq-mid-gain', eq.mid.gain);
    this.setParametricEq('eq-mid-q', eq.mid.q);

    this.setParametricEq('eq-high-mid-freq', eq.highMid.frequency);
    this.setParametricEq('eq-high-mid-gain', eq.highMid.gain);
    this.setParametricEq('eq-high-mid-q', eq.highMid.q);

    this.setParametricEq('eq-high-shelf-freq', eq.highShelf.frequency);
    this.setParametricEq('eq-high-shelf-gain', eq.highShelf.gain);
    this.setParametricEq('eq-high-shelf-q', eq.highShelf.q);
  }

  private setParametricEq(id: string, value: number) {
    const el = document.getElementById(id);
    if (!el) return;
    // If it's a custom element with setValue, use it
    if ((el as any).setValue) {
      (el as any).setValue(value);
    } else {
      // Otherwise set value and dispatch both events
      (el as HTMLInputElement).value = value.toString();
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  };



  saveToLocalStorage(): void {
    const settings = this.getCurrentSettings();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  loadFromLocalStorage(): SynthSettings | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    try {
      return this.normalizeSettings(JSON.parse(stored) as SynthSettings);
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
      const settings = this.normalizeSettings(JSON.parse(json) as SynthSettings);
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
      return (JSON.parse(stored) as Preset[]).map((preset) => ({
        ...preset,
        settings: this.normalizeSettings(preset.settings),
      }));
    } catch {
      return [];
    }
  }

  deleteUserPreset(name: string): void {
    const presets = this.getUserPresets().filter(p => p.name !== name);
    localStorage.setItem(USER_PRESETS_KEY, JSON.stringify(presets));
  }
}
