# Web Synth Architecture & Developer Guide

## Overview

Web Synth is a browser-based polyphonic synthesizer built with TypeScript, the Web Audio API, and native Web Components. It features a modular architecture with clear separation between:
- Audio processing (modules)
- User interface (components)
- Application logic (handlers)
- Services (UIConfigService)

**UIConfigService centralizes UI access and parameter binding.** Modules no longer receive DOM elements in their constructors; instead, they:
- Define element IDs locally via `elementIds` object
- Read config declaratively via `UIConfigService.getConfig()`
- Bind runtime updates using helpers (`bindAudioParams`, `bindGainParam`, `onInput`, `onSelect`)

This architecture provides:
- ✅ Zero-parameter constructors (eliminates dependency injection)
- ✅ 90% less boilerplate (declarative binding vs manual event listeners)
- ✅ Better testability (mock DOM in tests, not fixtures)
- ✅ Type-safe and flexible (helpers for simple cases, custom handlers for complex)

## Core Architecture Principles

### 1. **Modular Audio Processing**
Audio functionality is encapsulated in self-contained modules in `src/modules/`. Each module:
- Implements `BaseEffectModule` interface (for effects) or module-specific interfaces
- Manages its own Web Audio nodes
- Exposes configuration via `getConfig()` reading from UIConfigService
- Binds parameter updates via UIConfigService helpers in constructor
- Returns `{ input, output }` nodes for audio routing (effects)
- Handles cleanup on re-initialization

### 2. **Native Web Components**
UI elements are built as custom Web Components (extending `HTMLElement`):
- Encapsulation of markup, style, and behavior
- Reusable, framework-independent components
- Dispatch standard DOM events (`input`, `change`)
- Components are unaware of modules (loose coupling)

### 3. **Centralized Effects Management**
The `EffectsManager` orchestrates the effects chain:
- Registers effects with metadata (id, name, order, category)
- Initializes effects in correct order
- Manages audio routing between effects
- Provides querying and status APIs

### 4. **Dynamic LFO Bank Management**
The `LFOSection` component and `createLFOManager` handler provide dynamic LFO management:
- Add/remove LFOs at runtime via UI
- Each LFO has unique ID for parameter binding
- LFO modules array mutated in-place and synced with voice manager
- Component dispatches `lfos-changed` event on modifications
- Voice manager recreated with updated LFO array for modulation routing

### 5. **Event-Driven Parameter Updates**
Parameter changes flow through DOM events via UIConfigService:
- UI components dispatch `input`/`change` events
- Modules bind to these events using UIConfigService helpers
- Audio nodes update in real-time
- No manual coupling between UI and audio logic

### 6. **Centralized UI Access via UIConfigService**
`UIConfigService` is the single source of truth for UI interaction:
- **Safe element access**: `exists()`, `tryGet*()` methods prevent errors
- **Declarative config**: `getConfig({ id | { id, transform, select } })`
- **Batch bindings**: `bindAudioParams([...])` for multiple parameters
- **Single bindings**: `bindAudioParam()`, `bindGainParam()`
- **Custom handlers**: `onInput()`, `onSelect()` for complex logic

---

## Project Structure

