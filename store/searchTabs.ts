import { type SearchTab } from '@/lib/types';
import { create } from 'zustand';

interface SearchTabState {
  activeTab: SearchTab;
  setActiveTab: (tab: SearchTab) => void;
}

export const useSearchTabStore = create<SearchTabState>((set) => ({
  activeTab: 'top',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
