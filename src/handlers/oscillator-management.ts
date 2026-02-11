// The oscillator-management handler may become unnecessary since
// bank-section handles add/remove and bank-item handles config.
// The OscillatorBank just needs the config array from bank-section.getItems().

// If you still need the handler pattern:
import type { BankSection } from "../components/molecules/bank-section";
import { OscillatorBank, OscillatorConfig } from "../core/oscillator-bank";

export function createOscillatorManager(
  oscBank: BankSection,
  oscillatorBank: OscillatorBank
) {
  function syncConfigs() {
    oscillatorBank.setConfigs(oscBank.getItems() as OscillatorConfig[]);
  }

  function initialize() {
    syncConfigs();
    oscBank.addEventListener('oscillators-changed', () => syncConfigs());
  }

  return { initialize };
}