import type { Tab, TextSubTab, MediaSubTab } from '@/lib/types';
import { create } from 'zustand';

interface TabState {
  activeTab: Tab;
  textSubTab: TextSubTab;
  mediaSubTab: MediaSubTab;
  setActiveTab: (tab: Tab) => void;
  setTextSubTab: (subTab: TextSubTab) => void;
  setMediaSubTab: (subTab: MediaSubTab) => void;
}

export const useTabStore = create<TabState>((set) => ({
  activeTab: 'posts',
  textSubTab: 'threads',
  mediaSubTab: 'all',
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTextSubTab: (subTab) => set({ textSubTab: subTab }),
  setMediaSubTab: (subTab) => set({ mediaSubTab: subTab }),
}));
