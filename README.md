# AI Comedian

An Electron desktop application that generates AI-powered stand-up comedy routines using Groq and ElevenLabs.

## Demo

Watch the AI Comedian in action:

[![AI Comedian Demo](https://img.youtube.com/vi/OlQhjHTZicc/0.jpg)](https://www.youtube.com/watch?v=OlQhjHTZicc)

## Features

- Desktop application built with Electron
- Generate comedy routines based on user-provided topics
- Text-to-speech conversion using ElevenLabs
- Interactive UI with visual feedback
- Save generated routines as audio files
- Dynamic stage visualization

## Setup

1. Clone the repository:
```bash
git clone https://github.com/egodevrjm/ai_comedian.git
```

2. Install dependencies:
```bash
npm install
```

3. Configure API keys:
   - Get your Groq API key from [Groq](https://console.groq.com)
   - Get your ElevenLabs API key from [ElevenLabs](https://elevenlabs.io)
   - Add these to the application settings

4. Run the application:
```bash
npm start
```

## Build

To create a distribution:
```bash
npm run build
```

## Technologies Used

- Electron (Desktop Application Framework)
- Groq AI (LLM Model)
- ElevenLabs (Text-to-Speech)
- WaveSurfer.js (Audio Visualization)
- Font Awesome (Icons)

## Requirements

- macOS, Windows, or Linux
- Node.js 
- npm or yarn

## License

MIT
