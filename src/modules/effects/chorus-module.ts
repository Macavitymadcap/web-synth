import type { BaseEffectModule, EffectNodes } from './base-effect-module';
import { UIConfigService } from '../../services/ui-config-service';

export type ChorusConfig = {
  rate: number;
  depth: number; // ms
  mix: number;
};

export class ChorusModule implements BaseEffectModule {
  private readonly elementIds = {
    rate: 'chorus-rate',
    depth: 'chorus-depth',
    mix: 'chorus-mix'
  };

  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;

  private delayNodes: DelayNode[] = [];
  private lfoNodes: OscillatorNode[] = [];
  private lfoGainNodes: GainNode[] = [];

  constructor() {
    this.setupParameterListeners();
  }

  getConfig(): ChorusConfig {
    return UIConfigService.getConfig({
      rate: this.elementIds.rate,
      depth: this.elementIds.depth,
      mix: this.elementIds.mix
    });
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    this.disconnect();

    const { rate, depth, mix } = this.getConfig();

    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    this.wetGain = audioCtx.createGain();
    this.wetGain.gain.value = mix;

    this.dryGain = audioCtx.createGain();
    this.dryGain.gain.value = 1 - mix;

    // Dry path
    this.inputGain.connect(this.dryGain);

    // Create 3 modulated delay lines
    const voices = 3;
    for (let i = 0; i < voices; i++) {
      const delay = audioCtx.createDelay(0.05);
      // Optional base delay (gives chorusing even at depth=0)
      delay.delayTime.value = 0.015;

      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = rate * (1 + i * 0.1);

      const lfoGain = audioCtx.createGain();
      // depth is ms; convert to seconds for delayTime modulation
      lfoGain.gain.value = depth * 0.001;

      // Modulation: LFO -> Gain -> DelayTime
      lfo.connect(lfoGain);
      lfoGain.connect(delay.delayTime);
      lfo.start();

      // Signal: input -> delay -> wet
      this.inputGain.connect(delay);
      delay.connect(this.wetGain);

      this.delayNodes.push(delay);
      this.lfoNodes.push(lfo);
      this.lfoGainNodes.push(lfoGain);
    }

    // Mix to output
    this.dryGain.connect(this.outputGain);
    this.wetGain.connect(this.outputGain);

    // Next in chain
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
    return this.inputGain !== null && this.outputGain !== null;
  }

  private setupParameterListeners(): void {
    // Rate: update all LFO frequencies
    UIConfigService.onInput(this.elementIds.rate, (_el, value) => {
      const rate = Number.parseFloat(value);
      this.lfoNodes.forEach((lfo, i) => {
        lfo.frequency.value = rate * (1 + i * 0.1);
      });
    });

    // Depth (ms): update all LFO gain values (seconds)
    UIConfigService.onInput(this.elementIds.depth, (_el, value) => {
      const depthMs = Number.parseFloat(value);
      const gainValue = depthMs * 0.001;
      this.lfoGainNodes.forEach(g => {
        g.gain.value = gainValue;
      });
    });

    // Mix: update wet/dry
    UIConfigService.onInput(this.elementIds.mix, (_el, value) => {
      const mix = Number.parseFloat(value);
      if (this.wetGain && this.dryGain) {
        this.wetGain.gain.value = mix;
        this.dryGain.gain.value = 1 - mix;
      }
    });
  }

  private disconnect(): void {
    // Stop and disconnect LFOs
    this.lfoNodes.forEach(lfo => {
      try { lfo.stop(); } catch {}
      lfo.disconnect();
    });
    this.lfoGainNodes.forEach(g => g.disconnect());
    this.delayNodes.forEach(d => d.disconnect());
    this.lfoNodes = [];
    this.lfoGainNodes = [];
    this.delayNodes = [];

    if (this.inputGain) this.inputGain.disconnect();
    if (this.outputGain) this.outputGain.disconnect();
    if (this.wetGain) this.wetGain.disconnect();
    if (this.dryGain) this.dryGain.disconnect();
    this.inputGain = null;
    this.outputGain = null;
    this.wetGain = null;
    this.dryGain = null;
  }
}