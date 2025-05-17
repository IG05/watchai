import faiss
import numpy as np
from firebase_admin import credentials, firestore, initialize_app
from pathlib import Path
from tqdm import tqdm

# === CONFIG ===
FIREBASE_CRED = Path("C:/Users/ishaa/watchai/pipeline/firebase/firebase-credentials.json")
TOP_K = 10  # Number of similar videos to cache per video

# === INIT FIREBASE ===
cred = credentials.Certificate(FIREBASE_CRED)
initialize_app(cred)
db = firestore.client()

# === STEP 1: LOAD EMBEDDINGS FROM FIRESTORE ===
print("Fetching embeddings from Firestore...")

video_docs = list(db.collection("videos").stream())
embeddings = []
video_ids = []

for doc in tqdm(video_docs):
    data = doc.to_dict()
    emb = data.get("combinedEmbedding")
    if emb and isinstance(emb, list) and len(emb) > 0:
        embeddings.append(np.array(emb, dtype=np.float32))
        video_ids.append(doc.id)

if len(embeddings) == 0:
    raise ValueError("No embeddings found in Firestore!")

embedding_dim = embeddings[0].shape[0]
matrix = np.vstack(embeddings)

print(f"Loaded {len(matrix)} embeddings with dim {embedding_dim}")

# === STEP 2: BUILD FAISS INDEX ===
print("Building FAISS index...")
index = faiss.IndexFlatIP(embedding_dim)
faiss.normalize_L2(matrix)  # normalize before adding to index
index.add(matrix)

# === STEP 3: QUERY SIMILARS AND CACHE ===
print(f"Querying top-{TOP_K} similar videos per entry...")

distances, indices = index.search(matrix, TOP_K + 1)  # +1 to skip self-match

for i, vid in enumerate(video_ids):
    similar = []
    for j, idx in enumerate(indices[i]):
        if idx == i:
            continue  # skip self
        similar.append({
            "videoId": video_ids[idx],
            "score": float(distances[i][j])
        })
        if len(similar) >= TOP_K:
            break

    db.collection("recommendations").document(vid).set({
        "videoId": vid,
        "similar": similar
    })

print("✅ FAISS index built and recommendations cached.")
