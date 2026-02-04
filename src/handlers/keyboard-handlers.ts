import type { Synth } from "../core/synth";

export function createKeyboardHandlers(synth: Synth) {
  // Track active pointer touches
  const activePointers = new Map<number, string>();

  const keyDownHandler = (ev: KeyboardEvent) => {
    if (ev.repeat) return;
    
    const keyElement = document.querySelector(`[data-key="${ev.key}"]`);
    if (keyElement) {
      keyElement.classList.add("active");
    }
    
    synth.noteOn(ev.key);
  };

  const keyUpHandler = (ev: KeyboardEvent) => {
    const keyElement = document.querySelector(`[data-key="${ev.key}"]`);
    if (keyElement) {
      keyElement.classList.remove("active");
    }
    
    synth.stopVoice(ev.key);
  };

  const pointerDownHandler = (ev: PointerEvent) => {
    const target = ev.target as HTMLElement;
    const keyElement = target.closest(".key") as HTMLElement;
    if (!keyElement) return;
    
    const key = keyElement.dataset.key;
    if (key) {
      // Track this pointer ID with the key
      activePointers.set(ev.pointerId, key);
      
      keyElement.classList.add("active");
      synth.noteOn(key);
      
      // Capture pointer to ensure we get pointerup even if finger moves
      keyElement.setPointerCapture(ev.pointerId);
    }
  };

  const pointerUpHandler = (ev: PointerEvent) => {
    // Check if we have a tracked key for this pointer
    const key = activePointers.get(ev.pointerId);
    
    if (key) {
      // Find and deactivate the key element
      const keyElement = document.querySelector(`[data-key="${key}"]`);
      if (keyElement) {
        keyElement.classList.remove("active");
      }
      
      synth.stopVoice(key);
      activePointers.delete(ev.pointerId);
    }
  };

  const pointerCancelHandler = (ev: PointerEvent) => {
    // Handle pointer cancel (e.g., user drags off screen)
    pointerUpHandler(ev);
  };

  return {
    keyDownHandler,
    keyUpHandler,
    pointerDownHandler,
    pointerUpHandler,
    pointerCancelHandler
  };
}