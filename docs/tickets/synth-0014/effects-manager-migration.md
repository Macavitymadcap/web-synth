# EffectsManager Migration Guide

## Overview

The EffectsManager provides a centralized way to manage all audio effects in the synthesizer. This guide shows how to migrate from the current architecture to using the EffectsManager.

## Benefits

✅ **Reduced complexity**: Synth constructor goes from 10+ dependencies to 2-3  
✅ **Easy to add effects**: Register new effects with 3 lines of code  
✅ **Consistent API**: All effects follow the same pattern  
✅ **Dynamic reordering**: Change effect order without code changes  
✅ **Better testability**: Effects are decoupled from the synth  

## Migration Strategy

You can migrate **gradually** - old and new code can coexist during the transition.

### Step 1: Use the Adapter (No Code Changes Required)

The adapter allows you to use existing modules immediately without modification:

```typescript
// In main.ts
import { EffectsManager } from './core/effects-manager';
import { createStandardEffectAdapter } from './core/effect-module-adapter';

// Create effects manager
const effectsManager = new EffectsManager();

// Wrap existing modules with adapter
const chorusAdapter = createStandardEffectAdapter(chorusModule);
const delayAdapter = createStandardEffectAdapter(delayModule);
const reverbAdapter = createStandardEffectAdapter(reverbModule);
// ... etc

// Register effects (order determines signal flow)
effectsManager.register(chorusAdapter, {
  id: 'chorus',
  name: 'Chorus',
  order: 100, // First in chain
  category: 'modulation'
});

effectsManager.register(phaserAdapter, {
  id: 'phaser',
  name: 'Phaser',
  order: 90,
  category: 'modulation'
});

effectsManager.register(delayAdapter, {
  id: 'delay',
  name: 'Delay',
  order: 80,
  category: 'time-based'
});

effectsManager.register(waveShaperAdapter, {
  id: 'waveshaper',
  name: 'Distortion',
  order: 70,
  category: 'distortion'
});

effectsManager.register(compressorAdapter, {
  id: 'compressor',
  name: 'Compressor',
  order: 60,
  category: 'dynamics'
});

effectsManager.register(reverbAdapter, {
  id: 'reverb',
  name: 'Reverb',
  order: 50, // Last effect before analyser
  category: 'time-based'
});

effectsManager.register(spectrumAnalyserAdapter, {
  id: 'analyser',
  name: 'Spectrum Analyser',
  order: 40,
  category: 'utility'
});
```

### Step 2: Update Synth Class

Replace the manual chain building with EffectsManager:

```typescript
// Old synth.ts constructor (BEFORE)
export class Synth {
  constructor(
    lfoModule: LFOModule,
    chorusModule: ChorusModule,
    phaserModule: PhaserModule,
    delayModule: DelayModule,
    masterModule: MasterModule,
    reverbModule: ReverbModule,
    voiceManager: VoiceManager,
    waveShaperModule: WaveShaperModule,
    compressorModule: CompressorModule,
    spectrumAnalyserModule: SpectrumAnalyserModule
  ) {
    // Store 10+ dependencies...
  }
}

// New synth.ts constructor (AFTER)
export class Synth {
  constructor(
    private effectsManager: EffectsManager,
    private lfoModule: LFOModule,
    private masterModule: MasterModule,
    private voiceManager: VoiceManager
  ) {
    // Just 4 dependencies!
  }
  
  ensureAudio() {
    if (!this.audioCtx) {
      this.audioCtx = this.masterModule.initialize();
      this.masterGain = this.masterModule.getMasterGain()!;
      
      // Initialize LFO
      this.lfoModule.initialize(this.audioCtx);
      
      // Initialize entire effects chain with one call
      this.effectsInput = this.effectsManager.initialize(
        this.audioCtx,
        this.masterGain
      );
      
      // That's it! No more manual wiring of 7+ effects
    }
  }
}
```

### Step 3: Update main.ts

