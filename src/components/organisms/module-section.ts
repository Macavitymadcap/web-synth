
const STYLE_ID = "module-section-styles";

function ensureGlobalStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    /* Module Container */
    .module {
      background: var(--module-bg);
      border: 2px solid var(--module-border);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--module-shadow);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      break-inside: avoid;
      page-break-inside: avoid;
    }

    .module:hover {
      box-shadow: 0 6px 30px rgba(255, 0, 255, 0.7), 0 0 60px rgba(0, 255, 255, 0.4);
      transform: translateY(-2px);
    }

    .module::before {
      content: '';
      position: absolute;
      inset: -2px;
      background: linear-gradient(45deg, #ff00ff, #00ffff, #ff00ff);
      border-radius: 12px;
      opacity: 0;
      z-index: -1;
      animation: glow-pulse 3s ease-in-out infinite;
    }

    @keyframes glow-pulse {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 0.6; }
    }

    .module::after {
      content: '';
      position: absolute;
      top: 12px;
      right: 12px;
      width: 8px;
      height: 8px;
      background: radial-gradient(circle, var(--neon-purple) 0%, #4a0066 100%);
      border-radius: 50%;
      box-shadow: 
        0 0 5px var(--neon-purple),
        inset 0 1px 2px rgba(0, 0, 0, 0.5);
    }

    /* Module Header */
    .module-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      user-select: none;
      margin-bottom: 0.5rem;
    }

    .module-header h2 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.2rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 3px;
      text-shadow: 
        0 0 10px var(--neon-cyan),
        0 0 20px var(--neon-cyan),
        0 0 30px var(--neon-cyan);
    }

    .module-header-controls {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    /* Content Wrapper */
    .module-content-wrapper {
      overflow: hidden;
      transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
      margin-top: 1rem;
    }

    .module-content-wrapper.expanded {
      max-height: 5000px;
      opacity: 1;
    }

    .module-content-wrapper.collapsed {
      max-height: 0;
      opacity: 0;
      margin-top: 0;
    }

    /* Instructions Popover */
    .instructions {
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

    .instructions::backdrop {
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
    }

    .instructions header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid rgba(0, 255, 255, 0.3);
      position: sticky;      /* Sticky header */
      top: 0;                /* Stick to top */
      background: inherit;   /* Keep background */
      z-index: 2;            /* Above content */
    }

    .instructions header h2 {
      margin: 0;
      color: var(--neon-cyan);
      font-size: 1.1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
    }

    .instructions header button {
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

    .instructions header button:hover {
      background: linear-gradient(135deg, rgba(255, 0, 102, 0.5) 0%, rgba(230, 0, 100, 0.7) 100%);
      transform: scale(1.1);
      box-shadow: 
        0 0 20px rgba(255, 0, 102, 0.8),
        0 2px 6px rgba(0, 0, 0, 0.4),
        inset 0 1px 3px rgba(255, 255, 255, 0.3),
        inset 0 -2px 5px rgba(0, 0, 0, 0.4);
    }

    .instructions header button:active {
      transform: scale(0.95);
      box-shadow: 
        0 0 15px rgba(255, 0, 102, 0.6),
        0 1px 2px rgba(0, 0, 0, 0.5),
        inset 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .instructions-content {
      padding: 1rem;
      padding-top: 1.25rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .instructions-content p {
      margin: 0 0 0.75rem 0;
    }

    .instructions-content p:last-child {
      margin-bottom: 0;
    }

    .instructions-content ul {
      line-height: 1.8;
    }

    .instructions-content strong {
      color: var(--accent-orange);
      text-shadow: 0 0 5px var(--accent-orange);
    }
  `;
  document.head.appendChild(style);
}


export class ModuleSection extends HTMLElement {
  private isExpanded: boolean = true;
  private contentWrapper: HTMLElement | null = null;
  private toggleButton: HTMLElement | null = null;

  connectedCallback() {
    ensureGlobalStyles();
    const title = this.getAttribute('title') || 'Module';
    const id = this.getAttribute('id') || '';
    
    // Restore collapsed state from localStorage
    const savedState = localStorage.getItem(`module-${id}-expanded`);
    const hasSavedState = savedState !== null;
    this.isExpanded = hasSavedState ? savedState === 'true' : true;

    // Store the slotted content
    const instructionsContent = this.querySelector('[slot="instructions"]');
    const mainContent = this.querySelector('[slot="content"]');

    this.innerHTML = `
      <div class="module">
        <div class="module-header">
          <h2>${title}</h2>
          <div class="module-header-controls">
            <neon-button 
              icon 
              popovertarget="${id}-instructions" 
              aria-label="Show instructions" 
              title="Show instructions"
            >
              ?
            </neon-button>
            <neon-button 
              icon 
              class="toggle-button"
              aria-label="Toggle module" 
              aria-expanded="${this.isExpanded}" 
              title="${this.isExpanded ? 'Collapse' : 'Expand'}"
            >
              ${this.isExpanded ? '−' : '+'}
            </neon-button>
          </div>
        </div>
        <div class="module-content-wrapper ${this.isExpanded ? 'expanded' : 'collapsed'}">
          <div class="module-content"></div>
        </div>
        <div id="${id}-instructions" popover class="instructions">
          <header>
            <h2>${title}</h2>
            <button popovertarget="${id}-instructions" popovertargetaction="hide" title="Close">×</button>
          </header>
          <div class="instructions-content"></div>
        </div>
      </div>
    `;

    // Re-append the slotted content
    const instructionsContainer = this.querySelector('.instructions-content');
    const contentContainer = this.querySelector('.module-content');
    
    if (instructionsContent && instructionsContainer) {
      instructionsContainer.appendChild(instructionsContent);
    }
    
    if (mainContent && contentContainer) {
      contentContainer.appendChild(mainContent);
    }

    this.contentWrapper = this.querySelector('.module-content-wrapper');
    this.toggleButton = this.querySelector('.toggle-button');
    
    this.toggleButton?.addEventListener('click', () => this.toggleCollapse());
    
    // Listen for global expand/collapse events
    this.addEventListener('collapse', () => {
      if (this.isExpanded) this.toggleCollapse();
    });
    
    this.addEventListener('expand', () => {
      if (!this.isExpanded) this.toggleCollapse();
    });
  }

  private toggleCollapse() {
    this.isExpanded = !this.isExpanded;
    
    if (this.contentWrapper) {
      this.contentWrapper.classList.toggle('expanded', this.isExpanded);
      this.contentWrapper.classList.toggle('collapsed', !this.isExpanded);
    }
    
    if (this.toggleButton) {
      const icon = this.toggleButton.querySelector('.toggle-icon');
      if (icon) icon.textContent = this.isExpanded ? '−' : '+';
      this.toggleButton.setAttribute('aria-expanded', String(this.isExpanded));
    }
    
    // Save state to localStorage
    const id = this.getAttribute('id');
    if (id) {
      localStorage.setItem(`module-${id}-expanded`, String(this.isExpanded));
    }
  }
}

customElements.define('module-section', ModuleSection);