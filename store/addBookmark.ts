import { create } from 'zustand';

interface ToggleState {
  openBookmarkDialog: string | null;
  setOpenBookmarkDialog: (threadId: string | null) => void;
}

const useAddBookmark = create<ToggleState>((set) => ({
  openBookmarkDialog: null,
  setOpenBookmarkDialog: (threadId) => set({ openBookmarkDialog: threadId }),
}));

export default useAddBookmark;
