/**
 * <toggle-switch> — Styled checkbox toggle atom
 *
 * Usage:
 *   <toggle-switch id="poly" label="Polyphony" checked></toggle-switch>
 *   <toggle-switch id="noise-enabled" label-on="Noise: On" label-off="Noise: Off"></toggle-switch>
 *
 * Attributes:
 *   id        — Applied to the inner <input type="checkbox"> for UIConfigService
 *   label     — Static label text (always shown regardless of state)
 *   label-on  — Text when checked (overrides label for dynamic mode)
 *   label-off — Text when unchecked (overrides label for dynamic mode)
 *   checked   — Initial checked state
 *
 * Label modes:
 *   - Static: Only `label` set → shows same text always
 *   - Dynamic: `label-on` and/or `label-off` set → text changes with state
 *
 * Events:
 *   Dispatches native "change" event (bubbles) for UIConfigService compatibility.
 *   Also dispatches native "input" event.
 *
 * API:
 *   .getCheckbox(): HTMLInputElement
 *   .checked (get/set)
 */

import { GlobalStyleService } from "../../services/global-style-service";

const STYLE_ID = "toggle-switch-styles";

const styles = `
toggle-switch {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  user-select: none;
}

toggle-switch .toggle-container {
  position: relative;
  width: 56px;
  height: 28px;
  cursor: pointer;
}

toggle-switch input[type="checkbox"] {
  opacity: 0;
  width: 0;
  height: 0;
  position: absolute;
}

toggle-switch .toggle-track {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a0033 0%, #0a0015 100%);
  border: 2px solid rgba(255, 0, 255, 0.4);
  border-radius: 14px;
  transition: all 0.3s ease;
  box-shadow:
    inset 0 2px 8px rgba(0, 0, 0, 0.8),
    0 0 10px rgba(255, 0, 255, 0.3);
}

toggle-switch input:checked + .toggle-track {
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.3) 0%, rgba(0, 204, 109, 0.3) 100%);
  border-color: var(--accent-green);
  box-shadow:
    inset 0 2px 8px rgba(0, 0, 0, 0.5),
    0 0 20px rgba(0, 255, 136, 0.6),
    0 0 30px rgba(0, 255, 136, 0.4);
}

toggle-switch .toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: linear-gradient(145deg, var(--neon-pink), #cc00cc);
  border: 1px solid var(--neon-pink);
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow:
    0 0 15px rgba(255, 0, 255, 0.8),
    0 2px 6px rgba(0, 0, 0, 0.5),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

toggle-switch input:checked + .toggle-track .toggle-thumb {
  transform: translateX(28px);
  background: linear-gradient(145deg, var(--accent-green), #00cc6d);
  border-color: var(--accent-green);
  box-shadow:
    0 0 20px rgba(0, 255, 136, 1),
    0 0 30px rgba(0, 255, 136, 0.6),
    0 2px 8px rgba(0, 0, 0, 0.6),
    inset 0 1px 2px rgba(255, 255, 255, 0.4);
}

toggle-switch .toggle-track:hover {
  border-color: var(--neon-cyan);
  box-shadow:
    inset 0 2px 8px rgba(0, 0, 0, 0.8),
    0 0 15px rgba(0, 255, 255, 0.5);
}

toggle-switch input:checked + .toggle-track:hover {
  border-color: var(--neon-cyan);
  box-shadow:
    inset 0 2px 8px rgba(0, 0, 0, 0.5),
    0 0 25px rgba(0, 255, 136, 0.8),
    0 0 40px rgba(0, 255, 255, 0.4);
}

toggle-switch input:focus + .toggle-track {
  border-color: var(--neon-cyan);
  box-shadow:
    inset 0 2px 8px rgba(0, 0, 0, 0.8),
    0 0 20px rgba(0, 255, 255, 0.8);
}

toggle-switch .toggle-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-shadow: 0 0 5px var(--text-secondary);
}

toggle-switch input:checked ~ .toggle-label {
  color: var(--accent-green);
  text-shadow:
    0 0 10px var(--accent-green),
    0 0 20px rgba(0, 255, 136, 0.5);
}
`;


type LabelConfig =
  | { mode: "static"; text: string }
  | { mode: "dynamic"; onText: string; offText: string };

export class ToggleSwitch extends HTMLElement {
  private checkbox!: HTMLInputElement;
  private labelSpan!: HTMLSpanElement;
  private labelConfig!: LabelConfig;

  connectedCallback() {
    GlobalStyleService.ensureStyles(STYLE_ID, styles);

    const id = this.getAttribute("id") || "";
    const isChecked = this.hasAttribute("checked");

    this.labelConfig = this.resolveLabelConfig();

    this.innerHTML = `
      <label class="toggle-container">
        <input type="checkbox" id="${id}" ${isChecked ? "checked" : ""}>
        <span class="toggle-track">
          <span class="toggle-thumb"></span>
        </span>
      </label>
      <span class="toggle-label"></span>
    `;

    this.checkbox = this.querySelector("input")!;
    this.labelSpan = this.querySelector(".toggle-label")!;

    this.updateLabel();

    this.checkbox.addEventListener("change", () => {
      this.updateLabel();
      this.dispatchEvent(new Event("change", { bubbles: true }));
      this.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }

  private resolveLabelConfig(): LabelConfig {
    const hasLabelOn = this.hasAttribute("label-on");
    const hasLabelOff = this.hasAttribute("label-off");

    if (!hasLabelOn && !hasLabelOff) {
      return {
        mode: "static",
        text: this.getAttribute("label") || "Toggle",
      };
    }

    return {
      mode: "dynamic",
      onText: this.getAttribute("label-on") || this.getAttribute("label") || "On",
      offText: this.getAttribute("label-off") || this.getAttribute("label") || "Off",
    };
  }

  private updateLabel(): void {
    if (this.labelConfig.mode === "static") {
      this.labelSpan.textContent = this.labelConfig.text;
    } else {
      this.labelSpan.textContent = this.checkbox.checked
        ? this.labelConfig.onText
        : this.labelConfig.offText;
    }
  }

  getCheckbox(): HTMLInputElement {
    return this.checkbox;
  }

  get checked(): boolean {
    return this.checkbox?.checked ?? false;
  }

  set checked(value: boolean) {
    if (this.checkbox) {
      this.checkbox.checked = value;
      this.updateLabel();
    }
  }
}

customElements.define("toggle-switch", ToggleSwitch);