'use client';

import Error from '@/app/error';
import ThreadsList from '@/components/shared/ThreadsList';
import { api } from '@/trpc/react';
import Loading from '../loading';

const ThreadsClient = () => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.post.getInfinitePosts.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const allPosts = data?.pages.flatMap((page) => page.posts);

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

  return (
    <div className='h-full'>
      <ThreadsList
        posts={allPosts}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        emptyStateMessage='No posts found.'
      />
    </div>
  );
};

export default ThreadsClient;
