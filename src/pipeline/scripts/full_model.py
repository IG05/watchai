import os
from pathlib import Path
import subprocess
import numpy as np
import librosa
import torch
import cv2
import whisper
import firebase_admin
from firebase_admin import credentials, firestore
from sentence_transformers import SentenceTransformer
from transformers import CLIPProcessor, CLIPModel
from tqdm import tqdm
import requests

# === CONFIG ===
FIREBASE_CRED = Path("C:/Users/ishaa/watchai/pipeline/firebase/firebase-credentials.json")
FFMPEG_PATH = r"C:/ffmpeg/bin/ffmpeg.exe"  # <- CHANGE to your actual ffmpeg.exe path
WORK_DIR = Path("C:/Users/ishaa/watchai/pipeline/data/processed_videos")
WORK_DIR.mkdir(parents=True, exist_ok=True)
# === INIT MODELS AND FIREBASE ===
cred = credentials.Certificate(FIREBASE_CRED)
firebase_admin.initialize_app(cred)
db = firestore.client()

whisper_model = whisper.load_model("base")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
sentence_model = SentenceTransformer('all-MiniLM-L6-v2')

# === CONSTANTS ===
FRAME_SAMPLING_RATE = 1  # 1 frame per second
AUDIO_SR = 16000  # audio sample rate

# === FUNCTIONS ===

def download_video(url: str, dest_path: Path):
    print(f"Downloading video: {url}")
    r = requests.get(url, stream=True)
    with open(dest_path, "wb") as f:
        for chunk in r.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
    print(f"Downloaded to {dest_path}")

def extract_audio(video_path: Path, audio_path: Path):
    print(f"Extracting audio to {audio_path}...")
    cmd = [
        FFMPEG_PATH,
        "-i", str(video_path),
        "-ac", "1",
        "-ar", str(AUDIO_SR),
        "-y",  # overwrite
        str(audio_path)
    ]
    subprocess.run(cmd, check=True)

def transcribe_audio(audio_path: Path):
    print(f"Transcribing audio {audio_path} with Whisper...")
    result = whisper_model.transcribe(str(audio_path))
    transcript = result.get("text", "")
    print(f"Transcript length: {len(transcript)} characters")
    return transcript

def sample_frames(video_path: Path, fps=FRAME_SAMPLING_RATE):
    print(f"Sampling frames from {video_path} at {fps} FPS...")
    vidcap = cv2.VideoCapture(str(video_path))
    frames = []
    if not vidcap.isOpened():
        print(f"Error opening video file: {video_path}")
        return frames

    video_fps = vidcap.get(cv2.CAP_PROP_FPS)
    frame_interval = int(video_fps // fps) if video_fps >= fps else 1
    count = 0
    success, frame = vidcap.read()

    while success:
        if count % frame_interval == 0:
            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(frame_rgb)
        success, frame = vidcap.read()
        count += 1

    vidcap.release()
    print(f"Sampled {len(frames)} frames")
    return frames

def extract_visual_features(frames):
    print(f"Extracting visual features for {len(frames)} frames...")
    batch_size = 16
    embeddings = []

    for i in range(0, len(frames), batch_size):
        batch_frames = frames[i:i+batch_size]
        inputs = clip_processor(images=batch_frames, return_tensors="pt", padding=True)
        with torch.no_grad():
            outputs = clip_model.get_image_features(**inputs)
        embeddings.append(outputs.cpu().numpy())

    embeddings = np.vstack(embeddings)
    mean_embedding = np.mean(embeddings, axis=0)
    return mean_embedding.tolist()

def extract_audio_features(audio_path: Path):
    print(f"Extracting audio features from {audio_path}...")
    y, sr = librosa.load(str(audio_path), sr=AUDIO_SR)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
    mfcc_mean = np.mean(mfcc, axis=1)
    return mfcc_mean.tolist()

def generate_text_embedding(text: str):
    embedding = sentence_model.encode(text)
    return embedding.tolist()

def process_video(video_doc):
    video_id = video_doc.id
    data = video_doc.to_dict()
    video_url = data.get("videoUrl")
    title = data.get("title", "")
    description = data.get("description", "")

    if not video_url:
        print(f"Skipping {video_id}: No video URL")
        return

    print(f"\n▶ Processing video: {video_id}")
    video_path = WORK_DIR / f"{video_id}.mp4"
    audio_path = WORK_DIR / f"{video_id}.wav"

    try:
        download_video(video_url, video_path)
        extract_audio(video_path, audio_path)
        transcript = transcribe_audio(audio_path)
        print(f"Checking video file exists: {video_path.exists()} | {video_path}")
        frames = sample_frames(video_path)
        visual_features = extract_visual_features(frames) if frames else []
        audio_features = extract_audio_features(audio_path)
        combined_text = f"{title} {description} {transcript}"
        text_embedding = generate_text_embedding(combined_text)
        combined_embedding = visual_features + audio_features + text_embedding

        update = {
            "transcript": transcript,
            "visualFeatures": visual_features,
            "audioFeatures": audio_features,
            "textEmbedding": text_embedding,
            "combinedEmbedding": combined_embedding
        }

        db.collection("videos").document(video_id).update(update)
        print(f"✅ Done: {video_id}")
    except Exception as e:
        print(f"❌ Error processing {video_id}: {e}")

def main():
    videos = list(db.collection("videos").stream())
    print(f"Found {len(videos)} videos to process.")
    for doc in tqdm(videos):
        process_video(doc)

if __name__ == "__main__":
    main()
