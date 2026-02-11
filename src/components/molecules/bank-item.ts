/**
 * <bank-item> — Generic dynamic-instance control row molecule
 *
 * A bank-item is a row of controls (select, ranges, etc.) with a remove button,
 * supporting dynamic ID prefixing for multi-instance modules.
 *
 * Usage:
 *
 *   <!-- Oscillator bank item -->
 *   <bank-item prefix="osc" data-id="1">
 *     <bank-select param="waveform" type="waveform" value="sawtooth"></bank-select>
 *     <bank-range param="detune" label="Detune" min="-1200" max="1200" step="1" value="0" format="cents"></bank-range>
 *     <bank-range param="level" label="Level" min="0" max="1" step="0.01" value="1" format="percent"></bank-range>
 *   </bank-item>
 *
 *   <!-- LFO bank item -->
 *   <bank-item prefix="lfo" data-id="2">
 *     <bank-select param="waveform" type="waveform" value="sine"></bank-select>
 *     <bank-range param="rate" label="Rate" min="0.1" max="20" step="0.1" value="5" format="hz"></bank-range>
 *     <bank-range param="to-filter" label="To Filter" min="0" max="5000" step="10" value="0" format="hz"></bank-range>
 *     <bank-range param="to-pitch" label="To Pitch" min="0" max="100" step="1" value="0" format="cents"></bank-range>
 *   </bank-item>
 *
 * Attributes:
 *   prefix   — ID prefix for child controls (e.g. "osc", "lfo")
 *   data-id  — Instance ID. Controls get id="${prefix}-${dataId}-${param}"
 *   no-remove — If present, hides the remove button (for single-instance cases)
 *
 * Child config elements:
 *   <bank-select> — Becomes a neon-select
 *     param, type, value, label
 *   <bank-range> — Becomes a range-control
 *     param, label, min, max, step, value, format, precision
 *   <bank-toggle> — Becomes a toggle-switch
 *     param, label, label-on, label-off, checked
 *
 * Events:
 *   "configchange" — Bubbles. detail = { [param]: value, ... } for all controls
 *   "remove"       — Bubbles. Dispatched when remove button is clicked
 *
 * API:
 *   .getConfig(): Record<string, any>         — Current values of all controls
 *   .setConfig(config: Record<string, any>)   — Set values programmatically
 *   .getControl(param: string): HTMLElement    — Get a specific control by param name
 */

import type { RangeControl } from "../atoms/range-control";
import type { NeonSelect } from "../atoms/neon-select";
import type { BankControlConfig, ControlValue, RangeConfig, SelectConfig, ToggleConfig } from "./bank.model";
import { GlobalStyleService } from "../../services/global-style-service";

// ─── Style injection ────────────────────────────────────────────────────

const STYLE_ID = "bank-item-styles";

const styles = `
bank-item {
  display: block;
}

bank-select,
bank-range,
bank-toggle {
  display: none;
}
`;


// ─── Parsing ────────────────────────────────────────────────────────────

function parseChildren(host: HTMLElement): BankControlConfig[] {
  const configs: BankControlConfig[] = [];

  for (const child of Array.from(host.children)) {
    const tag = child.tagName.toLowerCase();

    if (tag === "bank-range") {
      configs.push({
        kind: "range",
        param: child.getAttribute("param") || "",
        label: child.getAttribute("label") || "",
        min: child.getAttribute("min") || "0",
        max: child.getAttribute("max") || "100",
        step: child.getAttribute("step") || "1",
        value: child.getAttribute("value") || "0",
        format: child.getAttribute("format") || "",
        precision: child.getAttribute("precision") || "",
      });
    } else if (tag === "bank-select") {
      configs.push({
        kind: "select",
        param: child.getAttribute("param") || "",
        label: child.getAttribute("label") || "Waveform",
        type: child.getAttribute("type") || "",
        value: child.getAttribute("value") || "",
        options: child.innerHTML,
      });
    } else if (tag === "bank-toggle") {
      configs.push({
        kind: "toggle",
        param: child.getAttribute("param") || "",
        label: child.getAttribute("label") || "",
        labelOn: child.getAttribute("label-on") || "",
        labelOff: child.getAttribute("label-off") || "",
        checked: child.hasAttribute("checked"),
      });
    }
  }

  return configs;
}

// ─── Build control HTML ─────────────────────────────────────────────────

function buildControlHtml(
  config: BankControlConfig,
  prefix: string,
  instanceId: string
): string {
  const controlId = `${prefix}-${instanceId}-${config.param}`;
  const dataParam = `data-param="${config.param}"`;

  switch (config.kind) {
    case "range": {
      return buildRangeControl(config, controlId, dataParam);
    }

    case "select": {
      return buildSelectControl(config, controlId, dataParam);
    }

    case "toggle": {
      return buildToggleControl(config, controlId, dataParam);
    }
  }
}

const buildRangeControl = (config: RangeConfig, controlId: string, dataParam: string) => {
  const attrs = [
    `label="${config.label}"`,
    `id="${controlId}"`,
    `min="${config.min}"`,
    `max="${config.max}"`,
    `step="${config.step}"`,
    `value="${config.value}"`,
    dataParam,
  ];
  if (config.format) attrs.push(`formatter="${config.format}"`);
  if (config.precision) attrs.push(`precision="${config.precision}"`);
  return `<range-control ${attrs.join(" ")}></range-control>`;
}