```
src/
├── core/
│   ├── synth.ts                    # Main synthesizer engine
│   ├── effects-manager.ts          # Effects chain orchestration
│   ├── oscillator-bank.ts          # Oscillator management (UIConfigService)
│   ├── voice-manager.ts            # Voice allocation (UIConfigService)
│   ├── settings-manager.ts         # Preset/settings management
│   └── factory-presets.ts          # Factory preset definitions
├── modules/
│   ├── effects/
│   │   ├── base-effect-module.ts   # Effect interface
│   │   ├── chorus-module.ts        # Chorus (UIConfigService)
...
│   │   └── tremolo-module.ts       # Analyser (UIConfigService)
│   ├── envelope-module.ts          # ADSR envelope (UIConfigService)
│   ├── filter-module.ts            # Filter (UIConfigService)
│   ├── lfo-module.ts               # LFO (UIConfigService, dynamic ID)
│   ├── master-module.ts            # Master volume (UIConfigService)
│   └── noise-module.ts             # Noise generator (UIConfigService)
├── services/
│   └── ui-config-service.ts        # Centralized UI access/binding
├── components/
│   ├── atoms/                      # Basic UI elements
│   ├── molecules/                  # Composite controls
│   └── organisms/                  # Complex components
│       ├── lfo-bank/               # LFO components
|       ├── oscillator-bank/        # Oscillator components
|       ├── visual-keyboard/        # Piano components
|       ├── adsr-module.ts          # ADSR controls module
│       └── ...
├── handlers/
│   ├── keyboard-handlers.ts        # Computer keyboard input
│   ├── midi-handler-setup.ts       # MIDI device integration
│   ├── octave-handler.ts           # Octave switching
│   ├── oscillator-management.ts    # Dynamic oscillator UI
│   ├── lfo-management.ts           # Dynamic LFO bank management
│   └── recording-handler.ts        # Audio recording
└── main.ts                         # Application entry point

test/
├── core/
│   ├── effects-manager.test.ts
│   ├── oscillator-bank.test.ts     # UIConfigService tests
│   └── voice-manager.test.ts       # UIConfigService tests
├── modules/
│   ├── envelope-module.test.ts     # UIConfigService tests
│   └── effects/
│       └── spectrum-analyser-module.test.ts
└── fixtures/
    ├── mock-audio-context.ts       # Web Audio API mocks
    ├── mock-input.ts               # HTMLInputElement mocks
    └── mock-effect-module.ts       # BaseEffectModule mock
```

---

## Core Components

### BaseEffectModule Interface

All effect modules implement this interface:

```typescript
export interface EffectNodes {
  input: GainNode;
  output: GainNode;
}

export interface BaseEffectModule {
  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes;
  getInput(): GainNode | null;
  getOutput(): GainNode | null;
  isInitialized(): boolean;
  getConfig(): any; // Module-specific config object
}
```

### UIConfigService

Provides centralized, type-safe access to UI elements and parameter binding.

**Key APIs:**

```typescript
// Element access
const input = UIConfigService.getInput('my-param');
const select = UIConfigService.getSelect('filter-type');
const control = UIConfigService.getControl('my-control');

// Safe access (returns null instead of throwing)
const input = UIConfigService.tryGetInput('optional-param');

// Check existence
if (UIConfigService.exists('my-param')) { /* ... */ }

// Declarative config parsing
const config = UIConfigService.getConfig({
  rate: 'chorus-rate',
  depth: { id: 'chorus-depth', transform: (v) => parseFloat(v) * 0.001 },
  type: { id: 'filter-type', select: true }
});

// Batch bind AudioParams (most common)
UIConfigService.bindAudioParams([
  { elementId: 'comp-threshold', audioParam: () => this.compressor?.threshold },
  { elementId: 'comp-ratio', audioParam: () => this.compressor?.ratio }
]);

// Single AudioParam binding
UIConfigService.bindAudioParam({
  elementId: 'lfo-depth',
  audioParam: () => this.lfoGain?.gain,
  transform: (v) => parseFloat(v) * 0.001
});

// GainNode helper
UIConfigService.bindGainParam({
  elementId: 'master-volume',
  gainNode: () => this.masterGain
});

// Custom handlers
UIConfigService.onInput('chorus-mix', (el, value) => {
  const mix = parseFloat(value);
  if (this.wetGain && this.dryGain) {
    this.wetGain.gain.value = mix;
    this.dryGain.gain.value = 1 - mix;
  }
});

UIConfigService.onSelect('filter-type', (el, value) => {
  if (this.filter) {
    this.filter.type = value as BiquadFilterType;
  }
});
```

### EffectsManager

Orchestrates the effects chain and provides a unified API:

```typescript
const effectsManager = new EffectsManager();

// Register effects (zero-parameter constructors)
effectsManager.register(new CompressorModule(), {
  id: 'compressor',
  name: 'Compressor',
  order: 100,
  category: 'dynamics'
});

effectsManager.register(new ChorusModule(), {
  id: 'chorus',
  name: 'Chorus',
  order: 90,
  category: 'modulation'
});

// Initialize the chain (builds audio graph)
const chainInput = effectsManager.initialize(audioCtx, masterGain);

// Query effects
const chorus = effectsManager.getEffect('chorus');
const allEffects = effectsManager.getAllEffects();
const modulationEffects = effectsManager.getEffectsByCategory('modulation');
```

