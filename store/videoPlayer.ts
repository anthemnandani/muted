import { create } from 'zustand';

interface VideoPlayerStore {
  currentlyPlaying: string | null;
  setCurrentlyPlaying: (videoId: string | null) => void;
}

const useVideoPlayer = create<VideoPlayerStore>((set) => ({
  currentlyPlaying: null,
  setCurrentlyPlaying: (videoId) => set({ currentlyPlaying: videoId }),
}));

export default useVideoPlayer;
