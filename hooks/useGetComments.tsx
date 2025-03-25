import { api } from '@/trpc/react';
import { useCallback, useEffect, useMemo, useRef } from 'react';

const useGetComments = ({ postId }: { postId: string }) => {
  const previousPostIdRef = useRef<string | null>(null);

  const { data, isLoading, hasNextPage, fetchNextPage, isFetching, refetch } =
    api.post.getNestedPosts.useInfiniteQuery(
      { id: postId },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      }
    );

  useEffect(() => {
    if (
      previousPostIdRef.current !== null &&
      previousPostIdRef.current !== postId
    ) {
      refetch();
    }
    previousPostIdRef.current = postId;
  }, [postId, refetch]);

  const allReplies = useMemo(() => {
    const replies = data?.pages.flatMap((page) => page.replies) ?? [];
    return [...replies].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data?.pages]);

  const enhancedFetchNextPage = useCallback(async () => {
    try {
      await fetchNextPage();
    } catch (error) {
      console.error('Error fetching next page:', error);
      setTimeout(() => {
        fetchNextPage();
      }, 2000);
    }
  }, [fetchNextPage]);

  return {
    allReplies,
    isLoading: isLoading || isFetching,
    hasNextPage,
    fetchNextPage: enhancedFetchNextPage,
    refetch,
  };
};

export default useGetComments;
