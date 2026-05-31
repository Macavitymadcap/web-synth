export type TransportState = "stopped" | "playing" | "paused";

export type TransportConfig = {
  bpm: number;
  lookaheadMs: number;
  scheduleAheadMs: number;
  ticksPerBeat: number;
};

export type ScheduledStep = {
  id: string;
  tick: number;
  audioTime: number;
};

export type TransportCallback = (step: ScheduledStep) => void;

type AudioClock = Pick<AudioContext, "currentTime">;

type TimerHandle = ReturnType<typeof setInterval>;

type TransportTimer = {
  setInterval(callback: () => void, delayMs: number): TimerHandle;
  clearInterval(handle: TimerHandle): void;
};

export const DEFAULT_TRANSPORT_CONFIG: TransportConfig = {
  bpm: 120,
  lookaheadMs: 25,
  scheduleAheadMs: 100,
  ticksPerBeat: 4,
};

export class TransportService {
  private config: TransportConfig;
  private readonly timer: TransportTimer;
  private readonly callbacks = new Set<TransportCallback>();
  private state: TransportState = "stopped";
  private clock: AudioClock | null = null;
  private timerHandle: TimerHandle | null = null;
  private currentTick = 0;
  private nextTickTime = 0;
  private sessionId = 0;

  constructor(
    config: Partial<TransportConfig> = {},
    timer: TransportTimer = {
      setInterval: (callback, delayMs) => setInterval(callback, delayMs),
      clearInterval: (handle) => clearInterval(handle),
    },
  ) {
    this.config = this.normalizeConfig({ ...DEFAULT_TRANSPORT_CONFIG, ...config });
    this.timer = timer;
  }

  configure(config: Partial<TransportConfig>): void {
    this.config = this.normalizeConfig({ ...this.config, ...config });
  }

  start(audioContext: AudioClock, startTick: number = this.currentTick): void {
    this.clearTimer();
    this.clock = audioContext;
    this.state = "playing";
    this.currentTick = Math.max(0, Math.floor(startTick));
    this.nextTickTime = audioContext.currentTime;
    this.sessionId += 1;

    this.scheduleDueTicks();
    this.timerHandle = this.timer.setInterval(
      () => this.scheduleDueTicks(),
      this.config.lookaheadMs,
    );
  }

  pause(): void {
    if (this.state !== "playing") return;

    this.clearTimer();
    this.state = "paused";
  }

  stop(): void {
    this.clearTimer();
    this.state = "stopped";
    this.clock = null;
    this.currentTick = 0;
    this.nextTickTime = 0;
  }

  reset(tick: number = 0): void {
    this.currentTick = Math.max(0, Math.floor(tick));
    if (this.clock) {
      this.nextTickTime = this.clock.currentTime;
    }
  }

  subscribe(callback: TransportCallback): () => void {
    this.callbacks.add(callback);
    return () => {
      this.callbacks.delete(callback);
    };
  }

  getState(): TransportState {
    return this.state;
  }

  getCurrentTick(): number {
    return this.currentTick;
  }

  getConfig(): TransportConfig {
    return { ...this.config };
  }

  private scheduleDueTicks(): void {
    if (this.state !== "playing" || !this.clock) return;

    const scheduleUntil = this.clock.currentTime + this.config.scheduleAheadMs / 1000;
    const tickDuration = this.getTickDuration();

    while (this.nextTickTime < scheduleUntil) {
      const step: ScheduledStep = {
        id: `${this.sessionId}:${this.currentTick}`,
        tick: this.currentTick,
        audioTime: this.nextTickTime,
      };

      this.callbacks.forEach((callback) => callback(step));
      this.currentTick += 1;
      this.nextTickTime += tickDuration;
    }
  }

  private getTickDuration(): number {
    return 60 / this.config.bpm / this.config.ticksPerBeat;
  }

  private clearTimer(): void {
    if (this.timerHandle === null) return;

    this.timer.clearInterval(this.timerHandle);
    this.timerHandle = null;
  }

  private normalizeConfig(config: TransportConfig): TransportConfig {
    return {
      bpm: Math.max(1, config.bpm),
      lookaheadMs: Math.max(1, config.lookaheadMs),
      scheduleAheadMs: Math.max(1, config.scheduleAheadMs),
      ticksPerBeat: Math.max(1, Math.floor(config.ticksPerBeat)),
    };
  }
}
