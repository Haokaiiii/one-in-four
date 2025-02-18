let recognition = null;
let isRecording = false;
let currentTranscription = '';

export const initSpeechRecognition = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error('Speech recognition not supported in this browser');
    return false;
  }
  
  const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  
  return true;
};

export const startRecording = () => {
  return new Promise((resolve, reject) => {
    if (!recognition) {
      if (!initSpeechRecognition()) {
        reject(new Error('Speech recognition not available'));
        return;
      }
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log("Transcription result:", transcript);
      currentTranscription = transcript;
      resolve(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      reject(event.error);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      isRecording = false;
    };

    try {
      recognition.start();
      isRecording = true;
      console.log("Recording started successfully");
    } catch (error) {
      reject(error);
    }
  });
};

export const stopRecording = () => {
  return new Promise((resolve) => {
    if (recognition && isRecording) {
      recognition.stop();
      isRecording = false;
      resolve(currentTranscription);
    } else {
      resolve('');
    }
  });
};

export const getTranscription = () => currentTranscription; 