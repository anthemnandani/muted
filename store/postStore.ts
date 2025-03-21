import type { ProfileFilter } from '@/lib/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PostStore {
  currentPostId: string | null;
  currentIndex: number;
  profileUsername: string | null;
  postType: 'post' | 'repost' | 'liked' | 'collection';
  collectionId: string | null;
  selectedFilter: ProfileFilter;
  initialized: boolean;

  setCurrentPostId: (postId: string | null) => void;
  setCurrentIndex: (index: number) => void;
  setProfileUsername: (username: string | null) => void;
  setPostType: (type: 'post' | 'repost' | 'liked' | 'collection') => void;
  setCollectionId: (collectionId: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  setSelectedFilter: (filter: ProfileFilter) => void;
  reset: () => void;
}

const usePostStore = create<PostStore>()(
  persist(
    (set) => ({
      currentPostId: null,
      currentIndex: 0,
      profileUsername: null,
      postType: 'post',
      collectionId: null,
      initialized: false,
      selectedFilter: 'LATEST',
      setCurrentPostId: (postId) => set({ currentPostId: postId }),
      setCurrentIndex: (index) => set({ currentIndex: index }),
      setProfileUsername: (username) => set({ profileUsername: username }),
      setSelectedFilter: (filter) => set({ selectedFilter: filter }),
      setPostType: (type) => set({ postType: type }),
      setCollectionId: (collectionId) => set({ collectionId }),
      setInitialized: (initialized) => set({ initialized }),
      reset: () =>
        set({
          currentPostId: null,
          currentIndex: 0,
          profileUsername: null,
          postType: 'post',
          collectionId: null,
          initialized: false,
        }),
    }),
    {
      name: 'post-store',
    }
  )
);

export default usePostStore;
