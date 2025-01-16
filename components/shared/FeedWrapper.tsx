'use client';

import Loading from '@/app/(pages)/loading';
import Error from '@/app/error';
import CreateWithInput from '@/components/inputs/CreateWithInput';
import ThreadFilterMenu from '@/components/menus/ThreadFilterMenu';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import ThreadsList from '@/components/shared/ThreadsList';
import Wrapper from '@/components/shared/Wrapper';
import useDevice from '@/hooks/useDevice';
import { ParentPostProps, ThreadFilter } from '@/lib/types';
import useDialog from '@/store/dialog';
import React from 'react';

interface FeedWrapperProps {
  posts?: ParentPostProps[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: any;
  selectedFilter?: ThreadFilter;
  emptyStateMessage: string;
}

const FeedWrapper = ({
  posts,
  isLoading,
  isError,
  hasNextPage,
  fetchNextPage,
  selectedFilter,
  emptyStateMessage,
}: FeedWrapperProps) => {
  const { setOpenDialog } = useDialog();
  const { isMobile } = useDevice();

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

  return (
    <React.Fragment>
      {!isMobile && (
        <HeaderWrapper>
          <ThreadFilterMenu selectedFilter={selectedFilter} />
        </HeaderWrapper>
      )}
      <Wrapper>
        <div className='w-full md:flex hidden'>
          <CreateWithInput onClick={() => setOpenDialog(true)} />
        </div>
        <section className='flex flex-col gap-4 justify-start w-full'>
          <ThreadsList
            posts={posts}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            emptyStateMessage={emptyStateMessage}
          />
        </section>
      </Wrapper>
    </React.Fragment>
  );
};

export default FeedWrapper;
