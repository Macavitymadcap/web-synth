import type { BaseEffectModule, EffectNodes } from './effects/base-effect-module';

export type CompressorConfig = {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  knee: number;
};

export class CompressorModule implements BaseEffectModule {
  private readonly thresholdEl: HTMLInputElement;
  private readonly ratioEl: HTMLInputElement;
  private readonly attackEl: HTMLInputElement;
  private readonly releaseEl: HTMLInputElement;
  private readonly kneeEl: HTMLInputElement;

  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  constructor(
    thresholdEl: HTMLInputElement,
    ratioEl: HTMLInputElement,
    attackEl: HTMLInputElement,
    releaseEl: HTMLInputElement,
    kneeEl: HTMLInputElement
  ) {
    this.thresholdEl = thresholdEl;
    this.ratioEl = ratioEl;
    this.attackEl = attackEl;
    this.releaseEl = releaseEl;
    this.kneeEl = kneeEl;
    this.setupParameterListeners();
  }

  getConfig(): CompressorConfig {
    return {
      threshold: Number.parseFloat(this.thresholdEl.value),
      ratio: Number.parseFloat(this.ratioEl.value),
      attack: Number.parseFloat(this.attackEl.value),
      release: Number.parseFloat(this.releaseEl.value),
      knee: Number.parseFloat(this.kneeEl.value),
    };
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    this.disconnect();

    const { threshold, ratio, attack, release, knee } = this.getConfig();

    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    this.compressor = audioCtx.createDynamicsCompressor();

    this.compressor.threshold.value = threshold;
    this.compressor.ratio.value = ratio;
    this.compressor.attack.value = attack;
    this.compressor.release.value = release;
    this.compressor.knee.value = knee;

    this.inputGain.connect(this.compressor);
    this.compressor.connect(this.outputGain);
    this.outputGain.connect(destination);

    return {
      input: this.inputGain,
      output: this.outputGain,
    };
  }

  getInput(): GainNode | null {
    return this.inputGain;
  }

  getOutput(): GainNode | null {
    return this.outputGain;
  }

  isInitialized(): boolean {
    return this.compressor !== null;
  }

  private setupParameterListeners(): void {
    this.thresholdEl.addEventListener('input', () => {
      if (this.compressor) this.compressor.threshold.value = Number.parseFloat(this.thresholdEl.value);
    });
    this.ratioEl.addEventListener('input', () => {
      if (this.compressor) this.compressor.ratio.value = Number.parseFloat(this.ratioEl.value);
    });
    this.attackEl.addEventListener('input', () => {
      if (this.compressor) this.compressor.attack.value = Number.parseFloat(this.attackEl.value);
    });
    this.releaseEl.addEventListener('input', () => {
      if (this.compressor) this.compressor.release.value = Number.parseFloat(this.releaseEl.value);
    });
    this.kneeEl.addEventListener('input', () => {
      if (this.compressor) this.compressor.knee.value = Number.parseFloat(this.kneeEl.value);
    });
  }

  private disconnect(): void {
    if (this.inputGain) this.inputGain.disconnect();
    if (this.outputGain) this.outputGain.disconnect();
    if (this.compressor) this.compressor.disconnect();
    this.inputGain = null;
    this.outputGain = null;
    this.compressor = null;
  }
}