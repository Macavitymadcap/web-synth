/**
 * <subsection-header> — Section divider within modules
 *
 * Usage:
 *   <subsection-header text="Filter Envelope"></subsection-header>
 */

import { GlobalStyleService } from "../../services/global-style-service";

const STYLE_ID = "subsection-header-styles";

const styles = `
subsection-header h3 {
  color: var(--text-secondary);
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 1.5rem 0 0.75rem 0;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 0, 255, 0.3);
  text-shadow: 0 0 10px var(--text-secondary);
}
`;

export class SubsectionHeader extends HTMLElement {
  connectedCallback() {
    GlobalStyleService.ensureStyles(STYLE_ID, styles);
    const text = this.getAttribute("text") || this.textContent || "";
    this.innerHTML = `<h3>${text}</h3>`;
  }
}

customElements.define("subsection-header", SubsectionHeader);