export class FilterTypePicker extends HTMLElement {
  private select!: HTMLSelectElement;

  connectedCallback() {
    const id = this.getAttribute('id') || '';
    const label = this.getAttribute('label') || 'Filter Type';
    const value = this.getAttribute('value') || 'lowpass';
    
    this.innerHTML = `
      <style>
        filter-type-picker {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        filter-type-picker .filter-type-label {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          text-shadow: 0 0 5px var(--text-secondary);
        }
        
        filter-type-picker .filter-type-select {
          padding: 0.5rem;
          background: rgba(10, 0, 21, 0.8);
          color: var(--text-primary);
          border: 2px solid var(--neon-cyan);
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 120px;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
          text-shadow: 0 0 5px var(--text-primary);
        }
        
        filter-type-picker .filter-type-select:hover {
          border-color: var(--neon-pink);
          background: rgba(26, 0, 51, 0.9);
          box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
        }
        
        filter-type-picker .filter-type-select:focus {
          outline: none;
          border-color: var(--neon-pink);
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.6);
        }
        
        filter-type-picker .filter-type-select option {
          background: #0a0015;
          color: var(--text-primary);
          padding: 0.5rem;
        }
      </style>
      <label class="filter-type-label">
        ${label}
        <select class="filter-type-select" id="${id}">
          <option value="lowpass">Lowpass</option>
          <option value="highpass">Highpass</option>
          <option value="bandpass">Bandpass</option>
          <option value="notch">Notch</option>
          <option value="allpass">Allpass</option>
          <option value="peaking">Peaking</option>
          <option value="lowshelf">Low Shelf</option>
          <option value="highshelf">High Shelf</option>
        </select>
      </label>
    `;
    
    this.select = this.querySelector('.filter-type-select')!;
    
    // Listen for changes
    this.select.addEventListener('change', () => {
      this.dispatchEvent(new CustomEvent('filtertypechange', {
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

customElements.define('filter-type-picker', FilterTypePicker);