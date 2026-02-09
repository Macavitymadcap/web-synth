# Roadmap 

## Checklist

### Sprint 1 (Week 1-2): Foundation
- [✓] Create EffectsManager
- [ ] Extract UIConfigService
- [ ] Add Noise Generator (validates new architecture)
- [ ] Write tests for noise generator

### Sprint 2 (Week 3-4): Feature Velocity
- [ ] Add Tremolo
- [ ] Add Second LFO  
- [ ] Add Flanger
- [ ] Component audit cleanup

### Sprint 3 (Week 5-6): Professional Polish
- [ ] Add Oscilloscope
- [ ] Add Parametric EQ
- [ ] Create documentation site
- [ ] Preset categories/search

### Sprint 4 (Week 7+): Advanced Features
- [ ] Arpeggiator
- [ ] Step Sequencer
- [ ] Advanced routing/modulation matrix

## Phase 1: Critical Refactoring (1-2 weeks)

**Priority: High** - These changes will make everything else easier and prevent compounding technical debt.

### 1.1 Effects Manager Pattern
The synth constructor is becoming unwieldy with 10+ module dependencies. Create an effects chain manager:

```typescript
// src/core/effects-manager.ts
export class EffectsManager {
  private effects: Map<string, EffectModule> = new Map();
  private chain: GainNode[] = [];
  
  register(name: string, module: EffectModule) { ... }
  initialize(audioCtx: AudioContext, destination: AudioNode): GainNode { ... }
  getInput(): GainNode { ... }
}
```

**Benefits:**
- Reduces synth.ts from 100+ lines of initialization to ~10
- Makes adding new effects trivial
- Enables dynamic effect reordering in future
- Each effect becomes a plugin

### 1.2 Separate View Logic from Modules
Your modules currently mix audio logic with DOM access. Create a service layer:

```typescript
// src/services/ui-config-service.ts
export class UIConfigService {
  static getControl(id: string): HTMLInputElement { ... }
  static getConfig<T>(ids: ConfigMap): T { ... }
}

// Then modules become:
export class ChorusModule {
  constructor(private config: ChorusConfig) {}
  
  updateConfig(config: Partial<ChorusConfig>) { ... }
  initialize(audioCtx: AudioContext, destination: AudioNode) { ... }
}
```

**Benefits:**
- Modules become testable (no DOM dependencies)
- Easier to serialize/deserialize for presets
- Can swap UI implementations
- Clear separation of concerns

### 1.3 Component Audit
You have good atomic design structure, but some inconsistencies:

**Quick wins:**
- Move `oscillator-control.ts` from `molecules/` to `organisms/` (it manages state)
- Extract common patterns (all modules use similar structure)
- Create a base `EffectModule` component class

## Phase 2: High-Value Features (2-3 weeks)

**Priority: Medium-High** - These add significant user value with minimal complexity.

Pick features from your list based on this priority:

### 2.1 Tier 1 - Low Complexity, High Impact
1. **Noise Generator** - Essential for percussion/texture, straightforward implementation
2. **Tremolo** - Classic effect, simple LFO→gain modulation
3. **Second LFO** - Extends existing pattern, no new concepts

### 2.2 Tier 2 - Medium Complexity, Medium Impact  
4. **Flanger** - Complements existing chorus/phaser
5. **Oscilloscope** - Visual feedback, reuses analyser pattern
6. **Parametric EQ** - Professional tool, moderate complexity

**Skip for now:** Ring modulator, noise gate, formant filter (specialist/complex)

## Phase 3: Architecture Improvements (1 week)

**Priority: Medium** - These improve developer experience significantly.

### 3.1 Testing Infrastructure
Start with critical modules:

```typescript
// tests/modules/chorus-module.test.ts
describe('ChorusModule', () => {
  it('should modulate delay time with LFO', () => { ... })
  it('should mix dry/wet correctly', () => { ... })
})
```

**Focus on:**
- Audio node wiring (mocks)
- Parameter validation
- Config serialization

### 3.2 Documentation Site
Convert your excellent inline docs to a static site:

```
docs-site/
├── guide/
│   ├── getting-started.md
│   ├── sound-design-basics.md
│   └── keyboard-shortcuts.md
├── modules/
│   ├── oscillators.md
│   ├── filter.md
│   └── chorus.md
└── architecture/
    ├── signal-flow.md
    └── adding-modules.md
```

**Tools:** VitePress or Docusaurus (both support Markdown)

## Phase 4: UI Refinement (Ongoing)

**Priority: Low-Medium** - Polish, but not blocking.

### 4.1 Module Organization
Your current masonry layout works, but consider:
- Collapsible sections (you have this!)
- Drag-and-drop module reordering
- Save custom layouts
- Effects rack visual (stompbox style?)

### 4.2 Preset Management
Enhance your existing system:
- Categories/tags for presets
- Search/filter
- Share presets via URL
- Import from clipboard
