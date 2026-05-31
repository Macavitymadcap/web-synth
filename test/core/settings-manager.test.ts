import { beforeEach, describe, expect, test } from "bun:test";
import { FACTORY_PRESETS } from "../../src/core/factory-presets";
import { SettingsManager } from "../../src/core/settings-manager";
import {
  DEFAULT_ARPEGGIATOR_SETTINGS,
  type SynthSettings,
} from "../../src/core/settings.model";

const STORAGE_KEY = "web-synth-settings";
const USER_PRESETS_KEY = "web-synth-user-presets";

function createLegacySettings(): Partial<SynthSettings> {
  const settings = new SettingsManager().getCurrentSettings();
  const { arpeggiator: _arpeggiator, ...legacySettings } = settings;
  return legacySettings;
}

describe("SettingsManager arpeggiator schema", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
  });

  test("includes default arpeggiator settings in current settings exports", () => {
    const settings = new SettingsManager().getCurrentSettings();

    expect(settings.arpeggiator).toEqual(DEFAULT_ARPEGGIATOR_SETTINGS);
  });

  test("normalizes saved settings that predate arpeggiator fields", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(createLegacySettings()));

    const loaded = new SettingsManager().loadFromLocalStorage();

    expect(loaded?.arpeggiator).toEqual(DEFAULT_ARPEGGIATOR_SETTINGS);
  });

  test("imports legacy JSON without arpeggiator fields", () => {
    const manager = new SettingsManager();
    const success = manager.importFromJSON(JSON.stringify(createLegacySettings()));

    expect(success).toBe(true);
  });

  test("normalizes user presets that predate arpeggiator fields", () => {
    localStorage.setItem(
      USER_PRESETS_KEY,
      JSON.stringify([{ name: "Legacy", settings: createLegacySettings() }]),
    );

    const [preset] = new SettingsManager().getUserPresets();

    expect(preset.settings.arpeggiator).toEqual(DEFAULT_ARPEGGIATOR_SETTINGS);
  });

  test("factory presets include arpeggiator defaults", () => {
    expect(FACTORY_PRESETS.length).toBeGreaterThan(0);
    expect(
      FACTORY_PRESETS.every(
        (preset) =>
          preset.settings.arpeggiator !== DEFAULT_ARPEGGIATOR_SETTINGS &&
          JSON.stringify(preset.settings.arpeggiator) ===
            JSON.stringify(DEFAULT_ARPEGGIATOR_SETTINGS),
      ),
    ).toBe(true);
  });
});
