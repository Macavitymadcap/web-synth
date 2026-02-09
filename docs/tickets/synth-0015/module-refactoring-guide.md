# Web Synth Effects Module Refactoring & Testing Guide

This document provides context and a step-by-step guide for agents (AI or human) tasked with refactoring and testing effect modules in the Web Synth project. It covers the architectural goals, the migration pattern, and the testing strategy to ensure consistency and maintainability as new modules are refactored or added.

---

## 1. **Background & Goals**

- **Goal:** All effect modules should implement the `BaseEffectModule` interface directly, removing the need for adapters.
- **Why:** This standardizes the API, simplifies the effects chain, and improves testability and maintainability.
- **Testing:** Focus on business logic and configuration, not on actual audio output (which requires manual/integration testing).

---

## 2. **Architecture Overview**

- **Effect Modules:** Each effect (e.g., Chorus, Phaser, Delay) is a class in `src/modules/` that manages its own Web Audio nodes and parameters.
- **Base Interface:** All effects must implement `BaseEffectModule` from `src/modules/base-effect-module.ts`.
- **EffectsManager:** Centralizes effect registration, ordering, and signal chain wiring.
- **Signal Flow:** Effects are chained in order, with each module's `initialize()` method returning `{ input, output }` nodes for routing.

---

## 3. **Refactoring Pattern**

### **Step 1: Implement the Interface**

Update the module to implement `BaseEffectModule`:

```typescript
import type { BaseEffectModule, EffectNodes } from './base-effect-module';

export class MyEffectModule implements BaseEffectModule {
  // ...module code...

  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes { ... }
  getInput(): GainNode | null { ... }
  getOutput(): GainNode | null { ... }
  isInitialized(): boolean { ... }
  getConfig(): MyEffectConfig { ... }
}
```

- **Preserve signal flow:** Ensure the audio routing matches the previous adapter-based setup.
- **Parameter listeners:** Set up DOM event listeners for parameter controls in the constructor or a private `setupParameterListeners()` method.
- **Node management:** Clean up/disconnect old nodes on re-initialization.

### **Step 2: Update main.ts Registration**

Register the module directly (no adapter):

```typescript
const myEffectModule = new MyEffectModule(param1, param2, ...);

effectsManager.register(myEffectModule, {
  id: 'my-effect',
  name: 'My Effect',
  order: 85,
  category: 'modulation'
});
```

### **Step 3: Remove Adapter Usage**

If the module was previously wrapped with `createStandardEffectAdapter`, remove the adapter and use the module instance directly.

---

## 4. **Testing Pattern**

### **Unit Test Focus**

- **Business logic:** Configuration, parameter updates, initialization state.
- **Mock Web Audio API:** Do not test actual audio output; mock nodes and methods as needed.

> **Note:**  
> If your effect module uses additional Web Audio API node types (e.g., `createBiquadFilter`, `createDynamicsCompressor`, etc.), be sure to add corresponding **factory functions** to `createMockAudioCtx` in `test/fixtures/mock-audio-context.ts`. Each factory should return a fresh node instance to prevent test interference.

### **Mock Fixtures Setup**

The test fixtures provide two key utilities:

1. **`createMockInput(value: string)`** - Creates a mock HTMLInputElement that:
   - Stores event listeners internally
   - Supports `dispatchEvent()` to trigger those listeners
   - Allows value changes via `(el as any).value = 'newValue'`

2. **`createMockAudioCtx()`** - Creates a mock AudioContext with:
   - Factory functions that return fresh node instances on each call
   - Common node types (GainNode, DelayNode, OscillatorNode, etc.)
   - Extend with additional node types as needed

### **Test File Template**

Create a test file in `test/modules/`:

