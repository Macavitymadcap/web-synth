export class OctavePicker extends HTMLElement {
  private select!: HTMLSelectElement;

  connectedCallback() {
    const id = this.getAttribute('id') || '';
    const label = this.getAttribute('label') || 'Octave';
    const value = this.getAttribute('value') || '4';
    const min = Number.parseInt(this.getAttribute('min') || '0');
    const max = Number.parseInt(this.getAttribute('max') || '8');
    
    let optionsHtml = '';
    for (let i = min; i <= max; i++) {
      optionsHtml += `<option value="${i}" ${value === String(i) ? 'selected' : ''}>${i}</option>`;
    }
    
    this.innerHTML = `
      <style>
        octave-picker {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        octave-picker .octave-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }
        
        octave-picker .octave-select {
          padding: 0.5rem;
          background: #0a0a0a;
          color: var(--text-primary);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 80px;
        }
        
        octave-picker .octave-select:hover {
          border-color: var(--accent-blue);
          background: #0f0f0f;
        }
        
        octave-picker .octave-select:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
        }
        
        octave-picker .octave-select option {
          background: #0a0a0a;
          color: var(--text-primary);
          padding: 0.5rem;
        }
      </style>
      <label class="octave-label">
        ${label}
        <select class="octave-select" id="${id}">
          ${optionsHtml}
        </select>
      </label>
    `;
    
    this.select = this.querySelector('.octave-select')!;
    
    // Listen for changes
    this.select.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('octavechange', {
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

customElements.define('octave-picker', OctavePicker);