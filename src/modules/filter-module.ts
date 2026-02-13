import { EnvelopeModule } from "./envelope-module";
import { UIConfigService } from "../services/ui-config-service";

export type FilterConfig = {
  type: BiquadFilterType;
  cutoff: number;
  resonance: number;
  amount: number;
};

export type FilterInstance = {
  filter: BiquadFilterNode;
  envelopeGain: GainNode;
};

/**
 * MultiModeFilterModule manages filter type, cutoff, resonance, and envelope modulation
 */
export class FilterModule {
  private readonly filterEnvelope: EnvelopeModule;

  private readonly elementIds = {
    type: "filter-type",
    cutoff: "filter-cutoff",
    resonance: "filter-resonance",
    amount: "filter-amount",
  };

  constructor(filterEnvelope: EnvelopeModule) {
    this.filterEnvelope = filterEnvelope;
  }

  getConfig(): FilterConfig {
    const cfg = UIConfigService.getConfig({
      type: {
        id: this.elementIds.type,
        select: true,
        transform: (v) => v as BiquadFilterType,
      },
      cutoff: this.elementIds.cutoff,
      resonance: this.elementIds.resonance,
      amount: this.elementIds.amount,
    });

    return {
      type: (cfg.type as BiquadFilterType) || "lowpass",
      cutoff: cfg.cutoff,
      resonance: cfg.resonance,
      amount: cfg.amount,
    };
  }

  createFilter(audioCtx: AudioContext, lfoToFilter?: GainNode): FilterInstance {
    const { type, cutoff, resonance, amount } = this.getConfig();

    const filter = audioCtx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = cutoff;
    filter.Q.value = resonance;

    const envelopeGain = audioCtx.createGain();
    envelopeGain.gain.value = amount;
    envelopeGain.connect(filter.frequency);

    if (lfoToFilter) {
      lfoToFilter.connect(filter.frequency);
    }

    return { filter, envelopeGain };
  }

  applyEnvelope(filterInstance: FilterInstance, startTime: number): void {
    const { amount } = this.getConfig();
    this.filterEnvelope.applyEnvelope(
      filterInstance.envelopeGain.gain,
      startTime,
      0,
      amount
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