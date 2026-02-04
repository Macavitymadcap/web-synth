export class ADSRControls extends HTMLElement {
  connectedCallback() {
    const prefix = this.getAttribute('prefix') || '';
    const attackValue = this.getAttribute('attack') || '0.01';
    const decayValue = this.getAttribute('decay') || '0.01';
    const sustainValue = this.getAttribute('sustain') || '0.7';
    const releaseValue = this.getAttribute('release') || '0.5';
    
    this.innerHTML = `
      <style>
        adsr-controls {
          display: block;
        }
      </style>
      <controls-group>
        <range-control label="Attack" id="${prefix}attack" min="0.001" max="2" step="0.001" value="${attackValue}" formatter="seconds">
        </range-control>

        <range-control label="Decay" id="${prefix}decay" min="0.001" max="2" step="0.001" value="${decayValue}" formatter="seconds">
        </range-control>

        <range-control label="Sustain" id="${prefix}sustain" min="0" max="1" step="0.01" value="${sustainValue}" formatter="percentage">
        </range-control>

        <range-control label="Release" id="${prefix}release" min="0.01" max="3" step="0.01" value="${releaseValue}" formatter="seconds">
        </range-control>
      </controls-group>
    `;
  }
}

customElements.define('adsr-controls', ADSRControls);