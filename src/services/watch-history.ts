import { db } from '@/services/firebase';
import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';

export const updateWatchHistory = async (userUid: string, videoId: string) => {
  const userRef = doc(db, 'users', userUid);

  try {
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      console.error('User not found.');
      return;
    }

    const currentHistory = userSnap.data().watchHistory || [];

    // Check if video already exists
    const existingIndex = currentHistory.findIndex((entry: any) => entry.videoId === videoId);
    const timestamp = Timestamp.now();

    let updatedHistory;

    if (existingIndex !== -1) {
      // Update timestamp of existing entry
      currentHistory[existingIndex].timestamp = timestamp;
      updatedHistory = [...currentHistory];
    } else {
      // Add new entry
      updatedHistory = [...currentHistory, { videoId, timestamp }];
    }

    // Update the full array
    await updateDoc(userRef, {
      watchHistory: updatedHistory,
    });

    console.log('Watch history updated successfully!');
  } catch (error) {
    console.error('Error updating watch history:', error);
  }
};
