export class SubsectionHeader extends HTMLElement {
  connectedCallback() {
    const text = this.getAttribute('text') || this.textContent || '';
    
    this.innerHTML = `
      <style>
        subsection-header h3 {
          color: var(--text-secondary);
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 1.5rem 0 0.75rem 0;
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
      </style>
      <h3>${text}</h3>
    `;
  }
}

customElements.define('subsection-header', SubsectionHeader);