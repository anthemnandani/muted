import { create } from 'zustand';

interface BlockedUsersState {
  isOpen: boolean;
  blockedUsers: string[];
  isUserBlocked: (userId: string) => boolean;
  addBlockedUser: (userId: string) => void;
  removeBlockedUser: (userId: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}

export const useBlockedUsers = create<BlockedUsersState>((set, get) => ({
  isOpen: false,
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
  setIsOpen: (isOpen: boolean) => set({ isOpen }),
}));
