'use client';

import NotFound from '@/app/not-found';
import Loader from '@/components/shared/Loader';
import ThreadsList from '@/components/shared/ThreadsList';
import { api } from '@/trpc/react';

const ProfileClient = ({ username }: { username: string }) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.postInfo.useInfiniteQuery(
      { username },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const allPosts = data?.pages.flatMap((page) => page.posts);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) return <NotFound />;

  return (
    <div>
      {allPosts ? (
        allPosts?.length > 0 ? (
          <section className='flex flex-col justify-start w-full'>
            <ThreadsList
              posts={allPosts}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
            />
          </section>
        ) : (
          <div className='h-[50vh] w-full flex-center text-gray-3'>
            <p>No threads yet.</p>
          </div>
        )
      ) : (
        <NotFound />
      )}
    </div>
  );
};

export default ProfileClient;
