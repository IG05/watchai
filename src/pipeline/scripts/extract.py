import xml.etree.ElementTree as ET
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore

# === CONFIG ===
INPUT_FILE = Path("C:/Users/ishaa/watchai/pipeline/data/vid.xml")
FIREBASE_CRED = Path("C:/Users/ishaa/watchai/pipeline/firebase/firebase-credentials.json")

# === INIT FIREBASE ===
cred = credentials.Certificate(FIREBASE_CRED)
firebase_admin.initialize_app(cred)
db = firestore.client()

# === XML PARSE ===
ns = {"media": "http://search.yahoo.com/mrss/"}
tree = ET.parse(INPUT_FILE)
root = tree.getroot()

count = 0

for item in root.findall("./channel/item"):
    guid = item.findtext("guid")
    if not guid:
        continue  # skip items with no ID

    title = item.findtext("title")
    description = item.findtext("description")
    pubDate = item.findtext("pubDate")
    category = item.findtext("category")

    content = item.find("media:content", ns)
    tags = item.find("media:tags", ns)

    # Find thumbnail inside media:content
    thumb = None
    if content is not None:
        thumb = content.find("{http://search.yahoo.com/mrss/}thumbnail")

    data = {
        "videoId": guid,
        "title": title,
        "description": description,
        "publishedAt": pubDate,
        "category": category,
        "videoUrl": content.attrib.get("url") if content is not None else None,
        "duration": int(content.attrib.get("duration", 0)) if content is not None and "duration" in content.attrib else None,
        "tags": [tag.strip() for tag in tags.text.split(",")] if tags is not None and tags.text else [],
        "thumbnailUrl": thumb.attrib.get("url") if thumb is not None else None
    }

    # === Upload to Firestore ===
    db.collection("videos").document(guid).set(data)
    count += 1

print(f"✅ Uploaded {count} video entries to Firebase Firestore.")
