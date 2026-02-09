import type { BaseEffectModule, EffectNodes } from './base-effect-module';

export type SpectrumAnalyserConfig = {
  fftSize: number;
  smoothingTimeConstant: number;
  minFreq: number;
  maxFreq: number;
};

export class SpectrumAnalyserModule implements BaseEffectModule {
  private analyserNode: AnalyserNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private animationFrame: number | null = null;
  private readonly canvas: HTMLCanvasElement;

  private readonly config: SpectrumAnalyserConfig = {
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    minFreq: 20,
    maxFreq: 5000
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
  }

  getConfig(): SpectrumAnalyserConfig {
    return { ...this.config };
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    // Clean up previous nodes if re-initializing
    this.stopVisualization();
    this.disconnectNodes();

    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    this.analyserNode = audioCtx.createAnalyser();
    this.analyserNode.fftSize = this.config.fftSize;
    this.analyserNode.smoothingTimeConstant = this.config.smoothingTimeConstant;

    // Signal flow: input -> analyser -> output -> destination
    this.inputGain.connect(this.analyserNode);
    this.analyserNode.connect(this.outputGain);
    this.outputGain.connect(destination);

    this.startVisualization();

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
    return this.analyserNode !== null && this.inputGain !== null;
  }

  private startVisualization() {
    if (!this.analyserNode || !this.canvas) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const sampleRate = this.analyserNode.context.sampleRate;

    // Calculate bin indices for our frequency range
    const nyquist = sampleRate / 2;
    const minBin = Math.floor((this.config.minFreq / nyquist) * bufferLength);
    const maxBin = Math.ceil((this.config.maxFreq / nyquist) * bufferLength);
    const usefulBins = maxBin - minBin;

    const draw = () => {
      this.analyserNode!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      const width = this.canvas.width;
      const height = this.canvas.height;
      
      // Use only the relevant frequency bins
      const barWidth = width / usefulBins;

      for (let i = 0; i < usefulBins; i++) {
        const binIndex = minBin + i;
        const value = dataArray[binIndex];
        const barHeight = (value / 255) * height;
        
        // Color based on frequency (low=red, mid=yellow/green, high=cyan/blue)
        const hue = (i / usefulBins) * 180 + 180; // 180° (cyan) to 360° (red)
        ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth, barHeight);
      }

      this.animationFrame = requestAnimationFrame(draw);
    };

    draw();
  }

  stopVisualization() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private disconnectNodes(): void {
    if (this.analyserNode) this.analyserNode.disconnect();
    if (this.inputGain) this.inputGain.disconnect();
    if (this.outputGain) this.outputGain.disconnect();
  }
}