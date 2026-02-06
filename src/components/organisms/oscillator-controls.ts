export class OscillatorControls extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="oscillator-controls" title="Oscillators">
        <div slot="instructions">
          <p>Oscillators are the primary sound sources in the synthesiser. You can add multiple oscillators to layer
            sounds and create richer tones.</p>

          <instruction-list>
            <instruction-item label="Multiple Oscillators">Add multiple oscillators to layer and create richer
              sounds</instruction-item>
            <instruction-item label="Waveform">Choose between Sine (smooth), Square (hollow), Sawtooth (bright), or
              Triangle (mellow)</instruction-item>
            <instruction-item label="Detune">Adjust frequency offset (-1200 to +1200 cents) for chorus and unison
              effects</instruction-item>
            <instruction-item label="Level">Control the volume/mix of each oscillator (0-100%)</instruction-item>
          </instruction-list>
        </div>

        <div slot="content">
          <oscillator-section></oscillator-section>
        </div> 
      </module-section>
    `;
  }
}
customElements.define('oscillator-controls', OscillatorControls);