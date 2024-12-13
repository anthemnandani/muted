import { create } from 'zustand';

interface HiddenPostsState {
  temporaryHiddenPosts: Set<string>;
  hidePost: (postId: string) => void;
  unhidePost: (postId: string) => void;
  isTemporarilyHidden: (postId: string) => boolean;
}

export const useHiddenPosts = create<HiddenPostsState>((set, get) => ({
  temporaryHiddenPosts: new Set<string>(),
  hidePost: (postId: string) =>
    set((state) => ({
      temporaryHiddenPosts: new Set(state.temporaryHiddenPosts).add(postId),
    })),
  unhidePost: (postId: string) =>
    set((state) => {
      const newSet = new Set(state.temporaryHiddenPosts);
      newSet.delete(postId);
      return { temporaryHiddenPosts: newSet };
    }),
  isTemporarilyHidden: (postId: string) =>
    get().temporaryHiddenPosts.has(postId),
}));
