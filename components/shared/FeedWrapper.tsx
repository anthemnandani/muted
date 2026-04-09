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
import { QUERY_TYPE } from '@/lib/constants';
import { FeedWrapperProps } from '@/lib/types';
import { useThreadStore } from '@/store/threadStore';
import { useMemo } from 'react';
import CreateThread from '../modals/CreateThread';
import Loader from './Loader';
import { cn } from '@/lib/utils';
import useBreakpoint from '@/hooks/useBreakpoint';

const FeedWrapper = ({
  threads,
  isLoading,
  isError,
  hasNextPage,
  fetchNextPage,
  selectedFilter,
  emptyStateMessage,
  isSearch,
}: FeedWrapperProps) => {
  const { setOpenDialog } = useThreadStore();

  const { isMobile } = useBreakpoint();

  const optimisticTarget = useMemo(
    () => ({ type: QUERY_TYPE.THREAD_FEED, variables: {} }),
    [],
  );

  if (isLoading) return <Loader />;
  if (isError) return <Error />;

  return (
    <OptimisticActionProvider target={optimisticTarget as TargetType}>
      {!isMobile && !isSearch && (
        <HeaderWrapper>
          <ThreadFilterMenu selectedFilter={selectedFilter} />
        </HeaderWrapper>
      )}
      <Wrapper isSmall={!isSearch}>
        {!isSearch && (
          <div className='w-full md:flex hidden'>
            <CreateWithInput onClick={() => setOpenDialog(true)} />
          </div>
        )}
        <section className='flex flex-col gap-4 justify-start w-full min-h-[50vh]'>
          {threads?.length === 0 ? (
            <div className='flex-col-center w-full h-full py-20 text-center animate-in fade-in zoom-in duration-300'>
              <p className='text-white/40 text-sm font-medium'>
                {emptyStateMessage}
              </p>
            </div>
          ) : (
            <div className={cn(isSearch && 'mt-5')}>
              <ThreadsList
                threads={threads!}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                isSeparate={isSearch}
              />
            </div>
          )}
        </section>
      </Wrapper>
      {!isSearch && <CreateThread />}
    </OptimisticActionProvider>
  );
};

export default FeedWrapper;
