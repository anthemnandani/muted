import { create } from 'zustand';

interface FileStoreState {
  files: File[];
  setFiles: (files: File[]) => void;
  selectedFile: File[];
  isSelectedImageSafe: boolean;
  setIsSelectedImageSafe: (isSafe: boolean) => void;
  setSelectedFile: (file: File[]) => void;
}

const useFileStore = create<FileStoreState>((set) => ({
  files: [],
  setFiles: (files) => set({ files }),
  selectedFile: [],
  isSelectedImageSafe: true,
  setSelectedFile: (files) => set({ selectedFile: files }),
  setIsSelectedImageSafe: (isSafe) => set({ isSelectedImageSafe: isSafe }),
}));

export default useFileStore;
