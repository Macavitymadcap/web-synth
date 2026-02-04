import type { Synth } from "../synth";

export function createRecordingHandler(
  synth: Synth,
  recordBtn: HTMLButtonElement
) {
  let mediaRecorder: MediaRecorder | null = null;
  let recordedChunks: Blob[] = [];

  return async () => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      synth.ensureAudio();
      if (!synth.audioCtx) return;
      
      const dest = synth.audioCtx.createMediaStreamDestination();
      synth.masterGain.connect(dest);
      
      mediaRecorder = new MediaRecorder(dest.stream);
      recordedChunks = [];
      
      mediaRecorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) {
          recordedChunks.push(ev.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `synth-recording-${Date.now()}.webm`;
        a.click();
        URL.revokeObjectURL(url);
      };
      
      mediaRecorder.start();
      recordBtn.textContent = "Stop Recording";
    } else {
      mediaRecorder.stop();
      recordBtn.textContent = "Start Recording";
    }
  };
}