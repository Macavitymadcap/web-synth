# Web Synth Effects Module Refactoring & Testing Guide

This document provides context and a step-by-step guide for agents (AI or human) tasked with refactoring and testing effect modules in the Web Synth project. It covers the architectural goals, the migration pattern, and the testing strategy to ensure consistency and maintainability as new modules are refactored or added.

---

## 1. **Background & Goals**

- **Goal:** All effect modules should implement the `BaseEffectModule` interface directly, removing the need for adapters.
- **Why:** This standardizes the API, simplifies the effects chain, and improves testability and maintainability.
- **Testing:** Focus on business logic and configuration, not on actual audio output (which requires manual/integration testing).

---

## 2. **Architecture Overview**

- **Effect Modules:** Each effect (e.g., Chorus, Phaser, Delay) is a class in modules that manages its own Web Audio nodes and parameters.
- **Base Interface:** All effects must implement `BaseEffectModule` from base-effect-module.ts.
- **EffectsManager:** Centralizes effect registration, ordering, and signal chain wiring.
- **Signal Flow:** Effects are chained in order, with each module’s `initialize()` method returning `{ input, output }` nodes for routing.

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
- **Parameter listeners:** Set up DOM event listeners for parameter controls.
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

### **Test File Template**

Create a test file in modules:

```typescript
import { MyEffectModule } from '../../src/modules/my-effect-module';
import { createMockInput, createMockAudioCtx } from "../fixtures/mock-input.ts";

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
  });

  it('isInitialized returns true after initialize', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    module.initialize(ctx, dest);
    expect(module.isInitialized()).toBe(true);
  });

  // Add tests for parameter updates, cleanup, etc.
});
```

### **Testing Guidelines**

- **Do:** Test config parsing, parameter listeners, node initialization, and state transitions.
- **Do not:** Attempt to verify actual audio output or signal flow—this requires manual/integration testing in the browser.

---

## 5. **Manual/Integration Testing**

- After unit tests pass, verify in the browser:
  - The effect is audible and responds to controls.
  - The effect order in the chain is correct.
  - Presets and settings persist as expected.

---

## 6. **Checklist for Each Module**

- [ ] Refactor to implement `BaseEffectModule` directly.
- [ ] Remove adapter usage in main.ts.
- [ ] Add/Update unit tests for business logic.
- [ ] Verify registration and ordering in `EffectsManager`.
- [ ] Manually test audio behavior in the browser.

---

## 7. **References**

- `src/modules/base-effect-module.ts`
- `src/core/effects-manager.ts`
- `test/core/effects-manager.test.ts`
- `docs/architecture.md`
- `docs/tickets/synth-0014/effects-manager-migration.md`

---

**Summary:**  
This guide ensures all effect modules are standardized, testable, and maintainable. Follow the outlined steps for each module, and use the provided test patterns to maintain high code quality as the synth evolves.