'use client';
import Error from '@/app/error';
import ThreadCard from '@/components/cards/ThreadCard';
import { Icons } from '@/components/icons';
import CreateWithInput from '@/components/inputs/CreateWithInput';
import Wrapper from '@/components/shared/Wrapper';
import useDialog from '@/store/dialog';
import { api } from '@/trpc/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loading from '../loading';

const ThreadsClient = () => {
  const { setOpenDialog } = useDialog();
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.post.getInfinitePosts.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const allPosts = data?.pages.flatMap((page) => page.posts);

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

  return (
    <Wrapper>
      <div className='w-full md:flex hidden'>
        <CreateWithInput onClick={() => setOpenDialog(true)} />
      </div>
      <section className='flex flex-col gap-4 justify-start w-full'>
        <InfiniteScroll
          dataLength={allPosts?.length ?? 0}
          next={fetchNextPage}
          hasMore={hasNextPage ?? false}
          loader={
            <div className='h-[100px] w-full flex-center mb-[10vh] sm:mb-0'>
              <Icons.loading className='h-11 w-11' />
            </div>
          }
        >
          {allPosts?.map((post, index) => {
            return (
              <ThreadCard
                key={post.id}
                {...post}
                isLastThread={index == allPosts.length - 1}
              />
            );
          })}
        </InfiniteScroll>
      </section>
    </Wrapper>
  );
};

export default ThreadsClient;
