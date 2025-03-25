import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AddCommentState {
  commentText: string;
  setCommentText: (text: string) => void;
  isCommentBoxOpen: boolean;
  setCommentBoxOpen: (open: boolean) => void;
  activePostId: string | null;
  setActivePostId: (postId: string | null) => void;
  reset: () => void;
}

const useAddCommentStore = create<AddCommentState>()(
  persist(
    (set) => ({
      commentText: '',
      setCommentText: (text) => set({ commentText: text }),
      isCommentBoxOpen: false,
      setCommentBoxOpen: (open) => set({ isCommentBoxOpen: open }),
      activePostId: null,
      setActivePostId: (postId) => set({ activePostId: postId }),
      reset: () =>
        set({
          commentText: '',
          isCommentBoxOpen: false,
          activePostId: null,
        }),
    }),
    {
      name: 'comment-store',
      partialize: (state) => ({
        commentText: state.commentText,
        isCommentBoxOpen: state.isCommentBoxOpen,
        activePostId: state.activePostId,
      }),
    }
  )
);

export default useAddCommentStore;
