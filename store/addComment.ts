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
  replyToUsername: string | null;

  setCommentText: (text: string) => void;
  setReplyText: (text: string) => void;
  startEditing: (commentId: string, text: string) => void;
  startReplyEditing: (replyId: string, text: string) => void;
  startReplying: (commentId: string, username?: string | null) => void;
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
  replyToUsername: null,

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
      replyToUsername: null,
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
      replyToUsername: null,
    }),

  startReplying: (commentId, username = null) => {
    const initialText = username ? `@${username} ` : '';

    return set((state) => ({
      isReply: true,
      activeReplyCommentId: commentId,
      isEdit: false,
      isReplyEdit: false,
      editCommentId: '',
      editReplyId: '',
      replyText: initialText,
      replyCharCount: initialText.length,
      replyToUsername: username,
    }));
  },

  cancelReply: () =>
    set({
      isReply: false,
      activeReplyCommentId: null,
      replyText: '',
      replyCharCount: 0,
      replyToUsername: null,
    }),

  resetReply: () =>
    set({
      replyText: '',
      isReplyEdit: false,
      editReplyId: '',
      replyCharCount: 0,
      activeReplyCommentId: null,
      isReply: false,
      replyToUsername: null,
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
          replyToUsername: null,
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
      replyToUsername: null,
    }),
}));

export default useAddCommentStore;
