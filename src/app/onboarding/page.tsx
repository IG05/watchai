'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const categories = [
  'sports',
  'finance',
  'entertainment',
  'politics',
  'technology',
  'health',
  'world',
  'weather',
  'crime',
  'education',
  'science',
];

export default function OnboardingPage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleCategory = (category: string) => {
    if (selected.includes(category)) {
      setSelected((prev) => prev.filter((c) => c !== category));
    } else {
      if (selected.length >= 5) {
        setError('You can select up to 5 categories only.');
        return;
      }
      setSelected((prev) => [...prev, category]);
    }
    setError('');
  };

  const savePreferences = async () => {
    if (!user) {
      console.error('User not found');
      return;
    }

    setLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        preferences: selected,
        createdAt: serverTimestamp(),
      });

      router.push('/home');
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-8 py-16 max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-extrabold mb-4 text-blue-900">Choose Your Interests</h1>
      <p className="text-base text-gray-700 mb-8">
        Select up to <strong>5 categories</strong> to personalize your recommendations
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleCategory(cat)}
            aria-pressed={selected.includes(cat)}
            className={`rounded-2xl px-6 py-3 text-base font-semibold capitalize transition duration-200 ease-in-out focus:outline-none ${
              selected.includes(cat)
                ? 'bg-blue-700 text-white border border-blue-700 shadow-lg'
                : 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-700 mb-6">{error}</p>}

      <Button
        onClick={savePreferences}
        disabled={selected.length === 0 || loading}
        className="mt-6 px-8 py-4 text-base font-semibold"
      >
        {loading ? (
          <>
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            Saving...
          </>
        ) : (
          'Get Started'
        )}
      </Button>
    </div>
  );
}
