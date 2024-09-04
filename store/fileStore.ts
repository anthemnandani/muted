import { create } from 'zustand';

interface ToggleState {
  files: File[];
  setFiles: (files: File[]) => void;
}

const useFileStore = create<ToggleState>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
}));

export default useFileStore;
