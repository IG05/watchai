"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { db } from "@/services/firebase";
import { Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { LogIn, History,LoaderCircle } from "lucide-react";

type WatchedVideoEntry = {
  videoId: string;
  watchedAt: { seconds: number; nanoseconds: number };
};

type VideoData = {
  videoId: string;
  title: string;
  description?: string;
  publishedAt: string;
  thumbnailUrl: string;
  videoUrl: string;
};

export default function WatchHistoryPage() {
  const [user, setUser] = useState<User | null>(null);
  const [watchHistory, setWatchHistory] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (usr) => {
      setUser(usr);
      if (!usr) {
        setWatchHistory([]);
        setLoading(false);
        return;
      }

      await fetchHistory(usr.uid);
    });

    return () => unsubscribe();
  }, []);

  async function fetchHistory(uid: string) {
    setLoading(true);
    const userDocRef = doc(db, "users", uid);
    const userSnap = await getDoc(userDocRef);
    if (!userSnap.exists()) {
      setWatchHistory([]);
      setLoading(false);
      return;
    }

    const data = userSnap.data();
    const history: WatchedVideoEntry[] = data.watchHistory || [];

    history.sort((a, b) => (b.watchedAt?.seconds ?? 0) - (a.watchedAt?.seconds ?? 0));

    const videos: VideoData[] = [];
    for (const entry of history) {
      const vidSnap = await getDoc(doc(db, "videos", entry.videoId));
      if (vidSnap.exists()) {
        videos.push(vidSnap.data() as VideoData);
      }
    }

    setWatchHistory(videos);
    setLoading(false);
  }

  async function deleteFromHistory(videoIdToDelete: string) {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const data = userSnap.data();
    const history: WatchedVideoEntry[] = data.watchHistory || [];

    const entryToRemove = history.find((entry) => entry.videoId === videoIdToDelete);
    if (!entryToRemove) return;

    await updateDoc(userRef, {
      watchHistory: arrayRemove(entryToRemove)
    });

    setWatchHistory((prev) => prev.filter((v) => v.videoId !== videoIdToDelete));
  }

  
if (loading) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center mt-20 text-gray-600"
    >
      <LoaderCircle className="animate-spin w-12 h-12 text-blue-500 mb-4" />
      <p className="text-lg font-medium">Loading your watch history...</p>
    </motion.div>
  );
}

  if (!user) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center mt-20 text-gray-600"
    >
      <LogIn className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold">You&apos;re Not Logged In</h2>
      <p className="mt-2 mb-6 text-gray-500">
        Please log in to view and manage your watch history.
      </p>
      <a
        href="/auth/login"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Log In
      </a>
    </motion.div>
  );
}

  if (watchHistory.length === 0) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center text-center mt-20 text-gray-600"
    >
      <History className="w-16 h-16 text-gray-400 mb-4" />
      <h2 className="text-2xl font-semibold">No Watch History</h2>
      <p className="mt-2 mb-6 text-gray-500">Looks like you haven&quot;t watched anything yet.</p>
      <a
        href="/home"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Explore Videos
      </a>
    </motion.div>
  );
}

  const uniqueVideos = watchHistory.filter(
    (video, index, self) =>
      index === self.findIndex((v) => v.videoId === video.videoId)
  );

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Your Watch History</h1>
      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="space-y-6"
      >
        {uniqueVideos.map((video) => (
          <motion.li
            key={video.videoId}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 }
            }}
            className="flex flex-col sm:flex-row gap-4 border rounded-lg p-4 shadow hover:shadow-lg transition-shadow bg-white"
          >
            <a href={`/watch/${video.videoId}`} className="sm:w-60 w-full flex-shrink-0">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-auto rounded-lg object-cover"
              />
            </a>
            <div className="flex flex-col justify-between flex-grow">
              <div>
                <a href={`/watch/${video.videoId}`}>
                  <h2 className="text-xl font-semibold text-gray-900 hover:underline line-clamp-2">
                    {video.title}
                  </h2>
                </a>
                <p className="text-sm text-gray-500 mt-1">{video.publishedAt}</p>
              </div>
              <button
                onClick={() => deleteFromHistory(video.videoId)}
                className="mt-4 sm:mt-0 sm:self-end inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
