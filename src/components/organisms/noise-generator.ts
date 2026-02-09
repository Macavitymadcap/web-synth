export class NoiseGenerator extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <module-section id="noise-generator" title="Noise Generator">
        <div slot="instructions">
          <instruction-list>
            <instruction-item label="Type">
              White (full frequency spectrum), Pink (natural 1/f), Brown (low frequency emphasis)
            </instruction-item>
            <instruction-item label="Level">
              Mix amount of noise with oscillators (0-100%)
            </instruction-item>
            <instruction-item label="Enable">
              Toggle noise generator on/off
            </instruction-item>
          </instruction-list>
        </div>
        
        <div slot="content">
          <controls-group>
            <label>
              <span style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Noise Type</span>
              <select id="noise-type" style="padding: 0.5rem; border: 2px solid var(--neon-cyan); border-radius: 4px; background: rgba(10, 0, 21, 0.8); color: var(--neon-cyan); cursor: pointer;">
                <option value="white">White</option>
                <option value="pink">Pink</option>
                <option value="brown">Brown</option>
              </select>
            </label>
            
            <range-control 
              label="Level" 
              id="noise-level" 
              min="0" 
              max="1" 
              step="0.01" 
              value="0.3"
              formatter="percentage">
            </range-control>
            
            <toggle-switch 
              id="noise-enabled" 
              label="Enabled">
            </toggle-switch>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}
customElements.define('noise-generator', NoiseGenerator);