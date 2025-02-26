import { create } from 'zustand';

type ProfileVideoPlayerStore = {
  playingVideoId: string | null;
  setPlayingVideoId: (id: string | null) => void;
};

export const useProfileVideoPlayer = create<ProfileVideoPlayerStore>((set) => ({
  playingVideoId: null,
  setPlayingVideoId: (id) => set({ playingVideoId: id }),
}));
