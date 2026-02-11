/**
 * <bank-section> — Generic dynamic bank container molecule
 *
 * Manages a list of bank-items with add/remove functionality, ID generation,
 * and config array management.
 *
 * Usage:
 *
 *   <!-- Oscillator bank -->
 *   <bank-section
 *     prefix="osc"
 *     max-items="4"
 *     add-label="Add Oscillator"
 *     event-name="oscillators-changed"
 *   >
 *     <bank-item-template>
 *       <bank-select param="waveform" type="waveform" value="sawtooth"></bank-select>
 *       <bank-range param="detune" label="Detune" min="-1200" max="1200" step="1" value="0" format="cents"></bank-range>
 *       <bank-range param="level" label="Level" min="0" max="1" step="0.01" value="1" format="percent"></bank-range>
 *     </bank-item-template>
 *   </bank-section>
 *
 *   <!-- LFO bank -->
 *   <bank-section
 *     prefix="lfo"
 *     max-items="4"
 *     min-items="1"
 *     add-label="Add LFO"
 *     event-name="lfos-changed"
 *   >
 *     <bank-item-template>
 *       <bank-select param="waveform" type="waveform" value="sine"></bank-select>
 *       <bank-range param="rate" label="Rate" min="0.1" max="20" step="0.1" value="5" format="hz"></bank-range>
 *       <bank-range param="to-filter" label="To Filter" min="0" max="5000" step="10" value="0" format="hz"></bank-range>
 *       <bank-range param="to-pitch" label="To Pitch" min="0" max="100" step="1" value="0" format="cents"></bank-range>
 *     </bank-item-template>
 *   </bank-section>
 *
 * Attributes:
 *   prefix      — ID prefix for bank-items (e.g. "osc", "lfo")
 *   max-items   — Maximum number of items (default: 4)
 *   min-items   — Minimum number of items, prevents removal below this (default: 0)
 *   add-label   — Text for the add button (default: "Add")
 *   event-name  — Custom event name dispatched on changes (default: "items-changed")
 *   initial     — Number of items to create on init (default: 1)
 *
 * Child elements:
 *   <bank-item-template> — Template for new bank-items. Its children (bank-select,
 *     bank-range, bank-toggle) are cloned for each new item.
 *
 * Events:
 *   "${event-name}" — Bubbles. detail = { items: Array<Record<string, any>> }
 *     Dispatched whenever items are added, removed, or configs change.
 *
 * API:
 *   .getItems(): Array<Record<string, any>>     — Config array of all items
 *   .addItem(overrides?: Record<string, any>)    — Add a new item
 *   .clearAll()                                   — Remove all items, re-add initial
 *   .setItems(configs: Array<Record<string, any>>) — Replace all items
 */

import { NeonButton } from "../atoms/neon-button";
import type { BankItem } from "./bank-item";
import type { ControlValue } from "./bank.model";

// ─── Style injection ────────────────────────────────────────────────────

const STYLE_ID = "bank-section-styles";

