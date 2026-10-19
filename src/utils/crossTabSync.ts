/**
 * Cross-Tab Synchronization for Zustand Stores
 *
 * Problem: When the user view is in one browser tab and the admin dashboard is
 * in another, they each have separate in-memory Zustand stores. Changes in one
 * tab (e.g., a student reporting an incident) are persisted to localStorage,
 * but the other tab's store is never notified in memory.
 *
 * Solution: Use BroadcastChannel API (supported across all modern browsers) to
 * broadcast store mutations directly with updated data. When another tab receives
 * the broadcast, it immediately updates its in-memory state and rehydrates,
 * triggering React re-renders and siren/audio alerts without needing a reload.
 */

type SyncMessage<T = unknown> = {
  type: 'STORE_UPDATE';
  storeName: string;
  data?: T;
  timestamp: number;
};

const CHANNEL_NAME = 'campussafe-sync';

let channel: BroadcastChannel | null = null;

function getChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }

  if (!channel) {
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      return null;
    }
  }
  return channel;
}

/**
 * Notify other tabs that a store has been updated.
 */
export function broadcastStoreUpdate<T = unknown>(storeName: string, data?: T): void {
  const ch = getChannel();
  if (!ch) return;

  const message: SyncMessage<T> = {
    type: 'STORE_UPDATE',
    storeName,
    data,
    timestamp: Date.now(),
  };

  try {
    ch.postMessage(message);
  } catch {
    // Silently ignore if channel is closed or serialization fails
  }
}

/**
 * Listen for store updates from other tabs.
 * Calls onUpdate with payload data if provided.
 */
export function onCrossTabUpdate<T = unknown>(
  storeName: string,
  onUpdate: (data?: T) => void
): () => void {
  const ch = getChannel();
  if (!ch) return () => {};

  const handler = (event: MessageEvent<SyncMessage<T>>) => {
    if (
      event.data &&
      event.data.type === 'STORE_UPDATE' &&
      event.data.storeName === storeName
    ) {
      onUpdate(event.data.data);
    }
  };

  ch.addEventListener('message', handler);

  const storageHandler = (e: StorageEvent) => {
    if (e.key === storeName) {
      onUpdate();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', storageHandler);
  }

  return () => {
    ch.removeEventListener('message', handler);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', storageHandler);
    }
  };
}
