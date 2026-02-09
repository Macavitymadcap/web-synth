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

describe('SpectrumAnalyserModule', () => {
  let canvas: HTMLCanvasElement;
  let module: SpectrumAnalyserModule;

  beforeEach(() => {
    setupAnimationFrameMocks();
    canvas = createMockCanvas();
    module = new SpectrumAnalyserModule(canvas);
  });

  afterEach(() => {
    teardownAnimationFrameMocks();
  });

  describe('getConfig', () => {
    it('returns correct default config', () => {
      const config = module.getConfig();
      
      expect(config).toEqual({
        fftSize: 2048,
        smoothingTimeConstant: 0.8,
        minFreq: 20,
        maxFreq: 5000
      });
    });

    it('returns a copy of config (not the original)', () => {
      const config1 = module.getConfig();
      const config2 = module.getConfig();
      
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
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

    it('sets up analyser node with correct config', () => {
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

    it('starts visualization after initialization', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      module.initialize(ctx, dest);
      
      expect(globalThis.requestAnimationFrame).toHaveBeenCalled();
    });

    it('disconnects old nodes on re-initialization', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      // First initialization
      module.initialize(ctx, dest);
      const firstInputGain = (ctx.createGain as any).mock.results[0].value;
      const firstOutputGain = (ctx.createGain as any).mock.results[1].value;
      const firstAnalyser = (ctx.createAnalyser as any).mock.results[0].value;
      
      // Re-initialize
      module.initialize(ctx, dest);
      
      expect(firstInputGain.disconnect).toHaveBeenCalled();
      expect(firstOutputGain.disconnect).toHaveBeenCalled();
      expect(firstAnalyser.disconnect).toHaveBeenCalled();
    });
  });

  describe('getInput and getOutput', () => {
    it('returns null before initialization', () => {
      expect(module.getInput()).toBeNull();
      expect(module.getOutput()).toBeNull();
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
  });

  describe('isInitialized', () => {
    it('returns false before initialization', () => {
      expect(module.isInitialized()).toBe(false);
    });

    it('returns true after initialization', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      module.initialize(ctx, dest);
      
      expect(module.isInitialized()).toBe(true);
    });
  });

  describe('visualization', () => {
    it('requests canvas 2D context', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      module.initialize(ctx, dest);
      
      expect(canvas.getContext).toHaveBeenCalledWith('2d');
    });

    it('schedules animation frame on initialization', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      module.initialize(ctx, dest);
      
      expect(globalThis.requestAnimationFrame).toHaveBeenCalled();
      expect(rafCallbacks.size).toBe(1);
    });

    it('clears canvas on each frame', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      const mockContext = (canvas as any).__mockContext;
      
      module.initialize(ctx, dest);
      
      // Trigger the animation frame callback
      const callback = rafCallbacks.values().next().value as FrameRequestCallback;
      callback(0);
      
      expect(mockContext.clearRect).toHaveBeenCalledWith(0, 0, 800, 400);
    });

    it('draws bars on each frame', () => {
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      const mockContext = (canvas as any).__mockContext;
      
      module.initialize(ctx, dest);
      
      // Trigger the animation frame callback
      const callback = rafCallbacks.values().next().value as FrameRequestCallback;
      callback(0);
      
      expect(mockContext.fillRect).toHaveBeenCalled();
    });
  });

  describe('stopVisualization', () => {
    it('cancels animation frame', () => {
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
      const ctx = createMockAudioCtx();
      const dest = { connect: jest.fn(), disconnect: jest.fn() } as any;
      
      module.initialize(ctx, dest);
      const firstFrameId = (globalThis.requestAnimationFrame as any).mock.results[0].value;
      
      module.initialize(ctx, dest); // Re-initialize
      
      expect(globalThis.cancelAnimationFrame).toHaveBeenCalledWith(firstFrameId);
    });
  });

  describe('edge cases', () => {
    it('handles missing canvas gracefully', () => {
      const nullCanvas = null as any;
      const moduleWithNullCanvas = new SpectrumAnalyserModule(nullCanvas);
      
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
});