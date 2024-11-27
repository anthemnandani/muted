import { IGif } from '@giphy/js-types';
import { create } from 'zustand';

type MediaFile = File | IGif;

interface FileStoreState {
  files: File[];
  setFiles: (files: File[]) => void;
  selectedFile: MediaFile[];
  isSelectedImageSafe: boolean;
  setIsSelectedImageSafe: (isSafe: boolean) => void;
  setSelectedFile: (file: MediaFile[]) => void;
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
