export async function fetchYouTubeVideoDetails(videoId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();
  const video = data.items?.[0];

  if (!video) return null;

  const snippet = video.snippet;
  return {
    id: videoId,
    title: snippet.title,
    description: snippet.description,
    thumbnailUrl: snippet.thumbnails?.high?.url || "",
    tags: snippet.tags || [],
    publishedAt: snippet.publishedAt,
    source: "youtube",
  };
}
export async function fetchVideoById(videoId: string) {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.items && data.items.length > 0) {
    return data.items[0];
  }
  return null;
}
