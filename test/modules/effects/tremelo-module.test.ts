import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { createMockAudioCtx } from '../../fixtures/mock-audio-context';
import { TremoloModule } from '../../../src/modules/effects/tremolo-module';

describe('TremoloModule', () => {
  let tremolo: TremoloModule;

  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';

    // Create required input elements
    const elementIds = ['tremolo-rate', 'tremolo-depth'];
    elementIds.forEach(id => {
      const input = document.createElement('input');
      input.id = id;
      input.type = 'number';
      document.body.appendChild(input);
    });

    // Set default values
    (document.getElementById('tremolo-rate') as HTMLInputElement).value = '5';
    (document.getElementById('tremolo-depth') as HTMLInputElement).value = '0.5';

    tremolo = new TremoloModule();
  });

  it('returns correct config', () => {
    expect(tremolo.getConfig()).toEqual({ rate: 5, depth: 0.5 });
  });

  it('initializes nodes and sets up signal flow', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    const nodes = tremolo.initialize(ctx, dest);

    expect(nodes.input).toBeDefined();
    expect(nodes.output).toBeDefined();
    expect(ctx.createGain).toHaveBeenCalledTimes(4); // input, output, amp
    expect(ctx.createOscillator).toHaveBeenCalled();
  });

  it('isInitialized returns true after initialize', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    tremolo.initialize(ctx, dest);
    expect(tremolo.isInitialized()).toBe(true);
  });

  it('sets correct base gain value based on depth', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    tremolo.initialize(ctx, dest);

    // depth = 0.5, so base gain = 1.0 - 0.25 = 0.75
    expect(tremolo['ampGain']!.gain.value).toBeCloseTo(0.75);
  });

  it('sets correct LFO gain value based on depth', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    tremolo.initialize(ctx, dest);

    // depth = 0.5, so LFO gain = 0.25
    expect(tremolo['lfoGain']!.gain.value).toBeCloseTo(0.25);
  });

  it('updates LFO frequency on rate change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    tremolo.initialize(ctx, dest);

    const rateInput = document.getElementById('tremolo-rate') as HTMLInputElement;
    rateInput.value = '10';
    rateInput.dispatchEvent(new Event('input'));

    expect(tremolo['lfo']!.frequency.value).toBeCloseTo(10);
  });

  it('updates gains on depth change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    tremolo.initialize(ctx, dest);

    const depthInput = document.getElementById('tremolo-depth') as HTMLInputElement;
    depthInput.value = '0.8';
    depthInput.dispatchEvent(new Event('input'));

    // depth = 0.8, so LFO gain = 0.4, base gain = 0.6
    expect(tremolo['lfoGain']!.gain.value).toBeCloseTo(0.4);
    expect(tremolo['ampGain']!.gain.value).toBeCloseTo(0.6);
  });

  it('stops LFO on disconnect', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    tremolo.initialize(ctx, dest);

    const lfo = tremolo['lfo'];
    expect(lfo?.stop).toBeDefined();

    // Re-initialize triggers disconnect
    tremolo.initialize(ctx, dest);
    expect(lfo!.stop).toHaveBeenCalled();
  });

  it('handles edge case of depth = 0 (no modulation)', () => {
    (document.getElementById('tremolo-depth') as HTMLInputElement).value = '0';
    tremolo = new TremoloModule();

    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    tremolo.initialize(ctx, dest);

    expect(tremolo['ampGain']!.gain.value).toBeCloseTo(1);
    expect(tremolo['lfoGain']!.gain.value).toBeCloseTo(0);
  });

  it('handles edge case of depth = 1 (full modulation)', () => {
    (document.getElementById('tremolo-depth') as HTMLInputElement).value = '1';
    tremolo = new TremoloModule();

    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    tremolo.initialize(ctx, dest);

    expect(tremolo['ampGain']!.gain.value).toBeCloseTo(0.5);
    expect(tremolo['lfoGain']!.gain.value).toBeCloseTo(0.5);
  });
});