import { type NotificationTab } from '@/lib/types';
import { create } from 'zustand';

export type NotificationMode = 'ALL' | 'FOLLOW_REQUESTS';

interface NotificationStore {
  activeTab: NotificationTab;
  setActiveTab: (tab: NotificationTab) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (isOpen: boolean) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  followRequestsCount: number;
  setFollowRequestsCount: (count: number) => void;
  resetUnreadCount: () => void;
  mode: NotificationMode;
  setMode: (mode: NotificationMode) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  activeTab: 'all',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isNotificationOpen: false,
  setIsNotificationOpen: (isOpen) => {
    set({ isNotificationOpen: isOpen });
  },
  mode: 'ALL',
  setMode: (mode) => set({ mode }),
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  followRequestsCount: 0,
  setFollowRequestsCount: (count) => set({ followRequestsCount: count }),
  resetUnreadCount: () => set({ unreadCount: 0 }),
}));
