import type { ParentPostProps, ProfileFilter } from '@/lib/types';
import { create } from 'zustand';

interface PostStore {
  isOpen: boolean;
  currentPostId: string | null;
  currentIndex: number;
  selectedFilter: ProfileFilter;
  postList: ParentPostProps[];
  hasMorePosts: boolean;
  isFetchingMore: boolean;

  setIsOpen: (open: boolean) => void;
  setCurrentPostId: (postId: string | null) => void;
  setCurrentIndex: (index: number) => void;
  setSelectedFilter: (filter: ProfileFilter) => void;
  setPostList: (posts: ParentPostProps[]) => void;
  setPagination: (hasMore: boolean, loadMore: () => void) => void;
  setIsFetchingMore: (isFetching: boolean) => void;
  loadMorePosts: () => Promise<void> | void;
  closeDialog: () => void;
  reset: () => void;
}

const usePostStore = create<PostStore>()((set) => ({
  isOpen: false,
  currentPostId: null,
  currentIndex: 0,
  selectedFilter: 'LATEST',
  hasMorePosts: false,
  isFetchingMore: false,
  postList: [],

  setIsOpen: (isOpen) => set({ isOpen }),
  setCurrentPostId: (postId) => set({ currentPostId: postId }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  setSelectedFilter: (filter) => set({ selectedFilter: filter }),
  setPostList: (posts) => set({ postList: posts }),
  setPagination: (hasMore, loadMore) =>
    set({ hasMorePosts: hasMore, loadMorePosts: loadMore }),
  setIsFetchingMore: (isFetching) => set({ isFetchingMore: isFetching }),
  loadMorePosts: () => {},
  closeDialog: () =>
    set({
      isOpen: false,
      currentPostId: null,
    }),
  reset: () =>
    set({
      isOpen: false,
      currentPostId: null,
      currentIndex: 0,
      hasMorePosts: false,
      isFetchingMore: false,
      postList: [],
    }),
}));

export default usePostStore;
