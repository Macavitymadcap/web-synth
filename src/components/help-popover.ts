export class HelpPopover extends HTMLElement {
  connectedCallback() {
    const content = this.innerHTML;
    
    this.innerHTML = `
      <style>
        help-popover {
          display: contents;
        }
        
        help-popover .instructions {
          background: linear-gradient(135deg, #1a0033 0%, #0a0015 100%);
          border: 2px solid var(--neon-cyan);
          border-radius: 12px;
          padding: 1.5rem;
          max-width: 600px;
          box-shadow: 
            0 0 20px rgba(0, 255, 255, 0.5),
            0 10px 40px rgba(0, 0, 0, 0.8);
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
        }

        help-popover .instructions header h2 {
          margin: 0;
          color: var(--neon-cyan);
          font-size: 1.1rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        help-popover .instructions header button {
          background: linear-gradient(135deg, rgba(255, 0, 102, 0.3) 0%, rgba(200, 0, 80, 0.5) 100%);
          color: #ff0066;
          border: 2px solid #ff0066;
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          min-width: 2rem;
          min-height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.5rem;
          font-weight: bold;
          line-height: 0;
          padding: 0;
          margin: 0;
          transition: all 0.2s ease;
          flex-shrink: 0;
          box-shadow: 
            0 0 10px rgba(255, 0, 102, 0.5),
            0 2px 4px rgba(0, 0, 0, 0.3),
            inset 0 1px 2px rgba(255, 255, 255, 0.2),
            inset 0 -2px 4px rgba(0, 0, 0, 0.3);
          text-shadow: 0 0 5px #ff0066;
        }

        help-popover .instructions header button:hover {
          background: linear-gradient(135deg, rgba(255, 0, 102, 0.5) 0%, rgba(230, 0, 100, 0.7) 100%);
          transform: scale(1.1);
          box-shadow: 
            0 0 20px rgba(255, 0, 102, 0.8),
            0 2px 6px rgba(0, 0, 0, 0.4),
            inset 0 1px 3px rgba(255, 255, 255, 0.3),
            inset 0 -2px 5px rgba(0, 0, 0, 0.4);
        }

        help-popover .instructions header button:active {
          transform: scale(0.95);
          box-shadow: 
            0 0 15px rgba(255, 0, 102, 0.6),
            0 1px 2px rgba(0, 0, 0, 0.5),
            inset 0 2px 4px rgba(0, 0, 0, 0.5);
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
      </style>
      <article class="instructions" id="help-popover" popover>
        <header>
          <h2>Instructions & Features</h2>
          <button type="button" popovertarget="help-popover" popovertargetaction="hide" title="Close">×</button>
        </header>
        <div class="instructions-content">
          ${content}
        </div>
      </article>
    `;
  }
}

customElements.define('help-popover', HelpPopover);