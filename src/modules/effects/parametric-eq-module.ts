import type { BaseEffectModule, EffectNodes } from './base-effect-module';
import { UIConfigService } from '../../services/ui-config-service';

export type EQBand = {
  frequency: number;
  gain: number;
  q: number;
  type: BiquadFilterType;
};

export type ParametricEQConfig = {
  lowShelf: EQBand;
  lowMid: EQBand;
  mid: EQBand;
  highMid: EQBand;
  highShelf: EQBand;
};

/**
 * ParametricEQModule provides 5-band parametric equalization
 * Bands: Low Shelf, Low Mid (Bell), Mid (Bell), High Mid (Bell), High Shelf
 */
export class ParametricEQModule implements BaseEffectModule {
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private destination: AudioNode | null = null;
  
  private lowShelfFilter: BiquadFilterNode | null = null;
  private lowMidFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private highMidFilter: BiquadFilterNode | null = null;
  private highShelfFilter: BiquadFilterNode | null = null;

  // UI element IDs
  private readonly elementIds = {
    enabled: 'eq-enabled',
    
    // Low Shelf (80 Hz)
    lowShelfFreq: 'eq-low-shelf-freq',
    lowShelfGain: 'eq-low-shelf-gain',
    lowShelfQ: 'eq-low-shelf-q',
    
    // Low Mid (250 Hz)
    lowMidFreq: 'eq-low-mid-freq',
    lowMidGain: 'eq-low-mid-gain',
    lowMidQ: 'eq-low-mid-q',
    
    // Mid (1000 Hz)
    midFreq: 'eq-mid-freq',
    midGain: 'eq-mid-gain',
    midQ: 'eq-mid-q',
    
    // High Mid (4000 Hz)
    highMidFreq: 'eq-high-mid-freq',
    highMidGain: 'eq-high-mid-gain',
    highMidQ: 'eq-high-mid-q',
    
    // High Shelf (12000 Hz)
    highShelfFreq: 'eq-high-shelf-freq',
    highShelfGain: 'eq-high-shelf-gain',
    highShelfQ: 'eq-high-shelf-q',
  };

  getConfig(): ParametricEQConfig {
    return {
      lowShelf: {
        frequency: this.getParam(this.elementIds.lowShelfFreq, 80),
        gain: this.getParam(this.elementIds.lowShelfGain, 0),
        q: this.getParam(this.elementIds.lowShelfQ, 1),
        type: 'lowshelf'
      },
      lowMid: {
        frequency: this.getParam(this.elementIds.lowMidFreq, 250),
        gain: this.getParam(this.elementIds.lowMidGain, 0),
        q: this.getParam(this.elementIds.lowMidQ, 1),
        type: 'peaking'
      },
      mid: {
        frequency: this.getParam(this.elementIds.midFreq, 1000),
        gain: this.getParam(this.elementIds.midGain, 0),
        q: this.getParam(this.elementIds.midQ, 1),
        type: 'peaking'
      },
      highMid: {
        frequency: this.getParam(this.elementIds.highMidFreq, 4000),
        gain: this.getParam(this.elementIds.highMidGain, 0),
        q: this.getParam(this.elementIds.highMidQ, 1),
        type: 'peaking'
      },
      highShelf: {
        frequency: this.getParam(this.elementIds.highShelfFreq, 12000),
        gain: this.getParam(this.elementIds.highShelfGain, 0),
        q: this.getParam(this.elementIds.highShelfQ, 1),
        type: 'highshelf'
      }
    };
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    this.disconnect();

    const config = this.getConfig();
    this.destination = destination;

    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    // Create filters for each band
    this.lowShelfFilter = this.createFilter(audioCtx, config.lowShelf);
    this.lowMidFilter = this.createFilter(audioCtx, config.lowMid);
    this.midFilter = this.createFilter(audioCtx, config.mid);
    this.highMidFilter = this.createFilter(audioCtx, config.highMid);
    this.highShelfFilter = this.createFilter(audioCtx, config.highShelf);

    // Chain filters: input -> lowShelf -> lowMid -> mid -> highMid -> highShelf -> output -> destination
    this.inputGain.connect(this.lowShelfFilter);
    this.lowShelfFilter.connect(this.lowMidFilter);
    this.lowMidFilter.connect(this.midFilter);
    this.midFilter.connect(this.highMidFilter);
    this.highMidFilter.connect(this.highShelfFilter);
    this.highShelfFilter.connect(this.outputGain);
    this.outputGain.connect(destination);

    // Setup parameter listeners AFTER nodes are created
    this.setupParameterListeners();

    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }

  getInput(): GainNode | null {
    return this.inputGain;
  }

