'use client';
import Loading from '@/app/(pages)/loading';
import NotFound from '@/app/not-found';
import ParentReplyCard from '@/components/cards/ParentReplyCard';
import ParentThreadCard from '@/components/cards/ParentThreadCard';
import { Icons } from '@/components/icons';
import PinToHome from '@/components/menus/PinToHome';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import Wrapper from '@/components/shared/Wrapper';
import useWindow from '@/hooks/useWindow';
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import InfiniteScroll from 'react-infinite-scroll-component';

const PostInfoClient = ({ id }: { id: string }) => {
  const { isMobile } = useWindow();
  const router = useRouter();

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.post.getNestedPosts.useInfiniteQuery(
      { id },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  if (isLoading) return <Loading />;
  if (isError || !data) return <NotFound />;

  const allReplies = data.pages.flatMap((page) => page.replies);
  const postInfo = data.pages[0].postInfo;

  return (
    <>
      {!isMobile && (
        <HeaderWrapper>
          <div className='flex-between h-[60px] px-4'>
            <div className='icon-container' onClick={() => router.back()}>
              <Icons.back className='size-3' />
            </div>
            <span className='text-[15px] font-semibold'>Thread</span>
            <PinToHome />
          </div>
        </HeaderWrapper>
      )}
      <Wrapper>
        <ParentThreadCard postInfo={postInfo!} />
        <InfiniteScroll
          dataLength={allReplies.length}
          next={fetchNextPage}
          hasMore={hasNextPage ?? false}
          loader={
            <div className='h-[80px] w-full flex-center mb-[10vh] sm:mb-0'>
              <Icons.loading className='size-11' />
            </div>
          }
        >
          {allReplies.map((reply) => (
            <ParentReplyCard
              key={reply.id}
              {...reply}
              showLine={reply.children.length > 0}
            />
          ))}
        </InfiniteScroll>
      </Wrapper>
    </>
  );
};

export default PostInfoClient;
