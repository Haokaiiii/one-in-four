// script_html.js
// HTML Communication
// post request + direct link to html functions

import { initSpeechRecognition, startRecording, stopRecording } from './mic.js';

let isRecordingActive = false;
const recordingIndicator = document.getElementById("recordingIndicator");
const phoneAudio = document.getElementById("phoneAudio");

const isRecording = () => {
  recordingIndicator.textContent = "Recording... Press '.' to stop";
  recordingIndicator.style.color = 'red';
  recordingIndicator.style.fontWeight = 'bold';
};

const notRecording = () => {
  recordingIndicator.textContent = "Press '.' to record";
  recordingIndicator.style.color = 'black';
  recordingIndicator.style.fontWeight = 'normal';
};

const stopPhoneSound = () => {
  phoneAudio.pause();
  phoneAudio.currentTime = 0;
};

const playPhoneSound = () => {
  phoneAudio.play();
};

export const resetRecordingState = () => {
  isRecordingActive = false;
  notRecording();
};

// Simple toggle for recording
window.addEventListener("keypress", async (e) => {
  if (e.code === "Period") {
    e.preventDefault();
    
    if (!isRecordingActive) {
      // Start recording
      try {
        isRecordingActive = true;
        isRecording();
        await startRecording();
      } catch (error) {
        console.error("Failed to start recording:", error);
        resetRecordingState();
      }
    } else {
      // Stop recording and submit immediately
      try {
        isRecordingActive = false;
        const transcription = await stopRecording();
        notRecording();
        
        if (transcription && transcription.trim()) {
          console.log("Submitting transcription:", transcription);
          if (window.term) {
            window.term.set_command(transcription);
            window.term.exec(transcription);
          }
        }
      } catch (error) {
        console.error("Failed to stop recording:", error);
        resetRecordingState();
      }
    }
  }
});

// Initialize recording indicator
notRecording();
