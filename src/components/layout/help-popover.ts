const STYLE_ID = "help-popover-styles";

function ensureGlobalStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    help-popover {
      display: contents;
    }
      
      help-popover .instructions {
        background: linear-gradient(135deg, #1a0033 0%, #0a0015 100%);
        border: 2px solid var(--neon-cyan);
        border-radius: 12px;
        padding: 1.5rem;
        max-width: 90vw;
        max-height: 90vh;
        box-shadow: 
          0 0 20px rgba(0, 255, 255, 0.5),
          0 10px 40px rgba(0, 0, 0, 0.8);
        overflow: auto; /* Add this */
      }
    
      help-popover .instructions::backdrop {
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
      }
    
      help-popover .instructions header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid rgba(0, 255, 255, 0.3);
        position: sticky;
        top: 0; 
        background: inherit;
        z-index: 2;
      }
    
      help-popover .instructions header h2 {
        margin: 0;
        color: var(--neon-cyan);
        font-size: 1.1rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
    
      help-popover .instructions-content {
        color: var(--text-secondary);
        line-height: 1.6;
      }
    
      help-popover .instructions-content p {
        margin: 0 0 0.75rem 0;
      }
    
      help-popover .instructions-content p:last-child {
        margin-bottom: 0;
      }
    
      help-popover .instructions-content ul {
        line-height: 1.8;
      }
    
      help-popover .instructions-content strong {
        color: var(--accent-orange);
        text-shadow: 0 0 5px var(--accent-orange);
      }
  `;

  document.head.appendChild(style);
}

export class HelpPopover extends HTMLElement {
  connectedCallback() {
    ensureGlobalStyles();
    const content = this.innerHTML;
    
    this.innerHTML = `
      <article class="instructions" id="help-popover" popover>
        <header>
          <h2>Instructions & Features</h2>
          <neon-button 
            icon 
            variant="close" 
            size="md" 
            popovertarget="help-popover" 
            popovertargetaction="hide" 
            title="Close"
          >
            ×
          </neon-button>
        </header>
        <div class="instructions-content">
          ${content}
        </div>
      </article>
    `;
  }
}

customElements.define('help-popover', HelpPopover);