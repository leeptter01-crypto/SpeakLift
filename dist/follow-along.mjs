import { createLocalRecording } from "./recording.mjs?v=13";
import { createSpeechSession } from "./speech.mjs?v=13";

// Audio capture owns the attempt; recognition is optional and may fail independently.
export function createFollowAlongSession({
  mediaDevices, Recorder, Recognition, language, isComplete,
  onState = () => {}, onTick = () => {}, onTranscript = () => {},
  onRecognitionUnavailable = () => {}, onFinish = () => {},
  clock = globalThis, recordingTiming, speechTiming,
}) {
  let active = true;
  let started = false;
  let capturing = false;
  let speech = null;
  let audioResult = null;
  let speechResult = null;
  function settle() {
    if (!active || !audioResult || (!audioResult.error && !speechResult)) return;
    active = false;
    speech?.cancel();
    onFinish({
      blob: audioResult.blob,
      recordingError: audioResult.error,
      transcript: speechResult?.transcript || "",
      recognitionError: speechResult?.error || null,
    });
  }
  function startSpeech() {
    if (!active || !capturing) return;
    if (!Recognition) {
      speechResult = { transcript: "", error: "unsupported" };
      onRecognitionUnavailable();
      return;
    }
    speech = createSpeechSession(Recognition, {
      language, isComplete, clock, timing: speechTiming,
      onTranscript(text) { if (active) onTranscript(text); },
      onFinish(result) {
        if (!active) return;
        speechResult = result;
        if (!result.error && result.transcript) recording.stop();
        else if (capturing) onRecognitionUnavailable();
        settle();
      },
    });
    speech.start();
  }
  const recording = createLocalRecording({
    mediaDevices, Recorder, clock, timing: recordingTiming,
    onTick(seconds) { if (active) onTick(seconds); },
    onState(status) {
      if (!active) return;
      capturing = status === "recording";
      onState(status);
      if (!active) return;
      if (capturing) startSpeech();
      else if (status === "processing") speech?.finish();
    },
    onFinish(result) {
      if (!active) return;
      capturing = false;
      audioResult = result;
      if (result.error) speech?.cancel();
      else if (!speechResult) speech?.finish();
      settle();
    },
  });
  return {
    start() {
      if (!active || started) return;
      started = true;
      return recording.start();
    },
    finish() { if (active) recording.stop(); },
    cancel() {
      active = false;
      capturing = false;
      recording.cancel();
      speech?.cancel();
    },
  };
}
