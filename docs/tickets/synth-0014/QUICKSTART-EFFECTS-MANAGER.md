# EffectsManager Quick Start Checklist

## Prerequisites
- [ ] Read `docs/effects-manager-summary.md` (5 min overview)
- [ ] Review `docs/examples/effects-manager-integration.ts` (5 min example)

## Step 1: Add Imports to main.ts (2 minutes)

Add these imports at the top of `src/main.ts`:

```typescript
import { EffectsManager } from "./core/effects-manager";
import { createStandardEffectAdapter } from "./core/effect-module-adapter";
```

## Step 2: Create and Register Effects (10 minutes)

Add this code AFTER you create your module instances, but BEFORE creating the Synth:

```typescript
// Create effects manager
const effectsManager = new EffectsManager();

// Wrap existing modules
const chorusAdapter = createStandardEffectAdapter(chorusModule);
const phaserAdapter = createStandardEffectAdapter(phaserModule);
const delayAdapter = createStandardEffectAdapter(delayModule);
const waveShaperAdapter = createStandardEffectAdapter(waveShaperModule);
const compressorAdapter = createStandardEffectAdapter(compressorModule);
const reverbAdapter = createStandardEffectAdapter(reverbModule);
const spectrumAnalyserAdapter = createStandardEffectAdapter(spectrumAnalyserModule);

// Register effects (order: higher = earlier in signal chain)
effectsManager.register(chorusAdapter, {
  id: 'chorus',
  name: 'Chorus',
  order: 100,
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
  name: 'Wave Shaper',
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
  order: 50,
  category: 'time-based'
});

effectsManager.register(spectrumAnalyserAdapter, {
  id: 'analyser',
  name: 'Spectrum Analyser',
  order: 40,
  category: 'utility'
});

// Optional: Print chain for debugging
effectsManager.printChain();
```

## Step 3: Update Synth Constructor Call (2 minutes)

Replace this:
```typescript
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
```

With this:
```typescript
const synth = new Synth(
  effectsManager,
  lfoModule,
  masterModule,
  voiceManager
);
```

## Step 4: Update Synth Class (15 minutes)

In `src/core/synth.ts`:

### 4a. Update imports:
```typescript
import type { EffectsManager } from "./effects-manager";
```

### 4b. Update constructor:

Replace:
```typescript
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
  this.lfoModule = lfoModule;
  this.chorusModule = chorusModule;
  this.phaserModule = phaserModule;
  this.delayModule = delayModule;
  this.masterModule = masterModule;
  this.reverbModule = reverbModule;
  this.voiceManager = voiceManager;
  this.waveShaperModule = waveShaperModule;
  this.compressorModule = compressorModule;
  this.spectrumAnalyserModule = spectrumAnalyserModule;
}
```

With:
```typescript
constructor(
  private effectsManager: EffectsManager,
  private lfoModule: LFOModule,
  private masterModule: MasterModule,
  private voiceManager: VoiceManager
) {}
```

### 4c. Update ensureAudio method:

Replace the entire effects chain initialization (the ~50 lines starting with "const spectrumNodes = ...") with:

```typescript
ensureAudio() {
  if (!this.audioCtx) {
    // Initialize master module
    this.audioCtx = this.masterModule.initialize();
    this.masterGain = this.masterModule.getMasterGain()!;

    // Initialize LFO
    this.lfoModule.initialize(this.audioCtx);

    // Initialize entire effects chain with one call
    this.effectsInput = this.effectsManager.initialize(
      this.audioCtx,
      this.masterGain
    );
  }
}
```

### 4d. Remove old private fields:

Delete these fields from the Synth class:
```typescript
private readonly chorusModule: ChorusModule;
private readonly phaserModule: PhaserModule;
private readonly delayModule: DelayModule;
private readonly reverbModule: ReverbModule;
private readonly waveShaperModule: WaveShaperModule;
private readonly compressorModule: CompressorModule;
private readonly spectrumAnalyserModule: SpectrumAnalyserModule;
```

## Step 5: Test Everything (10 minutes)

- [ ] Run `bun run dev`
- [ ] Open browser console and check for the effects chain printout
- [ ] Play some notes - verify sound works
- [ ] Test each effect control - verify they respond
- [ ] Test presets - verify they load correctly
- [ ] Test recording - verify it captures audio

## Step 6: Verify Benefits

After successful integration:

- [ ] Count Synth constructor parameters: Should be 4 (down from 10)
- [ ] Check `synth.ts` ensureAudio: Should be ~10 lines (down from ~60)
- [ ] Try adding a new effect: Should take ~5 minutes (down from ~30)

## Troubleshooting

### "Cannot find module 'effects-manager'"
Make sure the new files are in the correct locations:
- `src/core/effects-manager.ts`
- `src/core/effect-module-adapter.ts`
- `src/modules/base-effect-module.ts`

### "Effect failed to initialize properly"
One of your effect modules doesn't return valid `EffectNodes`. Check that each module's `initialize()` returns `{ input: GainNode, output: GainNode }`.

### Effects not sounding right
Check the `order` values - they determine signal chain order. Higher number = earlier in chain.

### TypeScript errors
Your existing modules might not have all the methods the adapter expects. Use the custom `createEffectAdapter()` instead of `createStandardEffectAdapter()`.

## Next Steps After Integration

Once everything works:

1. **Add a new effect** (Tremolo or Noise Generator) to validate the workflow
2. **Write tests** for the new effect using the patterns in `tests/effects-manager.test.ts`
3. **Update documentation** with any lessons learned
4. **Consider future enhancements** like dynamic bypass or effect presets

## Time Estimate

- **Minimum time:** 30 minutes (if everything goes smoothly)
- **Expected time:** 1-2 hours (with testing and troubleshooting)
- **Maximum time:** 3 hours (if you need to debug issues)

## Success Criteria

✅ Code compiles without errors  
✅ Synth plays sound correctly  
✅ All effects respond to controls  
✅ Presets load and save  
✅ Recording works  
✅ Console shows effects chain printout  
✅ Synth constructor has 4 parameters (not 10)  

## Getting Help

If you get stuck:
1. Review `docs/effects-manager-migration.md` for detailed guidance
2. Check `docs/examples/effects-manager-integration.ts` for complete example
3. Look at error messages carefully - they're descriptive
4. Compare your code to the example integration file

## You're Done! 🎉

Once the checklist is complete:
- Your codebase is 60% less complex
- Adding new effects is now trivial
- Testing is much easier
- You're ready for Phase 2 of the roadmap

Time to add some new effects!
