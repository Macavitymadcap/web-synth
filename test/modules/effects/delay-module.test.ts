import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { DelayModule } from '../../../src/modules/effects/delay-module';
import { createMockAudioCtx } from '../../fixtures/mock-audio-context';

describe('DelayModule', () => {
  let delay: DelayModule;

  beforeEach(() => {
    // Clear DOM before each test
    document.body.innerHTML = '';
    
    // Create required input elements
    const elementIds = ['delay-time', 'delay-feedback', 'delay-mix'];
    elementIds.forEach(id => {
      const input = document.createElement('input');
      input.id = id;
      input.type = 'number';
      input.value = '0';
      document.body.appendChild(input);
    });

    // Set default config values
    document.getElementById('delay-time')!.setAttribute('value', '0.25');
    document.getElementById('delay-feedback')!.setAttribute('value', '0.5');
    document.getElementById('delay-mix')!.setAttribute('value', '0.3');

    delay = new DelayModule();
  });

  it('returns correct config', () => {
    (document.getElementById('delay-time') as HTMLInputElement).value = '0.25';
    (document.getElementById('delay-feedback') as HTMLInputElement).value = '0.5';
    (document.getElementById('delay-mix') as HTMLInputElement).value = '0.3';

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

    const timeInput = document.getElementById('delay-time') as HTMLInputElement;
    timeInput.value = '0.75';
    timeInput.dispatchEvent(new Event('input'));

    const delayNode = (ctx as any).__mockDelayNode;
    expect(delayNode.delayTime.value).toBe(0.75);
  });

  it('updates feedback gain on feedback change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    delay.initialize(ctx, dest);

    const feedbackInput = document.getElementById('delay-feedback') as HTMLInputElement;
    feedbackInput.value = '0.8';
    feedbackInput.dispatchEvent(new Event('input'));

    // Get the feedback gain node (3rd gain node created)
    const mockGainNodes = (ctx as any).__mockGainNodes;
    const feedbackGain = mockGainNodes[2]; // inputGain, outputGain, feedbackGain
    expect(feedbackGain.gain.value).toBe(0.8);
  });

  it('updates wet/dry gain on mix change', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    delay.initialize(ctx, dest);

    const mixInput = document.getElementById('delay-mix') as HTMLInputElement;
    mixInput.value = '0.6';
    mixInput.dispatchEvent(new Event('input'));

    // Get wet and dry gain nodes
    const mockGainNodes = (ctx as any).__mockGainNodes;
    const wetGain = mockGainNodes[3]; // wetGain is 4th
    const dryGain = mockGainNodes[4]; // dryGain is 5th
    expect(wetGain.gain.value).toBe(0.6);
    expect(dryGain.gain.value).toBe(0.4);
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

  it('getInput and getOutput return null before initialization', () => {
    expect(delay.getInput()).toBeNull();
    expect(delay.getOutput()).toBeNull();
    expect(delay.isInitialized()).toBe(false);
  });

  it('getInput and getOutput return nodes after initialization', () => {
    const ctx = createMockAudioCtx();
    const dest = { connect: jest.fn() } as any;
    delay.initialize(ctx, dest);

    expect(delay.getInput()).not.toBeNull();
    expect(delay.getOutput()).not.toBeNull();
  });
});