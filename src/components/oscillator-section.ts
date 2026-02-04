export class OscillatorSection extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <style>
        oscillator-section {
          display: block;
        }
        
        oscillator-section .oscillator-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        oscillator-section button {
          padding: 0.75rem 1.5rem;
          background: var(--accent-green);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(46, 204, 113, 0.3);
          transition: all 0.2s ease;
        }
        
        oscillator-section button:hover {
          background: #27ae60;
          box-shadow: 0 4px 12px rgba(46, 204, 113, 0.5);
          transform: translateY(-1px);
        }
      </style>
      <div id="oscillator-list" class="oscillator-list"></div>
      <button id="add-oscillator">Add Oscillator</button>
    `;
  }
}

customElements.define('oscillator-section', OscillatorSection);