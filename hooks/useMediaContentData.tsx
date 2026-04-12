import { useActivityStore } from '@/store/activityStore';
import { api } from '@/trpc/react';

const useMediaContentData = () => {
  const { mediaTab, sortFilter } = useActivityStore();

  const getMediaType = () => {
    if (mediaTab === 'photos') return 'IMAGE';
    if (mediaTab === 'videos') return 'VIDEO';
    return 'ALL';
  };

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

  const postsQuery = api.activity.getUserPosts.useInfiniteQuery(
    { mediaType: getMediaType(), ...filterParams },
    {
      ...sharedOptions,
      enabled: mediaTab !== 'threads',
      getNextPageParam: (last) => last.nextCursor,
    },
  );

  const threadsQuery = api.activity.getUserThreads.useInfiniteQuery(
    filterParams,
    {
      ...sharedOptions,
      enabled: mediaTab === 'threads',
      getNextPageParam: (last) => last.nextCursor,
    },
  );

  if (mediaTab === 'threads') {
    return {
      items: threadsQuery.data?.pages.flatMap((t) => t.threads) ?? [],
      query: threadsQuery,
    };
  }

  return {
    items: postsQuery.data?.pages.flatMap((p) => p.posts) ?? [],
    query: postsQuery,
  };
};

export default useMediaContentData;
