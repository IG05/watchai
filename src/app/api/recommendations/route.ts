import { db } from "@/services/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("videoId");

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
  }

  const similar = await getSimilarVideos(videoId);
  return NextResponse.json(similar);
}

async function getSimilarVideos(videoId: string) {
  const recRef = doc(db, "recommendations", videoId);
  const recSnap = await getDoc(recRef);

  if (!recSnap.exists()) return [];

  const { similar } = recSnap.data();
  return similar; // returns [{ videoId, score }]
}
