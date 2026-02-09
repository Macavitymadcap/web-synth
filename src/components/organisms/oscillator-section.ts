import { OscillatorConfig } from "../../core/oscillator-bank";

export class OscillatorSection extends HTMLElement {
  private oscillators: OscillatorConfig[] = [];
  private nextId: number = 1;
  private readonly maxOscillators: number = 4;

  connectedCallback() {
    this.innerHTML = `
      <style>
        oscillator-section {
          display: block;
        }
        
        oscillator-section .oscillator-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }
      </style>
      <div id="oscillator-list" class="oscillator-list"></div>
      <button id="add-oscillator" class="secondary">Add Oscillator</button>
    `;

    // Add initial oscillator
    this.addOscillatorControl();

    // Setup add button
    const addButton = this.querySelector("#add-oscillator");
    addButton?.addEventListener("click", () => this.addOscillatorControl());
  }

  private addOscillatorControl(waveform: OscillatorType = "sawtooth", detune: number = 0, level: number = 1): void {
    if (this.oscillators.length >= this.maxOscillators) {
      return;
    }

    const id = this.nextId++;
    
    const oscillator: OscillatorConfig = {
      id,
      waveform,
      detune,
      level
    };
    
    this.oscillators.push(oscillator);
    
    const control = document.createElement("oscillator-control");
    control.dataset.id = id.toString();
    control.setAttribute("waveform", waveform);
    control.setAttribute("detune", detune.toString());
    control.setAttribute("level", level.toString());
    
    // Listen for remove events
    control.addEventListener("remove", (e: Event) => {
      const customEvent = e as CustomEvent;
      this.removeOscillator(customEvent.detail?.id ?? id);
    });
    
    // Listen for config changes from the child component
    control.addEventListener("configchange", (e: Event) => {
      const cfg = (e as CustomEvent).detail;
      this.updateOscillatorConfig(id, cfg);
    });
    
    const container = this.querySelector("#oscillator-list");
    container?.appendChild(control);
    
    this.updateAddButtonState();
    this.dispatchChangeEvent();
  }

  private updateOscillatorConfig(id: number, cfg: { waveform: OscillatorType; detune: number; level: number }): void {
    const oscillator = this.oscillators.find(osc => osc.id === id);
    if (oscillator) {
      oscillator.waveform = cfg.waveform;
      oscillator.detune = cfg.detune;
      oscillator.level = cfg.level;
      this.dispatchChangeEvent();
    }
  }

  private removeOscillator(id: number): void {
    this.oscillators = this.oscillators.filter(osc => osc.id !== id);
    
    const control = this.querySelector(`oscillator-control[data-id="${id}"]`);
    control?.remove();
    
    this.updateAddButtonState();
    this.dispatchChangeEvent();
  }

  private updateAddButtonState(): void {
    const addButton = this.querySelector("#add-oscillator") as HTMLButtonElement;
    if (addButton) {
      addButton.disabled = this.oscillators.length >= this.maxOscillators;
    }
  }

  private dispatchChangeEvent(): void {
    this.dispatchEvent(new CustomEvent("oscillators-changed", {
      detail: { oscillators: this.getOscillators() },
      bubbles: true
    }));
  }

  clearAll(): void {
    // Remove all oscillator controls
    const controls = this.querySelectorAll("oscillator-control");
    controls.forEach(control => control.remove());
    
    this.oscillators = [];
    this.nextId = 1;
  }

  addOscillator(waveform: OscillatorType = "sawtooth", detune: number = 0, level: number = 1): void {
    this.addOscillatorControl(waveform, detune, level);
  }

  getOscillators(): OscillatorConfig[] {
    // Return oscillators without the id field for the oscillator bank
    return this.oscillators.map(({ waveform, detune, level }) => ({
      waveform,
      detune,
      level
    }));
  }
}

customElements.define('oscillator-section', OscillatorSection);