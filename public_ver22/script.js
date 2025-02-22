// ------------------- Global Variables & Imports ------------------- //

// single Audio reference (prevents double-play TTS)
let currentAudio = null;

// track last command to avoid re-running the exact same text
let lastCommand = "";

// some example puzzles
const puzzles = [
  {
    setup:
      "Two piece of rock, a carrot, and a scarf are lying on the yard. Nobody put them on the yard but there is a perfectly logical reason why they should be there. What is it?",
    solution:
      "A snowman was built in the yard, and the snow has since melted, leaving the eyes, nose, mouth, and scarf on the ground.",
    clue: `No one left two piece of rock, a carrot, and a scarf on the floor. 
      No animals were involved. 
      The weather is hot right now. 
      The weather was cold before. 
      No one died. 
      A human was involved, but they didn't put the objects on the yard. 
      The rocks are relatively small.
      The items have been there for a long time.
      All objects are related to a human.
      All objects are used for a purpose.
      The scarf was worn by something.`,
    keyword: `snowman`,
  },
  {
    setup:
      "A man walks into a bar and asks the bartender for a glass of water. The bartender pulls out a gun and points it at the man. The man says, 'Thank you' and walks out.",
    solution:
      "The man had hiccups and the gun scared them out of him. He thanked the bartender because it cured his hiccups.",
    clue: `The bartender was not threatening the man. 
      The bartender did not shoot the man. 
      The man was not thirsty. 
      No one died. 
      The bartender helped the man. 
      The water is related to the man's condition. 
      The man doesn't have the gun. 
      The man didn't ask any other questions. 
      The gun is real.
      The man was scared and surprised.
      The bartender said nothing.
      The scenario does not involve a gang.
      The bartender does not have the intention to shoot the man.`,
    keyword: `hiccup`,
  },
  {
    setup:
      "A man pushes his car until he reaches a hotel. When he arrives, he realizes he's bankrupt. What happened?",
    solution:
      "He is playing Monopoly, his piece is the car, and he landed on a property with a hotel he couldn't afford.",
    clue: `The location of the car is related to the bankruptcy.
      The bankruptcy is related to the hotel.
      The man's real-life bank balance doesn't matter.
      The car is not an actual car.
      The man does not live in the hotel.
      There is no one in the hotel.
      Someone the man knows owns the hotel.
      The man didn't pay for the hotel.
      The man is playing a game with his friend.
      The friend is related to how the man went bankrupt.
      The man was not bankrupt before his car reached the hotel.
      The whole situation is in a game.`,
    keyword: `monopoly`,
  },
];

const endMessage =
  "\nYou have finished all the puzzle! \n(to restart, refresh the page.)";

let currentPuzzleIndex = 0;
let consecutiveNonYesCount = 0;
let isRecordingActive = false;

// If you use speech recognition from a separate file:
import { initSpeechRecognition, startRecording, stopRecording } from './mic.js';

// ------------------- Utility Functions ------------------- //

// Example: fetch the latest transcription from the server (if you do that)
export const fetchLatestTranscription = async () => {
  try {
    const response = await fetch("/latest-transcription");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Fetched transcription:", data.transcription);
    return data.transcription;
  } catch (error) {
    console.error("Error fetching transcription:", error);
    return null;
  }
};

// The prompt for the short AI "yes/no" response
const evaluationPrompt = (setup, solution, userInput, clue, keyword) =>
  `
  You are an AI assisting in a puzzle game.
  You speak in a calm, thoughtful manner, often using metaphors.
  
  The current puzzle for the player to guess is: ${setup}.
  The answer is: ${solution}.
  Some additional clues are: ${clue}.
  
  You should respond to the player's guesses with only "yes," "no," or "doesn't relate."
  If the player asks something unrelated to the puzzle, say "doesn't relate."
  If the player ask for hint, say something from: ${clue}
  If the keyword: "${keyword}" is guessed, explain the answer: "${solution}", and say: "That's correct."
  If the player answers correctly, say: "That's Correct!"
  
  Allow misspellings.
  Be lenient in judging the player's answers.
  
  Respond with ONLY "yes," "no," or "doesn't relate."
  The player's current guess is: "${userInput}".
`;

// Prompt for correct answer explanation
const promptCorrect = (setup, solution, clue, allGuess) =>
  `
  You are an AI assisting in a puzzle game.
  
  The current puzzle for the player to guess is: ${setup}.
  The answer is: ${solution}.
  Some additional clues are: ${clue}.
  All of player's past guess is: ${allGuess}.

  Please do the following things in a few sentences:
  1. Congratulate the player for guessing correctly.
  2. Mention some of the player's past guesses.
  3. Explain how, based on those past guesses, they came up with the correct answer.
`;

