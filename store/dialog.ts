import { create } from 'zustand';

interface ToggleState {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  // Todo: change type
  replyPostInfo: any | null;
  setReplyPostInfo: (reply: any | null) => void;
  quoteInfo:
    | (Pick<any, 'id' | 'text' | 'author'> & { createdAt?: Date })
    | null;
  setQuoteInfo: (
    quote: (Pick<any, 'id' | 'text' | 'author'> & { createdAt?: Date }) | null
  ) => void;
}

const useDialog = create<ToggleState>((set) => ({
  openDialog: false,
  setOpenDialog: (open) => set({ openDialog: open }),
  replyPostInfo: null,
  setReplyPostInfo: (reply) => set({ replyPostInfo: reply }),
  quoteInfo: null,
  setQuoteInfo: (quote) => set({ quoteInfo: quote }),
}));

export default useDialog;
