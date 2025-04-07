import { create } from 'zustand';

interface AddCommentState {
  commentText: string;
  isEdit: boolean;
  editCommentId: string;
  currentPostId: string;
  setCommentText: (text: string) => void;
  startEditing: (commentId: string, text: string) => void;
  setCurrentPostId: (postId: string) => void;
  charCount: number;
  setCharCount: (count: number) => void;
  reset: () => void;
}

const useAddCommentStore = create<AddCommentState>()((set) => ({
  commentText: '',
  isEdit: false,
  editCommentId: '',
  currentPostId: '',
  charCount: 0,
  setCommentText: (text) => set({ commentText: text }),
  setCharCount: (count) => set({ charCount: count }),
  startEditing: (commentId, text) =>
    set({
      isEdit: true,
      editCommentId: commentId,
      commentText: text,
      charCount: text.length,
    }),

  setCurrentPostId: (postId) =>
    set((state) => {
      if (state.currentPostId !== postId) {
        return {
          currentPostId: postId,
          isEdit: false,
          editCommentId: '',
          commentText: '',
        };
      }
      return { currentPostId: postId };
    }),

  reset: () =>
    set({
      commentText: '',
      isEdit: false,
      editCommentId: '',
    }),
}));

export default useAddCommentStore;