Your main.ts setup becomes much simpler:

```typescript
// main.ts - Old approach (BEFORE)
const synth = new Synth(
  lfoModule,
  chorusModule,
  phaserModule,
  delayModule,
  masterModule,
  reverbModule,
  voiceManager,
  waveShaperModule,
  compressorModule,
  spectrumAnalyserModule
);

// main.ts - New approach (AFTER)
const effectsManager = new EffectsManager();

// Register all effects (see Step 1 for full example)
effectsManager.register(/* ... */);

const synth = new Synth(
  effectsManager,
  lfoModule,
  masterModule,
  voiceManager
);
```

## Effect Order Reference

Lower order = earlier in signal chain. Recommended order:

```
100 - Chorus (modulation)
 90 - Phaser (modulation)
 80 - Delay (time-based)
 70 - WaveShaper (distortion)
 60 - Compressor (dynamics)
 50 - Reverb (time-based, usually last effect)
 40 - Spectrum Analyser (utility, monitoring only)
 30 - (Reserved for future effects)
```

## Adding New Effects

With EffectsManager, adding a new effect is trivial:

```typescript
// 1. Create your module as usual
const tremoloModule = new TremoloModule(rateEl, depthEl);

// 2. Wrap it
const tremoloAdapter = createStandardEffectAdapter(tremoloModule);

// 3. Register it
effectsManager.register(tremoloAdapter, {
  id: 'tremolo',
  name: 'Tremolo',
  order: 85, // Between phaser and delay
  category: 'modulation'
});

// Done! It's automatically wired into the chain
```

## Accessing Effects After Registration

You can still access individual effects when needed:

```typescript
// Get a specific effect
const reverb = effectsManager.getEffect('reverb');

// Get all effects
const allEffects = effectsManager.getAllEffects();

// Get effects by category
const modulationFX = effectsManager.getEffectsByCategory('modulation');

// Debug: print the chain
effectsManager.printChain();
// Output:
// === Effects Chain ===
// 100. Chorus (modulation) →
// 90. Phaser (modulation) →
// 80. Delay (time-based) →
// ...
```

## Step 4: Gradually Migrate Individual Modules (Optional)

Once you're comfortable with the adapter approach, you can optionally migrate individual modules to implement `BaseEffectModule` directly:

```typescript
// Old module
export class ChorusModule {
  // ...existing code
}

// New module
import type { BaseEffectModule, EffectNodes } from './base-effect-module';

export class ChorusModule implements BaseEffectModule {
  // ...same code, but now explicitly implements interface
}
```

This step is **optional** - the adapter works perfectly fine long-term.

## Testing

EffectsManager makes testing much easier:

```typescript
describe('EffectsManager', () => {
  it('should initialize effects in correct order', () => {
    const manager = new EffectsManager();
    
    manager.register(mockChorus, { id: 'chorus', order: 100, ... });
    manager.register(mockDelay, { id: 'delay', order: 80, ... });
    
    const input = manager.initialize(audioCtx, destination);
    
    expect(manager.getEffectCount()).toBe(2);
    expect(input).toBeTruthy();
  });
});
```

## Troubleshooting

### "Cannot register effects after initialization"
You tried to register an effect after calling `initialize()`. Register all effects before initialization.

### Effect not in chain
Check the `order` value - effects are initialized in reverse order (highest to lowest).

### "Effect failed to initialize properly"
The effect's `initialize()` method didn't return valid `EffectNodes` with both `input` and `output`.

## Complete Example

See `examples/effects-manager-integration.ts` for a complete working example.

## Next Steps

1. ✅ Use adapter for existing effects (today)
2. ✅ Update Synth class (today)
3. ✅ Test thoroughly (today)
4. ⏭️ Migrate individual modules to BaseEffectModule (optional, gradual)
5. ⏭️ Add new effects (easy now!)

## Questions?

Check the architecture documentation or review the EffectsManager source code for implementation details.