// ------------------- jQuery Terminal Setup ------------------- //
document.fonts.ready.then(() => {
  const term = $("#commandDiv").terminal(
    {
      // You can type `start` to begin
      start: async function () {
        this.echo("To speak, press '.' to start recording");
        this.echo("Press '.' again to stop and send");
        this.echo("\n");
        loadPuzzle.call(this);
      },
    },
    {
      greetings: `Welcome!,\nThis is a terminal where you can play a lateral thinking puzzle with an AI.\n`,
      prompt: '> ',
      promptLength: 5,

      keydown: function (e) {
        if (e.key === '.') {
          e.preventDefault();
          const recordingIndicator = document.getElementById("recordingIndicator");

          if (!isRecordingActive) {
            // --- Start recording ---
            isRecordingActive = true;
            startRecording();
            this.set_prompt('🎤 Recording... > ', 15);
            if (recordingIndicator) {
              recordingIndicator.textContent = "Recording... Press '.' to stop";
              recordingIndicator.style.color = 'red';
              recordingIndicator.style.fontWeight = 'bold';
            }
          } else {
            // --- Stop recording ---
            isRecordingActive = false;
            stopRecording().then(transcription => {
              // restore prompt
              this.set_prompt('> ', 5);
              if (recordingIndicator) {
                recordingIndicator.textContent = "Press '.' to record";
                recordingIndicator.style.color = 'black';
                recordingIndicator.style.fontWeight = 'normal';
              }

              const trimmed = transcription && transcription.trim();
              if (trimmed) {
                // Avoid re-running if it's identical to last command
                if (trimmed !== lastCommand) {
                  // Directly execute the command without manual echo
                  this.exec(trimmed).then(() => {
                    this.set_command('');
                    lastCommand = trimmed;
                  });
                }
              }
            });
          }
        } else {
          e.preventDefault(); // block typed characters
          return false;
        }
      }
    }
  );

  // If you want an intro conversation before puzzle, do it. For now:
  term.exec("start");

  window.term = term;
});

// ------------------- Starting Conversation (Optional) ------------------- //

function startingConversation(term) {
  setTimeout(function () {
    term.echo(`\nHere, I will be playing lateral thinking puzzles with you.`);
  }, 1500);

  setTimeout(function () {
    term.echo(
      `\nIn a lateral thinking puzzle game, players devise solutions to riddles or scenarios by creatively piecing together facts to find a unique answer.`
    );
  }, 3000);

  setTimeout(function () {
    term.echo(`\nGame Rule:
 * I will present a scenario.
 * Your goal is to solve the puzzle by using the clues in the scenario and asking me questions.
 * I can only answer with "Yes," "No," or "Doesn't relate."
  (Hint: Try to ask yes-or-no questions for the best results!)
  (Hint: You can ask for a hint if you really can't figure out the answer.)
    `);
  }, 6000);

  setTimeout(function () {
    term.echo(`\nWith the rule stated... let's start :)`);
  }, 12000);

  setTimeout(function () {
    term.exec("start");
  }, 13000);
}

// ------------------- Puzzle Logic ------------------- //
const loadPuzzle = function () {
  if (currentPuzzleIndex >= puzzles.length) {
    this.echo("");
    this.echo("You've completed all the puzzles. Good job.");
    this.echo(endMessage);
    return;
  }

  const puzzle = puzzles[currentPuzzleIndex];
  this.echo("");
  playPuzzle
    .bind(this)(puzzle)
    .then(() => {
      // after puzzle is solved, ask user if they want next
      this.echo("");
      this.push(
        function (command) {
          if (command.match(/yes|y/i)) {
            currentPuzzleIndex++;
            this.pop();
            loadPuzzle.call(this);
          } else if (command.match(/no|n/i)) {
            this.echo(endMessage);
            this.pop();
          } else {
            this.echo("Please enter yes or no.(y/n)");
          }
        },
        {
          prompt: "Do you want to continue with the next question? (y/n) > ",
        }
      );
    });
};

async function playPuzzle(puzzle) {
  try {
    this.echo(puzzle.setup);
    this.echo("");
    this.echo(`Ask any question related to the scenario`);
    this.echo("");

    const terminal = this;
    let allUserGuesses = [];
    let correctAnswerGiven = false;

    while (true) {
      const userInput = await new Promise((resolve) => {
        terminal.push(
          (input) => {
            if (input && input.trim()) {
              lastCommand = input.trim();
              resolve(input);
            }
          },
          { prompt: '> ' }
        );
      });

      allUserGuesses.push(userInput);

      const aiResponse = await requestAI(
        userInput,
        puzzle.setup,
        puzzle.solution,
        puzzle.clue,
        puzzle.keyword
      );

      terminal.echo(`\nAI Response\n    ${aiResponse}\n`);

      if (
        aiResponse.toLowerCase().includes("yes") ||
        aiResponse.includes("That's correct")
      ) {
        correctAnswerGiven = true;
      }

      if (correctAnswerGiven) {
        const resultResponse = await requestAIResult(
          puzzle.setup,
          puzzle.solution,
          puzzle.clue,
          allUserGuesses
        );
        terminal.echo(`\n${resultResponse}\n`);
        await postTextToSpeech(resultResponse);  // Only call TTS once
        break;
      } else {
        await postTextToSpeech(aiResponse);  // TTS for regular responses
      }
    }
  } catch (error) {
    console.error("Error in puzzle game:", error);
    this.echo("\nAn error occurred. Please try again.");
  }
}

