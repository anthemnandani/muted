import { create } from 'zustand';
import { SortBy } from '@/lib/types';
interface SortByCommentsState {
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
}

const useSortByComments = create<SortByCommentsState>((set) => ({
  sortBy: 'LATEST',
  setSortBy: (sortBy) => set({ sortBy }),
}));

export default useSortByComments;
