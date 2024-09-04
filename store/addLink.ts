import { create } from 'zustand';

interface ToggleState {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
  link: string;
  setLink: (bio: string) => void;
  isDone: boolean;
  setIsDone: (isDone: boolean) => void;
}

const useAddLink = create<ToggleState>((set) => ({
  openDialog: false,
  setOpenDialog: (open) => set({ openDialog: open }),
  link: '',
  setLink: (link) => set({ link }),
  isDone: false,
  setIsDone: (isDone) => set({ isDone }),
}));

export default useAddLink;
