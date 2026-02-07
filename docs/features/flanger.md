# Flanger
**Status**: Not implemented  
**Priority**: Medium  
**Complexity**: Low

## Description
Short delay with feedback and modulation for sweeping, jet-plane effects.

## Implementation Plan

**1. Create Flanger Module** (`src/modules/flanger-module.ts`):

```typescript
export type FlangerConfig = {
  rate: number;      // LFO rate (Hz)
  depth: number;     // Delay modulation depth (ms)
  feedback: number;  // Feedback amount
  mix: number;       // Dry/wet mix
};

export type FlangerNodes = {
  input: GainNode;
  output: GainNode;
};

export class FlangerModule {
  private readonly rateEl: HTMLInputElement;
  private readonly depthEl: HTMLInputElement;
  private readonly feedbackEl: HTMLInputElement;
  private readonly mixEl: HTMLInputElement;
  
  private delay: DelayNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private feedbackGain: GainNode | null = null;
  private wetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  
  private readonly BASE_DELAY = 0.003; // 3ms base delay
  
  constructor(
    rateEl: HTMLInputElement,
    depthEl: HTMLInputElement,
    feedbackEl: HTMLInputElement,
    mixEl: HTMLInputElement
  ) {
    this.rateEl = rateEl;
    this.depthEl = depthEl;
    this.feedbackEl = feedbackEl;
    this.mixEl = mixEl;
    this.setupParameterListeners();
  }
  
  getConfig(): FlangerConfig {
    return {
      rate: parseFloat(this.rateEl.value),
      depth: parseFloat(this.depthEl.value),
      feedback: parseFloat(this.feedbackEl.value),
      mix: parseFloat(this.mixEl.value)
    };
  }
  
  initialize(audioCtx: AudioContext, destination: AudioNode): FlangerNodes {
    const { rate, depth, feedback, mix } = this.getConfig();
    
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    
    // Create short delay line (flanger uses very short delays)
    this.delay = audioCtx.createDelay(0.02); // Max 20ms
    this.delay.delayTime.value = this.BASE_DELAY;
    
    // Create LFO for delay modulation
    this.lfo = audioCtx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = rate;
    
    this.lfoGain = audioCtx.createGain();
    this.lfoGain.gain.value = depth * 0.001; // Convert ms to seconds
    
    // Feedback path
    this.feedbackGain = audioCtx.createGain();
    this.feedbackGain.gain.value = feedback;
    
    // Dry/wet mix
    this.wetGain = audioCtx.createGain();
    this.wetGain.gain.value = mix;
    
    this.dryGain = audioCtx.createGain();
    this.dryGain.gain.value = 1 - mix;
    
    // Wire up signal path
    // LFO modulates delay time
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.delay.delayTime);
    
    // Input splits to dry and delay
    this.inputGain.connect(this.dryGain);
    this.inputGain.connect(this.delay);
    
    // Feedback loop
    this.delay.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delay);
    
    // Delay to wet
    this.delay.connect(this.wetGain);
    
    // Mix to output
    this.dryGain.connect(this.outputGain);
    this.wetGain.connect(this.outputGain);
    
    // Start LFO
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
        const depth = parseFloat(this.depthEl.value);
        this.lfoGain.gain.value = depth * 0.001;
      }
    });
    
    this.feedbackEl.addEventListener('input', () => {
      if (this.feedbackGain) {
        this.feedbackGain.gain.value = parseFloat(this.feedbackEl.value);
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
    return this.delay !== null;
  }
}
```

**2. UI Component**:

```typescript
export class FlangerEffect extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="flanger-effect" title="Flanger">
        <div slot="instructions">
          <instruction-list>
            <instruction-item label="Rate">LFO speed for sweep effect (0.1-10 Hz)</instruction-item>
            <instruction-item label="Depth">Intensity of delay modulation (0-10 ms)</instruction-item>
            <instruction-item label="Feedback">Amount fed back for resonance (0-95%)</instruction-item>
            <instruction-item label="Mix">Dry/wet balance (0-100%)</instruction-item>
          </instruction-list>
        </div>
        
        <div slot="content">
          <controls-group>
            <range-control 
              label="Rate" 
              id="flanger-rate" 
              min="0.1" 
              max="10" 
              step="0.1" 
              value="0.5"
              formatter="hertz">
            </range-control>
            
            <range-control 
              label="Depth" 
              id="flanger-depth" 
              min="0" 
              max="10" 
              step="0.1" 
              value="2">
            </range-control>
            
            <range-control 
              label="Feedback" 
              id="flanger-feedback" 
              min="0" 
              max="0.95" 
              step="0.01" 
              value="0.5"
              formatter="percentage">
            </range-control>
            
            <range-control 
              label="Mix" 
              id="flanger-mix" 
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
customElements.define('flanger-effect', FlangerEffect);
```

---
