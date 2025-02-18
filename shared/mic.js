//mic.js -> for functions that use mic (recordings)
//list of funtions:
//startRecordingProcess, stopRecordingProcess

let recognition = null;
let isRecording = false;
let currentTranscription = '';

export const startRecordingProcess = () => {
  console.log("Starting recording process...");
  try {
    if (!recognition) {
      recognition = new webkitSpeechRecognition() || new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Transcription result:", transcript);
        currentTranscription = transcript;
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        isRecording = false;
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        isRecording = false;
      };
    }

    recognition.start();
    isRecording = true;
    console.log("Recording started successfully");
  } catch (error) {
    console.error("Error starting recording:", error);
    isRecording = false;
    throw error;
  }
};

export const stopRecordingProcess = () => {
  console.log("Stopping recording...");
  try {
    if (recognition && isRecording) {
      recognition.stop();
      isRecording = false;
    }
    console.log("Recording stopped successfully");
    return currentTranscription;
  } catch (error) {
    console.error("Error stopping recording:", error);
    throw error;
  }
};

export const getTranscription = () => currentTranscription;
