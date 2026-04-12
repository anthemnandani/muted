import type { SortFilterState } from '@/lib/types';
import { create } from 'zustand';

export type InteractionTab = 'likes' | 'comments' | 'reposts';
export type ContentType = 'posts' | 'threads';
export type MediaTab = 'posts' | 'photos' | 'videos' | 'threads';

const DEFAULT_SORT_FILTER: SortFilterState = {
  sortOrder: 'newest',
  dateFilter: { startDate: null, endDate: null },
};

interface ActivityState {
  tab: InteractionTab;
  contentType: ContentType;
  isSelecting: boolean;
  selectedIds: Set<string>;
  isConfirmDialogOpen: boolean;
  sortFilter: SortFilterState;
  mediaTab: MediaTab;
  isSortFilterOpen: boolean;

  setTab: (tab: InteractionTab) => void;
  setContentType: (contentType: ContentType) => void;
  setMediaTab: (tab: MediaTab) => void;
  enterSelecting: () => void;
  exitSelecting: () => void;
  toggleSelect: (id: string) => void;
  setSelectedIds: (ids: Set<string>) => void;
  setIsConfirmDialogOpen: (isOpen: boolean) => void;
  setSortFilter: (filter: SortFilterState) => void;
  setIsSortFilterOpen: (isOpen: boolean) => void;
  resetActivityState: () => void;
}

export const useActivityStore = create<ActivityState>((set) => ({
  tab: 'likes',
  contentType: 'posts',
  mediaTab: 'posts',
  isSelecting: false,
  selectedIds: new Set(),
  isConfirmDialogOpen: false,
  sortFilter: DEFAULT_SORT_FILTER,
  isSortFilterOpen: false,

  setTab: (tab) =>
    set((state) => ({
      tab,
      isSelecting: false,
      selectedIds: new Set(),
      isConfirmDialogOpen: false,
      sortFilter: DEFAULT_SORT_FILTER,
    })),

  setMediaTab: (mediaTab) =>
    set({
      mediaTab,
      isSelecting: false,
      selectedIds: new Set(),
      isConfirmDialogOpen: false,
      sortFilter: DEFAULT_SORT_FILTER,
    }),

  setContentType: (contentType) =>
    set({
      contentType,
      isSelecting: false,
      selectedIds: new Set(),
      isConfirmDialogOpen: false,
    }),

  enterSelecting: () =>
    set({
      isSelecting: true,
      selectedIds: new Set(),
    }),

  exitSelecting: () =>
    set({
      isSelecting: false,
      selectedIds: new Set(),
      isConfirmDialogOpen: false,
    }),

  toggleSelect: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedIds: next };
    }),

  setSelectedIds: (selectedIds) => set({ selectedIds }),

  setIsConfirmDialogOpen: (isConfirmDialogOpen) => set({ isConfirmDialogOpen }),

  setSortFilter: (sortFilter) =>
    set({
      sortFilter,
      isSelecting: false,
      selectedIds: new Set(),
    }),

  setIsSortFilterOpen: (isSortFilterOpen) => set({ isSortFilterOpen }),

  resetActivityState: () =>
    set({
      isSelecting: false,
      selectedIds: new Set(),
      isConfirmDialogOpen: false,
      isSortFilterOpen: false,
      sortFilter: DEFAULT_SORT_FILTER,
    }),
}));
