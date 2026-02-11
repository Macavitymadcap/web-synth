import { afterEach, describe, it, expect, beforeEach, jest } from 'bun:test';
import { SpectrumAnalyserModule } from '../../../src/modules/effects/spectrum-analyser-module';
import { createMockAudioCtx } from '../../fixtures/mock-audio-context';

// Mock canvas and 2D context
function createMockCanvas() {
  const mockContext = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    fillStyle: '',
  };

  return {
    width: 800,
    height: 400,
    getContext: jest.fn(() => mockContext),
    __mockContext: mockContext
  } as any as HTMLCanvasElement;
}

// Mock requestAnimationFrame and cancelAnimationFrame
const originalRAF = globalThis.requestAnimationFrame;
const originalCAF = globalThis.cancelAnimationFrame;
let rafCallbacks: Map<number, FrameRequestCallback> = new Map();
let rafId = 0;

function setupAnimationFrameMocks() {
  rafCallbacks = new Map();
  rafId = 0;

  globalThis.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
    const id = ++rafId;
    rafCallbacks.set(id, callback);
    return id;
  });

  globalThis.cancelAnimationFrame = jest.fn((id: number) => {
    rafCallbacks.delete(id);
  });
}

function teardownAnimationFrameMocks() {
  globalThis.requestAnimationFrame = originalRAF;
  globalThis.cancelAnimationFrame = originalCAF;
  rafCallbacks.clear();
}

