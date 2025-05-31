import { type NotificationTab } from '@/lib/types';
import { create } from 'zustand';

interface NotificationStore {
  activeTab: NotificationTab;
  setActiveTab: (tab: NotificationTab) => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (isOpen: boolean) => void;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  resetUnreadCount: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  activeTab: 'all',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isNotificationOpen: false,
  setIsNotificationOpen: (isOpen) => {
    set({ isNotificationOpen: isOpen });
  },
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  resetUnreadCount: () => set({ unreadCount: 0 }),
}));
