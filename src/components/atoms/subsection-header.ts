/**
 * <subsection-header> — Section divider within modules
 *
 * Usage:
 *   <subsection-header text="Filter Envelope"></subsection-header>
 */

const STYLE_ID = "subsection-header-styles";

function ensureGlobalStyles(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
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
  document.head.appendChild(style);
}

export class SubsectionHeader extends HTMLElement {
  connectedCallback() {
    ensureGlobalStyles();

    const text = this.getAttribute("text") || this.textContent || "";
    this.innerHTML = `<h3>${text}</h3>`;
  }
}

customElements.define("subsection-header", SubsectionHeader);