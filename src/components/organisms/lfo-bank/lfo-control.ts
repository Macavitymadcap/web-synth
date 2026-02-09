import type { RangeControl } from '../../atoms/range-control';

export class LFOControl extends HTMLElement {
  private waveSelect!: HTMLSelectElement;
  private rateControl!: RangeControl;
  private toFilterControl!: RangeControl;
  private toPitchControl!: RangeControl;
  private removeBtn!: HTMLButtonElement;

  connectedCallback() {
    const waveform = this.getAttribute('waveform') || 'sine';
    const rate = this.getAttribute('rate') || '5';
    const toFilter = this.getAttribute('to-filter') || '0';
    const toPitch = this.getAttribute('to-pitch') || '0';

    this.innerHTML = `
      <style>
        lfo-control {
          display: block;
        }

        lfo-control .lfo-label {
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

        lfo-control select {
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

        lfo-control select:hover {
          border-color: var(--neon-pink);
          background: rgba(26, 0, 51, 0.9);
          box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
        }

        lfo-control select:focus {
          outline: none;
          border-color: var(--neon-pink);
          box-shadow: 0 0 20px rgba(255, 0, 255, 0.6);
        }
        
        lfo-control select option {
          background: #0a0015;
          color: var(--text-primary);
        }
      </style>
      <controls-group>
        <label class="lfo-label">
          Waveform
          <select class="lfo-wave">
            <option value="sine" ${waveform === "sine" ? "selected" : ""}>Sine</option>
            <option value="square" ${waveform === "square" ? "selected" : ""}>Square</option>
            <option value="sawtooth" ${waveform === "sawtooth" ? "selected" : ""}>Sawtooth</option>
            <option value="triangle" ${waveform === "triangle" ? "selected" : ""}>Triangle</option>
          </select>
        </label>
        
        <range-control
          label="Rate"
          class="lfo-rate"
          min="0.1"
          max="20"
          step="0.1"
          value="${rate}"
          formatter="hertz">
        </range-control>
        
        <range-control
          label="To Filter"
          class="lfo-to-filter"
          min="0"
          max="5000"
          step="10"
          value="${toFilter}"
          formatter="hertz">
        </range-control>
        
        <range-control
          label="To Pitch"
          class="lfo-to-pitch"
          min="0"
          max="100"
          step="1"
          value="${toPitch}"
          formatter="cents">
        </range-control>
        
        <button class="danger">Remove</button>
      </controls-group>
    `;
    
    this.waveSelect = this.querySelector('.lfo-wave')!;
    this.rateControl = this.querySelector('.lfo-rate') as RangeControl;
    this.toFilterControl = this.querySelector('.lfo-to-filter') as RangeControl;
    this.toPitchControl = this.querySelector('.lfo-to-pitch') as RangeControl;
    this.removeBtn = this.querySelector('button')!;

    // Assign ids so UIConfigService + LFOModule can discover them
    const idx = this.dataset.id;
    if (idx) {
      this.waveSelect.id = `lfo-${idx}-waveform`;
      (this.rateControl as unknown as HTMLElement).id = `lfo-${idx}-rate`;
      (this.toFilterControl as unknown as HTMLElement).id = `lfo-${idx}-to-filter`;
      (this.toPitchControl as unknown as HTMLElement).id = `lfo-${idx}-to-pitch`;
    }
    
    // Listen for changes and dispatch custom event
    this.waveSelect.addEventListener('change', () => this.notifyChange());
    this.rateControl.addEventListener('valuechange', () => this.notifyChange());
    this.toFilterControl.addEventListener('valuechange', () => this.notifyChange());
    this.toPitchControl.addEventListener('valuechange', () => this.notifyChange());
    
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
      rate: Number.parseFloat(this.rateControl.getInput().value),
      toFilter: Number.parseFloat(this.toFilterControl.getInput().value),
      toPitch: Number.parseFloat(this.toPitchControl.getInput().value)
    };
  }
  
  setConfig(config: { waveform: OscillatorType; rate: number; toFilter: number; toPitch: number }) {
    this.waveSelect.value = config.waveform;
    this.rateControl.setValue(config.rate);
    this.toFilterControl.setValue(config.toFilter);
    this.toPitchControl.setValue(config.toPitch);
  }
}

customElements.define('lfo-control', LFOControl);