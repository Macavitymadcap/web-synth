/**
 * <controls-group> — Flex-wrap layout container for controls
 *
 * Wraps child controls in a styled flex row with consistent spacing and background.
 * This is a pure layout molecule — it has no logic, just presentation.
 *
 * Usage:
 *   <controls-group>
 *     <range-control ...></range-control>
 *     <neon-select ...></neon-select>
 *     <toggle-switch ...></toggle-switch>
 *   </controls-group>
 */

const STYLE_ID = "controls-group-styles";

function ensureGlobalStyles(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
    controls-group {
      display: block;
    }

    controls-group .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      align-items: center;
      justify-content: space-around;
      padding: 1rem;
      background: var(--panel-bg);
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    controls-group .controls > * {
      flex: 0 1 auto;
      min-width: fit-content;
    }

    @media (max-width: 640px) {
      controls-group .controls {
        gap: 0.75rem;
        padding: 0.75rem;
      }
    }
  `;
  document.head.appendChild(style);
}

export class ControlsGroup extends HTMLElement {
  connectedCallback() {
    ensureGlobalStyles();

    const content = this.innerHTML;
    this.innerHTML = `<div class="controls">${content}</div>`;
  }
}

customElements.define("controls-group", ControlsGroup);