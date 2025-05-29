"use client";

import { useState } from "react";
import Loader from "@/components/ui/Loader"

interface VideoData {
  title: string;
  description: string;
  duration: number;
  transcript: string;
  subCategory: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [status, setStatus] = useState(""); // For step-by-step status
  const [uploading, setUploading] = useState(false);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.size <= 20 * 1024 * 1024) {
      setFile(selected);
      setVideoUrl("");
      setStatus("");
      setVideoData(null);
      setShowResult(false);
    } else {
      setStatus("File must be under 20MB.");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setStatus("Uploading to S3...");
    setVideoData(null);

    try {
      const formData = new FormData();
      formData.append("video", file);

      const uploadRes = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("S3 upload failed");

      const { url } = await uploadRes.json();
      setStatus("Processing video...");

      await processVideo(url);
    } 
    catch (err: unknown) {
      if (err instanceof Error) {
        setStatus("Error: " + err.message);
      } else {
        setStatus("An unknown error occurred.");
      }
    }
    finally {
      setUploading(false);
    }
  };

  const handleUrlSubmit = async () => {
    if (!videoUrl.trim()) {
      setStatus("Please enter a valid video URL.");
      return;
    }

    setUploading(true);
    setStatus("Processing video...");
    setVideoData(null);

    try {
      await processVideo(videoUrl.trim());
    } 
    catch (err: unknown) {
      if (err instanceof Error) {
        setStatus("Error: " + err.message);
      } else {
        setStatus("An unknown error occurred.");
      }
    } 
    finally {
      setUploading(false);
    }
  };

  const processVideo = async (url: string) => {
    const res = await fetch(
      `http://localhost:7000/process-video?videoUrl=${encodeURIComponent(url)}`
    );

    if (!res.ok) {
      throw new Error("Video processing failed.");
    }

    const result = await res.json();
    const meta = result.metadata || {};

    setVideoData({
      title: meta.title || "",
      description: meta.description || "",
      duration: meta.duration || 0,
      transcript: meta.transcript || "",
      subCategory: meta.subCategory || "",
      thumbnailUrl: meta.thumbnailUrl || "",
      videoUrl: meta.videoUrl || "",
    });
    setShowResult(true);
    setStatus("");
  };

  // Show loader if uploading or processing
  if (uploading || status.startsWith("Uploading") || status.startsWith("Processing")) {
    return <Loader message={status} />;
  }

  // Show result page
  if (showResult && videoData) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl">
  <div className="flex items-center mb-6">
    <svg className="h-8 w-8 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0020 6.382V6a2 2 0 00-2-2H6a2 2 0 00-2 2v.382a2 2 0 00.447 1.342L9 10m6 0v4m0 0l-4.553 2.276A2 2 0 014 17.618V18a2 2 0 002 2h12a2 2 0 002-2v-.382a2 2 0 00-.447-1.342L15 14z" />
    </svg>
    <h2 className="text-2xl font-bold text-blue-700">Video Metadata</h2>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div>
      <p className="mb-2">
        <span className="font-semibold text-gray-700">Title:</span>
        <span className="ml-2 text-gray-900">{videoData.title || "N/A"}</span>
      </p>
      <p className="mb-2">
        <span className="font-semibold text-gray-700">Description:</span>
        <span className="ml-2 text-gray-900">{videoData.description || "N/A"}</span>
      </p>
      <p className="mb-2">
        <span className="font-semibold text-gray-700">Duration:</span>
        <span className="ml-2 text-gray-900">{videoData.duration ? `${videoData.duration} sec` : "N/A"}</span>
      </p>
      <p className="mb-2">
        <span className="font-semibold text-gray-700">Subcategory:</span>
        <span className="ml-2 text-gray-900">{videoData.subCategory || "N/A"}</span>
      </p>
      <p className="mb-2">
        <span className="font-semibold text-gray-700">Video URL:</span>
        <span className="ml-2">
          {videoData.videoUrl ? (
            <a
              href={videoData.videoUrl}
              className="text-blue-600 underline hover:text-blue-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              View
            </a>
          ) : (
            <span className="text-gray-900">N/A</span>
          )}
        </span>
      </p>
    </div>
    <div className="flex flex-col items-center">
      {videoData.thumbnailUrl ? (
        <img
          src={videoData.thumbnailUrl}
          alt="Thumbnail"
          className="rounded-lg shadow-md mb-4 max-w-xs w-full border border-blue-100"
        />
      ) : (
        <div className="w-48 h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 mb-4">
          No Thumbnail
        </div>
      )}
      <div className="w-full">
        <span className="font-semibold text-gray-700">Transcript:</span>
        <div className="bg-white border border-gray-200 rounded-lg p-3 mt-2 text-gray-800 text-sm max-h-40 overflow-y-auto shadow-inner">
          {videoData.transcript
            ? videoData.transcript.slice(0, 400) + (videoData.transcript.length > 400 ? "..." : "")
            : "No transcript available."}
        </div>
      </div>
    </div>
  </div>
  <div className="flex justify-end mt-8">
    <button
      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition"
      onClick={() => {
        setShowResult(false);
        setVideoData(null);
        setFile(null);
        setVideoUrl("");
      }}
    >
      Back to Upload
    </button>
  </div>
</div>

    );
  }

  // Default: show upload form
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Upload or Submit Video URL</h1>
      <div className="mb-4">
        <input type="file" accept="video/mp4" onChange={handleFileChange} />
        {file && (
          <p className="mt-2 text-sm">
            Selected: <strong>{file.name}</strong> ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
        <button
          disabled={!file || uploading}
          onClick={handleUpload}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload and Process"}
        </button>
      </div>
      <div className="my-6 text-center text-gray-500">OR</div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Paste video URL (must be .mp4)"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <button
          disabled={!videoUrl || uploading}
          onClick={handleUrlSubmit}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {uploading ? "Processing..." : "Submit URL"}
        </button>
      </div>
      {status && <p className="text-center text-sm text-gray-700">{status}</p>}
    </div>
  );
}
