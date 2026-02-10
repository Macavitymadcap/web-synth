export class FlangerEffect extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="flanger-effect" title="Flanger">
        <div slot="instructions">
          <p>
            Flanger creates a sweeping, jet-plane-like effect by mixing the input signal with a delayed
            version of itself. The delay time is modulated by an LFO, creating characteristic comb 
            filtering and movement in the sound.
          </p>
          <instruction-list>
            <instruction-item label="Rate">LFO speed for sweep effect (0.1-10 Hz)</instruction-item>
            <instruction-item label="Depth">Intensity of delay modulation (0-10 ms)</instruction-item>
            <instruction-item label="Feedback">Amount fed back for resonance (0-95%)</instruction-item>
            <instruction-item label="Mix">Dry/wet balance (0-100%)</instruction-item>
          </instruction-list>
        </div>
        <div slot="content">
          <controls-group>
            <range-control 
              label="Rate" 
              id="flanger-rate" 
              min="0.1" 
              max="10" 
              step="0.1" 
              value="0.5"
              formatter="hertz">
            </range-control>
            <range-control 
              label="Depth" 
              id="flanger-depth" 
              min="0" 
              max="10" 
              step="0.1" 
              value="2">
            </range-control>
            <range-control 
              label="Feedback" 
              id="flanger-feedback" 
              min="0" 
              max="0.95" 
              step="0.01" 
              value="0.5"
              formatter="percentage">
            </range-control>
            <range-control 
              label="Mix" 
              id="flanger-mix" 
              min="0" 
              max="1" 
              step="0.01" 
              value="0.5"
              formatter="percentage">
            </range-control>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('flanger-effect', FlangerEffect);