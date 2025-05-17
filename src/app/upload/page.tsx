'use client';

import { FiUpload } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function UploadPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8 text-center"
      >
        <FiUpload className="mx-auto text-6xl text-blue-500 mb-6" />
        <h1 className="text-3xl font-semibold mb-4 text-gray-800">
          Upload a Video
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          This page will allow you to upload your own video and get recommendations.
        </p>
        <motion.p
          initial={{ scale: 0.9 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="inline-block bg-blue-100 text-blue-700 font-semibold px-4 py-2 rounded-full shadow-sm"
        >
          Feature coming soon! 🚀
        </motion.p>
      </motion.div>
    </div>
  );
}
