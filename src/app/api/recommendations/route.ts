import { db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getSimilarVideos(videoId: string) {
  const recRef = doc(db, "recommendations", videoId);
  const recSnap = await getDoc(recRef);

  if (!recSnap.exists()) return [];

  const { similar } = recSnap.data();
  return similar; // returns [{ videoId, score }]
}
