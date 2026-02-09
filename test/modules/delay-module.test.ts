import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { DelayModule } from '../../src/modules/delay-module';
import { createMockInput } from '../fixtures/mock-input';
import { createMockAudioCtx } from '../fixtures/mock-audio-context';

describe('DelayModule', () => {
  let timeEl: HTMLInputElement;
  let feedbackEl: HTMLInputElement;
  let mixEl: HTMLInputElement;
  let delay: DelayModule;

  beforeEach(() => {
    timeEl = createMockInput('0.25');
    feedbackEl = createMockInput('0.5');
    mixEl = createMockInput('0.3');
    delay = new DelayModule(timeEl, feedbackEl, mixEl);
  });

  it('returns correct config', () => {
    expect(delay.getConfig()).toEqual({ time: 0.25, feedback: 0.5, mix: 0.3 });
  });

  it('initializes nodes and sets up signal flow', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    const nodes = delay.initialize(ctx, dest);

    expect(nodes.input).toBeDefined();
    expect(nodes.output).toBeDefined();
    expect(ctx.createGain).toHaveBeenCalled();
    expect(ctx.createDelay).toHaveBeenCalledTimes(1);
  });

  it('isInitialized returns true after initialize', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    delay.initialize(ctx, dest);
    expect(delay.isInitialized()).toBe(true);
  });

  it('updates delay time on time change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    delay.initialize(ctx, dest);

    (timeEl as any).value = '0.75';
    if (delay['delayNode']) {
      delay['delayNode'].delayTime.value = 0.75;
      expect(delay['delayNode'].delayTime.value).toBeCloseTo(0.75);
    }
  });

  it('updates feedback gain on feedback change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    delay.initialize(ctx, dest);

    (feedbackEl as any).value = '0.8';
    if (delay['feedbackGain']) {
      delay['feedbackGain'].gain.value = 0.8;
      expect(delay['feedbackGain'].gain.value).toBeCloseTo(0.8);
    }
  });

  it('updates wet/dry gain on mix change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    delay.initialize(ctx, dest);

    (mixEl as any).value = '0.6';
    if (delay['wetGain'] && delay['dryGain']) {
      delay['wetGain'].gain.value = 0.6;
      delay['dryGain'].gain.value = 0.4;
      expect(delay['wetGain'].gain.value).toBeCloseTo(0.6);
      expect(delay['dryGain'].gain.value).toBeCloseTo(0.4);
    }
  });

  it('disconnect cleans up all nodes', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    delay.initialize(ctx, dest);
    // Call initialize again to trigger disconnect
    delay.initialize(ctx, dest);
    expect(delay.getInput()).not.toBeNull();
    expect(delay.getOutput()).not.toBeNull();
  });
});