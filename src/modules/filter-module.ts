import { EnvelopeModule } from "./envelope-module";

export type FilterConfig = {
  cutoff: number;
  resonance: number;
  envelopeAmount: number;
};

export type FilterInstance = {
  filter: BiquadFilterNode;
  envelopeGain: GainNode;
};

/**
 * FilterModule manages the filter and its envelope for each voice
 * Handles filter cutoff, resonance, and envelope modulation
 */
export class FilterModule {
  private readonly cutoffEl: HTMLInputElement;
  private readonly resonanceEl: HTMLInputElement;
  private readonly envelopeAmountEl: HTMLInputElement;
  private readonly filterEnvelope: EnvelopeModule;

  constructor(
    cutoffEl: HTMLInputElement,
    resonanceEl: HTMLInputElement,
    envelopeAmountEl: HTMLInputElement,
    filterEnvelope: EnvelopeModule
  ) {
    this.cutoffEl = cutoffEl;
    this.resonanceEl = resonanceEl;
    this.envelopeAmountEl = envelopeAmountEl;
    this.filterEnvelope = filterEnvelope;
  }

  /**
   * Get the current filter configuration values
   * @returns Object containing filter parameters
   */
  getConfig(): FilterConfig {
    return {
      cutoff: Number.parseFloat(this.cutoffEl.value),
      resonance: Number.parseFloat(this.resonanceEl.value),
      envelopeAmount: Number.parseFloat(this.envelopeAmountEl.value)
    };
  }

  /**
   * Create a filter instance with envelope modulation for a voice
   * @param audioCtx - The AudioContext to create nodes in
   * @param lfoToFilter - Optional LFO gain node to modulate filter cutoff
   * @returns FilterInstance containing the filter and envelope gain nodes
   */
  createFilter(
    audioCtx: AudioContext,
    lfoToFilter?: GainNode
  ): FilterInstance {
    const { cutoff, resonance, envelopeAmount } = this.getConfig();

    // Create the filter
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;
    filter.Q.value = resonance;

    // Create envelope modulation
    const envelopeGain = audioCtx.createGain();
    envelopeGain.gain.value = envelopeAmount;
    envelopeGain.connect(filter.frequency);

    // Connect LFO to filter if provided
    if (lfoToFilter) {
      lfoToFilter.connect(filter.frequency);
    }

    return { filter, envelopeGain };
  }

  /**
   * Apply the filter envelope to modulate the filter cutoff
   * @param filterInstance - The filter instance to apply envelope to
   * @param startTime - When to start the envelope
   */
  applyEnvelope(filterInstance: FilterInstance, startTime: number): void {
    const { envelopeAmount } = this.getConfig();
    
    // Apply envelope to the envelope gain (which modulates filter frequency)
    this.filterEnvelope.applyEnvelope(
      filterInstance.envelopeGain.gain,
      startTime,
      0,
      envelopeAmount
    );
  }

  /**
   * Apply the release stage of the filter envelope
   * @param filterInstance - The filter instance to apply release to
   * @param startTime - When to start the release
   * @returns Duration of the release phase in seconds
   */
  applyRelease(filterInstance: FilterInstance, startTime: number): number {
    return this.filterEnvelope.applyRelease(
      filterInstance.envelopeGain.gain,
      startTime,
      0
    );
  }

  /**
   * Get the filter release time
   * @returns Release time in seconds
   */
  getRelease(): number {
    return this.filterEnvelope.getRelease();
  }
}