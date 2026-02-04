export class WaveformPicker extends HTMLElement {
  private select!: HTMLSelectElement;

  connectedCallback() {
    const id = this.getAttribute('id') || '';
    const label = this.getAttribute('label') || 'Waveform';
    const value = this.getAttribute('value') || 'sine';
    
    this.innerHTML = `
      <style>
        waveform-picker {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        waveform-picker .waveform-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        
        waveform-picker .waveform-select {
          padding: 0.5rem;
          background: #0a0a0a;
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 120px;
        }
        
        waveform-picker .waveform-select:hover {
          border-color: var(--accent-blue);
          background: #0f0f0f;
        }
        
        waveform-picker .waveform-select:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
        }
        
        waveform-picker .waveform-select option {
          background: #0a0a0a;
          color: var(--text-primary);
          padding: 0.5rem;
        }
      </style>
      <label class="waveform-label">
        ${label}
        <select class="waveform-select" id="${id}">
          <option value="sine" ${value === 'sine' ? 'selected' : ''}>Sine</option>
          <option value="square" ${value === 'square' ? 'selected' : ''}>Square</option>
          <option value="sawtooth" ${value === 'sawtooth' ? 'selected' : ''}>Sawtooth</option>
          <option value="triangle" ${value === 'triangle' ? 'selected' : ''}>Triangle</option>
        </select>
      </label>
    `;
    
    this.select = this.querySelector('.waveform-select')!;
    
    // Listen for changes
    this.select.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('waveformchange', {
        detail: { value: this.select.value },
        bubbles: true
      }));
    });
  }
  
  // Allow external code to get the select element
  getSelect(): HTMLSelectElement {
    return this.select;
  }
  
  // Allow getting/setting value
  get value(): string {
    return this.select.value;
  }
  
  set value(val: string) {
    this.select.value = val;
  }
}

customElements.define('waveform-picker', WaveformPicker);