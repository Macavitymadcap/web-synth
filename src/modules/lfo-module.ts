import { UIConfigService } from "../services/ui-config-service";

export type LFOConfig = {
  rate: number;
  waveform: OscillatorType;
  toFilter: number;
  toPitch: number;
};

export type LFORouting = {
  toFilter: GainNode;
  toPitch: GainNode;
};

/**
 * LFOModule manages a Low-Frequency Oscillator for modulation
 * Supports multiple instances via dynamic ID parameter
 */
export class LFOModule {
  private readonly id: string;
  private readonly elementIds: {
    rate: string;
    waveform: string;
    toFilter: string;
    toPitch: string;
  };

  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private lfoToFilter: GainNode | null = null;
  private lfoToPitch: GainNode | null = null;

  /**
   * @param id - LFO instance ID (e.g., '1', '2', '3')
   */
  constructor(id: string) {
    this.id = id;
    this.elementIds = {
      rate: `lfo-${id}-rate`,
      waveform: `lfo-${id}-waveform`,
      toFilter: `lfo-${id}-to-filter`,
      toPitch: `lfo-${id}-to-pitch`,
    };
    this.setupParameterListeners();
  }

  getConfig(): LFOConfig {
    const config = UIConfigService.getConfig({
      rate: this.elementIds.rate,
      toFilter: this.elementIds.toFilter,
      toPitch: this.elementIds.toPitch,
      waveform: {
        id: this.elementIds.waveform,
        select: true,
        transform: (v) => v as OscillatorType
      }
    });
    return config as LFOConfig;
  }

  initialize(audioCtx: AudioContext): LFORouting {
    const { rate, waveform, toFilter, toPitch } = this.getConfig();

    // Create LFO oscillator
    this.lfo = audioCtx.createOscillator();
    this.lfo.type = waveform;
    this.lfo.frequency.value = rate;

    // Create main LFO gain (always 1, acts as a splitter)
    this.lfoGain = audioCtx.createGain();
    this.lfoGain.gain.value = 1;

    // Create routing gains
    this.lfoToFilter = audioCtx.createGain();
    this.lfoToFilter.gain.value = toFilter;

    this.lfoToPitch = audioCtx.createGain();
    this.lfoToPitch.gain.value = toPitch;

    // Wire up LFO
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.lfoToFilter);
    this.lfoGain.connect(this.lfoToPitch);

    // Start LFO
    this.lfo.start();

    return {
      toFilter: this.lfoToFilter,
      toPitch: this.lfoToPitch
    };
  }

  getFilterModulation(): GainNode | null {
    return this.lfoToFilter;
  }

  getPitchModulation(): GainNode | null {
    return this.lfoToPitch;
  }

  isInitialized(): boolean {
    return this.lfo !== null;
  }

  getId(): string {
    return this.id;
  }

  private setupParameterListeners(): void {
    UIConfigService.bindAudioParams([
      { elementId: this.elementIds.rate, audioParam: () => this.lfo?.frequency },
      { elementId: this.elementIds.toFilter, audioParam: () => this.lfoToFilter?.gain },
      { elementId: this.elementIds.toPitch, audioParam: () => this.lfoToPitch?.gain },
    ]);

    UIConfigService.onSelect(this.elementIds.waveform, (_el, value) => {
      if (this.lfo) {
        this.lfo.type = value as OscillatorType;
      }
    });
  }
}