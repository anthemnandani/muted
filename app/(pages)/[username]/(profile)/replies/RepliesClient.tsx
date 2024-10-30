'use client';

import NotFound from '@/app/not-found';
import ThreadCard from '@/components/cards/ThreadCard';
import { Icons } from '@/components/icons';
import Loader from '@/components/shared/Loader';
import { api } from '@/trpc/react';
import InfiniteScroll from 'react-infinite-scroll-component';

const RepliesClient = ({ username }: { username: string }) => {
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
                    <ThreadCard {...reply.parentPost} showUsername />
                  )}
                  <ThreadCard
                    {...reply}
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
