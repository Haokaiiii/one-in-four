let recognition = null;
let isRecording = false;
let currentTranscription = '';

export const initSpeechRecognition = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.error('Speech recognition not supported');
    return false;
  }
  
  const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  
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

    if (isRecording) {
      console.log("Recognition already active, stopping first");
      recognition.stop();
    }

    currentTranscription = '';
    
    recognition.onstart = () => {
      isRecording = true;
      console.log("Recording started successfully");
      resolve();
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      isRecording = false;
      reject(event.error);
    };

    try {
      recognition.start();
    } catch (error) {
      console.error("Error starting recognition:", error);
      isRecording = false;
      reject(error);
    }
  });
};

export const stopRecording = () => {
  return new Promise((resolve) => {
    if (recognition && isRecording) {
      recognition.onend = () => {
        isRecording = false;
        console.log("Recording stopped with transcription:", currentTranscription);
        resolve(currentTranscription);
      };
      
      recognition.stop();
    } else {
      resolve('');
    }
  });
};

export const getTranscription = () => currentTranscription; 