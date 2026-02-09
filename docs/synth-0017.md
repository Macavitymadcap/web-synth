# UIConfigService Integration Guide

## Overview

The `UIConfigService` provides a centralized, testable way for modules to access UI elements and bind them to audio parameters. This eliminates constructor dependency injection and reduces boilerplate code significantly.

**Key Benefits:**
- ✅ **Zero constructor parameters** - No more passing 5+ HTMLInputElement params
- ✅ **90% less boilerplate** - Helper methods handle common patterns
- ✅ **Better testability** - Mock `document.getElementById` instead of creating fixtures
- ✅ **Type-safe** - Full TypeScript support with proper error handling
- ✅ **Flexible** - Use helpers for simple cases, manual setup for complex ones

---

## Quick Start: CompressorModule Example

### Before (Old Pattern)
```typescript
// 5 constructor parameters!
constructor(
  private thresholdEl: HTMLInputElement,
  private ratioEl: HTMLInputElement,
  private attackEl: HTMLInputElement,
  private releaseEl: HTMLInputElement,
  private kneeEl: HTMLInputElement
) {
  this.setupParameterListeners();
}

// 25 lines of repetitive code
private setupParameterListeners(): void {
  this.thresholdEl.addEventListener('input', () => {
    if (this.compressor) {
      this.compressor.threshold.value = parseFloat(this.thresholdEl.value);
    }
  });
  this.ratioEl.addEventListener('input', () => {
    if (this.compressor) {
      this.compressor.ratio.value = parseFloat(this.ratioEl.value);
    }
  });
  // ... 15 more lines
}
```

### After (UIConfigService)
```typescript
// Zero constructor parameters!
constructor() {
  this.setupParameterListeners();
}

private readonly elementIds = {
  threshold: 'compressor-threshold',
  ratio: 'compressor-ratio',
  attack: 'compressor-attack',
  release: 'compressor-release',
  knee: 'compressor-knee'
};

// 14 lines - declarative and clear
private setupParameterListeners(): void {
  UIConfigService.bindAudioParams([
    { elementId: this.elementIds.threshold, audioParam: () => this.compressor?.threshold },
    { elementId: this.elementIds.ratio, audioParam: () => this.compressor?.ratio },
    { elementId: this.elementIds.attack, audioParam: () => this.compressor?.attack },
    { elementId: this.elementIds.release, audioParam: () => this.compressor?.release },
    { elementId: this.elementIds.knee, audioParam: () => this.compressor?.knee }
  ]);
}

getConfig(): CompressorConfig {
  return UIConfigService.getConfig({
    threshold: this.elementIds.threshold,
    ratio: this.elementIds.ratio,
    attack: this.elementIds.attack,
    release: this.elementIds.release,
    knee: this.elementIds.knee
  });
}
```

---

## Core API Methods

### 1. Element Access

```typescript
// Get single input (unwraps RangeControl automatically)
const input = UIConfigService.getInput('my-param');

// Get select element
const select = UIConfigService.getSelect('filter-type');

// Get any control element
const control = UIConfigService.getControl('my-control');

// Safe access (returns null instead of throwing)
const input = UIConfigService.tryGetInput('optional-param');
if (input) {
  // Element exists
}

// Check existence
if (UIConfigService.exists('my-param')) {
  // Element exists
}
```

### 2. Batch Configuration Parsing

```typescript
// Simple IDs (auto-parsed as numbers)
const config = UIConfigService.getConfig({
  threshold: 'compressor-threshold',
  ratio: 'compressor-ratio'
});
// Returns: { threshold: -18, ratio: 4 }

// With transform functions
const config = UIConfigService.getConfig({
  stages: {
    id: 'phaser-stages',
    transform: (v) => Math.round(parseFloat(v))
  },
  filterType: {
    id: 'filter-type',
    select: true, // Use getSelect instead of getInput
    transform: (v) => v.toLowerCase()
  }
});
```

### 3. Helper Methods (Recommended)

#### Bind Single AudioParam
```typescript
UIConfigService.bindAudioParam({
  elementId: 'compressor-threshold',
  audioParam: () => this.compressor?.threshold
});

// With transform
UIConfigService.bindAudioParam({
  elementId: 'lfo-depth',
  audioParam: () => this.lfoGain?.gain,
  transform: (v) => parseFloat(v) * 0.001
});

// Custom event
UIConfigService.bindAudioParam({
  elementId: 'my-param',
  audioParam: () => this.node?.param,
  event: 'change' // Default is 'input'
});
```

#### Bind Multiple AudioParams (Most Common)
```typescript
UIConfigService.bindAudioParams([
  { elementId: this.elementIds.threshold, audioParam: () => this.compressor?.threshold },
  { elementId: this.elementIds.ratio, audioParam: () => this.compressor?.ratio },
  { elementId: this.elementIds.attack, audioParam: () => this.compressor?.attack }
]);
```

