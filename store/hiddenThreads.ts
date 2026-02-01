import { create } from 'zustand';

interface HiddenThreadsState {
  hiddenThreadIds: string[];
  hideThread: (id: string) => void;
  unhideThread: (id: string) => void;
  isThreadHidden: (id: string) => boolean;
}

export const useHiddenThreads = create<HiddenThreadsState>((set, get) => ({
  hiddenThreadIds: [],

  hideThread: (id) =>
    set((state) => ({
      hiddenThreadIds: [...state.hiddenThreadIds, id],
    })),

  unhideThread: (id) =>
    set((state) => ({
      hiddenThreadIds: state.hiddenThreadIds.filter((pId) => pId !== id),
    })),

  isThreadHidden: (id) => get().hiddenThreadIds.includes(id),
}));
