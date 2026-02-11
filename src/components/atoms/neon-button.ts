/**
 * <neon-button> — Universal styled button atom
 *
 * Supports two shapes and four colour variants. 
 *
 * ─── Text mode (rectangular) ────────────────────────────────
 *
 *   <neon-button>Load</neon-button>
 *   <neon-button variant="secondary">Add Oscillator</neon-button>
 *   <neon-button variant="danger">Remove</neon-button>
 *   <neon-button variant="record">Rec ●</neon-button>
 *
 * ─── Icon mode (round) ─────────────────────────────────────
 *
 *   <neon-button icon>?</neon-button>
 *   <neon-button icon>×</neon-button>
 *   <neon-button icon>−</neon-button>
 *   <neon-button icon variant="close">×</neon-button>
 *   <neon-button icon size="lg">?</neon-button>
 *
 * ─── Attributes ─────────────────────────────────────────────
 *
 *   variant   — Colour variant:
 *                 "primary"   (default) — cyan
 *                 "secondary" — green
 *                 "danger"    — pink/red
 *                 "close"     — pink/red (alias for icon close buttons)
 *                 "record"    — orange/red gradient
 *
 *   icon      — If present, renders as a round button (no padding for text)
 *
 *   size      — Icon size:
 *                 "sm" — 1.75rem (default, module header buttons)
 *                 "md" — 2rem    (popover close buttons)
 *                 "lg" — 2.5rem  (standalone icon actions)
 *
 *   disabled  — Standard disabled state
 *
 *   All standard button attributes are forwarded:
 *     id, type, popovertarget, popovertargetaction, aria-label, title
 *
 * ─── Events ─────────────────────────────────────────────────
 *
 *   Dispatches native "click" event (it's a real <button> inside).
 *
 * ─── API ────────────────────────────────────────────────────
 *
 *   .getButton(): HTMLButtonElement — The inner <button> element
 *   .disabled (get/set)
 */

// ─── Variant colour maps ────────────────────────────────────

type Variant = "primary" | "secondary" | "danger" | "close" | "record";
type IconSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<IconSize, string> = {
  sm: "1.75rem",
  md: "2rem",
  lg: "2.5rem",
};

// ─── Global styles ──────────────────────────────────────────

const STYLE_ID = "neon-button-styles";

