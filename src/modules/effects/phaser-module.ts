import type { BaseEffectModule, EffectNodes } from './base-effect-module';
import { UIConfigService } from '../../services/ui-config-service';

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
  // ...existing code...
  private readonly elementIds = {
    rate: 'phaser-rate',
    depth: 'phaser-depth',
    stages: 'phaser-stages',
    feedback: 'phaser-feedback',
    mix: 'phaser-mix'
  };

  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private allpassFilters: BiquadFilterNode[] = [];
  private feedbackGain: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  // Keep last context/destination to allow re-init on stages change
  private lastAudioCtx: AudioContext | null = null;
  private lastDestination: AudioNode | null = null;

  constructor() {
    this.setupParameterListeners();
  }

  getConfig(): PhaserConfig {
    return UIConfigService.getConfig({
      rate: this.elementIds.rate,
      depth: this.elementIds.depth,
      stages: {
        id: this.elementIds.stages,
        transform: (v) => {
          const n = Math.round(Number.parseFloat(v) || 4);
          return Math.max(2, Math.min(8, n));
        }
      },
      feedback: this.elementIds.feedback,
      mix: this.elementIds.mix
    }) as PhaserConfig;
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    const { rate, depth, stages, feedback, mix } = this.getConfig();

    // Track for re-initialization
    this.lastAudioCtx = audioCtx;
    this.lastDestination = destination;

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
      this.lfoGain.connect(ap.frequency as any);
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
    // Bind simple AudioParams
    UIConfigService.bindAudioParams([
      { elementId: this.elementIds.rate, audioParam: () => this.lfo?.frequency },
      { elementId: this.elementIds.depth, audioParam: () => this.lfoGain?.gain }
    ]);

    // Stages change requires re-init
    UIConfigService.onInput(this.elementIds.stages, () => {
      if (this.lastAudioCtx && this.lastDestination) {
        this.initialize(this.lastAudioCtx, this.lastDestination);
      }
    });

    // Feedback gain
    UIConfigService.bindAudioParam({
      elementId: this.elementIds.feedback,
      audioParam: () => this.feedbackGain?.gain
    });

    // Mix affects wet/dry gains
    UIConfigService.onInput(this.elementIds.mix, (_el, value) => {
      if (this.dryGain && this.wetGain) {
        const mix = Number.parseFloat(value);
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