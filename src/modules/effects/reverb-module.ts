import type { BaseEffectModule, EffectNodes } from './base-effect-module';
import { UIConfigService } from '../../services/ui-config-service';

export type ReverbConfig = {
  decay: number;
  mix: number;
};

export class ReverbModule implements BaseEffectModule {
  // Element IDs managed via UIConfigService
  private readonly elementIds = {
    decay: 'reverb-decay',
    mix: 'reverb-mix'
  };

  private convolver: ConvolverNode | null = null;
  private wetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;

  constructor() {
    this.setupParameterListeners();
  }

  getConfig(): ReverbConfig {
    return UIConfigService.getConfig({
      decay: this.elementIds.decay,
      mix: this.elementIds.mix
    });
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    this.disconnect();

    const { decay, mix } = this.getConfig();

    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    this.convolver = audioCtx.createConvolver();
    this.convolver.buffer = this.generateImpulseResponse(audioCtx, decay);

    this.wetGain = audioCtx.createGain();
    this.wetGain.gain.value = mix;

    this.dryGain = audioCtx.createGain();
    this.dryGain.gain.value = 1 - mix;

    this.inputGain.connect(this.dryGain);
    this.inputGain.connect(this.convolver);

    this.convolver.connect(this.wetGain);

    this.dryGain.connect(this.outputGain);
    this.wetGain.connect(this.outputGain);

    this.outputGain.connect(destination);

    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }

  private generateImpulseResponse(audioCtx: AudioContext, decay: number): AudioBuffer {
    const sampleRate = audioCtx.sampleRate;
    const length = Math.max(1, Math.floor(sampleRate * decay));
    const impulse = audioCtx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const n = Math.random() * 2 - 1;
        channelData[i] = n * Math.pow(1 - i / length, decay);
      }
    }
    return impulse;
  }

  private updateDecay(audioCtx: AudioContext): void {
    if (this.convolver) {
      const decay = Number.parseFloat(UIConfigService.getInput(this.elementIds.decay).value);
      this.convolver.buffer = this.generateImpulseResponse(audioCtx, decay);
    }
  }

  getInput(): GainNode | null {
    return this.inputGain;
  }

  getOutput(): GainNode | null {
    return this.outputGain;
  }

  isInitialized(): boolean {
    return this.convolver !== null;
  }

  private setupParameterListeners(): void {
    // Dispatch a custom event when decay changes; main.ts listens and calls updateWithContext
    UIConfigService.onInput(this.elementIds.decay, (element, value) => {
      element.dispatchEvent(new CustomEvent('decay-changed', {
        bubbles: true,
        detail: { decay: Number.parseFloat(value) }
      }));
    });

    // Mix updates wet/dry gains
    UIConfigService.onInput(this.elementIds.mix, (_el, value) => {
      if (this.wetGain && this.dryGain) {
        const mix = Number.parseFloat(value);
        this.wetGain.gain.value = mix;
        this.dryGain.gain.value = 1 - mix;
      }
    });
  }

  updateWithContext(audioCtx: AudioContext): void {
    this.updateDecay(audioCtx);
  }

  private disconnect(): void {
    if (this.inputGain) this.inputGain.disconnect();
    if (this.outputGain) this.outputGain.disconnect();
    if (this.convolver) this.convolver.disconnect();
    if (this.wetGain) this.wetGain.disconnect();
    if (this.dryGain) this.dryGain.disconnect();
    this.inputGain = null;
    this.outputGain = null;
    this.convolver = null;
    this.wetGain = null;
    this.dryGain = null;
  }
}