#### Bind GainNode (Special Helper)
```typescript
// Common pattern - element controls a gain node
UIConfigService.bindGainParam({
  elementId: 'master-volume',
  gainNode: () => this.masterGain
});
```

#### Custom Event Handlers
```typescript
// Single handler
UIConfigService.onInput('chorus-mix', (element, value) => {
  const mix = parseFloat(value);
  if (this.wetGain && this.dryGain) {
    this.wetGain.gain.value = mix;
    this.dryGain.gain.value = 1 - mix;
  }
});

// Multiple handlers
UIConfigService.onInputs({
  'param1': (el, val) => this.handleParam1(val),
  'param2': (el, val) => this.handleParam2(val)
});

// Select handler
UIConfigService.onSelect('filter-type', (element, value) => {
  if (this.filter) {
    this.filter.type = value as BiquadFilterType;
  }
});
```

---

## Step-by-Step Migration

### Step 1: Remove Constructor Parameters

**Before:**
```typescript
constructor(
  private thresholdEl: HTMLInputElement,
  private ratioEl: HTMLInputElement
) {
  this.setupParameterListeners();
}
```

**After:**
```typescript
constructor() {
  this.setupParameterListeners();
}
```

### Step 2: Add Element IDs

```typescript
private readonly elementIds = {
  threshold: 'compressor-threshold',
  ratio: 'compressor-ratio',
  attack: 'compressor-attack',
  release: 'compressor-release',
  knee: 'compressor-knee'
};
```

### Step 3: Update getConfig()

**Before:**
```typescript
getConfig(): CompressorConfig {
  return {
    threshold: parseFloat(this.thresholdEl.value),
    ratio: parseFloat(this.ratioEl.value),
    attack: parseFloat(this.attackEl.value),
    release: parseFloat(this.releaseEl.value),
    knee: parseFloat(this.kneeEl.value)
  };
}
```

**After:**
```typescript
getConfig(): CompressorConfig {
  return UIConfigService.getConfig({
    threshold: this.elementIds.threshold,
    ratio: this.elementIds.ratio,
    attack: this.elementIds.attack,
    release: this.elementIds.release,
    knee: this.elementIds.knee
  });
}
```

### Step 4: Replace Event Listeners with Helper Methods

**Before:**
```typescript
private setupParameterListeners(): void {
  this.thresholdEl.addEventListener('input', () => {
    if (this.compressor) {
      this.compressor.threshold.value = parseFloat(this.thresholdEl.value);
    }
  });
  this.ratioEl.addEventListener('input', () => {
    if (this.compressor) {
      this.compressor.ratio.value = parseFloat(this.ratioEl.value);
    }
  });
  // ... repeat for each parameter
}
```

**After:**
```typescript
private setupParameterListeners(): void {
  UIConfigService.bindAudioParams([
    { elementId: this.elementIds.threshold, audioParam: () => this.compressor?.threshold },
    { elementId: this.elementIds.ratio, audioParam: () => this.compressor?.ratio },
    { elementId: this.elementIds.attack, audioParam: () => this.compressor?.attack },
    { elementId: this.elementIds.release, audioParam: () => this.compressor?.release },
    { elementId: this.elementIds.knee, audioParam: () => this.compressor?.knee }
  ]);
}
```

### Step 5: Update main.ts

**Before:**
```typescript
const thresholdEl = getInput('compressor-threshold');
const ratioEl = getInput('compressor-ratio');
const attackEl = getInput('compressor-attack');
const releaseEl = getInput('compressor-release');
const kneeEl = getInput('compressor-knee');

const compressorModule = new CompressorModule(
  thresholdEl,
  ratioEl,
  attackEl,
  releaseEl,
  kneeEl
);
```

**After:**
```typescript
const compressorModule = new CompressorModule();
```

---

## When to Use What Pattern

### Use Helper Methods (`bindAudioParams`) When:
- ✅ Single element → single AudioParam
- ✅ Simple transform (multiply, clamp, round)
- ✅ No side effects needed
- ✅ Standard pattern (element value → param.value)

**Example:**
```typescript
UIConfigService.bindAudioParam({
  elementId: 'delay-time',
  audioParam: () => this.delay?.delayTime
});
```

### Use Custom Handlers (`onInput`) When:
- ✅ One element affects multiple nodes
- ✅ Complex validation or orchestration
- ✅ Need to update UI in response
- ✅ Conditional behavior

**Example:**
```typescript
UIConfigService.onInput('chorus-mix', (el, value) => {
  const mix = parseFloat(value);
  if (this.wetGain && this.dryGain) {
    this.wetGain.gain.value = mix;
    this.dryGain.gain.value = 1 - mix;
  }
});
```