```typescript
import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { MyEffectModule } from '../../src/modules/my-effect-module';
import { createMockInput } from '../fixtures/mock-input';
import { createMockAudioCtx } from '../fixtures/mock-audio-context';

describe('MyEffectModule', () => {
  let param1El: HTMLInputElement;
  let param2El: HTMLInputElement;
  let module: MyEffectModule;

  beforeEach(() => {
    param1El = createMockInput('value1');
    param2El = createMockInput('value2');
    module = new MyEffectModule(param1El, param2El);
  });

  it('returns correct config', () => {
    expect(module.getConfig()).toEqual({ param1: ..., param2: ... });
  });

  it('initializes nodes and sets up signal flow', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    const nodes = module.initialize(ctx, dest);
    
    expect(nodes.input).toBeDefined();
    expect(nodes.output).toBeDefined();
    // Verify node creation calls
    expect(ctx.createGain).toHaveBeenCalled();
  });

  it('isInitialized returns true after initialize', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    module.initialize(ctx, dest);
    
    expect(module.isInitialized()).toBe(true);
  });

  it('updates parameter on input change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    module.initialize(ctx, dest);

    // Change the input value
    (param1El as any).value = 'newValue';
    
    // Trigger the event listener that the module registered
    param1El.dispatchEvent(new Event('input'));
    
    // Verify the module updated its internal state/nodes
    expect(module['someInternalNode'].someProperty.value).toBeCloseTo(expectedValue);
  });
});
```

### **Testing Parameter Changes - Critical Pattern**

**⚠️ IMPORTANT:** When testing parameter updates, you must:

1. **Initialize the module first** - This sets up the audio nodes and event listeners
2. **Change the mock input's value** - Update `(element as any).value = 'newValue'`
3. **Dispatch the input event** - Call `element.dispatchEvent(new Event('input'))`
4. **Assert on the result** - Check that internal nodes were updated correctly

**❌ WRONG - Don't manually set node values:**
```typescript
// This bypasses the module's event listeners entirely!
(mixEl as any).value = '0.7';
module['wetGain'].gain.value = 0.7;  // Manual assignment
module['dryGain'].gain.value = 0.3;
```

**✅ CORRECT - Trigger the event listeners:**
```typescript
// This tests the actual behavior when users interact with controls
(mixEl as any).value = '0.7';
mixEl.dispatchEvent(new Event('input'));  // Module updates its own nodes
expect(module['wetGain']!.gain.value).toBeCloseTo(0.7);
```

### **Testing Guidelines**

- **Do:** Test config parsing, parameter listeners, node initialization, and state transitions.
- **Do:** Use `dispatchEvent()` to test parameter changes - this is how the real application works.
- **Do:** Update mock audio context factory functions when adding new node types.
- **Do not:** Manually set audio node values in tests - let the module's event listeners do it.
- **Do not:** Attempt to verify actual audio output or signal flow—this requires manual/integration testing in the browser.

---

## 5. **Manual/Integration Testing**

After unit tests pass, verify in the browser:
- The effect is audible and responds to controls.
- The effect order in the chain is correct.
- Presets and settings persist as expected.

---

## 6. **Checklist for Each Module**

- [ ] Refactor to implement `BaseEffectModule` directly.
- [ ] Remove adapter usage in `src/main.ts`.
- [ ] Add/Update unit tests for business logic.
- [ ] Update test fixtures to mock any new Web Audio node types used (via factory functions).
- [ ] Verify all parameter change tests use `dispatchEvent()` pattern.
- [ ] Verify registration and ordering in `EffectsManager`.
- [ ] Manually test audio behavior in the browser.

---

## 7. **Common Pitfalls**

### **Mock Node Sharing**
If tests interfere with each other, ensure mock nodes are created via factory functions that return fresh instances.

### **Testing Parameter Changes**
Always use `dispatchEvent()` after changing input values. Modules listen for these events to update their internal state.

### **Missing Mock Node Types**
If a test fails with "undefined is not a function" when calling `audioCtx.createXYZ()`, add a factory function for that node type to `createMockAudioCtx()`.

---

## 8. **References**

- `src/modules/base-effect-module.ts`
- `src/core/effects-manager.ts`
- `test/core/effects-manager.test.ts`
- `test/fixtures/mock-audio-context.ts`
- `test/fixtures/mock-input.ts`
- `docs/architecture.md`
- `docs/tickets/synth-0014/effects-manager-migration.md`

---

**Summary:**  
This guide ensures all effect modules are standardized, testable, and maintainable. Follow the outlined steps for each module, and use the provided test patterns to maintain high code quality as the synth evolves.