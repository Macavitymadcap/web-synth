/**
 * <neon-label> — Styled label atom
 *
 * Eliminates the duplicated uppercase/glowing label styling that appears
 * in nearly every component. Provides a consistent typographic treatment
 * for control labels throughout the synth UI.
 *
 * Usage:
 *   <neon-label>Filter Type</neon-label>
 *   <neon-label text="Waveform"></neon-label>
 *
 * Attributes:
 *   text — Label text (alternative to slot content)
 *
 * The label text can be set either via the `text` attribute or as
 * the element's text content. Attribute takes priority.
 */

const STYLE_ID = "neon-label-styles";

function ensureGlobalStyles(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    neon-label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      text-shadow: 0 0 5px var(--text-secondary);
      line-height: 1.4;
    }
  `;
  document.head.appendChild(style);
}

export class NeonLabel extends HTMLElement {
  connectedCallback() {
    ensureGlobalStyles();

    const text = this.getAttribute("text");
    if (text) {
      this.textContent = text;
    }
    // Otherwise, keep existing textContent from slot
  }
}

customElements.define("neon-label", NeonLabel);