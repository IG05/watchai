'use client';

import { useState } from 'react';
import { db } from '@/services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AdminUploadPage() {
  const [video, setVideo] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    videoUrl: '',
    thumbnailUrl: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setVideo({ ...video, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const tagsArray = video.tags.split(',').map(tag => tag.trim());

    await addDoc(collection(db, 'videos'), {
      ...video,
      tags: tagsArray,
      createdAt: serverTimestamp(),
      uploadedBy: 'admin',
    });

    alert('Video uploaded!');
    setVideo({
      title: '',
      description: '',
      category: '',
      tags: '',
      videoUrl: '',
      thumbnailUrl: '',
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Upload Video</h2>
      <input name="title" value={video.title} onChange={handleChange} placeholder="Title" className="w-full p-2 border rounded" />
      <textarea name="description" value={video.description} onChange={handleChange} placeholder="Description" className="w-full p-2 border rounded" />
      <input name="category" value={video.category} onChange={handleChange} placeholder="Category" className="w-full p-2 border rounded" />
      <input name="tags" value={video.tags} onChange={handleChange} placeholder="Tags (comma-separated)" className="w-full p-2 border rounded" />
      <input name="videoUrl" value={video.videoUrl} onChange={handleChange} placeholder="Video URL" className="w-full p-2 border rounded" />
      <input name="thumbnailUrl" value={video.thumbnailUrl} onChange={handleChange} placeholder="Thumbnail URL" className="w-full p-2 border rounded" />
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">Upload</button>
    </div>
  );
}