### Mix Both Patterns!
```typescript
private setupParameterListeners(): void {
  // Simple cases - use helpers
  UIConfigService.bindAudioParams([
    { elementId: 'rate', audioParam: () => this.lfo?.frequency },
    { elementId: 'depth', audioParam: () => this.lfoGain?.gain, 
      transform: (v) => parseFloat(v) * 0.001 }
  ]);
  
  // Complex case - use custom handler
  UIConfigService.onInput('mix', (el, value) => {
    const mix = parseFloat(value);
    if (this.wetGain && this.dryGain) {
      this.wetGain.gain.value = mix;
      this.dryGain.gain.value = 1 - mix;
    }
  });
}
```

---

## Testing Strategy

### Setup Test Environment

```typescript
import { describe, it, expect, beforeEach } from 'bun:test';
import { MyModule } from './my-module';

describe('MyModule', () => {
  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';
    
    // Create required input elements
    const elementIds = ['my-param-1', 'my-param-2'];
    elementIds.forEach(id => {
      const input = document.createElement('input');
      input.id = id;
      input.type = 'number';
      input.value = '0';
      document.body.appendChild(input);
    });
  });

  it('returns correct config', () => {
    const module = new MyModule();
    
    // Set input values
    (document.getElementById('my-param-1') as HTMLInputElement).value = '10';
    (document.getElementById('my-param-2') as HTMLInputElement).value = '20';
    
    expect(module.getConfig()).toEqual({
      param1: 10,
      param2: 20
    });
  });

  it('updates AudioParams on input change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    const module = new MyModule();
    module.initialize(ctx, dest);

    const input = document.getElementById('my-param-1') as HTMLInputElement;
    input.value = '42';
    input.dispatchEvent(new Event('input'));

    // Verify the AudioParam was updated
    expect(module.getNode()?.param.value).toBe(42);
  });
});
```

### Key Testing Patterns

1. **Setup DOM in `beforeEach`** - Create all required elements
2. **Set default values** - Use `setAttribute('value', '...')` for initial config
3. **Simulate user input** - Set `value` and `dispatchEvent(new Event('input'))`
4. **Access mock nodes** - Store reference to mocked AudioNodes for assertions

---

## Complete Module Template

```typescript
import type { BaseEffectModule, EffectNodes } from './base-effect-module';
import { UIConfigService } from '../../services/ui-config-service';

export type MyModuleConfig = {
  param1: number;
  param2: number;
  param3: number;
};

export class MyModule implements BaseEffectModule {
  // 1. Define element IDs
  private readonly elementIds = {
    param1: 'my-module-param1',
    param2: 'my-module-param2',
    param3: 'my-module-param3'
  };

  // 2. Audio nodes (private, nullable)
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private myNode: MyAudioNode | null = null;

  // 3. Zero-parameter constructor
  constructor() {
    this.setupParameterListeners();
  }

  // 4. getConfig using UIConfigService
  getConfig(): MyModuleConfig {
    return UIConfigService.getConfig({
      param1: this.elementIds.param1,
      param2: this.elementIds.param2,
      param3: {
        id: this.elementIds.param3,
        transform: (v) => parseFloat(v) * 0.001 // Optional transform
      }
    });
  }

  // 5. initialize() - create nodes and connect
  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    this.disconnect();

    const { param1, param2, param3 } = this.getConfig();

    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    this.myNode = audioCtx.createMyNode();

    // Set initial values
    this.myNode.param1.value = param1;
    this.myNode.param2.value = param2;
    this.myNode.param3.value = param3;

    // Connect nodes
    this.inputGain.connect(this.myNode);
    this.myNode.connect(this.outputGain);
    this.outputGain.connect(destination);

    return {
      input: this.inputGain,
      output: this.outputGain
    };
  }

  // 6. Setup parameter listeners using helpers
  private setupParameterListeners(): void {
    // Option A: Use helper methods (recommended for simple cases)
    UIConfigService.bindAudioParams([
      { elementId: this.elementIds.param1, audioParam: () => this.myNode?.param1 },
      { elementId: this.elementIds.param2, audioParam: () => this.myNode?.param2 }
    ]);

    // Option B: Use custom handler (for complex cases)
    UIConfigService.onInput(this.elementIds.param3, (el, value) => {
      const transformed = parseFloat(value) * 0.001;
      if (this.myNode) {
        this.myNode.param3.value = transformed;
      }
    });
  }

  // 7. Standard getters
  getInput(): GainNode | null {
    return this.inputGain;
  }

  getOutput(): GainNode | null {
    return this.outputGain;
  }

  isInitialized(): boolean {
    return this.myNode !== null;
  }

  // 8. Cleanup
  private disconnect(): void {
    if (this.inputGain) this.inputGain.disconnect();
    if (this.outputGain) this.outputGain.disconnect();
    if (this.myNode) this.myNode.disconnect();
    this.inputGain = null;
    this.outputGain = null;
    this.myNode = null;
  }
}
```

