import type { BaseEffectModule, EffectNodes } from './effects/base-effect-module';

export type PhaserConfig = {
  rate: number;      // LFO rate (Hz)
  depth: number;     // LFO depth (Hz)
  stages: number;    // Number of allpass stages (2-8 typical)
  feedback: number;  // Feedback amount (0-0.9)
  mix: number;       // Dry/wet mix (0-1)
};

/**
 * PhaserModule: Classic multi-stage phaser effect with LFO modulation
 */
export class PhaserModule implements BaseEffectModule {
  private readonly rateEl: HTMLInputElement;
  private readonly depthEl: HTMLInputElement;
  private readonly stagesEl: HTMLInputElement;
  private readonly feedbackEl: HTMLInputElement;
  private readonly mixEl: HTMLInputElement;

  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private allpassFilters: BiquadFilterNode[] = [];
  private feedbackGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  constructor(
    rateEl: HTMLInputElement,
    depthEl: HTMLInputElement,
    stagesEl: HTMLInputElement,
    feedbackEl: HTMLInputElement,
    mixEl: HTMLInputElement
  ) {
    this.rateEl = rateEl;
    this.depthEl = depthEl;
    this.stagesEl = stagesEl;
    this.feedbackEl = feedbackEl;
    this.mixEl = mixEl;
    this.setupParameterListeners();
  }

  getConfig(): PhaserConfig {
    return {
      rate: Number.parseFloat(this.rateEl.value),
      depth: Number.parseFloat(this.depthEl.value),
      stages: Math.max(2, Math.min(8, Math.round(Number.parseFloat(this.stagesEl.value) || 4))),
      feedback: Number.parseFloat(this.feedbackEl.value),
      mix: Number.parseFloat(this.mixEl.value)
    };
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    const { rate, depth, stages, feedback, mix } = this.getConfig();

    // Clean up previous nodes if re-initializing
    this.disconnect();

    // Routing nodes
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    this.dryGain = audioCtx.createGain();
    this.wetGain = audioCtx.createGain();

    // Allpass filter chain
    this.allpassFilters = [];
    let prevNode: AudioNode = this.inputGain;
    for (let i = 0; i < stages; i++) {
      const ap = audioCtx.createBiquadFilter();
      ap.type = "allpass";
      ap.frequency.value = 1000 + i * 200; // Initial value, will be modulated
      prevNode.connect(ap);
      prevNode = ap;
      this.allpassFilters.push(ap);
    }

    // Feedback loop
    this.feedbackGain = audioCtx.createGain();
    this.feedbackGain.gain.value = feedback;
    prevNode.connect(this.feedbackGain);
    this.feedbackGain.connect(this.allpassFilters[0]);

    // Wet/dry mix
    prevNode.connect(this.wetGain);
    this.inputGain.connect(this.dryGain);

    this.dryGain.gain.value = 1 - mix;
    this.wetGain.gain.value = mix;

    this.dryGain.connect(this.outputGain);
    this.wetGain.connect(this.outputGain);

    // Output to next effect
    this.outputGain.connect(destination);

    // LFO for modulation
    this.lfo = audioCtx.createOscillator();
    this.lfo.type = "sine";
    this.lfo.frequency.value = rate;

    this.lfoGain = audioCtx.createGain();
    this.lfoGain.gain.value = depth;

    this.lfo.connect(this.lfoGain);

    // Modulate allpass filter frequencies
    for (const ap of this.allpassFilters) {
      this.lfoGain.connect(ap.frequency);
    }

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
    return this.inputGain !== null;
  }

  private setupParameterListeners(): void {
    this.rateEl.addEventListener('input', () => {
      if (this.lfo) {
        this.lfo.frequency.value = Number.parseFloat(this.rateEl.value);
      }
    });
    this.depthEl.addEventListener('input', () => {
      if (this.lfoGain) {
        this.lfoGain.gain.value = Number.parseFloat(this.depthEl.value);
      }
    });
    this.stagesEl.addEventListener('input', () => {
      // Re-initialize to update stage count
      if (this.inputGain && this.outputGain) {
        const ctx = this.inputGain.context as AudioContext;
        const dest = this.outputGain;
        this.initialize(ctx, dest);
      }
    });
    this.feedbackEl.addEventListener('input', () => {
      if (this.feedbackGain) {
        this.feedbackGain.gain.value = Number.parseFloat(this.feedbackEl.value);
      }
    });
    this.mixEl.addEventListener('input', () => {
      if (this.dryGain && this.wetGain) {
        const mix = Number.parseFloat(this.mixEl.value);
        this.dryGain.gain.value = 1 - mix;
        this.wetGain.gain.value = mix;
      }
    });
  }

  private disconnect() {
    if (this.lfo) {
      this.lfo.disconnect();
      try { this.lfo.stop(); } catch {}
      this.lfo = null;
    }
    if (this.lfoGain) {
      this.lfoGain.disconnect();
      this.lfoGain = null;
    }
    if (this.inputGain) this.inputGain.disconnect();
    if (this.outputGain) this.outputGain.disconnect();
    if (this.dryGain) this.dryGain.disconnect();
    if (this.wetGain) this.wetGain.disconnect();
    if (this.feedbackGain) this.feedbackGain.disconnect();
    for (const ap of this.allpassFilters) ap.disconnect();
    this.inputGain = null;
    this.outputGain = null;
    this.dryGain = null;
    this.wetGain = null;
    this.feedbackGain = null;
    this.allpassFilters = [];
  }
}