**Effect Order** (higher = earlier in chain):
- 100: Dynamics (compressor)
- 90-80: Modulation (chorus, phaser)
- 70-60: Time-based/distortion (delay, distortion)
- 50: Reverb
- 40: Utility (spectrum analyser)

### VoiceManager

Handles voice allocation and lifecycle using UIConfigService:

```typescript
const voiceManager = new VoiceManager(
  oscillatorBank,
  ampEnvelope,
  filterModule,
  lfoModules,  // Array of LFOModule instances
  noiseModule
);

// Reads polyphonic mode from UI
const config = voiceManager.getConfig(); // { polyphonic: true }

// Creates voices with multiple LFO routing, envelopes, and filters
voiceManager.createVoice(audioCtx, 'A4', 440, 0.8, destination);

// Manages voice lifecycle with proper release scheduling
voiceManager.stopVoice('A4', audioCtx.currentTime);
```

### LFO Bank Management

The LFO bank supports dynamic addition/removal of LFO modules:

```typescript
// Initialize LFO manager
const lfoSection = document.querySelector("lfo-section") as LFOSection;
let lfoModules: LFOModule[] = [];

const lfoManager = createLFOManager(
  lfoSection,
  lfoModules,
  () => {} // Empty callback initially
);

// Populates lfoModules array
lfoManager.initialize();

// Create voice manager with LFO array
let voiceManager = new VoiceManager(
  oscillatorBank,
  ampEnvelope,
  filterModule,
  lfoModules,
  noiseModule
);

// Listen for LFO changes
lfoSection.addEventListener('lfos-changed', () => {
  // Array was mutated in place by lfoManager
  const newVoiceManager = new VoiceManager(
    oscillatorBank,
    ampEnvelope,
    filterModule,
    lfoModules,  // Updated array
    noiseModule
  );
  
  // Update synth with new voice manager and LFO array
  synth.updateLFOs(lfoModules, newVoiceManager);
});
```

**Key Points:**
- `LFOSection` component manages UI for multiple LFOs
- `createLFOManager` syncs LFO modules with component state
- LFO modules array is mutated in-place during changes
- Voice manager recreated to update modulation routing
- Each LFO has unique ID (e.g., `'1'`, `'2'`, `'3'`)
- Element IDs follow pattern: `lfo-{id}-{param}` (e.g., `lfo-1-rate`)

---

## Adding New Effect Modules

### Step 1: Create Module File

```typescript
// filepath: src/modules/effects/my-effect-module.ts
import type { BaseEffectModule, EffectNodes } from './base-effect-module';
import { UIConfigService } from '../../services/ui-config-service';

export type MyEffectConfig = {
  param1: number;
  param2: number;
};

export class MyEffectModule implements BaseEffectModule {
  // 1. Define element IDs
  private readonly elementIds = {
    param1: 'my-effect-param1',
    param2: 'my-effect-param2'
  };

  // 2. Audio nodes
  private inputGain: GainNode | null = null;
  private outputGain: GainNode | null = null;
  private effectNode: SomeNode | null = null;

  // 3. Zero-parameter constructor
  constructor() {
    this.setupParameterListeners();
  }

  // 4. Declarative config
  getConfig(): MyEffectConfig {
    return UIConfigService.getConfig({
      param1: this.elementIds.param1,
      param2: {
        id: this.elementIds.param2,
        transform: (v) => parseFloat(v) * 0.001
      }
    });
  }

  // 5. Initialize nodes
  initialize(audioCtx: AudioContext, destination: AudioNode): EffectNodes {
    this.disconnect();

    const { param1, param2 } = this.getConfig();

    this.inputGain = audioCtx.createGain();
    this.outputGain = audioCtx.createGain();
    this.effectNode = audioCtx.createSomeNode();

    this.effectNode.param1.value = param1;
    this.effectNode.param2.value = param2;

    // Connect: input -> effect -> output -> destination
    this.inputGain.connect(this.effectNode);
    this.effectNode.connect(this.outputGain);
    this.outputGain.connect(destination);

    return { input: this.inputGain, output: this.outputGain };
  }

  // 6. Bind parameters using helpers
  private setupParameterListeners(): void {
    UIConfigService.bindAudioParams([
      { elementId: this.elementIds.param1, audioParam: () => this.effectNode?.param1 },
      { 
        elementId: this.elementIds.param2,
        audioParam: () => this.effectNode?.param2,
        transform: (v) => parseFloat(v) * 0.001
      }
    ]);
  }

  getInput(): GainNode | null { return this.inputGain; }
  getOutput(): GainNode | null { return this.outputGain; }
  isInitialized(): boolean { return this.effectNode !== null; }

  private disconnect(): void {
    if (this.inputGain) this.inputGain.disconnect();
    if (this.outputGain) this.outputGain.disconnect();
    if (this.effectNode) this.effectNode.disconnect();
    this.inputGain = null;
    this.outputGain = null;
    this.effectNode = null;
  }
}
```

