import { jest } from "bun:test"

function createGainNode() {
  return {
    gain: { value: 1 },
    connect: jest.fn(),
    disconnect: jest.fn()
  };
}

function createCompressorNode() {
  return {
    threshold: { value: 0 },
    ratio: { value: 0 },
    attack: { value: 0 },
    release: { value: 0 },
    knee: { value: 0 },
    reduction: 0,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    context: {},
    numberOfInputs: 1,
    numberOfOutputs: 1,
    connect: jest.fn(),
    disconnect: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
}

function createDelayNode() {
  return {
    delayTime: { value: 0 },
    connect: jest.fn(),
    disconnect: jest.fn()
  };
}

function createOscillator() {
  return {
    type: 'sine',
    frequency: { value: 0 },
    connect: jest.fn(),
    disconnect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn()
  };
}

function createBiquadFilter() {
  return {
    type: 'allpass',
    frequency: { value: 0 },
    Q: { value: 0 },
    gain: { value: 0 },
    connect: jest.fn(),
    disconnect: jest.fn()
  };
}

function createConvolverNode() {
  return {
    buffer: null,
    connect: jest.fn(),
    disconnect: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  };
}

function createBufferMock(numChannels: number, length: number, sampleRate: number) {
  const channels = Array.from({ length: numChannels }, () => new Float32Array(length));
  return {
    getChannelData: (channel: number) => channels[channel],
    length,
    sampleRate,
    numberOfChannels: numChannels,
  } as unknown as AudioBuffer;
}

const sampleRate = 44100;

export function createMockAudioCtx(overrides: Partial<AudioContext> = {}) {
  const compressorNode = createCompressorNode();
  
  return {
    createGain: jest.fn(() => createGainNode()),
    createDynamicsCompressor: jest.fn(() => compressorNode),
    createDelay: jest.fn(() => createDelayNode()),
    createOscillator: jest.fn(() => createOscillator()),
    createBiquadFilter: jest.fn(() => createBiquadFilter()),
    createConvolver: jest.fn(() => createConvolverNode()),
    createBuffer: jest.fn(createBufferMock),
    sampleRate,
    ...overrides,
    __mockCompressorNode: compressorNode // for test access
  } as unknown as AudioContext & { __mockCompressorNode: any };
}