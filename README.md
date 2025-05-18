# 🎥 WATCHWITHAI

**WATCHWITHAI** is a personalized video recommendation platform for news and educational content. It uses cutting-edge AI models to extract insights from video transcripts, visuals, and audio to deliver smarter, context-aware recommendations.

---

## 🚀 Features

- 🔐 Firebase Authentication (Email/Password)
- 🎬 Video Upload and Playback 
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
├── app/                                # Next.js route-based pages
│   ├── api/                            # API routes (optional backend logic)
│   ├── auth/                           # Login and Register pages
│   ├── home/                           # Personalized home feed
│   ├── onboarding/                     # Category preference setup
│   ├── upload/                         # Video upload interface
│   ├── watch/                          # Watch page with video + recommendations
│   ├── watch-history/                  # User watch history page
│   ├── changepref/                     # Update preferences
│   └── layout.tsx / page.tsx          # Global layout and root page
│
├── context/
│   └── AuthContext.tsx                 # Firebase Auth wrapper
│
├── services/                           # Business logic / Firebase interactions
│   ├── firebase.ts                     # Firebase client setup
│
├── pipeline/                           # Python backend pipeline
│   ├── firebase/
│   │   └── firebase-credentials.json   # Firebase admin credentials
│   ├── data/
│   │   ├── processed_videos/          # Final processed outputs

│   ├── scripts/
│   │   ├── extract.py                  # Metadata extraction
│   │   └── full_model.py              # Complete pipeline orchestration
│   └── requirements.txt               # Python dependencies
│
├── styles/
│   └── globals.css                     # Tailwind and global CSS
│
├── .env.local                          # Firebase environment variables
├── next.config.js                      # Next.js config
├── package.json                        # NPM package definitions
├── tsconfig.json                       # TypeScript config
├── README.md                           # Project overview
└── .gitignore                          # Git ignored files

```

---

## 🔧 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/watchai.git
cd watchai
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Set Up Python Environment for the Pipeline

```bash
cd pipeline/
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

#### ✅ Run `extract.py` – Extract metadata & embeddings for videos [in XML file]

```bash
cd pipeline
python3 python3 scripts/extract.py   
```

> Outputs transcript, summary, thumbnails, audio features, CLIP & text embeddings. Saves data to Firebase.

#### ✅ Run `full_model.py` – Orchestrate full pipeline + store in Firebase

```bash
cd pipeline
python3 scripts/full_model.py 
```

#### ✅ Run `build_faiss_index.py` – Generate Faiss Index for Similarity and Recommendation

```bash
cd pipeline
python3 scripts/.py build_faiss_inex.py
```

> Executes full processing pipeline and updates Firestore with metadata and embedding vectors.

---

## 🧠 How It Works

1. 📤 Video Extracted from XML file
2. 🧾 `extract.py` runs transcription, summarization, feature extraction.
3. 🧠 `full_model.py` computes embeddings, updates Firestore.
4. 🔁 FAISS indexes embeddings for fast similarity-based recommendations.
5. 🏠 Home feed shows personalized or trending videos.

---

## 📈 Future Plans

- 📊 Admin Dashboard
- 🌐 Public Video Sharing & Comments
- 🤖 LLM-powered Question Answering from Videos
- ⏳ Streaming Video Transcription
- 🤖 Recommendation on Custom VIdeo Dataset

---

## 👨‍💻 Contributing

We welcome contributions!  
Please fork the repo, create a feature branch, and open a pull request with detailed info.

---

## 📬 Contact

📧 ishaangoyal0610@gmail.com
🔗 [LinkedIn]([https://www.linkedin.com/in/your-link](https://www.linkedin.com/in/ishaan-goyal10/))  

