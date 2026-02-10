export class LFOControls extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="lfo-controls" title="LFOs">
        <div slot="instructions">
          <p>LFOs (Low-Frequency Oscillators) modulate parameters over time to add movement and variation. You can add multiple LFOs for complex modulation patterns.</p>

          <instruction-list>
            <instruction-item label="Multiple LFOs">Add multiple LFOs for layered modulation effects</instruction-item>
            <instruction-item label="Waveform">Shape of the modulation wave (sine = smooth, square = stepped)</instruction-item>
            <instruction-item label="Rate">Speed of modulation (0.1 - 20 Hz)</instruction-item>
            <instruction-item label="To Filter">Amount of filter cutoff wobble (0 - 5000 Hz)</instruction-item>
            <instruction-item label="To Pitch">Amount of pitch vibrato (0 - 100 cents)</instruction-item>
          </instruction-list>
        </div>

        <div slot="content">
          <lfo-section></lfo-section>
        </div>
      </module-section>
    `;
  }
}

customElements.define('lfo-controls', LFOControls);