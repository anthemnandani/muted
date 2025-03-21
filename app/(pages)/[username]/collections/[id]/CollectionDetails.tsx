'use client';

import Error from '@/app/error';
import NotFound from '@/app/not-found';
import UserPostsList from '@/components/profile/UserPostsList';
import TopHeader from '@/components/shared/TopHeader';
import HeaderSkeleton from '@/components/skeletons/HeaderSkeleton';
import SkeletonGrid from '@/components/skeletons/SkeletonGrid';
import { api } from '@/trpc/react';
import React from 'react';

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

  if (isError) return <Error />;
  if (!isLoading && !data) return <NotFound />;

  return (
    <div className='main-container'>
      {isLoading ? (
        <React.Fragment>
          <HeaderSkeleton />
          <SkeletonGrid />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <TopHeader title={collection?.name as string} />
          <UserPostsList
            username={collection?.username as string}
            posts={allPosts!}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            type='collection'
            collectionId={id}
          />
        </React.Fragment>
      )}
    </div>
  );
};

export default CollectionDetails;