### Step 2: Add HTML Controls

```html
<range-control
  id="my-effect-param1"
  label="Parameter 1"
  min="0"
  max="100"
  value="50"
  step="1"
></range-control>

<range-control
  id="my-effect-param2"
  label="Parameter 2"
  min="0"
  max="1000"
  value="500"
  step="10"
></range-control>
```

### Step 3: Register in main.ts

```typescript
import { MyEffectModule } from './modules/effects/my-effect-module';

// Zero-parameter instantiation
const myEffectModule = new MyEffectModule();

effectsManager.register(myEffectModule, {
  id: 'my-effect',
  name: 'My Effect',
  order: 85,
  category: 'modulation'
});
```

### Step 4: Initialize Chain

```typescript
const chainInput = effectsManager.initialize(audioCtx, masterGain);
```

---

## Adding Dynamic Module Banks (LFO Pattern)

For modules that need multiple instances (like the LFO bank):

### Step 1: Create Module with ID Parameter

```typescript
// filepath: src/modules/my-module.ts
export class MyModule {
  private readonly id: string;
  private readonly elementIds: {
    param1: string;
    param2: string;
  };

  constructor(id: string) {
    this.id = id;
    this.elementIds = {
      param1: `my-module-${id}-param1`,
      param2: `my-module-${id}-param2`
    };
    this.setupParameterListeners();
  }

  getConfig(): MyModuleConfig {
    return UIConfigService.getConfig({
      param1: this.elementIds.param1,
      param2: this.elementIds.param2
    });
  }

  // ... rest of module implementation
}
```

### Step 2: Create Section Component

```typescript
// filepath: src/components/organisms/my-module-section.ts
export class MyModuleSection extends HTMLElement {
  private modules: MyModuleConfig[] = [];

  addModule() {
    const id = this.modules.length + 1;
    this.modules.push({ id, /* default config */ });
    this.render();
    this.dispatchEvent(new CustomEvent('modules-changed'));
  }

  removeModule(id: number) {
    this.modules = this.modules.filter(m => m.id !== id);
    this.render();
    this.dispatchEvent(new CustomEvent('modules-changed'));
  }

  getModules() {
    return this.modules;
  }
}
```

### Step 3: Create Manager Handler

```typescript
// filepath: src/handlers/my-module-management.ts
export function createMyModuleManager(
  section: MyModuleSection,
  modules: MyModule[],
  onModulesChange: (modules: MyModule[]) => void
) {
  const moduleMap = new Map<number, MyModule>();

  function syncModules() {
    const configs = section.getModules();
    moduleMap.clear();
    
    configs.forEach((_, index) => {
      const id = (index + 1).toString();
      moduleMap.set(index + 1, new MyModule(id));
    });
    
    modules.length = 0;
    modules.push(...Array.from(moduleMap.values()));
    onModulesChange(modules);
  }

  function initialize() {
    syncModules();
    section.addEventListener('modules-changed', () => {
      syncModules();
    });
  }

  return { initialize, getModules: () => modules };
}
```

### Step 4: Wire Up in main.ts

```typescript
const section = document.querySelector("my-module-section") as MyModuleSection;
let modules: MyModule[] = [];

const manager = createMyModuleManager(
  section,
  modules,
  () => {} // Callback after synth exists
);

manager.initialize();

// After modules array populated and synth created
section.addEventListener('modules-changed', () => {
  // Handle module changes (e.g., recreate voice manager)
  synth.updateModules(modules);
});
```

