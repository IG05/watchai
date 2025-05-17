import firebase_admin
from firebase_admin import credentials, firestore
from transformers import pipeline,AutoTokenizer
from pathlib import Path
from tqdm import tqdm

# === CONFIG ===
FIREBASE_CRED = Path("C:/Users/ishaa/watchai/pipeline/firebase/firebase-credentials.json")

# Initialize Firebase
cred = credentials.Certificate(FIREBASE_CRED)
firebase_admin.initialize_app(cred)
db = firestore.client()

# Initialize zero-shot classifier with a strong model
tokenizer = AutoTokenizer.from_pretrained(
    "joeddav/xlm-roberta-large-xnli",
    use_fast=False  # force slow tokenizer
)

classifier = pipeline(
    "zero-shot-classification",
    model="joeddav/xlm-roberta-large-xnli",
    tokenizer=tokenizer,
    device=-1
)

candidate_labels = [
    "sports",
    "finance",
    "entertainment",
    "politics",
    "technology",
    "health",
    "world",
    "weather",
    "crime",
    "education",
    "science",
]

CONFIDENCE_THRESHOLD = 0.3  # Tune this as needed

def classify_subcategory(text: str) -> str:
    if not text.strip():
        return "unknown"
    result = classifier(text, candidate_labels, multi_label=True)

    # Find best category with highest score
    max_score = max(result["scores"])
    max_label = result["labels"][result["scores"].index(max_score)]

    if max_score < CONFIDENCE_THRESHOLD:
        return "unknown"
    return max_label

def main():
    videos_ref = db.collection("videos")
    videos = list(videos_ref.stream())
    print(f"Processing {len(videos)} videos for subCategory classification...")

    for doc in tqdm(videos):
        data = doc.to_dict()
        title = data.get("title", "")
        description = data.get("description", "")
        transcript = data.get("transcript", "")

        combined_text = " ".join(filter(None, [title, description, transcript]))

        sub_category = classify_subcategory(combined_text)

        db.collection("videos").document(doc.id).update({
            "subCategory": sub_category
        })

    print("✅ Finished updating all videos with subCategory.")

if __name__ == "__main__":
    main()