  getOutput(): GainNode | null {
    return this.outputGain;
  }

  isInitialized(): boolean {
    return this.lowShelfFilter !== null;
  }

  private createFilter(audioCtx: AudioContext, config: EQBand): BiquadFilterNode {
    const filter = audioCtx.createBiquadFilter();
    filter.type = config.type;
    filter.frequency.value = config.frequency;
    filter.gain.value = config.gain;
    filter.Q.value = config.q;
    return filter;
  }

  private setupParameterListeners(): void {
    // Enable/disable toggle - bypass by reconnecting nodes
    if (UIConfigService.exists(this.elementIds.enabled)) {
      UIConfigService.onInput(
        this.elementIds.enabled,
        (el) => {
          const enabled = el.checked;
          this.setBypass(!enabled);
        },
        'change'
      );
    }

    // Low Shelf band
    this.bindBandParameters(
      'lowShelf',
      this.elementIds.lowShelfFreq,
      this.elementIds.lowShelfGain,
      this.elementIds.lowShelfQ,
      () => this.lowShelfFilter
    );

    // Low Mid band
    this.bindBandParameters(
      'lowMid',
      this.elementIds.lowMidFreq,
      this.elementIds.lowMidGain,
      this.elementIds.lowMidQ,
      () => this.lowMidFilter
    );

    // Mid band
    this.bindBandParameters(
      'mid',
      this.elementIds.midFreq,
      this.elementIds.midGain,
      this.elementIds.midQ,
      () => this.midFilter
    );

    // High Mid band
    this.bindBandParameters(
      'highMid',
      this.elementIds.highMidFreq,
      this.elementIds.highMidGain,
      this.elementIds.highMidQ,
      () => this.highMidFilter
    );

    // High Shelf band
    this.bindBandParameters(
      'highShelf',
      this.elementIds.highShelfFreq,
      this.elementIds.highShelfGain,
      this.elementIds.highShelfQ,
      () => this.highShelfFilter
    );
  }

  private bindBandParameters(
    _bandName: string,
    freqId: string,
    gainId: string,
    qId: string,
    getFilter: () => BiquadFilterNode | null
  ): void {
    // Bind frequency
    UIConfigService.bindAudioParam({
      elementId: freqId,
      audioParam: () => getFilter()?.frequency
    });

    // Bind gain
    UIConfigService.bindAudioParam({
      elementId: gainId,
      audioParam: () => getFilter()?.gain
    });

    // Bind Q
    UIConfigService.bindAudioParam({
      elementId: qId,
      audioParam: () => getFilter()?.Q
    });
  }

  private getParam(elementId: string, defaultValue: number): number {
    try {
      const input = UIConfigService.getInput(elementId);
      return Number.parseFloat(input.value);
    } catch {
      return defaultValue;
    }
  }

  private disconnect(): void {
    if (this.inputGain) this.inputGain.disconnect();
    if (this.outputGain) this.outputGain.disconnect();
    if (this.lowShelfFilter) this.lowShelfFilter.disconnect();
    if (this.lowMidFilter) this.lowMidFilter.disconnect();
    if (this.midFilter) this.midFilter.disconnect();
    if (this.highMidFilter) this.highMidFilter.disconnect();
    if (this.highShelfFilter) this.highShelfFilter.disconnect();

    this.inputGain = null;
    this.outputGain = null;
    this.lowShelfFilter = null;
    this.lowMidFilter = null;
    this.midFilter = null;
    this.highMidFilter = null;
    this.highShelfFilter = null;
  }

  private setBypass(bypass: boolean): void {
    if (!this.inputGain || !this.outputGain || !this.destination) return;
    
    // Disconnect everything first
    this.inputGain.disconnect();
    this.outputGain.disconnect();
    if (this.lowShelfFilter) this.lowShelfFilter.disconnect();
    if (this.lowMidFilter) this.lowMidFilter.disconnect();
    if (this.midFilter) this.midFilter.disconnect();
    if (this.highMidFilter) this.highMidFilter.disconnect();
    if (this.highShelfFilter) this.highShelfFilter.disconnect();

    if (bypass) {
      // Bypass: connect input directly to output
      this.inputGain.connect(this.outputGain);
      this.outputGain.connect(this.destination);
    } else {
      // Active: connect through all filters
      this.inputGain.connect(this.lowShelfFilter!);
      this.lowShelfFilter!.connect(this.lowMidFilter!);
      this.lowMidFilter!.connect(this.midFilter!);
      this.midFilter!.connect(this.highMidFilter!);
      this.highMidFilter!.connect(this.highShelfFilter!);
      this.highShelfFilter!.connect(this.outputGain);
      this.outputGain.connect(this.destination);
    }
  }
}