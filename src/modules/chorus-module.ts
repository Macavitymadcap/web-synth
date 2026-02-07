import type { BaseEffectModule, EffectNodes } from './base-effect-module';

export type ChorusConfig = {
  rate: number;
  depth: number;
  mix: number;
};

export class ChorusModule implements BaseEffectModule {
  private readonly rateEl: HTMLInputElement;
  private readonly depthEl: HTMLInputElement;
  private readonly mixEl: HTMLInputElement;

  private delayNodes: DelayNode[] = [];
  private lfoNodes: OscillatorNode[] = [];
  private lfoGainNodes: GainNode[] = [];
  
  private wetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private chorusMerger: GainNode | null = null;

  private readonly NUM_VOICES = 3;
  private readonly BASE_DELAY = 0.02;

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

  getConfig(): ChorusConfig {
    return {
      rate: Number.parseFloat(this.rateEl.value),
      depth: Number.parseFloat(this.depthEl.value),
      mix: Number.parseFloat(this.mixEl.value)
    };
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    // Clean up previous nodes if re-initializing
    this.disconnectNodes();

    const { rate, depth, mix } = this.getConfig();

    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    this.chorusMerger = audioCtx.createGain();
    this.chorusMerger.gain.value = 1 / this.NUM_VOICES;

    this.wetGain = audioCtx.createGain();
    this.wetGain.gain.value = mix;

    this.dryGain = audioCtx.createGain();
    this.dryGain.gain.value = 1 - mix;

    this.delayNodes = [];
    this.lfoNodes = [];
    this.lfoGainNodes = [];

    for (let i = 0; i < this.NUM_VOICES; i++) {
      const delay = audioCtx.createDelay(0.1);
      delay.delayTime.value = this.BASE_DELAY + (i * 0.005);

      const lfo = audioCtx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = rate * (1 + i * 0.1);

      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = depth * 0.001;

      lfo.connect(lfoGain);
      lfoGain.connect(delay.delayTime);

      this.inputGain.connect(delay);
      delay.connect(this.chorusMerger);

      lfo.start();

      this.delayNodes.push(delay);
      this.lfoNodes.push(lfo);
      this.lfoGainNodes.push(lfoGain);
    }

    // Dry path
    this.inputGain.connect(this.dryGain);

    // Wet path
    this.chorusMerger.connect(this.wetGain);

    // Mix to output
    this.dryGain.connect(this.outputGain);
    this.wetGain.connect(this.outputGain);

    // Output to next effect
    this.outputGain.connect(destination);

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
    return this.inputGain !== null && this.lfoNodes.length > 0;
  }

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
          gainNode.gain.value = depth * 0.001;
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

  private disconnectNodes(): void {
    // Disconnect and stop previous nodes if re-initializing
    this.lfoNodes.forEach(lfo => {
      try { lfo.stop(); } catch {}
      lfo.disconnect();
    });
    this.lfoGainNodes.forEach(g => g.disconnect());
    this.delayNodes.forEach(d => d.disconnect());
    if (this.chorusMerger) this.chorusMerger.disconnect();
    if (this.wetGain) this.wetGain.disconnect();
    if (this.dryGain) this.dryGain.disconnect();
    if (this.inputGain) this.inputGain.disconnect();
    if (this.outputGain) this.outputGain.disconnect();
  }
}