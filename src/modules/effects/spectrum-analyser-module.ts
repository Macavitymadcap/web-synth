import type { BaseEffectModule, EffectNodes } from './base-effect-module';
import { UIConfigService } from '../../services/ui-config-service';

export type SpectrumAnalyserConfig = {
  enabled: boolean; // <-- Add this
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
  private readonly canvas: HTMLCanvasElement | null;

  // UI element IDs (optional controls)
  private readonly elementIds = {
    enabled: 'spectrum-analyser-enabled', // <-- Add this
    fftSize: 'spectrum-fft-size',
    smoothingTimeConstant: 'spectrum-smoothing',
    minFreq: 'spectrum-min-freq',
    maxFreq: 'spectrum-max-freq'
  };

  private config: SpectrumAnalyserConfig = {
    enabled: false, // <-- Add this
    fftSize: 2048,
    smoothingTimeConstant: 0.8,
    minFreq: 20,
    maxFreq: 5000
  };

  constructor(canvas?: HTMLCanvasElement | null) {
    this.canvas = canvas ?? null;
    this.setupParameterListeners();
  }

  getConfig(): SpectrumAnalyserConfig {
    try {
      const enabled = UIConfigService.exists(this.elementIds.enabled)
        ? UIConfigService.getControl(this.elementIds.enabled).checked
        : this.config.enabled;

      const cfg = UIConfigService.getConfig({
        fftSize: {
          id: this.elementIds.fftSize,
          transform: (v) => this.toValidFftSize(Number.parseInt(v, 10))
        },
        smoothingTimeConstant: {
          id: this.elementIds.smoothingTimeConstant,
          transform: (v) => this.clamp(Number.parseFloat(v), 0, 1)
        },
        minFreq: {
          id: this.elementIds.minFreq,
          transform: (v) => Math.max(0, Number.parseInt(v, 10))
        },
        maxFreq: {
          id: this.elementIds.maxFreq,
          transform: (v) => Math.max(0, Number.parseInt(v, 10))
        }
      });

      const next: SpectrumAnalyserConfig = {
        enabled, // <-- Add this
        fftSize: cfg.fftSize,
        smoothingTimeConstant: cfg.smoothingTimeConstant,
        minFreq: cfg.minFreq,
        maxFreq: cfg.maxFreq
      };

      return { ...next };
    } catch {
      return { ...this.config };
    }
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    this.stopVisualization();
    this.disconnectNodes();

    this.config = this.getConfig();

    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    this.analyserNode = audioCtx.createAnalyser();
    this.analyserNode.fftSize = this.config.fftSize;
    this.analyserNode.smoothingTimeConstant = this.config.smoothingTimeConstant;

    this.inputGain.connect(this.analyserNode);
    this.analyserNode.connect(this.outputGain);
    this.outputGain.connect(destination);

    if (this.config.enabled) {
      this.startVisualization();
    }

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

  private setupParameterListeners(): void {
    // Enable toggle
    if (UIConfigService.exists(this.elementIds.enabled)) {
      UIConfigService.onInput(
        this.elementIds.enabled,
        (el) => {
          const enabled = (el).checked;
          this.config.enabled = enabled;
          if (enabled && this.isInitialized()) {
            this.startVisualization();
          } else {
            this.stopVisualization();
            this.clearCanvas();
          }
        },
        'change'
      );
    }

    // Bind optional UI controls if they exist
    if (UIConfigService.exists(this.elementIds.smoothingTimeConstant)) {
      UIConfigService.onInput(this.elementIds.smoothingTimeConstant, (_el, value) => {
        const s = this.clamp(Number.parseFloat(value), 0, 1);
        this.config.smoothingTimeConstant = s;
        if (this.analyserNode) {
          this.analyserNode.smoothingTimeConstant = s;
        }
      });
    }

    if (UIConfigService.exists(this.elementIds.fftSize)) {
      UIConfigService.onInput(this.elementIds.fftSize, (_el, value) => {
        const next = this.toValidFftSize(Number.parseInt(value, 10));
        this.config.fftSize = next;
        if (this.analyserNode) {
          this.analyserNode.fftSize = next;
        }
      });
    }

    if (UIConfigService.exists(this.elementIds.minFreq)) {
      UIConfigService.onInput(this.elementIds.minFreq, (_el, value) => {
        const min = Math.max(0, Number.parseInt(value, 10));
        this.config.minFreq = min;
      });
    }

    if (UIConfigService.exists(this.elementIds.maxFreq)) {
      UIConfigService.onInput(this.elementIds.maxFreq, (_el, value) => {
        const max = Math.max(0, Number.parseInt(value, 10));
        this.config.maxFreq = max;
      });
    }
  }

  private startVisualization() {
    if (!this.analyserNode || !this.canvas || !this.config.enabled) return;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      // Pull latest config values each frame (reflect UI changes)
      const sampleRate = this.analyserNode!.context.sampleRate;
      const nyquist = sampleRate / 2;
      const minBin = Math.floor((this.config.minFreq / nyquist) * bufferLength);
      const maxBin = Math.ceil((this.config.maxFreq / nyquist) * bufferLength);
      const usefulBins = Math.max(1, maxBin - minBin); // avoid divide-by-zero

      this.analyserNode!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

      const width = this.canvas!.width;
      const height = this.canvas!.height;

      const barWidth = width / usefulBins;

      for (let i = 0; i < usefulBins; i++) {
        const binIndex = minBin + i;
        const value = dataArray[Math.min(binIndex, dataArray.length - 1)];
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

  private clamp(n: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, n));
  }

  private toValidFftSize(n: number): number {
    // Force power-of-two in [32, 32768]
    if (!Number.isFinite(n) || n <= 0) return 2048;
    const pow2 = Math.pow(2, Math.round(Math.log2(n)));
    return this.clamp(pow2, 32, 32768);
  }

  private clearCanvas(): void {
    const ctx = this.canvas?.getContext('2d');
    if (!ctx || !this.canvas) return;
    ctx.fillStyle = '#0a0014';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}