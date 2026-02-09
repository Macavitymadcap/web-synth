import { jest } from "bun:test"

export function createMockInput(value: string) {
  const listeners: { [type: string]: Function[] } = {};
  
  const addEventListenerMock = jest.fn((type: string, listener: EventListenerOrEventListenerObject) => {
    if (!listeners[type]) {
      listeners[type] = [];
    }
    listeners[type].push(typeof listener === 'function' ? listener : listener.handleEvent);
  });
  
  return {
    value,
    addEventListener: addEventListenerMock,
    dispatchEvent(event: Event) {
      const typeListeners = listeners[event.type] || [];
      typeListeners.forEach(listener => {
        listener.call(this, event);
      });
      return true;
    }
  } as any as HTMLInputElement;
}