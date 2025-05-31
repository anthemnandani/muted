import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CommentPanelState {
  isPanelOpen: boolean;
  currentPostId: string | null;
  activeRoute: string | null;
  openPanel: (postId: string, pathname?: string) => void;
  updateCurrentPost: (postId: string) => void;
  closePanel: () => void;
  isShowingPost: (postId: string) => boolean;
  scrollPositions: Record<string, number>;
  setScrollPosition: (postId: string, position: number) => void;
  getScrollPosition: (postId: string) => number;
  resetState: () => void;
  shouldShowPanel: (currentRoute: string) => boolean;
  handleRouteChange: (newRoute: string) => void;
}

const useCommentPanelStore = create<CommentPanelState>()(
  persist(
    (set, get) => ({
      isPanelOpen: false,
      currentPostId: null,
      activeRoute: null,
      scrollPositions: {},

      openPanel: (postId, pathname) =>
        set({
          isPanelOpen: true,
          currentPostId: postId,
          activeRoute: pathname || null,
        }),

      updateCurrentPost: (postId) =>
        set({
          currentPostId: postId,
        }),

      closePanel: () =>
        set({
          isPanelOpen: false,
          activeRoute: null,
        }),

      isShowingPost: (postId) => {
        const state = get();
        return state.isPanelOpen && state.currentPostId === postId;
      },

      shouldShowPanel: (currentRoute) => {
        const state = get();
        if (!state.isPanelOpen) return false;
        if (!state.activeRoute) return true;

        return currentRoute === state.activeRoute;
      },

      handleRouteChange: (newRoute) => {
        const state = get();
        if (
          state.isPanelOpen &&
          state.activeRoute &&
          newRoute !== state.activeRoute
        ) {
          set({
            isPanelOpen: false,
            activeRoute: null,
          });
          document.body.style.overflow = 'unset';
        }
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

      resetState: () =>
        set({
          isPanelOpen: false,
          currentPostId: null,
          activeRoute: null,
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
