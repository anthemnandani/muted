'use client';

import Error from '@/app/error';
import CreateWithInput from '@/components/inputs/CreateWithInput';
import ThreadFilterMenu from '@/components/menus/ThreadFilterMenu';
import CreateThread from '@/components/modals/CreateThread';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import Loader from '@/components/shared/Loader';
import Wrapper from '@/components/shared/Wrapper';
import useWindow from '@/hooks/useWindow';
import { ThreadFilter } from '@/lib/types';
import { useThreadStore } from '@/store/threadStore';
import { api } from '@/trpc/react';
import { Fragment } from 'react';
import ThreadsList from './components/ThreadsList';

const getEmptyMessage = (filter?: ThreadFilter) => {
  switch (filter) {
    case ThreadFilter.FOLLOWING:
      return 'Follow people to see their threads here.';
    case ThreadFilter.LIKED:
      return "You haven't liked any threads yet.";
    case ThreadFilter.SAVED:
      return "You haven't saved any threads yet.";
    case ThreadFilter.FOR_YOU:
    default:
      return 'No threads found.';
  }
};

const ThreadsClient = ({ filter }: { filter?: ThreadFilter }) => {
  const { setOpenDialog } = useThreadStore();
  const { isMobile } = useWindow();

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.thread.getInfiniteThreads.useInfiniteQuery(
      { filter },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      },
    );

  const allThreads = data?.pages.flatMap((page) => page.threads);

  if (isLoading) return <Loader />;
  if (isError) return <Error />;

  return (
    <Fragment>
      {!isMobile && (
        <HeaderWrapper>
          <ThreadFilterMenu selectedFilter={filter} />
        </HeaderWrapper>
      )}
      <Wrapper>
        <div className='w-full md:flex hidden'>
          <CreateWithInput onClick={() => setOpenDialog(true)} />
        </div>
        <section className='flex flex-col gap-4 justify-start w-full min-h-[50vh]'>
          {allThreads?.length === 0 ? (
            <div className='flex-col-center w-full h-full py-20 text-center animate-in fade-in zoom-in duration-300'>
              <p className='text-white/40 text-sm font-medium'>
                {getEmptyMessage(filter)}
              </p>
            </div>
          ) : (
            <ThreadsList
              threads={allThreads!}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
            />
          )}
        </section>
      </Wrapper>
      <CreateThread />
    </Fragment>
  );
};

export default ThreadsClient;
