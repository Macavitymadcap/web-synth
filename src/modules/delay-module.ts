export type DelayConfig = {
  time: number;
  feedback: number;
  mix: number;
};

export type DelayNodes = {
  input: GainNode;
  output: GainNode;
};

/**
 * DelayModule manages a delay effect with feedback
 * Handles delay time, feedback amount, and dry/wet mix
 */
export class DelayModule {
  private readonly timeEl: HTMLInputElement;
  private readonly feedbackEl: HTMLInputElement;
  private readonly mixEl: HTMLInputElement;

  private delayNode: DelayNode | null = null;
  private feedbackGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;

  constructor(
    timeEl: HTMLInputElement,
    feedbackEl: HTMLInputElement,
    mixEl: HTMLInputElement
  ) {
    this.timeEl = timeEl;
    this.feedbackEl = feedbackEl;
    this.mixEl = mixEl;

    this.setupParameterListeners();
  }

  /**
   * Get the current delay configuration values
   * @returns Object containing delay parameters
   */
  getConfig(): DelayConfig {
    return {
      time: Number.parseFloat(this.timeEl.value),
      feedback: Number.parseFloat(this.feedbackEl.value),
      mix: Number.parseFloat(this.mixEl.value)
    };
  }

  /**
   * Initialize the delay effect and its routing
   * @param audioCtx - The AudioContext to create nodes in
   * @param destination - The destination node (typically master gain)
   * @returns Object containing input and output gain nodes for the delay
   */
  initialize(audioCtx: AudioContext, destination: AudioNode): DelayNodes {
    const { time, feedback, mix } = this.getConfig();

    // Create input and output nodes
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    // Create delay line
    this.delayNode = audioCtx.createDelay(2); // Max 2 seconds
    this.delayNode.delayTime.value = time;

    // Create feedback path
    this.feedbackGain = audioCtx.createGain();
    this.feedbackGain.gain.value = feedback;

    // Create dry/wet mix
    this.wetGain = audioCtx.createGain();
    this.wetGain.gain.value = mix;

    this.dryGain = audioCtx.createGain();
    this.dryGain.gain.value = 1 - mix;

    // Wire up delay effect
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

    // Connect to destination
    

    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }

  /**
   * Get the input node for the delay effect
   * @returns Input gain node, or null if not initialized
   */
  getInput(): GainNode | null {
    return this.inputGain;
  }

  /**
   * Get the output node for the delay effect
   * @returns Output gain node, or null if not initialized
   */
  getOutput(): GainNode | null {
    return this.outputGain;
  }

  /**
   * Check if the delay has been initialized
   * @returns True if initialized, false otherwise
   */
  isInitialized(): boolean {
    return this.delayNode !== null;
  }

  /**
   * Setup event listeners for real-time parameter changes
   * @private
   */
  private setupParameterListeners(): void {
    this.timeEl.addEventListener('input', () => {
      if (this.delayNode) {
        this.delayNode.delayTime.value = Number.parseFloat(this.timeEl.value);
      }
    });

    this.feedbackEl.addEventListener('input', () => {
      if (this.feedbackGain) {
        this.feedbackGain.gain.value = Number.parseFloat(this.feedbackEl.value);
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