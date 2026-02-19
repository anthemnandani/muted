import { create } from 'zustand';

interface HiddenPostsState {
  hiddenPostIds: string[];
  hidePost: (id: string) => void;
  unhidePost: (id: string) => void;
  isPostHidden: (id: string) => boolean;
}

export const useHiddenPosts = create<HiddenPostsState>((set, get) => ({
  hiddenPostIds: [],

  hidePost: (id) =>
    set((state) => ({
      hiddenPostIds: [...state.hiddenPostIds, id],
    })),

  unhidePost: (id) =>
    set((state) => ({
      hiddenPostIds: state.hiddenPostIds.filter((pId) => pId !== id),
    })),

  isPostHidden: (id) => get().hiddenPostIds.includes(id),
}));
