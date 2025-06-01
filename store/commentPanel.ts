import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CommentPanelState {
  isPanelOpen: boolean;
  currentPostId: string | null;
  storedPathname: string | null;
  openPanel: (postId: string) => void;
  setStoredPathname: (pathname: string) => void;
  updateCurrentPost: (postId: string) => void;
  closePanel: () => void;
  isShowingPost: (postId: string) => boolean;
  scrollPositions: Record<string, number>;
  setScrollPosition: (postId: string, position: number) => void;
  getScrollPosition: (postId: string) => number;
  resetState: () => void;
}

const useCommentPanelStore = create<CommentPanelState>()(
  persist(
    (set, get) => ({
      isPanelOpen: false,
      currentPostId: null,
      scrollPositions: {},
      storedPathname: null,

      openPanel: (postId) =>
        set({
          isPanelOpen: true,
          currentPostId: postId,
        }),

      updateCurrentPost: (postId) =>
        set({
          currentPostId: postId,
        }),

      closePanel: () =>
        set({
          isPanelOpen: false,
          storedPathname: null,
        }),

      isShowingPost: (postId) => {
        const state = get();
        return state.isPanelOpen && state.currentPostId === postId;
      },

      setScrollPosition: (postId, position) =>
        set((state) => ({
          scrollPositions: {
            ...state.scrollPositions,
            [postId]: position,
          },
        })),

      getScrollPosition: (postId) => {
        return get().scrollPositions[postId] || 0;
      },

      setStoredPathname: (pathname) =>
        set({
          storedPathname: pathname,
        }),

      resetState: () =>
        set({
          isPanelOpen: false,
          currentPostId: null,
          storedPathname: null,
        }),
    }),
    {
      name: 'comment-panel-store',
      partialize: (state) => ({
        scrollPositions: state.scrollPositions,
      }),
    }
  )
);

export default useCommentPanelStore;
