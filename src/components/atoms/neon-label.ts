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

import { GlobalStyleService } from "../../services/global-style-service";

const STYLE_ID = "neon-label-styles";
const styles = `
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

export class NeonLabel extends HTMLElement {
  connectedCallback() {
    GlobalStyleService.ensureStyles(STYLE_ID, styles);
    const text = this.getAttribute("text");
    if (text) {
      this.textContent = text;
    }
    // Otherwise, keep existing textContent from slot
  }
}

customElements.define("neon-label", NeonLabel);