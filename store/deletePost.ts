import { create } from 'zustand';

interface ToggleState {
  openDeleteDialog: boolean;
  setOpenDeleteDialog: (open: boolean) => void;
}

const useDeletePostStore = create<ToggleState>((set) => ({
  openDeleteDialog: false,
  setOpenDeleteDialog: (open) => set({ openDeleteDialog: open }),
}));

export default useDeletePostStore;
