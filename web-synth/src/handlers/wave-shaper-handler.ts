// src/modules/wave-shaper-module.ts
export type WaveShaperConfig = {
  curve: Float32Array;
  oversample: 'none' | '2x' | '4x';
};

export type WaveShaperNodes = {
  input: GainNode;
  output: GainNode;
};

/**
 * WaveShaperModule manages a wave shaping effect
 * Handles the shaping curve and oversampling settings
 */
export class WaveShaperModule {
  private readonly curveEl: HTMLInputElement;
  private readonly oversampleEl: HTMLSelectElement;

  private waveShaperNode: WaveShaperNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;

  constructor(curveEl: HTMLInputElement, oversampleEl: HTMLSelectElement) {
    this.curveEl = curveEl;
    this.oversampleEl = oversampleEl;

    this.setupParameterListeners();
  }

  getConfig(): WaveShaperConfig {
    return {
      curve: this.getCurve(),
      oversample: this.oversampleEl.value as 'none' | '2x' | '4x',
    };
  }

  private getCurve(): Float32Array {
    const curveString = this.curveEl.value;
    const curveArray = curveString.split(',').map(Number);
    return new Float32Array(curveArray);
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): WaveShaperNodes {
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    this.waveShaperNode = audioCtx.createWaveShaper();

    this.waveShaperNode.oversample = this.getConfig().oversample;
    this.waveShaperNode.curve = this.getConfig().curve;

    this.inputGain.connect(this.waveShaperNode);
    this.waveShaperNode.connect(this.outputGain);
    this.outputGain.connect(destination);

    return {
      input: this.inputGain,
      output: this.outputGain,
    };
  }

  private setupParameterListeners(): void {
    this.curveEl.addEventListener('input', () => {
      if (this.waveShaperNode) {
        this.waveShaperNode.curve = this.getCurve();
      }
    });

    this.oversampleEl.addEventListener('change', () => {
      if (this.waveShaperNode) {
        this.waveShaperNode.oversample = this.oversampleEl.value as 'none' | '2x' | '4x';
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
    return this.waveShaperNode !== null;
  }
}