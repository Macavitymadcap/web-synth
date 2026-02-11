# Roadmap 

## Checklist

### Sprint 1 (Week 1-2): Foundation
- [x] Create EffectsManager
- [x] Extract UIConfigService
- [x] Add Noise Generator (validates new architecture)
- [x] Write tests for noise generator

### Sprint 2 (Week 3-4): Feature Velocity
- [x] Add Tremolo
- [x] Add Second LFO  
- [x] Add Flanger
- [x] Component audit cleanup

### Sprint 3 (Week 5-6): Professional Polish
- [ ] Add Oscilloscope
- [ ] Add Parametric EQ
- [ ] Arpeggiator
- [ ] Step Sequencer

### Sprint 4 (Week 7+): Advanced Features
- [ ] Create documentation site


```
┌──────────────────────────────────────────────────────────┐
│ Header: Brand + Presets toolbar                          │
├────────────────┬─────────────────────────────────────────┤
│                │  Keyboard (always visible)              │
│  Voice Panel   │  Analyser                               │
│  (sticky       ├─────────────────────────────────────────┤
│   sidebar)     │  Effects Rack                           │
│                │  ┌──────┬──────┬──────┬──────┬────┐     │
│  ┌──────────┐  │  │ Comp │Chor  │Phas  │ Trem │ .. │     │
│  │ Osc      │  │  │  ●   │  ●   │  ●   │  ●   │    │     │
│  │ ADSR     │  │  └──────┴──────┴──────┴──────┴────┘     │
│  │ Filter   │  │  Input ● ─────────────────── ● Output   │
│  │ LFOs     │  │                                         │
│  │ Noise    │  │  (click pedal → popover with controls)  │
│  └──────────┘  │                                         │
├────────────────┴─────────────────────────────────────────┤
│ Master Strip: MIDI │ Poly │ Volume │ ──── │ Rec ●        │
└──────────────────────────────────────────────────────────┘
```