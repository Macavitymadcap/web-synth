### Noise Gate
**Status**: Not implemented  
**Priority**: Low  
**Complexity**: Medium

## Description
Cuts signal below threshold to clean up noisy sounds.

## Implementation Plan

**1. Create Gate Module** (`src/modules/gate-module.ts`):

```typescript
export type GateConfig = {
  threshold: number;  // dB threshold
  attack: number;     // Gate open time
  release: number;    // Gate close time
  ratio: number;      // Reduction ratio
};

export type GateNodes = {
  input: GainNode;
  output: GainNode;
};

export class GateModule {
  private readonly thresholdEl: HTMLInputElement;
  private readonly attackEl: HTMLInputElement;
  private readonly releaseEl: HTMLInputElement;
  private readonly ratioEl: HTMLInputElement;
  
  // Use DynamicsCompressorNode with inverted settings for gating
  private compressor: DynamicsCompressorNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  
  constructor(
    thresholdEl: HTMLInputElement,
    attackEl: HTMLInputElement,
    releaseEl: HTMLInputElement,
    ratioEl: HTMLInputElement
  ) {
    this.thresholdEl = thresholdEl;
    this.attackEl = attackEl;
    this.releaseEl = releaseEl;
    this.ratioEl = ratioEl;
    this.setupParameterListeners();
  }
  
  getConfig(): GateConfig {
    return {
      threshold: parseFloat(this.thresholdEl.value),
      attack: parseFloat(this.attackEl.value),
      release: parseFloat(this.releaseEl.value),
      ratio: parseFloat(this.ratioEl.value)
    };
  }
  
  initialize(audioCtx: AudioContext, destination: AudioNode): GateNodes {
    const { threshold, attack, release, ratio } = this.getConfig();
    
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    
    // Note: Web Audio API doesn't have a native gate
    // We can approximate with DynamicsCompressor or implement custom processing
    // For simplicity, using compressor with expansion-like settings
    this.compressor = audioCtx.createDynamicsCompressor();
    
    // Configure for gate-like behavior
    // When signal is below threshold, reduce it dramatically
    this.compressor.threshold.value = threshold;
    this.compressor.knee.value = 0; // Hard knee
    this.compressor.ratio.value = ratio; // High ratio for gating
    this.compressor.attack.value = attack;
    this.compressor.release.value = release;
    
    this.inputGain.connect(this.compressor);
    this.compressor.connect(this.outputGain);
    
    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }
  
  private setupParameterListeners(): void {
    this.thresholdEl.addEventListener('input', () => {
      if (this.compressor) {
        this.compressor.threshold.value = parseFloat(this.thresholdEl.value);
      }
    });
    
    this.attackEl.addEventListener('input', () => {
      if (this.compressor) {
        this.compressor.attack.value = parseFloat(this.attackEl.value);
      }
    });
    
    this.releaseEl.addEventListener('input', () => {
      if (this.compressor) {
        this.compressor.release.value = parseFloat(this.releaseEl.value);
      }
    });
    
    this.ratioEl.addEventListener('input', () => {
      if (this.compressor) {
        this.compressor.ratio.value = parseFloat(this.ratioEl.value);
      }
    });
  }
  
  isInitialized(): boolean {
    return this.compressor !== null;
  }
}
```

**Note**: For true gating behavior, consider implementing with `AudioWorkletProcessor` for sample-accurate gate control.

---
