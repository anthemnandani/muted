'use client';

import Error from '@/app/error';
import CreateWithInput from '@/components/inputs/CreateWithInput';
import ThreadFilterMenu from '@/components/menus/ThreadFilterMenu';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import ThreadsList from '@/components/shared/ThreadsList';
import Wrapper from '@/components/shared/Wrapper';
import useWindow from '@/hooks/useWindow';
import useDialog from '@/store/dialog';
import { api } from '@/trpc/react';
import Loading from '../loading';

const ThreadsClient = () => {
  const { setOpenDialog } = useDialog();
  const { isMobile } = useWindow();
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
    <>
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
            posts={allPosts}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
          />
        </section>
      </Wrapper>
    </>
  );
};

export default ThreadsClient;
