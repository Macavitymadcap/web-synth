import { SettingsManager } from "../../core/settings-manager";
import { FACTORY_PRESETS } from "../../core/factory-presets";
import { GlobalStyleService } from "../../services/global-style-service";

const STYLE_ID = "preset-selector-styles";

const styles = `
.preset-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.preset-select {
  flex: 2 1 300px;
  padding: 0.5rem;
  border: 2px solid var(--neon-cyan);
  border-radius: 4px;
  background: rgba(10, 0, 21, 0.8);
  color: var(--text-primary);
  font-size: 0.9rem;
  box-shadow: 0 0 10px rgba(0, 255, 255, 0.3);
  text-shadow: 0 0 5px var(--text-primary);
  transition: all 0.2s ease;
}

.preset-select:hover {
  border-color: var(--neon-pink);
  box-shadow: 0 0 15px rgba(255, 0, 255, 0.5);
}

.preset-select:focus {
  outline: none;
  border-color: var(--neon-pink);
  box-shadow: 0 0 20px rgba(255, 0, 255, 0.6);
}

.preset-select option,
.preset-select optgroup {
  background: #0a0015;
  color: var(--text-primary);
}

.preset-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1 1 400px;
  min-width: 0;
}

.preset-buttons button {
  flex: 1 1 auto;
  min-width: fit-content;
}

@media (max-width: 640px) {
  .preset-select {
    width: 100%;
    flex: 1 1 100%;
  }
  
  .preset-buttons {
    width: 100%;
  }
}
`;

export class PresetSelector extends HTMLElement {
  private settingsManager?: SettingsManager;

  connectedCallback() {
    GlobalStyleService.ensureStyles(STYLE_ID, styles);
    this.render();
    this.setupEventListeners();
  }

  setSettingsManager(manager: SettingsManager): void {
    this.settingsManager = manager;
  }

  private render() {
    this.innerHTML = `
      <div class="preset-controls">
        <select class="preset-select" id="preset-select">
          <option value="">-- Select Preset --</option>
          <optgroup label="Factory Presets">
            ${FACTORY_PRESETS.map(p => `<option value="factory:${p.name}">${p.name}</option>`).join("")}
          </optgroup>
          <optgroup label="User Presets" id="user-presets-group">
            ${this.getUserPresetsOptions()}
          </optgroup>
        </select>

        <div class="preset-buttons">
          <neon-button id="load-preset">
            Load  
          </neon-button>
          <neon-button id="save-preset" variant="secondary">
            Save As...
          </neon-button>
          <neon-button id="export-settings">
            Export
          </neon-button>
          <neon-button id="import-settings">
            Import
          </neon-button>
        </div>
      </div>
    `;
  }

  private getUserPresetsOptions(): string {
    if (!this.settingsManager) return "";

    const userPresets = this.settingsManager.getUserPresets();
    return userPresets.map(p => `<option value="user:${p.name}">${p.name}</option>`).join("");
  }

  private setupEventListeners() {
    const loadBtn = this.querySelector("#load-preset");
    const saveBtn = this.querySelector("#save-preset");
    const exportBtn = this.querySelector("#export-settings");
    const importBtn = this.querySelector("#import-settings");

    loadBtn?.addEventListener("click", () => this.loadPreset());
    saveBtn?.addEventListener("click", () => this.savePreset());
    exportBtn?.addEventListener("click", () => this.exportSettings());
    importBtn?.addEventListener("click", () => this.importSettings());
  }

  private loadPreset() {
    if (!this.settingsManager) return;

    const select = this.querySelector("#preset-select") as HTMLSelectElement;
    const value = select.value;

    if (!value) return;

    const [type, name] = value.split(":");

    if (type === "factory") {
      const preset = FACTORY_PRESETS.find(p => p.name === name);
      if (preset) {
        this.settingsManager.applySettings(preset.settings);
        this.settingsManager.saveToLocalStorage();
      }
    } else if (type === "user") {
      const preset = this.settingsManager.getUserPresets().find(p => p.name === name);
      if (preset) {
        this.settingsManager.applySettings(preset.settings);
        this.settingsManager.saveToLocalStorage();
      }
    }
  }

  private savePreset() {
    if (!this.settingsManager) return;

    const name = prompt("Enter preset name:");
    if (!name) return;

    const description = prompt("Enter preset description (optional):");
    
    this.settingsManager.saveUserPreset(name, description || undefined);
    this.render(); // Refresh to show new preset
    alert(`Preset "${name}" saved!`);
  }

  private exportSettings() {
    if (!this.settingsManager) return;

    const json = this.settingsManager.exportToJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `web-synth-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private importSettings() {
    if (!this.settingsManager) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      const success = this.settingsManager!.importFromJSON(text);
      
      if (success) {
        this.settingsManager!.saveToLocalStorage();
        alert("Settings imported successfully!");
      } else {
        alert("Failed to import settings. Invalid file format.");
      }
    };

    input.click();
  }
}

customElements.define("preset-selector", PresetSelector);