import { SettingsManager, FACTORY_PRESETS } from "../core/settings-manager";

class PresetSelector extends HTMLElement {
  private settingsManager?: SettingsManager;

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  setSettingsManager(manager: SettingsManager): void {
    this.settingsManager = manager;
  }

  private render() {
    this.innerHTML = `
      <style>
        .preset-controls {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .preset-select {
          flex: 1;
          min-width: 200px;
          padding: 0.5rem;
          border: 1px solid var(--border-color, #ccc);
          border-radius: 4px;
          background: var(--bg-color, white);
          color: var(--text-color, black);
          font-size: 0.9rem;
        }

        .preset-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .preset-btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          background: var(--primary-color, #007bff);
          color: white;
          cursor: pointer;
          font-size: 0.9rem;
          transition: background 0.2s;
        }

        .preset-btn:hover {
          background: var(--primary-hover, #0056b3);
        }

        .preset-btn.secondary {
          background: var(--secondary-color, #6c757d);
        }

        .preset-btn.secondary:hover {
          background: var(--secondary-hover, #545b62);
        }
      </style>

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
          <button class="preset-btn" id="load-preset">Load</button>
          <button class="preset-btn secondary" id="save-preset">Save As...</button>
          <button class="preset-btn secondary" id="export-settings">Export</button>
          <button class="preset-btn secondary" id="import-settings">Import</button>
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