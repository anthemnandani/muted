'use client';
import Loading from '@/app/(pages)/loading';
import NotFound from '@/app/not-found';
import ThreadCard from '@/components/cards/ThreadCard';
import ThreadReplyCard from '@/components/cards/ThreadReplyCard';
import { Icons } from '@/components/icons';
import Wrapper from '@/components/shared/Wrapper';
import { ParentPostProps } from '@/lib/types';
import { buildReplyTree } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

interface ThreadRecursiveCardProps {
  post: ParentPostProps;
  isNested?: boolean;
  isLastThread?: boolean;
}

const ThreadRecursiveCard = ({
  post,
  isNested = false,
  isLastThread = false,
}: ThreadRecursiveCardProps) => {
  return (
    <>
      <ThreadCard
        {...post}
        isNested={isNested}
        showLine={post.children && post.children.length === 1}
        isLastThread={isLastThread}
      />
      {post.children &&
        post.children.length === 1 &&
        post.children.map((reply) => (
          <ThreadRecursiveCard key={reply.id} post={reply} isNested />
        ))}
    </>
  );
};

const PostInfoClient = ({ id }: { id: string }) => {
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
        {replyTree.map((reply, index) => (
          <ThreadRecursiveCard
            key={reply.id}
            post={reply}
            isLastThread={index === replyTree.length - 1}
          />
        ))}
      </InfiniteScroll>
    </Wrapper>
  );
};

export default PostInfoClient;
