import { afterEach, describe, it, expect, beforeEach, jest } from 'bun:test';
import { OscilloscopeModule } from '../../../src/modules/effects/oscilloscope-module';
import { createMockAudioCtx } from '../../fixtures/mock-audio-context';

// Mock canvas and 2D context
function createMockCanvas() {
  const mockContext = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    shadowBlur: 0,
    shadowColor: '',
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
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

describe('OscilloscopeModule (UIConfigService)', () => {
  let canvas: HTMLCanvasElement;
  let module: OscilloscopeModule;

  beforeEach(() => {
    setupAnimationFrameMocks();
    document.body.innerHTML = '';

    // Create UI controls
    const enabledToggle = document.createElement('input');
    enabledToggle.id = 'oscilloscope-enabled';
    enabledToggle.type = 'checkbox';
    enabledToggle.checked = false;
    document.body.appendChild(enabledToggle);

    const lineColorInput = document.createElement('input');
    lineColorInput.id = 'oscilloscope-line-color';
    lineColorInput.type = 'color';
    lineColorInput.value = '#00ffff';
    document.body.appendChild(lineColorInput);

    const lineWidthInput = document.createElement('input');
    lineWidthInput.id = 'oscilloscope-line-width';
    lineWidthInput.type = 'number';
    lineWidthInput.value = '2';
    document.body.appendChild(lineWidthInput);

    const fftSizeInput = document.createElement('input');
    fftSizeInput.id = 'oscilloscope-fft-size';
    fftSizeInput.type = 'number';
    fftSizeInput.value = '2048';
    document.body.appendChild(fftSizeInput);

    const smoothingInput = document.createElement('input');
    smoothingInput.id = 'oscilloscope-smoothing';
    smoothingInput.type = 'number';
    smoothingInput.value = '0.8';
    document.body.appendChild(smoothingInput);

    canvas = createMockCanvas();
    module = new OscilloscopeModule(canvas);
  });

  afterEach(() => {
    teardownAnimationFrameMocks();
  });

  describe('getConfig', () => {
    it('reads config from UI via UIConfigService', () => {
      const config = module.getConfig();
      expect(config).toEqual({
        enabled: false,
        lineColor: '#00ffff',
        lineWidth: 2,
        fftSize: 2048,
        smoothing: 0.8
      });
    });

    it('returns a copy (not original object)', () => {
      const c1 = module.getConfig();
      const c2 = module.getConfig();
      expect(c1).not.toBe(c2);
      expect(c1).toEqual(c2);
    });

    it('reads enabled state from checkbox', () => {
      const checkbox = document.getElementById('oscilloscope-enabled') as HTMLInputElement;
      checkbox.checked = true;

      const config = module.getConfig();
      expect(config.enabled).toBe(true);
    });

    it('handles missing UI controls gracefully', () => {
      document.body.innerHTML = '';
      const moduleWithoutUI = new OscilloscopeModule(canvas);
      
      expect(() => moduleWithoutUI.getConfig()).not.toThrow();
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
      expect(analyserNode.fftSize).toBe(2048);
      expect(analyserNode.smoothingTimeConstant).toBe(0.8);
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

    it('does not start visualization if enabled is false', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);

      expect(globalThis.requestAnimationFrame).not.toHaveBeenCalled();
    });

    it('starts visualization if enabled is true', () => {
      const checkbox = document.getElementById('oscilloscope-enabled') as HTMLInputElement;
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
    it('toggles visualization on enabled change', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      module.initialize(ctx, dest);

      const checkbox = document.getElementById('oscilloscope-enabled') as HTMLInputElement;
      
      // Enable visualization
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event('change'));
      expect(globalThis.requestAnimationFrame).toHaveBeenCalled();

      // Disable visualization
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change'));
      expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('updates line color on input change', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      module.initialize(ctx, dest);

      const colorInput = document.getElementById('oscilloscope-line-color') as HTMLInputElement;
      colorInput.value = '#ff0000';
      colorInput.dispatchEvent(new Event('input'));

      const config = module.getConfig();
      expect(config.lineColor).toBe('#ff0000');
    });

    it('updates line width on input change', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      module.initialize(ctx, dest);

      const widthInput = document.getElementById('oscilloscope-line-width') as HTMLInputElement;
      widthInput.value = '5';
      widthInput.dispatchEvent(new Event('input'));

      const config = module.getConfig();
      expect(config.lineWidth).toBe(5);
    });

    it('normalizes fftSize to power-of-two and updates analyser', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      module.initialize(ctx, dest);

      const fftInput = document.getElementById('oscilloscope-fft-size') as HTMLInputElement;
      fftInput.value = '3000'; // will round to 4096
      fftInput.dispatchEvent(new Event('input'));

      const analyserNode = (ctx.createAnalyser as any).mock.results[0].value;
      expect(analyserNode.fftSize).toBe(4096);
    });

    it('clamps smoothing to 0-1 range', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      module.initialize(ctx, dest);

      const smoothingInput = document.getElementById('oscilloscope-smoothing') as HTMLInputElement;
      
      // Test upper bound
      smoothingInput.value = '1.5';
      smoothingInput.dispatchEvent(new Event('input'));
      expect(module.getConfig().smoothing).toBe(1);

      // Test lower bound
      smoothingInput.value = '-0.5';
      smoothingInput.dispatchEvent(new Event('input'));
      expect(module.getConfig().smoothing).toBe(0);
    });

    it('updates analyser smoothing on input change', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      module.initialize(ctx, dest);

      const smoothingInput = document.getElementById('oscilloscope-smoothing') as HTMLInputElement;
      smoothingInput.value = '0.5';
      smoothingInput.dispatchEvent(new Event('input'));

      const analyserNode = (ctx.createAnalyser as any).mock.results[0].value;
      expect(analyserNode.smoothingTimeConstant).toBeCloseTo(0.5);
    });
  });

  describe('visualization', () => {
    it('draws waveform when enabled', () => {
      const checkbox = document.getElementById('oscilloscope-enabled') as HTMLInputElement;
      checkbox.checked = true;

      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      const mockContext = (canvas as any).__mockContext;

      module.initialize(ctx, dest);

      // Trigger the animation frame callback
      const callback = rafCallbacks.values().next().value as FrameRequestCallback;
      callback(0);

      // Verify drawing operations
      expect(mockContext.fillRect).toHaveBeenCalled();
      expect(mockContext.beginPath).toHaveBeenCalled();
      expect(mockContext.stroke).toHaveBeenCalled();
    });

    it('clears canvas when disabled', () => {
      const checkbox = document.getElementById('oscilloscope-enabled') as HTMLInputElement;
      checkbox.checked = true;

      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      const mockContext = (canvas as any).__mockContext;

      module.initialize(ctx, dest);

      // Disable
      checkbox.checked = false;
      checkbox.dispatchEvent(new Event('change'));

      // Verify canvas was cleared
      expect(mockContext.fillRect).toHaveBeenCalledWith(0, 0, 800, 400);
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
      expect(module.isInitialized()).toBe(true);
    });

    it('handles missing canvas gracefully', () => {
      const moduleWithNullCanvas = new OscilloscopeModule(null);
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      expect(() => moduleWithNullCanvas.initialize(ctx, dest)).not.toThrow();
      expect(moduleWithNullCanvas.isInitialized()).toBe(true);
    });

    it('handles canvas without 2D context', () => {
      const canvasWithoutContext = {
        width: 800,
        height: 400,
        getContext: jest.fn(() => null)
      } as any;

      const moduleWithBadCanvas = new OscilloscopeModule(canvasWithoutContext);
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      expect(() => moduleWithBadCanvas.initialize(ctx, dest)).not.toThrow();
    });
  });

  describe('stopVisualization', () => {
    it('cancels animation frame', () => {
      const checkbox = document.getElementById('oscilloscope-enabled') as HTMLInputElement;
      checkbox.checked = true;

      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);
      const frameId = (globalThis.requestAnimationFrame as any).mock.results[0].value;

      module.stopVisualization();

      expect(globalThis.cancelAnimationFrame).toHaveBeenCalledWith(frameId);
    });

    it('does not throw if called before initialization', () => {
      expect(() => module.stopVisualization()).not.toThrow();
    });

    it('stops visualization on re-initialization', () => {
      const checkbox = document.getElementById('oscilloscope-enabled') as HTMLInputElement;
      checkbox.checked = true;

      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;

      module.initialize(ctx, dest);
      const firstFrameId = (globalThis.requestAnimationFrame as any).mock.results[0].value;

      module.initialize(ctx, dest); // Re-initialize

      expect(globalThis.cancelAnimationFrame).toHaveBeenCalledWith(firstFrameId);
    });
  });

  describe('edge cases', () => {
    it('handles invalid FFT size values', () => {
      const fftInput = document.getElementById('oscilloscope-fft-size') as HTMLInputElement;
      
      // Test zero
      fftInput.value = '0';
      fftInput.dispatchEvent(new Event('input'));
      expect(module.getConfig().fftSize).toBe(2048); // fallback

      // Test negative
      fftInput.value = '-100';
      fftInput.dispatchEvent(new Event('input'));
      expect(module.getConfig().fftSize).toBe(2048); // fallback

      // Test NaN
      fftInput.value = 'not-a-number';
      fftInput.dispatchEvent(new Event('input'));
      expect(module.getConfig().fftSize).toBe(2048); // fallback
    });

    it('clamps FFT size to valid range [32, 32768]', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      module.initialize(ctx, dest);

      const fftInput = document.getElementById('oscilloscope-fft-size') as HTMLInputElement;
      
      // Test below minimum
      fftInput.value = '16';
      fftInput.dispatchEvent(new Event('input'));
      expect(module.getConfig().fftSize).toBe(32);

      // Test above maximum
      fftInput.value = '65536';
      fftInput.dispatchEvent(new Event('input'));
      expect(module.getConfig().fftSize).toBe(32768);
    });
  });
});