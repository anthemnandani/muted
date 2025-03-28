import { create } from 'zustand';

interface AddCommentState {
  commentText: string;
  isEdit: boolean;
  editCommentId: string;
  currentPostId: string;
  setCommentText: (text: string) => void;
  startEditing: (commentId: string, text: string) => void;
  setCurrentPostId: (postId: string) => void;
  reset: () => void;
}

const useAddCommentStore = create<AddCommentState>()((set) => ({
  commentText: '',
  isEdit: false,
  editCommentId: '',
  currentPostId: '',

  setCommentText: (text) => set({ commentText: text }),

  startEditing: (commentId, text) =>
    set({
      isEdit: true,
      editCommentId: commentId,
      commentText: text,
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
