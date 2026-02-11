import type { Synth } from "../core/synth";
import type { NeonButton } from "../components/atoms/neon-button";

export function createRecordingHandler(
  synth: Synth,
  recordBtn: HTMLElement // Actually a NeonButton
) {
  let mediaRecorder: MediaRecorder | null = null;
  let recordedChunks: Blob[] = [];

  return async () => {
    // @ts-ignore
    const neonBtn = recordBtn as NeonButton;
    const btn = neonBtn.getButton();

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
      // Change to stop icon (■) and icon mode
      btn.innerHTML = "Stop ■";
      neonBtn.setAttribute("icon", "");
      neonBtn.setAttribute("aria-label", "Stop Recording");
      neonBtn.setAttribute("title", "Stop Recording");
      neonBtn.dataset.recording = "true";
    } else {
      mediaRecorder.stop();
      // Change back to rec text and remove icon mode
      btn.innerHTML = "Rec ●";
      neonBtn.removeAttribute("icon");
      neonBtn.setAttribute("aria-label", "Start Recording");
      neonBtn.setAttribute("title", "Start Recording");
      neonBtn.dataset.recording = "false";
    }
  };
}