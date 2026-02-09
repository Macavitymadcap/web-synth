import { LFOModule } from "../modules/lfo-module";
import type { LFOSection } from "../components/organisms/lfo-bank/lfo-section";

export function createLFOManager(
  lfoSection: LFOSection,
  lfoModules: LFOModule[],
  onLFOsChange: (lfos: LFOModule[]) => void
) {
  const lfoModuleMap = new Map<number, LFOModule>();

  function syncLFOModules() {
    const lfoConfigs = lfoSection.getLFOs();
    
    // Clear old modules
    lfoModuleMap.clear();
    
    // Create new modules for each LFO
    lfoConfigs.forEach((_, index) => {
      const id = (index + 1).toString();
      lfoModuleMap.set(index + 1, new LFOModule(id));
    });
    
    // ✅ Mutate the array in place
    lfoModules.length = 0;
    lfoModules.push(...Array.from(lfoModuleMap.values()));
    
    // Notify parent
    onLFOsChange(lfoModules);
  }

  function initialize() {
    // Initial sync - populates the array
    syncLFOModules();
    
    // Listen for changes - parent will handle via event listener
    lfoSection.addEventListener('lfos-changed', () => {
      syncLFOModules();
    });
  }

  return {
    initialize,
    getLFOModules: () => lfoModules
  };
}