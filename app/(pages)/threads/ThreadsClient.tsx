'use client';

import Error from '@/app/error';
import CreateWithInput from '@/components/inputs/CreateWithInput';
import ThreadFilterMenu from '@/components/menus/ThreadFilterMenu';
import CreateThread from '@/components/modals/CreateThread';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import Loader from '@/components/shared/Loader';
import Wrapper from '@/components/shared/Wrapper';
import useWindow from '@/hooks/useWindow';
import { useThreadStore } from '@/store/threadStore';
import { api } from '@/trpc/react';
import { Fragment } from 'react';
import ThreadsList from './components/ThreadsList';

const ThreadsClient = () => {
  const { setOpenDialog } = useThreadStore();
  const { isMobile } = useWindow();

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.thread.getInfiniteThreads.useInfiniteQuery(
      {},
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
          <ThreadFilterMenu />
        </HeaderWrapper>
      )}
      <Wrapper>
        <div className='w-full md:flex hidden'>
          <CreateWithInput onClick={() => setOpenDialog(true)} />
        </div>
        <section className='flex flex-col gap-4 justify-start w-full'>
          <ThreadsList
            threads={allThreads!}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
          />
        </section>
      </Wrapper>
      <CreateThread />
    </Fragment>
  );
};

export default ThreadsClient;
