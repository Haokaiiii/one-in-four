// script_html.js
// HTML Communication
// post request + direct link to html functions

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

window.addEventListener("keydown", (e) => {
  if (e.code === "Period" && !isKeyPressed) {
    isKeyPressed = true;
    fetch("/start-recording", { method: "POST" });
    isRecording();
    stopPhoneSound();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "Period" && isKeyPressed) {
    isKeyPressed = false;
    fetch("/stop-recording", { method: "POST" })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "transcription_complete") {
          fetchLatestTranscription();
        }
      })
      .catch((error) => console.error("Error stopping recording:", error));
    notRecording();
    playPhoneSound();
  }
});

// document.getElementById("inputButton").addEventListener("click", () => {
//   fetchLatestTranscription();
// });

const updateNodeStatus = () => {
  fetch("/status")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      nodeStatusIndicator.textContent = data.status || "idle";
    })
    .catch((error) => {
      console.error("Error fetching node status:", error);
      nodeStatusIndicator.textContent = "error";
    });
};

const fetchLatestTranscription = () => {
  return fetch("/latest-transcription", {
    method: "GET",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Fetched transcription:", data.transcription);
      return data.transcription;
    })
    .catch((error) => {
      console.error("Error fetching transcription:", error);
      return null;
    });
};

setInterval(updateNodeStatus, 500);
