import type { GiphyMedia, MediaFile } from '@/lib/types';
import { create } from 'zustand';

interface FileStoreState {
  mediaFiles: MediaFile[];
  setMediaFiles: (files: MediaFile[]) => void;
  threadMedia: MediaFile | GiphyMedia | null;
  setThreadMedia: (media: MediaFile | GiphyMedia | null) => void;
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
  setThreadMedia: (media) => {
    set((state) => {
      const oldMedia = state.threadMedia;
      if (
        oldMedia &&
        'preview' in oldMedia &&
        oldMedia.preview.startsWith('blob:')
      ) {
        URL.revokeObjectURL(oldMedia.preview);
      }
      return { threadMedia: media };
    });
  },
  updateMediaFile: (id, updates) => {
    const { mediaFiles } = get();
    const updatedFiles = mediaFiles.map((file) =>
      file.id === id ? { ...file, ...updates } : file
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
