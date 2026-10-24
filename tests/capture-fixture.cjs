// Browser-only fixture: no physical microphone or uploaded audio.
module.exports = function installCaptureFixture() {
  window.captureCount = 0;
  window.stoppedTracks = 0;
  Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { configurable: true, value: async () => {
    window.captureCount++;
    if (window.denyCapture) throw Object.assign(new Error('denied'), { name: 'NotAllowedError' });
    return { getTracks: () => [{ stop() { window.stoppedTracks++; } }] };
  } });
  window.MediaRecorder = class {
    constructor() { this.state = 'inactive'; window.testRecorder = this; }
    start() { this.state = 'recording'; }
    stop() {
      this.state = 'inactive';
      const bytes = new ArrayBuffer(1644), view = new DataView(bytes);
      const text = (at, value) => [...value].forEach((ch, i) => view.setUint8(at + i, ch.charCodeAt(0)));
      text(0, 'RIFF'); view.setUint32(4, 1636, true); text(8, 'WAVE'); text(12, 'fmt ');
      view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
      view.setUint32(24, 8000, true); view.setUint32(28, 16000, true);
      view.setUint16(32, 2, true); view.setUint16(34, 16, true); text(36, 'data'); view.setUint32(40, 1600, true);
      this.ondataavailable?.({ data: new Blob([bytes], { type: 'audio/wav' }) });
      this.onstop?.();
    }
  };
};
