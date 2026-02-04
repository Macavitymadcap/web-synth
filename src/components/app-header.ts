export class AppHeader extends HTMLElement {
  connectedCallback() {
    const title = this.getAttribute('title') || 'Web Synth';
    
    this.innerHTML = `
      <style>
        app-header {
          display: block;
        }
        
        app-header header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1rem 1.5rem;
          background: var(--module-bg);
          border: 2px solid var(--module-border);
          border-radius: 8px;
          box-shadow: var(--module-shadow);
        }
        
        app-header h1 {
          margin: 0;
          color: var(--accent-orange);
          font-size: 2rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        
        app-header button {
          background: var(--accent-blue);
          color: white;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(74, 158, 255, 0.3);
          transition: all 0.2s ease;
        }
        
        app-header button:hover {
          background: #3a8eef;
          box-shadow: 0 4px 12px rgba(74, 158, 255, 0.5);
          transform: translateY(-1px);
        }
      </style>
      <header>
        <h1>${title}</h1>
        <button id="help-button" type="button" popovertarget="help-popover">Info</button>
      </header>
    `;
  }
}

customElements.define('app-header', AppHeader);