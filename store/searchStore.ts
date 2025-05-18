import { type SearchTab } from '@/lib/types';
import { create } from 'zustand';

interface SearchStore {
  activeTab: SearchTab;
  setActiveTab: (tab: SearchTab) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  activeTab: 'top',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
