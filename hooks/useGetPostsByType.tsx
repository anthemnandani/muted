import type { ProfileFilter } from '@/lib/types';
import { api } from '@/trpc/react';

interface UseGetPostsByTypeProps {
  postType: string;
  username: string;
  sortBy: ProfileFilter;
}

const useGetPostsByType = ({
  postType,
  username,
  sortBy,
}: UseGetPostsByTypeProps) => {
  const regularPostsQuery = api.user.getUserPosts.useQuery(
    { username, sortBy },
    {
      enabled: !!username && postType === 'post',
      staleTime: 10 * 60 * 1000,
    }
  );

  const likedPostsQuery = api.user.getUserLikedPostsFeed.useQuery(
    { username },
    {
      enabled: !!username && postType === 'liked',
      staleTime: 10 * 60 * 1000,
    }
  );

  const repostsQuery = api.user.getUserRepostsFeed.useQuery(
    { username },
    {
      enabled: !!username && postType === 'repost',
      staleTime: 10 * 60 * 1000,
    }
  );

  if (postType === 'liked') {
    return {
      data: likedPostsQuery.data || [],
      isLoading: likedPostsQuery.isLoading,
      isError: likedPostsQuery.isError,
    };
  } else if (postType === 'repost') {
    return {
      data: repostsQuery.data || [],
      isLoading: repostsQuery.isLoading,
      isError: repostsQuery.isError,
    };
  } else {
    return {
      data: regularPostsQuery.data || [],
      isLoading: regularPostsQuery.isLoading,
      isError: regularPostsQuery.isError,
    };
  }
};

export default useGetPostsByType;
