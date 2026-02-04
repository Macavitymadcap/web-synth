export class ControlsGroup extends HTMLElement {
  connectedCallback() {
    const content = this.innerHTML;
    
    this.innerHTML = `
      <style>
        controls-group {
          display: block;
        }
        
        controls-group .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          align-items: center;
          justify-content: space-around;
          padding: 1rem;
          background: var(--panel-bg);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        controls-group .controls > * {
          flex: 0 1 auto;
          min-width: fit-content;
        }

        @media (max-width: 640px) {
          controls-group .controls {
            gap: 0.75rem;
            padding: 0.75rem;
          }
        }
      </style>
      <div class="controls">${content}</div>
    `;
  }
}

customElements.define('controls-group', ControlsGroup);