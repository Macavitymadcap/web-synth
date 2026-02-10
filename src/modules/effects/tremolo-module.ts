import type { BaseEffectModule, EffectNodes } from './base-effect-module';
import { UIConfigService } from '../../services/ui-config-service';

export type TremoloConfig = {
  rate: number;
  depth: number;
};

export class TremoloModule implements BaseEffectModule {
  private readonly elementIds = {
    rate: 'tremolo-rate',
    depth: 'tremolo-depth'
  };

  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private ampGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  constructor() {
    this.setupParameterListeners();
  }

  getConfig(): TremoloConfig {
    return UIConfigService.getConfig({
      rate: this.elementIds.rate,
      depth: this.elementIds.depth
    });
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    this.disconnect();

    const { rate, depth } = this.getConfig();

    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    this.ampGain = audioCtx.createGain();

    // Set base gain to 1.0 - depth/2 to center the modulation
    this.ampGain.gain.value = 1 - (depth / 2);

    // Create LFO
    this.lfo = audioCtx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = rate;

    // LFO gain controls modulation depth
    this.lfoGain = audioCtx.createGain();
    this.lfoGain.gain.value = depth / 2;

    // Route: input → ampGain → output
    // LFO modulates ampGain.gain
    this.inputGain.connect(this.ampGain);
    this.ampGain.connect(this.outputGain);
    this.outputGain.connect(destination);

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.ampGain.gain);

    this.lfo.start();

    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }

  private setupParameterListeners(): void {
    // Rate: update LFO frequency
    UIConfigService.bindAudioParam({
      elementId: this.elementIds.rate,
      audioParam: () => this.lfo?.frequency
    });

    // Depth: update both lfoGain and base ampGain
    UIConfigService.onInput(this.elementIds.depth, (_el, value) => {
      const depth = Number.parseFloat(value);

      if (this.lfoGain) {
        this.lfoGain.gain.value = depth / 2;
      }

      if (this.ampGain) {
        this.ampGain.gain.value = 1 - (depth / 2);
      }
    });
  }

  getInput(): GainNode | null {
    return this.inputGain;
  }

  getOutput(): GainNode | null {
    return this.outputGain;
  }

  isInitialized(): boolean {
    return this.lfo !== null && this.ampGain !== null;
  }

  private disconnect(): void {
    if (this.lfo) {
      try {
        this.lfo.stop();
      } catch {}
      this.lfo.disconnect();
    }
    if (this.lfoGain) this.lfoGain.disconnect();
    if (this.ampGain) this.ampGain.disconnect();
    if (this.inputGain) this.inputGain.disconnect();
    if (this.outputGain) this.outputGain.disconnect();

    this.lfo = null;
    this.lfoGain = null;
    this.ampGain = null;
    this.inputGain = null;
    this.outputGain = null;
  }
}