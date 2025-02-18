# Lateral Thinking Puzzle Game with Voice Interaction

## Overview
This project is an interactive lateral thinking puzzle game that combines voice interaction, text-to-speech, and AI-powered responses. Players can solve puzzles through both text and voice input, with the system providing voice feedback using ElevenLabs' voice cloning technology.

## Features
- Interactive terminal-based puzzle interface
- Voice input support for puzzle solving
- Text-to-speech responses using ElevenLabs
- Voice cloning capability after multiple interactions
- Dynamic AI responses using OpenAI
- Real-time audio processing and transcription

## Technical Stack
- Frontend: jQuery Terminal
- Backend: Express.js
- APIs:
  - ElevenLabs for text-to-speech and voice cloning
  - OpenAI for transcription and AI responses
- Audio Processing: WAV format handling

## Key Components
1. **Puzzle Engine** (Reference: `script.js` lines 101-114)
   - Manages puzzle flow and user interactions
   - Handles correct answer detection
   - Provides contextual AI responses

2. **Voice Processing** (Reference: `shared/audio.js` lines 11-24)
   - Records user voice input
   - Saves audio in WAV format
   - Handles audio playback

3. **AI Integration** (Reference: `shared/openai.js` lines 17-25)
   - Transcribes voice input to text
   - Generates contextual responses
   - Manages conversation flow

4. **Voice Synthesis** (Reference: `shared/elevenlab.js` lines 21-36)
   - Converts AI responses to speech
   - Handles voice cloning after sufficient samples
   - Manages audio file generation

## Setup
1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```
OPENAI_API_KEY=your_key
ELEVEN_LABS_API_KEY=your_key
```

3. Start the server:
```bash
npm run 1
```

## Project Structure
- `/public_ver22`: Frontend assets and client-side code
- `/shared`: Server-side utilities and API integrations
- `/audio`: Dynamic audio file storage

## Voice Cloning Feature
The system collects user voice samples during puzzle interactions. After 4 samples (configurable), it creates a personalized voice clone for responses.

Reference: `index.js` lines 25-29 for voice cloning configuration.

## Note
This project requires active API keys and proper audio directory permissions to function correctly. The voice cloning feature needs multiple interactions to gather sufficient voice samples.