function ensureGlobalStyles(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    neon-button {
      display: inline-flex;
    }

    /* ── Base button reset ──────────────────────────────── */

    neon-button button {
      font-family: inherit;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid;
      white-space: nowrap;
      min-width: 0;
      line-height: 1;
    }

    /* ── Text mode (rectangular) ────────────────────────── */

    neon-button button.nb-text {
      padding: 0.5rem 1.25rem;
      border-radius: 4px;
      font-size: 0.9rem;
    }

    /* ── Icon mode (round) ──────────────────────────────── */

    neon-button button.nb-icon {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      margin: 0;
      font-weight: bold;
      line-height: 0;
      flex-shrink: 0;
    }

    neon-button button.nb-icon.nb-sm  { width: 1.75rem; height: 1.75rem; min-width: 1.75rem; min-height: 1.75rem; font-size: 1rem; }
    neon-button button.nb-icon.nb-md  { width: 2rem;    height: 2rem;    min-width: 2rem;    min-height: 2rem;    font-size: 1.5rem; }
    neon-button button.nb-icon.nb-lg  { width: 2.5rem;  height: 2.5rem;  min-width: 2.5rem;  min-height: 2.5rem;  font-size: 1.5rem; }

    /* ── Primary (cyan) ─────────────────────────────────── */

    neon-button button.nb-primary {
      background: rgba(0, 212, 255, 0.2);
      color: var(--accent-blue, #00d4ff);
      border-color: var(--accent-blue, #00d4ff);
      box-shadow:
        0 0 10px rgba(0, 212, 255, 0.5),
        0 2px 8px rgba(0, 212, 255, 0.3);
      text-shadow: 0 0 5px var(--accent-blue, #00d4ff);
    }

    neon-button button.nb-primary.nb-icon {
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.3) 0%, rgba(0, 150, 200, 0.5) 100%);
      color: var(--neon-cyan, #00ffff);
      border-color: var(--neon-cyan, #00ffff);
      box-shadow:
        0 0 10px rgba(0, 255, 255, 0.5),
        0 2px 4px rgba(0, 0, 0, 0.3),
        inset 0 1px 2px rgba(255, 255, 255, 0.2),
        inset 0 -2px 4px rgba(0, 0, 0, 0.3);
      text-shadow: 0 0 5px var(--neon-cyan, #00ffff);
    }

    neon-button button.nb-primary:hover:not(:disabled) {
      background: rgba(0, 212, 255, 0.4);
      box-shadow:
        0 0 20px rgba(0, 212, 255, 0.8),
        0 4px 12px rgba(0, 212, 255, 0.5);
      transform: translateY(-1px);
    }

    neon-button button.nb-primary.nb-icon:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(0, 212, 255, 0.5) 0%, rgba(0, 180, 230, 0.7) 100%);
      box-shadow:
        0 0 20px rgba(0, 255, 255, 0.8),
        0 2px 6px rgba(0, 0, 0, 0.4),
        inset 0 1px 3px rgba(255, 255, 255, 0.3),
        inset 0 -2px 5px rgba(0, 0, 0, 0.4);
      transform: scale(1.1);
    }

    /* ── Secondary (green) ──────────────────────────────── */

    neon-button button.nb-secondary {
      background: rgba(0, 255, 136, 0.2);
      color: var(--accent-green, #00ff88);
      border-color: var(--accent-green, #00ff88);
      box-shadow:
        0 0 10px rgba(0, 255, 136, 0.5),
        0 2px 8px rgba(0, 255, 136, 0.3);
      text-shadow: 0 0 5px var(--accent-green, #00ff88);
    }

    neon-button button.nb-secondary:hover:not(:disabled) {
      background: rgba(0, 255, 136, 0.4);
      box-shadow:
        0 0 20px rgba(0, 255, 136, 0.8),
        0 4px 12px rgba(0, 255, 136, 0.5);
      transform: translateY(-1px);
    }

    /* ── Danger (pink/red) ──────────────────────────────── */

    neon-button button.nb-danger {
      background: rgba(255, 0, 102, 0.2);
      color: #ff0066;
      border-color: #ff0066;
      box-shadow:
        0 0 10px rgba(255, 0, 102, 0.5),
        0 2px 4px rgba(255, 0, 102, 0.3);
      text-shadow: 0 0 5px #ff0066;
    }

    neon-button button.nb-danger:hover:not(:disabled) {
      background: rgba(255, 0, 102, 0.4);
      box-shadow:
        0 0 20px rgba(255, 0, 102, 0.8),
        0 3px 6px rgba(255, 0, 102, 0.5);
      transform: translateY(-1px);
    }

    /* ── Close (alias for danger icon — popover close buttons) ── */

    neon-button button.nb-close {
      background: linear-gradient(135deg, rgba(255, 0, 102, 0.3) 0%, rgba(200, 0, 80, 0.5) 100%);
      color: #ff0066;
      border-color: #ff0066;
      box-shadow:
        0 0 10px rgba(255, 0, 102, 0.5),
        0 2px 4px rgba(0, 0, 0, 0.3),
        inset 0 1px 2px rgba(255, 255, 255, 0.2),
        inset 0 -2px 4px rgba(0, 0, 0, 0.3);
      text-shadow: 0 0 5px #ff0066;
    }

    neon-button button.nb-close:hover:not(:disabled) {
      background: linear-gradient(135deg, rgba(255, 0, 102, 0.5) 0%, rgba(230, 0, 100, 0.7) 100%);
      box-shadow:
        0 0 20px rgba(255, 0, 102, 0.8),
        0 2px 6px rgba(0, 0, 0, 0.4),
        inset 0 1px 3px rgba(255, 255, 255, 0.3),
        inset 0 -2px 5px rgba(0, 0, 0, 0.4);
      transform: scale(1.1);
    }

    /* ── Record (orange/red gradient) ───────────────────── */

    neon-button button.nb-record {
      background: linear-gradient(135deg, var(--accent-orange, #ff3366) 0%, #cc0044 100%);
      color: white;
      border-color: var(--accent-orange, #ff3366);
      box-shadow:
        0 0 20px rgba(255, 51, 102, 0.6),
        0 4px 15px rgba(255, 51, 102, 0.4);
      text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
    }

    neon-button button.nb-record:hover:not(:disabled) {
      background: linear-gradient(135deg, #ff4477 0%, #ff0055 100%);
      box-shadow:
        0 0 30px rgba(255, 51, 102, 0.8),
        0 6px 20px rgba(255, 51, 102, 0.6);
      transform: translateY(-2px);
    }

    /* ── Shared states ──────────────────────────────────── */

    neon-button button:active:not(:disabled) {
      transform: translateY(0) !important;
    }

    neon-button button.nb-icon:active:not(:disabled) {
      transform: scale(0.95) !important;
    }

    neon-button button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }

    neon-button button:focus-visible {
      outline: 2px solid var(--neon-cyan, #00ffff);
      outline-offset: 2px;
    }

    /* ── Responsive ─────────────────────────────────────── */

    @media (max-width: 768px) {
      neon-button button.nb-text {
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
        letter-spacing: 1px;
      }
    }

    @media (max-width: 480px) {
      neon-button button.nb-text {
        padding: 0.35rem 0.6rem;
        font-size: 0.75rem;
        letter-spacing: 0.8px;
      }
    }
  `;
  document.head.appendChild(style);
}

// ─── Forwarded attributes ───────────────────────────────────

const FORWARDED_ATTRS = [
  "id",
  "type",
  "popovertarget",
  "popovertargetaction",
  "aria-label",
  "aria-expanded",
  "title",
  "name",
  "value",
  "formaction",
];

// ─── Component ──────────────────────────────────────────────

export class NeonButton extends HTMLElement {
  private button!: HTMLButtonElement;

  connectedCallback() {
    ensureGlobalStyles();

    const isIcon = this.hasAttribute("icon");
    const variant = (this.getAttribute("variant") || "primary") as Variant;
    const size = (this.getAttribute("size") || "sm") as IconSize;
    const isDisabled = this.hasAttribute("disabled");
    const content = this.innerHTML;

    // Build class list
    const classes = [
      isIcon ? "nb-icon" : "nb-text",
      `nb-${variant}`,
    ];

    if (isIcon) {
      classes.push(`nb-${size}`);
    }

    // Build forwarded attributes string
    const forwardedAttrs = FORWARDED_ATTRS
      .filter((attr) => this.hasAttribute(attr))
      .map((attr) => `${attr}="${this.getAttribute(attr)}"`)
      .join(" ");

    this.innerHTML = `
      <button
        class="${classes.join(" ")}"
        ${forwardedAttrs}
        ${isDisabled ? "disabled" : ""}
      >${content}</button>
    `;

    this.button = this.querySelector("button")!;

    // Bubble click events from the inner button
    this.button.addEventListener("click", (e: Event) => {
      // Native click already bubbles through the custom element,
      // but we stop it from double-firing by not re-dispatching.
      // The native event from the <button> will propagate up.
    });
  }

  // Forward attribute changes
  static get observedAttributes() {
    return ["disabled"];
  }

  attributeChangedCallback(name: string, _old: string, value: string | null) {
    if (name === "disabled" && this.button) {
      this.button.disabled = value !== null;
    }
  }

  getButton(): HTMLButtonElement {
    return this.button;
  }

  get disabled(): boolean {
    return this.button?.disabled ?? false;
  }

  set disabled(value: boolean) {
    if (this.button) {
      this.button.disabled = value;
    }
    if (value) {
      this.setAttribute("disabled", "");
    } else {
      this.removeAttribute("disabled");
    }
  }
}

customElements.define("neon-button", NeonButton);