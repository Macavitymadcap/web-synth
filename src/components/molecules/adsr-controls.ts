/**
 * <adsr-controls> — ADSR envelope controls molecule
 *
 * A convenience wrapper that renders four range-controls for
 * Attack, Decay, Sustain, and Release. Uses a prefix attribute
 * to namespace IDs (e.g. prefix="filter-" gives "filter-attack").
 *
 * Usage:
 *   <adsr-controls prefix="" attack="0.01" decay="0.01" sustain="0.7" release="0.5"></adsr-controls>
 *   <adsr-controls prefix="filter-" attack="0.1" decay="0.3" sustain="0.5" release="0.5"></adsr-controls>
 */

export class ADSRControls extends HTMLElement {
  connectedCallback() {
    const prefix = this.getAttribute("prefix") || "";
    const attack = this.getAttribute("attack") || "0.01";
    const decay = this.getAttribute("decay") || "0.01";
    const sustain = this.getAttribute("sustain") || "0.7";
    const release = this.getAttribute("release") || "0.5";

    this.innerHTML = `
      <controls-group>
        <range-control label="Attack"  id="${prefix}attack"  min="0.001" max="2" step="0.001" value="${attack}"  formatter="seconds"></range-control>
        <range-control label="Decay"   id="${prefix}decay"   min="0.001" max="2" step="0.001" value="${decay}"   formatter="seconds"></range-control>
        <range-control label="Sustain" id="${prefix}sustain" min="0"     max="1" step="0.01"  value="${sustain}" formatter="percent"></range-control>
        <range-control label="Release" id="${prefix}release" min="0.01"  max="3" step="0.01"  value="${release}" formatter="seconds"></range-control>
      </controls-group>
    `;
  }
}

customElements.define("adsr-controls", ADSRControls);