/**
 * LFO Module Controls - Reusable component with configurable prefix
 * Can be instantiated multiple times for LFO1, LFO2, etc.
 */
export class LFOModuleControls extends HTMLElement {
  connectedCallback() {
    // Get configuration from attributes with defaults
    const prefix = this.getAttribute('prefix') || 'lfo';
    const title = this.getAttribute('title') || 'LFO';
    const moduleId = this.getAttribute('module-id') || `${prefix}-module`;
    const number = this.getAttribute('number') || '';
    const defaultWaveform = this.getAttribute('default-waveform') || 'sine';
    const defaultRate = this.getAttribute('default-rate') || '5';

    // Customize instructions based on LFO number
    const otherLfoNumber = number === '2' ? '1' : '2';
    const instructions = number 
      ? `Second independent LFO for additional modulation and complex movement. Can be used alongside LFO ${otherLfoNumber} for richer, more evolving sounds.`
      : 'The LFO modulates parameters like filter cutoff and pitch to add movement and variation to the sound.';

    this.innerHTML = `
      <module-section id="${moduleId}" title="${title}">
        <div slot="instructions">
          <p>${instructions}</p>

          <instruction-list>
            <instruction-item label="Waveform">Shape of the modulation wave</instruction-item>
            <instruction-item label="Rate">Speed of modulation (0.1 - 20 Hz)</instruction-item>
            <instruction-item label="To Filter">Amount of filter cutoff wobble (0 - 5000 Hz)</instruction-item>
            <instruction-item label="To Pitch">Amount of pitch vibrato (0 - 100 cents)</instruction-item>
          </instruction-list>
        </div>

        <div slot="content">
          <controls-group>
            <neon-select 
              id="${prefix}-waveform" 
              label="Waveform" 
              type="lfo-waveform" 
              value="${defaultWaveform}"
            ></neon-select>
            <range-control 
              label="Rate" 
              id="${prefix}-rate" 
              min="0.1" 
              max="20" 
              step="0.1" 
              value="${defaultRate}"
              formatter="hertz">
            </range-control>
            <range-control 
              label="To Filter" 
              id="${prefix}-to-filter" 
              min="0" 
              max="5000" 
              step="10" 
              value="0"
              formatter="hertz">
            </range-control>
            <range-control 
              label="To Pitch" 
              id="${prefix}-to-pitch" 
              min="0" 
              max="100" 
              step="1" 
              value="0"
              formatter="cents">
            </range-control>
          </controls-group>
        </div>
      </module-section>
    `;
  }
}

customElements.define('lfo-module-controls', LFOModuleControls);