//server.js -> html routers + post requests
//list of funtions:
//startServer,

import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { getGptResultAsString } from "./openai.js";
import {
  getVoiceId,
  getCurrentStatus,
  setCurrentStatus,
} from "./gloVariable.js";
import * as index from "../index.js";

Object.assign(globalThis, index);

import { convertTextToSpeech } from "./elevenlab.js";
import { playAudio } from "./audio.js";
import path from "path";
import { startRecordingProcess, stopRecordingProcess, getTranscription } from "./mic.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const audioFolderPath = join(__dirname, '../public_ver22/audio');

const app = express();
const port = process.env.PORT || 3001;

let transcriptionArchives = [];

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "../public_ver22")));
app.use('/assets', express.static(join(__dirname, '../public_ver22/assets')));
app.use('/audio', express.static(join(__dirname, '../public_ver22/audio')));

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../public_ver22/index.html"));
});

export const startServer = () => {
  app.use(cors());
  app.use(express.json());
  app.use(express.static(join(__dirname, "../public_ver22")));
  app.use('/assets', express.static(join(__dirname, '../public_ver22/assets')));
  app.use('/audio', express.static(join(__dirname, '../public_ver22/audio')));

  app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "../public_ver22/index.html"));
  });

  app.post("/submit", async (req, res) => {
    let input = req.body.input;

    try {
      const aiResponse = await getGptResultAsString(input);
      res.json({ ai: aiResponse });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        error: "Failed to generate output. Please try again.",
      });
    }
  });

  app.get("/voice-id", (req, res) => {
    const voiceId = getVoiceId();
    if (voiceId) {
      res.json({ voiceId });
    } else {
      res.status(404).json({ error: "No voice ID available." });
    }
  });

  app.post("/text-to-speech", async (req, res) => {
    const { text, voiceId = getVoiceId() } = req.body;

    try {
      const audioFileName = await convertTextToSpeech(text, voiceId);
      const audioFilePath = path.join(audioFolderPath, audioFileName);

      await playAudio(audioFolderPath, audioFileName);

      res.json({ audioFilePath });
    } catch (error) {
      console.error("Error in /text-to-speech endpoint:", error);
      res.status(500).json({ error: "Text-to-speech conversion failed." });
    }
  });

  app.get("/status", (req, res) => {
    try {
      const status = getCurrentStatus();
      res.status(200).json({ status: status || "idle" });
    } catch (error) {
      console.error('Error getting status:', error);
      res.status(500).json({ error: 'Failed to get status' });
    }
  });

  app.get("/latest-transcription", (req, res) => {
    try {
      const transcription = getTranscription();
      res.status(200).json({ transcription: transcription || "" });
    } catch (error) {
      console.error('Error getting transcription:', error);
      res.status(500).json({ error: 'Failed to get transcription' });
    }
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};
