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
  recognition.continuous = true;
  recognition.interimResults = true;
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

    currentTranscription = '';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      console.log("Interim transcription:", transcript);
      currentTranscription = transcript;
      
      if (window.term) {
        window.term.set_command(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      isRecording = false;
      reject(event.error);
    };

    try {
      recognition.start();
      isRecording = true;
      console.log("Recording started successfully");
      resolve();
    } catch (error) {
      isRecording = false;
      reject(error);
    }
  });
};

export const stopRecording = () => {
  return new Promise((resolve) => {
    if (recognition && isRecording) {
      recognition.stop();
      isRecording = false;
      // Small delay to ensure final results are processed
      setTimeout(() => {
        resolve(currentTranscription);
      }, 100);
    } else {
      resolve('');
    }
  });
};

export const getTranscription = () => currentTranscription; 