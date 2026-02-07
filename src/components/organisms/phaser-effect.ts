export class PhaserEffect extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="phaser-effect" title="Phaser">
        <div slot="instructions">
          <instructions-list>
            <instruction-item label="Rate">LFO speed for sweeping the notches.</instruction-item>
            <instruction-item label="Depth">How wide the notches sweep.</instruction-item>
            <instruction-item label="Stages">Number of allpass filter stages (2-8).</instruction-item>
            <instruction-item label="Feedback">Amount of output fed back into input for resonance.</instruction-item>
            <instruction-item label="Mix">Blend between dry and phased signal.</instruction-item>
          </instructions-list>
        </div>
        <div slot="content">
          <controls-group>
            <range-control label="Rate" id="phaser-rate" min="0.01" max="5" step="0.01" value="0.7" formatter="hertz"></range-control>
            <range-control label="Depth" id="phaser-depth" min="50" max="2000" step="1" value="700" formatter="hertz"></range-control>
            <range-control label="Stages" id="phaser-stages" min="2" max="8" step="1" value="4"></range-control>
            <range-control label="Feedback" id="phaser-feedback" min="0" max="0.9" step="0.01" value="0.3" formatter="percentage"></range-control>
            <range-control label="Mix" id="phaser-mix" min="0" max="1" step="0.01" value="0.5" formatter="percentage"></range-control>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('phaser-effect', PhaserEffect);