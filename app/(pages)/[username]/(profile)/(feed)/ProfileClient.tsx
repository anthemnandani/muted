'use client';

import NotFound from '@/app/not-found';
import PostFilters from '@/components/posts/PostFilters';
import Loader from '@/components/shared/Loader';
import ThreadsGrid from '@/components/shared/ThreadsGrid';
import ThreadsList from '@/components/shared/ThreadsList';
import { useSyncPostStates } from '@/hooks/useSyncPostStates';
import type { PostFilter, PostView } from '@/lib/types';
import { api } from '@/trpc/react';
import React from 'react';

const ProfileClient = ({ username }: { username: string }) => {
  const { syncFirstPost } = useSyncPostStates();
  const [filters, setFilters] = React.useState<PostFilter[]>(['ALL']);
  const [view, setView] = React.useState<PostView>('LIST');
  const { data, isLoading, isRefetching, isError, hasNextPage, fetchNextPage } =
    api.user.postInfo.useInfiniteQuery(
      { username, filters },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const allPosts = data?.pages.flatMap((page) => page.posts);

  React.useEffect(() => {
    if (!allPosts?.length) return;
    syncFirstPost(allPosts);
  }, [data]);

  if (isError) return <NotFound />;

  const handleFilterToggle = (filter: PostFilter) => {
    setFilters((prev) => {
      if (filter === 'ALL') return ['ALL'];

      if (prev.includes('ALL')) {
        return [filter];
      }
      const newFilters = prev.includes(filter)
        ? prev.filter((f) => f !== filter)
        : [...prev, filter];
      return newFilters.length === 0 ? ['ALL'] : newFilters;
    });
  };

  return (
    <React.Fragment>
      <PostFilters
        filters={filters}
        handleFilterToggle={handleFilterToggle}
        view={view}
        onViewChange={setView}
      />
      {isLoading || isRefetching ? (
        <Loader />
      ) : allPosts ? (
        allPosts?.length > 0 ? (
          <section className='flex flex-col justify-start w-full'>
            {view === 'LIST' ? (
              <ThreadsList
                posts={allPosts}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                showMuted={false}
              />
            ) : (
              <ThreadsGrid
                posts={allPosts}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                showMuted={false}
              />
            )}
          </section>
        ) : (
          <div className='h-[50vh] w-full flex-center text-gray-3'>
            <p>Nothing here yet</p>
          </div>
        )
      ) : (
        <NotFound />
      )}
    </React.Fragment>
  );
};

export default ProfileClient;
