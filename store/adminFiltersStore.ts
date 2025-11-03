import type {
  ContentType,
  PostStatusFilter,
  UserStatusFilter,
  AppealStatusFilter,
} from '@/lib/types';
import { create } from 'zustand';

interface AdminFiltersProps {
  postSearch: string;
  userSearch: string;
  appealSearch: string;
  postType: ContentType;
  postStatus: PostStatusFilter;
  userStatus: UserStatusFilter;
  appealStatus: AppealStatusFilter;
  setPostSearch: (search: string) => void;
  setUserSearch: (search: string) => void;
  setAppealSearch: (search: string) => void;
  setPostType: (type: ContentType) => void;
  setPostStatus: (status: PostStatusFilter) => void;
  setUserStatus: (status: UserStatusFilter) => void;
  setAppealStatus: (status: AppealStatusFilter) => void;
  resetPostFilters: () => void;
  resetUserFilters: () => void;
  resetAppealFilters: () => void;
}

export const useAdminFiltersStore = create<AdminFiltersProps>((set) => ({
  postSearch: '',
  userSearch: '',
  appealSearch: '',
  postType: 'ALL',
  postStatus: 'ALL',
  userStatus: 'ALL',
  appealStatus: 'ALL',
  setPostSearch: (postSearch) => set({ postSearch }),
  setUserSearch: (userSearch) => set({ userSearch }),
  setAppealSearch: (appealSearch) => set({ appealSearch }),
  setPostType: (postType) => set({ postType }),
  setPostStatus: (postStatus) => set({ postStatus }),
  setUserStatus: (userStatus) => set({ userStatus }),
  setAppealStatus: (appealStatus) => set({ appealStatus }),
  resetPostFilters: () =>
    set({ postSearch: '', postType: 'ALL', postStatus: 'ALL' }),
  resetUserFilters: () => set({ userSearch: '', userStatus: 'ALL' }),
  resetAppealFilters: () => set({ appealSearch: '', appealStatus: 'ALL' }),
}));
