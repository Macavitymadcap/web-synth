import { describe, expect, test } from "bun:test";
import { TransportService, type ScheduledStep } from "../../src/core/transport-service";

function createTransportHarness(config = {}) {
  let now = 0;
  let intervalCallback: (() => void) | null = null;
  let intervalDelay = 0;
  let cleared = false;

  const transport = new TransportService(config, {
    setInterval: (callback, delayMs) => {
      intervalCallback = callback;
      intervalDelay = delayMs;
      cleared = false;
      return 1;
    },
    clearInterval: () => {
      cleared = true;
      intervalCallback = null;
    },
  });

  return {
    transport,
    clock: {
      get currentTime() {
        return now;
      },
    } as AudioContext,
    advance(seconds: number) {
      now += seconds;
      intervalCallback?.();
    },
    get intervalDelay() {
      return intervalDelay;
    },
    get cleared() {
      return cleared;
    },
  };
}

describe("TransportService", () => {
  test("starts, schedules initial ticks, and exposes play state", () => {
    const harness = createTransportHarness();
    const steps: ScheduledStep[] = [];

    harness.transport.subscribe((step) => steps.push(step));
    harness.transport.start(harness.clock);

    expect(harness.transport.getState()).toBe("playing");
    expect(harness.intervalDelay).toBe(25);
    expect(steps).toEqual([{ id: "1:0", tick: 0, audioTime: 0 }]);
    expect(harness.transport.getCurrentTick()).toBe(1);
  });

  test("schedules future ticks from audio-context time without wall-clock sleeps", () => {
    const harness = createTransportHarness();
    const steps: ScheduledStep[] = [];

    harness.transport.subscribe((step) => steps.push(step));
    harness.transport.start(harness.clock);
    harness.advance(0.05);

    expect(steps.map((step) => step.tick)).toEqual([0, 1]);
    expect(steps[1].audioTime).toBeCloseTo(0.125);
  });

  test("stop clears the timer, resets position, and prevents stale callbacks", () => {
    const harness = createTransportHarness();
    const steps: ScheduledStep[] = [];

    harness.transport.subscribe((step) => steps.push(step));
    harness.transport.start(harness.clock);
    harness.transport.stop();
    harness.advance(1);

    expect(harness.cleared).toBe(true);
    expect(harness.transport.getState()).toBe("stopped");
    expect(harness.transport.getCurrentTick()).toBe(0);
    expect(steps.map((step) => step.tick)).toEqual([0]);
  });

  test("tempo changes affect future scheduled ticks", () => {
    const harness = createTransportHarness();
    const steps: ScheduledStep[] = [];

    harness.transport.subscribe((step) => steps.push(step));
    harness.transport.start(harness.clock);
    harness.transport.configure({ bpm: 60 });
    harness.advance(0.05);
    harness.advance(0.2);

    expect(steps.map((step) => step.tick)).toEqual([0, 1]);
    expect(steps[1].audioTime).toBeCloseTo(0.125);
    expect(harness.transport.getCurrentTick()).toBe(2);

    harness.advance(0.03);

    expect(steps.map((step) => step.tick)).toEqual([0, 1, 2]);
    expect(steps[2].audioTime).toBeCloseTo(0.375);
  });

  test("pause keeps position but stops scheduling until restarted", () => {
    const harness = createTransportHarness();
    const steps: ScheduledStep[] = [];

    harness.transport.subscribe((step) => steps.push(step));
    harness.transport.start(harness.clock);
    harness.transport.pause();
    harness.advance(1);

    expect(harness.transport.getState()).toBe("paused");
    expect(harness.transport.getCurrentTick()).toBe(1);
    expect(steps.map((step) => step.tick)).toEqual([0]);

    harness.transport.start(harness.clock);

    expect(steps.map((step) => step.tick)).toEqual([0, 1]);
  });
});
