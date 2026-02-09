import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { PhaserModule } from '../../../src/modules/effects/phaser-module';
import { createMockAudioCtx } from '../../fixtures/mock-audio-context';

describe('PhaserModule', () => {
  let phaser: PhaserModule;

  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';

    // Create required input elements
    const elementIds = ['phaser-rate', 'phaser-depth', 'phaser-stages', 'phaser-feedback', 'phaser-mix'];
    elementIds.forEach(id => {
      const input = document.createElement('input');
      input.id = id;
      input.type = 'number';
      document.body.appendChild(input);
    });

    // Set default config values
    (document.getElementById('phaser-rate') as HTMLInputElement).value = '1.5';
    (document.getElementById('phaser-depth') as HTMLInputElement).value = '300';
    (document.getElementById('phaser-stages') as HTMLInputElement).value = '4';
    (document.getElementById('phaser-feedback') as HTMLInputElement).value = '0.5';
    (document.getElementById('phaser-mix') as HTMLInputElement).value = '0.35';

    phaser = new PhaserModule();
  });

  it('returns correct config', () => {
    expect(phaser.getConfig()).toEqual({
      rate: 1.5,
      depth: 300,
      stages: 4,
      feedback: 0.5,
      mix: 0.35
    });
  });

  it('initializes nodes and sets up signal flow', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    const nodes = phaser.initialize(ctx, dest);

    expect(nodes.input).toBeDefined();
    expect(nodes.output).toBeDefined();
    expect(ctx.createGain).toHaveBeenCalled();
    expect(ctx.createBiquadFilter).toHaveBeenCalled();
    expect(phaser['allpassFilters'].length).toBe(4);
  });

  it('isInitialized returns true after initialize', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    phaser.initialize(ctx, dest);
    expect(phaser.isInitialized()).toBe(true);
  });

  it('updates LFO rate on rate change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    phaser.initialize(ctx, dest);

    const rateInput = document.getElementById('phaser-rate') as HTMLInputElement;
    rateInput.value = '3.0';
    rateInput.dispatchEvent(new Event('input'));

    expect(phaser['lfo']!.frequency.value).toBeCloseTo(3);
  });

  it('updates LFO depth on depth change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    phaser.initialize(ctx, dest);

    const depthInput = document.getElementById('phaser-depth') as HTMLInputElement;
    depthInput.value = '500';
    depthInput.dispatchEvent(new Event('input'));

    expect(phaser['lfoGain']!.gain.value).toBeCloseTo(500);
  });

  it('updates feedback gain on feedback change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    phaser.initialize(ctx, dest);

    const feedbackInput = document.getElementById('phaser-feedback') as HTMLInputElement;
    feedbackInput.value = '0.7';
    feedbackInput.dispatchEvent(new Event('input'));

    expect(phaser['feedbackGain']!.gain.value).toBeCloseTo(0.7);
  });

  it('updates wet/dry gain on mix change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    phaser.initialize(ctx, dest);

    const mixInput = document.getElementById('phaser-mix') as HTMLInputElement;
    mixInput.value = '0.6';
    mixInput.dispatchEvent(new Event('input'));

    expect(phaser['wetGain']!.gain.value).toBeCloseTo(0.6);
    expect(phaser['dryGain']!.gain.value).toBeCloseTo(0.4);
  });

  it('re-initializes on stages change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;

    const spy = jest.spyOn(phaser, 'initialize');
    phaser.initialize(ctx, dest);

    const stagesInput = document.getElementById('phaser-stages') as HTMLInputElement;
    stagesInput.value = '6';
    stagesInput.dispatchEvent(new Event('input'));

    expect(spy).toHaveBeenCalledTimes(2);
    expect(phaser['allpassFilters'].length).toBe(6);
  });

  it('getInput and getOutput return null before initialization', () => {
    expect(phaser.getInput()).toBeNull();
    expect(phaser.getOutput()).toBeNull();
    expect(phaser.isInitialized()).toBe(false);
  });

  it('getInput and getOutput return nodes after initialization', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    phaser.initialize(ctx, dest);

    expect(phaser.getInput()).not.toBeNull();
    expect(phaser.getOutput()).not.toBeNull();
  });
});