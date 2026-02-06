export type ReverbConfig = {
  decay: number;
  mix: number;
};

export type ReverbNodes = {
  input: GainNode;
  output: GainNode;
};

/**
 * ReverbModule manages a reverb effect using a ConvolverNode
 * Handles reverb decay time and dry/wet mix
 */
export class ReverbModule {
  private readonly decayEl: HTMLInputElement;
  private readonly mixEl: HTMLInputElement;

  private convolver: ConvolverNode | null = null;
  private wetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;

  constructor(
    decayEl: HTMLInputElement,
    mixEl: HTMLInputElement
  ) {
    this.decayEl = decayEl;
    this.mixEl = mixEl;

    this.setupParameterListeners();
  }

  /**
   * Get the current reverb configuration values
   * @returns Object containing reverb parameters
   */
  getConfig(): ReverbConfig {
    return {
      decay: Number.parseFloat(this.decayEl.value),
      mix: Number.parseFloat(this.mixEl.value)
    };
  }

  /**
   * Initialize the reverb effect and its routing
   * @param audioCtx - The AudioContext to create nodes in
   * @param destination - The destination node (typically delay input or master gain)
   * @returns Object containing input and output gain nodes for the reverb
   */
  initialize(audioCtx: AudioContext, destination: AudioNode): ReverbNodes {
    const { decay, mix } = this.getConfig();

    // Create input and output nodes
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    // Create convolver
    this.convolver = audioCtx.createConvolver();
    this.convolver.buffer = this.generateImpulseResponse(audioCtx, decay);

    // Create dry/wet mix
    this.wetGain = audioCtx.createGain();
    this.wetGain.gain.value = mix;

    this.dryGain = audioCtx.createGain();
    this.dryGain.gain.value = 1 - mix;

    // Wire up reverb effect
    // Input splits to dry and reverb paths
    this.inputGain.connect(this.dryGain);
    this.inputGain.connect(this.convolver);

    // Reverb to wet output
    this.convolver.connect(this.wetGain);

    // Mix dry and wet to output
    this.dryGain.connect(this.outputGain);
    this.wetGain.connect(this.outputGain);

    // Connect to destination
    this.outputGain.connect(destination);

    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }

  /**
   * Generate an impulse response buffer for the convolver
   * @param audioCtx - The AudioContext to create the buffer in
   * @param decay - Decay time in seconds
   * @returns AudioBuffer containing the impulse response
   * @private
   */
  private generateImpulseResponse(audioCtx: AudioContext, decay: number): AudioBuffer {
    const sampleRate = audioCtx.sampleRate;
    const length = sampleRate * decay;
    const impulse = audioCtx.createBuffer(2, length, sampleRate);
    
    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Generate exponentially decaying white noise
        const n = Math.random() * 2 - 1;
        channelData[i] = n * Math.pow(1 - i / length, decay);
      }
    }
    
    return impulse;
  }

  /**
   * Update the reverb decay time by regenerating the impulse response
   * @param audioCtx - The AudioContext to create the new buffer in
   * @private
   */
  private updateDecay(audioCtx: AudioContext): void {
    if (this.convolver) {
      const decay = Number.parseFloat(this.decayEl.value);
      this.convolver.buffer = this.generateImpulseResponse(audioCtx, decay);
    }
  }

  /**
   * Get the input node for the reverb effect
   * @returns Input gain node, or null if not initialized
   */
  getInput(): GainNode | null {
    return this.inputGain;
  }

  /**
   * Get the output node for the reverb effect
   * @returns Output gain node, or null if not initialized
   */
  getOutput(): GainNode | null {
    return this.outputGain;
  }

  /**
   * Check if the reverb has been initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.convolver !== null;
  }

  /**
   * Setup event listeners for real-time parameter changes
   * @private
   */
  private setupParameterListeners(): void {
    this.decayEl.addEventListener('input', () => {
      // Decay changes require regenerating the impulse response
      // We'll need access to audioCtx, so this will be handled when the synth calls updateDecay
      this.decayEl.dispatchEvent(new CustomEvent('decay-changed', { 
        bubbles: true,
        detail: { decay: Number.parseFloat(this.decayEl.value) }
      }));
    });

    this.mixEl.addEventListener('input', () => {
      if (this.wetGain && this.dryGain) {
        const mix = Number.parseFloat(this.mixEl.value);
        this.wetGain.gain.value = mix;
        this.dryGain.gain.value = 1 - mix;
      }
    });
  }

  /**
   * Update the reverb with a new AudioContext reference
   * Used when decay parameter changes
   * @param audioCtx - The AudioContext to use for regenerating impulse response
   */
  updateWithContext(audioCtx: AudioContext): void {
    this.updateDecay(audioCtx);
  }
}