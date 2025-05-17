import sys
import os
import shutil
import uuid
import subprocess
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your frontend origin
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "C:/Users/ishaa/watchai/pipeline/data/uploaded_videos"

@app.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    if file.content_type != "video/mp4":
        raise HTTPException(status_code=400, detail="Only mp4 videos allowed")

    unique_name = f"{uuid.uuid4()}.mp4"
    file_location = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    python_script_path = os.path.join(os.getcwd(), "scripts", "generate_metadata.py")
    result = subprocess.run(
        [sys.executable, python_script_path, file_location],
        capture_output=True,
        text=True,
        check=True,
    )
    print("Python script output:", result.stdout)
    