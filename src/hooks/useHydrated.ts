import { useEffect, useState } from 'react';

type Persisted = {
  persist: {
    hasHydrated: () => boolean;
    onFinishHydration: (fn: (state: any) => void) => () => void;
  };
};

// True once a persisted Zustand store has finished loading from AsyncStorage.
export function useHydrated(store: Persisted): boolean {
  const [hydrated, setHydrated] = useState(store.persist.hasHydrated());
  useEffect(() => {
    const unsubscribe = store.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(store.persist.hasHydrated());
    return unsubscribe;
  }, [store]);
  return hydrated;
}
