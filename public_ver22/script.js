// Add this near the top of the file, after imports
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

const puzzles = [
  {
    setup:
      "Two piece of rock, a carrot, and a scarf are lying on the yard. Nobody put them on the yard but there is a perfectly logical reason why they should be there. What is it?",
    solution:
      "A snowman was built in the yard, and the snow has since melted, leaving the eyes, nose, mouth, and scarf on the ground.",
    clue: `No one left two piece of rock, a carrot, and a scarf on the floor. 
      No animals were invloved. 
      The weather is hot right now. 
      The weather was cold before. 
      No one died. 
      A human was invloved, but they didn't put the objects on the yard. 
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
      "The man had hiccups and the gun scared hiccups out of him, to which the man said, 'Thank you.' to the bartender",
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
      The bartender welcomed the man to come in.
      The man was welcomed in the bar.
      The scenario does not involve the gang.
      The bartender does not have the intention to shoot the man.`,
    keyword: `hiccup`,
  },
  {
    setup:
      "A man pushes his car until he reaches a hotel. When he arrives, he realizes he's bankrupt. What happened?",
    solution:
      "He's playing Monopoly and his piece is the car. He lands on a space with a hotel and doesn't have the money to pay the fee.",
    clue: `The location of the car is related to the bankruptcy.
      The bankruptcy is related to the hotel.
      The man's real-life bank balance doesn't relate.
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

const promptCorrect = (setup, solution, clue, allGuess) =>
  `
  You are an AI assisting in a puzzle game.
  
  The current puzzle for the player to guess is: ${setup}.
  The answer is: ${solution}.
  Some additional clues are: ${clue}.
  All of player's past guess is: ${allGuess}.

  Please do the following things in a few sentence:
  1. Congratulate the player for guessing correctly.
  2. Mention some of the player's past guesses. 
  3. Explain how, based on those past guesses, they came up with the correct answer. 
`;

const endMessage =
  "\nYou have finished all the puzzle! \n(to restart, refresh the page.)";

let currentPuzzleIndex = 0;

let allUserGuesses = [];

let consecutiveNonYesCount = 0;  // Track consecutive "No" or "Not related" responses

let isRecordingActive = false;

// Import the recording functions at the top of the file
import { initSpeechRecognition, startRecording, stopRecording } from './mic.js';

const loadPuzzle = function () {
  if (currentPuzzleIndex >= puzzles.length) {
    this.echo("");
    this.echo("You've completed all the puzzles. Good job.");
    this.echo(endMessage);
    return; // End the session or handle it as needed
  }

  const puzzle = puzzles[currentPuzzleIndex];
  this.echo("");
  // this.echo(puzzle.setup);

  playPuzzle
    .bind(this)(puzzle)
    .then(() => {
      // After solving a puzzle, ask if the user wants to continue
      this.echo("");
      this.push(
        function (command) {
          if (command.match(/yes|y/i)) {
            currentPuzzleIndex++; // Move to the next puzzle
            this.pop(); // Remove this prompt from the stack
            loadPuzzle.call(this); // Call loadPuzzle in the context of the terminal
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
 * You can ask me any question related to the scenario, but I can only answer with "Yes," "No," or "Doesn't relate."
  (Hint: Try to ask yes-or-no questions for the best results!)
  (Hint: You can ask for a hint if you really can't figure out the answer.)
    `);
  }, 6000);

  setTimeout(function () {
    term.echo(`\nWith the rule stated... let's start :)`);
  }, 12000);

  setTimeout(function () {
    term.exec("start"); //start the "start" function without having the user type start
  }, 13000);
}

let transcriptionText = "";
let isFetchingTranscription = false;

export const updateTranscriptionText = (newTranscription) => {
  transcriptionText = newTranscription;
  if (window.term) {
    window.term.set_prompt('> ');
  }
};

