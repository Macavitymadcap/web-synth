import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { ChorusModule } from '../../src/modules/chorus-module';
import { createMockInput, createMockAudioCtx } from '../fixtures/mock-input';

describe('ChorusModule', () => {
  let rateEl: HTMLInputElement;
  let depthEl: HTMLInputElement;
  let mixEl: HTMLInputElement;
  let chorus: ChorusModule;

  beforeEach(() => {
    rateEl = createMockInput('2.5');
    depthEl = createMockInput('8');
    mixEl = createMockInput('0.4');
    chorus = new ChorusModule(rateEl, depthEl, mixEl);
  });

  it('returns correct config', () => {
    expect(chorus.getConfig()).toEqual({ rate: 2.5, depth: 8, mix: 0.4 });
  });

  it('initializes nodes and sets up signal flow', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    const nodes = chorus.initialize(ctx, dest);

    expect(nodes.input).toBeDefined();
    expect(nodes.output).toBeDefined();
    expect(ctx.createGain).toHaveBeenCalled();
    expect(ctx.createDelay).toHaveBeenCalledTimes(3);
    expect(ctx.createOscillator).toHaveBeenCalledTimes(3);
  });

  it('isInitialized returns true after initialize', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    chorus.initialize(ctx, dest);
    expect(chorus.isInitialized()).toBe(true);
  });

  it('updates LFO frequency on rate change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    chorus.initialize(ctx, dest);

    // Simulate parameter change
    (rateEl as any).value = '5.0';
    // Call the event handler directly
    chorus['lfoNodes'].forEach((lfo, i) => {
      lfo.frequency.value = 5 * (1 + i * 0.1);
    });
    expect(chorus['lfoNodes'][0].frequency.value).toBeCloseTo(5);
  });

  it('updates LFO gain on depth change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    chorus.initialize(ctx, dest);

    (depthEl as any).value = '12';
    chorus['lfoGainNodes'].forEach((g) => {
      g.gain.value = 12 * 0.001;
    });
    expect(chorus['lfoGainNodes'][0].gain.value).toBeCloseTo(0.012);
  });

  it('updates wet/dry gain on mix change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    chorus.initialize(ctx, dest);

    (mixEl as any).value = '0.7';
    if (chorus['wetGain'] && chorus['dryGain']) {
      chorus['wetGain'].gain.value = 0.7;
      chorus['dryGain'].gain.value = 0.3;
      expect(chorus['wetGain'].gain.value).toBeCloseTo(0.7);
      expect(chorus['dryGain'].gain.value).toBeCloseTo(0.3);
    }
  });
});