import os
import tempfile
import shutil
from typing import Optional
from datetime import datetime
from pathlib import Path
import uuid

from dotenv import load_dotenv
import fal_client
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

load_dotenv()  # reads FAL_KEY from .env if present

if "FAL_KEY" not in os.environ:
    raise RuntimeError(
        "Set FAL_KEY in your environment or .env file – it's required for fal-client."
    )

app = FastAPI(title="Talking Avatar")

# Create storage directories
STORAGE_DIR = Path("storage")
CHARACTERS_DIR = STORAGE_DIR / "characters"
AUDIO_DIR = STORAGE_DIR / "audio"
AVATARS_DIR = STORAGE_DIR / "avatars"

for dir in [CHARACTERS_DIR, AUDIO_DIR, AVATARS_DIR]:
    dir.mkdir(parents=True, exist_ok=True)

# Serve storage files
app.mount("/storage", StaticFiles(directory="storage"), name="storage")

# Check if React build exists
FRONTEND_BUILD_DIR = Path("frontend/dist")
if FRONTEND_BUILD_DIR.exists():
    # Serve React app
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")
    
    @app.get("/")
    def root():
        return FileResponse("frontend/dist/index.html")
else:
    # No frontend build found
    @app.get("/")
    def root():
        return {"error": "Frontend not built. Run 'cd frontend && npm run build'"}


# -------- Helper functions -------------------------------------------------
def save_file_locally(content: bytes, directory: Path, extension: str) -> str:
    """Save content to local storage and return the path."""
    filename = f"{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{extension}"
    filepath = directory / filename
    with open(filepath, "wb") as f:
        f.write(content)
    return f"/storage/{directory.name}/{filename}"


def download_and_save(url: str, directory: Path, extension: str) -> str:
    """Download file from URL and save locally."""
    import requests
    response = requests.get(url)
    response.raise_for_status()
    return save_file_locally(response.content, directory, extension)