document.fonts.ready.then(() => {
  const term = $("#commandDiv").terminal(
    {
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
      keydown: function(e) {
        if (e.key === '.') {
          e.preventDefault();
          const recordingIndicator = document.getElementById("recordingIndicator");
          
          if (!isRecordingActive) {
            isRecordingActive = true;
            startRecording();
            this.set_prompt('🎤 Recording... > ', 15);
            recordingIndicator.textContent = "Recording... Press '.' to stop";
            recordingIndicator.style.color = 'red';
            recordingIndicator.style.fontWeight = 'bold';
          } else {
            isRecordingActive = false;
            stopRecording().then(transcription => {
              if (transcription && transcription.trim()) {
                this.set_prompt('> ', 5);
                recordingIndicator.textContent = "Press '.' to record";
                recordingIndicator.style.color = 'black';
                recordingIndicator.style.fontWeight = 'normal';
                this.set_command(transcription);
                this.exec(transcription);
              }
            });
          }
          return false;
        }
      }
    }
  );

  // startingConversation(term); //commented with debuging

  window.term = term;

  term.exec("start"); //debug only!!!
});

// github('jcubic/jquery.terminal');

// ---------- AI ---------- //
// ---------- AI ---------- //
// ---------- AI ---------- //
// ---------- AI ---------- //
// ---------- AI ---------- //

