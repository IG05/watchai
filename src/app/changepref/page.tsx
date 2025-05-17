'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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

export default function ChangePreferencePage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const router = useRouter();

  // Load existing preferences on mount
  useEffect(() => {
    if (!user) return;

    const fetchPreferences = async () => {
      setLoadingPrefs(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.preferences && Array.isArray(data.preferences)) {
            setSelected(data.preferences);
          }
        }
      } catch (err) {
        console.error('Error fetching preferences:', err);
        setError('Failed to load preferences.');
      } finally {
        setLoadingPrefs(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const toggleCategory = (category: string) => {
    setError('');
    if (selected.includes(category)) {
      setSelected((prev) => prev.filter((c) => c !== category));
    } else {
      setSelected((prev) => [...prev, category]);
    }
  };

  const selectAll = () => {
    setSelected(categories);
    setError('');
  };

  const clearAll = () => {
    setSelected([]);
    setError('');
  };

  const savePreferences = async () => {
    if (!user) {
      setError('User not found.');
      return;
    }
    if (selected.length === 0) {
      setError('Please select at least one category.');
      return;
    }

    setLoading(true);
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        {
          preferences: selected,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      router.push('/home');
    } catch (err) {
      console.error('Failed to save preferences:', err);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingPrefs) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-8 py-16 max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-extrabold mb-4 text-blue-900">Update Your Preferences</h1>
      <p className="text-base text-gray-700 mb-8">
        Select categories you are interested in to personalize your recommendations.
      </p>

      <div className="flex justify-center mb-6 gap-4">
        <Button variant="outline" size="sm" onClick={selectAll}>
          Select All
        </Button>
        <Button variant="outline" size="sm" onClick={clearAll}>
          Clear All
        </Button>
      </div>

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
          'Save Preferences'
        )}
      </Button>
    </div>
  );
}
