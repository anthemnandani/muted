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
  currentUserId: string | null;
  additionalInfo: string | null;
  targetUserId: string | null;

  setOpen: (isOpen: boolean) => void;
  setCategoryId: (id: string | null) => void;
  setSubcategoryId: (id: string | null) => void;
  setDetailId: (id: string | null) => void;
  setCurrentView: (view: ReportViewType) => void;
  setReason: (reason: string | null) => void;
  setCurrentPostId: (postId: string | null) => void;
  setCurrentUserId: (userId: string | null) => void;
  setAdditionalInfo: (info: string | null) => void;
  setTargetUserId: (userId: string | null) => void;
  openPostReport: (postId: string) => void;
  openUserReport: (userId: string) => void;
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
  currentUserId: null,
  additionalInfo: null,
  targetUserId: null,

  setOpen: (isOpen) => set({ isOpen }),
  setCategoryId: (id) => set({ categoryId: id }),
  setSubcategoryId: (id) => set({ subcategoryId: id }),
  setDetailId: (id) => set({ detailId: id }),
  setCurrentView: (view) => set({ currentView: view }),
  setReason: (reason) => set({ reason }),
  setCurrentPostId: (postId) => set({ currentPostId: postId }),
  setCurrentUserId: (userId) => set({ currentUserId: userId }),
  setAdditionalInfo: (info) => set({ additionalInfo: info }),
  setTargetUserId: (userId) => set({ targetUserId: userId }),

  openPostReport: (postId) =>
    set({
      isOpen: true,
      currentPostId: postId,
      currentUserId: null,
      currentView: 'categories',
      categoryId: null,
      subcategoryId: null,
      detailId: null,
      reason: null,
    }),

  openUserReport: (userId) =>
    set({
      isOpen: true,
      currentUserId: userId,
      currentPostId: null,
      currentView: 'categories',
      categoryId: null,
      subcategoryId: null,
      detailId: null,
      reason: null,
    }),

  reset: () =>
    set({
      categoryId: null,
      subcategoryId: null,
      detailId: null,
      currentView: 'categories',
      reason: null,
      currentPostId: null,
      currentUserId: null,
      additionalInfo: null,
      targetUserId: null,
    }),
}));
