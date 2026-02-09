import type { BaseEffectModule, EffectNodes } from './base-effect-module';
import { UIConfigService } from '../../services/ui-config-service';

export type DelayConfig = {
  time: number;
  feedback: number;
  mix: number;
};

/**
 * DelayModule manages a delay effect with feedback and dry/wet mix.
 * Implements BaseEffectModule for EffectsManager compatibility.
 */
export class DelayModule implements BaseEffectModule {
  private readonly elementIds = {
    time: 'delay-time',
    feedback: 'delay-feedback',
    mix: 'delay-mix'
  };

  private delayNode: DelayNode | null = null;
  private feedbackGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;

  constructor() {
    this.setupParameterListeners();
  }

  getConfig(): DelayConfig {
    return UIConfigService.getConfig({
      time: this.elementIds.time,
      feedback: this.elementIds.feedback,
      mix: this.elementIds.mix
    });
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    this.disconnect();

    const { time, feedback, mix } = this.getConfig();

    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    this.delayNode = audioCtx.createDelay(2); // Max 2 seconds
    this.delayNode.delayTime.value = time;

    this.feedbackGain = audioCtx.createGain();
    this.feedbackGain.gain.value = feedback;

    this.wetGain = audioCtx.createGain();
    this.wetGain.gain.value = mix;

    this.dryGain = audioCtx.createGain();
    this.dryGain.gain.value = 1 - mix;

    // Input splits to dry and delay paths
    this.inputGain.connect(this.dryGain);
    this.inputGain.connect(this.delayNode);

    // Delay feedback loop
    this.delayNode.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delayNode);

    // Delay to wet output
    this.delayNode.connect(this.wetGain);

    // Mix dry and wet to output
    this.dryGain.connect(this.outputGain);
    this.wetGain.connect(this.outputGain);

    // Output to next effect
    this.outputGain.connect(destination);

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
    return this.inputGain !== null && this.delayNode !== null;
  }

  private setupParameterListeners(): void {
    // Simple parameters use helper method
    UIConfigService.bindAudioParams([
      { 
        elementId: this.elementIds.time, 
        audioParam: () => this.delayNode?.delayTime 
      },
      { 
        elementId: this.elementIds.feedback, 
        audioParam: () => this.feedbackGain?.gain 
      }
    ]);

    // Mix parameter affects two gains - use custom handler
    UIConfigService.onInput(this.elementIds.mix, (el, value) => {
      const mix = Number.parseFloat(value);
      if (this.wetGain && this.dryGain) {
        this.wetGain.gain.value = mix;
        this.dryGain.gain.value = 1 - mix;
      }
    });
  }

  private disconnect(): void {
    if (this.inputGain) this.inputGain.disconnect();
    if (this.outputGain) this.outputGain.disconnect();
    if (this.delayNode) this.delayNode.disconnect();
    if (this.feedbackGain) this.feedbackGain.disconnect();
    if (this.wetGain) this.wetGain.disconnect();
    if (this.dryGain) this.dryGain.disconnect();
    this.inputGain = null;
    this.outputGain = null;
    this.delayNode = null;
    this.feedbackGain = null;
    this.wetGain = null;
    this.dryGain = null;
  }
}