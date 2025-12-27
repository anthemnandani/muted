import type {
  NavigationType,
  ParentPostProps,
  ProfileFilter,
} from '@/lib/types';
import { create } from 'zustand';

interface PostStore {
  isOpen: boolean;
  currentPostId: string | null;
  currentIndex: number;
  profileUsername: string | null;
  postType: NavigationType;
  collectionId: string | null;
  selectedFilter: ProfileFilter;
  initialized: boolean;
  postList: ParentPostProps[];
  hasMorePosts: boolean;
  isFetchingMore: boolean;

  setIsOpen: (open: boolean) => void;
  setCurrentPostId: (postId: string | null) => void;
  setCurrentIndex: (index: number) => void;
  setProfileUsername: (username: string | null) => void;
  setPostType: (type: NavigationType) => void;
  setCollectionId: (collectionId: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  setSelectedFilter: (filter: ProfileFilter) => void;
  setPostList: (posts: ParentPostProps[]) => void;
  setPagination: (hasMore: boolean, loadMore: () => void) => void;
  setIsFetchingMore: (isFetching: boolean) => void;
  loadMorePosts: () => Promise<void> | void;
  reset: () => void;
}

const usePostStore = create<PostStore>()((set) => ({
  isOpen: false,
  currentPostId: null,
  currentIndex: 0,
  profileUsername: null,
  postType: 'post',
  collectionId: null,
  initialized: false,
  selectedFilter: 'LATEST',
  hasMorePosts: false,
  isFetchingMore: false,
  postList: [],

  setIsOpen: (isOpen) => set({ isOpen }),
  setCurrentPostId: (postId) => set({ currentPostId: postId }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  setProfileUsername: (username) => set({ profileUsername: username }),
  setSelectedFilter: (filter) => set({ selectedFilter: filter }),
  setPostType: (type) => set({ postType: type }),
  setCollectionId: (collectionId) => set({ collectionId }),
  setInitialized: (initialized) => set({ initialized }),
  setPostList: (posts) => set({ postList: posts }),
  setPagination: (hasMore, loadMore) =>
    set({ hasMorePosts: hasMore, loadMorePosts: loadMore }),
  setIsFetchingMore: (isFetching) => set({ isFetchingMore: isFetching }),
  loadMorePosts: () => {},
  reset: () =>
    set({
      currentPostId: null,
      currentIndex: 0,
      profileUsername: null,
      postType: 'post',
      collectionId: null,
      initialized: false,
      selectedFilter: 'LATEST',
      hasMorePosts: false,
      isFetchingMore: false,
      postList: [],
    }),
}));

export default usePostStore;
