import { create } from 'zustand';

interface ToggleState {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  bio: string;
  setBio: (bio: string) => void;
}

const useAddBio = create<ToggleState>((set) => ({
  openDialog: false,
  setOpenDialog: (open) => set({ openDialog: open }),
  bio: '',
  setBio: (bio) => set({ bio }),
}));

export default useAddBio;
