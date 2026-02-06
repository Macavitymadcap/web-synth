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

  /**
   * Get the current wave shaper configuration values
   * @returns Object containing wave shaper parameters
   */
  getConfig(): WaveShaperConfig {
    const curve = new Float32Array(JSON.parse(this.curveEl.value));
    const oversample = this.oversampleEl.value as 'none' | '2x' | '4x';
    return { curve, oversample };
  }

  /**
   * Initialize the wave shaper effect and its routing
   * @param audioCtx - The AudioContext to create nodes in
   * @param destination - The destination node (typically master gain)
   * @returns Object containing input and output gain nodes for the wave shaper
   */
  initialize(audioCtx: AudioContext, destination: AudioNode): WaveShaperNodes {
    const { curve, oversample } = this.getConfig();

    // Create input and output nodes
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    // Create wave shaper node
    this.waveShaperNode = audioCtx.createWaveShaper();
    this.waveShaperNode.curve = curve;
    this.waveShaperNode.oversample = oversample;

    // Wire up wave shaper effect
    this.inputGain.connect(this.waveShaperNode);
    this.waveShaperNode.connect(this.outputGain);
    this.outputGain.connect(destination);

    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }

  /**
   * Setup event listeners for real-time parameter changes
   * @private
   */
  private setupParameterListeners(): void {
    this.curveEl.addEventListener('input', () => {
      if (this.waveShaperNode) {
        const curve = new Float32Array(JSON.parse(this.curveEl.value));
        this.waveShaperNode.curve = curve;
      }
    });

    this.oversampleEl.addEventListener('change', () => {
      if (this.waveShaperNode) {
        this.waveShaperNode.oversample = this.oversampleEl.value as 'none' | '2x' | '4x';
      }
    });
  }

  /**
   * Get the input node for the wave shaper effect
   * @returns Input gain node, or null if not initialized
   */
  getInput(): GainNode | null {
    return this.inputGain;
  }

  /**
   * Get the output node for the wave shaper effect
   * @returns Output gain node, or null if not initialized
   */
  getOutput(): GainNode | null {
    return this.outputGain;
  }

  /**
   * Check if the wave shaper has been initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.waveShaperNode !== null;
  }
}