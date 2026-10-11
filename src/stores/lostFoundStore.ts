import { create } from 'zustand';

export type LostFoundStatus = 'LOST' | 'FOUND' | 'CLAIMED';

export interface LostFoundItem {
  id: string;
  name: string;
  category: string;
  location: string;          // where it was last seen, e.g. "CCS Building, 2nd Floor, Room 204"
  date: string;              // date the report was filed
  status: LostFoundStatus;
  description?: string;
  photo?: string;            // local image uri
  lastSeenWhen?: string;     // "Just now", "Today", "Yesterday", "Earlier"
  lastSeenNote?: string;
  reporterId?: string;
  reporterName?: string;
}

export type NewLostReport = Omit<LostFoundItem, 'id' | 'date' | 'status'>;

const SEED: LostFoundItem[] = [
    {
        id: 'LF-001',
        name: 'Black Wallet',
        category: 'Personal Item',
        location: 'Library',
        date: 'Oct 7, 2026',
        status: 'LOST',
    },
    {
        id: 'LF-002',
        name: 'iPhone 14',
        category: 'Electronics',
        location: 'Science Building',
        date: 'Oct 7, 2026',
        status: 'FOUND',
    },
    {
        id: 'LF-003',
        name: 'Student ID Card',
        category: 'ID Card',
        location: 'Main Gate',
        date: 'Oct 6, 2026',
        status: 'FOUND',
    },
    {
        id: 'LF-004',
        name: 'Blue Backpack',
        category: 'Personal Item',
        location: 'Engineering Building',
        date: 'Oct 6, 2026',
        status: 'LOST',
    },
    {
        id: 'LF-005',
        name: 'Black Umbrella',
        category: 'Accessories',
        location: 'Cafeteria',
        date: 'Oct 5, 2026',
        status: 'CLAIMED',
    },
];

const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

interface LostFoundState {
  items: LostFoundItem[];
  addLostItem: (report: NewLostReport) => string;
}

export const useLostFoundStore = create<LostFoundState>((set, get) => ({
  items: SEED,
  addLostItem: (report) => {
    const id = `LF-${String(get().items.length + 1).padStart(3, '0')}`;
    const item: LostFoundItem = { ...report, id, date: formatDate(new Date()), status: 'LOST' };
    set((s) => ({ items: [item, ...s.items] }));
    return id;
  },
}));
