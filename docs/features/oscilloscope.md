# Oscilloscope
**Status**: Not implemented  
**Priority**: Medium  
**Complexity**: Low

## Description
Real-time waveform visualization showing the time-domain shape of the audio signal. Educational tool for understanding how different parameters affect the waveform, and visually engaging addition to the synth interface.

## Implementation Plan

**1. Create Oscilloscope Module** (`src/modules/oscilloscope-module.ts`):

```typescript
export type OscopeConfig = {
  enabled: boolean;
  lineColor: string;
  lineWidth: number;
};

export type OscopeNodes = {
  input: GainNode;
  output: GainNode;
};

export class OscopeModule {
  private readonly canvas: HTMLCanvasElement;
  private readonly enabledEl: HTMLInputElement;
  
  private analyser: AnalyserNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationId: number | null = null;
  private canvasCtx: CanvasRenderingContext2D | null = null;
  
  constructor(
    canvas: HTMLCanvasElement,
    enabledEl: HTMLInputElement
  ) {
    this.canvas = canvas;
    this.enabledEl = enabledEl;
    this.canvasCtx = canvas.getContext('2d');
    this.setupEventListeners();
  }
  
  getConfig(): OscopeConfig {
    return {
      enabled: this.enabledEl.checked,
      lineColor: '#00ffff',
      lineWidth: 2
    };
  }
  
  initialize(audioCtx: AudioContext, destination: AudioNode): OscopeNodes {
    const { enabled } = this.getConfig();
    
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    
    // Create analyser for time domain data
    this.analyser = audioCtx.createAnalyser();
    this.analyser.fftSize = 2048; // Higher for smoother waveform
    this.analyser.smoothingTimeConstant = 0.8;
    
    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength);
    
    // Wire up
    this.inputGain.connect(this.analyser);
    this.analyser.connect(this.outputGain);
    this.outputGain.connect(destination);
    
    if (enabled) {
      this.startVisualization();
    }
    
    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }
  
  private startVisualization(): void {
    if (!this.canvasCtx || !this.analyser || !this.dataArray) return;
    
    const draw = () => {
      this.animationId = requestAnimationFrame(draw);
      
      if (!this.analyser || !this.dataArray || !this.canvasCtx) return;
      
      // Get time domain data
      this.analyser.getByteTimeDomainData(this.dataArray);
      
      const { width, height } = this.canvas;
      const { lineColor, lineWidth } = this.getConfig();
      
      // Clear canvas with dark background
      this.canvasCtx.fillStyle = 'rgba(10, 0, 20, 0.3)';
      this.canvasCtx.fillRect(0, 0, width, height);
      
      // Draw waveform
      this.canvasCtx.lineWidth = lineWidth;
      this.canvasCtx.strokeStyle = lineColor;
      this.canvasCtx.shadowBlur = 10;
      this.canvasCtx.shadowColor = lineColor;
      this.canvasCtx.beginPath();
      
      const sliceWidth = width / this.dataArray.length;
      let x = 0;
      
      for (let i = 0; i < this.dataArray.length; i++) {
        const v = this.dataArray[i] / 128.0; // Normalize to 0-2
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
  
  private stopVisualization(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    
    // Clear canvas
    if (this.canvasCtx) {
      const { width, height } = this.canvas;
      this.canvasCtx.fillStyle = '#0a0014';
      this.canvasCtx.fillRect(0, 0, width, height);
    }
  }
  
  private setupEventListeners(): void {
    this.enabledEl.addEventListener('change', () => {
      if (this.enabledEl.checked) {
        this.startVisualization();
      } else {
        this.stopVisualization();
      }
    });
  }
  
  isInitialized(): boolean {
    return this.analyser !== null;
  }
}