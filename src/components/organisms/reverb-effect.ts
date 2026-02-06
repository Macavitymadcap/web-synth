export class ReverbEffect extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="reverb-effect" title="Reverb">
        <div slot="instructions">
          <p>The reverb effect adds realistic room ambience and spatial depth to your sound by simulating reflections in
            an acoustic space.</p>

          <instruction-list>
            <instruction-item label="Decay">Length of reverb tail in seconds (0.1 - 5s). Longer = larger
              space</instruction-item>
            <instruction-item label="Mix">Balance between dry (original) and wet (reverb) signal (0 -
              100%)</instruction-item>
          </instruction-list>
        </div>

        <div slot="content">
          <controls-group>
            <range-control label="Decay" id="reverb-decay" min="0.1" max="5" step="0.1" value="2"
              formatter="s"></range-control>
            <range-control label="Mix" id="reverb-mix" min="0" max="1" step="0.01" value="0.3"
              formatter="%"></range-control>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('reverb-effect', ReverbEffect);