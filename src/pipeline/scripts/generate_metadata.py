import site
import sys
import os
import uuid
import datetime
import nltk
import cv2
from transformers import pipeline
import firebase_admin
from firebase_admin import credentials, firestore

from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2 import service_account

# NLTK setup
nltk.download("punkt")
nltk.download("stopwords")

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
STOPWORDS = set(stopwords.words("english"))

# Constants
UPLOADED_VIDEOS_DIR = r"C:/Users/ishaa/watchai/pipeline/data/uploaded_videos"
THUMBNAIL_DIR = r"C:/Users/ishaa/watchai/pipeline/data/thumbnails"
CATEGORY = "news"
FIREBASE_CRED_PATH = r"C:/Users/ishaa/watchai/pipeline/firebase/firebase-credentials.json"

# Firebase initialization
if not firebase_admin._apps:
    print("[INFO] Initializing Firebase app...")
    cred = credentials.Certificate(FIREBASE_CRED_PATH)
    firebase_admin.initialize_app(cred)
db = firestore.client()


# Google Drive uploader
def upload_to_drive(filepath, parent_folder_id=None):
    file_size = os.path.getsize(filepath)
    print(f"[DEBUG] Uploading file size: {file_size} bytes")
    print(f"[INFO] Uploading {filepath} to Google Drive...")
    credentials = service_account.Credentials.from_service_account_file(
        FIREBASE_CRED_PATH,
        scopes=["https://www.googleapis.com/auth/drive"]
    )
    drive_service = build("drive", "v3", credentials=credentials)

    file_metadata = {
        "name": os.path.basename(filepath)
    }
    if parent_folder_id:
        file_metadata["parents"] = [parent_folder_id]

    media = MediaFileUpload(filepath, resumable=True)
    uploaded = drive_service.files().create(
        body=file_metadata,
        media_body=media,
        fields="id"
    ).execute()

    file_id = uploaded["id"]

    # Make public
    drive_service.permissions().create(
        fileId=file_id,
        body={"role": "reader", "type": "anyone"}
    ).execute()

    public_url = f"https://drive.google.com/uc?export=preview&id={file_id}"
    print(f"[INFO] File uploaded and shared: {public_url}")
    return public_url

def extract_duration(video_path):
    print("[INFO] Opening video file to extract duration...")
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise Exception(f"Cannot open video file {video_path}")
    print("[INFO] Getting FPS and frame count...")
    fps = cap.get(cv2.CAP_PROP_FPS)
    frame_count = cap.get(cv2.CAP_PROP_FRAME_COUNT)
    cap.release()
    if fps == 0:
        raise Exception("FPS value is 0, cannot calculate duration")
    duration = frame_count / fps
    print(f"[INFO] Duration extracted: {duration:.2f} seconds")
    return duration

def generate_thumbnail(video_path, save_path):
    print("[INFO] Generating thumbnail...")
    cap = cv2.VideoCapture(video_path)
    success, frame = cap.read()
    cap.release()
    if success:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        cv2.imwrite(save_path, frame)
        print(f"[INFO] Thumbnail saved to {save_path}")
        return save_path
    else:
        print("[WARNING] Failed to generate thumbnail")
    return None

def extract_transcript_whisper(video_path):
    print("[INFO] Loading Whisper model for transcription...")
    import whisper
    model = whisper.load_model("base")
    print("[INFO] Transcribing video...")
    result = model.transcribe(video_path)
    print("[INFO] Transcription complete")
    return result["text"]

def summarize_text(text, max_length=50):
    print("[INFO] Summarizing transcript...")
    summarizer = pipeline("summarization")
    summary = summarizer(text, max_length=max_length, min_length=10, do_sample=False)
    print("[INFO] Summarization complete")
    return summary[0]["summary_text"]

def generate_metadata(video_path):
    filename = os.path.basename(video_path)
    video_id = str(uuid.uuid4())
    title = os.path.splitext(filename)[0]

    print("[INFO] Extracting transcript...")
    transcript = extract_transcript_whisper(video_path)

    print("[INFO] Summarizing transcript...")
    description = summarize_text(transcript)

    tags = []  # Placeholder; you can generate tags from NLP if needed

    print("[INFO] Extracting duration...")
    duration = extract_duration(video_path)

    print("[INFO] Uploading video to Drive...")
    video_drive_url = upload_to_drive(video_path)

    print("[INFO] Generating and uploading thumbnail...")
    thumbnail_path = os.path.join(THUMBNAIL_DIR, f"{video_id}.jpg")
    generate_thumbnail(video_path, thumbnail_path)
    thumbnail_drive_url = upload_to_drive(thumbnail_path)

    published_at = datetime.datetime.now().isoformat()

    data = {
        "videoId": video_id,
        "title": title,
        "description": description,
        "publishedAt": published_at,
        "category": CATEGORY,
        "videoUrl": video_drive_url,
        "duration": duration,
        "tags": tags,
        "thumbnailUrl": thumbnail_drive_url,
    }

    print("[INFO] Storing metadata in Firebase...")
    db.collection("videos").document(video_id).set(data)

    print(f"[SUCCESS] Metadata stored for video ID: {video_id}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python generate_metadata.py <path_to_video>")
        sys.exit(1)
    video_path = sys.argv[1]
    generate_metadata(video_path)
