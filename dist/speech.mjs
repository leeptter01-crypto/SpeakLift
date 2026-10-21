export const SPEECH_TIMING = Object.freeze({
  noSpeechMs: 12000,
  maxMs: 30000,
  silenceMs: 2500,
  finalWaitMs: 1500,
  restartDelayMs: 300,
  restartGraceMs: 1000,
  maxRestarts: 6,
});

// One user action may span several browser recognition connections.
export function createSpeechSession(Recognition, {
  language, onTranscript = () => {}, onState = () => {}, onTick = () => {},
  onFinish = () => {}, isComplete = () => false, clock = globalThis, timing = SPEECH_TIMING,
}) {
  let active = false;
  let closing = false;
  let engine = null;
  let segment = "";
  let committed = "";
  let speaking = false;
  let heardSpeech = false;
  let restarts = 0;
  let networkRetries = 0;
  let status = "connecting";
  let startedAt = 0;
  let finishReason = "";
  const timers = new Map();
  const now = () => clock.Date ? clock.Date.now() : Date.now();
  const transcript = () => [committed, segment].filter(Boolean).join(" ").trim();
  const reportState = value => { status = value; onState(value); };

  function clear(name) {
    clock.clearTimeout(timers.get(name));
    timers.delete(name);
  }

  function later(name, callback, delay) {
    clear(name);
    timers.set(name, clock.setTimeout(() => {
      timers.delete(name);
      if (active) callback();
    }, delay));
  }

  function clearTimers() {
    for (const name of timers.keys()) clear(name);
  }

  function detach(abort = true) {
    const previous = engine;
    engine = null;
    if (!previous) return;
    previous.onresult = previous.onerror = previous.onend = null;
    previous.onspeechstart = previous.onspeechend = null;
    previous.onstart = previous.onaudiostart = null;
    if (abort) {
      try { previous.abort(); } catch { /* Already stopped by the browser. */ }
    }
  }

  function complete(error = null) {
    if (!active) return;
    const text = transcript();
    active = false;
    closing = true;
    clearTimers();
    detach();
    onFinish({ transcript: text, reason: finishReason, error });
  }

  function finish(reason = "manual") {
    if (!active || closing) return;
    closing = true;
    finishReason = reason;
    clearTimers();
    if (!engine || reason === "no-speech" || (!heardSpeech && status !== "listening")) {
      complete(reason === "no-speech" && networkRetries && status !== "listening" ? "network" : null);
      return;
    }
    reportState("processing");
    // stop() flushes the final hypothesis; abort() would discard it.
    later("final", () => complete(), timing.finalWaitMs);
    try { engine.stop(); } catch { complete(); }
  }

  function silence() {
    if (heardSpeech && !closing) later("silence", () => finish("silence"), timing.silenceMs);
  }

  function reconnect() {
    if (!active || closing) return;
    clear("reconnect-fallback");
    committed = transcript();
    segment = "";
    detach();
    speaking = false;
    if (heardSpeech && !timers.has("silence")) silence();
    if (restarts >= timing.maxRestarts) {
      finishReason = "interrupted";
      complete("recognition-ended");
      return;
    }
    restarts += 1;
    reportState("connecting");
    later("restart", connect, timing.restartDelayMs);
  }

  function connect() {
    if (!active || closing) return;
    let current;
    try { current = new Recognition(); } catch { complete("start-failed"); return; }
    engine = current;
    const isCurrent = () => active && engine === current;
    current.lang = language;
    current.continuous = true;
    current.interimResults = true;
    current.maxAlternatives = 1;
    const listening = () => {
      if (isCurrent() && !closing && status !== "listening") reportState("listening");
    };
    current.onstart = listening;
    current.onaudiostart = listening;
    current.onspeechstart = () => {
      if (!isCurrent() || closing) return;
      listening();
      heardSpeech = true;
      speaking = true;
      clear("no-speech");
      clear("silence");
    };
    current.onspeechend = () => {
      if (!isCurrent() || closing) return;
      speaking = false;
      silence();
    };
    current.onresult = event => {
      if (!isCurrent()) return;
      // results is a cumulative snapshot, not an append-only list of new words.
      const results = Array.from(event.results || []);
      segment = results.map(result => result[0]?.transcript?.trim() || "").filter(Boolean).join(" ");
      if (segment) {
        listening();
        heardSpeech = true;
        clear("no-speech");
        if (!speaking) silence();
      }
      onTranscript(transcript());
      if (!closing && results.length && results.every(result => result.isFinal) && isComplete(transcript())) finish("complete");
    };
    current.onerror = event => {
      if (!isCurrent()) return;
      if (closing) { complete(["no-speech", "aborted"].includes(event.error) ? null : event.error); return; }
      if (event.error === "no-speech") {
        // Some engines omit end after an error; retain the same attempt deadline.
        later("reconnect-fallback", reconnect, timing.restartGraceMs);
      } else if (event.error === "network" && !heardSpeech && networkRetries === 0) {
        // Only retry before speech: a broken mid-sentence capture must not be scored.
        networkRetries += 1;
        detach();
        clear("reconnect-fallback");
        reportState("retrying");
        later("restart", connect, timing.restartGraceMs);
      } else {
        finishReason = "error";
        complete(event.error || "recognition-error");
      }
    };
    current.onend = () => {
      if (!isCurrent()) return;
      if (closing) complete();
      else reconnect();
    };
    try { current.start(); } catch { complete("start-failed"); }
  }

  function tick() {
    if (closing) return;
    onTick(Math.max(0, Math.ceil((timing.maxMs - (now() - startedAt)) / 1000)), status);
    later("tick", tick, 1000);
  }

  return {
    start() {
      if (active || closing) return;
      active = true;
      startedAt = now();
      reportState("connecting");
      later("limit", () => finish("limit"), timing.maxMs);
      later("no-speech", () => finish("no-speech"), timing.noSpeechMs);
      tick();
      connect();
    },
    finish,
    cancel() {
      active = false;
      closing = true;
      clearTimers();
      detach();
    },
  };
}
