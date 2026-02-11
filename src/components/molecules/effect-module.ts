/**
 * <effect-module> — Data-driven effect module molecule
 *
 * Replaces all 8 effect organism files (chorus-effect, delay-effect, etc.)
 * with a single declarative component. Each effect is defined entirely in HTML.
 *
 * Usage:
 *
 *   <effect-module id="chorus-effect" title="Chorus">
 *     <effect-param label="Rate"  param-id="chorus-rate"  min="0.1" max="5"  step="0.1"  value="0.5" format="hz"></effect-param>
 *     <effect-param label="Depth" param-id="chorus-depth" min="0"   max="50" step="1"    value="20"></effect-param>
 *     <effect-param label="Mix"   param-id="chorus-mix"   min="0"   max="1"  step="0.01" value="0.3" format="percent"></effect-param>
 *   </effect-module>
 *
 * Attributes:
 *   id          — Module section id (used for collapse state persistence)
 *   title       — Display title in module header
 *   description — Optional description text for the instructions popover
 *
 * Child elements:
 *   <effect-param>  — Renders as a range-control inside a controls-group
 *   <effect-toggle> — Renders as a toggle-switch (for enable/bypass)
 *   <effect-select> — Renders as a neon-select
 *   <effect-section> — Groups params under a subsection-header
 *
 * The component:
 *   1. Captures child config elements before rendering
 *   2. Builds instruction list automatically from param labels/descriptions
 *   3. Wraps params in controls-group within a module-section
 *   4. Supports mixed control types (ranges, toggles, selects, subsections)
 *
 * Events:
 *   Params dispatch native input/change events as normal — no special handling.
 */

// ─── Config types parsed from child elements ────────────────────────────

type ParamConfig = {
  kind: "param";
  label: string;
  paramId: string;
  min: string;
  max: string;
  step: string;
  value: string;
  format: string;
  description: string;
  precision: string;
};

type ToggleConfig = {
  kind: "toggle";
  paramId: string;
  label: string;
  labelOn: string;
  labelOff: string;
  checked: boolean;
  description: string;
};

type SelectConfig = {
  kind: "select";
  paramId: string;
  label: string;
  type: string;
  value: string;
  description: string;
  options: string; // raw innerHTML of child <option> elements
};

type SectionConfig = {
  kind: "section";
  title: string;
};

type ControlConfig = ParamConfig | ToggleConfig | SelectConfig | SectionConfig;

// ─── Style injection ────────────────────────────────────────────────────

const STYLE_ID = "effect-module-styles";

