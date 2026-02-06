export class FilterModuleControls extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="filter-module" title="Filter">
        <div slot="instructions">
          <p>The filter shapes the tonal quality of the sound by cutting off frequencies above a certain point. You can
            adjust the type, cutoff frequency, resonance, and how the filter envelope modulates the cutoff over time.</p>

          <instruction-list>
            <instruction-item label="Filter Type">Choose between Lowpass, Highpass, Bandpass, Notch, Allpass, Lowshelf,
              Highshelf, or Peaking filter types</instruction-item>
            <instruction-item label="Cutoff">Frequency where filter starts cutting (20Hz - 20kHz). Lower = darker
              sound</instruction-item>
            <instruction-item label="Resonance">Emphasis at cutoff frequency (0.1 - 30). Higher = more pronounced
              peak</instruction-item>
            <instruction-item label="Envelope Amount">How much the filter envelope modulates cutoff (0 - 10000
              Hz)</instruction-item>
            <instruction-item label="Filter Envelope">Separate ADSR for filter cutoff modulation over
              time</instruction-item>
          </instruction-list>
        </div>

        <div slot="content">
          <controls-group>
            <filter-type-picker id="filter-type" label="Filter Type" value="lowpass"></filter-type-picker>
            <range-control label="Cutoff" id="filter-cutoff" min="20" max="20000" step="1" value="2000"></range-control>
            <range-control label="Resonance" id="filter-resonance" min="0.1" max="30" step="0.1"
              value="1"></range-control>
            <range-control label="Envelope Amount" id="filter-env-amount" min="0" max="10000" step="10"
              value="2000"></range-control>
          </controls-group>

          <subsection-header text="Filter Envelope"></subsection-header>
          <adsr-controls prefix="filter-" attack="0.1" decay="0.3" sustain="0.5" release="0.5"></adsr-controls>
        </div>
      </module-section>
    `;
  }
}
customElements.define('filter-module', FilterModuleControls);