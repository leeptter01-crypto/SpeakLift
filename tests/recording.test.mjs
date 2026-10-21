import test from "node:test";
import assert from "node:assert/strict";
import { createLocalRecording, RECORDING_TIMING } from "../dist/recording.mjs";

function harness({ deferred = false, rejected = false, noStop = false, unsupported = false, startError = false } = {}) {
  let time = 0, sequence = 0, stoppedTracks = 0, resolve;
  const pending = new Map(), finished = [], states = [], recorders = [], ticks = [];
  const stream = { getTracks: () => [{ stop() { stoppedTracks += 1; } }] };
  const clock = {
    setTimeout(callback, delay) { pending.set(++sequence, { at: time + delay, callback }); return sequence; },
    clearTimeout(id) { pending.delete(id); },
    tick(ms) {
      const end = time + ms;
      while (true) {
        const next = [...pending].filter(([, item]) => item.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        time = next[1].at; pending.delete(next[0]); next[1].callback();
      }
      time = end;
    },
  };
  class Recorder {
    static isTypeSupported(type) { return type === "audio/mp4"; }
    constructor(source, options) { assert.equal(source, stream); this.mimeType = options.mimeType; this.state = "inactive"; recorders.push(this); }
    start() { if (startError) throw new Error("failed"); this.state = "recording"; }
    stop() {
      this.state = "inactive";
      if (!noStop) { this.ondataavailable?.({ data: new Blob(["audio"], { type: this.mimeType }) }); this.onstop?.(); }
    }
  }
  const mediaDevices = { getUserMedia(options) {
    assert.deepEqual(options, { audio: true });
    if (rejected) return Promise.reject(Object.assign(new Error(), { name: "NotAllowedError" }));
    return deferred ? new Promise(r => { resolve = r; }) : Promise.resolve(stream);
  } };
  const recording = createLocalRecording({
    mediaDevices, Recorder: unsupported ? null : Recorder, clock,
    onState: value => states.push(value), onTick: value => ticks.push(value), onFinish: value => finished.push(value),
  });
  return { recording, clock, pending, finished, states, ticks, recorders, resolve: () => resolve(stream), stoppedTracks: () => stoppedTracks };
}

test("one click records locally, stops at 30 seconds and releases capture", async () => {
  const h = harness();
  await h.recording.start();
  assert.deepEqual(h.states, ["permission", "recording"]);
  h.clock.tick(RECORDING_TIMING.maxMs);
  assert.equal(h.finished.length, 1);
  assert.equal(h.finished[0].blob.type, "audio/mp4");
  assert.equal(h.finished[0].error, null);
  assert.equal(h.stoppedTracks(), 1);
  assert.equal(h.pending.size, 0);
  h.recording.stop();
  assert.equal(h.finished.length, 1);
});

test("manual stop produces one playback result; start cannot run twice", async () => {
  const h = harness();
  await h.recording.start();
  await h.recording.start();
  h.recording.stop();
  h.clock.tick(60000);
  assert.equal(h.recorders.length, 1);
  assert.equal(h.finished.length, 1);
  assert.equal(h.pending.size, 0);
});

test("cancelled or timed-out permission requests discard late streams", async () => {
  for (const mode of ["cancel", "stop", "timeout"]) {
    const h = harness({ deferred: true });
    const start = h.recording.start();
    if (mode === "timeout") h.clock.tick(RECORDING_TIMING.permissionMs);
    else h.recording[mode]();
    h.resolve(); await start;
    assert.equal(h.recorders.length, 0);
    assert.equal(h.stoppedTracks(), 1);
    assert.equal(h.finished.length, mode === "cancel" ? 0 : 1);
    assert.equal(h.pending.size, 0);
  }
});

test("navigation cancellation ignores queued recording events", async () => {
  const h = harness();
  await h.recording.start();
  const staleStop = h.recorders[0].onstop;
  const staleData = h.recorders[0].ondataavailable;
  h.recording.cancel();
  staleData({ data: new Blob(["late"]) }); staleStop();
  h.clock.tick(60000);
  assert.equal(h.finished.length, 0);
  assert.equal(h.stoppedTracks(), 1);
  assert.equal(h.pending.size, 0);
});

test("unsupported devices and permission/start failures return without capture leaks", async () => {
  for (const [options, error] of [[{ unsupported: true }, "unsupported"], [{ rejected: true }, "not-allowed"], [{ startError: true }, "recording-failed"]]) {
    const h = harness(options);
    await h.recording.start();
    assert.equal(h.finished[0].error, error);
    assert.equal(h.pending.size, 0);
    assert.equal(h.stoppedTracks(), options.startError ? 1 : 0);
  }
});

test("missing stop callback and recorder errors cannot hang or retain the microphone", async () => {
  for (const fail of [false, true]) {
    const h = harness({ noStop: true });
    await h.recording.start();
    if (fail) h.recorders[0].onerror();
    else { h.recording.stop(); h.clock.tick(RECORDING_TIMING.finalMs); }
    assert.equal(h.finished.length, 1);
    assert.equal(h.finished[0].blob, null);
    assert.equal(h.stoppedTracks(), 1);
    assert.equal(h.pending.size, 0);
  }
});
