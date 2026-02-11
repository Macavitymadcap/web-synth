import { GlobalStyleService } from "../../services/global-style-service";

const STYLE_ID = "spectrum-analyser-styles";
const styles = `
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

export class SpectrumAnalyser extends HTMLElement {
  private canvas!: HTMLCanvasElement;

  connectedCallback() {
    GlobalStyleService.ensureStyles(STYLE_ID, styles);
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
          <controls-group>
            <toggle-switch id="spectrum-analyser-enabled" label="Enable"></toggle-switch>
          </controls-group>
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