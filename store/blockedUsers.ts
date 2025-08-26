import { create } from 'zustand';

interface BlockedUsersState {
  isOpen: boolean;
  isLoading: boolean;
  blockedUsers: string[];
  isUserBlocked: (userId: string) => boolean;
  addBlockedUser: (userId: string) => void;
  removeBlockedUser: (userId: string) => void;
  setIsOpen: (isOpen: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setInitialBlockedUsers: (userIds: string[]) => void;
}

export const useBlockedUsers = create<BlockedUsersState>((set, get) => ({
  isOpen: false,
  isLoading: false,
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
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  setInitialBlockedUsers: (userIds: string[]) => set({ blockedUsers: userIds }),
}));
