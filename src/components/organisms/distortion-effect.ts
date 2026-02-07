export class WaveshaperEffect extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="distortion-effect" title="Distortion">
        <div slot="instructions">
          <p>Adds harmonic distortion for warmth or grit. Adjust drive for intensity and blend for wet/dry mix.</p>
          <instruction-list>
            <instruction-item label="Drive">Amount of distortion (0-10)</instruction-item>
            <instruction-item label="Blend">Wet/dry mix (0-100%)</instruction-item>
          </instruction-list>
        </div>
        <div slot="content">
          <controls-group>
            <range-control label="Drive" id="distortion-drive" min="0" max="10" step="0.1" value="2"></range-control>
            <range-control label="Blend" id="distortion-blend" min="0" max="1" step="0.01" value="0.5"
              formatter="%"></range-control>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('distortion-effect', WaveshaperEffect);