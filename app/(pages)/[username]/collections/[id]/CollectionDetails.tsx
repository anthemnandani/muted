'use client';

import NotFound from '@/app/not-found';
import UserPostsList from '@/components/profile/UserPostsList';
import Loader from '@/components/shared/Loader';
import TopHeader from '@/components/shared/TopHeader';
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
  const collection = data?.pages[0].collection;

  if (isLoading) return <Loader />;
  if (isError || !data) return <NotFound />;

  return (
    <div className='main-container'>
      <TopHeader title={collection?.name as string} />
      <UserPostsList
        posts={allPosts!}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
      />
    </div>
  );
};

export default CollectionDetails;
