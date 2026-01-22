import type { MediaFile } from '@/lib/types';
import type { IGif } from '@giphy/js-types';
import { create } from 'zustand';

export type ThreadMedia = IGif | MediaFile | null;

interface FileStoreState {
  mediaFiles: MediaFile[];
  setMediaFiles: (files: MediaFile[]) => void;
  threadMedia: ThreadMedia;
  setThreadMedia: (media: ThreadMedia) => void;
  updateMediaFile: (id: string, updates: Partial<MediaFile>) => void;
  profileFile: File | null;
  setProfileFile: (file: File | null) => void;
  selectedMediaFiles: MediaFile[];
  isSelectedImageSafe: boolean;
  setIsSelectedImageSafe: (isSafe: boolean) => void;
  setSelectedMediaFiles: (files: MediaFile[]) => void;
}

const useFileStore = create<FileStoreState>((set, get) => ({
  mediaFiles: [],
  setMediaFiles: (files) => set({ mediaFiles: files }),
  threadMedia: null,
  setThreadMedia: (file) => set({ threadMedia: file }),
  updateMediaFile: (id, updates) => {
    const { mediaFiles } = get();
    const updatedFiles = mediaFiles.map((file) =>
      file.id === id ? { ...file, ...updates } : file,
    );
    set({ mediaFiles: updatedFiles });
  },
  profileFile: null,
  setProfileFile: (file) => set({ profileFile: file }),
  selectedMediaFiles: [],
  isSelectedImageSafe: true,
  setSelectedMediaFiles: (files) => set({ selectedMediaFiles: files }),
  setIsSelectedImageSafe: (isSafe) => set({ isSelectedImageSafe: isSafe }),
}));

export default useFileStore;
