const STYLE_ID = 'app-header-styles';

function ensureGlobalStyles() {
  if (document.getElementById(STYLE_ID)) return;
  
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
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
      letter-spacing: 4px;
      text-shadow: 
        0 0 20px var(--accent-orange),
        0 0 40px var(--accent-orange),
        0 0 60px rgba(255, 51, 102, 0.5),
        0 2px 4px rgba(0, 0, 0, 0.8);
    }
  `
  document.head.appendChild(style);
}

export class AppHeader extends HTMLElement {
  connectedCallback() {
    ensureGlobalStyles();
    const title = this.getAttribute('title') || 'Web Synth';
    
    this.innerHTML = `
      <header>
        <h1>${title}</h1>
        <neon-button 
          icon 
          id="help-button" 
          type="button" 
          popovertarget="help-popover" 
          title="Help"
        >
          ?
        </neon-button>
      </header>
    `;
  }
}

customElements.define('app-header', AppHeader);