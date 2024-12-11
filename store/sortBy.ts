import { create } from 'zustand';

interface SortByState {
  sortBy: Record<string, 'latest' | 'earliest'>;
  setSortBy: (username: string, value: 'latest' | 'earliest') => void;
  resetSortBy: (username: string) => void;
}

const useSortBy = create<SortByState>((set) => ({
  sortBy: {},
  setSortBy: (username, value) =>
    set((state) => ({
      sortBy: {
        ...state.sortBy,
        [username]: value,
      },
    })),
  resetSortBy: (username) =>
    set((state) => {
      const newSortBy = { ...state.sortBy };
      delete newSortBy[username];
      return { sortBy: newSortBy };
    }),
}));

export default useSortBy;
