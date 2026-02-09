import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { CompressorModule } from '../../../src/modules/effects/compressor-module';
import { createMockInput } from '../../fixtures/mock-input';
import { createMockAudioCtx } from '../../fixtures/mock-audio-context';

describe('CompressorModule', () => {
  let thresholdEl: HTMLInputElement;
  let ratioEl: HTMLInputElement;
  let attackEl: HTMLInputElement;
  let releaseEl: HTMLInputElement;
  let kneeEl: HTMLInputElement;
  let compressor: CompressorModule;

  beforeEach(() => {
    thresholdEl = createMockInput('-18');
    ratioEl = createMockInput('4');
    attackEl = createMockInput('0.003');
    releaseEl = createMockInput('0.25');
    kneeEl = createMockInput('30');
    compressor = new CompressorModule(
      thresholdEl,
      ratioEl,
      attackEl,
      releaseEl,
      kneeEl
    );
  });

  it('returns correct config', () => {
    expect(compressor.getConfig()).toEqual({
      threshold: -18,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
      knee: 30,
    });
  });

  it('initializes nodes and sets up signal flow', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    const nodes = compressor.initialize(ctx, dest);

    expect(nodes.input).toBeDefined();
    expect(nodes.output).toBeDefined();
    expect(ctx.createGain).toHaveBeenCalledTimes(2);
    expect(ctx.createDynamicsCompressor).toHaveBeenCalled();
  });

  it('isInitialized returns true after initialize', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    compressor.initialize(ctx, dest);
    expect(compressor.isInitialized()).toBe(true);
  });

  it('updates compressor parameters on input change', () => {
    // Use the mock context so we can access the compressor node
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    compressor.initialize(ctx, dest);

    // Get the actual compressor node used
    const compressorNode = (ctx as any).__mockCompressorNode;

    (thresholdEl as any).value = '-10';
    (ratioEl as any).value = '8';
    (attackEl as any).value = '0.01';
    (releaseEl as any).value = '0.5';
    (kneeEl as any).value = '20';

    // Simulate input events
    ((thresholdEl.addEventListener as unknown) as jest.Mock).mock.calls[0][1]();
    ((ratioEl.addEventListener as unknown) as jest.Mock).mock.calls[0][1]();
    ((attackEl.addEventListener as unknown) as jest.Mock).mock.calls[0][1]();
    ((releaseEl.addEventListener as unknown) as jest.Mock).mock.calls[0][1]();
    ((kneeEl.addEventListener as unknown) as jest.Mock).mock.calls[0][1]();

    expect(compressorNode.threshold.value).toBe(-10);
    expect(compressorNode.ratio.value).toBe(8);
    expect(compressorNode.attack.value).toBe(0.01);
    expect(compressorNode.release.value).toBe(0.5);
    expect(compressorNode.knee.value).toBe(20);
  });
});