# -------- Character Generation Endpoints -----------------------------------
@app.post("/api/characters/generate")
async def generate_character(
    prompt: str = Form(...),
    model: str = Form("imagen4")
):
    """Generate a character image using Imagen 4 or Flux."""
    try:
        # Use Imagen 4 by default
        slug = "fal-ai/imagen4/preview"
        res = fal_client.subscribe(slug, arguments={"prompt": prompt})
        image_url = res["images"][0]["url"]
        
        # Save locally
        local_path = download_and_save(image_url, CHARACTERS_DIR, "png")
        
        return {
            "url": local_path,
            "prompt": prompt,
            "id": Path(local_path).stem
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/characters/edit")
async def edit_character(
    image_url: str = Form(...),
    prompt: str = Form(...)
):
    """Edit an existing character image using Flux Kontext Pro."""
    try:
        # If it's a local path, upload it to fal first
        if image_url.startswith("/storage/"):
            local_path = image_url.replace("/storage/", "storage/")
            fal_url = fal_client.upload_file(local_path)
        else:
            fal_url = image_url
            
        res = fal_client.subscribe(
            "fal-ai/flux-pro/kontext",
            arguments={
                "image_url": fal_url,
                "prompt": prompt
            }
        )
        
        edited_url = res["images"][0]["url"]
        local_path = download_and_save(edited_url, CHARACTERS_DIR, "png")
        
        return {
            "url": local_path,
            "prompt": prompt,
            "id": Path(local_path).stem
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/characters/upload")
async def upload_character(
    file: UploadFile = File(...),
    name: str = Form("Uploaded Character")
):
    """Upload a custom character image."""
    try:
        content = await file.read()
        extension = file.filename.split(".")[-1] if "." in file.filename else "png"
        local_path = save_file_locally(content, CHARACTERS_DIR, extension)
        
        return {
            "url": local_path,
            "name": name,
            "id": Path(local_path).stem
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------- Audio Generation Endpoints ---------------------------------------
@app.post("/api/audio/generate")
async def generate_audio(
    text: str = Form(...),
    voice: str = Form("Rachel")
):
    """Generate audio using ElevenLabs TTS Turbo v2.5."""
    try:
        res = fal_client.subscribe(
            "fal-ai/elevenlabs/tts/turbo-v2.5",
            arguments={
                "text": text,
                "voice": voice
            }
        )
        
        audio_url = res["audio"]["url"]
        local_path = download_and_save(audio_url, AUDIO_DIR, "mp3")
        
        return {
            "url": local_path,
            "text": text,
            "voice": voice,
            "id": Path(local_path).stem
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/audio/preview")
async def preview_voice(voice: str = Form(...)):
    """Generate a preview of a voice."""
    try:
        preview_text = f"Hi! I'm {voice}. This is what my voice sounds like."
        
        res = fal_client.subscribe(
            "fal-ai/elevenlabs/tts/turbo-v2.5",
            arguments={
                "text": preview_text,
                "voice": voice
            }
        )
        
        return {"audio_url": res["audio"]["url"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------- Avatar Generation Endpoint ---------------------------------------
@app.post("/api/avatar/create")
async def create_avatar(
    character_url: str = Form(...),
    audio_url: str = Form(...),
    name: str = Form("My Avatar")
):
    """Create a talking avatar video."""
    try:
        # Upload local files to fal if needed
        if character_url.startswith("/storage/"):
            character_path = character_url.replace("/storage/", "storage/")
            character_fal_url = fal_client.upload_file(character_path)
        else:
            character_fal_url = character_url
            
        if audio_url.startswith("/storage/"):
            audio_path = audio_url.replace("/storage/", "storage/")
            audio_fal_url = fal_client.upload_file(audio_path)
        else:
            audio_fal_url = audio_url
        
        # Generate avatar video
        res = fal_client.subscribe(
            "fal-ai/bytedance/omnihuman",
            arguments={
                "image_url": character_fal_url,
                "audio_url": audio_fal_url
            }
        )
        
        video_url = res["video"]["url"]
        local_path = download_and_save(video_url, AVATARS_DIR, "mp4")
        
        return {
            "url": local_path,
            "name": name,
            "id": Path(local_path).stem,
            "character_url": character_url,
            "audio_url": audio_url
        }
    except Exception as e:
        print(f"Avatar creation error: {str(e)}")
        print(f"Character URL: {character_url}")
        print(f"Audio URL: {audio_url}")
        if 'character_fal_url' in locals():
            print(f"Character FAL URL: {character_fal_url}")
        if 'audio_fal_url' in locals():
            print(f"Audio FAL URL: {audio_fal_url}")
        raise HTTPException(status_code=500, detail=str(e))


# -------- List Files Endpoints --------------------------------------------
@app.get("/api/characters/list")
async def list_characters():
    """List all saved characters."""
    files = []
    for file in sorted(CHARACTERS_DIR.glob("*"), key=lambda x: x.stat().st_mtime, reverse=True):
        if file.is_file():
            files.append({
                "id": file.stem,
                "url": f"/storage/characters/{file.name}",
                "name": file.name,
                "created": datetime.fromtimestamp(file.stat().st_mtime).isoformat()
            })
    return files


@app.get("/api/audio/list")
async def list_audio():
    """List all saved audio files."""
    files = []
    for file in sorted(AUDIO_DIR.glob("*"), key=lambda x: x.stat().st_mtime, reverse=True):
        if file.is_file():
            files.append({
                "id": file.stem,
                "url": f"/storage/audio/{file.name}",
                "name": file.name,
                "created": datetime.fromtimestamp(file.stat().st_mtime).isoformat()
            })
    return files


@app.get("/api/avatars/list")
async def list_avatars():
    """List all saved avatars."""
    files = []
    for file in sorted(AVATARS_DIR.glob("*"), key=lambda x: x.stat().st_mtime, reverse=True):
        if file.is_file() and file.suffix == ".mp4":
            files.append({
                "id": file.stem,
                "url": f"/storage/avatars/{file.name}",
                "name": file.name,
                "created": datetime.fromtimestamp(file.stat().st_mtime).isoformat()
            })
    return files