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