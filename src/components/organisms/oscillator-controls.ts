export class OscillatorControls extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="oscillator-controls" title="Oscillators">
        <div slot="instructions">
          <p>Oscillators are the primary sound sources. Add multiple to layer and create richer tones.</p>
          <instruction-list>
            <instruction-item label="Waveform">Sine (smooth), Square (hollow), Sawtooth (bright), Triangle (mellow)</instruction-item>
            <instruction-item label="Detune">Frequency offset (-1200 to +1200 cents) for chorus/unison effects</instruction-item>
            <instruction-item label="Level">Volume/mix of each oscillator (0-100%)</instruction-item>
          </instruction-list>
        </div>
        <div slot="content">
          <bank-section
            prefix="osc"
            max-items="4"
            add-label="Add Oscillator"
            event-name="oscillators-changed"
          >
            <bank-item-template>
              <bank-select param="waveform" type="waveform" value="sawtooth"></bank-select>
              <bank-range param="detune" label="Detune" min="-1200" max="1200" step="1" value="0" format="cents"></bank-range>
              <bank-range param="level" label="Level" min="0" max="1" step="0.01" value="1" format="percent"></bank-range>
            </bank-item-template>
          </bank-section>
        </div>
      </module-section>
    `;
  }
}
customElements.define('oscillator-controls', OscillatorControls);