async function playPuzzle(puzzle) {
  try {
    this.echo(puzzle.setup);
    this.echo("");
    this.echo(`Ask any question related to the scenario`);
    this.echo("");

    const terminal = this;
    let allUserGuesses = [];
    let correctAnswerCount = 0;  // Add counter for correct answers

    while (true) {
      const userInput = await new Promise((resolve) => {
        terminal.push(
          function (input) {
            if (input && input.trim()) {
              resolve(input);
            }
          },
          {
            prompt: '> '
          }
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

      if (aiResponse === "Yes") {
        correctAnswerCount++;
        
        if (correctAnswerCount === 1) {  // After first "Yes"
          const resultResponse = await requestAIResult(
            puzzle.setup,
            puzzle.solution,
            puzzle.clue,
            allUserGuesses
          );

          terminal.echo(`\nCongratulations! 🎉\n${resultResponse}\n`);
          
          try {
            await postTextToSpeech(resultResponse);
          } catch (error) {
            console.warn("Voice feedback unavailable");
          }
          
          // Ask if they want to play another puzzle
          terminal.echo("\nWould you like to play another puzzle? (yes/no)");
          const playAgain = await new Promise((resolve) => {
            terminal.push(
              function (input) {
                resolve(input.toLowerCase().trim());
              },
              {
                prompt: '> '
              }
            );
          });

          if (playAgain === 'yes') {
            terminal.pop();
            terminal.echo("\nStarting new puzzle...\n");
            loadPuzzle.call(terminal);
            return;
          } else {
            terminal.echo("\nThanks for playing!");
            terminal.pop();
            return;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in puzzle game:", error);
    this.echo("\nAn error occurred. Please try again.");
  }
}

const getAIResponse = async (input, setup, solution, clue) => {
  try {
    const prompt = `
      Context: This is a lateral thinking puzzle with the following setup:
      "${setup}"
      
      The player's input was: "${input}"
      
      The solution is: "${solution}"
      
      Additional clue: "${clue}"
      
      Provide a helpful response that:
      1. Doesn't reveal the solution directly
      2. Guides the player if they're on the wrong track
      3. Acknowledges if they're getting closer to the solution
      4. Is concise and clear
      
      Response:`;

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error in getAIResponse:", error);
    return "I'm having trouble processing that. Please try again.";
  }
};

const getAIHint = async (input, setup, solution, clue) => {
  try {
    // First try to get a hint from the clue array
    const clueArray = clue.split('\n').map(c => c.trim()).filter(c => c);
    if (clueArray.length > 0) {
      // Get a random clue from the array
      const randomClue = clueArray[Math.floor(Math.random() * clueArray.length)];
      return `Hint: ${randomClue}`;
    }

    // Fallback to AI hint if no clues available
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: `
          Context: This is a lateral thinking puzzle.
          Setup: ${setup}
          Player's guess: ${input}
          Solution: ${solution}
          Available clues: ${clue}
          
          Provide a helpful hint that guides the player without revealing the solution directly.
        `
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return `Hint: ${data.response}`;
  } catch (error) {
    console.error("Error getting hint:", error);
    // Return a generic hint from the clue if available
    const clueArray = clue.split('\n').map(c => c.trim()).filter(c => c);
    if (clueArray.length > 0) {
      return `Hint: ${clueArray[0]}`;
    }
    return "No";  // Fallback response if everything fails
  }
};

const requestAI = async (input, setup, solution, clue, keyword) => {
  try {
    console.log("--requestAI started --input:", input);
    
    // Normalize input and solution for comparison
    const normalizedInput = input.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const normalizedSolution = solution.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    
    // Calculate similarity
    const inputWords = new Set(normalizedInput.split(' '));
    const solutionWords = new Set(normalizedSolution.split(' '));
    
    let matchCount = 0;
    solutionWords.forEach(word => {
      if (inputWords.has(word)) matchCount++;
    });
    
    const similarityScore = matchCount / solutionWords.size;
    
    let response;
    if (similarityScore > 0.7) {
      response = "Yes";
      consecutiveNonYesCount = 0;  // Reset counter on correct answer
    } else if (!isRelevantQuestion(input, setup, solution)) {
      response = "Not related";
      consecutiveNonYesCount++;
    } else {
      response = "No";
      consecutiveNonYesCount++;
    }

    console.log("--AI response OK");
    console.log("==AI Output:", response);
    console.log("==Consecutive non-yes count:", consecutiveNonYesCount);

    // Check consecutive count AFTER incrementing
    if (consecutiveNonYesCount >= 3) {
      const hint = await getAIHint(input, setup, solution, clue);
      consecutiveNonYesCount = 0;  // Reset counter after giving hint
      return hint;
    }
    
    return response;
  } catch (error) {
    console.error("Error in requestAI:", error);
    return "Sorry, there was an error processing your response.";
  }
};

const isRelevantQuestion = (input, setup, solution) => {
  // Simple relevance check based on keywords from setup and solution
  const keywords = [...setup.toLowerCase().split(' '), 
                   ...solution.toLowerCase().split(' ')];
  const inputWords = input.toLowerCase().split(' ');
  return keywords.some(keyword => inputWords.includes(keyword));
};

async function requestAIResult(setup, solution, clue, allGuess) {
  console.log(`--requestAIResult started`);

  const prompt = promptCorrect(setup, solution, clue, allGuess);

  // Make the POST request
  const response = await fetch("/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input: prompt }),
  });

  if (response.ok) {
    console.log("--AI response OK");
    const jsonData = await response.json();
    const aiModResponse = jsonData.ai;
    console.log(`==AI Output: ${aiModResponse}`);

    return aiModResponse;
  } else {
    console.error("Error in submitting data.");
    return "Error in submitting data.";
  }
}

const postTextToSpeech = async (text) => {
  try {
    const voiceIdResponse = await fetch("/voice-id", {
      method: "GET",
    });

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
      const audioFileName = data.audioFilePath.split(/[/\\]/).pop();
      const audioPath = `/audio/${audioFileName}`;
      console.log("Audio file created at:", data.audioFilePath);
      console.log("Attempting to play from URL:", audioPath);
      
      const audio = new Audio();
      
      // Add event listener for debugging
      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e.target.error);
      });
      
      audio.src = audioPath;
      
      await new Promise((resolve, reject) => {
        audio.oncanplaythrough = resolve;
        audio.onerror = () => reject(new Error(`Failed to load audio from ${audioPath}`));
        audio.load();
      });

      await audio.play();
    }
  } catch (error) {
    console.error("Text-to-speech error:", error);
    console.warn("Text-to-speech service unavailable, continuing without voice");
  }
};
