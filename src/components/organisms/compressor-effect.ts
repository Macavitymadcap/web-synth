export class CompressorEffect extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="compressor-effect" title="Compressor">
        <div slot="instructions">
          <p>The compressor controls the dynamic range, making quiet sounds louder and loud sounds quieter for a more
            polished output.</p>
          <instruction-list>
            <instruction-item label="Threshold">Level (dB) above which compression starts</instruction-item>
            <instruction-item label="Ratio">How much compression is applied above threshold</instruction-item>
            <instruction-item label="Attack">How quickly compression starts (seconds)</instruction-item>
            <instruction-item label="Release">How quickly compression stops (seconds)</instruction-item>
            <instruction-item label="Knee">Softness of the threshold curve (dB)</instruction-item>
          </instruction-list>
        </div>
        <div slot="content">
          <controls-group>
            <range-control label="Threshold" id="compressor-threshold" min="-60" max="0" step="1" value="-24"
              formatter="dB"></range-control>
            <range-control label="Ratio" id="compressor-ratio" min="1" max="20" step="0.1" value="4"></range-control>
            <range-control label="Attack" id="compressor-attack" min="0.001" max="1" step="0.001" value="0.003"
              formatter="seconds"></range-control>
            <range-control label="Release" id="compressor-release" min="0.01" max="1" step="0.01" value="0.25"
              formatter="seconds"></range-control>
            <range-control label="Knee" id="compressor-knee" min="0" max="40" step="1" value="30"
              formatter="dB"></range-control>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('compressor-effect', CompressorEffect);