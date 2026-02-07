# Ring Modulator
**Status**: Not implemented  
**Priority**: Low  
**Complexity**: Medium

## Description
Multiply two signals for metallic, bell-like, and inharmonic tones.

## Implementation Plan

**1. Create Ring Mod Module** (`src/modules/ring-mod-module.ts`):

```typescript
export type RingModConfig = {
  frequency: number;  // Modulator frequency
  mix: number;        // Dry/wet mix
};

export type RingModNodes = {
  input: GainNode;
  output: GainNode;
};

export class RingModModule {
  private readonly frequencyEl: HTMLInputElement;
  private readonly mixEl: HTMLInputElement;
  
  private modulator: OscillatorNode | null = null;
  private modulatorGain: GainNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  
  constructor(
    frequencyEl: HTMLInputElement,
    mixEl: HTMLInputElement
  ) {
    this.frequencyEl = frequencyEl;
    this.mixEl = mixEl;
    this.setupParameterListeners();
  }
  
  getConfig(): RingModConfig {
    return {
      frequency: parseFloat(this.frequencyEl.value),
      mix: parseFloat(this.mixEl.value)
    };
  }
  
  initialize(audioCtx: AudioContext, destination: AudioNode): RingModNodes {
    const { frequency, mix } = this.getConfig();
    
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    
    // Create modulator oscillator
    this.modulator = audioCtx.createOscillator();
    this.modulator.frequency.value = frequency;
    this.modulator.type = 'sine';
    
    // GainNode for ring modulation (acts as multiplier)
    this.modulatorGain = audioCtx.createGain();
    this.modulatorGain.gain.value = 1;
    
    // Dry/wet mix
    this.wetGain = audioCtx.createGain();
    this.wetGain.gain.value = mix;
    
    this.dryGain = audioCtx.createGain();
    this.dryGain.gain.value = 1 - mix;
    
    // Ring modulation: modulator controls the gain of the input signal
    this.modulator.connect(this.modulatorGain.gain);
    this.inputGain.connect(this.modulatorGain);
    
    // Routing
    this.inputGain.connect(this.dryGain);
    this.modulatorGain.connect(this.wetGain);
    
    this.dryGain.connect(this.outputGain);
    this.wetGain.connect(this.outputGain);
    
    this.modulator.start();
    
    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }
  
  private setupParameterListeners(): void {
    this.frequencyEl.addEventListener('input', () => {
      if (this.modulator) {
        this.modulator.frequency.value = parseFloat(this.frequencyEl.value);
      }
    });
    
    this.mixEl.addEventListener('input', () => {
      if (this.wetGain && this.dryGain) {
        const mix = parseFloat(this.mixEl.value);
        this.wetGain.gain.value = mix;
        this.dryGain.gain.value = 1 - mix;
      }
    });
  }
  
  isInitialized(): boolean {
    return this.modulator !== null;
  }
}
```

**2. UI Component**:

```typescript
export class RingModEffect extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="ring-mod-effect" title="Ring Modulator">
        <div slot="instructions">
          <instruction-list>
            <instruction-item label="Frequency">Modulator frequency for metallic tones (20Hz-5kHz)</instruction-item>
            <instruction-item label="Mix">Dry/wet balance (0-100%)</instruction-item>
          </instruction-list>
        </div>
        
        <div slot="content">
          <controls-group>
            <range-control 
              label="Frequency" 
              id="ringmod-frequency" 
              min="20" 
              max="5000" 
              step="1" 
              value="440"
              formatter="hertz">
            </range-control>
            
            <range-control 
              label="Mix" 
              id="ringmod-mix" 
              min="0" 
              max="1" 
              step="0.01" 
              value="0"
              formatter="percentage">
            </range-control>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('ring-mod-effect', RingModEffect);
```

---
