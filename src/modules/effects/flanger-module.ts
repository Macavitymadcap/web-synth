import type { BaseEffectModule, EffectNodes } from './base-effect-module';
import { UIConfigService } from '../../services/ui-config-service';

export type FlangerConfig = {
  rate: number;      // Hz
  depth: number;     // ms
  feedback: number;  // 0-0.95
  mix: number;       // 0-1
};

export class FlangerModule implements BaseEffectModule {
  private readonly elementIds = {
    rate: 'flanger-rate',
    depth: 'flanger-depth',
    feedback: 'flanger-feedback',
    mix: 'flanger-mix'
  };

  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private delay: DelayNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private feedbackGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;

  private readonly BASE_DELAY = 0.003; // 3ms

  constructor() {
    this.setupParameterListeners();
  }

  getConfig(): FlangerConfig {
    return UIConfigService.getConfig({
      rate: this.elementIds.rate,
      depth: this.elementIds.depth,
      feedback: this.elementIds.feedback,
      mix: this.elementIds.mix
    });
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    this.disconnect();

    const { rate, depth, feedback, mix } = this.getConfig();

    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    this.delay = audioCtx.createDelay(0.02); // Max 20ms
    this.delay.delayTime.value = this.BASE_DELAY;

    this.lfo = audioCtx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = rate;

    this.lfoGain = audioCtx.createGain();
    this.lfoGain.gain.value = depth * 0.001; // ms to seconds

    this.feedbackGain = audioCtx.createGain();
    this.feedbackGain.gain.value = feedback;

    this.wetGain = audioCtx.createGain();
    this.wetGain.gain.value = mix;

    this.dryGain = audioCtx.createGain();
    this.dryGain.gain.value = 1 - mix;

    // LFO modulates delay time
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.delay.delayTime);

    // Input splits to dry and delay
    this.inputGain.connect(this.dryGain);
    this.inputGain.connect(this.delay);

    // Feedback loop
    this.delay.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delay);

    // Delay to wet
    this.delay.connect(this.wetGain);

    // Mix to output
    this.dryGain.connect(this.outputGain);
    this.wetGain.connect(this.outputGain);

    // Output to next in chain
    this.outputGain.connect(destination);

    this.lfo.start();

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
    return this.inputGain !== null && this.outputGain !== null;
  }

  private setupParameterListeners(): void {
    // Rate
    UIConfigService.onInput(this.elementIds.rate, (_el, value) => {
      if (this.lfo) {
        this.lfo.frequency.value = Number.parseFloat(value);
      }
    });

    // Depth
    UIConfigService.onInput(this.elementIds.depth, (_el, value) => {
      if (this.lfoGain) {
        this.lfoGain.gain.value = Number.parseFloat(value) * 0.001;
      }
    });

    // Feedback
    UIConfigService.onInput(this.elementIds.feedback, (_el, value) => {
      if (this.feedbackGain) {
        this.feedbackGain.gain.value = Number.parseFloat(value);
      }
    });

    // Mix
    UIConfigService.onInput(this.elementIds.mix, (_el, value) => {
      const mix = Number.parseFloat(value);
      if (this.wetGain && this.dryGain) {
        this.wetGain.gain.value = mix;
        this.dryGain.gain.value = 1 - mix;
      }
    });
  }

  private disconnect(): void {
    if (this.lfo) {
      try { this.lfo.stop(); } catch {}
      this.lfo.disconnect();
    }
    if (this.lfoGain) this.lfoGain.disconnect();
    if (this.delay) this.delay.disconnect();
    if (this.feedbackGain) this.feedbackGain.disconnect();
    if (this.wetGain) this.wetGain.disconnect();
    if (this.dryGain) this.dryGain.disconnect();
    if (this.inputGain) this.inputGain.disconnect();
    if (this.outputGain) this.outputGain.disconnect();

    this.inputGain = null;
    this.outputGain = null;
    this.delay = null;
    this.lfo = null;
    this.lfoGain = null;
    this.feedbackGain = null;
    this.wetGain = null;
    this.dryGain = null;
  }
}