---

## Testing Strategy

### Philosophy

- **Test business logic, not audio output**: Verify config, node creation, routing
- **Mock Web Audio API**: Use test fixtures
- **Test parameter updates**: Trigger events, assert node state
- **Use UIConfigService**: Create DOM elements in tests, no fixtures needed

### Testing with UIConfigService

```typescript
import { describe, it, expect, beforeEach } from 'bun:test';
import { MyEffectModule } from '../../../src/modules/effects/my-effect-module';
import { createMockAudioCtx } from '../../fixtures/mock-audio-context';

describe('MyEffectModule (UIConfigService)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';

    // Create required elements
    const param1 = document.createElement('input');
    param1.id = 'my-effect-param1';
    param1.type = 'number';
    param1.value = '50';
    document.body.appendChild(param1);

    const param2 = document.createElement('input');
    param2.id = 'my-effect-param2';
    param2.type = 'number';
    param2.value = '500';
    document.body.appendChild(param2);
  });

  it('reads config from UI via UIConfigService', () => {
    const module = new MyEffectModule();
    expect(module.getConfig()).toEqual({ param1: 50, param2: 0.5 });
  });

  it('initializes nodes and connects them', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
    const module = new MyEffectModule();

    const nodes = module.initialize(ctx, dest);

    expect(nodes.input).toBeDefined();
    expect(nodes.output).toBeDefined();
    expect(ctx.createGain).toHaveBeenCalled();
  });

  it('updates parameters on input change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
    const module = new MyEffectModule();
    module.initialize(ctx, dest);

    const input = document.getElementById('my-effect-param1') as HTMLInputElement;
    input.value = '75';
    input.dispatchEvent(new Event('input'));

    expect(module['effectNode']!.param1.value).toBe(75);
  });
});
```

### Testing Dynamic Modules (LFO Pattern)

```typescript
describe('LFOModule (Dynamic ID)', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function createLFOElements(id: string) {
    const rate = document.createElement('input');
    rate.id = `lfo-${id}-rate`;
    rate.value = '5';
    document.body.appendChild(rate);

    const toFilter = document.createElement('input');
    toFilter.id = `lfo-${id}-to-filter`;
    toFilter.value = '100';
    document.body.appendChild(toFilter);
  }

  it('reads config with unique ID', () => {
    createLFOElements('1');
    createLFOElements('2');

    const lfo1 = new LFOModule('1');
    const lfo2 = new LFOModule('2');

    expect(lfo1.getConfig().rate).toBe(5);
    expect(lfo2.getConfig().rate).toBe(5);
  });

  it('updates correct instance on input change', () => {
    createLFOElements('1');
    createLFOElements('2');

    const ctx = createMockAudioCtx();
    const lfo1 = new LFOModule('1');
    const lfo2 = new LFOModule('2');
    
    lfo1.initialize(ctx);
    lfo2.initialize(ctx);

    const rate1 = document.getElementById('lfo-1-rate') as HTMLInputElement;
    rate1.value = '10';
    rate1.dispatchEvent(new Event('input'));

    expect(lfo1['lfo']!.frequency.value).toBe(10);
    expect(lfo2['lfo']!.frequency.value).toBe(5); // Unchanged
  });
});
```

### Testing Pattern - Critical

**⚠️ IMPORTANT:** Always trigger events to test parameter updates:

**❌ WRONG:**
```typescript
module['effectNode'].param.value = 75; // Bypasses listeners
```

**✅ CORRECT:**
```typescript
const input = document.getElementById('my-param') as HTMLInputElement;
input.value = '75';
input.dispatchEvent(new Event('input')); // Tests actual behavior
expect(module['effectNode']!.param.value).toBe(75);
```

### Running Tests

```bash
# Run all tests
bun test

# Run specific test
bun test test/modules/effects/my-effect-module.test.ts

# Watch mode
bun test --watch
```

---

## Web Components

### Creating Custom Components

```typescript
class MyControl extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  private render() {
    this.innerHTML = `
      <div class="my-control">
        <label>${this.getAttribute('label')}</label>
        <input type="range" />
      </div>
    `;
  }

  getInput(): HTMLInputElement {
    return this.querySelector('input')!;
  }
}

customElements.define('my-control', MyControl);
```

