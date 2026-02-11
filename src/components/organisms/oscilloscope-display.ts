import { GlobalStyleService } from "../../services/global-style-service";

const STYLE_ID = "oscilloscope-styles";
const styles = `
.oscilloscope-canvas {
  width: stretch;
  height: 120px;
  background: #0a0015;
  border-radius: 8px;
  border: 2px solid var(--neon-cyan);
  box-shadow: 0 0 20px rgba(0,255,255,0.3);
  display: block;
}
`;

export class OscilloscopeDisplay extends HTMLElement {
  private canvas!: HTMLCanvasElement;

  connectedCallback() {
    GlobalStyleService.ensureStyles(STYLE_ID, styles);
    this.innerHTML = `
      <module-section id="oscilloscope-section" title="Oscilloscope">
        <div slot="instructions">
          <p>Real-time waveform visualization showing the time-domain shape of the audio signal.</p>
          <instructions-list>
            <instruction-item label="Waveform Display">
              Shows how the audio signal varies over time, useful for understanding sound shape and effects.
            </instruction-item>
          </instructions-list>
        </div>
        <div slot="content">
          <controls-group>
            <toggle-switch id="oscilloscope-enabled" label="Enable"></toggle-switch>
          </controls-group>
          <canvas class="oscilloscope-canvas"></canvas>
        </div>
      </module-section>
    `;
    this.canvas = this.querySelector('.oscilloscope-canvas') as HTMLCanvasElement;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}

customElements.define('oscilloscope-display', OscilloscopeDisplay);