import { MediaFile } from '@/lib/types';
import { create } from 'zustand';

interface FileStoreState {
  mediaFiles: MediaFile[];
  setMediaFiles: (files: MediaFile[]) => void;
  profileFiles: File | null;
  setProfileFiles: (file: File | null) => void;
  selectedMediaFiles: MediaFile[];
  isSelectedImageSafe: boolean;
  setIsSelectedImageSafe: (isSafe: boolean) => void;
  setSelectedMediaFiles: (files: MediaFile[]) => void;
}

const useFileStore = create<FileStoreState>((set) => ({
  mediaFiles: [],
  setMediaFiles: (files) => set({ mediaFiles: files }),
  profileFiles: null,
  setProfileFiles: (file) => set({ profileFiles: file }),
  selectedMediaFiles: [],
  isSelectedImageSafe: true,
  setSelectedMediaFiles: (files) => set({ selectedMediaFiles: files }),
  setIsSelectedImageSafe: (isSafe) => set({ isSelectedImageSafe: isSafe }),
}));

export default useFileStore;
