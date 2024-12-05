import type { ReplyPostInfo, ParentPostInfo } from '@/lib/types';
import { create } from 'zustand';

interface ToggleState {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  replyPostInfo: ReplyPostInfo | null;
  setReplyPostInfo: (reply: ReplyPostInfo | null) => void;
  quoteInfo: ParentPostInfo | null;
  setQuoteInfo: (quote: ParentPostInfo | null) => void;
  editPostInfo: { id: string; text: string } | null;
  setEditPostInfo: (edit: { id: string; text: string } | null) => void;
}

const useDialog = create<ToggleState>((set) => ({
  openDialog: false,
  setOpenDialog: (open) => set({ openDialog: open }),
  replyPostInfo: null,
  setReplyPostInfo: (reply) => set({ replyPostInfo: reply }),
  quoteInfo: null,
  setQuoteInfo: (quote) => set({ quoteInfo: quote }),
  editPostInfo: null,
  setEditPostInfo: (edit) => set({ editPostInfo: edit }),
}));

export default useDialog;
