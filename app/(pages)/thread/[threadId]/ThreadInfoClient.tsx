'use client';

import Error from '@/app/error';
import ParentThreadCard from '@/components/cards/ParentThreadCard';
import { Icons } from '@/components/icons';
import CreateThread from '@/components/modals/CreateThread';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import Loader from '@/components/shared/Loader';
import Wrapper from '@/components/shared/Wrapper';
import { OptimisticActionProvider } from '@/contexts/OptimisticActionContext';
import useWindow from '@/hooks/useWindow';
import { QUERY_TYPE } from '@/lib/constants';
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';

const ThreadInfoClient = ({ id }: { id: string }) => {
  const { isMobile } = useWindow();
  const router = useRouter();
  const { data, isLoading, isError } = api.thread.getThreadById.useQuery(
    { id },
    {
      trpc: { abortOnUnmount: true },
      retry: false,
      cacheTime: 10 * 60 * 1000,
      staleTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  );

  if (isLoading) return <Loader />;
  if (isError) return <Error />;

  const rootThreadId = data.path?.split('/')[0];

  return (
    <Fragment>
      {!isMobile && (
        <HeaderWrapper>
          <div className='flex-between h-[60px] px-4 w-full md:max-w-[600px] mx-auto'>
            <div className='icon-container' onClick={() => router.back()}>
              <Icons.back className='size-3' />
            </div>
            <span className='text-center flex-1 text-[15px] font-semibold'>
              Thread
            </span>
          </div>
        </HeaderWrapper>
      )}
      <Wrapper>
        <OptimisticActionProvider
          target={{ type: QUERY_TYPE.THREAD_DETAILS, variables: { id } }}
        >
          <ParentThreadCard postInfo={data} />
        </OptimisticActionProvider>
      </Wrapper>
      <CreateThread rootThreadId={rootThreadId} />
    </Fragment>
  );
};

export default ThreadInfoClient;
