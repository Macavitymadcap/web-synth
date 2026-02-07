# Second LFO
**Status**: Not implemented  
**Priority**: Medium  
**Complexity**: Low

## Description
Independent LFO for modulating additional parameters or creating complex movement.

## Implementation Plan

**Approach**: Extend existing `LFOModule` to support multiple instances:

```typescript
// In main.ts, create second LFO
const lfo2Module = new LFOModule(
  lfo2Rate,
  lfo2Waveform,
  lfo2ToFilter,
  lfo2ToPitch
);

// Initialize separately
const lfo2Routing = lfo2Module.initialize(audioCtx);

// Route to different parameters or same parameters for cross-modulation
```

**UI Component**:

```typescript
export class LFO2ModuleControls extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="lfo2-module" title="LFO 2">
        <div slot="instructions">
          <p>Second independent LFO for additional modulation and complex movement.</p>
          <instruction-list>
            <instruction-item label="Waveform">Shape of the modulation wave</instruction-item>
            <instruction-item label="Rate">Speed of modulation (0.1 - 20 Hz)</instruction-item>
            <instruction-item label="To Filter">Amount of filter cutoff wobble (0 - 5000 Hz)</instruction-item>
            <instruction-item label="To Pitch">Amount of pitch vibrato (0 - 100 cents)</instruction-item>
          </instruction-list>
        </div>

        <div slot="content">
          <controls-group>
            <waveform-picker id="lfo2-waveform" label="Waveform" value="triangle"></waveform-picker>
            <range-control label="Rate" id="lfo2-rate" min="0.1" max="20" step="0.1" value="3"
              formatter="hertz"></range-control>
            <range-control label="To Filter" id="lfo2-to-filter" min="0" max="5000" step="10" value="0"
              formatter="hertz"></range-control>
            <range-control label="To Pitch" id="lfo2-to-pitch" min="0" max="100" step="1" value="0"
              formatter="cents"></range-control>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('lfo2-module', LFO2ModuleControls);
```

**Advanced Use**: Cross-modulation (LFO modulating another LFO's rate) would require connecting LFO output to another LFO's frequency AudioParam.

---
