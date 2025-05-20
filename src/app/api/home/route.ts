import { db } from "@/services/firebase";
import { getAuth } from "firebase/auth";
import {
  getDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  const videos = await getHomePageVideos();
  return NextResponse.json(videos);
}

async function getHomePageVideos() {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return [];

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) return [];

  const userData = userSnap.data();
  const history = userData.watchHistory || [];
  const preferences = userData.preferences || [];

  // 1️⃣ Personalized recommendations from all watched videos
  if (history.length > 0) {
    const allRecIds = new Map<string, number>();

    for (const entry of history) {
      const recSnap = await getDoc(doc(db, "recommendations", entry.videoId));
      if (!recSnap.exists()) continue;
      const similarList = recSnap.data().similar || [];

      for (const item of similarList) {
        if (!allRecIds.has(item.videoId)) {
          allRecIds.set(item.videoId, item.score);
        } else {
          allRecIds.set(item.videoId, allRecIds.get(item.videoId)! + item.score);
        }
      }
    }

    const sortedRecs = [...allRecIds.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([videoId]) => videoId);

    const recVideos = await Promise.all(
      sortedRecs.map(async (videoId) => {
        const snap = await getDoc(doc(db, "videos", videoId));
        return snap.exists() ? snap.data() : null;
      })
    );

    return recVideos.filter(Boolean);
  }

  // 2️⃣ Trending videos in preferred categories
  if (preferences.length > 0) {
    const q = query(
      collection(db, "videos"),
      where("subCategory", "in", preferences),
      limit(12)
    );
    const snap = await getDocs(q);
    if (!snap.empty) return snap.docs.map((doc) => doc.data());
  }

  // 3️⃣ Fallback: generic trending
  const fallbackQ = query(collection(db, "videos"), limit(12));
  const fallbackSnap = await getDocs(fallbackQ);
  return fallbackSnap.docs.map((doc) => doc.data());
}
