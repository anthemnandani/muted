'use client';

import NotFound from '@/app/not-found';
import Loader from '@/components/shared/Loader';
import PostsList from '@/components/shared/PostsList';
import { api } from '@/trpc/react';

const CollectionDetails = ({ id }: { id: string }) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.collection.getCollection.useInfiniteQuery(
      { id },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const allPosts = data?.pages.flatMap((page) => page.posts);

  if (isLoading) return <Loader />;
  if (isError || !data) return <NotFound />;

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

export default CollectionDetails;
