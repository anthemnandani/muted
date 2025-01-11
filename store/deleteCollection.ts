import { create } from 'zustand';

interface DeleteDialogState {
  openDeleteDialog: string | null;
  setOpenDeleteDialog: (collectionId: string | null) => void;
}

const useDeleteCollection = create<DeleteDialogState>((set) => ({
  openDeleteDialog: null,
  setOpenDeleteDialog: (collectionId) =>
    set({ openDeleteDialog: collectionId }),
}));

export default useDeleteCollection;
