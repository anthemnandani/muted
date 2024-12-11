import { create } from 'zustand';

interface ToggleState {
  sortBy: 'latest' | 'earliest';
  setSortBy: (sortBy: 'latest' | 'earliest') => void;
}

const useSortBy = create<ToggleState>((set) => ({
  sortBy: 'latest',
  setSortBy: (sortBy) => set({ sortBy }),
}));

export default useSortBy;
