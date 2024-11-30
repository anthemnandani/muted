import type { ParentPostInfo } from '@/lib/types';
import { create } from 'zustand';

interface ToggleState {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  replyPostInfo: ParentPostInfo | null;
  setReplyPostInfo: (reply: ParentPostInfo | null) => void;
  quoteInfo:
    | (Pick<ParentPostInfo, 'id' | 'text' | 'author'> & { createdAt?: Date })
    | null;
  setQuoteInfo: (
    quote:
      | (Pick<ParentPostInfo, 'id' | 'text' | 'author'> & { createdAt?: Date })
      | null
  ) => void;
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
