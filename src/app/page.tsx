'use client';

import { PrimaryButton } from '@/components/ui/PrimaryButton';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, Eye, Rocket } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-blue-600 to-indigo-800 text-white">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center min-h-screen px-6 py-12">
        <motion.h1
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-extrabold mb-4"
        >
          Welcome to <span className="text-yellow-300">WATCHAI</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-xl max-w-xl mb-8"
        >
          Discover AI-powered video recommendations tailored uniquely to your interests. Smarter, faster, and more relevant content — all in one place.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link href="/#about">
            <PrimaryButton className="bg-yellow-400 text-black hover:bg-yellow-500 text-lg px-6 py-3 rounded-xl shadow-lg">
              Learn More
            </PrimaryButton>
          </Link>
        </motion.div>
      </section>

      {/* What is WATCHAI */}
      <section id="about" className="bg-white text-gray-900 py-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">What is WATCHAI?</h2>
          <p className="text-lg text-gray-700">
            WATCHAI is your personal AI companion for video discovery. Using deep learning and behavioral insights, it filters through endless content and shows you only what matters to you.
          </p>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-gray-100 text-gray-900 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition">
              <Brain className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Smart User Profiling</h3>
              <p className="text-gray-700">
                WATCHAI builds a dynamic user profile using your viewing habits and preferences. It adapts with every video you watch.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition">
              <Eye className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI-Powered Video Analysis</h3>
              <p className="text-gray-700">
                We analyze videos using computer vision (CLIP), audio (Whisper), and NLP embeddings to extract deep features — going beyond tags.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition">
              <Rocket className="w-10 h-10 text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Personalized Recommendations</h3>
              <p className="text-gray-700">
                Videos are ranked and matched using similarity search with FAISS, giving you the most relevant and fresh recommendations instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-indigo-700 text-white py-20 text-center px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold mb-4"
        >
          Ready to Discover Smarter?
        </motion.h2>
        <p className="text-lg mb-6 max-w-xl mx-auto">
          Sign up and experience a new way to watch videos — more tailored, more intelligent, more YOU.
        </p>
        <Link href="/home">
          <PrimaryButton className="bg-yellow-500 text-black hover:bg-yellow-500 text-lg px-6 py-3 rounded-xl shadow-lg">
            Get Started
          </PrimaryButton>
        </Link>
      </section>
    </div>
  );
}
