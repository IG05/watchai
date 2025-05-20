import { doc, getDoc } from "firebase/firestore";
import { db } from "@/services/firebase";
import WatchPage from "@/app/watch/WatchPage"; // Adjust if you placed it elsewhere

type Props = {
  params: { videoId: string };
};

export default async function Watch({ params }: Props) {  // await params first
  const { videoId } = params;

  const docRef = doc(db, "videos", videoId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return <div className="p-4 text-red-500">Video not found.</div>;
  }

  return <WatchPage videoId={videoId} />;
}
