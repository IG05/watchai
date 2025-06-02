# 🎥 WatchAI

**WatchAI** is an AI-powered video recommendation platform that leverages deep learning and behavioral insights to deliver personalized video discovery. Using multi-modal AI analysis, it goes beyond traditional tags to understand video content through computer vision, audio processing, and natural language understanding.

🔗 **[Live Demo](https://watchai-ten.vercel.app/)** | 📱 **[Backend Pipeline](https://github.com/IG05/testing)**

---

## 🚀 Features

- 🎬 **Smart Video Discovery**: AI-powered recommendations tailored to your interests
- 🧠 **Multi-Modal AI Analysis**:
  - 👁️ Computer Vision via CLIP for visual understanding
  - 🎤 Audio Processing via Whisper for speech-to-text
  - 📝 NLP Embeddings for semantic content analysis
- 🎯 **Dynamic User Profiling**: Adapts with every video you watch
- ⚡ **Real-Time Recommendations**: Instant similarity search using FAISS
- 📊 **Behavioral Insights**: Smart filtering based on viewing habits
- 🌐 **Responsive Design**: Seamless experience across all devices

---

## 🛠️ Tech Stack

### Frontend
- **Next.js** with TypeScript
- **TailwindCSS** for styling
- **React** for interactive UI
- **Vercel** for deployment

### Backend & AI Pipeline
- **Python** ML pipeline with containerization
- **Docker** for containerized deployment
- **Google Cloud Run** for scalable ML processing
- **AWS S3** for video storage and management

### AI/ML Models
- **CLIP** - Computer vision and image understanding
- **Whisper** - Audio transcription and processing
- **NLP Embeddings** - Semantic text analysis
- **FAISS** - Fast similarity search and indexing

### Cloud & DevOps
- **Docker** containerization
- **Google Cloud Platform** for ML services
- **Amazon Web Services** for storage
- **Vercel** for frontend hosting
- **CI/CD** automated deployment pipeline

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js UI    │    │  Python ML       │    │   Cloud         │
│   (Vercel)      │◄──►│  Pipeline        │◄──►│   Storage       │
│                 │    │  (Cloud Run)     │    │   (AWS S3)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌────────▼────────┐             │
         │              │  AI Models      │             │
         │              │  • CLIP         │             │
         └──────────────│  • Whisper      │─────────────┘
                        │  • NLP/FAISS    │
                        └─────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Docker (optional, for containerization)
- Google Cloud SDK (for deployment)
- AWS CLI (for S3 setup)

### 1. Clone the Repository

```bash
git clone https://github.com/IG05/watchai.git
cd watchai
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Access the app at `http://localhost:3000`

### 3. Backend Pipeline Setup

```bash
# Clone the ML pipeline repository
git clone https://github.com/IG05/testing.git
cd testing

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and configurations
```

### 4. Docker Deployment (Optional)

```bash
# Build the container
docker build -t watchai-pipeline .

# Run locally
docker run -p 8000:8000 watchai-pipeline

# Deploy to Google Cloud Run
gcloud run deploy watchai-pipeline --source .
```

---

## ⚙️ Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=your_backend_api_url
NEXT_PUBLIC_AWS_REGION=your_aws_region
```

### Backend (.env)
```env
# AWS Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_s3_bucket_name

# Google Cloud
GOOGLE_CLOUD_PROJECT=your_gcp_project_id

# API Keys
OPENAI_API_KEY=your_openai_key (if using OpenAI models)
```

---

## 🧠 How It Works

1. **📹 Video Input**: Users upload or browse videos on the platform
2. **🔍 Multi-Modal Analysis**: 
   - CLIP extracts visual features and context
   - Whisper processes audio for transcription
   - NLP models analyze semantic content
3. **📊 Feature Extraction**: Deep embeddings generated for comprehensive understanding
4. **👤 User Profiling**: Dynamic profiles built from viewing behavior and preferences
5. **🎯 Similarity Matching**: FAISS performs fast vector similarity search
6. **📱 Personalized Delivery**: Real-time recommendations served to users

---

## 📈 Performance & Scalability

- **⚡ Fast Similarity Search**: FAISS enables sub-second recommendation generation
- **🐳 Containerized Deployment**: Docker ensures consistent environments
- **☁️ Cloud-Native Architecture**: Auto-scaling with Google Cloud Run
- **🗄️ Efficient Storage**: AWS S3 for reliable video storage and retrieval
- **📊 Real-time Processing**: Streaming analysis for immediate insights

---

## 🧪 API Endpoints

### Video Analysis
```bash
POST /api/analyze
Content-Type: application/json
{
  "video_url": "s3://bucket/video.mp4",
  "user_id": "user123"
}
```

### Get Recommendations
```bash
GET /api/recommendations?user_id=user123&limit=10
```

### User Profile
```bash
GET /api/profile?user_id=user123
POST /api/profile/update
```

---

## 🛠️ Development

### Running Tests
```bash
# Frontend tests
npm test

# Backend tests
cd testing
python -m pytest
```

### Building for Production
```bash
# Frontend build
npm run build

# Docker production build
docker build -t watchai-prod --target production .
```

---

## 🎯 Future Enhancements

- 🎬 **Advanced Video Analytics**: Emotion detection and scene analysis
- 🗣️ **Real-time Transcription**: Live video processing capabilities  
- 📊 **Analytics Dashboard**: Detailed insights for content creators
- 🤖 **Conversational AI**: Chat-based video discovery
- 🌍 **Multi-language Support**: Global content recommendations
- 📱 **Mobile App**: Native iOS/Android applications

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Contact & Links

**Ishaan Goyal**
- 📧 Email: [ishaangoyal0610@gmail.com](mailto:ishaangoyal0610@gmail.com)
- 💼 LinkedIn: [ishaan-goyal10](https://www.linkedin.com/in/ishaan-goyal10/)
- 🌐 Live Demo: [watchai-ten.vercel.app](https://watchai-ten.vercel.app/)
- 🔧 Backend Repo: [IG05/testing](https://github.com/IG05/testing)

---

## 🏆 Acknowledgments

- **OpenAI** for CLIP and Whisper models
- **Facebook AI** for FAISS similarity search
- **Hugging Face** for NLP model infrastructure
- **Google Cloud** and **AWS** for cloud services
- **Vercel** for seamless deployment experience

---

<div align="center">
  <strong>⭐ Star this repo if you found it helpful!</strong>
</div>
