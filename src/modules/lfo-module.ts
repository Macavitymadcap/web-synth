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
 * Handles LFO rate, waveform, and routing to filter and pitch
 */
export class LFOModule {
  // UI element IDs (no constructor params)
  private readonly elementIds = {
    rate: 'lfo-rate',
    waveform: 'lfo-waveform',
    toFilter: 'lfo-to-filter',
    toPitch: 'lfo-to-pitch',
  };

  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private lfoToFilter: GainNode | null = null;
  private lfoToPitch: GainNode | null = null;

  constructor() {
    this.setupParameterListeners();
  }

  /**
   * Get the current LFO configuration values
   * @returns Object containing LFO parameters
   */
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

  /**
   * Initialize the LFO and its routing nodes
   * @param audioCtx - The AudioContext to create nodes in
   * @returns Object containing the routing gain nodes for filter and pitch modulation
   */
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

  /**
   * Get the filter modulation gain node
   * @returns GainNode for filter modulation, or null if not initialized
   */
  getFilterModulation(): GainNode | null {
    return this.lfoToFilter;
  }

  /**
   * Get the pitch modulation gain node
   * @returns GainNode for pitch modulation, or null if not initialized
   */
  getPitchModulation(): GainNode | null {
    return this.lfoToPitch;
  }

  /**
   * Check if the LFO has been initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.lfo !== null;
  }

  /**
   * Setup event listeners for real-time parameter changes
   * @private
   */
  private setupParameterListeners(): void {
    // Bind simple AudioParams
    UIConfigService.bindAudioParams([
      { elementId: this.elementIds.rate, audioParam: () => this.lfo?.frequency },
      { elementId: this.elementIds.toFilter, audioParam: () => this.lfoToFilter?.gain },
      { elementId: this.elementIds.toPitch, audioParam: () => this.lfoToPitch?.gain },
    ]);

    // Waveform select handler
    UIConfigService.onSelect(this.elementIds.waveform, (_el, value) => {
      if (this.lfo) {
        this.lfo.type = value as OscillatorType;
      }
    });
  }
}
// ...existing code...