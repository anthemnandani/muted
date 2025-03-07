import { getPostById, getPostNavigationData } from '@/lib/actions/post.actions';
import { ParentPostProps } from '@/lib/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface PostStore {
  navigationPosts: ParentPostProps[];
  postById: ParentPostProps | null;
  isLoadingPost: boolean;
  isLoadingUserPosts: boolean;
  currentUsername: string | null;
  currentPostIndex: number;
  setPostById: (postId: string, username: string) => Promise<void>;
  setPostsByUser: (username: string) => Promise<void>;
  setCurrentPostIndex: (index: number) => void;
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

    setCurrentPostIndex: (index: number) => {
      set({ currentPostIndex: index });
    },

    clearStore: () => {
      set({
        navigationPosts: [],
        postById: null,
        currentUsername: null,
        currentPostIndex: 0,
      });
    },

    setPostsByUser: async (username: string) => {
      if (username !== get().currentUsername) {
        set({
          navigationPosts: [],
          currentUsername: null,
        });
      }

      if (
        username === get().currentUsername &&
        get().navigationPosts.length > 0
      ) {
        return;
      }

      set({ isLoadingUserPosts: true });
      try {
        const data = await getPostNavigationData(username);
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

    setPostById: async (postId: string, username: string) => {
      if (username !== get().currentUsername) {
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
