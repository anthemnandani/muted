import { create } from 'zustand';

interface VideoPlayerStore {
  currentlyPlaying: string | null;
  isMuted: boolean;
  timestamps: Record<string, number>;
  setCurrentlyPlaying: (videoId: string | null) => void;
  setIsMuted: (muted: boolean) => void;
  setTimestamp: (videoId: string, time: number) => void;
}

const useVideoPlayer = create<VideoPlayerStore>((set) => ({
  currentlyPlaying: null,
  isMuted: true,
  timestamps: {},
  setCurrentlyPlaying: (videoId) => set({ currentlyPlaying: videoId }),
  setIsMuted: (muted) => set({ isMuted: muted }),
  setTimestamp: (videoId, time) =>
    set((state) => ({
      timestamps: { ...state.timestamps, [videoId]: time },
    })),
}));

export default useVideoPlayer;