**Usage:**
```html
<my-control label="Volume" min="0" max="1" value="0.5"></my-control>
```

---

## Signal Flow

filepath: /Users/dank/Code/personal/web/web-synth/docs/architecture.md
```mermaid
graph TD
    A[User Input] --> B[Synth.playFrequency]
    B --> C[VoiceManager]
    
    C --> D[Voice Creation]
    D --> E[OscillatorBank]
    D --> F[FilterModule]
    D --> G[Amplitude Envelope]
    D --> H[LFO Modules]
    D --> I[Noise Module]
    
    H --> F
    H --> E
    I --> F
    E --> F
    F --> J[EffectsManager Input]
    G --> J
    
    subgraph EM["Effects Manager"]
        J --> K[Compressor]
        K --> L[Chorus]
        L --> M[Phaser]
        M --> N[Tremolo]
        N --> O[Flanger]
        O --> P[Delay]
        P --> Q[Distortion]
        Q --> R[Reverb]
        R --> S[Spectrum Analyser]
        S --> T[EffectsManager Output]
    end
    
    T --> U[Master Volume]
    U --> V[AudioContext.destination]
    
    style A fill:#0a0015,stroke:#00ffff,stroke-width:3px,color:#00ffff
    style B fill:#0a0015,stroke:#00d4ff,stroke-width:2px,color:#00d4ff
    style C fill:#0a0015,stroke:#00d4ff,stroke-width:2px,color:#00d4ff
    style D fill:#0a0015,stroke:#00d4ff,stroke-width:2px,color:#00d4ff
    style E fill:#0a0015,stroke:#00ff88,stroke-width:2px,color:#00ff88
    style F fill:#0a0015,stroke:#00ff88,stroke-width:2px,color:#00ff88
    style G fill:#0a0015,stroke:#00ff88,stroke-width:2px,color:#00ff88
    style H fill:#0a0015,stroke:#b800ff,stroke-width:3px,color:#b800ff
    style I fill:#0a0015,stroke:#00ff88,stroke-width:2px,color:#00ff88
    style J fill:#0a0015,stroke:#ffff00,stroke-width:3px,color:#ffff00
    style K fill:#0a0015,stroke:#ff00ff,stroke-width:2px,color:#ff00ff
    style L fill:#0a0015,stroke:#ff00ff,stroke-width:2px,color:#ff00ff
    style M fill:#0a0015,stroke:#ff00ff,stroke-width:2px,color:#ff00ff
    style N fill:#0a0015,stroke:#ff00ff,stroke-width:2px,color:#ff00ff
    style O fill:#0a0015,stroke:#ff00ff,stroke-width:2px,color:#ff00ff
    style P fill:#0a0015,stroke:#ff00ff,stroke-width:2px,color:#ff00ff
    style Q fill:#0a0015,stroke:#ff00ff,stroke-width:2px,color:#ff00ff
    style R fill:#0a0015,stroke:#ff00ff,stroke-width:2px,color:#ff00ff
    style S fill:#0a0015,stroke:#ff00ff,stroke-width:2px,color:#ff00ff
    style T fill:#0a0015,stroke:#ffff00,stroke-width:3px,color:#ffff00
    style U fill:#0a0015,stroke:#00d4ff,stroke-width:2px,color:#00d4ff
    style V fill:#0a0015,stroke:#ff3366,stroke-width:3px,color:#ff3366
    style EM fill:#1a0033,stroke:#ff00ff,stroke-width:3px,color:#00ffff
```

**Key points:**
- Effects initialized in reverse order (build chain backward)
- Each effect's output connects to next effect's input
- LFO modules provide modulation to filter and pitch
- Voices connect to EffectsManager input
- Analyser is passive (lowest order)

---

## Best Practices

### Module Design

1. **Zero-parameter constructors**: Use UIConfigService, not dependency injection
2. **Define `elementIds`**: Centralized, type-safe ID references
3. **Use UIConfigService helpers**: `bindAudioParams()` for simple cases
4. **Custom handlers for complex logic**: `onInput()` when updating multiple nodes
5. **Clean up on re-initialization**: Call `disconnect()` before creating new nodes
6. **Guard updates**: Check `isInitialized()` in parameter listeners
7. **Dynamic IDs for multi-instance**: Pass ID parameter for modules supporting multiple instances

