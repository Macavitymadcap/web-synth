### Step 1: Create the Wave Shaper Module

1. **Create the Wave Shaper Module File**

Create a new file named `wave-shaper-module.ts` in the `src/modules/` directory.

```typescript
// src/modules/wave-shaper-module.ts
export type WaveShaperConfig = {
  curve: Float32Array;
  oversample: 'none' | '2x' | '4x';
};

export type WaveShaperNodes = {
  input: GainNode;
  output: GainNode;
};

/**
 * WaveShaperModule manages a wave shaping effect
 * Handles the shaping curve and oversampling settings
 */
export class WaveShaperModule {
  private readonly curveEl: HTMLInputElement;
  private readonly oversampleEl: HTMLSelectElement;

  private waveShaperNode: WaveShaperNode | null = null;
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;

  constructor(curveEl: HTMLInputElement, oversampleEl: HTMLSelectElement) {
    this.curveEl = curveEl;
    this.oversampleEl = oversampleEl;

    this.setupParameterListeners();
  }

  /**
   * Get the current wave shaper configuration values
   * @returns Object containing wave shaper parameters
   */
  getConfig(): WaveShaperConfig {
    const curve = new Float32Array(JSON.parse(this.curveEl.value));
    const oversample = this.oversampleEl.value as 'none' | '2x' | '4x';
    return { curve, oversample };
  }

  /**
   * Initialize the wave shaper effect and its routing
   * @param audioCtx - The AudioContext to create nodes in
   * @param destination - The destination node (typically master gain)
   * @returns Object containing input and output gain nodes for the wave shaper
   */
  initialize(audioCtx: AudioContext, destination: AudioNode): WaveShaperNodes {
    const { curve, oversample } = this.getConfig();

    // Create input and output nodes
    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();

    // Create wave shaper node
    this.waveShaperNode = audioCtx.createWaveShaper();
    this.waveShaperNode.curve = curve;
    this.waveShaperNode.oversample = oversample;

    // Wire up wave shaper effect
    this.inputGain.connect(this.waveShaperNode);
    this.waveShaperNode.connect(this.outputGain);
    this.outputGain.connect(destination);

    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }

  /**
   * Setup event listeners for real-time parameter changes
   * @private
   */
  private setupParameterListeners(): void {
    this.curveEl.addEventListener('input', () => {
      if (this.waveShaperNode) {
        this.waveShaperNode.curve = new Float32Array(JSON.parse(this.curveEl.value));
      }
    });

    this.oversampleEl.addEventListener('change', () => {
      if (this.waveShaperNode) {
        this.waveShaperNode.oversample = this.oversampleEl.value as 'none' | '2x' | '4x';
      }
    });
  }
}
```

### Step 2: Update the HTML to Include Wave Shaper Controls

Add the Wave Shaper module section in `index.html`.

```html
<module-section id="wave-shaper-module" title="Wave Shaper">
  <div slot="instructions">
    <p>The wave shaper effect modifies the audio signal by applying a custom shaping curve.</p>
  </div>
  <div slot="content">
    <controls-group>
      <label for="wave-shaper-curve">Curve (JSON Array):</label>
      <input type="text" id="wave-shaper-curve" value="[0, 0.5, 1, 0.5, 0]" />
      
      <label for="wave-shaper-oversample">Oversample:</label>
      <select id="wave-shaper-oversample">
        <option value="none">None</option>
        <option value="2x">2x</option>
        <option value="4x">4x</option>
      </select>
    </controls-group>
  </div>
</module-section>
```

### Step 3: Update the Main Application Logic

Modify `main.ts` to instantiate the Wave Shaper module and connect it in the audio signal chain.

```typescript
// src/main.ts
import { WaveShaperModule } from "./modules/wave-shaper-module"; // Import the new module

// Add references for the new controls
const waveShaperCurve = document.getElementById("wave-shaper-curve") as HTMLInputElement;
const waveShaperOversample = document.getElementById("wave-shaper-oversample") as HTMLSelectElement;

// Initialize the Wave Shaper module
const waveShaperModule = new WaveShaperModule(waveShaperCurve, waveShaperOversample);

// Update the Synth constructor to include the Wave Shaper module
const synth = new Synth(
  lfoModule,
  chorusModule,
  delayModule,
  masterModule,
  reverbModule,
  voiceManager,
  waveShaperModule // Add the new module here
);

// In the Synth class, ensure the Wave Shaper module is initialized in the audio chain
ensureAudio() {
  if (!this.audioCtx) {
    // Existing initialization code...

    // Wave Shaper connects to the previous effect in the chain
    const waveShaperNodes = this.waveShaperModule.initialize(this.audioCtx, this.effectsInput);
    this.effectsInput = waveShaperNodes.input; // Update effects input to the wave shaper input
  }
}
```

### Step 4: Update the Synth Class

Modify the `Synth` class to include the Wave Shaper module.

```typescript
// src/core/synth.ts
import { WaveShaperModule } from "../modules/wave-shaper-module"; // Import the new module

export class Synth {
  // Existing properties...
  private readonly waveShaperModule: WaveShaperModule; // Add the new module

  constructor(
    lfoModule: LFOModule,
    chorusModule: ChorusModule,
    delayModule: DelayModule,
    masterModule: MasterModule,
    reverbModule: ReverbModule,
    voiceManager: VoiceManager,
    waveShaperModule: WaveShaperModule // Add the new module to the constructor
  ) {
    // Existing constructor code...
    this.waveShaperModule = waveShaperModule; // Assign the new module
  }

  // Existing methods...
}
```

### Step 5: Update the Settings Manager (Optional)

If you want to persist the Wave Shaper settings, you can update the `SettingsManager` to include the Wave Shaper configuration.

1. Update the `SynthSettings` interface in `settings-manager.ts` to include Wave Shaper settings.

```typescript
export interface SynthSettings {
  // Existing properties...
  waveShaper: {
    curve: Float32Array;
    oversample: 'none' | '2x' | '4x';
  };
}
```

2. Update the `getCurrentSettings` and `applySettings` methods to handle the Wave Shaper settings.

### Step 6: Test the Implementation

1. Run the application and ensure that the Wave Shaper module appears in the UI.
2. Adjust the curve and oversample settings and verify that the audio output changes accordingly.
3. Test saving and loading settings to ensure the Wave Shaper configuration persists.

### Conclusion

You have successfully created a new Wave Shaper module for the Web Synth project, including all necessary amendments to the existing codebase. This module allows users to modify the audio signal using a custom shaping curve, enhancing the synthesizer's capabilities.