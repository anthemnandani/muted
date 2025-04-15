import { create } from 'zustand';

interface AddCommentState {
  commentText: string;
  replyText: string;
  isEdit: boolean;
  isReply: boolean;
  isReplyEdit: boolean;
  activeReplyCommentId: string | null;
  editCommentId: string;
  editReplyId: string;
  currentPostId: string;
  charCount: number;
  replyCharCount: number;

  setCommentText: (text: string) => void;
  setReplyText: (text: string) => void;
  startEditing: (commentId: string, text: string) => void;
  startReplyEditing: (replyId: string, text: string) => void;
  startReplying: (commentId: string) => void;
  setCurrentPostId: (postId: string) => void;
  setCharCount: (count: number) => void;
  setReplyCharCount: (count: number) => void;
  reset: () => void;
  resetReply: () => void;
  cancelReply: () => void;
}

const useAddCommentStore = create<AddCommentState>()((set) => ({
  commentText: '',
  replyText: '',
  isEdit: false,
  isReply: false,
  isReplyEdit: false,
  activeReplyCommentId: null,
  editCommentId: '',
  editReplyId: '',
  currentPostId: '',
  charCount: 0,
  replyCharCount: 0,

  setCommentText: (text) => set({ commentText: text }),
  setReplyText: (text) => set({ replyText: text }),
  setCharCount: (count) => set({ charCount: count }),
  setReplyCharCount: (count) => set({ replyCharCount: count }),

  startEditing: (commentId, text) =>
    set({
      isEdit: true,
      editCommentId: commentId,
      commentText: text,
      charCount: text.length,
      isReply: false,
      isReplyEdit: false,
      activeReplyCommentId: null,
      replyText: '',
      editReplyId: '',
    }),

  startReplyEditing: (replyId, text) =>
    set({
      isReplyEdit: true,
      editReplyId: replyId,
      replyText: text,
      replyCharCount: text.length,
      isEdit: false,
      isReply: false,
      editCommentId: '',
      activeReplyCommentId: null,
    }),

  startReplying: (commentId) =>
    set({
      isReply: true,
      activeReplyCommentId: commentId,
      isEdit: false,
      isReplyEdit: false,
      editCommentId: '',
      editReplyId: '',
      replyText: '',
      replyCharCount: 0,
    }),

  cancelReply: () =>
    set({
      isReply: false,
      activeReplyCommentId: null,
      replyText: '',
      replyCharCount: 0,
    }),

  resetReply: () =>
    set({
      replyText: '',
      isReplyEdit: false,
      editReplyId: '',
      replyCharCount: 0,
    }),

  setCurrentPostId: (postId) =>
    set((state) => {
      if (state.currentPostId !== postId) {
        return {
          currentPostId: postId,
          isEdit: false,
          isReply: false,
          isReplyEdit: false,
          activeReplyCommentId: null,
          editCommentId: '',
          editReplyId: '',
          commentText: '',
          replyText: '',
          charCount: 0,
          replyCharCount: 0,
        };
      }
      return { currentPostId: postId };
    }),

  reset: () =>
    set({
      commentText: '',
      isEdit: false,
      editCommentId: '',
      charCount: 0,
    }),
}));

export default useAddCommentStore;
