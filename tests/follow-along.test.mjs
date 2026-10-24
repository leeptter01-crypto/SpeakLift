import test from "node:test";
import assert from "node:assert/strict";
import { createFollowAlongSession } from "../dist/follow-along.mjs";

function harness({ unsupported = false, denied = false, deferred = false, hangAudio = false, hangSpeech = false, cancelOn = null } = {}) {
  let time = 0, sequence = 0, stopped = 0, captures = 0, resolve;
  const timers = new Map(), finished = [], states = [], engines = [], recorders = [];
  const stream = { getTracks: () => [{ stop() { stopped++; } }] };
  const clock = {
    Date: { now: () => time },
    setTimeout(callback, ms) { timers.set(++sequence, { at: time + ms, callback }); return sequence; },
    clearTimeout(id) { timers.delete(id); },
    tick(ms) {
      const end = time + ms;
      while (true) {
        const next = [...timers].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        time = next[1].at; timers.delete(next[0]); next[1].callback();
      }
      time = end;
    },
  };
  class Recorder {
    constructor() { this.state = "inactive"; recorders.push(this); }
    start() { this.state = "recording"; }
    stop() {
      this.state = "inactive";
      if (!hangAudio) {
        this.ondataavailable?.({ data: new Blob(["audio"], { type: "audio/webm" }) });
        this.onstop?.();
      }
    }
  }
  class Recognition {
    constructor() { engines.push(this); }
    start() { this.onstart?.(); }
    stop() {
      if (this.finalText) this.result(this.finalText, true);
      if (!hangSpeech) this.onend?.();
    }
    abort() { this.aborted = true; }
    result(text, isFinal = false) { this.onresult?.({ results: [Object.assign([{ transcript: text }], { isFinal })] }); }
  }
  const session = createFollowAlongSession({
    mediaDevices: { getUserMedia() {
      captures++;
      if (denied) return Promise.reject({ name: "NotAllowedError" });
      return deferred ? new Promise(r => { resolve = r; }) : Promise.resolve(stream);
    } },
    Recorder, Recognition: unsupported ? null : Recognition, language: "en-US", clock,
    isComplete: text => text === "Hello.",
    onState: state => { states.push(state); if (state === cancelOn) session.cancel(); },
    onFinish: result => finished.push(result),
  });
  return { session, clock, timers, states, finished, engines, recorders,
    captures: () => captures, stopped: () => stopped, resolve: () => resolve(stream) };
}

test("one action captures audio and final text, finishes once, and releases devices", async () => {
  const h = harness();
  await h.session.start(); await h.session.start();
  h.engines[0].result("Hello.", true);
  h.clock.tick(60000);
  assert.equal(h.captures(), 1);
  assert.equal(h.finished.length, 1);
  assert.equal(h.finished[0].transcript, "Hello.");
  assert.ok(h.finished[0].blob.size);
  assert.equal(h.finished[0].recordingError, null);
  assert.equal(h.stopped(), 1);
  assert.equal(h.timers.size, 0);
});

test("recognition network failure does not interrupt the same recording", async () => {
  const h = harness(); await h.session.start();
  h.engines[0].onerror({ error: "network" });
  h.clock.tick(1000);
  h.engines[1].onerror({ error: "network" });
  assert.equal(h.recorders[0].state, "recording");
  assert.equal(h.finished.length, 0);
  h.session.finish();
  assert.ok(h.finished[0].blob.size);
  assert.equal(h.finished[0].recognitionError, "network");
  assert.equal(h.captures(), 1);
  assert.equal(h.timers.size, 0);
});

test("unsupported recognition or no speech still preserves 30 seconds of audio", async () => {
  for (const unsupported of [true, false]) {
    const h = harness({ unsupported }); await h.session.start();
    h.clock.tick(12000);
    assert.equal(h.recorders[0].state, "recording");
    assert.equal(h.finished.length, 0);
    h.clock.tick(18000);
    assert.equal(h.finished.length, 1);
    assert.ok(h.finished[0].blob.size);
    assert.equal(h.finished[0].transcript, "");
    assert.equal(h.timers.size, 0);
  }
});

test("manual finish flushes the final transcript before reporting combined success", async () => {
  const h = harness(); await h.session.start();
  h.engines[0].finalText = "Hello.";
  h.session.finish();
  assert.equal(h.finished.length, 1);
  assert.equal(h.finished[0].transcript, "Hello.");
  assert.ok(h.finished[0].blob.size);
});

test("denied microphone never starts recognition", async () => {
  const h = harness({ denied: true }); await h.session.start();
  assert.equal(h.engines.length, 0);
  assert.equal(h.finished[0].recordingError, "not-allowed");
  assert.equal(h.finished[0].blob, null);
});

test("cancel while permission is pending stops late streams without callbacks", async () => {
  const h = harness({ deferred: true }); const pending = h.session.start();
  h.session.cancel(); h.resolve(); await pending;
  assert.equal(h.stopped(), 1);
  assert.equal(h.engines.length, 0);
  assert.equal(h.finished.length, 0);
  assert.equal(h.timers.size, 0);
});

test("navigation cancels capture and ignores old recognition callbacks", async () => {
  const h = harness(); await h.session.start();
  const callback = h.engines[0].onresult;
  h.session.cancel();
  callback({ results: [Object.assign([{ transcript: "Hello." }], { isFinal: true })] });
  h.clock.tick(60000);
  assert.equal(h.finished.length, 0);
  assert.equal(h.stopped(), 1);
  assert.equal(h.engines[0].aborted, true);
  assert.equal(h.timers.size, 0);
});

test("missing stop callbacks are bounded, and audio failure prevents score eligibility", async () => {
  for (const hangAudio of [true, false]) {
    const h = harness({ hangAudio, hangSpeech: true }); await h.session.start();
    h.engines[0].result("Hello.", true);
    h.clock.tick(3000);
    assert.equal(h.finished.length, 1);
    assert.equal(Boolean(h.finished[0].recordingError), hangAudio);
    assert.equal(Boolean(h.finished[0].blob), !hangAudio);
    assert.equal(h.stopped(), 1);
    assert.equal(h.timers.size, 0);
  }
});

test("recording failure cancels recognition without grading a partial transcript", async () => {
  const h = harness(); await h.session.start();
  h.engines[0].result("Hello"); h.recorders[0].onerror();
  assert.equal(h.finished[0].recordingError, "recording-failed");
  assert.equal(h.finished[0].blob, null);
  assert.equal(h.engines[0].aborted, true);
  assert.equal(h.timers.size, 0);
});

test("reentrant cancellation from state callbacks leaves no timers or capture", async () => {
  for (const cancelOn of ["permission", "recording", "processing"]) {
    const h = harness({ cancelOn }); await h.session.start();
    h.session.finish(); h.clock.tick(60000);
    assert.equal(h.finished.length, 0);
    assert.equal(h.timers.size, 0);
    assert.equal(h.stopped(), cancelOn === "permission" ? 0 : 1);
  }
});
