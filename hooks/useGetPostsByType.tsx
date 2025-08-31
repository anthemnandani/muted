import type { ProfileFilter } from '@/lib/types';
import { api } from '@/trpc/react';
import { useState, useEffect } from 'react';

interface UseGetPostsByTypeProps {
  postType: string;
  username: string;
  sortBy: ProfileFilter;
  collectionId: string | null;
  query?: string;
}

const useGetPostsByType = ({
  postType,
  username,
  sortBy,
  collectionId,
  query,
}: UseGetPostsByTypeProps) => {
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMissingParams, setIsMissingParams] = useState(false);

  useEffect(() => {
    setIsMissingParams(false);

    if ((postType === 'topPosts' || postType === 'videoPosts') && !query) {
      setIsMissingParams(true);
    }

    if (postType === 'collection' && !collectionId) {
      setIsMissingParams(true);
    }

    if (
      (postType === 'post' || postType === 'liked' || postType === 'repost') &&
      !username
    ) {
      setIsMissingParams(true);
    }
  }, [postType, username, collectionId, query]);

  const regularPostsQuery = api.user.getUserPosts.useQuery(
    { username, sortBy },
    {
      enabled: !!username && postType === 'post' && !isMissingParams,
      staleTime: 10 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
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
      enabled: !!username && postType === 'liked' && !isMissingParams,
      staleTime: 10 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
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
      enabled: !!username && postType === 'repost' && !isMissingParams,
      staleTime: 10 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
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
      enabled: !!collectionId && postType === 'collection' && !isMissingParams,
      staleTime: 10 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
      onError: (error) => {
        if (error.data?.code === 'FORBIDDEN') {
          setIsBlocked(true);
        }
      },
    }
  );

  const topPostsQuery = api.search.getTopResultsFeed.useQuery(
    { query: query ?? '' },
    {
      enabled: !!query && postType === 'topPosts' && !isMissingParams,
      staleTime: 10 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  const videoPostsQuery = api.search.getVideoPostsFeed.useQuery(
    { query: query ?? '' },
    {
      enabled: !!query && postType === 'videoPosts' && !isMissingParams,
      staleTime: 10 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  if (isMissingParams) {
    return {
      data: [],
      isLoading: false,
      isError: true,
      isBlocked,
    };
  }

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
  } else if (postType === 'topPosts') {
    return {
      data: topPostsQuery.data || [],
      isLoading: topPostsQuery.isLoading,
      isError: topPostsQuery.isError,
      isBlocked,
    };
  } else if (postType === 'videoPosts') {
    return {
      data: videoPostsQuery.data || [],
      isLoading: videoPostsQuery.isLoading,
      isError: videoPostsQuery.isError,
      isBlocked,
    };
  } else if (postType === 'post') {
    return {
      data: regularPostsQuery.data || [],
      isLoading: regularPostsQuery.isLoading,
      isError: regularPostsQuery.isError,
      isBlocked,
    };
  } else {
    return {
      data: [],
      isLoading: false,
      isError: false,
    };
  }
};

export default useGetPostsByType;
