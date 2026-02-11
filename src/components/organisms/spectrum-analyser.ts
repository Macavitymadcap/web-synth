const STYLE_ID = "spectrum-analyser-styles";

function ensureGlobalStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
      .analyser-canvas {
      width: stretch;
      height: 120px;
      background: #0a0015;
      border-radius: 8px;
      border: 2px solid var(--neon-cyan);
      box-shadow: 0 0 20px rgba(0,255,255,0.3);
      display: block;
    }
  `;

  document.head.appendChild(style);
}

export class SpectrumAnalyser extends HTMLElement {
  private canvas!: HTMLCanvasElement;

  connectedCallback() {
    ensureGlobalStyles();
    this.innerHTML = `
      <module-section id="spectrum-analyser" title="Analyser">
        <div slot="instructions">
          <instructions-list>
            <instruction-item label="Frequency Spectrum">
              Visualizes the real-time frequency content of the audio signal.
            </instruction-item>
          </instructions-list>
        </div>
        <div slot="content">
          <canvas class="analyser-canvas"></canvas>
        </div>
      </module-section>
    `;
    this.canvas = this.querySelector('.analyser-canvas') as HTMLCanvasElement;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}
customElements.define('spectrum-analyser', SpectrumAnalyser);