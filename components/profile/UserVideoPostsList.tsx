import type { ProfileFilter } from '@/lib/types';
import { api } from '@/trpc/react';
import { useMemo } from 'react';
import ProfilePostsGrid from './ProfilePostsGrid';

const UserVideoPostsList = ({
  username,
  filter,
}: {
  username: string;
  filter: ProfileFilter;
}) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.getUserVideoPosts.useInfiniteQuery(
      { username, sortBy: filter },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: false,
      },
    );

  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.posts) ?? [];
  }, [data]);

  return (
    <ProfilePostsGrid
      posts={posts}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage ?? false}
      title='No videos yet'
      description='Videos you post will appear here'
      isLoading={isLoading}
      isError={isError}
    />
  );
};

export default UserVideoPostsList;
