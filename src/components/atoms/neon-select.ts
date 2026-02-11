/**
 * <neon-select> — Universal styled select atom
 * 
 * Usage:
 *
 *   <!-- Preset types with built-in options -->
 *   <neon-select id="filter-type" label="Filter Type" type="filter"></neon-select>
 *   <neon-select id="lfo-1-waveform" label="Waveform" type="waveform"></neon-select>
 *   <neon-select id="octave-upper" label="Upper Octave" type="octave" value="5" min="2" max="6"></neon-select>
 *   <neon-select id="noise-type" label="Noise Type" type="noise"></neon-select>
 *
 *   <!-- Custom options via children (parsed before render) -->
 *   <neon-select id="my-select" label="My Param">
 *     <option value="a">Option A</option>
 *     <option value="b" selected>Option B</option>
 *   </neon-select>
 *
 * Attributes:
 *   id       — Applied to the inner <select> for UIConfigService discovery
 *   label    — Optional label text above the select
 *   value    — Initial selected value
 *   type     — Preset option set: "waveform" | "filter" | "octave" | "noise"
 *   min/max  — For type="octave", range of octave values
 *
 * Events:
 *   Dispatches native "change" event (bubbles) for UIConfigService compatibility.
 *   Also dispatches native "input" event for parity with other atoms.
 *
 * API:
 *   .getSelect(): HTMLSelectElement
 *   .value (get/set)
 */

import { GlobalStyleService } from "../../services/global-style-service";

const PRESET_OPTIONS: Record<string, Array<{ value: string; label: string }>> = {
  waveform: [
    { value: "sine", label: "Sine" },
    { value: "square", label: "Square" },
    { value: "sawtooth", label: "Sawtooth" },
    { value: "triangle", label: "Triangle" },
  ],
  filter: [
    { value: "lowpass", label: "Lowpass" },
    { value: "highpass", label: "Highpass" },
    { value: "bandpass", label: "Bandpass" },
    { value: "notch", label: "Notch" },
    { value: "allpass", label: "Allpass" },
    { value: "peaking", label: "Peaking" },
    { value: "lowshelf", label: "Low Shelf" },
    { value: "highshelf", label: "High Shelf" },
  ],
  noise: [
    { value: "white", label: "White" },
    { value: "pink", label: "Pink" },
    { value: "brown", label: "Brown" },
  ],
};

// Shared styles injected once into the document
const STYLE_ID = "neon-select-styles";
const styles = `
neon-select {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

neon-select .neon-select-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  text-shadow: 0 0 5px var(--text-secondary);
}

neon-select select {
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
  font-family: inherit;
}

neon-select select:hover {
  border-color: var(--neon-pink);
  background: rgba(26, 0, 51, 0.9);
  box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
}

neon-select select:focus {
  outline: none;
  border-color: var(--neon-pink);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.6);
}

neon-select select option {
  background: #0a0015;
  color: var(--text-primary);
  padding: 0.5rem;
}
`;


export class NeonSelect extends HTMLElement {
  private select!: HTMLSelectElement;
  private customOptions: string = "";

  connectedCallback() {
    GlobalStyleService.ensureStyles(STYLE_ID, styles);

    // Capture child <option> elements before we clear innerHTML
    this.customOptions = this.captureChildOptions();

    const id = this.getAttribute("id") || "";
    const label = this.getAttribute("label") || "";
    const type = this.getAttribute("type");
    const selectedValue = this.getAttribute("value") || "";

    const optionsHtml = this.buildOptions(type, selectedValue);
    const labelHtml = label
      ? `<span class="neon-select-label">${label}</span>`
      : "";

    this.innerHTML = `
      ${labelHtml}
      <select id="${id}">${optionsHtml}</select>
    `;

    this.select = this.querySelector("select")!;

    // Set value after render if specified
    if (selectedValue && this.select.querySelector(`option[value="${selectedValue}"]`)) {
      this.select.value = selectedValue;
    }

    // Dispatch both change and input for UIConfigService compatibility
    this.select.addEventListener("change", () => {
      this.dispatchEvent(new Event("change", { bubbles: true }));
      this.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  private captureChildOptions(): string {
    const options = this.querySelectorAll("option");
    if (options.length === 0) return "";

    let html = "";
    options.forEach((opt) => {
      html += opt.outerHTML;
    });
    return html;
  }

  private buildOptions(
    type: keyof typeof PRESET_OPTIONS | null,
    selectedValue: string
  ): string {
    // Custom child options take priority
    if (this.customOptions) {
      return this.customOptions;
    }

    // Octave is generated from min/max range
    if (type === "octave") {
      return this.buildOctaveOptions(selectedValue);
    }

    // Preset types
    if (type && PRESET_OPTIONS[type]) {
      return PRESET_OPTIONS[type]
        .map(
          (opt) =>
            `<option value="${opt.value}" ${opt.value === selectedValue ? "selected" : ""}>${opt.label}</option>`
        )
        .join("");
    }

    return "";
  }

  private buildOctaveOptions(selectedValue: string): string {
    const min = Number.parseInt(this.getAttribute("min") || "0");
    const max = Number.parseInt(this.getAttribute("max") || "8");

    let html = "";
    for (let i = min; i <= max; i++) {
      html += `<option value="${i}" ${String(i) === selectedValue ? "selected" : ""}>${i}</option>`;
    }
    return html;
  }

  getSelect(): HTMLSelectElement {
    return this.select;
  }

  get value(): string {
    return this.select?.value ?? "";
  }

  set value(val: string) {
    if (this.select) {
      this.select.value = val;
    }
  }
}

customElements.define("neon-select", NeonSelect);