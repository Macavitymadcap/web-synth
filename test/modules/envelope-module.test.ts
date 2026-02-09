import { describe, it, expect, beforeEach, jest } from 'bun:test';
import { EnvelopeModule } from '../../src/modules/envelope-module';

function createInput(id: string, value: string) {
  const input = document.createElement('input');
  input.id = id;
  input.type = 'number';
  input.value = value;
  document.body.appendChild(input);
  return input as HTMLInputElement;
}

function createMockAudioParam(): AudioParam {
  const param: any = {
    value: 0,
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    cancelScheduledValues: jest.fn(),
  };
  return param as AudioParam;
}

describe('EnvelopeModule', () => {
  beforeEach(() => {
    document.body.innerHTML = '';

    // Amp envelope controls
    createInput('attack', '0.1');
    createInput('decay', '0.3');
    createInput('sustain', '0.6');
    createInput('release', '0.8');

    // Filter envelope controls
    createInput('filter-attack', '0.05');
    createInput('filter-decay', '0.25');
    createInput('filter-sustain', '0.5');
    createInput('filter-release', '0.7');
  });

  it('returns correct config for amp mode', () => {
    const env = new EnvelopeModule('amp');
    expect(env.getConfig()).toEqual({
      attack: 0.1,
      decay: 0.3,
      sustain: 0.6,
      release: 0.8,
    });
  });

  it('returns correct config for filter mode', () => {
    const env = new EnvelopeModule('filter');
    expect(env.getConfig()).toEqual({
      attack: 0.05,
      decay: 0.25,
      sustain: 0.5,
      release: 0.7,
    });
  });

  it('applyEnvelope schedules attack and decay correctly', () => {
    // Set specific values
    (document.getElementById('attack') as HTMLInputElement).value = '0.1';
    (document.getElementById('decay') as HTMLInputElement).value = '0.3';
    (document.getElementById('sustain') as HTMLInputElement).value = '0.5';

    const env = new EnvelopeModule('amp');
    const param = createMockAudioParam();

    env.applyEnvelope(param, 1, 0, 1);

    expect((param.setValueAtTime as any)).toHaveBeenCalledWith(0, 1);
    const rampCalls = (param.linearRampToValueAtTime as any).mock.calls;
    expect(rampCalls[0][0]).toBeCloseTo(1, 6);
    expect(rampCalls[0][1]).toBeCloseTo(1.1, 6);
    expect(rampCalls[1][0]).toBeCloseTo(0.5, 6);
    expect(rampCalls[1][1]).toBeCloseTo(1.4, 6);
  });

  it('applyRelease schedules release and returns duration', () => {
    (document.getElementById('filter-release') as HTMLInputElement).value = '0.8';

    const env = new EnvelopeModule('filter');
    const param = createMockAudioParam();
    (param as any).value = 0.4;

    const duration = env.applyRelease(param, 2, 0);

    expect((param.cancelScheduledValues as any)).toHaveBeenCalledWith(2);
    expect((param.setValueAtTime as any)).toHaveBeenCalledWith(0.4, 2);
    expect((param.linearRampToValueAtTime as any)).toHaveBeenCalledWith(0, 2.8);
    expect(duration).toBe(0.8);
  });

  it('getRelease returns numeric release for mode', () => {
    (document.getElementById('release') as HTMLInputElement).value = '1.2';
    const env = new EnvelopeModule('amp');
    expect(env.getRelease()).toBe(1.2);
  });
});