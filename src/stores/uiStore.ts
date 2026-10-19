import { create } from 'zustand';

interface UiState {
  // Development only: forces skeletons to show so the loading look can be previewed.
  previewSkeletons: boolean;
  previewLoading: (ms?: number) => void;
}

let timer: ReturnType<typeof setTimeout> | null = null;

export const useUiStore = create<UiState>((set) => ({
  previewSkeletons: false,
  previewLoading: (ms = 2500) => {
    if (timer) clearTimeout(timer);
    set({ previewSkeletons: true });
    timer = setTimeout(() => set({ previewSkeletons: false }), ms);
  },
}));
