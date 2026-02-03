export class RangeControl extends HTMLElement {
  private input!: HTMLInputElement;
  private valueSpan!: HTMLSpanElement;

  connectedCallback() {
    const label = this.getAttribute('label') || '';
    const id = this.getAttribute('id') || '';
    const min = this.getAttribute('min') || '0';
    const max = this.getAttribute('max') || '100';
    const step = this.getAttribute('step') || '1';
    const value = this.getAttribute('value') || '0';
    
    this.innerHTML = `
      <style>
        range-control {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        range-control label {
          display: flex;
          flex-direction: column;
          font-size: 0.75rem;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          gap: 0.5rem;
        }
        
        range-control input[type="range"] {
          width: 100px;
          height: 6px;
          background: #0a0a0a;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 3px;
          outline: none;
          cursor: pointer;
          -webkit-appearance: none;
        }
        
        range-control input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(145deg, #4a9eff, #3a7ed0);
          border: 2px solid #2a5ea0;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          transition: all 0.1s ease;
        }
        
        range-control input[type="range"]::-webkit-slider-thumb:hover {
          background: linear-gradient(145deg, #5aaeff, #4a8ee0);
          box-shadow: 
            0 3px 6px rgba(74, 158, 255, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }
        
        range-control input[type="range"]::-webkit-slider-thumb:active {
          background: linear-gradient(145deg, #3a7ed0, #2a6ec0);
          transform: scale(0.95);
        }
        
        range-control input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: linear-gradient(145deg, #4a9eff, #3a7ed0);
          border: 2px solid #2a5ea0;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }
        
        range-control span {
          font-size: 0.85rem;
          color: #4a9eff;
          font-weight: 700;
          text-align: center;
          padding: 0.25rem 0.5rem;
          background: rgba(74, 158, 255, 0.1);
          border: 1px solid rgba(74, 158, 255, 0.3);
          border-radius: 3px;
          min-width: 60px;
        }
      </style>
      <label>
        ${label}
        <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">
        <span id="${id}-value"></span>
      </label>
    `;
    
    this.input = this.querySelector('input')!;
    this.valueSpan = this.querySelector('span')!;
    
    // Update display value
    this.updateValue();
    
    // Listen for changes
    this.input.addEventListener('input', () => {
      this.updateValue();
      // Dispatch custom event so parent can listen
      this.dispatchEvent(new CustomEvent('valuechange', {
        detail: { value: this.input.value },
        bubbles: true
      }));
    });
  }
  
  private updateValue() {
    const unit = this.getAttribute('unit') || '';
    const formatter = this.getAttribute('formatter');
    const value = Number.parseFloat(this.input.value);
    
    let displayValue = this.input.value;
    
    // Apply custom formatter if specified
    if (formatter === 'percentage') {
      displayValue = `${(value * 100).toFixed(0)}%`;
    } else if (formatter === 'hertz') {
      displayValue = `${value.toFixed(0)} Hz`;
    } else if (formatter === 'seconds') {
      displayValue = `${value.toFixed(3)}s`;
    } else if (formatter === 'cents') {
      displayValue = `${value.toFixed(0)} cents`;
    } else if (unit) {
      displayValue = `${value}${unit}`;
    }
    
    this.valueSpan.textContent = displayValue;
  }
  
  // Allow external code to get the input element
  getInput(): HTMLInputElement {
    return this.input;
  }
  
  // Allow setting value programmatically
  setValue(value: string | number) {
    this.input.value = String(value);
    this.updateValue();
  }
}

customElements.define('range-control', RangeControl);