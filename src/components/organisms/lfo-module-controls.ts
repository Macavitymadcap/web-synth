export class LFOModuleControls extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="lfo-module" title="LFO">
        <div slot="instructions">
          <p>The LFO modulates parameters like filter cutoff and pitch to add movement and variation to the sound.</p>

          <instruction-list>
            <instruction-item label="Waveform">Shape of the modulation wave</instruction-item>
            <instruction-item label="Rate">Speed of modulation (0.1 - 20 Hz)</instruction-item>
            <instruction-item label="To Filter">Amount of filter cutoff wobble (0 - 5000 Hz)</instruction-item>
            <instruction-item label="To Pitch">Amount of pitch vibrato (0 - 100 cents)</instruction-item>
          </instruction-list>
        </div>

        <div slot="content">
          <controls-group>
            <waveform-picker id="lfo-waveform" label="Waveform" value="sine"></waveform-picker>
            <range-control label="Rate" id="lfo-rate" min="0.1" max="20" step="0.1" value="5"
              formatter="hertz"></range-control>
            <range-control label="To Filter" id="lfo-to-filter" min="0" max="5000" step="10" value="0"
              formatter="hertz"></range-control>
            <range-control label="To Pitch" id="lfo-to-pitch" min="0" max="100" step="1" value="0"
              formatter="cents"></range-control>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('lfo-module', LFOModuleControls);