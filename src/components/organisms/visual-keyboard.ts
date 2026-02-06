export class VisualKeyboard extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="visual-keyboard" title="Keyboard">
        <div slot="instructions">
          <p>These controls allow you to play notes using the visual keyboard or your computer keyboard.</p>

          <instruction-list>
            <instruction-item label="Keyboard">Use your computer keyboard to play notes</instruction-item>
            <instruction-item label="Mouse/Touch">Click or tap any key on the visual keyboard</instruction-item>
            <instruction-item label="Upper/Lower Octave">Use the dropdowns to change the octave of each
              keyboard</instruction-item>
          </instruction-list>

          <keyboard-mapping-info></keyboard-mapping-info>
        </div>

        <div slot="content">
          <dual-keyboard upper-octave="5" lower-octave="4" upper-keys="qwertyu,23567" lower-keys="zxcvbnm,sdghj">
          </dual-keyboard>
        </div>
      </module-section>
    `;
  }
}
customElements.define('visual-keyboard', VisualKeyboard);