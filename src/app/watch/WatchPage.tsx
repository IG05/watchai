"use client";

import { useEffect, useState } from "react";
import { getSimilarVideos } from "@/app/api/recommendations/route";
import { getDoc, doc, setDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/services/firebase";
import { getAuth } from "firebase/auth";
import { motion, AnimatePresence } from "framer-motion";
import { LoaderCircle } from "lucide-react";

// === Types ===
type RecommendationItem = {
  videoId: string;
  score: number;
};

type VideoData = {
  videoId: string;
  title: string;
  description?: string;
  publishedAt: string;
  videoUrl: string;
  thumbnailUrl: string;
  category?: string;
};

export default function WatchPage({ videoId }: { videoId: string }) {
  const [video, setVideo] = useState<VideoData | null>(null);
  const [similarVideos, setSimilarVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    async function fetchVideoAndRecommendations() {
      setLoading(true);
      // 1. Fetch video info
      const vidSnap = await getDoc(doc(db, "videos", videoId));
      if (!vidSnap.exists()) {
        setLoading(false);
        return;
      }
      const videoData = vidSnap.data() as VideoData;
      setVideo(videoData);

      // 2. Fetch similar videos
      const similarList: RecommendationItem[] = await getSimilarVideos(videoId);
      const videos = await Promise.all(
        similarList.map(async (item) => {
          const recSnap = await getDoc(doc(db, "videos", item.videoId));
          return recSnap.exists() ? (recSnap.data() as VideoData) : null;
        })
      );
      setSimilarVideos(videos.filter(Boolean) as VideoData[]);

      // 3. Update watch history (if user is logged in)
      const user = getAuth().currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(
          userRef,
          {
            watchHistory: arrayUnion({
              videoId: videoId,
              watchedAt: new Date().toISOString(),
            }),
          },
          { merge: true }
        );
      }
      setLoading(false);
    }

    fetchVideoAndRecommendations();
  }, [videoId]);

  if (loading) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center mt-20 text-gray-600"
    >
      <LoaderCircle className="animate-spin w-12 h-12 text-blue-500 mb-4" />
      <p className="text-lg font-medium">Loading Video</p>
    </motion.div>
  );
}

  if (!video)
    return (
      <div className="flex justify-center items-center h-[500px] text-red-500 text-lg">
        Video not found.
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex gap-8">
        {/* === Main Video Section with dynamic width === */}
        <motion.main
          className="rounded-lg shadow-lg bg-white"
          style={{ flexGrow: 1 }}
          animate={{ width: sidebarOpen ? "calc(100% - 350px)" : "100%" }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        >
          <div className="aspect-w-16 aspect-h-9">
            <video
              src={video.videoUrl}
              controls
              className="w-full max-h-screen h-full rounded-lg bg-black"
            />
          </div>
          <h1 className="mt-6 px-4 text-3xl font-extrabold text-gray-900">{video.title}</h1>
          <p className="px-4 mt-1 text-sm text-gray-400">
            {new Date(video.publishedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          {video.description && (
            <p className="px-4 mt-4 text-gray-700 leading-relaxed whitespace-pre-line">{video.description}</p>
          )}
        </motion.main>

        {/* === Sidebar === */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              className="w-[350px] bg-white rounded-lg shadow-md flex flex-col"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold select-none">Similar Videos</h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                  className="text-gray-500 hover:text-gray-800 focus:outline-none"
                >
                  ✕
                </button>
              </div>
              <ul className="overflow-y-auto flex-grow space-y-6 px-4 py-3">
                {similarVideos.length > 0 ? (
                  similarVideos.map((v) => (
                    <li
                      key={v.videoId}
                      className="flex cursor-pointer rounded-lg hover:bg-gray-100 transition-colors p-3 items-center gap-4"
                      style={{ minHeight: "120px" }}
                    >
                      <a
                        href={`/watch/${v.videoId}`}
                        className="flex-shrink-0 w-36 h-20 rounded-md overflow-hidden relative"
                      >
                        <img
                          src={v.thumbnailUrl}
                          alt={v.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 rounded-md"
                          loading="lazy"
                          decoding="async"
                        />
                      </a>
                      <div className="flex flex-col justify-center flex-1">
                        <a
                          href={`/watch/${v.videoId}`}
                          className="text-sm font-semibold text-gray-900 line-clamp-2 hover:underline"
                        >
                          {v.title}
                        </a>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(v.publishedAt).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-gray-400 text-center">No similar videos found.</p>
                )}
              </ul>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* === Toggle Button when sidebar is closed === */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-24 right-6 z-50 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full p-3 shadow-lg transition"
          aria-label="Open sidebar"
          title="Show Similar Videos"
        >
          ▶
        </button>
      )}
    </div>
  );
}
