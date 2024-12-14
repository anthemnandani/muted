import { create } from 'zustand';

interface MutedUsersState {
  mutedUsers: Set<string>;
  muteUser: (userId: string) => void;
  unmuteUser: (userId: string) => void;
  isMutedUser: (userId: string) => boolean;
}

export const useMutedUsers = create<MutedUsersState>((set, get) => ({
  mutedUsers: new Set<string>(),
  muteUser: (userId: string) =>
    set((state) => ({
      mutedUsers: new Set(state.mutedUsers).add(userId),
    })),
  unmuteUser: (userId: string) =>
    set((state) => {
      const newSet = new Set(state.mutedUsers);
      newSet.delete(userId);
      return { mutedUsers: newSet };
    }),
  isMutedUser: (userId: string) => get().mutedUsers.has(userId),
}));
