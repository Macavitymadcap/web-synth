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
        oscillator-control .osc-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: flex-end;
          padding: 1.25rem;
          background: linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%);
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
        }

        oscillator-control .osc-label {
          display: flex;
          flex-direction: column;
          font-size: 0.75rem;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          gap: 0.5rem;
        }

        oscillator-control select {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #0a0a0a;
          color: #e0e0e0;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: border-color 0.2s ease;
        }

        oscillator-control select:hover {
          border-color: #4a9eff;
        }

        oscillator-control select:focus {
          outline: none;
          border-color: #4a9eff;
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
        }

        oscillator-control .remove-osc {
          padding: 0.5rem 1rem;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
        }

        oscillator-control .remove-osc:hover {
          background: #c82333;
          box-shadow: 0 3px 6px rgba(220, 53, 69, 0.5);
          transform: translateY(-1px);
        }
      </style>
      <div class="osc-container">
        <label class="osc-label">
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