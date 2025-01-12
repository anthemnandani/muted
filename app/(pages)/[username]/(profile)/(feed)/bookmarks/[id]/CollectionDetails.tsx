'use client';

import Loading from '@/app/(pages)/loading';
import NotFound from '@/app/not-found';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import ThreadsList from '@/components/shared/ThreadsList';
import TopHeader from '@/components/shared/TopHeader';
import Wrapper from '@/components/shared/Wrapper';
import useDevice from '@/hooks/useDevice';
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

  const { isMobile } = useDevice();

  if (isLoading) return <Loading />;
  if (isError || !data) return <NotFound />;

  return (
    <React.Fragment>
      {!isMobile && (
        <HeaderWrapper>
          <TopHeader title={collection?.name} showBack />
        </HeaderWrapper>
      )}
      <Wrapper>
        <section className='flex flex-col gap-4 justify-start w-full'>
          <ThreadsList
            posts={allPosts}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
          />
        </section>
      </Wrapper>
    </React.Fragment>
  );
};

export default CollectionDetails;
