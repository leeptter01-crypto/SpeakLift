import test from "node:test";
import assert from "node:assert/strict";
import { createSpeechSession, SPEECH_TIMING } from "../dist/speech.mjs";

function harness({ startError = false, language = "en-US", isComplete } = {}) {
  let time = 0;
  let sequence = 0;
  const pending = new Map();
  const clock = {
    Date: { now: () => time },
    setTimeout(callback, delay) { pending.set(++sequence, { at: time + delay, callback }); return sequence; },
    clearTimeout(id) { pending.delete(id); },
    tick(ms) {
      const end = time + ms;
      while (true) {
        const next = [...pending].filter(([, item]) => item.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        time = next[1].at;
        pending.delete(next[0]);
        next[1].callback();
      }
      time = end;
    },
  };
  const engines = [], finished = [], updates = [], states = [], ticks = [];
  class Recognition {
    constructor() { engines.push(this); this.stops = 0; this.aborts = 0; }
    start() { if (startError) throw new Error("failed"); }
    stop() { this.stops += 1; }
    abort() { this.aborts += 1; }
  }
  const session = createSpeechSession(Recognition, {
    language, clock, isComplete, onFinish: value => finished.push(value),
    onTranscript: value => updates.push(value), onState: value => states.push(value), onTick: value => ticks.push(value),
  });
  session.start();
  return { session, clock, engines, finished, updates, states, ticks, pending };
}

function results(engine, ...parts) {
  engine.onresult({ results: parts.map(part => Object.assign([{ transcript: part[0] }], { isFinal: part[1] })) });
}

test("one click listens beyond six seconds; silence before speech pauses at 12 seconds", () => {
  const h = harness();
  const engine = h.engines[0];
  assert.equal(engine.continuous, true);
  assert.equal(engine.interimResults, true);
  assert.equal(engine.lang, "en-US");
  h.clock.tick(7000);
  assert.equal(h.finished.length, 0);
  h.clock.tick(5000);
  assert.deepEqual(h.finished, [{ transcript: "", reason: "no-speech", error: null }]);
  assert.equal(engine.aborts, 1);
  assert.equal(h.pending.size, 0);
});

test("a long spoken sentence is merged and scored only after quiet and final delivery", () => {
  const h = harness();
  const engine = h.engines[0];
  const stale = engine.onresult;
  engine.onspeechstart();
  results(engine, ["I will send", false]);
  h.clock.tick(9000);
  assert.equal(h.finished.length, 0);
  assert.equal(engine.stops, 0);
  results(engine, ["I will send you", true], ["the update before", false]);
  engine.onspeechend();
  h.clock.tick(2000);
  engine.onspeechstart();
  results(engine, ["I will send you", true], ["the update before fine", false]);
  engine.onspeechend();
  h.clock.tick(SPEECH_TIMING.silenceMs);
  assert.equal(engine.stops, 1);
  assert.equal(h.finished.length, 0);
  results(engine, ["I will send you", true], ["the update before five.", true]);
  engine.onend();
  assert.deepEqual(h.finished, [{ transcript: "I will send you the update before five.", reason: "silence", error: null }]);
  stale({ results: [[{ transcript: "late callback" }]] });
  h.clock.tick(60000);
  assert.equal(h.finished.length, 1);
  assert.equal(h.pending.size, 0);
});

test("interim corrections and removals replace rather than duplicate cumulative results", () => {
  const h = harness({ language: "yue-HK" });
  const engine = h.engines[0];
  results(engine, ["你好", false]);
  results(engine, ["你好", true], ["错误", false]);
  results(engine, ["你好", true]);
  results(engine, ["你好", true], ["好高兴认识你", true]);
  assert.equal(h.updates.at(-1), "你好 好高兴认识你");
  assert.equal(engine.lang, "yue-HK");
  h.clock.tick(SPEECH_TIMING.silenceMs + SPEECH_TIMING.finalWaitMs);
  assert.equal(h.finished[0].transcript, "你好 好高兴认识你");
});

test("browser end reconnects automatically and retains earlier chunks", () => {
  const h = harness();
  results(h.engines[0], ["I will send you", true]);
  h.engines[0].onend();
  h.clock.tick(SPEECH_TIMING.restartDelayMs);
  assert.equal(h.engines.length, 2);
  const engine = h.engines[1];
  engine.onspeechstart();
  results(engine, ["the update before five.", true]);
  engine.onspeechend();
  h.clock.tick(SPEECH_TIMING.silenceMs + SPEECH_TIMING.finalWaitMs);
  assert.equal(h.finished[0].transcript, "I will send you the update before five.");
});

test("a confirmed complete sentence can finish without a speechend event, but interim text cannot", () => {
  const h = harness({ isComplete: text => text === "Hello, nice to meet you." });
  const engine = h.engines[0];
  engine.onspeechstart();
  results(engine, ["Hello, nice to meet you.", false]);
  assert.equal(engine.stops, 0);
  results(engine, ["Hello, nice to meet you.", true]);
  assert.equal(engine.stops, 1);
  engine.onend();
  assert.equal(h.finished[0].reason, "complete");
  assert.equal(h.finished.length, 1);
});

test("no-speech errors without end do not hang or reset the initial deadline", () => {
  const h = harness();
  h.clock.tick(7000);
  h.engines[0].onerror({ error: "no-speech" });
  h.clock.tick(SPEECH_TIMING.restartGraceMs + SPEECH_TIMING.restartDelayMs);
  assert.equal(h.engines.length, 2);
  h.clock.tick(3700);
  assert.equal(h.finished[0].reason, "no-speech");
  assert.equal(h.pending.size, 0);
});

test("hard time limit stops capture and missing end cannot leave processing stuck", () => {
  const h = harness();
  const engine = h.engines[0];
  engine.onspeechstart();
  results(engine, ["some words", false]);
  h.clock.tick(SPEECH_TIMING.maxMs);
  assert.equal(engine.stops, 1);
  assert.equal(h.states.at(-1), "processing");
  h.clock.tick(SPEECH_TIMING.finalWaitMs);
  assert.equal(h.finished[0].reason, "limit");
  assert.equal(h.finished[0].transcript, "some words");
  assert.equal(h.pending.size, 0);
});

test("manual finish waits for the final text and can run only once", () => {
  const h = harness();
  const engine = h.engines[0];
  results(engine, ["Hello nice", false]);
  h.session.finish();
  h.session.finish();
  results(engine, ["Hello, nice to meet you.", true]);
  engine.onend();
  h.session.start();
  assert.equal(h.engines.length, 1);
  assert.equal(engine.stops, 1);
  assert.equal(h.finished.length, 1);
  assert.equal(h.finished[0].transcript, "Hello, nice to meet you.");
});

test("cancellation ignores queued results, restarts, and finalization callbacks", () => {
  for (const phase of ["listening", "reconnecting", "processing"]) {
    const h = harness();
    const engine = h.engines[0];
    const staleResult = engine.onresult;
    const staleEnd = engine.onend;
    results(engine, ["Hello", false]);
    if (phase === "reconnecting") engine.onend();
    if (phase === "processing") h.session.finish();
    h.session.cancel();
    staleResult({ results: [[{ transcript: "Hello, nice to meet you." }]] });
    staleEnd();
    h.clock.tick(60000);
    assert.equal(h.finished.length, 0);
    assert.equal(h.engines.length, 1);
    assert.equal(h.pending.size, 0);
  }
});

test("permissions, capture, and start failures terminate without silent retries", () => {
  for (const error of ["not-allowed", "service-not-allowed", "audio-capture", "aborted"]) {
    const h = harness();
    h.engines[0].onerror({ error });
    h.clock.tick(60000);
    assert.equal(h.finished[0].error, error);
    assert.equal(h.engines.length, 1);
    assert.equal(h.pending.size, 0);
  }
  assert.equal(harness({ startError: true }).finished[0].error, "start-failed");
});

test("connecting does not claim to be listening before the browser starts", () => {
  const h = harness();
  assert.deepEqual(h.states, ["connecting"]);
  h.engines[0].onstart();
  h.engines[0].onaudiostart();
  assert.deepEqual(h.states, ["connecting", "listening"]);
  h.session.cancel();
});

test("network errors before speech retry once, ignore stale events and release for another click", () => {
  const h = harness();
  const staleEnd = h.engines[0].onend;
  h.engines[0].onerror({ error: "network" });
  staleEnd();
  assert.equal(h.states.at(-1), "retrying");
  h.clock.tick(SPEECH_TIMING.restartGraceMs);
  assert.equal(h.engines.length, 2);
  h.engines[1].onerror({ error: "network" });
  h.clock.tick(60000);
  assert.equal(h.finished[0].error, "network");
  assert.equal(h.finished.length, 1);
  assert.equal(h.pending.size, 0);
  const next = harness();
  results(next.engines[0], ["Hello", true]);
  next.session.finish();
  next.engines[0].onend();
  assert.equal(next.finished[0].error, null);
});

test("network interruption after speech is never scored or retried", () => {
  const h = harness();
  results(h.engines[0], ["Hello", false]);
  h.engines[0].onerror({ error: "network" });
  h.clock.tick(60000);
  assert.equal(h.engines.length, 1);
  assert.equal(h.finished[0].error, "network");
});

test("a network retry preserves the initial deadline and can be cancelled immediately", () => {
  const h = harness();
  h.clock.tick(11000);
  h.engines[0].onerror({ error: "network" });
  h.clock.tick(1000);
  assert.equal(h.finished.length, 1);
  assert.equal(h.engines.length, 1);
  assert.equal(h.pending.size, 0);
  const next = harness();
  next.engines[0].onerror({ error: "network" });
  next.session.finish();
  next.clock.tick(60000);
  assert.equal(next.finished.length, 1);
  assert.equal(next.engines.length, 1);
});

test("repeated engine disconnects are bounded and cannot restart indefinitely", () => {
  const h = harness();
  for (let i = 0; i <= SPEECH_TIMING.maxRestarts; i += 1) {
    h.engines.at(-1).onend();
    h.clock.tick(SPEECH_TIMING.restartDelayMs);
  }
  assert.equal(h.engines.length, SPEECH_TIMING.maxRestarts + 1);
  assert.equal(h.finished[0].error, "recognition-ended");
  assert.equal(h.pending.size, 0);
});
