'use client';

import NotFound from '@/app/not-found';
import PostCard from '@/components/cards/PostCard';
import { Icons } from '@/components/icons';
import Loader from '@/components/shared/Loader';
import { useSyncPostStates } from '@/hooks/useSyncPostStates';
import { api } from '@/trpc/react';
import Link from 'next/link';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

const RepliesClient = ({ username }: { username: string }) => {
  const { syncPostAndParent } = useSyncPostStates();
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.repliesInfo.useInfiniteQuery(
      { username },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const allReplies = data?.pages.flatMap((page) => page.replies);

  React.useEffect(() => {
    if (!allReplies?.length) return;
    allReplies.forEach(syncPostAndParent);
  }, [data]);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) return <NotFound />;

  return (
    <div>
      {allReplies ? (
        allReplies?.length > 0 ? (
          <section className='flex flex-col justify-start w-full'>
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
              {allReplies.map((reply, index) => (
                <div key={`reply-${reply.id}`}>
                  {reply.parentPost && (
                    <PostCard
                      {...reply.parentPost}
                      showMuted={false}
                      variant='reply'
                      showUsername
                    />
                  )}
                  {reply.parentPost?.author.username && (
                    <div className='mt-4'>
                      <Link
                        href={`/@${reply.parentPost?.author.username}/post/${reply.parentPost?.id}`}
                        className='text-gray-3 text-[15px] leading-5 px-2 md:px-4'
                      >
                        Replying to @{reply.parentPost?.author.username}
                      </Link>
                    </div>
                  )}
                  <PostCard
                    {...reply}
                    showMuted={false}
                    variant='reply'
                    isLastThread={index === allReplies.length - 1}
                  />
                </div>
              ))}
            </InfiniteScroll>
          </section>
        ) : (
          <div className='h-[50vh] w-full flex-center text-gray-3'>
            <p>No replies yet.</p>
          </div>
        )
      ) : (
        <NotFound />
      )}
    </div>
  );
};

export default RepliesClient;
