export class ChorusEffect extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="chorus-effect" title="Chorus">
        <div slot="instructions">
          <p>The chorus effect creates a thicker, richer sound by layering multiple delayed and detuned copies of the
            signal with modulation.</p>

          <instruction-list>
            <instruction-item label="Rate">Speed of the modulation LFO (0.1 - 5 Hz). Faster = more pronounced
              effect</instruction-item>
            <instruction-item label="Depth">Amount of delay time modulation (0 - 50 ms). Higher = wider stereo and more
              detuning</instruction-item>
            <instruction-item label="Mix">Balance between dry (original) and wet (chorus) signal (0 -
              100%)</instruction-item>
          </instruction-list>
        </div>

        <div slot="content">
          <controls-group>
            <range-control label="Rate" id="chorus-rate" min="0.1" max="5" step="0.1" value="0.5"
              formatter="hertz"></range-control>
            <range-control label="Depth" id="chorus-depth" min="0" max="50" step="1" value="20"></range-control>
            <range-control label="Mix" id="chorus-mix" min="0" max="1" step="0.01" value="0.3"
              formatter="%"></range-control>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('chorus-effect', ChorusEffect);