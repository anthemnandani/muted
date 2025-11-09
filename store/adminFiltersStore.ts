import type {
  ContentType,
  PostStatusFilter,
  UserStatusFilter,
  AppealStatusFilter,
  ReportStatusFilter,
} from '@/lib/types';
import { create } from 'zustand';

interface AdminFiltersProps {
  postSearch: string;
  userSearch: string;
  appealSearch: string;
  reportSearch: string;
  postType: ContentType;
  postStatus: PostStatusFilter;
  userStatus: UserStatusFilter;
  appealStatus: AppealStatusFilter;
  reportStatus: ReportStatusFilter;
  setPostSearch: (search: string) => void;
  setUserSearch: (search: string) => void;
  setAppealSearch: (search: string) => void;
  setReportSearch: (search: string) => void;
  setPostType: (type: ContentType) => void;
  setPostStatus: (status: PostStatusFilter) => void;
  setUserStatus: (status: UserStatusFilter) => void;
  setAppealStatus: (status: AppealStatusFilter) => void;
  setReportStatus: (status: ReportStatusFilter) => void;
  resetPostFilters: () => void;
  resetUserFilters: () => void;
  resetAppealFilters: () => void;
  resetReportFilters: () => void;
}

export const useAdminFiltersStore = create<AdminFiltersProps>((set) => ({
  postSearch: '',
  userSearch: '',
  appealSearch: '',
  reportSearch: '',
  postType: 'ALL',
  postStatus: 'ALL',
  userStatus: 'ALL',
  appealStatus: 'ALL',
  reportStatus: 'ALL',
  setPostSearch: (postSearch) => set({ postSearch }),
  setUserSearch: (userSearch) => set({ userSearch }),
  setAppealSearch: (appealSearch) => set({ appealSearch }),
  setReportSearch: (reportSearch) => set({ reportSearch }),
  setPostType: (postType) => set({ postType }),
  setPostStatus: (postStatus) => set({ postStatus }),
  setUserStatus: (userStatus) => set({ userStatus }),
  setAppealStatus: (appealStatus) => set({ appealStatus }),
  setReportStatus: (reportStatus) => set({ reportStatus }),
  resetPostFilters: () =>
    set({ postSearch: '', postType: 'ALL', postStatus: 'ALL' }),
  resetUserFilters: () => set({ userSearch: '', userStatus: 'ALL' }),
  resetAppealFilters: () => set({ appealSearch: '', appealStatus: 'ALL' }),
  resetReportFilters: () => set({ reportSearch: '', reportStatus: 'ALL' }),
}));
