'use client';

import { QUERY_TYPE } from '@/lib/constants';
import {
  type ACTION_TYPE,
  applyOptimisticUpdate,
} from '@/lib/optimistic-helper';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { createContext, ReactNode, useContext } from 'react';

type PerformActionFn = (
  postId: string,
  action: ACTION_TYPE,
  active: boolean,
  payload?: any,
) => void;

const OptimisticActionContext = createContext<PerformActionFn | undefined>(
  undefined,
);

export type TargetType =
  | {
      type: QUERY_TYPE.FEED;
      variables: { searchQuery?: string };
    }
  | {
      type: QUERY_TYPE.THREAD_FEED;
      variables: { searchQuery?: string };
    }
  | { type: QUERY_TYPE.POST_DETAILS; variables: { id: string } }
  | { type: QUERY_TYPE.THREAD_DETAILS; variables: { id: string } }
  | {
      type: QUERY_TYPE.COMMENTS;
      variables: { id: string; sortBy: 'LATEST' | 'OLDEST' };
    }
  | {
      type: QUERY_TYPE.THREAD_COMMENTS;
      variables: { id: string; sortBy: 'LATEST' | 'OLDEST' };
    }
  | { type: QUERY_TYPE.REPLIES; variables: { parentCommentId: string } }
  | { type: QUERY_TYPE.THREAD_REPLIES; variables: { parentCommentId: string } }
  | { type: QUERY_TYPE.USER_THREAD_REPLIES; variables: { username: string } }
  | { type: QUERY_TYPE.FOLLOWING_FEED; variables: {} }
  | { type: QUERY_TYPE.TAG_FEED; variables: { tag: string } }
  | {
      type: QUERY_TYPE.USER_POSTS;
      variables: { username: string; sortBy?: 'LATEST' | 'OLDEST' };
    }
  | { type: QUERY_TYPE.USER_REPOSTS; variables: { username: string } }
  | { type: QUERY_TYPE.USER_THREAD_REPOSTS; variables: { username: string } }
  | { type: QUERY_TYPE.USER_LIKED; variables: { username: string } }
  | { type: QUERY_TYPE.USER_THREADS; variables: { username: string } }
  | { type: QUERY_TYPE.COLLECTION_POSTS; variables: { id: string } };

export const OptimisticActionProvider = ({
  target,
  children,
}: {
  target: TargetType;
  children: ReactNode;
}) => {
  const utils = api.useUtils();
  const { user } = useUser();
  const userId = user?.id;

  const performAction: PerformActionFn = (postId, action, active, payload) => {
    if (!userId) return;

    const update = (listKey: string) => (old: any) =>
      applyOptimisticUpdate(
        old,
        listKey,
        postId,
        action,
        userId,
        active,
        payload,
      );

    switch (target.type) {
      case QUERY_TYPE.FEED:
        utils.post.getInfinitePosts.setInfiniteData(
          target.variables,
          update('posts'),
        );
        break;

      case QUERY_TYPE.THREAD_FEED:
        utils.thread.getAllThreads.setInfiniteData(
          target.variables,
          update('threads'),
        );
        break;

      case QUERY_TYPE.TAG_FEED:
        utils.post.getPostsByTag.setInfiniteData(
          target.variables,
          update('posts'),
        );
        break;

      case QUERY_TYPE.FOLLOWING_FEED:
        utils.post.getFollowingPosts.setInfiniteData(
          target.variables,
          update('posts'),
        );
        break;

      case QUERY_TYPE.COMMENTS:
        utils.post.getComments.setInfiniteData(
          target.variables,
          update('comments'),
        );
        break;

      case QUERY_TYPE.THREAD_COMMENTS:
        utils.thread.getComments.setInfiniteData(
          target.variables,
          update('comments'),
        );
        break;

      case QUERY_TYPE.REPLIES:
        utils.post.getReplies.setInfiniteData(
          target.variables,
          update('replies'),
        );
        break;

      case QUERY_TYPE.THREAD_REPLIES:
        utils.thread.getReplies.setInfiniteData(
          target.variables,
          update('replies'),
        );
        break;

      case QUERY_TYPE.POST_DETAILS:
        utils.post.getPostDetails.setData(target.variables, update('post'));
        break;

      case QUERY_TYPE.THREAD_DETAILS:
        utils.thread.getThreadById.setData(target.variables, update('thread'));
        break;

      case QUERY_TYPE.USER_POSTS:
        utils.user.getUserPosts.setInfiniteData(
          target.variables,
          update('posts'),
        );
        break;

      case QUERY_TYPE.USER_REPOSTS:
        utils.user.getUserReposts.setInfiniteData(
          target.variables,
          update('posts'),
        );
        break;

      case QUERY_TYPE.USER_LIKED:
        utils.user.getUserLikedPosts.setInfiniteData(
          target.variables,
          update('posts'),
        );
        break;

      case QUERY_TYPE.COLLECTION_POSTS:
        utils.collection.getCollection.setInfiniteData(
          target.variables,
          update('posts'),
        );
        break;

      case QUERY_TYPE.USER_THREADS:
        utils.thread.getUserThreads.setInfiniteData(
          target.variables,
          update('threads'),
        );
        break;

      case QUERY_TYPE.USER_THREAD_REPOSTS:
        utils.thread.getUserThreadReposts.setInfiniteData(
          target.variables,
          update('reposts'),
        );
        break;

      case QUERY_TYPE.USER_THREAD_REPLIES:
        utils.thread.getUserThreadReplies.setInfiniteData(
          target.variables,
          update('replies'),
        );
        break;

      default:
        return null;
    }
  };

  return (
    <OptimisticActionContext.Provider value={performAction}>
      {children}
    </OptimisticActionContext.Provider>
  );
};

export const useOptimisticAction = () => {
  const context = useContext(OptimisticActionContext);
  return context;
};
