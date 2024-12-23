const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Store = require('electron-store');
const store = new Store();

const outputDir = path.join(__dirname, 'output');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const defaultVoiceId = 'wLoW00IP5kfH8oiOBAPp'; // Default voice

async function synthesizeSpeech(text) {
  return new Promise((resolve, reject) => {
    const ELEVENLABS_API_KEY = store.get('elevenLabsKey');
    if (!ELEVENLABS_API_KEY) {
      reject(new Error('Please set your ElevenLabs API key in settings'));
      return;
    }

    // Retrieve user's selected voice or fallback to default
    const voiceId = store.get('selectedVoice') || defaultVoiceId;

    const model = 'eleven_flash_v2';
    const uri = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input?model_id=${model}`;

    const outputFilePath = path.join(outputDir, `${uuidv4()}.mp3`);
    const writeStream = fs.createWriteStream(outputFilePath, { flags: 'a' });

    const websocket = new WebSocket(uri, {
      headers: { 'xi-api-key': ELEVENLABS_API_KEY },
    });

    websocket.on('open', () => {
      websocket.send(
        JSON.stringify({
          text: ' ',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            use_speaker_boost: false,
          },
        })
      );

      websocket.send(JSON.stringify({ text }));
      websocket.send(JSON.stringify({ text: '' })); // End of input
    });

    websocket.on('message', (event) => {
      const data = JSON.parse(event.toString());
      if (data.audio) {
        const audioBuffer = Buffer.from(data.audio, 'base64');
        writeStream.write(audioBuffer, (err) => {
          if (err) reject(err);
        });
      }
    });

    websocket.on('close', () => {
      writeStream.end(() => {
        resolve(outputFilePath);
      });
    });

    websocket.on('error', (error) => {
      reject(error);
    });
  });
}

module.exports = synthesizeSpeech;
