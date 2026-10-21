export const RECORDING_TIMING = Object.freeze({ permissionMs: 15000, maxMs: 30000, finalMs: 1500 });

// Local playback only. This module never uploads audio or produces a score.
export function createLocalRecording({
  mediaDevices, Recorder, onState = () => {}, onTick = () => {},
  onFinish = () => {}, clock = globalThis, timing = RECORDING_TIMING,
}) {
  let phase = "idle";
  let stream = null;
  let recorder = null;
  let chunks = [];
  let remaining = Math.ceil(timing.maxMs / 1000);
  const timers = new Set();
  const stopTracks = source => source?.getTracks().forEach(track => track.stop());
  function later(callback, ms) {
    const id = clock.setTimeout(() => { timers.delete(id); callback(); }, ms);
    timers.add(id);
  }
  function clearTimers() { for (const id of timers) clock.clearTimeout(id); timers.clear(); }
  function cleanup() {
    clearTimers();
    if (recorder) {
      recorder.ondataavailable = recorder.onstop = recorder.onerror = null;
      if (recorder.state !== "inactive") { try { recorder.stop(); } catch { /* Already ended. */ } }
    }
    stopTracks(stream);
    stream = null;
    recorder = null;
    chunks = [];
  }
  function finish(error = null) {
    if (phase === "done") return;
    const blob = !error && chunks.length ? new Blob(chunks, { type: recorder?.mimeType || chunks[0].type }) : null;
    phase = "done";
    cleanup();
    onFinish({ blob, error: error || (blob?.size ? null : "empty-recording") });
  }
  function stop() {
    if (phase === "permission") { finish("cancelled"); return; }
    if (phase !== "recording") return;
    phase = "processing";
    clearTimers();
    onState(phase);
    later(() => finish("recording-timeout"), timing.finalMs);
    try { recorder.stop(); } catch { finish("recording-failed"); }
    stopTracks(stream);
    stream = null;
  }
  function tick() {
    if (phase !== "recording") return;
    onTick(remaining--);
    later(tick, 1000);
  }
  return {
    async start() {
      if (phase !== "idle") return;
      if (!mediaDevices?.getUserMedia || !Recorder) { finish("unsupported"); return; }
      phase = "permission";
      onState(phase);
      later(() => finish("permission-timeout"), timing.permissionMs);
      try {
        const acquired = await mediaDevices.getUserMedia({ audio: true });
        if (phase !== "permission") { stopTracks(acquired); return; }
        stream = acquired;
        clearTimers();
        const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find(type => Recorder.isTypeSupported?.(type));
        recorder = mimeType ? new Recorder(stream, { mimeType }) : new Recorder(stream);
        recorder.ondataavailable = event => { if (phase !== "done" && event.data?.size) chunks.push(event.data); };
        recorder.onerror = () => finish("recording-failed");
        recorder.onstop = () => finish();
        recorder.start();
        if (phase === "done") return;
        phase = "recording";
        onState(phase);
        later(stop, timing.maxMs);
        tick();
      } catch (error) { if (phase !== "done") finish(error?.name === "NotAllowedError" ? "not-allowed" : "recording-failed"); }
    },
    stop,
    cancel() { phase = "done"; cleanup(); },
  };
}
