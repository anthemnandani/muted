'use client';

import Error from '@/app/error';
import CreateWithInput from '@/components/inputs/CreateWithInput';
import ThreadFilterMenu from '@/components/menus/ThreadFilterMenu';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import ThreadsList from '@/components/shared/ThreadsList';
import Wrapper from '@/components/shared/Wrapper';
import {
  OptimisticActionProvider,
  TargetType,
} from '@/contexts/OptimisticActionContext';
import useDevice from '@/hooks/useDevice';
import { QUERY_TYPE } from '@/lib/constants';
import { FeedWrapperProps } from '@/lib/types';
import { useThreadStore } from '@/store/threadStore';
import { useMemo } from 'react';
import CreateThread from '../modals/CreateThread';
import Loader from './Loader';

const FeedWrapper = ({
  threads,
  isLoading,
  isError,
  hasNextPage,
  fetchNextPage,
  selectedFilter,
  emptyStateMessage,
}: FeedWrapperProps) => {
  const { setOpenDialog } = useThreadStore();

  const { isMobile } = useDevice();

  const optimisticTarget = useMemo(
    () => ({ type: QUERY_TYPE.THREAD_FEED, variables: {} }),
    [],
  );

  if (isLoading) return <Loader />;
  if (isError) return <Error />;

  return (
    <OptimisticActionProvider target={optimisticTarget as TargetType}>
      {!isMobile && (
        <HeaderWrapper>
          <ThreadFilterMenu selectedFilter={selectedFilter} />
        </HeaderWrapper>
      )}
      <Wrapper>
        <div className='w-full md:flex hidden'>
          <CreateWithInput onClick={() => setOpenDialog(true)} />
        </div>
        <section className='flex flex-col gap-4 justify-start w-full min-h-[50vh]'>
          {threads?.length === 0 ? (
            <div className='flex-col-center w-full h-full py-20 text-center animate-in fade-in zoom-in duration-300'>
              <p className='text-white/40 text-sm font-medium'>
                {emptyStateMessage}
              </p>
            </div>
          ) : (
            <ThreadsList
              threads={threads!}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
            />
          )}
        </section>
      </Wrapper>
      <CreateThread />
    </OptimisticActionProvider>
  );
};

export default FeedWrapper;
