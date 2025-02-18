// script_html.js
// HTML Communication
// post request + direct link to html functions

import { initSpeechRecognition, startRecording, stopRecording } from './mic.js';
import { fetchLatestTranscription, updateTranscriptionText } from './script.js';

const recordingIndicator = document.getElementById("recordingIndicator");
const inputButton = document.getElementById("inputButton");
const nodeStatusIndicator = document.getElementById("nodeStatusIndicator");
const phone = document.getElementById("phoneAudio");

function playPhoneSound() {
  if (phone) {
    phone.loop = true;
    phone.play().catch(error => {
      console.error("Error playing sound:", error);
    });
    console.log("playing sound");
  } else {
    console.error("Phone audio element not found");
  }
}

function stopPhoneSound() {
  if (phone) {
    phone.pause();
    phone.currentTime = 0;
    console.log("stop playing sound");
  } else {
    console.error("Phone audio element not found");
  }
}

let isKeyPressed = false;

const isRecording = () => {
  recordingIndicator.textContent = "Recording...";
  recordingIndicator.style.color = "red";
};

const notRecording = () => {
  recordingIndicator.textContent = "Not Recording";
  recordingIndicator.style.color = "white";
};

const updateNodeStatus = async () => {
  try {
    const response = await fetch("/status");
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    const data = await response.json();
    nodeStatusIndicator.textContent = data.status || "idle";
  } catch (error) {
    console.error("Error fetching node status:", error);
    nodeStatusIndicator.textContent = "error";
  }
};


document.addEventListener('DOMContentLoaded', () => {
  if (!initSpeechRecognition()) {
    alert('Speech recognition is not supported in your browser. Please use Chrome.');
  }
});

window.addEventListener("keydown", async (e) => {
  if (e.code === "Period" && !isKeyPressed) {
    try {
      e.preventDefault();
      isKeyPressed = true;
      isRecording();
      stopPhoneSound();
      await startRecording();
    } catch (error) {
      console.error("Error starting recording:", error);
      notRecording();
    }
  }
});

window.addEventListener("keyup", async (e) => {
  if (e.code === "Period" && isKeyPressed) {
    try {
      e.preventDefault();
      isKeyPressed = false;
      const transcription = await stopRecording();
      if (transcription) {
        console.log("Received transcription:", transcription);
        updateTranscriptionText(transcription);
        if (window.term) {
          window.term.set_prompt(`> ${transcription}`);
        }
      }
      notRecording();
      playPhoneSound();
    } catch (error) {
      console.error("Error stopping recording:", error);
      notRecording();
    }
  }
});

// document.getElementById("inputButton").addEventListener("click", () => {
//   fetchLatestTranscription();
// });

setInterval(updateNodeStatus, 500);
