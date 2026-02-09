import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { DistortionModule } from '../../../src/modules/effects/distortion-module';
import { createMockAudioCtx } from '../../fixtures/mock-audio-context';

describe('DistortionModule', () => {
  let dist: DistortionModule;

  beforeEach(() => {
    document.body.innerHTML = '';

    const elementIds = ['distortion-drive', 'distortion-blend'];
    elementIds.forEach(id => {
      const input = document.createElement('input');
      input.id = id;
      input.type = 'number';
      input.value = '0';
      document.body.appendChild(input);
    });

    // Set default config values
    document.getElementById('distortion-drive')!.setAttribute('value', '3');
    document.getElementById('distortion-blend')!.setAttribute('value', '0.5');

    dist = new DistortionModule();
  });

  it('returns correct config', () => {
    (document.getElementById('distortion-drive') as HTMLInputElement).value = '3';
    (document.getElementById('distortion-blend') as HTMLInputElement).value = '0.5';
    expect(dist.getConfig()).toEqual({ drive: 3, blend: 0.5 });
  });

  it('initializes nodes and sets up signal flow', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    const nodes = dist.initialize(ctx, dest);

    expect(nodes.input).toBeDefined();
    expect(nodes.output).toBeDefined();
    expect(ctx.createGain).toHaveBeenCalled();
    expect(ctx.createWaveShaper).toHaveBeenCalledTimes(1);
  });

  it('isInitialized returns true after initialize', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    dist.initialize(ctx, dest);
    expect(dist.isInitialized()).toBe(true);
  });

  it('updates waveshaper curve on drive change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    dist.initialize(ctx, dest);

    const driveInput = document.getElementById('distortion-drive') as HTMLInputElement;
    driveInput.value = '7';
    driveInput.dispatchEvent(new Event('input'));

    const waveShaper = (ctx as any).__mockWaveShaper;
    expect(waveShaper.curve).toBeInstanceOf(Float32Array);
    expect((waveShaper.curve as Float32Array).length).toBe(1024);
  });

  it('sets oversample to 2x on initialize', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    dist.initialize(ctx, dest);

    const waveShaper = (ctx as any).__mockWaveShaper;
    expect(waveShaper.oversample).toBe('2x');
  });

  it('updates wet/dry gain on blend change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    dist.initialize(ctx, dest);

    const blendInput = document.getElementById('distortion-blend') as HTMLInputElement;
    blendInput.value = '0.2';
    blendInput.dispatchEvent(new Event('input'));

    const mockGainNodes = (ctx as any).__mockGainNodes;
    const dryGain = mockGainNodes[2]; // input, output, dry, wet
    const wetGain = mockGainNodes[3];

    expect(wetGain.gain.value).toBeCloseTo(0.2);
    expect(dryGain.gain.value).toBeCloseTo(0.8);
  });

  it('disconnect cleans up all nodes when re-initializing', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;

    dist.initialize(ctx, dest);
    dist.initialize(ctx, dest); // triggers disconnect + re-create

    expect(dist.getInput()).not.toBeNull();
    expect(dist.getOutput()).not.toBeNull();
  });

  it('getInput and getOutput return null before initialization', () => {
    expect(dist.getInput()).toBeNull();
    expect(dist.getOutput()).toBeNull();
    expect(dist.isInitialized()).toBe(false);
  });

  it('getInput and getOutput return nodes after initialization', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    dist.initialize(ctx, dest);

    expect(dist.getInput()).not.toBeNull();
    expect(dist.getOutput()).not.toBeNull();
  });
});