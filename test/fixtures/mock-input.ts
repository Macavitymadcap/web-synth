import { jest  } from "bun:test"

export function createMockInput(value: string) {
  return {
    value,
    addEventListener: jest.fn()
  } as any as HTMLInputElement;
}

export function createMockAudioCtx() {
  return {
    createGain: jest.fn(() => ({
      gain: { value: 1 },
      connect: jest.fn(),
      disconnect: jest.fn()
    })),
    createDelay: jest.fn(() => ({
      delayTime: { value: 0 },
      connect: jest.fn(),
      disconnect: jest.fn()
    })),
    createOscillator: jest.fn(() => ({
      type: 'sine',
      frequency: { value: 0 },
      connect: jest.fn(),
      disconnect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn()
    })),
    createBiquadFilter: jest.fn(() => ({
      type: 'allpass',
      frequency: { value: 0 },
      Q: { value: 0 },
      gain: { value: 0 },
      connect: jest.fn(),
      disconnect: jest.fn()
    })),

  } as any as AudioContext;
}