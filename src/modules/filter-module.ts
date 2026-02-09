import { EnvelopeModule } from "./envelope-module";
import { UIConfigService } from "../services/ui-config-service";

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
  private readonly filterEnvelope: EnvelopeModule;

  private readonly elementIds = {
    type: "filter-type",
    cutoff: "filter-cutoff",
    resonance: "filter-resonance",
    envelopeAmount: "filter-env-amount",
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
      envelopeAmount: this.elementIds.envelopeAmount,
    });

    return {
      type: (cfg.type as BiquadFilterType) || "lowpass",
      cutoff: cfg.cutoff,
      resonance: cfg.resonance,
      envelopeAmount: cfg.envelopeAmount,
    };
  }

  createFilter(audioCtx: AudioContext, lfoToFilter?: GainNode): FilterInstance {
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