# Web Synth - Outstanding Features & Expansion Plan

## New Features

- [Noise Generator](./features/noise-generator.md)
- [Ring Modulator](./features/ring-modulator.md)
- [Flanger](./features/flanger.md)
- [Tremelo](./features/tremelo.md)
- [Noise Gate](./features/noise-gate.md)
- [Parametric EQ](./features/parametric-eq.md)
- [Formant Filter](./features/formant-filter.md)
- [Second LFO](./features/second-lfo.md)
- [Step Sequencer](./features/step-sequencer.md)
- [Arpeggiator](./features/arpeggiator.md)
- [Stereo Panner/Width](./features/stereo-panner.md)
- [Auto Pan](./features/auto-pan.md)
- [Oscilloscope](./features/oscilloscope.md)

## Priority Implementation Order

### Phase 1 - High Value, Low Complexity
1. **Flanger** - Complements existing chorus/phaser
2. **Tremolo** - Classic effect, simple implementation
3. **Auto-Pan** - Adds stereo dimension
4. **Second LFO** - Extends modulation capabilities

### Phase 2 - Medium Value, Medium Complexity
5. **Parametric EQ** - Professional tone shaping
6. **Noise Generator** - Expands sound design palette

### Phase 3 - Specialized Features
7. **Ring Modulator** - Experimental sounds
8. **Noise Gate** - Utility effect

## Implementation Notes

### General Patterns

All modules follow the same structure:
1. Config type defining parameters
2. Nodes type for input/output
3. Module class with initialization
4. Parameter listeners for real-time updates
5. Organism component for UI
6. Settings model integration

### Effects Chain Considerations

When adding effects, consider placement in the signal chain:
- **Pre-filter effects**: Ring mod, noise (part of voice generation)
- **Post-filter, pre-delay**: Tremolo, auto-pan
- **End of chain**: EQ, gate (for cleanup)

### Testing Strategy

For each new module:
1. Test in isolation with simple sine wave
2. Test with full synth voice
3. Test parameter automation
4. Test with presets
5. Test settings persistence
6. Test on mobile devices