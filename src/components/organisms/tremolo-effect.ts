export class TremoloEffect extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="tremolo-effect" title="Tremolo">
        <div slot="instructions">
          <p>The tremolo effect creates rhythmic volume modulation, producing a pulsating or wobbling amplitude.</p>

          <instruction-list>
            <instruction-item label="Rate">Speed of volume modulation (0.1 - 20 Hz). Higher values = faster tremolo</instruction-item>
            <instruction-item label="Depth">Intensity of volume change (0 - 100%). Higher = more pronounced effect</instruction-item>
          </instruction-list>
        </div>

        <div slot="content">
          <controls-group>
            <range-control label="Rate" id="tremolo-rate" min="0.1" max="20" step="0.1" value="5"
              formatter="hertz"></range-control>
            <range-control label="Depth" id="tremolo-depth" min="0" max="1" step="0.01" value="0.5"
              formatter="%"></range-control>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('tremolo-effect', TremoloEffect);