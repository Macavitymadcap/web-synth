import { EnvelopeModule } from "./envelope-module";

export type FilterConfig = {
  type: BiquadFilterType;
  cutoff: number;
  resonance: number;
  envelopeAmount: number;
};

export type FilterInstance = {
  filter: BiquadFilterNode;
  envelopeGain: GainNode;
};

/**
 * MultiModeFilterModule manages filter type, cutoff, resonance, and envelope modulation
 */
export class FilterModule {
  private readonly typeEl: HTMLSelectElement;
  private readonly cutoffEl: HTMLInputElement;
  private readonly resonanceEl: HTMLInputElement;
  private readonly envelopeAmountEl: HTMLInputElement;
  private readonly filterEnvelope: EnvelopeModule;

  constructor(
    typeEl: HTMLSelectElement,
    cutoffEl: HTMLInputElement,
    resonanceEl: HTMLInputElement,
    envelopeAmountEl: HTMLInputElement,
    filterEnvelope: EnvelopeModule
  ) {
    this.typeEl = typeEl;
    this.cutoffEl = cutoffEl;
    this.resonanceEl = resonanceEl;
    this.envelopeAmountEl = envelopeAmountEl;
    this.filterEnvelope = filterEnvelope;
  }

  getConfig(): FilterConfig {
    return {
      type: (this.typeEl.value as BiquadFilterType) || "lowpass",
      cutoff: Number.parseFloat(this.cutoffEl.value),
      resonance: Number.parseFloat(this.resonanceEl.value),
      envelopeAmount: Number.parseFloat(this.envelopeAmountEl.value)
    };
  }

  createFilter(
    audioCtx: AudioContext,
    lfoToFilter?: GainNode
  ): FilterInstance {
    const { type, cutoff, resonance, envelopeAmount } = this.getConfig();

    const filter = audioCtx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = cutoff;
    filter.Q.value = resonance;

    const envelopeGain = audioCtx.createGain();
    envelopeGain.gain.value = envelopeAmount;
    envelopeGain.connect(filter.frequency);

    if (lfoToFilter) {
      lfoToFilter.connect(filter.frequency);
    }

    return { filter, envelopeGain };
  }

  applyEnvelope(filterInstance: FilterInstance, startTime: number): void {
    const { envelopeAmount } = this.getConfig();
    this.filterEnvelope.applyEnvelope(
      filterInstance.envelopeGain.gain,
      startTime,
      0,
      envelopeAmount
    );
  }

  applyRelease(filterInstance: FilterInstance, startTime: number): number {
    return this.filterEnvelope.applyRelease(
      filterInstance.envelopeGain.gain,
      startTime,
      0
    );
  }

  getRelease(): number {
    return this.filterEnvelope.getRelease();
  }
}