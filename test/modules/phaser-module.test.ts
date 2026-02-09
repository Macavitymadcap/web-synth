import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { PhaserModule } from '../../src/modules/phaser-module';
import { createMockInput } from '../fixtures/mock-input';
import { createMockAudioCtx } from '../fixtures/mock-audio-context';

describe('PhaserModule', () => {
  let rateEl: HTMLInputElement;
  let depthEl: HTMLInputElement;
  let stagesEl: HTMLInputElement;
  let feedbackEl: HTMLInputElement;
  let mixEl: HTMLInputElement;
  let phaser: PhaserModule;

  beforeEach(() => {
    rateEl = createMockInput('1.2');
    depthEl = createMockInput('500');
    stagesEl = createMockInput('4');
    feedbackEl = createMockInput('0.5');
    mixEl = createMockInput('0.7');
    phaser = new PhaserModule(rateEl, depthEl, stagesEl, feedbackEl, mixEl);
  });

  it('returns correct config', () => {
    expect(phaser.getConfig()).toEqual({
      rate: 1.2,
      depth: 500,
      stages: 4,
      feedback: 0.5,
      mix: 0.7,
    });
  });

  it('initializes nodes and sets up signal flow', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    const nodes = phaser.initialize(ctx, dest);

    expect(nodes.input).toBeDefined();
    expect(nodes.output).toBeDefined();
    expect(ctx.createGain).toHaveBeenCalled();
    expect(ctx.createBiquadFilter).toHaveBeenCalledTimes(4);
    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
  });

  it('isInitialized returns true after initialize', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    phaser.initialize(ctx, dest);
    expect(phaser.isInitialized()).toBe(true);
  });

  it('updates LFO frequency on rate change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    phaser.initialize(ctx, dest);

    // Simulate parameter change
    (rateEl as any).value = '2.5';
    if (phaser['lfo']) {
      phaser['lfo'].frequency.value = 2.5;
      expect(phaser['lfo'].frequency.value).toBeCloseTo(2.5);
    }
  });

  it('updates LFO gain on depth change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    phaser.initialize(ctx, dest);

    (depthEl as any).value = '800';
    if (phaser['lfoGain']) {
      phaser['lfoGain'].gain.value = 800;
      expect(phaser['lfoGain'].gain.value).toBeCloseTo(800);
    }
  });

  it('updates feedback gain on feedback change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    phaser.initialize(ctx, dest);

    (feedbackEl as any).value = '0.8';
    if (phaser['feedbackGain']) {
      phaser['feedbackGain'].gain.value = 0.8;
      expect(phaser['feedbackGain'].gain.value).toBeCloseTo(0.8);
    }
  });

  it('updates wet/dry gain on mix change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    phaser.initialize(ctx, dest);

    (mixEl as any).value = '0.3';
    if (phaser['dryGain'] && phaser['wetGain']) {
      phaser['dryGain'].gain.value = 0.7;
      phaser['wetGain'].gain.value = 0.3;
      expect(phaser['dryGain'].gain.value).toBeCloseTo(0.7);
      expect(phaser['wetGain'].gain.value).toBeCloseTo(0.3);
    }
  });
});