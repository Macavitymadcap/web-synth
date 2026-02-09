import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { ReverbModule } from '../../../src/modules/effects/reverb-module';
import { createMockAudioCtx } from '../../fixtures/mock-audio-context';

describe('ReverbModule', () => {
  let reverb: ReverbModule;

  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';

    // Create required input elements
    const elementIds = ['reverb-decay', 'reverb-mix'];
    elementIds.forEach(id => {
      const input = document.createElement('input');
      input.id = id;
      input.type = 'number';
      document.body.appendChild(input);
    });

    // Set default config values
    (document.getElementById('reverb-decay') as HTMLInputElement).value = '2.5';
    (document.getElementById('reverb-mix') as HTMLInputElement).value = '0.4';

    reverb = new ReverbModule();
  });

  it('returns correct config', () => {
    expect(reverb.getConfig()).toEqual({ decay: 2.5, mix: 0.4 });
  });

  it('initializes nodes and sets up signal flow', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    const nodes = reverb.initialize(ctx, dest);

    expect(nodes.input).toBeDefined();
    expect(nodes.output).toBeDefined();
    expect(ctx.createGain).toHaveBeenCalled();
    expect(ctx.createConvolver).toHaveBeenCalled();
  });

  it('isInitialized returns true after initialize', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    reverb.initialize(ctx, dest);
    expect(reverb.isInitialized()).toBe(true);
  });

  it('updates wet/dry gain on mix change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    reverb.initialize(ctx, dest);

    const mixInput = document.getElementById('reverb-mix') as HTMLInputElement;
    mixInput.value = '0.7';
    mixInput.dispatchEvent(new Event('input'));

    expect(reverb['wetGain']!.gain.value).toBeCloseTo(0.7);
    expect(reverb['dryGain']!.gain.value).toBeCloseTo(0.3);
  });

  it('updateWithContext regenerates impulse response', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    reverb.initialize(ctx, dest);

    const spy = jest.spyOn(reverb as any, 'generateImpulseResponse');
    reverb.updateWithContext(ctx);
    expect(spy).toHaveBeenCalled();
  });
});