import { create } from 'zustand';

interface DeleteDialogState {
  openDeleteDialog: string | null;
  setOpenDeleteDialog: (postId: string | null) => void;
}

const useDeleteBookmark = create<DeleteDialogState>((set) => ({
  openDeleteDialog: null,
  setOpenDeleteDialog: (postId) => set({ openDeleteDialog: postId }),
}));

export default useDeleteBookmark;
