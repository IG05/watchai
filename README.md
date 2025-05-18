# 🎥 WATCHWITHAI

**WATCHWITHAI** is a personalized video recommendation platform for news and educational content. It uses cutting-edge AI models to extract insights from video transcripts, visuals, and audio to deliver smarter, context-aware recommendations.

---

## 🚀 Features

- 🔐 Firebase Authentication (Email/Password)
- 🎬 Video Upload and Playback (Self-hosted)
- 🧠 Multimodal AI Embeddings:
  - 📄 Text via Whisper + SentenceTransformer
  - 🖼️ Visuals via CLIP
  - 🔊 Audio via Librosa MFCCs
- 📈 Personalized Recommendations:
  - Based on watch history, preferences, and FAISS similarity search
- 🧩 User Preferences:
  - Onboarding-based category selection
- 🕵️ Watch History and Interaction Tracking
- 🔎 Trending and Personalized Home Feed

---

## 🛠️ Tech Stack

| Frontend             | Backend & AI Pipeline            | Database/Storage       |
|----------------------|----------------------------------|-------------------------|
| Next.js + TailwindCSS (ShadCN) | Python (Whisper, CLIP, Librosa, SentenceTransformer) | Firebase Firestore      |
| React + TypeScript   | FAISS for similarity search      | Local video/audio storage |
| Firebase Auth        | Firebase Admin SDK               |                         |

---

## 📁 Folder Structure

```
watchai/
├── app/                    # Next.js routes (upload, watch, home, etc.)
├── components/             # UI components
├── context/                # Firebase Auth context
├── services/               # Business logic for Firebase, video history, etc.
├── pipeline/
│   ├── firebase/           # Firebase credentials
│   └── scripts/
│       ├── extract.py      # Metadata + embedding extraction script
│       └── full_model.py   # Full pipeline model orchestration
├── public/                 # Static assets
└── ...
```

---

## 🔧 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/watchwithai.git
cd watchwithai
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Set Up Python Environment for the Pipeline

```bash
cd pipeline/
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Add Firebase Credentials

Download your Firebase Admin SDK JSON file and place it at:

```
pipeline/firebase/firebase-credentials.json
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## 💻 Running the App

### Frontend (Next.js)

```bash
npm run dev
```

### Backend Pipeline Scripts

#### ✅ Run `extract.py` – Extract metadata & embeddings for a video

```bash
cd pipeline/scripts
python extract.py --video_path "C:/Users/ishaa/watchai/pipeline/data/uploaded_videos/video.mp4"
```

> Outputs transcript, summary, thumbnails, audio features, CLIP & text embeddings. Saves data to Firebase.

#### ✅ Run `full_model.py` – Orchestrate full pipeline + store in Firebase

```bash
cd pipeline/scripts
python full_model.py --video_path "C:/Users/ishaa/watchai/pipeline/data/uploaded_videos/video.mp4"
```

> Executes full processing pipeline and updates Firestore with metadata and embedding vectors.

---

## 🧠 How It Works

1. 📤 User uploads a video via the UI.
2. 🧾 `extract.py` runs transcription, summarization, feature extraction.
3. 🧠 `full_model.py` calls `extract.py`, computes embeddings, updates Firestore.
4. 🔁 FAISS indexes embeddings for fast similarity-based recommendations.
5. 🏠 Home feed shows personalized or trending videos.

---

## 📈 Future Plans

- 📊 Admin Dashboard
- 🌐 Public Video Sharing & Comments
- 🤖 LLM-powered Question Answering from Videos
- ⏳ Streaming Video Transcription

---

## 👨‍💻 Contributing

We welcome contributions!  
Please fork the repo, create a feature branch, and open a pull request with detailed info.

---

## 📜 License

MIT License © 2025 [Ishaan Goyal](https://github.com/your-username)

---

## 📬 Contact

📧 ishaan.goyal@example.com  
🔗 [LinkedIn](https://www.linkedin.com/in/your-link)  
💡 Ideas or issues? Open one [here](https://github.com/your-username/watchwithai/issues)

---

> ⚡ Built with passion using AI + Firebase + React