import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { FlangerModule } from '../../../src/modules/effects/flanger-module';
import { createMockAudioCtx } from '../../fixtures/mock-audio-context';

describe('FlangerModule', () => {
  let flanger: FlangerModule;

  beforeEach(() => {
    document.body.innerHTML = '';

    // Create required input elements
    const ids = ['flanger-rate', 'flanger-depth', 'flanger-feedback', 'flanger-mix'];
    ids.forEach(id => {
      const input = document.createElement('input');
      input.id = id;
      input.type = 'number';
      document.body.appendChild(input);
    });

    (document.getElementById('flanger-rate') as HTMLInputElement).value = '1.2';
    (document.getElementById('flanger-depth') as HTMLInputElement).value = '3.5';
    (document.getElementById('flanger-feedback') as HTMLInputElement).value = '0.4';
    (document.getElementById('flanger-mix') as HTMLInputElement).value = '0.6';

    flanger = new FlangerModule();
  });

  it('returns correct config', () => {
    expect(flanger.getConfig()).toEqual({
      rate: 1.2,
      depth: 3.5,
      feedback: 0.4,
      mix: 0.6
    });
  });

  it('initializes nodes and sets up signal flow', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    const nodes = flanger.initialize(ctx, dest);

    expect(nodes.input).toBeDefined();
    expect(nodes.output).toBeDefined();
    expect(ctx.createGain).toHaveBeenCalled();
    expect(ctx.createDelay).toHaveBeenCalled();
    expect(ctx.createOscillator).toHaveBeenCalled();
  });

  it('isInitialized returns true after initialize', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    flanger.initialize(ctx, dest);
    expect(flanger.isInitialized()).toBe(true);
  });

  it('updates LFO frequency on rate change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    flanger.initialize(ctx, dest);

    const rateInput = document.getElementById('flanger-rate') as HTMLInputElement;
    rateInput.value = '5.0';
    rateInput.dispatchEvent(new Event('input'));

    expect(flanger['lfo']!.frequency.value).toBeCloseTo(5.0);
  });

  it('updates LFO gain on depth change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    flanger.initialize(ctx, dest);

    const depthInput = document.getElementById('flanger-depth') as HTMLInputElement;
    depthInput.value = '8';
    depthInput.dispatchEvent(new Event('input'));

    expect(flanger['lfoGain']!.gain.value).toBeCloseTo(0.008);
  });

  it('updates feedback gain on feedback change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    flanger.initialize(ctx, dest);

    const feedbackInput = document.getElementById('flanger-feedback') as HTMLInputElement;
    feedbackInput.value = '0.7';
    feedbackInput.dispatchEvent(new Event('input'));

    expect(flanger['feedbackGain']!.gain.value).toBeCloseTo(0.7);
  });

  it('updates wet/dry gain on mix change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    flanger.initialize(ctx, dest);

    const mixInput = document.getElementById('flanger-mix') as HTMLInputElement;
    mixInput.value = '0.8';
    mixInput.dispatchEvent(new Event('input'));

    expect(flanger['wetGain']!.gain.value).toBeCloseTo(0.8);
    expect(flanger['dryGain']!.gain.value).toBeCloseTo(0.2);
  });
});