'use client';

import { create } from 'zustand';

export type ReportViewType = 'categories' | 'level1' | 'level2' | 'details';

export type ReportState = {
  isOpen: boolean;
  categoryId: string | null;
  subcategoryId: string | null;
  detailId: string | null;
  currentView: ReportViewType;
  reason: string | null;
  currentPostId: string | null;
  additionalInfo: string | null;

  setOpen: (isOpen: boolean) => void;
  setCategoryId: (id: string | null) => void;
  setSubcategoryId: (id: string | null) => void;
  setDetailId: (id: string | null) => void;
  setCurrentView: (view: ReportViewType) => void;
  setReason: (reason: string | null) => void;
  setCurrentPostId: (postId: string) => void;
  setAdditionalInfo: (info: string | null) => void;
  reset: () => void;
};

export const useReportStore = create<ReportState>()((set) => ({
  isOpen: false,
  categoryId: null,
  subcategoryId: null,
  detailId: null,
  currentView: 'categories',
  reason: null,
  currentPostId: null,
  additionalInfo: null,

  setOpen: (isOpen) => set({ isOpen }),
  setCategoryId: (id) => set({ categoryId: id }),
  setSubcategoryId: (id) => set({ subcategoryId: id }),
  setDetailId: (id) => set({ detailId: id }),
  setCurrentView: (view) => set({ currentView: view }),
  setReason: (reason) => set({ reason }),
  setCurrentPostId: (postId) => set({ currentPostId: postId }),
  setAdditionalInfo: (info) => set({ additionalInfo: info }),

  reset: () =>
    set({
      categoryId: null,
      subcategoryId: null,
      detailId: null,
      currentView: 'categories',
      reason: null,
      additionalInfo: null,
    }),
}));
