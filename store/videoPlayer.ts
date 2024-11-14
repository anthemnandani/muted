import { create } from 'zustand';

interface VideoPlayerStore {
  currentlyPlaying: string | null;
  isMuted: boolean;
  setCurrentlyPlaying: (videoId: string | null) => void;
  setIsMuted: (muted: boolean) => void;
}

const useVideoPlayer = create<VideoPlayerStore>((set) => ({
  currentlyPlaying: null,
  isMuted: true,
  setCurrentlyPlaying: (videoId) => set({ currentlyPlaying: videoId }),
  setIsMuted: (muted) => set({ isMuted: muted }),
}));

export default useVideoPlayer;
