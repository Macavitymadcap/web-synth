import type { BaseEffectModule, EffectNodes } from './base-effect-module';
import { UIConfigService } from '../../services/ui-config-service';

export type CompressorConfig = {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  knee: number;
};

/**
 * CompressorModule using UIConfigService with helper methods
 * This version demonstrates the cleaner API with bindAudioParams()
 */
export class CompressorModule implements BaseEffectModule {
  private readonly elementIds = {
    threshold: 'compressor-threshold',
    ratio: 'compressor-ratio',
    attack: 'compressor-attack',
    release: 'compressor-release',
    knee: 'compressor-knee'
  };

  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  constructor() {
    this.setupParameterListeners();
  }

  getConfig(): CompressorConfig {
    return UIConfigService.getConfig({
      threshold: this.elementIds.threshold,
      ratio: this.elementIds.ratio,
      attack: this.elementIds.attack,
      release: this.elementIds.release,
      knee: this.elementIds.knee
    });
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

  /**
   * Setup parameter listeners using helper methods
   * Much cleaner than manual addEventListener calls
   */
  private setupParameterListeners(): void {
    UIConfigService.bindAudioParams([
      {
        elementId: this.elementIds.threshold,
        audioParam: () => this.compressor?.threshold
      },
      {
        elementId: this.elementIds.ratio,
        audioParam: () => this.compressor?.ratio
      },
      {
        elementId: this.elementIds.attack,
        audioParam: () => this.compressor?.attack
      },
      {
        elementId: this.elementIds.release,
        audioParam: () => this.compressor?.release
      },
      {
        elementId: this.elementIds.knee,
        audioParam: () => this.compressor?.knee
      }
    ]);
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