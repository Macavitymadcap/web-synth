# Roadmap 

## Phase 1 
- [x] Create EffectsManager
- [x] Extract UIConfigService
- [x] Add Noise Generator (validates new architecture)
- [x] Write tests for noise generator

## Phase 2
- [x] Add Tremolo
- [x] Add Second LFO  
- [x] Add Flanger
- [x] Component audit cleanup

## Phase 3
- [x] Add Oscilloscope
- [ ] Add Parametric EQ
- [ ] Arpeggiator
- [ ] Step Sequencer

## Phase 4
- [ ] Create documentation site
- [ ] Redesign

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