const buildSelectControl = (config: SelectConfig, controlId: string, dataParam: string) => {
  const attrs = [
    `id="${controlId}"`,
    `label="${config.label}"`,
    dataParam,
  ];
  if (config.type) attrs.push(`type="${config.type}"`);
  if (config.value) attrs.push(`value="${config.value}"`);

  if (config.options.trim()) {
    return `<neon-select ${attrs.join(" ")}>${config.options}</neon-select>`;
  }
  return `<neon-select ${attrs.join(" ")}></neon-select>`;
}

const buildToggleControl = (config: ToggleConfig, controlId: string, dataParam: string) => {
  const attrs = [`id="${controlId}"`, dataParam];
  if (config.labelOn) {
    const onLabel = `label-on="${config.labelOn}"`;
    const offLabel = `label-off="${config.labelOff || config.labelOn}"`;
    attrs.push(onLabel, offLabel);
  } else if (config.label) {
    attrs.push(`label="${config.label}"`);
  }
  if (config.checked) attrs.push("checked");
  return `<toggle-switch ${attrs.join(" ")}></toggle-switch>`;
}


// ─── Component ──────────────────────────────────────────────────────────

export class BankItem extends HTMLElement {
  private readonly controls = new Map<string, HTMLElement>();
  private configs: BankControlConfig[] = [];

  connectedCallback() {
    GlobalStyleService.ensureStyles(STYLE_ID, styles);

    const prefix = this.getAttribute("prefix") || "bank";
    const instanceId = this.dataset.id || "1";
    const noRemove = this.hasAttribute("no-remove");

    // Parse child config before clearing
    this.configs = parseChildren(this);

    const controlsHtml = this.configs
      .map((c) => buildControlHtml(c, prefix, instanceId))
      .join("\n        ");

    const removeBtn = noRemove
      ? ""
      : `<neon-button variant="danger" data-action="remove">Remove</neon-button>`;

    this.innerHTML = `
      <controls-group>
        ${controlsHtml}
        ${removeBtn}
      </controls-group>
    `;

    // Index controls by param name for getConfig/setConfig
    this.indexControls();

    // Wire up events
    this.setupEventListeners(noRemove);
  }

  private indexControls(): void {
    this.controls.clear();

    // Index range controls
    const ranges = this.querySelectorAll("range-control[data-param]");
    ranges.forEach((el) => {
      const param = (el as HTMLElement).dataset.param!;
      this.controls.set(param, el as HTMLElement);
    });

    // Index selects
    const selects = this.querySelectorAll("neon-select[data-param]");
    selects.forEach((el) => {
      const param = (el as HTMLElement).dataset.param!;
      this.controls.set(param, el as HTMLElement);
    });

    // Index toggles
    const toggles = this.querySelectorAll("toggle-switch[data-param]");
    toggles.forEach((el) => {
      const param = (el as HTMLElement).dataset.param!;
      this.controls.set(param, el as HTMLElement);
    });
  }

  private setupEventListeners(noRemove: boolean): void {
    // Listen for input events from all child controls
    this.addEventListener("input", () => {
      this.dispatchEvent(
        new CustomEvent("configchange", {
          detail: this.getConfig(),
          bubbles: true,
        })
      );
    });

    // Also listen for change events (selects dispatch change, not input)
    this.addEventListener("change", () => {
      this.dispatchEvent(
        new CustomEvent("configchange", {
          detail: this.getConfig(),
          bubbles: true,
        })
      );
    });

    // Remove button
    if (!noRemove) {
      const removeBtn = this.querySelector("[data-action=remove]");
      removeBtn?.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("remove", { bubbles: true }));
      });
    }
  }

  /**
   * Get current values of all controls as a flat object.
   * Keys are param names, values are parsed appropriately.
   */
  getConfig(): Record<string, ControlValue> {
    const config: Record<string, ControlValue> = {};

    for (const [param, el] of this.controls) {
      const controlConfig = this.configs.find((c) => c.param === param);
      if (!controlConfig) continue;

      switch (controlConfig.kind) {
        case "range": {
          const rangeControl = el as unknown as RangeControl;
          config[param] = Number.parseFloat(rangeControl.getInput().value);
          break;
        }
        case "select": {
          const selectControl = el as unknown as NeonSelect;
          config[param] = selectControl.value;
          break;
        }
        case "toggle": {
          const checkbox = el.querySelector(
            'input[type="checkbox"]'
          ) as HTMLInputElement;
          config[param] = checkbox.checked;
          break;
        }
      }
    }

    return config;
  }

  /**
   * Set control values programmatically.
   * Keys are param names matching the bank-* child param attributes.
   */
  setConfig(config: Record<string, ControlValue>): void {
    for (const [param, value] of Object.entries(config)) {
      const el = this.controls.get(param);
      const controlConfig = this.configs.find((c) => c.param === param);
      if (!el || !controlConfig) continue;

      switch (controlConfig.kind) {
        case "range": {
          const rangeControl = el as unknown as RangeControl;
          rangeControl.setValue(value as number);
          break;
        }
        case "select": {
          const selectControl = el as unknown as NeonSelect;
          selectControl.value = String(value);
          break;
        }
        case "toggle": {
          const checkbox = el.querySelector(
            'input[type="checkbox"]'
          );
          if (checkbox) (checkbox as HTMLInputElement).checked = Boolean(value);
          break;
        }
      }
    }
  }

  /**
   * Get a specific control element by param name.
   */
  getControl(param: string): HTMLElement | undefined {
    return this.controls.get(param);
  }
}

customElements.define("bank-item", BankItem);

// Inert config elements — consumed during parsing, hidden via CSS
customElements.define("bank-select", class extends HTMLElement { });
customElements.define("bank-range", class extends HTMLElement { });
customElements.define("bank-toggle", class extends HTMLElement { });