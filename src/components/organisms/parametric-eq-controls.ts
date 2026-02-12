/**
 * <parametric-eq-controls> - Custom organism for parametric EQ UI
 * 
 * Provides a visually organized 5-band EQ interface with proper grouping.
 * Each band is contained in its own visual group for clarity.
 */

import { GlobalStyleService } from "../../services/global-style-service";

const STYLE_ID = "parametric-eq-controls-styles";

const styles = /* css */`
.eq-bands-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  padding: 1rem;
  background: var(--panel-bg);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.eq-band {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(10, 0, 21, 0.6) 100%);
  border: 1px solid rgba(255, 0, 255, 0.3);
  border-radius: 6px;
  transition: all 0.3s ease;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.eq-band:hover {
  border-color: var(--neon-pink);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.4);
  transform: translateY(-2px);
}

.eq-band-title {
  font-size: 0.7rem;
  color: var(--neon-pink);
  text-transform: lowercase;
  letter-spacing: 1px;
  font-weight: 700;
  text-align: center;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 0, 255, 0.3);
  text-shadow: 0 0 10px var(--neon-pink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.eq-band-type {
  font-size: 0.6rem;
  color: var(--text-secondary);
  text-transform: none;
  letter-spacing: 0.5px;
  font-weight: 500;
  display: block;
  margin-top: 0.25rem;
}

/* Controls container - horizontal layout */
.eq-band-controls {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: flex-start;
  justify-content: space-between;
}

.eq-band-controls > range-control {
  flex: 1;
  min-width: 0;
}

/* Compact sizing for labels */
.eq-band-controls range-control label {
  font-size: 0.65rem;
  gap: 0.25rem;
}

.eq-band-controls range-control .range-value {
  font-size: 0.75rem;
  padding: 0.2rem 0.4rem;
}

.eq-master-controls {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--panel-bg);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: center;
}

/* Responsive: stack on smaller screens */
@media (max-width: 900px) {
  .eq-bands-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .eq-bands-container {
    grid-template-columns: 1fr;
  }
}
`;

export class ParametricEQControls extends HTMLElement {
  connectedCallback() {
    GlobalStyleService.ensureStyles(STYLE_ID, styles);

    this.innerHTML = /* html */`
      <module-section id="parametric-eq" title="Parametric EQ">
        <div slot="instructions">
          <p>5-band parametric equalizer for precise frequency shaping. Low Shelf and High Shelf have wide, gentle slopes. The three mid bands are bell filters for surgical control.</p>
          <instruction-list>
            <instruction-item label="Low Shelf">Sub-bass and bass control (20-200 Hz)</instruction-item>
            <instruction-item label="Low Mid">Body and warmth region (100-500 Hz)</instruction-item>
            <instruction-item label="Mid">Presence and clarity (400-2000 Hz)</instruction-item>
            <instruction-item label="High Mid">Air and brilliance (2-8 kHz)</instruction-item>
            <instruction-item label="High Shelf">Sparkle and shimmer (4-20 kHz)</instruction-item>
            <instruction-item label="Gain">Boost (+) or cut (-) in decibels (±12 dB)</instruction-item>
            <instruction-item label="Q">Bandwidth/slope - lower = wider, higher = narrower</instruction-item>
          </instruction-list>
        </div>
        <div slot="content">
          <div class="eq-bands-container">
            <!-- Low Shelf Band -->
            <div class="eq-band">
              <div class="eq-band-title">
                Low Shelf
                <span class="eq-band-type">Shelving Filter</span>
              </div>
              <div class="eq-band-controls">
                <range-control id="eq-low-shelf-freq" label="Frequency" 
                  min="20" max="200" step="1" value="80" formatter="hz"></range-control>
                <range-control id="eq-low-shelf-gain" label="Gain" 
                  min="-12" max="12" step="0.5" value="0" formatter="db"></range-control>
                <range-control id="eq-low-shelf-q" label="Q" 
                  min="0.1" max="2" step="0.1" value="1"></range-control>
              </div>
            </div>

            <!-- Low Mid Band -->
            <div class="eq-band">
              <div class="eq-band-title">
                Low Mid
                <span class="eq-band-type">250 Hz • Bell</span>
              </div>
              <div class="eq-band-controls">
                <range-control id="eq-low-mid-freq" label="Frequency" 
                  min="100" max="500" step="10" value="250" formatter="hz"></range-control>
                <range-control id="eq-low-mid-gain" label="Gain" 
                  min="-12" max="12" step="0.5" value="0" formatter="db"></range-control>
                <range-control id="eq-low-mid-q" label="Q" 
                  min="0.1" max="5" step="0.1" value="1"></range-control>
              </div>
            </div>

            <!-- Mid Band -->
            <div class="eq-band">
              <div class="eq-band-title">
                Mid
                <span class="eq-band-type">1 kHz • Bell</span>
              </div>
              <div class="eq-band-controls">
                <range-control id="eq-mid-freq" label="Frequency" 
                  min="400" max="2000" step="10" value="1000" formatter="hz"></range-control>
                <range-control id="eq-mid-gain" label="Gain" 
                  min="-12" max="12" step="0.5" value="0" formatter="db"></range-control>
                <range-control id="eq-mid-q" label="Q" 
                  min="0.1" max="5" step="0.1" value="1"></range-control>
              </div>
            </div>

            <!-- High Mid Band -->
            <div class="eq-band">
              <div class="eq-band-title">
                High Mid
                <span class="eq-band-type">4 kHz • Bell</span>
              </div>
              <div class="eq-band-controls">
                <range-control id="eq-high-mid-freq" label="Frequency" 
                  min="2000" max="8000" step="100" value="4000" formatter="hz"></range-control>
                <range-control id="eq-high-mid-gain" label="Gain" 
                  min="-12" max="12" step="0.5" value="0" formatter="db"></range-control>
                <range-control id="eq-high-mid-q" label="Q" 
                  min="0.1" max="5" step="0.1" value="1"></range-control>
              </div>
            </div>

            <!-- High Shelf Band -->
            <div class="eq-band">
              <div class="eq-band-title">
                High Shelf
                <span class="eq-band-type">Shelving Filter</span>
              </div>
              <div class="eq-band-controls">
                <range-control id="eq-high-shelf-freq" label="Frequency" 
                  min="4000" max="20000" step="100" value="12000" formatter="hz"></range-control>
                <range-control id="eq-high-shelf-gain" label="Gain" 
                  min="-12" max="12" step="0.5" value="0" formatter="db"></range-control>
                <range-control id="eq-high-shelf-q" label="Q" 
                  min="0.1" max="2" step="0.1" value="1"></range-control>
              </div>
            </div>
          </div>
        </div>
      </module-section>
    `;
  }
}

customElements.define('parametric-eq-controls', ParametricEQControls);