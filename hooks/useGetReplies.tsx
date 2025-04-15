import { api } from '@/trpc/react';
import { useMemo } from 'react';

const useGetReplies = ({ parentCommentId }: { parentCommentId: string }) => {
  const { data, isLoading, hasNextPage, fetchNextPage } =
    api.post.getReplies.useInfiniteQuery(
      { parentCommentId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        enabled: !!parentCommentId,
      }
    );

  const allReplies = useMemo(() => {
    const replies = data?.pages.flatMap((page) => page.replies) ?? [];
    const seenReplies = new Set();
    return replies.filter((reply) => {
      const key = `reply-${reply.id}`;
      if (seenReplies.has(key)) return false;
      seenReplies.add(key);
      return true;
    });
  }, [data?.pages]);

  return {
    allReplies,
    isLoading,
    hasNextPage,
    fetchNextPage,
  };
};

export default useGetReplies;
