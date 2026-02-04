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
          padding: 1rem;
          background: var(--panel-bg);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
      </style>
      <div class="controls">${content}</div>
    `;
  }
}

customElements.define('controls-group', ControlsGroup);