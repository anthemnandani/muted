import { create } from 'zustand';

interface BlockedUsersState {
  blockedUsers: string[];
  isUserBlocked: (userId: string) => boolean;
  addBlockedUser: (userId: string) => void;
  removeBlockedUser: (userId: string) => void;
  setInitialBlockedUsers: (userIds: string[]) => void;
}

export const useBlockedUsers = create<BlockedUsersState>((set, get) => ({
  blockedUsers: [],
  isUserBlocked: (userId: string) => get().blockedUsers.includes(userId),
  addBlockedUser: (userId: string) =>
    set((state) => ({
      blockedUsers: [...state.blockedUsers, userId],
    })),
  removeBlockedUser: (userId: string) =>
    set((state) => ({
      blockedUsers: state.blockedUsers.filter((id) => id !== userId),
    })),
  setInitialBlockedUsers: (userIds: string[]) => set({ blockedUsers: userIds }),
}));
