import type { RangeControl } from './range-control';

export class OscillatorControl extends HTMLElement {
  private waveSelect!: HTMLSelectElement;
  private detuneControl!: RangeControl;
  private levelControl!: RangeControl;
  private removeBtn!: HTMLButtonElement;

  connectedCallback() {
    const waveform = this.getAttribute('waveform') || 'sine';
    const detune = this.getAttribute('detune') || '0';
    const level = this.getAttribute('level') || '1';
    
    this.innerHTML = `
      <style>
        .oscillator-item {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: flex-end;
          padding: 1rem;
          background: #f7f7f8;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        .oscillator-item label {
          display: flex;
          flex-direction: column;
          font-size: .9rem;
          gap: 0.25rem;
        }

        .oscillator-item select,
        .oscillator-item input[type="range"] {
          margin-top: 0.25rem;
        }

        .oscillator-item .detune-value,
        .oscillator-item .level-value {
          font-size: 0.8rem;
          color: #666;
          margin-top: 0.125rem;
        }

        .oscillator-item button {
          padding: 0.5rem 1rem;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .oscillator-item button:hover {
          background: #c82333;
        }
      </style>
      <div class="oscillator-item">
        <label>
          Waveform
          <select class="osc-wave">
            <option value="sine" ${waveform === "sine" ? "selected" : ""}>Sine</option>
            <option value="square" ${waveform === "square" ? "selected" : ""}>Square</option>
            <option value="sawtooth" ${waveform === "sawtooth" ? "selected" : ""}>Sawtooth</option>
            <option value="triangle" ${waveform === "triangle" ? "selected" : ""}>Triangle</option>
          </select>
        </label>
        
        <range-control
          label="Detune"
          class="osc-detune"
          min="-1200"
          max="1200"
          step="1"
          value="${detune}"
          formatter="cents">
        </range-control>
        
        <range-control
          label="Level"
          class="osc-level"
          min="0"
          max="1"
          step="0.01"
          value="${level}"
          formatter="percentage">
        </range-control>
        
        <button class="remove-osc">Remove</button>
      </div>
    `;
    
    this.waveSelect = this.querySelector('.osc-wave')!;
    this.detuneControl = this.querySelector('.osc-detune') as RangeControl;
    this.levelControl = this.querySelector('.osc-level') as RangeControl;
    this.removeBtn = this.querySelector('.remove-osc')!;
    
    // Listen for changes and dispatch custom event
    this.waveSelect.addEventListener('change', () => this.notifyChange());
    this.detuneControl.addEventListener('valuechange', () => this.notifyChange());
    this.levelControl.addEventListener('valuechange', () => this.notifyChange());
    
    this.removeBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('remove', { bubbles: true }));
    });
  }
  
  private notifyChange() {
    this.dispatchEvent(new CustomEvent('configchange', {
      detail: this.getConfig(),
      bubbles: true
    }));
  }
  
  getConfig() {
    return {
      waveform: this.waveSelect.value as OscillatorType,
      detune: Number.parseFloat(this.detuneControl.getInput().value),
      level: Number.parseFloat(this.levelControl.getInput().value)
    };
  }
  
  setConfig(config: { waveform: OscillatorType; detune: number; level: number }) {
    this.waveSelect.value = config.waveform;
    this.detuneControl.setValue(config.detune);
    this.levelControl.setValue(config.level);
  }
}

customElements.define('oscillator-control', OscillatorControl);