export type LFOConfig = {
  id: number;
  waveform: OscillatorType;
  rate: number;
  toFilter: number;
  toPitch: number;
};

export class LFOSection extends HTMLElement {
  private lfos: LFOConfig[] = [];
  private nextId: number = 1;
  private readonly maxLFOs: number = 4;

  connectedCallback() {
    this.innerHTML = `
      <style>
        lfo-section {
          display: block;
        }
        
        lfo-section .lfo-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1rem;
        }
      </style>
      <div id="lfo-list" class="lfo-list"></div>
      <button id="add-lfo" class="secondary">Add LFO</button>
    `;

    // Add initial LFO
    this.addLFOControl();

    // Setup add button
    const addButton = this.querySelector("#add-lfo");
    addButton?.addEventListener("click", () => this.addLFOControl());
  }

  private addLFOControl(
    waveform: OscillatorType = "sine",
    rate: number = 5,
    toFilter: number = 0,
    toPitch: number = 0
  ): void {
    if (this.lfos.length >= this.maxLFOs) {
      return;
    }

    const id = this.nextId++;
    
    const lfo: LFOConfig = {
      id,
      waveform,
      rate,
      toFilter,
      toPitch
    };
    
    this.lfos.push(lfo);
    
    const control = document.createElement("lfo-control");
    control.dataset.id = id.toString();
    control.setAttribute("waveform", waveform);
    control.setAttribute("rate", rate.toString());
    control.setAttribute("to-filter", toFilter.toString());
    control.setAttribute("to-pitch", toPitch.toString());
    
    // Listen for remove events
    control.addEventListener("remove", (e: Event) => {
      const customEvent = e as CustomEvent;
      this.removeLFO(customEvent.detail?.id ?? id);
    });
    
    // Listen for config changes from the child component
    control.addEventListener("configchange", (e: Event) => {
      const cfg = (e as CustomEvent).detail;
      this.updateLFOConfig(id, cfg);
    });
    
    const container = this.querySelector("#lfo-list");
    container?.appendChild(control);
    
    this.updateAddButtonState();
    this.dispatchChangeEvent();
  }

  private updateLFOConfig(id: number, cfg: { waveform: OscillatorType; rate: number; toFilter: number; toPitch: number }): void {
    const lfo = this.lfos.find(l => l.id === id);
    if (lfo) {
      lfo.waveform = cfg.waveform;
      lfo.rate = cfg.rate;
      lfo.toFilter = cfg.toFilter;
      lfo.toPitch = cfg.toPitch;
      this.dispatchChangeEvent();
    }
  }

  private removeLFO(id: number): void {
    // Don't allow removing last LFO
    if (this.lfos.length <= 1) return;
    
    this.lfos = this.lfos.filter(l => l.id !== id);
    
    const control = this.querySelector(`lfo-control[data-id="${id}"]`);
    control?.remove();
    
    this.updateAddButtonState();
    this.dispatchChangeEvent();
  }

  private updateAddButtonState(): void {
    const addButton = this.querySelector("#add-lfo") as HTMLButtonElement;
    if (addButton) {
      addButton.disabled = this.lfos.length >= this.maxLFOs;
    }
  }

  private dispatchChangeEvent(): void {
    this.dispatchEvent(new CustomEvent("lfos-changed", {
      detail: { lfos: this.getLFOs() },
      bubbles: true
    }));
  }

  clearAll(): void {
    // Remove all LFO controls except the first one
    const controls = this.querySelectorAll("lfo-control");
    controls.forEach((control, index) => {
      if (index > 0) control.remove();
    });
    
    // Keep only the first LFO
    this.lfos = this.lfos.slice(0, 1);
    this.nextId = 2;
    
    this.updateAddButtonState();
    this.dispatchChangeEvent();
  }

  addLFO(waveform: OscillatorType = "sine", rate: number = 5, toFilter: number = 0, toPitch: number = 0): void {
    this.addLFOControl(waveform, rate, toFilter, toPitch);
  }

  getLFOs(): Array<{ waveform: OscillatorType; rate: number; toFilter: number; toPitch: number }> {
    // Return LFOs without the id field
    return this.lfos.map(({ waveform, rate, toFilter, toPitch }) => ({
      waveform,
      rate,
      toFilter,
      toPitch
    }));
  }
}

customElements.define('lfo-section', LFOSection);