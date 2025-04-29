import type { ProfileFilter } from '@/lib/types';
import { api } from '@/trpc/react';
import { useState } from 'react';

interface UseGetPostsByTypeProps {
  postType: string;
  username: string;
  sortBy: ProfileFilter;
  collectionId: string | null;
}

const useGetPostsByType = ({
  postType,
  username,
  sortBy,
  collectionId,
}: UseGetPostsByTypeProps) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const regularPostsQuery = api.user.getUserPosts.useQuery(
    { username, sortBy },
    {
      enabled: !!username && postType === 'post',
      staleTime: 10 * 60 * 1000,
      retry: false,
      onError: (error) => {
        if (error.data?.code === 'FORBIDDEN') {
          setIsBlocked(true);
        }
      },
    }
  );

  const likedPostsQuery = api.user.getUserLikedPostsFeed.useQuery(
    { username },
    {
      enabled: !!username && postType === 'liked',
      staleTime: 10 * 60 * 1000,
      retry: false,
      onError: (error) => {
        if (error.data?.code === 'FORBIDDEN') {
          setIsBlocked(true);
        }
      },
    }
  );

  const repostsQuery = api.user.getUserRepostsFeed.useQuery(
    { username },
    {
      enabled: !!username && postType === 'repost',
      staleTime: 10 * 60 * 1000,
      retry: false,
      onError: (error) => {
        if (error.data?.code === 'FORBIDDEN') {
          setIsBlocked(true);
        }
      },
    }
  );

  const collectionPostsQuery = api.collection.getCollectionPosts.useQuery(
    { id: collectionId },
    {
      enabled: !!collectionId && postType === 'collection',
      staleTime: 10 * 60 * 1000,
      retry: false,
      onError: (error) => {
        if (error.data?.code === 'FORBIDDEN') {
          setIsBlocked(true);
        }
      },
    }
  );

  if (postType === 'liked') {
    return {
      data: likedPostsQuery.data || [],
      isLoading: likedPostsQuery.isLoading,
      isError: likedPostsQuery.isError,
      isBlocked,
    };
  } else if (postType === 'repost') {
    return {
      data: repostsQuery.data || [],
      isLoading: repostsQuery.isLoading,
      isError: repostsQuery.isError,
      isBlocked,
    };
  } else if (postType === 'collection') {
    return {
      data: collectionPostsQuery.data || [],
      isLoading: collectionPostsQuery.isLoading,
      isError: collectionPostsQuery.isError,
      isBlocked,
    };
  } else {
    return {
      data: regularPostsQuery.data || [],
      isLoading: regularPostsQuery.isLoading,
      isError: regularPostsQuery.isError,
      isBlocked,
    };
  }
};

export default useGetPostsByType;
