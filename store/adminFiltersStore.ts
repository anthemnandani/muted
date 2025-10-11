import type {
  ContentType,
  PostStatusFilter,
  UserStatusFilter,
} from '@/lib/types';
import { create } from 'zustand';

interface AdminFiltersProps {
  postSearch: string;
  userSearch: string;
  postType: ContentType;
  postStatus: PostStatusFilter;
  userStatus: UserStatusFilter;
  setPostSearch: (search: string) => void;
  setUserSearch: (search: string) => void;
  setPostType: (type: ContentType) => void;
  setPostStatus: (status: PostStatusFilter) => void;
  setUserStatus: (status: UserStatusFilter) => void;
  resetPostFilters: () => void;
  resetUserFilters: () => void;
}

export const useAdminFiltersStore = create<AdminFiltersProps>((set) => ({
  postSearch: '',
  userSearch: '',
  postType: 'ALL',
  postStatus: 'ALL',
  userStatus: 'ALL',
  setPostSearch: (postSearch) => set({ postSearch }),
  setUserSearch: (userSearch) => set({ userSearch }),
  setPostType: (postType) => set({ postType }),
  setPostStatus: (postStatus) => set({ postStatus }),
  setUserStatus: (userStatus) => set({ userStatus }),
  resetPostFilters: () =>
    set({ postSearch: '', postType: 'ALL', postStatus: 'ALL' }),
  resetUserFilters: () => set({ userSearch: '', userStatus: 'ALL' }),
}));
