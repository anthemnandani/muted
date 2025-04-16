import { type SortBy } from '@/lib/types';
import { api } from '@/trpc/react';
import { useMemo } from 'react';

const useGetComments = ({
  postId,
  sortBy,
}: {
  postId: string;
  sortBy: SortBy;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage } =
    api.post.getComments.useInfiniteQuery(
      { id: postId, sortBy },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      }
    );

  const allComments = useMemo(() => {
    const comments = data?.pages.flatMap((page) => page.comments) ?? [];

    const seenComments = new Set();
    return comments.filter((comment) => {
      const key = `comment-${comment.id}`;
      if (seenComments.has(key)) return false;
      seenComments.add(key);
      return true;
    });
  }, [data?.pages]);

  return {
    allComments,
    isLoading: isLoading,
    hasNextPage,
    fetchNextPage,
  };
};

export default useGetComments;
