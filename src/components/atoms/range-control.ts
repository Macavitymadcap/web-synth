/**
 * <range-control> — Styled range input atom with value display
 *
 * Normalised formatter set (replaces inconsistent "%" / "percentage" / "s" / "seconds"):
 *
 *   "percent"   — Multiplies by 100, shows "50%"        (for 0-1 ranges)
 *   "hz"        — Shows "440 Hz"                         (alias: "hertz")
 *   "seconds"   — Shows "0.500s"                         (alias: "s")
 *   "cents"     — Shows "12 cents"
 *   "db"        — Shows "-24 dB"                         (alias: "dB")
 *   "ms"        — Shows "20 ms"
 *   "raw"       — Shows the raw numeric value
 *   (none)      — Falls back to raw value + optional unit attribute
 *
 * Attributes:
 *   id         — Applied to the inner <input> for UIConfigService discovery
 *   label      — Label text
 *   min, max, step, value — Standard range input attributes
 *   formatter  — One of the above formatter names
 *   unit       — Fallback unit suffix when no formatter is set
 *   precision  — Decimal places for display (auto-determined if omitted)
 *
 * Events:
 *   Dispatches native "input" event (bubbles) on every change.
 *   Also dispatches "change" event on pointer release.
 *
 * API:
 *   .getInput(): HTMLInputElement
 *   .setValue(value: string | number): void
 */

import { GlobalStyleService } from "../../services/global-style-service";

type FormatterName =
  | "percent"
  | "percentage"
  | "%"
  | "hz"
  | "hertz"
  | "seconds"
  | "s"
  | "cents"
  | "db"
  | "dB"
  | "ms"
  | "raw";

type FormatterFn = (value: number, precision: number | null) => string;

const FORMATTERS: Record<string, FormatterFn> = {
  // Percentage: multiply by 100 for 0-1 ranges
  percent: (v, p) => `${(v * 100).toFixed(p ?? 0)}%`,
  percentage: (v, p) => `${(v * 100).toFixed(p ?? 0)}%`,
  "%": (v, p) => `${(v * 100).toFixed(p ?? 0)}%`,

  // Frequency
  hz: (v, p) => `${v.toFixed(p ?? 0)} Hz`,
  hertz: (v, p) => `${v.toFixed(p ?? 0)} Hz`,

  // Time
  seconds: (v, p) => `${v.toFixed(p ?? 3)}s`,
  s: (v, p) => `${v.toFixed(p ?? 3)}s`,
  ms: (v, p) => `${v.toFixed(p ?? 0)} ms`,

  // Pitch
  cents: (v, p) => `${v.toFixed(p ?? 0)} cents`,

  // Loudness
  db: (v, p) => `${v.toFixed(p ?? 0)} dB`,
  dB: (v, p) => `${v.toFixed(p ?? 0)} dB`,

  // Raw number
  raw: (v, p) => v.toFixed(p ?? 2),
};

// Shared styles injected once
const STYLE_ID = "range-control-styles";

const styles = `
range-control {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

range-control label {
  display: flex;
  flex-direction: column;
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  gap: 0.5rem;
  text-shadow: 0 0 5px var(--text-secondary);
}

range-control .range-label {
  display: block;
  text-align: center;
  width: 100%;
}

/* NEW: Stack input and value together */
range-control .range-stack {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.25rem;
}

range-control input[type="range"] {
  width: 100%;
  height: 6px;
  background: rgba(10, 0, 21, 0.8);
  border: 2px solid var(--neon-cyan);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  box-sizing: border-box; /* Ensure box model matches span */
}

range-control input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 20px;
  height: 20px;
  background: linear-gradient(145deg, var(--neon-cyan), var(--accent-blue));
  border: 2px solid var(--neon-cyan);
  border-radius: 50%;
  cursor: pointer;
  box-shadow:
    0 0 15px var(--neon-cyan),
    0 2px 4px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  transition: all 0.1s ease;
}

range-control input[type="range"]::-webkit-slider-thumb:hover {
  background: linear-gradient(145deg, #00ffff, #00d4ff);
  box-shadow:
    0 0 25px var(--neon-cyan),
    0 3px 6px rgba(0, 255, 255, 0.5);
  transform: scale(1.1);
}

range-control input[type="range"]::-webkit-slider-thumb:active {
  background: linear-gradient(145deg, var(--accent-blue), #0099cc);
  transform: scale(0.95);
}

range-control input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: linear-gradient(145deg, var(--neon-cyan), var(--accent-blue));
  border: 2px solid var(--neon-cyan);
  border-radius: 50%;
  cursor: pointer;
  box-shadow:
    0 0 15px var(--neon-cyan),
    0 2px 4px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

range-control .range-value {
  font-size: 0.85rem;
  color: var(--neon-cyan);
  font-weight: 700;
  text-align: center;
  padding: 0.25rem 0.5rem;
  background: rgba(0, 255, 255, 0.1);
  border: 1px solid var(--neon-cyan);
  border-radius: 3px;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  text-shadow: 0 0 10px var(--neon-cyan);
}
`;

export class RangeControl extends HTMLElement {
  private input!: HTMLInputElement;
  private valueSpan!: HTMLSpanElement;
  private formatter: FormatterFn | null = null;
  private displayPrecision: number | null = null;
  private unitSuffix: string = "";

  connectedCallback() {
    GlobalStyleService.ensureStyles(STYLE_ID, styles);

    const label = this.getAttribute("label") || "";
    const id = this.getAttribute("id") || "";
    const min = this.getAttribute("min") || "0";
    const max = this.getAttribute("max") || "100";
    const step = this.getAttribute("step") || "1";
    const value = this.getAttribute("value") || "0";
    const formatterName = this.getAttribute("formatter") as FormatterName | null;
    const precisionAttr = this.getAttribute("precision");

    // Resolve formatter
    if (formatterName && FORMATTERS[formatterName]) {
      this.formatter = FORMATTERS[formatterName];
    }

    // Resolve precision
    const hasPrecision = precisionAttr !== null;
    this.displayPrecision = hasPrecision ? Number.parseInt(precisionAttr) : null;

    // Fallback unit
    this.unitSuffix = this.getAttribute("unit") || "";

    this.innerHTML = `
      <label>
        <span class="range-label">${label}</span>
        <div class="range-stack">
          <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">
          <span class="range-value"></span>
        </div>
      </label>
    `;

    this.input = this.querySelector("input")!;
    this.valueSpan = this.querySelector(".range-value")!;

    this.updateValue();

    // Dispatch native events for UIConfigService compatibility
    this.input.addEventListener("input", () => {
      this.updateValue();
      this.dispatchEvent(new Event("input", { bubbles: true }));
    });

    this.input.addEventListener("change", () => {
      this.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  private updateValue(): void {
    const numValue = Number.parseFloat(this.input.value);

    if (this.formatter) {
      this.valueSpan.textContent = this.formatter(numValue, this.displayPrecision);
    } else if (this.unitSuffix) {
      this.valueSpan.textContent = `${numValue}${this.unitSuffix}`;
    } else {
      this.valueSpan.textContent = this.input.value;
    }
  }

  getInput(): HTMLInputElement {
    return this.input;
  }

  setValue(value: string | number): void {
    this.input.value = String(value);
    this.updateValue();
  }
}

customElements.define("range-control", RangeControl);