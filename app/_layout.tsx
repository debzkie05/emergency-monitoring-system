
import { useEffect } from 'react';
import { Slot } from 'expo-router';
import { setupCrossTabSync } from '@/stores/incidentStore';

export default function RootLayout() {
  // Activate cross-tab synchronization so that incidents created in the user
  // tab instantly appear in the admin dashboard tab (and vice-versa).
  useEffect(() => {
    const cleanup = setupCrossTabSync();
    return cleanup;
  }, []);

  return <Slot />;
}
