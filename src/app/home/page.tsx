"use client"

import { useEffect, useState } from "react"
import { getAuth, onAuthStateChanged ,User} from "firebase/auth"
import { db } from "@/services/firebase"
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore"
import { motion } from "framer-motion"
import { LoaderCircle } from "lucide-react"
import debounce from "lodash.debounce"

// Add this CSS to hide scrollbars
const scrollbarHiddenStyles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`

type VideoData = {
  videoId: string
  title: string
  videoUrl: string
  thumbnailUrl: string
  publishedAt: string
  subCategory?: string
}

type VideoType = "Recommended" | "Trending" | "Fallback" | "Search" | ""

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  hover: { scale: 1.05, boxShadow: "0px 8px 15px rgba(0,0,0,0.15)" },
}



export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [videos, setVideos] = useState<VideoData[]>([])
  const [videosByCategory, setVideosByCategory] = useState<{
    [category: string]: VideoData[]
  }>({})
  
  const [videoType, setVideoType] = useState<VideoType>("")
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAllVideos, setShowAllVideos] = useState(false)
  

  const fetchAllVideos = async (): Promise<VideoData[]> => {
    const snap = await getDocs(collection(db, "videos"))
    return snap.docs.map((doc) => doc.data() as VideoData)
  }

  const performSearch = debounce(async (input: string) => {
    if (!input.trim()) {
      // If search cleared, reload initial videos or all videos based on toggle
      if (showAllVideos) {
        loadAllVideos()
      } else {
        loadInitialVideos()
      }
      return
    }

    setLoading(true)
    try {
      const allVideos = await fetchAllVideos()
      const filtered = allVideos.filter(
        (video) =>
          video.title.toLowerCase().includes(input.toLowerCase()) ||
          video.subCategory?.toLowerCase().includes(input.toLowerCase()),
      )
      setVideos(filtered)
      setVideoType("Search")
      setVideosByCategory({})
    } catch (error) {
      console.error("Error during search:", error)
    }
    setLoading(false)
  }, 500)

  const loadAllVideos = async () => {
    setLoading(true)
    try {
      const all = await fetchAllVideos()
      setVideos(all)
      setVideosByCategory({})
      setVideoType("") // no specific type when showing all
    } catch (error) {
      console.error("Error fetching all videos:", error)
    }
    setLoading(false)
  }

  const loadInitialVideos = async () => {
    setLoading(true)
    const auth = getAuth()

    const user = auth.currentUser
    if (!user) {
      // fallback
      try {
        const fallbackQ = query(collection(db, "videos"), limit(24))
        const fallbackSnap = await getDocs(fallbackQ)
        const fallbackList = fallbackSnap.docs.map((doc) => doc.data() as VideoData)
        setVideos(fallbackList)
        setVideoType("Fallback")
        setVideosByCategory({})
      } catch (error) {
        console.error("Error fetching fallback videos:", error)
      }
      setLoading(false)
      return
    }

    try {
      const userRef = doc(db, "users", user.uid)
      const userSnap = await getDoc(userRef)
      if (!userSnap.exists()) {
        setLoading(false)
        return
      }

      const userData = userSnap.data()
      const history = userData.watchHistory || []
      const preferences: string[] = userData.preferences || []

      if (history.length > 0) {
        const allRecIds = new Map<string, number>()
        for (const entry of history) {
          const recSnap = await getDoc(doc(db, "recommendations", entry.videoId))
          if (!recSnap.exists()) continue
          const similarList = recSnap.data().similar || []

          for (const item of similarList) {
            if (!allRecIds.has(item.videoId)) {
              allRecIds.set(item.videoId, item.score)
            } else {
              allRecIds.set(item.videoId, allRecIds.get(item.videoId)! + item.score)
            }
          }
        }

        const sortedRecs = [...allRecIds.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 12)
          .map(([videoId]) => videoId)

        const recVideos = await Promise.all(
          sortedRecs.map(async (videoId) => {
            const snap = await getDoc(doc(db, "videos", videoId))
            return snap.exists() ? (snap.data() as VideoData) : null
          }),
        )

        setVideos(recVideos.filter(Boolean) as VideoData[])
        setVideoType("Recommended")
        setVideosByCategory({})
        setLoading(false)
        return
      }

      if (preferences.length > 0) {
        const videosByCat: { [category: string]: VideoData[] } = {}
        for (const cat of preferences) {
          const q = query(collection(db, "videos"), where("subCategory", "==", cat))
          const snap = await getDocs(q)
          videosByCat[cat] = snap.docs.map((doc) => doc.data() as VideoData)
        }
        setVideosByCategory(videosByCat)
        setVideos([])
        setVideoType("Trending")
        setLoading(false)
        return
      }

      const fallbackQ = query(collection(db, "videos"), limit(24))
      const fallbackSnap = await getDocs(fallbackQ)
      const fallbackList = fallbackSnap.docs.map((doc) => doc.data() as VideoData)
      setVideos(fallbackList)
      setVideoType("Fallback")
      setVideosByCategory({})
    } catch (error) {
      console.error("Error fetching videos:", error)
    }

    setLoading(false)
  }

  // Toggle button handler
  const handleToggle = () => {
    setSearchQuery("")
    setShowAllVideos((prev) => !prev)
  }

  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!showAllVideos) loadInitialVideos()
    })
    return () => unsubscribe()
  }, [showAllVideos])

  // When toggle changes, fetch accordingly
  useEffect(() => {
    if (showAllVideos) {
      loadAllVideos()
    } else {
      loadInitialVideos()
    }
  }, [showAllVideos])

  // When search query changes
  useEffect(() => {
    performSearch(searchQuery)
  }, [searchQuery])

  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <style>{scrollbarHiddenStyles}</style>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-3 px-4 pr-12 text-gray-900 placeholder-gray-400
        focus:border-blue-500 focus:ring-2 focus:ring-blue-300 focus:outline-none transition"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1110.5 3a7.5 7.5 0 016.15 13.65z"
            />
          </svg>
        </div>

        {currentUser && (
  <button
    onClick={handleToggle}
    className={`inline-flex items-center rounded-full border-2 border-blue-600 px-5 py-2 text-sm font-semibold
      text-blue-600 transition-colors duration-200
      hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300
      ${showAllVideos ? "bg-blue-600 text-white" : "bg-transparent text-blue-600"}`}
  >
    {showAllVideos ? "Show Personalized" : "Show All Videos"}
  </button>
)}
      </div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center mt-20 text-gray-600"
        >
          <LoaderCircle className="animate-spin w-12 h-12 text-blue-500 mb-4" />
          <p className="text-lg font-medium">Loading Videos</p>
        </motion.div>
      ) : (
        <>
          {!showAllVideos && videoType !== "Search" && (
            <h1 className="text-3xl font-extrabold mb-6 text-gray-900">
              {videoType === "Recommended" && "Recommended for You"}
              {videoType === "Fallback" && "Trending Videos"}
              {videoType === "Trending" && "Trending Videos"}
            </h1>
          )}

          {videoType === "Search" && videos.length > 0 && (
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Search Results</h1>
          )}

          {videoType === "Search" && videos.length === 0 && (
            <p className="text-gray-600 text-lg">No results found for &quot;{searchQuery}&quot;</p>
          )}

          {videoType === "Trending" && !showAllVideos ? (
            Object.entries(videosByCategory).map(([category, vids]) => (
              <div key={category} className="mb-12">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h2>
                <div className="relative">
                  <button
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                    onClick={(e) => {
                      e.preventDefault()
                      const container = e.currentTarget.parentElement?.querySelector(".scroll-container")
                      if (container) {
                        container.scrollBy({
                          left: -300,
                          behavior: "smooth",
                        })
                      }
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <motion.div
                    className="flex overflow-x-auto pb-4 pt-2 scroll-container hide-scrollbar"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                  >
                    {vids.map((video) => (
                      <motion.a
                        key={video.videoId}
                        href={`/watch/${video.videoId}`}
                        className="flex-shrink-0 w-[400px] mr-4 border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-300"
                        variants={cardVariants}
                        whileHover="hover"
                        whileTap={{ scale: 0.97 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                      >
                        <img
                          src={video.thumbnailUrl || "/placeholder.svg"}
                          alt={video.title}
                          className="w-full h-52 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-lg line-clamp-2 text-gray-900">{video.title}</h3>
                          <p className="text-gray-500 mt-1 text-sm">
                            {new Date(video.publishedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </motion.a>
                    ))}
                  </motion.div>
                  <button
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md"
                    onClick={(e) => {
                      e.preventDefault()
                      const container = e.currentTarget.parentElement?.querySelector(".scroll-container")
                      if (container) {
                        container.scrollBy({
                          left: 300,
                          behavior: "smooth",
                        })
                      }
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              {videos.length > 0 ? (
                videos.map((video) => (
                  <motion.a
                    key={video.videoId}
                    href={`/watch/${video.videoId}`}
                    className="block border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-300"
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <img
                      src={video.thumbnailUrl || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-52 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="font-semibold text-lg line-clamp-2 text-gray-900">{video.title}</h3>
                      <p className="text-gray-500 mt-1 text-sm">{new Date(video.publishedAt).toLocaleDateString()}</p>
                    </div>
                  </motion.a>
                ))
              ) : (
                <p className="text-gray-600">No videos available.</p>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
