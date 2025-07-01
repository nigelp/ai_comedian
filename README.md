# AI Comedian

An Electron desktop application that generates AI-powered stand-up comedy routines using Groq and Replicate APIs.

## Demo

Watch the AI Comedian in action:

[![AI Comedian Demo](https://img.youtube.com/vi/OlQhjHTZicc/0.jpg)](https://www.youtube.com/watch?v=OlQhjHTZicc)

## Features

- **Desktop application** built with Electron
- **Multiple AI Models**: Choose from three powerful Groq models:
  - Qwen 3 32B (fast and efficient)
  - Llama 3.3 70B Versatile (balanced performance)
  - Llama 3 70B 8192 (extended context)
- **Smart Model Configuration**: Automatic reasoning parameter optimization for each model
- **High-Quality Voice Synthesis**: Multiple voice options using Kokoro TTS via Replicate
- **Interactive UI** with visual feedback and animated stage
- **Audio Controls**: Play, pause, and save generated routines
- **Dynamic Stage Visualization** with breathing animations
- **Customizable Settings**: Easy API key management and voice selection

## Setup

1. Clone the repository:
```bash
git clone https://github.com/nigelp/ai_comedian.git
```

2. Install dependencies:
```bash
npm install
```

3. Configure API keys:
   - Get your Groq API key from [Groq](https://console.groq.com)
   - Get your Replicate API key from [Replicate](https://replicate.com)
   - Open the application and click the menu button (top-left) to access settings
   - Enter both API keys and select your preferred voice and AI model

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

- **Electron** (Desktop Application Framework)
- **Groq AI** (Multiple LLM Models):
  - Qwen 3 32B
  - Llama 3.3 70B Versatile
  - Llama 3 70B 8192
- **Replicate** (API Platform)
- **Kokoro TTS** (High-Quality Text-to-Speech via Replicate)
- **WaveSurfer.js** (Audio Visualization)
- **Font Awesome** (Icons)

## Model Selection

The application supports three different AI models, each optimized for different use cases:

- **Qwen 3 32B**: Fast response times, great for quick comedy generation
- **Llama 3.3 70B Versatile**: Balanced performance with high-quality output
- **Llama 3 70B 8192**: Extended context window for more complex routines

The app automatically handles the technical differences between models, ensuring optimal performance for each selection.

## Requirements

- macOS, Windows, or Linux
- Node.js 
- npm or yarn

## License

MIT
