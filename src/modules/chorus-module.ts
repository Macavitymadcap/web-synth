export type ChorusConfig = {
  rate: number;
  depth: number;
  mix: number;
};

export type ChorusNodes = {
  input: GainNode;
  output: GainNode;
};

/**
 * ChorusModule manages a chorus effect using multiple modulated delay lines
 * Handles chorus rate (LFO speed), depth (modulation amount), and dry/wet mix
 */
export class ChorusModule {
  private readonly rateEl: HTMLInputElement;
  private readonly depthEl: HTMLInputElement;
  private readonly mixEl: HTMLInputElement;

  private readonly delayNodes: DelayNode[] = [];
  private readonly lfoNodes: OscillatorNode[] = [];
  private readonly lfoGainNodes: GainNode[] = [];
  
  private wetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private chorusMerger: GainNode | null = null;

  private readonly NUM_VOICES = 3; // Number of chorus voices
  private readonly BASE_DELAY = 0.02; // Base delay time in seconds (20ms)

  constructor(
    rateEl: HTMLInputElement,
    depthEl: HTMLInputElement,
    mixEl: HTMLInputElement
  ) {
    this.rateEl = rateEl;
    this.depthEl = depthEl;
    this.mixEl = mixEl;

    this.setupParameterListeners();
  }

  /**
   * Get the current chorus configuration values
   * @returns Object containing chorus parameters
   */
  getConfig(): ChorusConfig {
    return {
      rate: Number.parseFloat(this.rateEl.value),
      depth: Number.parseFloat(this.depthEl.value),
      mix: Number.parseFloat(this.mixEl.value)
    };
  }

  /**
   * Initialize the chorus effect and its routing
   * @param audioCtx - The AudioContext to create nodes in
   * @param destination - The destination node (typically reverb input or next effect)
   * @returns Object containing input and output gain nodes for the chorus
   */
  initialize(audioCtx: AudioContext, destination: AudioNode): ChorusNodes {
    const { rate, depth, mix } = this.getConfig();

    // Create input and output nodes
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    // Create merger for chorus voices
    this.chorusMerger = audioCtx.createGain();
    this.chorusMerger.gain.value = 1 / this.NUM_VOICES; // Normalize volume

    // Create dry/wet mix
    this.wetGain = audioCtx.createGain();
    this.wetGain.gain.value = mix;

    this.dryGain = audioCtx.createGain();
    this.dryGain.gain.value = 1 - mix;

    // Create multiple chorus voices
    for (let i = 0; i < this.NUM_VOICES; i++) {
      // Create delay line
      const delay = audioCtx.createDelay(0.1); // Max 100ms delay
      delay.delayTime.value = this.BASE_DELAY + (i * 0.005); // Slightly offset each voice

      // Create LFO for this voice
      const lfo = audioCtx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = rate * (1 + i * 0.1); // Slightly different rates for each voice

      // Create LFO gain (controls modulation depth)
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = depth * 0.001; // Convert depth to seconds (ms to s)

      // Connect LFO to delay time
      lfo.connect(lfoGain);
      lfoGain.connect(delay.delayTime);

      // Connect input to delay
      this.inputGain.connect(delay);
      
      // Connect delay to merger
      delay.connect(this.chorusMerger);

      // Start LFO
      lfo.start();

      // Store references
      this.delayNodes.push(delay);
      this.lfoNodes.push(lfo);
      this.lfoGainNodes.push(lfoGain);
    }

    // Wire up chorus effect
    // Input splits to dry and chorus paths
    this.inputGain.connect(this.dryGain);

    // Chorus merger to wet output
    this.chorusMerger.connect(this.wetGain);

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
   * Get the input node for the chorus effect
   * @returns Input gain node, or null if not initialized
   */
  getInput(): GainNode | null {
    return this.inputGain;
  }

  /**
   * Get the output node for the chorus effect
   * @returns Output gain node, or null if not initialized
   */
  getOutput(): GainNode | null {
    return this.outputGain;
  }

  /**
   * Check if the chorus has been initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.inputGain !== null && this.lfoNodes.length > 0;
  }

  /**
   * Setup event listeners for real-time parameter changes
   * @private
   */
  private setupParameterListeners(): void {
    this.rateEl.addEventListener('input', () => {
      if (this.lfoNodes.length > 0) {
        const rate = Number.parseFloat(this.rateEl.value);
        this.lfoNodes.forEach((lfo, i) => {
          lfo.frequency.value = rate * (1 + i * 0.1);
        });
      }
    });

    this.depthEl.addEventListener('input', () => {
      if (this.lfoGainNodes.length > 0) {
        const depth = Number.parseFloat(this.depthEl.value);
        this.lfoGainNodes.forEach((gainNode) => {
          gainNode.gain.value = depth * 0.001; // Convert ms to seconds
        });
      }
    });

    this.mixEl.addEventListener('input', () => {
      if (this.wetGain && this.dryGain) {
        const mix = Number.parseFloat(this.mixEl.value);
        this.wetGain.gain.value = mix;
        this.dryGain.gain.value = 1 - mix;
      }
    });
  }
}