export class LFOControls extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="lfo-controls" title="LFOs">
        <div slot="instructions">
          <p>LFOs modulate parameters over time to add movement and variation. Add multiple for complex modulation.</p>
          <instruction-list>
            <instruction-item label="Waveform">Shape of the modulation wave (sine = smooth, square = stepped)</instruction-item>
            <instruction-item label="Rate">Speed of modulation (0.1-20 Hz)</instruction-item>
            <instruction-item label="To Filter">Amount of filter cutoff wobble (0-5000 Hz)</instruction-item>
            <instruction-item label="To Pitch">Amount of pitch vibrato (0-100 cents)</instruction-item>
          </instruction-list>
        </div>
        <div slot="content">
          <bank-section
            prefix="lfo"
            max-items="4"
            min-items="1"
            add-label="Add LFO"
            event-name="lfos-changed"
          >
            <bank-item-template>
              <bank-select param="waveform" type="waveform" value="sine"></bank-select>
              <bank-range param="rate" label="Rate" min="0.1" max="20" step="0.1" value="5" format="hz"></bank-range>
              <bank-range param="to-filter" label="To Filter" min="0" max="5000" step="10" value="0" format="hz"></bank-range>
              <bank-range param="to-pitch" label="To Pitch" min="0" max="100" step="1" value="0" format="cents"></bank-range>
            </bank-item-template>
          </bank-section>
        </div>
      </module-section>
    `;
  }
}
customElements.define('lfo-controls', LFOControls);