### Parameter Handling

1. **Prefer helpers**: Use `bindAudioParams()`, `bindGainParam()` when possible
2. **Use transforms**: Convert units (ms→s), clamp ranges, round values
3. **Mix patterns**: Helpers for simple bindings, custom handlers for complex
4. **Lazy node access**: Use `() => this.node?.param` to handle null states

### Testing

1. **Mock Web Audio API**: Use `createMockAudioCtx()`
2. **Create DOM in tests**: Set up elements in `beforeEach()`
3. **Trigger events**: Use `dispatchEvent(new Event('input'))`
4. **Assert on config**: Test `getConfig()` with various input values
5. **Verify node state**: Access private nodes via `module['nodeName']`
6. **Test multi-instance**: Create elements for multiple IDs, verify isolation

### Code Organization

1. **elementIds first**: Constant reference object at top
2. **Nodes next**: Private, nullable audio node properties
3. **Constructor**: Zero-parameter (or ID for dynamic), calls `setupParameterListeners()`
4. **Public methods**: `getConfig()`, `initialize()`, `getInput/Output()`, `isInitialized()`
5. **Private helpers**: `setupParameterListeners()`, `disconnect()`

---

## Common Patterns

### Pattern 1: Simple AudioParam Binding
```typescript
UIConfigService.bindAudioParams([
  { elementId: 'delay-time', audioParam: () => this.delay?.delayTime },
  { elementId: 'delay-feedback', audioParam: () => this.feedback?.gain }
]);
```

### Pattern 2: With Transform
```typescript
UIConfigService.bindAudioParam({
  elementId: 'lfo-depth',
  audioParam: () => this.lfoGain?.gain,
  transform: (v) => parseFloat(v) * 0.001 // ms to seconds
});
```

### Pattern 3: Wet/Dry Mix (Custom Handler)
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

### Pattern 5: GainNode Binding
```typescript
UIConfigService.bindGainParam({
  elementId: 'master-volume',
  gainNode: () => this.masterGain
});
```

### Pattern 6: Dynamic IDs (Multi-Instance)
```typescript
constructor(id: string) {
  this.id = id;
  this.elementIds = {
    rate: `lfo-${id}-rate`,
    depth: `lfo-${id}-depth`
  };
  this.setupParameterListeners();
}
```

### Pattern 7: LFO Modulation (Multiple Sources)
```typescript
// Combine multiple LFO signals
const filterMods = lfoModules
  .map(lfo => lfo.getFilterModulation())
  .filter((node): node is GainNode => node !== null);

const mixer = audioCtx.createGain();
mixer.gain.value = 1 / filterMods.length; // Average
filterMods.forEach(mod => mod.connect(mixer));
mixer.connect(filterNode.detune);
```

### Pattern 8: Feedback Loop
```typescript
const feedbackGain = audioCtx.createGain();
feedbackGain.gain.value = config.feedback;

// Signal flow: input -> effect -> output + feedback
effectNode.connect(this.outputGain);
effectNode.connect(feedbackGain);
feedbackGain.connect(effectNode); // Feedback loop
```

### Pattern 9: Multi-Stage Filters
```typescript
const stages = config.stages;
this.filters = [];

for (let i = 0; i < stages; i++) {
  const filter = audioCtx.createBiquadFilter();
  filter.type = 'allpass';
  this.filters.push(filter);
  
  if (i > 0) {
    this.filters[i - 1].connect(filter);
  }
}
```

---

## Preset System

Presets are defined in `src/core/factory-presets.ts`:

