import { INTERACTIONS_DATA } from '@/lib/constants';
import { useActivityStore } from '@/store/activityStore';
import { api } from '@/trpc/react';

const useInteractionsData = () => {
  const { tab, contentType, sortFilter } = useActivityStore();

  const filterParams = {
    sortOrder: sortFilter.sortOrder,
    ...(sortFilter.dateFilter.startDate
      ? { startDate: sortFilter.dateFilter.startDate }
      : {}),
    ...(sortFilter.dateFilter.endDate
      ? { endDate: sortFilter.dateFilter.endDate }
      : {}),
  };

  const sharedOptions = {
    retry: false,
    refetchOnWindowFocus: false,
    trpc: { abortOnUnmount: true },
  };

  const postLikes = api.activity.getUserLikedPosts.useInfiniteQuery(
    filterParams,
    {
      ...sharedOptions,
      enabled: tab === 'likes' && contentType === 'posts',
      getNextPageParam: (last) => last.nextCursor,
    },
  );

  const postComments = api.activity.getUserComments.useInfiniteQuery(
    filterParams,
    {
      ...sharedOptions,
      enabled: tab === 'comments' && contentType === 'posts',
      getNextPageParam: (last) => last.nextCursor,
    },
  );

  const postReposts = api.activity.getUserReposts.useInfiniteQuery(
    filterParams,
    {
      ...sharedOptions,
      enabled: tab === 'reposts' && contentType === 'posts',
      getNextPageParam: (last) => last.nextCursor,
    },
  );

  const threadLikes = api.activity.getUserLikedThreads.useInfiniteQuery(
    filterParams,
    {
      ...sharedOptions,
      enabled: tab === 'likes' && contentType === 'threads',
      getNextPageParam: (last) => last.nextCursor,
    },
  );

  const threadComments = api.activity.getUserThreadComments.useInfiniteQuery(
    filterParams,
    {
      ...sharedOptions,
      enabled: tab === 'comments' && contentType === 'threads',
      getNextPageParam: (last) => last.nextCursor,
    },
  );

  const threadReposts = api.activity.getUserThreadReposts.useInfiniteQuery(
    filterParams,
    {
      ...sharedOptions,
      enabled: tab === 'reposts' && contentType === 'threads',
      getNextPageParam: (last) => last.nextCursor,
    },
  );

  if (contentType === 'posts') {
    if (tab === 'likes')
      return {
        items: postLikes.data?.pages.flatMap((p) => p.posts) ?? [],
        query: postLikes,
        type: INTERACTIONS_DATA.POST_GRID,
      };
    if (tab === 'comments')
      return {
        items: postComments.data?.pages.flatMap((p) => p.comments) ?? [],
        query: postComments,
        type: INTERACTIONS_DATA.POST_COMMENTS,
      };
    return {
      items: postReposts.data?.pages.flatMap((p) => p.posts) ?? [],
      query: postReposts,
      type: INTERACTIONS_DATA.POST_GRID,
    };
  } else {
    if (tab === 'likes')
      return {
        items: threadLikes.data?.pages.flatMap((p) => p.threads) ?? [],
        query: threadLikes,
        type: INTERACTIONS_DATA.THREAD_LIST,
      };
    if (tab === 'comments')
      return {
        items: threadComments.data?.pages.flatMap((p) => p.comments) ?? [],
        query: threadComments,
        type: INTERACTIONS_DATA.THREAD_COMMENTS,
      };
    return {
      items: threadReposts.data?.pages.flatMap((p) => p.threads) ?? [],
      query: threadReposts,
      type: INTERACTIONS_DATA.THREAD_LIST,
    };
  }
};

export default useInteractionsData;
