export class PresetsControls extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
       <module-section id="presets" title="Presets">
        <div slot="instructions">
          <p>Load factory presets or save your own custom sounds.</p>

          <instruction-list>
            <instruction-item label="Load Preset">Select a preset and click "Load" to apply settings</instruction-item>
            <instruction-item label="Save Preset">Click "Save As..." to save current settings as a new
              preset</instruction-item>
            <instruction-item label="Export">Download current settings as a JSON file</instruction-item>
            <instruction-item label="Import">Load settings from a previously exported JSON file</instruction-item>
          </instruction-list>
        </div>

        <div slot="content">
          <preset-selector></preset-selector>
        </div>
      </module-section>
    `;
  }
}
customElements.define('presets-controls', PresetsControls);