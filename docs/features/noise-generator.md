# Noise Generator

**Status**: Not implemented  
**Priority**: Medium  
**Complexity**: Low

## Description
Add white, pink, and brown noise sources for percussion, wind sounds, and sound design effects.

## Implementation Plan

**1. Create Noise Module** (`src/modules/noise-module.ts`):

```typescript
export type NoiseType = 'white' | 'pink' | 'brown';

export type NoiseConfig = {
  type: NoiseType;
  level: number;
};

export class NoiseModule {
  private readonly typeEl: HTMLSelectElement;
  private readonly levelEl: HTMLInputElement;
  
  private noiseBuffer: AudioBuffer | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  
  constructor(
    typeEl: HTMLSelectElement,
    levelEl: HTMLInputElement
  ) {
    this.typeEl = typeEl;
    this.levelEl = levelEl;
    this.setupParameterListeners();
  }
  
  getConfig(): NoiseConfig {
    return {
      type: this.typeEl.value as NoiseType,
      level: parseFloat(this.levelEl.value)
    };
  }
  
  createNoiseSource(audioCtx: AudioContext): AudioBufferSourceNode {
    const { type, level } = this.getConfig();
    
    // Generate noise buffer if needed
    if (!this.noiseBuffer || this.needsNewBuffer(type)) {
      this.noiseBuffer = this.generateNoiseBuffer(audioCtx, type);
    }
    
    const source = audioCtx.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;
    
    this.noiseGain = audioCtx.createGain();
    this.noiseGain.gain.value = level;
    
    source.connect(this.noiseGain);
    
    return source;
  }
  
  private generateNoiseBuffer(
    audioCtx: AudioContext, 
    type: NoiseType
  ): AudioBuffer {
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    switch (type) {
      case 'white':
        this.generateWhiteNoise(data);
        break;
      case 'pink':
        this.generatePinkNoise(data);
        break;
      case 'brown':
        this.generateBrownNoise(data);
        break;
    }
    
    return buffer;
  }
  
  private generateWhiteNoise(data: Float32Array): void {
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  
  private generatePinkNoise(data: Float32Array): void {
    // Paul Kellet's refined pink noise algorithm
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
  }
  
  private generateBrownNoise(data: Float32Array): void {
    let lastOut = 0;
    
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5; // Compensate for gain reduction
    }
  }
  
  private needsNewBuffer(type: NoiseType): boolean {
    // Check if type changed
    return true; // Simplified - could track previous type
  }
  
  private setupParameterListeners(): void {
    this.typeEl.addEventListener('change', () => {
      // Type change requires buffer regeneration on next voice
    });
    
    this.levelEl.addEventListener('input', () => {
      if (this.noiseGain) {
        this.noiseGain.gain.value = parseFloat(this.levelEl.value);
      }
    });
  }
}
```

**2. Integration with Voice Manager**:

Modify `voice-manager.ts` to optionally include noise:

```typescript
// In VoiceManager.createVoice():
const noiseSource = this.noiseModule?.createNoiseSource(audioCtx);
if (noiseSource && noiseEnabled) {
  noiseSource.connect(filterInstance.filter);
  noiseSource.start();
  
  // Store in voice for cleanup
  voice.noiseSource = noiseSource;
}
```

**3. UI Component** (`src/components/organisms/noise-generator.ts`):

```typescript
export class NoiseGenerator extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="noise-generator" title="Noise Generator">
        <div slot="instructions">
          <instruction-list>
            <instruction-item label="Type">White (full spectrum), Pink (natural), Brown (bass-heavy)</instruction-item>
            <instruction-item label="Level">Mix amount of noise with oscillators (0-100%)</instruction-item>
            <instruction-item label="Enable">Toggle noise generator on/off</instruction-item>
          </instruction-list>
        </div>
        
        <div slot="content">
          <controls-group>
            <label>
              Noise Type
              <select id="noise-type">
                <option value="white">White</option>
                <option value="pink">Pink</option>
                <option value="brown">Brown</option>
              </select>
            </label>
            
            <range-control 
              label="Level" 
              id="noise-level" 
              min="0" 
              max="1" 
              step="0.01" 
              value="0.3"
              formatter="percentage">
            </range-control>
            
            <toggle-switch 
              id="noise-enabled" 
              label="Noise Generator">
            </toggle-switch>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('noise-generator', NoiseGenerator);
```

**4. Add to Settings Model**:

```typescript
// In src/core/settings.model.ts
export type NoiseSettings = {
  type: NoiseType;
  level: number;
  enabled: boolean;
};

// Add to SynthSettings interface
export interface SynthSettings {
  // ... existing settings
  noise: NoiseSettings;
}
```

**Use Cases**:
- Snare/hi-hat synthesis
- Wind/breath sounds
- Ambient textures
- Adding "air" to synth sounds

---
