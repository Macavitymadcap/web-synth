# Formant Filter
**Status**: Not implemented  
**Priority**: Medium  
**Complexity**: Medium

## Description
Multiple resonant peaks tuned to simulate vocal tract resonances, creating vowel-like tones. Uses a bank of bandpass filters to create formant regions, enabling vocal synthesis, synth leads with character, and organic bass sounds. Classic technique for adding human-like qualities to synthesized sounds.

## Implementation Plan

**1. Create Formant Filter Module** (`src/modules/formant-filter-module.ts`):

````typescript
export type FormantVowel = 'a' | 'e' | 'i' | 'o' | 'u';

export type FormantPeak = {
  frequency: number;
  gain: number;
  q: number;
};

export type FormantConfig = {
  enabled: boolean;
  vowel: FormantVowel;
  morphAmount: number;  // 0-1, blend between vowels
  intensity: number;    // Overall formant strength
};

export type FormantNodes = {
  input: GainNode;
  output: GainNode;
};

// Formant frequency data for vowels (simplified, based on average adult male)
const FORMANT_DATA: Record<FormantVowel, FormantPeak[]> = {
  'a': [
    { frequency: 730, gain: 0, q: 4 },   // F1
    { frequency: 1090, gain: -6, q: 4 }, // F2
    { frequency: 2440, gain: -12, q: 3 } // F3
  ],
  'e': [
    { frequency: 530, gain: 0, q: 4 },
    { frequency: 1840, gain: -3, q: 4 },
    { frequency: 2480, gain: -12, q: 3 }
  ],
  'i': [
    { frequency: 270, gain: 0, q: 5 },
    { frequency: 2290, gain: -3, q: 4 },
    { frequency: 3010, gain: -12, q: 3 }
  ],
  'o': [
    { frequency: 570, gain: 0, q: 4 },
    { frequency: 840, gain: -9, q: 4 },
    { frequency: 2410, gain: -12, q: 3 }
  ],
  'u': [
    { frequency: 440, gain: 0, q: 4 },
    { frequency: 1020, gain: -12, q: 4 },
    { frequency: 2240, gain: -18, q: 3 }
  ]
};

export class FormantFilterModule {
  private readonly enabledEl: HTMLInputElement;
  private readonly vowelEl: HTMLSelectElement;
  private readonly morphEl: HTMLInputElement;
  private readonly intensityEl: HTMLInputElement;
  
  private filters: BiquadFilterNode[] = [];
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private bypassGain: GainNode | null = null;
  private formantGain: GainNode | null = null;
  
  constructor(
    enabledEl: HTMLInputElement,
    vowelEl: HTMLSelectElement,
    morphEl: HTMLInputElement,
    intensityEl: HTMLInputElement
  ) {
    this.enabledEl = enabledEl;
    this.vowelEl = vowelEl;
    this.morphEl = morphEl;
    this.intensityEl = intensityEl;
    this.setupParameterListeners();
  }
  
  getConfig(): FormantConfig {
    return {
      enabled: this.enabledEl.checked,
      vowel: this.vowelEl.value as FormantVowel,
      morphAmount: parseFloat(this.morphEl.value),
      intensity: parseFloat(this.intensityEl.value)
    };
  }
  
  initialize(audioCtx: AudioContext, destination: AudioNode): FormantNodes {
    const { enabled, vowel, intensity } = this.getConfig();
    
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    this.bypassGain = audioCtx.createGain();
    this.formantGain = audioCtx.createGain();
    
    // Create formant filter bank (3 bandpass filters)
    const formants = FORMANT_DATA[vowel];
    let prevNode: AudioNode = this.inputGain;
    
    for (let i = 0; i < 3; i++) {
      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = formants[i].frequency;
      filter.Q.value = formants[i].q;
      filter.gain.value = formants[i].gain;
      
      prevNode.connect(filter);
      prevNode = filter;
      
      this.filters.push(filter);
    }
    
    // Connect filter chain to formant gain
    prevNode.connect(this.formantGain);
    this.formantGain.gain.value = intensity;
    
    // Setup bypass path
    this.inputGain.connect(this.bypassGain);
    
    if (enabled) {
      // Enabled: mix formant output with reduced bypass
      this.formantGain.connect(this.outputGain);
      this.bypassGain.gain.value = 0.3; // Allow some dry signal through
      this.bypassGain.connect(this.outputGain);
    } else {
      // Disabled: full bypass
      this.bypassGain.gain.value = 1;
      this.bypassGain.connect(this.outputGain);
    }
    
    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }
  
  /**
   * Update formant peaks to match selected vowel
   * @private
   */
  private updateFormants(): void {
    if (this.filters.length === 0) return;
    
    const { vowel } = this.getConfig();
    const formants = FORMANT_DATA[vowel];
    
    for (let i = 0; i < 3; i++) {
      const filter = this.filters[i];
      const formant = formants[i];
      
      // Smooth parameter changes to avoid clicks
      filter.frequency.setTargetAtTime(
        formant.frequency,
        filter.context.currentTime,
        0.05
      );
      filter.Q.value = formant.q;
      filter.gain.value = formant.gain;
    }
  }
  
  /**
   * Morph between current vowel and next vowel
   * @private
   */
  private morphVowels(): void {
    if (this.filters.length === 0) return;
    
    const { vowel, morphAmount } = this.getConfig();
    
    // Get adjacent vowel for morphing
    const vowelOrder: FormantVowel[] = ['a', 'e', 'i', 'o', 'u'];
    const currentIndex = vowelOrder.indexOf(vowel);
    const nextIndex = (currentIndex + 1) % vowelOrder.length;
    const nextVowel = vowelOrder[nextIndex];
    
    const currentFormants = FORMANT_DATA[vowel];
    const nextFormants = FORMANT_DATA[nextVowel];
    
    for (let i = 0; i < 3; i++) {
      const filter = this.filters[i];
      
      // Interpolate between current and next formant
      const currentFreq = currentFormants[i].frequency;
      const nextFreq = nextFormants[i].frequency;
      const morphedFreq = currentFreq + (nextFreq - currentFreq) * morphAmount;
      
      const currentQ = currentFormants[i].q;
      const nextQ = nextFormants[i].q;
      const morphedQ = currentQ + (nextQ - currentQ) * morphAmount;
      
      filter.frequency.setTargetAtTime(
        morphedFreq,
        filter.context.currentTime,
        0.05
      );
      filter.Q.value = morphedQ;
    }
  }
  
  /**
   * Toggle filter enable/disable
   * @private
   */
  private toggleEnabled(): void {
    if (!this.bypassGain || !this.formantGain) return;
    
    const { enabled } = this.getConfig();
    
    if (enabled) {
      this.bypassGain.gain.value = 0.3;
      if (this.formantGain && this.outputGain) {
        this.formantGain.connect(this.outputGain);
      }
    } else {
      this.bypassGain.gain.value = 1;
      if (this.formantGain) {
        this.formantGain.disconnect();
      }
    }
  }
  
  /**
   * Setup event listeners for parameter changes
   * @private
   */
  private setupParameterListeners(): void {
    this.enabledEl.addEventListener('change', () => {
      this.toggleEnabled();
    });
    
    this.vowelEl.addEventListener('change', () => {
      this.updateFormants();
    });
    
    this.morphEl.addEventListener('input', () => {
      this.morphVowels();
    });
    
    this.intensityEl.addEventListener('input', () => {
      if (this.formantGain) {
        this.formantGain.gain.value = parseFloat(this.intensityEl.value);
      }
    });
  }
  
  isInitialized(): boolean {
    return this.filters.length > 0;
  }
}