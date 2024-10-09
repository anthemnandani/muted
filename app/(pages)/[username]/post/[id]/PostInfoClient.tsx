'use client';
import Loading from '@/app/(pages)/loading';
import NotFound from '@/app/not-found';
import ThreadCard from '@/components/cards/ThreadCard';
import ThreadReplyCard from '@/components/cards/ThreadReplyCard';
import { Icons } from '@/components/icons';
import PinToHome from '@/components/menus/PinToHome';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import Wrapper from '@/components/shared/Wrapper';
import useWindow from '@/hooks/useWindow';
import { ParentPostProps, ThreadDisplayProps } from '@/lib/types';
import { buildReplyTree } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

interface ThreadRecursiveCardProps {
  post: ParentPostProps;
  displayProps: ThreadDisplayProps;
}

const ThreadRecursiveCard = ({
  post,
  displayProps,
}: ThreadRecursiveCardProps) => {
  return (
    <>
      <ThreadCard
        {...post}
        {...displayProps}
        showLine={post.children && post.children.length === 1}
        isReply
      />
      {post.children &&
        post.children.length === 1 &&
        post.children.map((reply) => (
          <ThreadRecursiveCard
            key={reply.id}
            post={reply}
            displayProps={{ ...displayProps, isNested: true }}
          />
        ))}
    </>
  );
};

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

  const allReplies: ParentPostProps[] = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.replies);
  }, [data]);

  const firstPage = data?.pages[0];
  const { postInfo, parentPosts } = firstPage || {};

  const replyTree = useMemo(() => {
    if (!postInfo) return [];
    return buildReplyTree(allReplies, postInfo.id);
  }, [allReplies, postInfo]);
  if (isLoading) return <Loading />;
  if (isError || !data) return <NotFound />;

  return (
    <>
      {!isMobile && (
        <HeaderWrapper>
          <div className='flex-between h-[60px] px-4'>
            <div className='icon-container' onClick={() => router.back()}>
              <Icons.back className='size-3' />
            </div>
            <span className='text-[15px] font-semibold'>Muted</span>
            <PinToHome />
          </div>
        </HeaderWrapper>
      )}
      <Wrapper>
        <ThreadReplyCard
          postInfo={postInfo!}
          parentPosts={parentPosts || []}
          showSeparator={replyTree.length !== 0}
        />
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
          {replyTree.map((reply: ParentPostProps, index: number) => (
            <ThreadRecursiveCard
              key={reply.id}
              post={reply}
              displayProps={{
                isLastThread:
                  index === replyTree.length - 1 &&
                  (reply?.children?.length === 0 ||
                    reply?.children?.length! >= 2),
                isNested: false,
              }}
            />
          ))}
        </InfiniteScroll>
      </Wrapper>
    </>
  );
};

export default PostInfoClient;
