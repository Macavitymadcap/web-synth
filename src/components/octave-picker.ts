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
          text-shadow: 0 0 5px var(--text-secondary);
        }
        
        octave-picker .octave-select {
          padding: 0.5rem;
          background: rgba(10, 0, 21, 0.8);
          color: var(--text-primary);
          border: 2px solid var(--neon-cyan);
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 80px;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
          text-shadow: 0 0 5px var(--text-primary);
        }
        
        octave-picker .octave-select:hover {
          border-color: var(--neon-pink);
          background: rgba(26, 0, 51, 0.9);
          box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
        }
        
        octave-picker .octave-select:focus {
          outline: none;
          border-color: var(--neon-pink);
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.6);
        }
        
        octave-picker .octave-select option {
          background: #0a0015;
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