# Tremolo
**Status**: Not implemented  
**Priority**: Low  
**Complexity**: Low

## Description
Amplitude modulation (volume wobble) - classic guitar amp effect.

## Implementation Plan

**1. Create Tremolo Module** (`src/modules/tremolo-module.ts`):

```typescript
export type TremoloConfig = {
  rate: number;   // LFO rate
  depth: number;  // Modulation depth
};

export type TremoloNodes = {
  input: GainNode;
  output: GainNode;
};

export class TremoloModule {
  private readonly rateEl: HTMLInputElement;
  private readonly depthEl: HTMLInputElement;
  
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private ampGain: GainNode | null = null;
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
  
  getConfig(): TremoloConfig {
    return {
      rate: parseFloat(this.rateEl.value),
      depth: parseFloat(this.depthEl.value)
    };
  }
  
  initialize(audioCtx: AudioContext, destination: AudioNode): TremoloNodes {
    const { rate, depth } = this.getConfig();
    
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    this.ampGain = audioCtx.createGain();
    
    // Set base gain to 1.0 - depth/2 to center the modulation
    this.ampGain.gain.value = 1.0 - (depth / 2);
    
    // Create LFO
    this.lfo = audioCtx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = rate;
    
    // LFO gain controls modulation depth
    this.lfoGain = audioCtx.createGain();
    this.lfoGain.gain.value = depth / 2;
    
    // Route: input → ampGain → output
    // LFO modulates ampGain.gain
    this.inputGain.connect(this.ampGain);
    this.ampGain.connect(this.outputGain);
    
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.ampGain.gain);
    
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
      const depth = parseFloat(this.depthEl.value);
      
      if (this.lfoGain) {
        this.lfoGain.gain.value = depth / 2;
      }
      
      if (this.ampGain) {
        this.ampGain.gain.value = 1.0 - (depth / 2);
      }
    });
  }
  
  isInitialized(): boolean {
    return this.lfo !== null;
  }
}
```

**2. UI Component**:

```typescript
export class TremoloEffect extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="tremolo-effect" title="Tremolo">
        <div slot="instructions">
          <instruction-list>
            <instruction-item label="Rate">Speed of volume modulation (0.1-20 Hz)</instruction-item>
            <instruction-item label="Depth">Intensity of volume change (0-100%)</instruction-item>
          </instruction-list>
        </div>
        
        <div slot="content">
          <controls-group>
            <range-control 
              label="Rate" 
              id="tremolo-rate" 
              min="0.1" 
              max="20" 
              step="0.1" 
              value="5"
              formatter="hertz">
            </range-control>
            
            <range-control 
              label="Depth" 
              id="tremolo-depth" 
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
customElements.define('tremolo-effect', TremoloEffect);
```

---
