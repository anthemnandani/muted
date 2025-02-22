'use client';

import Error from '@/app/error';
import PostsList from '@/components/shared/PostsList';
import { api } from '@/trpc/react';

const PostsClient = () => {
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
    <main
      id='main-scroll-container'
      className='h-screen overflow-y-scroll snap-y snap-mandatory smooth-scroll hide-scrollbar'
    >
      <div className='grid place-items-center min-h-screen'>
        <div className='h-full'>
          <PostsList
            posts={allPosts}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isLoading={isLoading}
            emptyStateMessage='No posts found.'
          />
        </div>
      </div>
    </main>
  );
};

export default PostsClient;
