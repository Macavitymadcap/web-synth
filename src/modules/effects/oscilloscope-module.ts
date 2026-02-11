import type { BaseEffectModule, EffectNodes } from './base-effect-module';
import { UIConfigService } from '../../services/ui-config-service';

export type OscilloscopeConfig = {
  enabled: boolean;
  lineColor: string;
  lineWidth: number;
  fftSize: number;
  smoothing: number;
};

export class OscilloscopeModule implements BaseEffectModule {
  private analyserNode: AnalyserNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private animationFrame: number | null = null;
  private readonly canvas: HTMLCanvasElement | null;
  private readonly canvasCtx: CanvasRenderingContext2D | null = null;

  // UI element IDs
  private readonly elementIds = {
    enabled: 'oscilloscope-enabled',
    lineColor: 'oscilloscope-line-color',
    lineWidth: 'oscilloscope-line-width',
    fftSize: 'oscilloscope-fft-size',
    smoothing: 'oscilloscope-smoothing'
  };

  private config: OscilloscopeConfig = {
    enabled: false,
    lineColor: '#00ffff',
    lineWidth: 2,
    fftSize: 2048,
    smoothing: 0.8
  };

  constructor(canvas?: HTMLCanvasElement | null) {
    this.canvas = canvas ?? null;
    this.canvasCtx = this.canvas?.getContext('2d') ?? null;
    this.setupParameterListeners();
  }

  getConfig(): OscilloscopeConfig {
    // Try to read from UI; fall back to current config if controls are absent
    try {
      const enabled = UIConfigService.exists(this.elementIds.enabled)
        ? UIConfigService.getControl(this.elementIds.enabled).checked
        : this.config.enabled;

      const lineColor = UIConfigService.exists(this.elementIds.lineColor)
        ? UIConfigService.getInput(this.elementIds.lineColor).value
        : this.config.lineColor;

      const lineWidth = UIConfigService.exists(this.elementIds.lineWidth)
        ? Number.parseFloat(UIConfigService.getInput(this.elementIds.lineWidth).value)
        : this.config.lineWidth;

      const fftSize = UIConfigService.exists(this.elementIds.fftSize)
        ? this.toValidFftSize(Number.parseInt(UIConfigService.getInput(this.elementIds.fftSize).value, 10))
        : this.config.fftSize;

      const smoothing = UIConfigService.exists(this.elementIds.smoothing)
        ? this.clamp(Number.parseFloat(UIConfigService.getInput(this.elementIds.smoothing).value), 0, 1)
        : this.config.smoothing;

      return {
        enabled,
        lineColor,
        lineWidth,
        fftSize,
        smoothing
      };
    } catch {
      return { ...this.config };
    }
  }

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    // Clean up previous nodes if re-initializing
    this.stopVisualization();
    this.disconnectNodes();

    // Capture config (from UI if present)
    this.config = this.getConfig();

    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    this.analyserNode = audioCtx.createAnalyser();
    this.analyserNode.fftSize = this.config.fftSize;
    this.analyserNode.smoothingTimeConstant = this.config.smoothing;

    // Signal flow: input -> analyser -> output -> destination
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
    // Bind enabled toggle
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

    // Bind line color
    if (UIConfigService.exists(this.elementIds.lineColor)) {
      UIConfigService.onInput(this.elementIds.lineColor, (_el, value) => {
        this.config.lineColor = value;
      });
    }

    // Bind line width
    if (UIConfigService.exists(this.elementIds.lineWidth)) {
      UIConfigService.onInput(this.elementIds.lineWidth, (_el, value) => {
        this.config.lineWidth = Number.parseFloat(value);
      });
    }

    // Bind FFT size
    if (UIConfigService.exists(this.elementIds.fftSize)) {
      UIConfigService.onInput(this.elementIds.fftSize, (_el, value) => {
        const fftSize = this.toValidFftSize(Number.parseInt(value, 10));
        this.config.fftSize = fftSize;
        if (this.analyserNode) {
          this.analyserNode.fftSize = fftSize;
        }
      });
    }

    // Bind smoothing
    if (UIConfigService.exists(this.elementIds.smoothing)) {
      UIConfigService.onInput(this.elementIds.smoothing, (_el, value) => {
        const smoothing = this.clamp(Number.parseFloat(value), 0, 1);
        this.config.smoothing = smoothing;
        if (this.analyserNode) {
          this.analyserNode.smoothingTimeConstant = smoothing;
        }
      });
    }
  }

  private startVisualization(): void {
    if (!this.canvasCtx || !this.analyserNode || !this.canvas) return;

    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!this.config.enabled) {
        this.animationFrame = null;
        return;
      }

      this.animationFrame = requestAnimationFrame(draw);

      if (!this.analyserNode || !this.canvasCtx || !this.canvas) return;

      // Get time domain data
      this.analyserNode.getByteTimeDomainData(dataArray);

      const { width, height } = this.canvas;
      const { lineColor, lineWidth } = this.config;

      // Clear canvas with dark background
      this.canvasCtx.fillStyle = 'rgba(10, 0, 20, 0.3)';
      this.canvasCtx.fillRect(0, 0, width, height);

      // Draw waveform
      this.canvasCtx.lineWidth = lineWidth;
      this.canvasCtx.strokeStyle = lineColor;
      this.canvasCtx.shadowBlur = 10;
      this.canvasCtx.shadowColor = lineColor;
      this.canvasCtx.beginPath();

      const sliceWidth = width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128; // Normalize to 0-2
        const y = (v * height) / 2;

        if (i === 0) {
          this.canvasCtx.moveTo(x, y);
        } else {
          this.canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      this.canvasCtx.lineTo(width, height / 2);
      this.canvasCtx.stroke();

      // Draw center line
      this.canvasCtx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
      this.canvasCtx.lineWidth = 1;
      this.canvasCtx.shadowBlur = 0;
      this.canvasCtx.beginPath();
      this.canvasCtx.moveTo(0, height / 2);
      this.canvasCtx.lineTo(width, height / 2);
      this.canvasCtx.stroke();
    };

    draw();
  }

  stopVisualization(): void {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  private clearCanvas(): void {
    if (!this.canvasCtx || !this.canvas) return;
    
    const { width, height } = this.canvas;
    this.canvasCtx.fillStyle = '#0a0014';
    this.canvasCtx.fillRect(0, 0, width, height);
    
    // Draw center line
    this.canvasCtx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
    this.canvasCtx.lineWidth = 1;
    this.canvasCtx.beginPath();
    this.canvasCtx.moveTo(0, height / 2);
    this.canvasCtx.lineTo(width, height / 2);
    this.canvasCtx.stroke();
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
}