function ensureGlobalStyles(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    bank-section {
      display: block;
    }

    bank-section .bank-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    bank-item-template {
      display: none;
    }
  `;
  document.head.appendChild(style);
}

// ─── Component ──────────────────────────────────────────────────────────

export class BankSection extends HTMLElement {
  private itemPrefix: string = "bank";
  private nextId: number = 1;
  private maxItems: number = 4;
  private minItems: number = 0;
  private eventName: string = "items-changed";
  private templateHtml: string = "";
  private templateDefaults: Record<string, string> = {};
  private listEl!: HTMLElement;
  private addBtn!: HTMLButtonElement;

  connectedCallback() {
    ensureGlobalStyles();

    this.itemPrefix = this.getAttribute("prefix") || "bank";
    this.maxItems = Number.parseInt(this.getAttribute("max-items") || "4");
    this.minItems = Number.parseInt(this.getAttribute("min-items") || "0");
    this.eventName = this.getAttribute("event-name") || "items-changed";
    const addLabel = this.getAttribute("add-label") || "Add";
    const initialCount = Number.parseInt(this.getAttribute("initial") || "1");

    // Capture the template before clearing
    this.captureTemplate();

    this.innerHTML = `
      <div class="bank-list"></div>
      <neon-button variant="secondary" class="bank-add">${addLabel}</neon-button>
    `;

    this.listEl = this.querySelector(".bank-list")!;
    this.addBtn = (this.querySelector(".bank-add neon-button, .bank-add") as NeonButton).getButton();

    // Add initial items
    for (let i = 0; i < initialCount; i++) {
      this.createItem();
    }

    // Wire add button
    this.addBtn.addEventListener("click", () => this.createItem());
  }

  private captureTemplate(): void {
    const template = this.querySelector("bank-item-template");
    if (template) {
      // Store the innerHTML of the template (the bank-select, bank-range children)
      this.templateHtml = template.innerHTML;

      // Also parse default values from the template children
      for (const child of Array.from(template.children)) {
        const param = child.getAttribute("param");
        const value = child.getAttribute("value");
        if (param && value) {
          this.templateDefaults[param] = value;
        }
      }
    }
  }

  private createItem(overrides?: Record<string, ControlValue>): void {
    if (this.getItemCount() >= this.maxItems) return;

    const id = this.nextId++;

    const item = document.createElement("bank-item") as BankItem;
    item.setAttribute("prefix", this.itemPrefix);
    item.dataset.id = id.toString();

    // Clone the template children into the bank-item
    // We need to create actual DOM elements from the template HTML
    // and apply any overrides to the value attributes
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = this.templateHtml;

    if (overrides) {
      this.applyOverrides(overrides, tempDiv);
    }

    item.innerHTML = tempDiv.innerHTML;

    // Listen for events
    item.addEventListener("configchange", () => this.dispatchChangeEvent());

    item.addEventListener("remove", () => {
      if (this.getItemCount() <= this.minItems) return;
      item.remove();
      this.updateAddButtonState();
      this.dispatchChangeEvent();
    });

    this.listEl.appendChild(item);
    this.updateAddButtonState();
    this.dispatchChangeEvent();
  }

  private applyOverrides(overrides: Record<string, ControlValue>, tempDiv: HTMLDivElement) {
    for (const child of Array.from(tempDiv.children)) {
      const param = child.getAttribute("param");
      if (param && param in overrides) {
        const val = overrides[param];
        if (typeof val === "boolean") {
          if (val) {
            child.setAttribute("checked", "");
          } else {
            child.removeAttribute("checked");
          }
        } else {
          child.setAttribute("value", String(val));
        }
      }
    }
  }

  private getItemCount(): number {
    return this.listEl.querySelectorAll("bank-item").length;
  }

  private updateAddButtonState(): void {
    this.addBtn.disabled = this.getItemCount() >= this.maxItems;
  }

  private dispatchChangeEvent(): void {
    this.dispatchEvent(
      new CustomEvent(this.eventName, {
        detail: { items: this.getItems() },
        bubbles: true,
      })
    );
  }

  // ─── Public API ─────────────────────────────────────────────────────

  /**
   * Get config array of all current items.
   */
  getItems(): Array<Record<string, ControlValue>> {
    const items: Array<Record<string, ControlValue>> = [];
    const bankItems = this.listEl.querySelectorAll("bank-item");

    bankItems.forEach((el) => {
      const bankItem = el as BankItem;
      if (typeof bankItem.getConfig === "function") {
        items.push(bankItem.getConfig());
      }
    });

    return items;
  }

  /**
   * Add a new item with optional config overrides.
   */
  addItem(overrides?: Record<string, string | number | boolean>): void {
    this.createItem(overrides);
  }

  /**
   * Remove all items and re-add the initial count.
   */
  clearAll(): void {
    const items = this.listEl.querySelectorAll("bank-item");
    items.forEach((el) => el.remove());
    this.nextId = 1;

    const initialCount = Math.max(
      this.minItems,
      Number.parseInt(this.getAttribute("initial") || "1")
    );

    for (let i = 0; i < initialCount; i++) {
      this.createItem();
    }
  }

  /**
   * Replace all items with the given config array.
   */
  setItems(configs: Array<Record<string, string | number | boolean>>): void {
    // Remove existing
    const items = this.listEl.querySelectorAll("bank-item");
    items.forEach((el) => el.remove());
    this.nextId = 1;

    // Create new items from configs
    for (const config of configs) {
      this.createItem(config);
    }
  }
}

customElements.define("bank-section", BankSection);

// Inert template element
customElements.define(
  "bank-item-template",
  class extends HTMLElement { }
);