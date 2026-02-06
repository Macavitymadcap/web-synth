export class ADSRModule extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="adsr-module" title="ADSR">
        <div slot="instructions">
          <p>The amplitude envelope shapes the volume of the sound over time using four stages: Attack, Decay, Sustain,
            and Release.</p>

          <instruction-list>
            <instruction-item label="Attack">How quickly the note reaches full volume (0.001s - 2s)</instruction-item>
            <instruction-item label="Decay">How quickly it falls to sustain level after attack</instruction-item>
            <instruction-item label="Sustain">The held volume level while note is pressed (0-100%)</instruction-item>
            <instruction-item label="Release">How quickly the note fades after release (0.01s - 3s)</instruction-item>
          </instruction-list>
        </div>

        <div slot="content">
          <adsr-controls prefix="" attack="0.01" decay="0.01" sustain="0.7" release="0.5"></adsr-controls>
        </div>
      </module-section>
    `;
  }
}
customElements.define('adsr-module', ADSRModule);