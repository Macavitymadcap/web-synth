# Parametric EQ
**Status**: Not implemented  
**Priority**: Medium  
**Complexity**: Medium

## Description
Multiple frequency bands with adjustable Q for precise tone shaping.

## Implementation Plan

**1. Create EQ Module** (`src/modules/eq-module.ts`):

```typescript
export type EQBand = {
  frequency: number;
  gain: number;
  q: number;
  type: 'lowshelf' | 'peaking' | 'highshelf';
};

export type EQConfig = {
  bands: EQBand[];
  enabled: boolean;
};

export type EQNodes = {
  input: GainNode;
  output: GainNode;
};

export class EQModule {
  private readonly band1FreqEl: HTMLInputElement;
  private readonly band1GainEl: HTMLInputElement;
  private readonly band1QEl: HTMLInputElement;
  
  private readonly band2FreqEl: HTMLInputElement;
  private readonly band2GainEl: HTMLInputElement;
  private readonly band2QEl: HTMLInputElement;
  
  private readonly band3FreqEl: HTMLInputElement;
  private readonly band3GainEl: HTMLInputElement;
  private readonly band3QEl: HTMLInputElement;
  
  private readonly enabledEl: HTMLInputElement;
  
  private filters: BiquadFilterNode[] = [];
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private bypassGain: GainNode | null = null;
  
  constructor(
    band1FreqEl: HTMLInputElement,
    band1GainEl: HTMLInputElement,
    band1QEl: HTMLInputElement,
    band2FreqEl: HTMLInputElement,
    band2GainEl: HTMLInputElement,
    band2QEl: HTMLInputElement,
    band3FreqEl: HTMLInputElement,
    band3GainEl: HTMLInputElement,
    band3QEl: HTMLInputElement,
    enabledEl: HTMLInputElement
  ) {
    this.band1FreqEl = band1FreqEl;
    this.band1GainEl = band1GainEl;
    this.band1QEl = band1QEl;
    this.band2FreqEl = band2FreqEl;
    this.band2GainEl = band2GainEl;
    this.band2QEl = band2QEl;
    this.band3FreqEl = band3FreqEl;
    this.band3GainEl = band3GainEl;
    this.band3QEl = band3QEl;
    this.enabledEl = enabledEl;
    
    this.setupParameterListeners();
  }
  
  getConfig(): EQConfig {
    return {
      bands: [
        {
          frequency: parseFloat(this.band1FreqEl.value),
          gain: parseFloat(this.band1GainEl.value),
          q: parseFloat(this.band1QEl.value),
          type: 'lowshelf'
        },
        {
          frequency: parseFloat(this.band2FreqEl.value),
          gain: parseFloat(this.band2GainEl.value),
          q: parseFloat(this.band2QEl.value),
          type: 'peaking'
        },
        {
          frequency: parseFloat(this.band3FreqEl.value),
          gain: parseFloat(this.band3GainEl.value),
          q: parseFloat(this.band3QEl.value),
          type: 'highshelf'
        }
      ],
      enabled: this.enabledEl.checked
    };
  }
  
  initialize(audioCtx: AudioContext, destination: AudioNode): EQNodes {
    const { bands, enabled } = this.getConfig();
    
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    this.bypassGain = audioCtx.createGain();
    
    // Create filter chain
    let prevNode: AudioNode = this.inputGain;
    
    for (const band of bands) {
      const filter = audioCtx.createBiquadFilter();
      filter.type = band.type;
      filter.frequency.value = band.frequency;
      filter.gain.value = band.gain;
      filter.Q.value = band.q;
      
      prevNode.connect(filter);
      prevNode = filter;
      
      this.filters.push(filter);
    }
    
    // Wire up bypass
    this.inputGain.connect(this.bypassGain);
    
    if (enabled) {
      prevNode.connect(this.outputGain);
      this.bypassGain.gain.value = 0;
    } else {
      this.bypassGain.connect(this.outputGain);
      // Disconnect filter chain from output
    }
    
    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }
  
  private setupParameterListeners(): void {
    // Band 1 (Low Shelf)
    this.band1FreqEl.addEventListener('input', () => {
      if (this.filters[0]) {
        this.filters[0].frequency.value = parseFloat(this.band1FreqEl.value);
      }
    });
    
    this.band1GainEl.addEventListener('input', () => {
      if (this.filters[0]) {
        this.filters[0].gain.value = parseFloat(this.band1GainEl.value);
      }
    });
    
    this.band1QEl.addEventListener('input', () => {
      if (this.filters[0]) {
        this.filters[0].Q.value = parseFloat(this.band1QEl.value);
      }
    });
    
    // Band 2 (Peaking)
    this.band2FreqEl.addEventListener('input', () => {
      if (this.filters[1]) {
        this.filters[1].frequency.value = parseFloat(this.band2FreqEl.value);
      }
    });
    
    this.band2GainEl.addEventListener('input', () => {
      if (this.filters[1]) {
        this.filters[1].gain.value = parseFloat(this.band2GainEl.value);
      }
    });
    
    this.band2QEl.addEventListener('input', () => {
      if (this.filters[1]) {
        this.filters[1].Q.value = parseFloat(this.band2QEl.value);
      }
    });
    
    // Band 3 (High Shelf)
    this.band3FreqEl.addEventListener('input', () => {
      if (this.filters[2]) {
        this.filters[2].frequency.value = parseFloat(this.band3FreqEl.value);
      }
    });
    
    this.band3GainEl.addEventListener('input', () => {
      if (this.filters[2]) {
        this.filters[2].gain.value = parseFloat(this.band3GainEl.value);
      }
    });
    
    this.band3QEl.addEventListener('input', () => {
      if (this.filters[2]) {
        this.filters[2].Q.value = parseFloat(this.band3QEl.value);
      }
    });
    
    // Enable/disable
    this.enabledEl.addEventListener('change', () => {
      // Would need to rewire - consider implementing in synth
    });
  }
  
  isInitialized(): boolean {
    return this.filters.length > 0;
  }
}
```

