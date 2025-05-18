import { type SearchTab } from '@/lib/types';
import { api } from '@/trpc/react';

interface UseGetSearchPostsProps {
  query: string;
  activeTab: SearchTab;
}

const useGetSearchPosts = ({ query, activeTab }: UseGetSearchPostsProps) => {
  const { data, isLoading: isLoadingTopPosts } =
    api.search.getTopResults.useInfiniteQuery(
      { query },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: activeTab === 'top',
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const topPosts = data?.pages.flatMap((page) => page.posts);

  const { data: userResults, isLoading: isLoadingUsers } =
    api.search.getUserResults.useInfiniteQuery(
      { query },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: activeTab === 'users',
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const users = userResults?.pages.flatMap((page) => page.users);

  const { data: videoResults, isLoading: isLoadingVideos } =
    api.search.getVideoPosts.useInfiniteQuery(
      { query },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: activeTab === 'videos',
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const videos = videoResults?.pages.flatMap((page) => page.posts);

  return {
    topPosts,
    isLoadingTopPosts,
    users,
    isLoadingUsers,
    videos,
    isLoadingVideos,
  };
};

export default useGetSearchPosts;
