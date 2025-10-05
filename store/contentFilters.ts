import type { ContentType, StatusFilter } from '@/lib/types';
import { create } from 'zustand';

interface ContentFiltersProps {
  search: string;
  type: ContentType;
  status: StatusFilter;
  setSearch: (search: string) => void;
  setType: (type: ContentType) => void;
  setStatus: (status: StatusFilter) => void;
  reset: () => void;
}

export const useContentFiltesrStore = create<ContentFiltersProps>((set) => ({
  search: '',
  type: 'ALL',
  status: 'ALL',
  setSearch: (search) => set({ search }),
  setType: (type) => set({ type }),
  setStatus: (status) => set({ status }),
  reset: () => set({ search: '', type: 'ALL', status: 'ALL' }),
}));
