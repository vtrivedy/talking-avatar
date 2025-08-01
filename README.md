# 🐨 Talking Avatar

Create AI-powered talking avatars with emotions! Generate or upload character images, add speech, and bring them to life with synchronized lip-sync animations.

[![Demo Video](talking-avatar-demo.mp4)](https://github.com/vtrivedy/talking-avatar/blob/main/talking-avatar-demo.mp4)

![Koala Logo](koala-logo.svg)

## ✨ Features

- **Character Generation**: Create characters using AI (Imagen 4) or upload your own images
- **Character Editing**: Edit existing characters with AI-powered transformations (Flux Kontext Pro)
- **Voice Synthesis**: Generate natural speech with multiple voice options (ElevenLabs TTS)
- **Avatar Animation**: Bring characters to life with synchronized lip-sync (OmniHuman)
- **Beautiful UI**: Modern, responsive interface with smooth animations

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- [uv](https://github.com/astral-sh/uv) (Python package manager)
- A [fal.ai](https://fal.ai) API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/talking-avatar.git
   cd talking-avatar
   ```

2. **Set up your environment**
   ```bash
   # Create a .env file with your fal.ai API key
   echo "FAL_KEY=your_fal_api_key_here" > .env
   ```

3. **Install Python dependencies with uv**
   ```bash
   # Install uv if you haven't already (choose one method):
   
   # macOS/Linux:
   curl -LsSf https://astral.sh/uv/install.sh | sh
   
   # Or with Homebrew (macOS):
   brew install uv
   
   # Or with pip:
   pip install uv

   # Create a virtual environment and install dependencies
   uv venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   uv pip install -e .
   ```

4. **Build the frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

### Running the App

```bash
# Start the FastAPI server
uvicorn app.main:app --reload
```

Open your browser at `http://localhost:8000` 🎉

### Development Mode

For frontend development with hot reload:

```bash
# Terminal 1: Backend
uvicorn app.main:app --reload

# Terminal 2: Frontend dev server
cd frontend
npm run dev
```

Then access the frontend at `http://localhost:5173`

## 📁 Project Structure

```
talking-avatar/
├── app/
│   └── main.py          # FastAPI backend
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   └── App.tsx      # Main app
│   └── public/          # Static assets
├── storage/             # Generated files (gitignored)
│   ├── characters/      # Character images
│   ├── audio/           # Audio files
│   └── avatars/         # Avatar videos
├── pyproject.toml       # Python dependencies
└── README.md
```

## 🎯 Usage Tips

- **Audio Length**: Keep your speech under 15 seconds for best results
- **Character Images**: Use clear, front-facing portraits for optimal avatar generation
- **Voice Selection**: Preview voices before generating to find the perfect match

## 🛠️ API Models Used

- **Character Generation**: [Imagen 4](https://fal.ai/models/fal-ai/imagen4/preview)
- **Character Editing**: [Flux Kontext Pro](https://fal.ai/models/fal-ai/flux-pro/kontext)
- **Voice Synthesis**: [ElevenLabs TTS Turbo v2.5](https://fal.ai/models/fal-ai/elevenlabs/tts/turbo-v2.5)
- **Avatar Animation**: [OmniHuman](https://fal.ai/models/fal-ai/bytedance/omnihuman)

## 🔑 Environment Variables

- `FAL_KEY` (required): Your fal.ai API key

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [fal.ai](https://fal.ai) for AI model integration
- UI components inspired by modern design systems
- Koala logo because koalas are awesome 🐨
