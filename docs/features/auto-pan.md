# Auto-Pan
**Status**: Not implemented  
**Priority**: Low  
**Complexity**: Low

## Description
LFO-controlled stereo movement for swirling effects.

## Implementation Plan

**1. Create Auto-Pan Module** (`src/modules/auto-pan-module.ts`):

```typescript
export type AutoPanConfig = {
  rate: number;   // LFO rate
  depth: number;  // Pan modulation depth
};

export type AutoPanNodes = {
  input: GainNode;
  output: GainNode;
};

export class AutoPanModule {
  private readonly rateEl: HTMLInputElement;
  private readonly depthEl: HTMLInputElement;
  
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private panner: StereoPannerNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  
  constructor(
    rateEl: HTMLInputElement,
    depthEl: HTMLInputElement
  ) {
    this.rateEl = rateEl;
    this.depthEl = depthEl;
    this.setupParameterListeners();
  }
  
  getConfig(): AutoPanConfig {
    return {
      rate: parseFloat(this.rateEl.value),
      depth: parseFloat(this.depthEl.value)
    };
  }
  
  initialize(audioCtx: AudioContext, destination: AudioNode): AutoPanNodes {
    const { rate, depth } = this.getConfig();
    
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    
    // Create stereo panner
    this.panner = audioCtx.createStereoPanner();
    this.panner.pan.value = 0; // Center
    
    // Create LFO for pan modulation
    this.lfo = audioCtx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = rate;
    
    this.lfoGain = audioCtx.createGain();
    this.lfoGain.gain.value = depth; // -1 to +1 range
    
    // Wire up
    this.inputGain.connect(this.panner);
    this.panner.connect(this.outputGain);
    
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.panner.pan);
    
    this.lfo.start();
    
    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }
  
  private setupParameterListeners(): void {
    this.rateEl.addEventListener('input', () => {
      if (this.lfo) {
        this.lfo.frequency.value = parseFloat(this.rateEl.value);
      }
    });
    
    this.depthEl.addEventListener('input', () => {
      if (this.lfoGain) {
        this.lfoGain.gain.value = parseFloat(this.depthEl.value);
      }
    });
  }
  
  isInitialized(): boolean {
    return this.panner !== null;
  }
}
```

**2. UI Component**:

```typescript
export class AutoPanEffect extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="auto-pan-effect" title="Auto-Pan">
        <div slot="instructions">
          <instruction-list>
            <instruction-item label="Rate">Speed of panning movement (0.1-10 Hz)</instruction-item>
            <instruction-item label="Depth">Width of pan sweep (0-100%)</instruction-item>
          </instruction-list>
        </div>
        
        <div slot="content">
          <controls-group>
            <range-control 
              label="Rate" 
              id="autopan-rate" 
              min="0.1" 
              max="10" 
              step="0.1" 
              value="2"
              formatter="hertz">
            </range-control>
            
            <range-control 
              label="Depth" 
              id="autopan-depth" 
              min="0" 
              max="1" 
              step="0.01" 
              value="0.5"
              formatter="percentage">
            </range-control>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('auto-pan-effect', AutoPanEffect);
```

---