**2. UI Component** - 3-band EQ:

```typescript
export class ParametricEQ extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="parametric-eq" title="Parametric EQ">
        <div slot="instructions">
          <instruction-list>
            <instruction-item label="Low Band">Low shelf filter for bass control</instruction-item>
            <instruction-item label="Mid Band">Peaking filter for midrange shaping</instruction-item>
            <instruction-item label="High Band">High shelf filter for treble control</instruction-item>
            <instruction-item label="Frequency">Center/corner frequency for each band</instruction-item>
            <instruction-item label="Gain">Boost or cut in dB (-12 to +12)</instruction-item>
            <instruction-item label="Q">Bandwidth/slope of the filter</instruction-item>
          </instruction-list>
        </div>
        
        <div slot="content">
          <subsection-header text="Low Band (Shelf)"></subsection-header>
          <controls-group>
            <range-control label="Frequency" id="eq-band1-freq" 
              min="20" max="500" step="1" value="100" formatter="hertz">
            </range-control>
            <range-control label="Gain" id="eq-band1-gain" 
              min="-12" max="12" step="0.5" value="0" formatter="dB">
            </range-control>
            <range-control label="Q" id="eq-band1-q" 
              min="0.1" max="10" step="0.1" value="0.7">
            </range-control>
          </controls-group>
          
          <subsection-header text="Mid Band (Peak)"></subsection-header>
          <controls-group>
            <range-control label="Frequency" id="eq-band2-freq" 
              min="200" max="5000" step="10" value="1000" formatter="hertz">
            </range-control>
            <range-control label="Gain" id="eq-band2-gain" 
              min="-12" max="12" step="0.5" value="0" formatter="dB">
            </range-control>
            <range-control label="Q" id="eq-band2-q" 
              min="0.1" max="10" step="0.1" value="1.4">
            </range-control>
          </controls-group>
          
          <subsection-header text="High Band (Shelf)"></subsection-header>
          <controls-group>
            <range-control label="Frequency" id="eq-band3-freq" 
              min="2000" max="20000" step="100" value="8000" formatter="hertz">
            </range-control>
            <range-control label="Gain" id="eq-band3-gain" 
              min="-12" max="12" step="0.5" value="0" formatter="dB">
            </range-control>
            <range-control label="Q" id="eq-band3-q" 
              min="0.1" max="10" step="0.1" value="0.7">
            </range-control>
          </controls-group>
          
          <controls-group>
            <toggle-switch id="eq-enabled" label="EQ" checked></toggle-switch>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('parametric-eq', ParametricEQ);
```

---
