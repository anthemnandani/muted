import { create } from 'zustand';

type FollowUserStore = {
  follows: { [key: string]: boolean };
  toggleFollow: (authorId: string) => void;
};

const useFollowUserStore = create<FollowUserStore>((set) => ({
  follows: {},
  toggleFollow: (authorId) =>
    set((state) => ({
      follows: {
        ...state.follows,
        [authorId]: !state.follows[authorId],
      },
    })),
}));

export default useFollowUserStore;
