import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { CompressorModule } from '../../../src/modules/effects/compressor-module';
import { createMockAudioCtx } from '../../fixtures/mock-audio-context';
import { UIConfigService } from '../../../src/services/ui-config-service';

describe('CompressorModule', () => {
  let compressor: CompressorModule;

  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';
    
    // Set up mock DOM elements that CompressorModule expects
    const elementIds = [
      'compressor-threshold',
      'compressor-ratio',
      'compressor-attack',
      'compressor-release',
      'compressor-knee'
    ];

    elementIds.forEach(id => {
      const input = document.createElement('input');
      input.id = id;
      input.type = 'number';
      input.value = '0';
      document.body.appendChild(input);
    });

    // Set default config values
    document.getElementById('compressor-threshold')!.setAttribute('value', '-18');
    document.getElementById('compressor-ratio')!.setAttribute('value', '4');
    document.getElementById('compressor-attack')!.setAttribute('value', '0.003');
    document.getElementById('compressor-release')!.setAttribute('value', '0.25');
    document.getElementById('compressor-knee')!.setAttribute('value', '30');

    compressor = new CompressorModule();
  });

  it('returns correct config', () => {
    // Update input values to match expected config
    (document.getElementById('compressor-threshold') as HTMLInputElement).value = '-18';
    (document.getElementById('compressor-ratio') as HTMLInputElement).value = '4';
    (document.getElementById('compressor-attack') as HTMLInputElement).value = '0.003';
    (document.getElementById('compressor-release') as HTMLInputElement).value = '0.25';
    (document.getElementById('compressor-knee') as HTMLInputElement).value = '30';

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
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    compressor.initialize(ctx, dest);

    // Get the actual compressor node from the mock context
    const compressorNode = (ctx as any).__mockCompressorNode;

    // Simulate user changing input values
    const thresholdInput = document.getElementById('compressor-threshold') as HTMLInputElement;
    const ratioInput = document.getElementById('compressor-ratio') as HTMLInputElement;
    const attackInput = document.getElementById('compressor-attack') as HTMLInputElement;
    const releaseInput = document.getElementById('compressor-release') as HTMLInputElement;
    const kneeInput = document.getElementById('compressor-knee') as HTMLInputElement;

    thresholdInput.value = '-10';
    thresholdInput.dispatchEvent(new Event('input'));

    ratioInput.value = '8';
    ratioInput.dispatchEvent(new Event('input'));

    attackInput.value = '0.01';
    attackInput.dispatchEvent(new Event('input'));

    releaseInput.value = '0.5';
    releaseInput.dispatchEvent(new Event('input'));

    kneeInput.value = '20';
    kneeInput.dispatchEvent(new Event('input'));

    // Verify the compressor node's AudioParams were updated
    expect(compressorNode.threshold.value).toBe(-10);
    expect(compressorNode.ratio.value).toBe(8);
    expect(compressorNode.attack.value).toBe(0.01);
    expect(compressorNode.release.value).toBe(0.5);
    expect(compressorNode.knee.value).toBe(20);
  });

  it('handles missing elements gracefully during initialization', () => {
    // Remove one element to test error handling
    document.getElementById('compressor-threshold')?.remove();

    expect(() => compressor.getConfig()).toThrow('Input element with id "compressor-threshold" not found');
  });

  it('getInput and getOutput return null before initialization', () => {
    expect(compressor.getInput()).toBeNull();
    expect(compressor.getOutput()).toBeNull();
    expect(compressor.isInitialized()).toBe(false);
  });

  it('getInput and getOutput return nodes after initialization', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    compressor.initialize(ctx, dest);

    expect(compressor.getInput()).not.toBeNull();
    expect(compressor.getOutput()).not.toBeNull();
  });
});