```typescript
export const FACTORY_PRESETS: Preset[] = [
  {
    name: "Warm Pad",
    description: "Lush atmospheric pad with subtle chorus detune",
    settings: {
      master: { polyphonic: true, masterVolume: 0.25 },
      oscillators: [
        { waveform: "sawtooth", detune: 0, level: 0.8 },
        { waveform: "sawtooth", detune: 0, level: 1 },
        { waveform: "sawtooth", detune: 0, level: 0.8 }
      ],
      envelope: { attack: 0.8, decay: 0.4, sustain: 0.85, release: 1.2 },
      filter: {
        type: "lowpass", cutoff: 1200, resonance: 0.5, envAmount: 800,
        attack: 1, decay: 0.5, sustain: 0.7, release: 1
      },
      lfos: [
        { waveform: "sine", rate: 0.3, toFilter: 150, toPitch: 0 }
      ],
      chorus: { rate: 0.3, depth: 20, mix: 0.4 },
      tremolo: { rate: 0.4, depth: 0.15 },
      reverb: { decay: 3.5, reverbMix: 0.45 },
      delay: { time: 0.5, feedback: 0.25, mix: 0.15 },
      distortion: { drive: 0.5, blend: 0.15 },
      compressor: {
        threshold: -28, ratio: 3, attack: 0.08, release: 0.4, knee: 18
      },
      phaser: { rate: 0.7, depth: 700, stages: 4, feedback: 0.3, mix: 0.5 },
      noise: { enabled: false, type: "white", level: 0.1 }
    }
  },
];
```

Presets can configure:
- Oscillator types, detuning, and levels
- ADSR envelope parameters
- Filter type, frequency, and Q
- LFO rate and routing depths
- Effect parameters for all registered effects

---

## Troubleshooting

### Effect Not Working

1. **Check registration**: Verify effect registered with EffectsManager
2. **Check initialization**: Ensure `effectsManager.initialize()` called
3. **Check order**: Higher order = earlier in chain
4. **Check console**: Look for initialization errors
5. **Check signal flow**: Verify node connections

### Parameter Changes Not Working

1. **Check element ID**: Verify ID matches exactly (case-sensitive)
2. **Check listener setup**: Ensure `setupParameterListeners()` called in constructor
3. **Check initialization**: Use `isInitialized()` guard in listeners
4. **Check UIConfigService**: Use `exists()` to verify element presence
5. **Check dynamic IDs**: For multi-instance modules, verify ID parameter matches element

### Element Not Found Error

1. **Check element ID spelling**: IDs are case-sensitive
2. **Check HTML**: Ensure element exists before module instantiation
3. **Use safe access**: `tryGetInput()` for optional elements
4. **Check component getInput()**: RangeControl needs `.getInput()` call
5. **Check dynamic ID construction**: Verify `${prefix}-${id}-${param}` pattern

### Audio Glitches

1. **Check disconnection**: Call `disconnect()` before re-initialization
2. **Check feedback loops**: Ensure feedback gain < 1.0
3. **Check buffer sizes**: Large FFT sizes cause performance issues
4. **Check parameter ranges**: Extreme values may cause instability
5. **Check LFO rates**: Very fast LFO rates can cause artifacts

### LFO Bank Issues

1. **Check array mutation**: Ensure `lfoModules.length = 0` before push
2. **Check voice manager recreation**: Must recreate when LFOs change
3. **Check element IDs**: Verify `lfo-{id}-{param}` pattern
4. **Check event dispatch**: Component must dispatch `lfos-changed`
5. **Check initialization**: Call `lfo.initialize(audioCtx)` after creation

### Tests Failing

1. **Check DOM setup**: Create all elements in `beforeEach()`
2. **Trigger events**: Use `dispatchEvent()`, don't set values directly
3. **Check element IDs**: Must match module's `elementIds`
4. **Check mocks**: Verify `createMockAudioCtx()` has required factories
5. **Check dynamic IDs**: Create elements for each ID in multi-instance tests

---

## Resources

- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Bun Test Runner](https://bun.sh/docs/cli/test)
- **[UIConfigService Integration Guide](./synth-0017.md)** - Detailed migration patterns

---

## Future Improvements

- [ ] Visual editor for effects chain ordering
- [ ] User-savable presets (beyond factory presets)
- [ ] MIDI CC mapping for effect parameters
- [ ] Automation/envelope for effect parameters
- [ ] Preset morphing/interpolation
- [ ] Multi-band effects (EQ, compression)
- [ ] Sidechain compression
- [ ] Arpeggiator/sequencer
- [ ] Recording/export functionality (partial implementation exists)
- [ ] LFO tempo sync
- [ ] LFO phase control
- [ ] Multiple LFO waveforms (sine, triangle, square, saw, random)

---

*Last updated: February 2026*