export class ToggleSwitch extends HTMLElement {
  private checkbox!: HTMLInputElement;
  private labelSpan!: HTMLSpanElement;
  private labelConfig!: { type: 'static' | 'dynamic'; staticText?: string; onText?: string; offText?: string };

  connectedCallback() {
    const id = this.getAttribute('id') || '';
    const checked = this.hasAttribute('checked');
    
    // Determine label configuration
    this.labelConfig = this.getLabelConfig();
    
    this.innerHTML = `
      <style>
        toggle-switch {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          user-select: none;
        }
        
        toggle-switch .toggle-container {
          position: relative;
          width: 56px;
          height: 28px;
          cursor: pointer;
        }
        
        toggle-switch input[type="checkbox"] {
          opacity: 0;
          width: 0;
          height: 0;
          position: absolute;
        }
        
        toggle-switch .toggle-track {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, #1a0033 0%, #0a0015 100%);
          border: 2px solid rgba(255, 0, 255, 0.4);
          border-radius: 14px;
          transition: all 0.3s ease;
          box-shadow: 
            inset 0 2px 8px rgba(0, 0, 0, 0.8),
            0 0 10px rgba(255, 0, 255, 0.3);
        }
        
        toggle-switch input:checked + .toggle-track {
          background: linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(0, 204, 109, 0.3) 100%);
          border-color: var(--accent-green);
          box-shadow: 
            inset 0 2px 8px rgba(0, 0, 0, 0.5),
            0 0 20px rgba(0, 255, 136, 0.6),
            0 0 30px rgba(0, 255, 136, 0.4);
        }
        
        toggle-switch .toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: linear-gradient(145deg, var(--neon-pink), #cc00cc);
          border: 1px solid var(--neon-pink);
          border-radius: 50%;
          transition: all 0.3s ease;
          box-shadow: 
            0 0 15px rgba(255, 0, 255, 0.8),
            0 2px 6px rgba(0, 0, 0, 0.5),
            inset 0 1px 2px rgba(255, 255, 255, 0.3);
        }
        
        toggle-switch input:checked + .toggle-track .toggle-thumb {
          transform: translateX(28px);
          background: linear-gradient(145deg, var(--accent-green), #00cc6d);
          border-color: var(--accent-green);
          box-shadow: 
            0 0 20px rgba(0, 255, 136, 1),
            0 0 30px rgba(0, 255, 136, 0.6),
            0 2px 8px rgba(0, 0, 0, 0.6),
            inset 0 1px 2px rgba(255, 255, 255, 0.4);
        }
        
        toggle-switch .toggle-track:hover {
          border-color: var(--neon-cyan);
          box-shadow: 
            inset 0 2px 8px rgba(0, 0, 0, 0.8),
            0 0 15px rgba(0, 255, 255, 0.5);
        }
        
        toggle-switch input:checked + .toggle-track:hover {
          border-color: var(--neon-cyan);
          box-shadow: 
            inset 0 2px 8px rgba(0, 0, 0, 0.5),
            0 0 25px rgba(0, 255, 136, 0.8),
            0 0 40px rgba(0, 255, 255, 0.4);
        }
        
        toggle-switch input:focus + .toggle-track {
          border-color: var(--neon-cyan);
          box-shadow: 
            inset 0 2px 8px rgba(0, 0, 0, 0.8),
            0 0 20px rgba(0, 255, 255, 0.8);
        }
        
        toggle-switch .toggle-label {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-shadow: 0 0 5px var(--text-secondary);
        }
        
        toggle-switch input:checked ~ .toggle-label {
          color: var(--accent-green);
          text-shadow: 
            0 0 10px var(--accent-green),
            0 0 20px rgba(0, 255, 136, 0.5);
        }
      </style>
      <label class="toggle-container">
        <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
        <span class="toggle-track">
          <span class="toggle-thumb"></span>
        </span>
      </label>
      <span class="toggle-label"></span>
    `;
    
    this.checkbox = this.querySelector('input')!;
    this.labelSpan = this.querySelector('.toggle-label')!;
    
    // Update label based on state
    this.updateLabel();
    
    // Listen for changes
    this.checkbox.addEventListener('change', () => {
      this.updateLabel();
      
      // Dispatch custom event
      this.dispatchEvent(new CustomEvent('togglechange', {
        detail: { checked: this.checkbox.checked },
        bubbles: true
      }));
    });
  }
  
  private getLabelConfig() {
    const hasStaticLabel = this.hasAttribute('label') && !this.hasAttribute('label-on') && !this.hasAttribute('label-off');
    
    if (hasStaticLabel) {
      return {
        type: 'static' as const,
        staticText: this.getAttribute('label') || 'Toggle'
      };
    }
    
    return {
      type: 'dynamic' as const,
      onText: this.getAttribute('label-on') || this.getAttribute('label') || 'On',
      offText: this.getAttribute('label-off') || this.getAttribute('label') || 'Off'
    };
  }
  
  private updateLabel() {
    if (this.labelConfig.type === 'static') {
      this.updateStaticLabel();
    } else {
      this.updateDynamicLabel();
    }
  }
  
  private updateStaticLabel() {
    this.labelSpan.textContent = this.labelConfig.staticText!;
  }
  
  private updateDynamicLabel() {
    this.labelSpan.textContent = this.checkbox.checked 
      ? this.labelConfig.onText! 
      : this.labelConfig.offText!;
  }
  
  // Allow external code to get the checkbox element
  getCheckbox(): HTMLInputElement {
    return this.checkbox;
  }
  
  // Allow getting/setting checked state
  get checked(): boolean {
    return this.checkbox.checked;
  }
  
  set checked(value: boolean) {
    this.checkbox.checked = value;
    this.labelConfig = this.getLabelConfig();
    this.updateLabel();
  }
}

customElements.define('toggle-switch', ToggleSwitch);