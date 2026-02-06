export type WaveShaperConfig = {
  drive: number; // How strong the distortion is
  blend: number; // Wet/dry mix (0-1)
};

export type WaveShaperNodes = {
  input: GainNode;
  output: GainNode;
};

export class WaveShaperModule {
  private readonly driveEl: HTMLInputElement;
  private readonly blendEl: HTMLInputElement;

  private inputNode: GainNode | null = null;
  private outputNode: GainNode | null = null;
  private shaper: WaveShaperNode | null = null;
  private dry: GainNode | null = null;
  private wet: GainNode | null = null;

  constructor(driveEl: HTMLInputElement, blendEl: HTMLInputElement) {
    this.driveEl = driveEl;
    this.blendEl = blendEl;
    this.setupListeners();
  }

  getConfig(): WaveShaperConfig {
    return {
      drive: Number(this.driveEl.value),
      blend: Number(this.blendEl.value)
    };
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): WaveShaperNodes {
    const { drive, blend } = this.getConfig();

    this.inputNode = audioCtx.createGain();
    this.outputNode = audioCtx.createGain();
    this.shaper = audioCtx.createWaveShaper();
    this.dry = audioCtx.createGain();
    this.wet = audioCtx.createGain();

    this.shaper.curve = this.createCurve(drive);
    this.shaper.oversample = "2x";

    this.dry.gain.value = 1 - blend;
    this.wet.gain.value = blend;

    // Routing: input → dry & shaper → wet → output
    this.inputNode.connect(this.dry);
    this.inputNode.connect(this.shaper);
    this.shaper.connect(this.wet);
    this.dry.connect(this.outputNode);
    this.wet.connect(this.outputNode);
    this.outputNode.connect(destination);

    return {
      input: this.inputNode,
      output: this.outputNode
    };
  }

  getInput(): GainNode | null {
    return this.inputNode;
  }

  getOutput(): GainNode | null {
    return this.outputNode;
  }

  isInitialized(): boolean {
    return !!this.shaper;
  }

  private setupListeners() {
    this.driveEl.addEventListener('input', () => {
      if (this.shaper) {
        this.shaper.curve = this.createCurve(Number(this.driveEl.value));
      }
    });
    this.blendEl.addEventListener('input', () => {
      if (this.dry && this.wet) {
        const blend = Number(this.blendEl.value);
        this.dry.gain.value = 1 - blend;
        this.wet.gain.value = blend;
      }
    });
  }

  // Custom soft-clipping curve
  private createCurve(drive: number): Float32Array<ArrayBuffer> {
    const samples = 1024;
    const buffer = new ArrayBuffer(samples * Float32Array.BYTES_PER_ELEMENT);
    const curve = new Float32Array(buffer);
    const amt = Math.max(1, drive * 10);
    for (let i = 0; i < samples; ++i) {
      const x = (i / (samples - 1)) * 2 - 1;
      curve[i] = Math.tanh(amt * x) / Math.tanh(amt);
    }
    return curve;
  }
}