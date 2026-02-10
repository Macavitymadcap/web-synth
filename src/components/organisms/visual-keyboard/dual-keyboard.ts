export class DualKeyboard extends HTMLElement {
  connectedCallback() {
    const upperOctave = this.getAttribute('upper-octave') || '6';
    const lowerOctave = this.getAttribute('lower-octave') || '5';
    const upperKeys = this.getAttribute('upper-keys') || 'qwertyu,23567';
    const lowerKeys = this.getAttribute('lower-keys') || 'zxcvbnm,sdghj';

    this.innerHTML = `
      <piano-keyboard id="keyboard-upper" octave="${upperOctave}" keys="${upperKeys}"></piano-keyboard>
      <piano-keyboard id="keyboard-lower" octave="${lowerOctave}" keys="${lowerKeys}"></piano-keyboard>

      <controls-group>
        <octave-picker id="octave-upper" label="Upper Octave" value="${upperOctave}" min="3" max="6"></octave-picker>
        <octave-picker id="octave-lower" label="Lower Octave" value="${lowerOctave}" min="2" max="5"></octave-picker>   
      </controls-group>
    `;
  }
}

customElements.define('dual-keyboard', DualKeyboard);