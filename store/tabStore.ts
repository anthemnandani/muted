import { type Tab, type TextSubTab } from '@/lib/types';
import { create } from 'zustand';

interface TabState {
  activeTab: Tab;
  textSubTab: TextSubTab;
  setActiveTab: (tab: Tab) => void;
  setTextSubTab: (subTab: TextSubTab) => void;
}

export const useTabStore = create<TabState>((set) => ({
  activeTab: 'posts',
  textSubTab: 'threads',
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTextSubTab: (subTab) => set({ textSubTab: subTab }),
}));
