import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { ChorusModule } from '../../../src/modules/effects/chorus-module';
import { createMockAudioCtx } from '../../fixtures/mock-audio-context';

describe('ChorusModule', () => {
  let chorus: ChorusModule;

  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';

    // Create required input elements
    const elementIds = ['chorus-rate', 'chorus-depth', 'chorus-mix'];
    elementIds.forEach(id => {
      const input = document.createElement('input');
      input.id = id;
      input.type = 'number';
      document.body.appendChild(input);
    });

    // Set default values
    (document.getElementById('chorus-rate') as HTMLInputElement).value = '2.5';
    (document.getElementById('chorus-depth') as HTMLInputElement).value = '8';
    (document.getElementById('chorus-mix') as HTMLInputElement).value = '0.4';

    chorus = new ChorusModule();
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

    const rateInput = document.getElementById('chorus-rate') as HTMLInputElement;
    rateInput.value = '5.0';
    rateInput.dispatchEvent(new Event('input'));

    expect(chorus['lfoNodes'][0].frequency.value).toBeCloseTo(5);
    // Slight spread on other LFOs
    expect(chorus['lfoNodes'][1].frequency.value).toBeCloseTo(5 * 1.1);
    expect(chorus['lfoNodes'][2].frequency.value).toBeCloseTo(5 * 1.2);
  });

  it('updates LFO gain on depth change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    chorus.initialize(ctx, dest);

    const depthInput = document.getElementById('chorus-depth') as HTMLInputElement;
    depthInput.value = '12';
    depthInput.dispatchEvent(new Event('input'));

    expect(chorus['lfoGainNodes'][0].gain.value).toBeCloseTo(0.012);
  });

  it('updates wet/dry gain on mix change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    chorus.initialize(ctx, dest);

    const mixInput = document.getElementById('chorus-mix') as HTMLInputElement;
    mixInput.value = '0.7';
    mixInput.dispatchEvent(new Event('input'));

    expect(chorus['wetGain']!.gain.value).toBeCloseTo(0.7);
    expect(chorus['dryGain']!.gain.value).toBeCloseTo(0.3);
  });
});