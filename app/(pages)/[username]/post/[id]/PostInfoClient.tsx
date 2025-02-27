'use client';

import NotFound from '@/app/not-found';
import ParentReplyCard from '@/components/cards/ParentReplyCard';
import ParentThreadCard from '@/components/cards/ParentThreadCard';
import { Icons } from '@/components/icons';
import NewCollection from '@/components/modals/NewCollection';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import Loader from '@/components/shared/Loader';
import TopHeader from '@/components/shared/TopHeader';
import Wrapper from '@/components/shared/Wrapper';
import useDevice from '@/hooks/useDevice';
import { useSyncPostStates } from '@/hooks/useSyncPostStates';
import { api } from '@/trpc/react';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const PostInfoClient = ({ id }: { id: string }) => {
  const { isMobile } = useDevice();
  const { syncPostStates } = useSyncPostStates();

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.post.getNestedPosts.useInfiniteQuery(
      { id },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const allReplies = React.useMemo(() => {
    const replies = data?.pages.flatMap((page) => page.replies) ?? [];
    return [...replies].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [data?.pages]);

  const postInfo = data?.pages[0].postInfo;

  React.useEffect(() => {
    if (postInfo) {
      syncPostStates(postInfo);
      allReplies?.forEach(syncPostStates);
    }
  }, [data]);

  if (isLoading) return <Loader />;
  if (isError || !data) return <NotFound />;

  return (
    <>
      {!isMobile && (
        <HeaderWrapper>
          <TopHeader title='Thread' showBack />
        </HeaderWrapper>
      )}
      <Wrapper>
        <ParentThreadCard postInfo={postInfo!} />
        <InfiniteScroll
          dataLength={allReplies?.length ?? 0}
          next={fetchNextPage}
          hasMore={hasNextPage ?? false}
          loader={
            <div className='h-[80px] w-full flex-center mb-[10vh] sm:mb-0'>
              <Icons.loading className='size-11' />
            </div>
          }
        >
          {allReplies?.map((reply) => (
            <ParentReplyCard key={reply.id} {...reply} />
          ))}
        </InfiniteScroll>
        <div className='pb-20 md:pb-10'></div>
        <NewCollection />
      </Wrapper>
    </>
  );
};

export default PostInfoClient;
