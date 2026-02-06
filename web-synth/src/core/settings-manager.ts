// src/modules/wave-shaper-module.ts
export type WaveShaperConfig = {
  curve: number[];
  oversample: 'none' | '2x' | '4x';
};

export type WaveShaperNodes = {
  input: GainNode;
  output: GainNode;
};

/**
 * WaveShaperModule applies wave shaping to the audio signal
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
      curve: JSON.parse(this.curveEl.value),
      oversample: this.oversampleEl.value as 'none' | '2x' | '4x',
    };
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): WaveShaperNodes {
    const { curve, oversample } = this.getConfig();

    this.waveShaperNode = audioCtx.createWaveShaper();
    this.waveShaperNode.curve = new Float32Array(curve);
    this.waveShaperNode.oversample = oversample;

    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    this.inputGain.connect(this.waveShaperNode);
    this.waveShaperNode.connect(this.outputGain);
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
    return this.waveShaperNode !== null;
  }

  private setupParameterListeners(): void {
    this.curveEl.addEventListener('input', () => {
      if (this.waveShaperNode) {
        this.waveShaperNode.curve = new Float32Array(JSON.parse(this.curveEl.value));
      }
    });

    this.oversampleEl.addEventListener('change', () => {
      if (this.waveShaperNode) {
        this.waveShaperNode.oversample = this.oversampleEl.value as 'none' | '2x' | '4x';
      }
    });
  }
}