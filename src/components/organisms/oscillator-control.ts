import type { RangeControl } from '../atoms/range-control';

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
        oscillator-control {
          display: block;
        }

        oscillator-control .osc-label {
          display: flex;
          flex-direction: column;
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          gap: 0.5rem;
          flex: 0 1 auto;
          min-width: fit-content;
          text-shadow: 0 0 5px var(--text-secondary);
        }

        oscillator-control select {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: rgba(10, 0, 21, 0.8);
          color: var(--text-primary);
          border: 2px solid var(--neon-cyan);
          border-radius: 4px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
          text-shadow: 0 0 5px var(--text-primary);
        }

        oscillator-control select:hover {
          border-color: var(--neon-pink);
          background: rgba(26, 0, 51, 0.9);
          box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
        }

        oscillator-control select:focus {
          outline: none;
          border-color: var(--neon-pink);
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.6);
        }
        
        oscillator-control select option {
          background: #0a0015;
          color: var(--text-primary);
        }
      </style>
      <controls-group>
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
        
        <button class="danger">Remove</button>
      </controls-group>
    `;
    
    this.waveSelect = this.querySelector('.osc-wave')!;
    this.detuneControl = this.querySelector('.osc-detune') as RangeControl;
    this.levelControl = this.querySelector('.osc-level') as RangeControl;
    this.removeBtn = this.querySelector('button')!;

    // Assign ids so UIConfigService + OscillatorBank can discover them
    const idx = this.dataset.id;
    if (idx) {
      this.waveSelect.id = `osc-${idx}-waveform`;
      // UIConfigService.getInput unwraps RangeControl by id
      (this.detuneControl as unknown as HTMLElement).id = `osc-${idx}-detune`;
      (this.levelControl as unknown as HTMLElement).id = `osc-${idx}-level`;
    }
    
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