function ensureGlobalStyles(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    effect-module {
      display: contents;
    }

    effect-param,
    effect-toggle,
    effect-select,
    effect-section {
      display: none;
    }
  `;
  document.head.appendChild(style);
}

// ─── Helper: parse child elements into config ───────────────────────────

function parseChildren(host: HTMLElement): ControlConfig[] {
  const configs: ControlConfig[] = [];

  for (const child of Array.from(host.children)) {
    const tag = child.tagName.toLowerCase();

    if (tag === "effect-param") {
      configs.push({
        kind: "param",
        label: child.getAttribute("label") || "",
        paramId: child.getAttribute("param-id") || "",
        min: child.getAttribute("min") || "0",
        max: child.getAttribute("max") || "100",
        step: child.getAttribute("step") || "1",
        value: child.getAttribute("value") || "0",
        format: child.getAttribute("format") || "",
        description: child.getAttribute("description") || "",
        precision: child.getAttribute("precision") || "",
      });
    } else if (tag === "effect-toggle") {
      configs.push({
        kind: "toggle",
        paramId: child.getAttribute("param-id") || "",
        label: child.getAttribute("label") || "",
        labelOn: child.getAttribute("label-on") || "",
        labelOff: child.getAttribute("label-off") || "",
        checked: child.hasAttribute("checked"),
        description: child.getAttribute("description") || "",
      });
    } else if (tag === "effect-select") {
      configs.push({
        kind: "select",
        paramId: child.getAttribute("param-id") || "",
        label: child.getAttribute("label") || "",
        type: child.getAttribute("type") || "",
        value: child.getAttribute("value") || "",
        description: child.getAttribute("description") || "",
        options: child.innerHTML,
      });
    } else if (tag === "effect-section") {
      configs.push({
        kind: "section",
        title: child.getAttribute("title") || "",
      });
    }
  }

  return configs;
}

// ─── Helper: build instruction items from configs ───────────────────────

function buildInstructions(
  configs: ControlConfig[],
  description: string
): string {
  const descHtml = description ? `<p>${description}</p>` : "";

  const items = configs
    .filter((c): c is ParamConfig | ToggleConfig | SelectConfig => c.kind !== "section")
    .filter((c) => c.description || c.label)
    .map((c) => {
      const desc = c.description || `Adjust the ${c.label.toLowerCase()} parameter`;
      return `<instruction-item label="${c.label}">${desc}</instruction-item>`;
    })
    .join("\n            ");

  if (!items && !descHtml) return "";

  return `
        ${descHtml}
        ${items ? `<instruction-list>${items}</instruction-list>` : ""}
  `;
}

// ─── Helper: build controls HTML from configs ───────────────────────────

function buildControls(configs: ControlConfig[]): string {
  // Group configs into sections: everything before the first effect-section
  // goes into one controls-group, then each effect-section starts a new group
  const groups: { title?: string; controls: ControlConfig[] }[] = [];
  let currentGroup: { title?: string; controls: ControlConfig[] } = {
    controls: [],
  };

  for (const config of configs) {
    if (config.kind === "section") {
      // Push current group if it has controls
      if (currentGroup.controls.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = { title: config.title, controls: [] };
    } else {
      currentGroup.controls.push(config);
    }
  }

  // Push final group
  if (currentGroup.controls.length > 0) {
    groups.push(currentGroup);
  }

  return groups
    .map((group) => {
      const header = group.title
        ? `<subsection-header text="${group.title}"></subsection-header>`
        : "";

      const controls = group.controls
        .map((c) => {
          switch (c.kind) {
            case "param":
              return buildRangeControl(c);
            case "toggle":
              return buildToggleSwitch(c);
            case "select":
              return buildNeonSelect(c);
            default:
              return "";
          }
        })
        .join("\n            ");

      return `${header}
          <controls-group>
            ${controls}
          </controls-group>`;
    })
    .join("\n");
}

function buildRangeControl(c: ParamConfig): string {
  const attrs = [
    `label="${c.label}"`,
    `id="${c.paramId}"`,
    `min="${c.min}"`,
    `max="${c.max}"`,
    `step="${c.step}"`,
    `value="${c.value}"`,
  ];

  if (c.format) attrs.push(`formatter="${c.format}"`);
  if (c.precision) attrs.push(`precision="${c.precision}"`);

  return `<range-control ${attrs.join(" ")}></range-control>`;
}

function buildToggleSwitch(c: ToggleConfig): string {
  const attrs = [`id="${c.paramId}"`];

  if (c.labelOn) {
    const onLabel = `label-on="${c.labelOn}"`;
    const offLabel = `label-off="${c.labelOff || c.label}"`;
    attrs.push(onLabel, offLabel);
  } else if (c.label) {
    attrs.push(`label="${c.label}"`);
  }

  if (c.checked) attrs.push("checked");

  return `<toggle-switch ${attrs.join(" ")}></toggle-switch>`;
}

function buildNeonSelect(c: SelectConfig): string {
  const attrs = [`id="${c.paramId}"`];

  if (c.label) attrs.push(`label="${c.label}"`);
  if (c.type) attrs.push(`type="${c.type}"`);
  if (c.value) attrs.push(`value="${c.value}"`);

  // If custom options were provided, inject them as children
  if (c.options.trim()) {
    return `<neon-select ${attrs.join(" ")}>${c.options}</neon-select>`;
  }

  return `<neon-select ${attrs.join(" ")}></neon-select>`;
}

// ─── Component ──────────────────────────────────────────────────────────

export class EffectModule extends HTMLElement {
  connectedCallback() {
    ensureGlobalStyles();

    const id = this.getAttribute("id") || "";
    const title = this.getAttribute("title") || "Effect";
    const description = this.getAttribute("description") || "";

    // Parse child config elements before clearing innerHTML
    const configs = parseChildren(this);

    const instructionsHtml = buildInstructions(configs, description);
    const controlsHtml = buildControls(configs);

    this.innerHTML = `
      <module-section id="${id}" title="${title}">
        <div slot="instructions">
          ${instructionsHtml}
        </div>
        <div slot="content">
          ${controlsHtml}
        </div>
      </module-section>
    `;
  }
}

// Register the main component and the config child elements
customElements.define("effect-module", EffectModule);

// These are inert elements — they exist only to carry attributes for parsing.
// They're hidden via CSS and consumed during connectedCallback.
customElements.define("effect-param", class extends HTMLElement {});
customElements.define("effect-toggle", class extends HTMLElement {});
customElements.define("effect-select", class extends HTMLElement {});
customElements.define("effect-section", class extends HTMLElement {});