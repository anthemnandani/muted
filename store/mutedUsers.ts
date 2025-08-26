import { create } from 'zustand';

interface MutedUsersState {
  mutedUsers: string[];
  muteUser: (userId: string) => void;
  unmuteUser: (userId: string) => void;
  isMutedUser: (userId: string) => boolean;
  setInitialMutedUsers: (userIds: string[]) => void;
}

export const useMutedUsers = create<MutedUsersState>((set, get) => ({
  mutedUsers: [],
  muteUser: (userId: string) =>
    set((state) => ({
      mutedUsers: [...state.mutedUsers, userId],
    })),
  unmuteUser: (userId: string) =>
    set((state) => ({
      mutedUsers: state.mutedUsers.filter((id) => id !== userId),
    })),
  isMutedUser: (userId: string) => get().mutedUsers.includes(userId),
  setInitialMutedUsers: (userIds: string[]) => set({ mutedUsers: userIds }),
}));
