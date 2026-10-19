import { useEffect, useState } from 'react';

// Turns true only if `active` stays true for `delayMs`. Stops skeletons from flashing
// for a split second when data arrives almost instantly.
export function useDelayedFlag(active: boolean, delayMs = 150): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!active) {
      setShow(false);
      return;
    }
    if (delayMs <= 0) {
      setShow(true);
      return;
    }
    const t = setTimeout(() => setShow(true), delayMs);
    return () => clearTimeout(t);
  }, [active, delayMs]);
  return show;
}
