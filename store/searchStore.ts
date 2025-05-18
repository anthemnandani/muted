import { type SearchTab } from '@/lib/types';
import { create } from 'zustand';

interface SearchStore {
  activeTab: SearchTab;
  setActiveTab: (tab: SearchTab) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  activeTab: 'top',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isSearchOpen: false,
  setIsSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
}));
