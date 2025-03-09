import {
  getPostById,
  getPostNavigationData,
  getLikedPosts,
} from '@/lib/actions/post.actions';
import { NavigationType, ParentPostProps, ProfileFilter } from '@/lib/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface PostStore {
  selectedFilter: ProfileFilter;
  navigationPosts: ParentPostProps[];
  postById: ParentPostProps | null;
  isLoadingPost: boolean;
  isLoadingUserPosts: boolean;
  currentUsername: string | null;
  currentPostIndex: number;
  navigationType: NavigationType;
  setPostById: (
    postId: string,
    username: string,
    type?: NavigationType
  ) => Promise<void>;
  setPostsByUser: (username: string, type: NavigationType) => Promise<void>;
  setCurrentPostIndex: (index: number) => void;
  setSelectedFilter: (filter: ProfileFilter) => void;
  clearStore: () => void;
}

export const usePostStore = create<PostStore>()(
  devtools((set, get) => ({
    navigationPosts: [],
    postById: null,
    currentUsername: null,
    currentPostIndex: 0,
    isLoadingPost: false,
    isLoadingUserPosts: false,
    selectedFilter: 'LATEST',
    navigationType: 'post',

    setCurrentPostIndex: (index: number) => {
      set({ currentPostIndex: index });
    },

    setSelectedFilter: (filter: ProfileFilter) => {
      set({
        selectedFilter: filter,
        navigationPosts: [],
        currentPostIndex: 0,
        postById: null,
      });
    },

    clearStore: () => {
      set({
        navigationPosts: [],
        postById: null,
        currentUsername: null,
        currentPostIndex: 0,
        navigationType: 'post',
      });
    },

    setPostsByUser: async (username: string, type: NavigationType = 'post') => {
      if (username !== get().currentUsername || type !== get().navigationType) {
        set({
          navigationPosts: [],
          currentUsername: null,
          navigationType: type,
        });
      }

      if (
        username === get().currentUsername &&
        type === get().navigationType &&
        get().navigationPosts.length > 0
      ) {
        return;
      }

      set({ isLoadingUserPosts: true });
      try {
        const data =
          type === 'post'
            ? await getPostNavigationData({
                username,
                sortBy: get().selectedFilter,
              })
            : await getLikedPosts(username);

        set({
          navigationPosts: data,
          currentUsername: username,
          currentPostIndex:
            data.findIndex((post) => post.id === get().postById?.id) ?? 0,
        });
      } finally {
        set({ isLoadingUserPosts: false });
      }
    },

    setPostById: async (
      postId: string,
      username: string,
      type: NavigationType = 'post'
    ) => {
      if (username !== get().currentUsername || type !== get().navigationType) {
        get().clearStore();
      }

      const existingPost = get().navigationPosts.find(
        (post) => post.id === postId
      );
      if (existingPost) {
        set({
          postById: existingPost,
          currentPostIndex: get().navigationPosts.findIndex(
            (post) => post.id === postId
          ),
        });
        return;
      }

      set({ isLoadingPost: true });
      try {
        const data = await getPostById(postId);
        set({
          postById: data,
          currentPostIndex: get().navigationPosts.findIndex(
            (post) => post.id === postId
          ),
        });
      } finally {
        set({ isLoadingPost: false });
      }
    },
  }))
);
