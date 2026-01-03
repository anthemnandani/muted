'use client';

import { QUERY_TYPE } from '@/lib/constants';
import {
  updateListInCache,
  updateSingleItemInCache,
} from '@/lib/optimistic-helper';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { createContext, ReactNode, useContext } from 'react';

type OptimisticUpdateFn = (postId: string, willBeLiked: boolean) => any;

const OptimisticLikeContext = createContext<OptimisticUpdateFn | undefined>(
  undefined
);

export type TargetType =
  | {
      type: QUERY_TYPE.FEED;
      variables: { searchQuery?: string; sortBy?: 'LATEST' | 'TOP' };
    }
  | { type: QUERY_TYPE.POST_DETAILS; variables: { id: string } }
  | {
      type: QUERY_TYPE.COMMENTS;
      variables: { id: string; sortBy: 'LATEST' | 'OLDEST' };
    }
  | { type: QUERY_TYPE.REPLIES; variables: { parentCommentId: string } }
  | { type: QUERY_TYPE.FOLLOWING_FEED; variables: {} }
  | { type: QUERY_TYPE.TAG_FEED; variables: { tag: string } }
  | {
      type: QUERY_TYPE.USER_POSTS;
      variables: { username: string; sortBy?: 'LATEST' | 'OLDEST' };
    }
  | { type: QUERY_TYPE.USER_REPOSTS; variables: { username: string } }
  | { type: QUERY_TYPE.USER_LIKED; variables: { username: string } }
  | { type: QUERY_TYPE.COLLECTION_POSTS; variables: { id: string } };

export const OptimisticLikeProvider = ({
  target,
  children,
}: {
  target: TargetType;
  children: ReactNode;
}) => {
  const utils = api.useUtils();
  const { user } = useUser();
  const userId = user?.id;

  const handleOptimisticUpdate: OptimisticUpdateFn = (postId, willBeLiked) => {
    if (!userId) return;

    switch (target.type) {
      case QUERY_TYPE.FEED: {
        const queryKey = target.variables;
        const prev = utils.post.getInfinitePosts.getInfiniteData(queryKey);
        utils.post.getInfinitePosts.setInfiniteData(queryKey, (old) =>
          updateListInCache(old, 'posts', postId, userId, willBeLiked)
        );
        return prev;
      }

      case QUERY_TYPE.TAG_FEED: {
        const queryKey = target.variables;
        const prev = utils.post.getPostsByTag.getInfiniteData(queryKey);
        utils.post.getPostsByTag.setInfiniteData(queryKey, (old) =>
          updateListInCache(old, 'posts', postId, userId, willBeLiked)
        );
        return prev;
      }

      case QUERY_TYPE.FOLLOWING_FEED: {
        const queryKey = target.variables;
        const prev = utils.post.getFollowingPosts.getInfiniteData(queryKey);
        utils.post.getFollowingPosts.setInfiniteData(queryKey, (old) =>
          updateListInCache(old, 'posts', postId, userId, willBeLiked)
        );
        return prev;
      }

      case QUERY_TYPE.COMMENTS: {
        const queryKey = target.variables;
        const prev = utils.post.getComments.getInfiniteData(queryKey);
        utils.post.getComments.setInfiniteData(queryKey, (old) =>
          updateListInCache(old, 'comments', postId, userId, willBeLiked)
        );
        return prev;
      }

      case QUERY_TYPE.REPLIES: {
        const queryKey = target.variables;
        const prev = utils.post.getReplies.getInfiniteData(queryKey);
        utils.post.getReplies.setInfiniteData(queryKey, (old) =>
          updateListInCache(old, 'replies', postId, userId, willBeLiked)
        );
        return prev;
      }

      case QUERY_TYPE.POST_DETAILS: {
        const queryKey = target.variables;
        const prev = utils.post.getPostDetails.getData(queryKey);
        utils.post.getPostDetails.setData(queryKey, (old) => {
          if (!old || !old.post) return old;

          return {
            ...old,
            post: updateSingleItemInCache(old.post, userId, willBeLiked)!,
          };
        });
        return prev;
      }

      case QUERY_TYPE.USER_POSTS: {
        const queryKey = target.variables;
        const prev = utils.user.getUserPosts.getInfiniteData(queryKey);
        utils.user.getUserPosts.setInfiniteData(queryKey, (old) =>
          updateListInCache(old, 'posts', postId, userId, willBeLiked)
        );
        return prev;
      }

      case QUERY_TYPE.USER_REPOSTS: {
        const queryKey = target.variables;
        const prev = utils.user.getUserReposts.getInfiniteData(queryKey);
        utils.user.getUserReposts.setInfiniteData(queryKey, (old) =>
          updateListInCache(old, 'posts', postId, userId, willBeLiked)
        );
        return prev;
      }

      case QUERY_TYPE.USER_LIKED: {
        const queryKey = target.variables;
        const prev = utils.user.getUserLikedPosts.getInfiniteData(queryKey);
        utils.user.getUserLikedPosts.setInfiniteData(queryKey, (old) =>
          updateListInCache(old, 'posts', postId, userId, willBeLiked)
        );
        return prev;
      }

      case QUERY_TYPE.COLLECTION_POSTS: {
        const queryKey = target.variables;
        const prev = utils.collection.getCollection.getInfiniteData(queryKey);
        utils.collection.getCollection.setInfiniteData(queryKey, (old) =>
          updateListInCache(old, 'posts', postId, userId, willBeLiked)
        );
        return prev;
      }

      default:
        return null;
    }
  };

  return (
    <OptimisticLikeContext.Provider value={handleOptimisticUpdate}>
      {children}
    </OptimisticLikeContext.Provider>
  );
};

export const useOptimisticLikeStrategy = () => {
  const context = useContext(OptimisticLikeContext);
  return context;
};
