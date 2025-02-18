// script_html.js
// HTML Communication
// post request + direct link to html functions

import { initSpeechRecognition, startRecording, stopRecording } from './mic.js';
import { updateTranscriptionText } from './script.js';

let isKeyPressed = false;
let isRecordingActive = false;
let recordingTimeout = null;

const recordingIndicator = document.getElementById("recordingIndicator");
const phoneAudio = document.getElementById("phoneAudio");

const isRecording = () => {
  recordingIndicator.textContent = "Recording... (Release '.' to stop)";
  recordingIndicator.style.color = 'red';
  recordingIndicator.style.fontWeight = 'bold';
};

const notRecording = () => {
  recordingIndicator.textContent = "Press and hold '.' to record";
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

// Call notRecording initially to set the default state
notRecording();

window.addEventListener("keydown", async (e) => {
  if (e.code === "Period") {
    e.preventDefault();
    
    if (!isRecordingActive && !isKeyPressed) {
      // Start recording when key is first pressed
      isKeyPressed = true;
      isRecordingActive = true;
      isRecording();
      stopPhoneSound();
      await startRecording();
    }
  }
});

window.addEventListener("keyup", async (e) => {
  if (e.code === "Period") {
    isKeyPressed = false;
    
    if (isRecordingActive) {
      // Stop recording when key is released
      const transcription = await stopRecording();
      isRecordingActive = false;
      
      if (transcription && transcription.trim()) {
        console.log("Final transcription:", transcription);
        if (window.term) {
          window.term.set_command(transcription);
        }
      }
      notRecording();
      playPhoneSound();
    }
  }
});
