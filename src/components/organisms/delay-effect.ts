export class DelayEffect extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="delay-effect" title="Delay">
        <div slot="instructions">
          <p>The delay effect creates echoes of the sound, adding depth and space to your audio.</p>

          <instruction-list>
            <instruction-item label="Time">Delay time in seconds (0 - 2s)</instruction-item>
            <instruction-item label="Feedback">How much the delay repeats (0 - 95%)</instruction-item>
            <instruction-item label="Mix">Balance between dry (original) and wet (delayed) signal (0 -
              100%)</instruction-item>
          </instruction-list>
        </div>

        <div slot="content">
          <controls-group>
            <range-control label="Time" id="delay-time" min="0" max="2" step="0.01" value="0.375"
              formatter="s"></range-control>
            <range-control label="Feedback" id="delay-feedback" min="0" max="0.95" step="0.01" value="0.3"
              formatter="%"></range-control>
            <range-control label="Mix" id="delay-mix" min="0" max="1" step="0.01" value="0.2"
              formatter="%"></range-control>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('delay-effect', DelayEffect);