---

## Migration Checklist

### For Each Module:

- [ ] Remove all constructor parameters
- [ ] Add `elementIds` object with element ID constants
- [ ] Update `getConfig()` to use `UIConfigService.getConfig()`
- [ ] Replace manual event listeners with `bindAudioParams()` or `onInput()`
- [ ] Update tests to create DOM elements in `beforeEach()`
- [ ] Remove element retrieval from `main.ts`
- [ ] Verify all tests pass
- [ ] Check that module works in browser

### In main.ts:

- [ ] Remove all `getInput()` calls for this module
- [ ] Remove all constructor parameters
- [ ] Simplify to: `const module = new MyModule();`

---

## Migration Order (Recommended)

### Phase 1: Simple Modules (3-5 params)
1. ✅ CompressorModule (DONE - reference implementation)
2. ✅ DelayModule (3 params)
3. DistortionModule (2 params)
4. ReverbModule (2 params)

### Phase 2: Medium Modules (5-7 params)
5. ChorusModule (3 params)
6. PhaserModule (5 params)
7. LFOModule (4 params)
8. EnvelopeModule (4 params)

### Phase 3: Complex Modules (7+ params or special cases)
9. FilterModule (uses EnvelopeModule)
10. SpectrumAnalyserModule (canvas element, different pattern)

### Phase 4: Core Modules (Last)
11. MasterModule
12. OscillatorBank
13. VoiceManager

---

## Common Patterns & Examples

### Pattern 1: Basic Parameter Binding
```typescript
UIConfigService.bindAudioParams([
  { elementId: 'delay-time', audioParam: () => this.delay?.delayTime },
  { elementId: 'delay-feedback', audioParam: () => this.feedback?.gain }
]);
```

### Pattern 2: With Transforms
```typescript
UIConfigService.bindAudioParams([
  {
    elementId: 'lfo-depth',
    audioParam: () => this.lfoGain?.gain,
    transform: (v) => parseFloat(v) * 0.001 // Convert ms to seconds
  },
  {
    elementId: 'phaser-stages',
    audioParam: () => this.stages,
    transform: (v) => Math.round(parseFloat(v)) // Round to integer
  }
]);
```

### Pattern 3: Wet/Dry Mix
```typescript
UIConfigService.onInput('chorus-mix', (el, value) => {
  const mix = parseFloat(value);
  if (this.wetGain && this.dryGain) {
    this.wetGain.gain.value = mix;
    this.dryGain.gain.value = 1 - mix;
  }
});
```

### Pattern 4: Select Element
```typescript
UIConfigService.onSelect('filter-type', (element, value) => {
  if (this.filter) {
    this.filter.type = value as BiquadFilterType;
  }
});
```

### Pattern 5: Conditional Updates
```typescript
UIConfigService.onInput('envelope-amount', (el, value) => {
  const amount = parseFloat(value);
  if (this.filterEnvelope && amount > 0) {
    this.filterEnvelope.setAmount(amount);
  }
});
```

---

## Troubleshooting

### Element Not Found Error
**Problem:** `Control element with id "my-param" not found`

**Solutions:**
1. Check element ID matches exactly (case-sensitive)
2. Ensure element exists in HTML before module instantiation
3. Use `exists()` to check before accessing
4. Use `tryGetInput()` for optional elements

### Event Listeners Not Firing
**Problem:** AudioParam not updating when input changes

**Solutions:**
1. Verify `setupParameterListeners()` is called in constructor
2. Check that `initialize()` has been called before input changes
3. Ensure element ID is correct
4. Check browser console for errors

### Tests Failing
**Problem:** Tests can't find elements

**Solutions:**
1. Ensure `document.body.innerHTML = ''` in `beforeEach()`
2. Create all required elements in test setup
3. Use `document.createElement()` and `appendChild()`
4. Check element IDs match exactly

---

## Summary

The UIConfigService provides a clean, testable, and maintainable architecture for module-UI integration:

- **90% less boilerplate** (25 lines → 14 lines for CompressorModule)
- **Zero constructor parameters** (eliminates dependency injection complexity)
- **Type-safe and flexible** (use helpers for simple cases, manual for complex)
- **Better testability** (mock DOM instead of creating element fixtures)
- **Clear separation of concerns** (service provides tools, modules use them)

This pattern is now the standard for all new modules and should be applied incrementally to existing modules following the migration order above.

---

*Last updated: February 2026*