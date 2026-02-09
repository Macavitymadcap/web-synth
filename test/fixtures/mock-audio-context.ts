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

function createAnalyserNode(sampleRate: number) {
  return {
    fftSize: 2048,
    frequencyBinCount: 1024,
    smoothingTimeConstant: 0.8,
    minDecibels: -100,
    maxDecibels: -30,
    context: { sampleRate },
    getByteFrequencyData: jest.fn((array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 128);
      }
    }),
    getByteTimeDomainData: jest.fn(),
    getFloatFrequencyData: jest.fn(),
    getFloatTimeDomainData: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn()
  };
}

function createWaveShaperNode() {
  return {
    curve: null as Float32Array | null,
    oversample: 'none' as 'none' | '2x' | '4x',
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

  // Track created nodes for test assertions
  const gainNodes: any[] = [];
  let lastDelayNode: any | null = null;
  let lastWaveShaper: any | null = null;

  const ctx: any = {
    createGain: jest.fn(() => {
      const node = createGainNode();
      gainNodes.push(node);
      return node;
    }),
    createDynamicsCompressor: jest.fn(() => compressorNode),
    createDelay: jest.fn((_maxDelayTime?: number) => {
      const node = createDelayNode();
      lastDelayNode = node;
      return node;
    }),
    createOscillator: jest.fn(() => createOscillator()),
    createBiquadFilter: jest.fn(() => createBiquadFilter()),
    createConvolver: jest.fn(() => createConvolverNode()),
    createAnalyser: jest.fn(() => createAnalyserNode(sampleRate)),
    createBuffer: jest.fn(createBufferMock),
    createWaveShaper: jest.fn(() => {
      const node = createWaveShaperNode();
      lastWaveShaper = node;
      return node;
    }),
    sampleRate,
    ...overrides,

    // Expose internals for tests
    __mockCompressorNode: compressorNode,
    __mockGainNodes: gainNodes,
    get __mockDelayNode() {
      return lastDelayNode;
    },
    get __mockWaveShaper() {
      return lastWaveShaper;
    }
  };

  return ctx as AudioContext & {
    __mockCompressorNode: any;
    __mockGainNodes: any[];
    __mockDelayNode: any;
    __mockWaveShaper: any;
  };
}