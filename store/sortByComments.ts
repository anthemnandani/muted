import { create } from 'zustand';
import { SortBy } from '@/lib/types';
interface SortByCommentsState {
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  reset: () => void;
}

const useSortByComments = create<SortByCommentsState>((set) => ({
  sortBy: 'OLDEST',
  setSortBy: (sortBy) => set({ sortBy }),
  reset: () => set({ sortBy: 'OLDEST' }),
}));

export default useSortByComments;