describe('SpectrumAnalyserModule (UIConfigService)', () => {
  let canvas: HTMLCanvasElement;
  let module: SpectrumAnalyserModule;

  beforeEach(() => {
    setupAnimationFrameMocks();
    document.body.innerHTML = '';

    // Add enable toggle
    const enabledToggle = document.createElement('input');
    enabledToggle.id = 'spectrum-analyser-enabled';
    enabledToggle.type = 'checkbox';
    enabledToggle.checked = false;
    document.body.appendChild(enabledToggle);

    // Optional UI controls for config
    const fftEl = document.createElement('input');
    fftEl.id = 'spectrum-fft-size';
    fftEl.type = 'number';
    fftEl.value = '4096';
    document.body.appendChild(fftEl);

    const smoothEl = document.createElement('input');
    smoothEl.id = 'spectrum-smoothing';
    smoothEl.type = 'number';
    smoothEl.value = '0.6';
    document.body.appendChild(smoothEl);

    const minEl = document.createElement('input');
    minEl.id = 'spectrum-min-freq';
    minEl.type = 'number';
    minEl.value = '50';
    document.body.appendChild(minEl);

    const maxEl = document.createElement('input');
    maxEl.id = 'spectrum-max-freq';
    maxEl.type = 'number';
    maxEl.value = '8000';
    document.body.appendChild(maxEl);

    canvas = createMockCanvas();
    module = new SpectrumAnalyserModule(canvas);
  });

  afterEach(() => {
    teardownAnimationFrameMocks();
  });

  describe('getConfig', () => {
    it('reads config from UI via UIConfigService', () => {
      const config = module.getConfig();
      expect(config).toEqual({
        enabled: false, // <-- Add this
        fftSize: 4096,
        smoothingTimeConstant: 0.6,
        minFreq: 50,
        maxFreq: 8000
      });
    });

    it('reads enabled state from checkbox', () => {
      const checkbox = document.getElementById('spectrum-analyser-enabled') as HTMLInputElement;
      checkbox.checked = true;
      const config = module.getConfig();
      expect(config.enabled).toBe(true);
    });

    it('returns a copy (not original object)', () => {
      const c1 = module.getConfig();
      const c2 = module.getConfig();
      expect(c1).not.toBe(c2);
      expect(c1).toEqual(c2);
    });
  });

  describe('initialize', () => {
    it('creates and connects all required nodes', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      const nodes = module.initialize(ctx, dest);

      expect(ctx.createGain).toHaveBeenCalledTimes(2); // input + output
      expect(ctx.createAnalyser).toHaveBeenCalledTimes(1);
      expect(nodes.input).toBeDefined();
      expect(nodes.output).toBeDefined();
    });

    it('applies analyser config from UI', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);

      const analyserNode = (ctx.createAnalyser as any).mock.results[0].value;
      expect(analyserNode.fftSize).toBe(4096);
      expect(analyserNode.smoothingTimeConstant).toBe(0.6);
    });

    it('connects nodes in correct order: input -> analyser -> output -> destination', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);

      const inputGain = (ctx.createGain as any).mock.results[0].value;
      const outputGain = (ctx.createGain as any).mock.results[1].value;
      const analyser = (ctx.createAnalyser as any).mock.results[0].value;

      expect(inputGain.connect).toHaveBeenCalledWith(analyser);
      expect(analyser.connect).toHaveBeenCalledWith(outputGain);
      expect(outputGain.connect).toHaveBeenCalledWith(dest);
    });

    it('starts visualization after initialization', () => {
      const checkbox = document.getElementById('spectrum-analyser-enabled') as HTMLInputElement;
      checkbox.checked = true; // <-- Ensure enabled
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);

      expect(globalThis.requestAnimationFrame).toHaveBeenCalled();
    });

    it('does not start visualization if enabled is false', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      module.initialize(ctx, dest);
      expect(globalThis.requestAnimationFrame).not.toHaveBeenCalled();
    });

    it('starts visualization if enabled is true', () => {
      const checkbox = document.getElementById('spectrum-analyser-enabled') as HTMLInputElement;
      checkbox.checked = true;
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      module.initialize(ctx, dest);
      expect(globalThis.requestAnimationFrame).toHaveBeenCalled();
    });

    it('disconnects old nodes on re-initialization', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);
      const firstInputGain = (ctx.createGain as any).mock.results[0].value;
      const firstOutputGain = (ctx.createGain as any).mock.results[1].value;
      const firstAnalyser = (ctx.createAnalyser as any).mock.results[0].value;

      module.initialize(ctx, dest);

      expect(firstInputGain.disconnect).toHaveBeenCalled();
      expect(firstOutputGain.disconnect).toHaveBeenCalled();
      expect(firstAnalyser.disconnect).toHaveBeenCalled();
    });
  });

  describe('runtime parameter updates via UI', () => {
    it('updates smoothingTimeConstant when input changes', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      module.initialize(ctx, dest);

      const smoothInput = document.getElementById('spectrum-smoothing') as HTMLInputElement;
      smoothInput.value = '0.3';
      smoothInput.dispatchEvent(new Event('input'));

      const analyserNode = (ctx.createAnalyser as any).mock.results[0].value;
      expect(analyserNode.smoothingTimeConstant).toBeCloseTo(0.3);
    });

    it('normalizes fftSize to power-of-two and updates analyser', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      module.initialize(ctx, dest);

      const fftInput = document.getElementById('spectrum-fft-size') as HTMLInputElement;
      fftInput.value = '5000'; // will round to nearest power-of-two, 4096
      fftInput.dispatchEvent(new Event('input'));

      const analyserNode = (ctx.createAnalyser as any).mock.results[0].value;
      expect(analyserNode.fftSize).toBe(4096);
    });

    it('updates min/max frequency range used in visualization', () => {
      const checkbox = document.getElementById('spectrum-analyser-enabled') as HTMLInputElement;
      checkbox.checked = true; // <-- Ensure enabled
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      const mockContext = (canvas as any).__mockContext;

      module.initialize(ctx, dest);

      const minInput = document.getElementById('spectrum-min-freq') as HTMLInputElement;
      const maxInput = document.getElementById('spectrum-max-freq') as HTMLInputElement;

      minInput.value = '200';
      minInput.dispatchEvent(new Event('input'));
      maxInput.value = '4000';
      maxInput.dispatchEvent(new Event('input'));

      // Trigger the animation frame callback to use updated config
      const callback = rafCallbacks.values().next().value as FrameRequestCallback | undefined;
      if (typeof callback === 'function') {
        callback(0);
      }

      expect(mockContext.fillRect).toHaveBeenCalled();
    });
  });

  describe('getInput/getOutput & isInitialized', () => {
    it('returns null before initialization', () => {
      expect(module.getInput()).toBeNull();
      expect(module.getOutput()).toBeNull();
      expect(module.isInitialized()).toBe(false);
    });

    it('returns gain nodes after initialization', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);

      expect(module.getInput()).not.toBeNull();
      expect(module.getOutput()).not.toBeNull();
      expect(module.getInput()).toHaveProperty('gain');
      expect(module.getOutput()).toHaveProperty('gain');
    });

    it('handles missing canvas gracefully', () => {
      const moduleWithNullCanvas = new SpectrumAnalyserModule(null as any);
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      expect(() => moduleWithNullCanvas.initialize(ctx, dest)).not.toThrow();
    });

    it('handles canvas without 2D context', () => {
      const canvasWithoutContext = {
        width: 800,
        height: 400,
        getContext: jest.fn(() => null)
      } as any;

      const moduleWithBadCanvas = new SpectrumAnalyserModule(canvasWithoutContext);
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      expect(() => moduleWithBadCanvas.initialize(ctx, dest)).not.toThrow();
    });
  });

  describe('stopVisualization', () => {
    it('cancels animation frame', () => {
      const checkbox = document.getElementById('spectrum-analyser-enabled') as HTMLInputElement;
      checkbox.checked = true; // <-- Ensure enabled
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);
      const frameId = Array.from(rafCallbacks.keys())[0]; // Get the scheduled frameId

      module.stopVisualization();

      expect(globalThis.cancelAnimationFrame).toHaveBeenCalledWith(frameId);
    });

    it('does not throw if called before initialization', () => {
      expect(() => module.stopVisualization()).not.toThrow();
    });

    it('stops visualization on re-initialization', () => {
      const checkbox = document.getElementById('spectrum-analyser-enabled') as HTMLInputElement;
      checkbox.checked = true; // <-- Ensure enabled
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);
      const firstFrameId = Array.from(rafCallbacks.keys())[0];

      module.initialize(ctx, dest); // Re-initialize

      expect(globalThis.cancelAnimationFrame).toHaveBeenCalledWith(firstFrameId);
    });
  });

  describe('enabled toggle', () => {
    it('toggles visualization on enabled change', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      module.initialize(ctx, dest);

      const checkbox = document.getElementById('spectrum-analyser-enabled') as HTMLInputElement;

      // Enable visualization
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
      expect(globalThis.requestAnimationFrame).toHaveBeenCalled();

      // Disable visualization
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change'));
      expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
    });
  });
});