// ------------------- AI Helpers (requestAI, requestAIResult) ------------------- //

const requestAI = async (input, setup, solution, clue, keyword) => {
  try {
    // Example: naive approach
    console.log("--requestAI started --input:", input);

    // naive similarity check
    const normalizedInput = input.toLowerCase().replace(/[^\w\s]/g, "");
    const normalizedSolution = solution.toLowerCase().replace(/[^\w\s]/g, "");

    const inputWords = new Set(normalizedInput.split(" "));
    const solutionWords = new Set(normalizedSolution.split(" "));

    let matchCount = 0;
    solutionWords.forEach((w) => {
      if (inputWords.has(w)) matchCount++;
    });

    const similarityScore = matchCount / solutionWords.size;

    let response;
    if (similarityScore > 0.7 || normalizedInput.includes(keyword.toLowerCase())) {
      response = "Yes";
      consecutiveNonYesCount = 0;
    } else if (!isRelevantQuestion(input, setup, solution)) {
      response = "doesn't relate";
      consecutiveNonYesCount++;
    } else {
      response = "No";
      consecutiveNonYesCount++;
    }

    // give a hint after 3 consecutive no/doesn't relate
    if (consecutiveNonYesCount >= 3) {
      const hint = await getAIHint(input, setup, solution, clue);
      consecutiveNonYesCount = 0;
      return hint;
    }

    return response;
  } catch (error) {
    console.error("Error in requestAI:", error);
    return "Sorry, there was an error processing your response.";
  }
};

const isRelevantQuestion = (input, setup, solution) => {
  const combined = (setup + " " + solution).toLowerCase().split(" ");
  const inputWords = input.toLowerCase().split(" ");
  return inputWords.some((word) => combined.includes(word));
};

const getAIHint = async (input, setup, solution, clue) => {
  try {
    const clueArray = clue.split("\n").map((c) => c.trim()).filter((c) => c);
    if (clueArray.length > 0) {
      const randomClue = clueArray[Math.floor(Math.random() * clueArray.length)];
      return `Hint: ${randomClue}`;
    }
    return "Hint: Try another angle or a specific question about the scenario.";
  } catch (error) {
    console.error("Error in getAIHint:", error);
    return "No hints available.";
  }
};

async function requestAIResult(setup, solution, clue, allGuess) {
  console.log(`--requestAIResult started`);
  const prompt = promptCorrect(setup, solution, clue, allGuess);

  try {
    const response = await fetch("/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: prompt }),
    });

    if (!response.ok) {
      console.error("Error in submitting data.");
      return "Error in submitting data.";
    }

    const jsonData = await response.json();
    const aiModResponse = jsonData.ai;
    console.log(`==AI Output: ${aiModResponse}`);
    return aiModResponse;
  } catch (error) {
    console.error("Error in requestAIResult:", error);
    return "Unable to get final result.";
  }
}

// ------------------- TTS (Prevents Double-Play) ------------------- //

const postTextToSpeech = async (text) => {
  try {
    // If there's already audio playing, stop and cleanup
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      currentAudio.remove();
      currentAudio = null;
    }

    const voiceIdResponse = await fetch("/voice-id", { method: "GET" });
    if (!voiceIdResponse.ok) {
      throw new Error("Voice ID service unavailable");
    }
    const { voiceId } = await voiceIdResponse.json();

    const response = await fetch("/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, voiceId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (data.audioFilePath) {
      // Create new audio element
      currentAudio = new Audio();
      const audioFileName = data.audioFilePath.split(/[/\\]/).pop();
      const audioPath = `/audio/${audioFileName}`;
      
      // Wait for audio to be fully loaded before playing
      await new Promise((resolve, reject) => {
        currentAudio.oncanplaythrough = resolve;
        currentAudio.onerror = () => reject(new Error(`Failed to load audio from ${audioPath}`));
        currentAudio.src = audioPath;
      });

      // Play the audio
      await currentAudio.play();
      
      // Wait for playback to complete
      await new Promise(resolve => {
        currentAudio.onended = resolve;
      });
    }
  } catch (error) {
    console.error("Text-to-speech error:", error);
    console.warn("Text-to-speech service unavailable, continuing without voice");
  }
};