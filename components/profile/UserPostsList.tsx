import type { ProfileFilter } from '@/lib/types';
import { api } from '@/trpc/react';
import { useMemo } from 'react';
import ProfilePostsGrid from './ProfilePostsGrid';

const UserPostsList = ({
  username,
  filter,
}: {
  username: string;
  filter: ProfileFilter;
}) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.getUserPosts.useInfiniteQuery(
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
      title='No posts yet'
      description='Posts you share will appear here'
      isLoading={isLoading}
      isError={isError}
    />
  );
};

export default UserPostsList;
