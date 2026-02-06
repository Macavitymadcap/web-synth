export class KeyboardMappingInfo extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        keyboard-mapping-info {
          display: block;
        }
        
        keyboard-mapping-info p {
          margin-top: 1rem;
        }
        
        keyboard-mapping-info ul {
          margin: 0.5rem 0;
        }
      </style>
      <p><strong>Keyboard Mapping:</strong></p>
      <ul>
        <li>Lower octave white keys: Z, X, C, V, B, N, M (C-B)</li>
        <li>Lower octave black keys: S, D, G, H, J (sharps/flats)</li>
        <li>Upper octave white keys: Q, W, E, R, T, Y, U (C-B)</li>
        <li>Upper octave black keys: 2, 3, 5, 6, 7 (sharps/flats)</li>
      </ul>
    `;
  }
}

customElements.define('keyboard-mapping-info', KeyboardMappingInfo);