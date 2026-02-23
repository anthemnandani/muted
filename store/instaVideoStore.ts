import { create } from 'zustand';

interface InstaVideoStore {
  currentlyPlayingFeed: string | null;
  setCurrentlyPlayingFeed: (videoId: string | null) => void;
}

const useInstaVideoStore = create<InstaVideoStore>((set) => ({
  currentlyPlayingFeed: null,
  setCurrentlyPlayingFeed: (videoId) => set({ currentlyPlayingFeed: videoId }),
}));

export default useInstaVideoStore;
