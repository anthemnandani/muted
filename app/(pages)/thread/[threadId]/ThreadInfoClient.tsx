'use client';

import Error from '@/app/error';
import ParentThreadCard from '@/components/cards/ParentThreadCard';
import AddThreadComment from '@/components/comments/AddThreadComment';
import ThreadCommentsList from '@/components/comments/ThreadCommentsList';
import { Icons } from '@/components/icons';
import SortComments from '@/components/menus/SortComments';
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
      refetchOnWindowFocus: false,
    },
  );

  if (isLoading) return <Loader />;
  if (isError) return <Error />;

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
        <div className='flex flex-col min-h-screen pb-[120px] relative'>
          <OptimisticActionProvider
            target={{ type: QUERY_TYPE.THREAD_DETAILS, variables: { id } }}
          >
            <ParentThreadCard threadInfo={data} />
          </OptimisticActionProvider>
          <div className='flex-between pt-2 pb-5 px-2 md:px-4 border-b border-border-light mb-2'>
            <div className='font-semibold text-[15px] leading-none'>
              Comments
            </div>
            <SortComments isThread />
          </div>

          <ThreadCommentsList threadId={id} threadAuthorId={data.author.id} />
        </div>

        <div className='sticky bottom-0 left-0 w-full z-50 bg-gray-6 border-t border-border-light md:pl-[var(--sidebar-width)] lg:pl-0'>
          <div className='w-full md:max-w-[600px] mx-auto'>
            <AddThreadComment threadId={data.id} authorId={data.author.id} />
          </div>
        </div>
      </Wrapper>
    </Fragment>
  );
};

export default ThreadInfoClient;
