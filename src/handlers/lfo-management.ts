import type { BankSection } from "../components/molecules/bank-section";
import { LFOModule } from "../modules/lfo-module";

export function createLFOManager(
  lfoBank: BankSection,
  lfoModules: LFOModule[],
  onLFOsChange: (lfos: LFOModule[]) => void
) {
  function syncLFOModules() {
    const configs = lfoBank.getItems();
    
    lfoModules.length = 0;
    configs.forEach((_, index) => {
      const id = (index + 1).toString();
      lfoModules.push(new LFOModule(id));
    });
    
    onLFOsChange(lfoModules);
  }

  function initialize() {
    syncLFOModules();
    lfoBank.addEventListener('lfos-changed', () => syncLFOModules());
  }

  return { initialize, getLFOModules: () => lfoModules };
}