'use client';

import Error from '@/app/error';
import NewPost from '@/components/modals/NewPost';
import ThreadsList from '@/components/shared/ThreadsList';
import { api } from '@/trpc/react';

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

  if (isError) return <Error />;

  return (
    <div className='h-full'>
      <ThreadsList
        posts={allPosts}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        emptyStateMessage='No posts found.'
      />
    </div>
  );
};

export default ThreadsClient;
