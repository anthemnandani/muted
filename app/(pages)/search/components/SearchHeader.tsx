'use client';

import NotFound from '@/app/not-found';
import SkeletonTabs from '@/components/skeletons/SearchSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type SearchTab } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useSearchStore } from '@/store/searchStore';
import { api } from '@/trpc/react';
import { useState } from 'react';
import PostsGrid from './PostsGrid';
import Users from './Users';
import VideoPosts from './VideoPosts';

const SearchHeader = ({ query }: { query: string }) => {
  const { activeTab, setActiveTab } = useSearchStore();
  const [hoverTab, setHoverTab] = useState<string | null>(null);
  const [isTabsContainerHovered, setIsTabsContainerHovered] = useState(false);
  const tabs = [
    { id: 'top', label: 'Top' },
    { id: 'users', label: 'Users' },
    { id: 'videos', label: 'Videos' },
  ];

  const { data, isLoading, isFetching, isError, hasNextPage, fetchNextPage } =
    api.search.getTopResults.useInfiniteQuery(
      { query },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: activeTab === 'top',
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  if (isError) return <NotFound />;

  if (isLoading || isFetching) return <SkeletonTabs />;

  const topPosts = data?.pages.flatMap((page) => page.posts);

  return (
    <div className='sticky top-0 z-50'>
      <div className='w-full'>
        <Tabs
          defaultValue={activeTab}
          className='w-full'
          onValueChange={(value) => setActiveTab(value as SearchTab)}
        >
          <div className='flex-between w-full bg-[#222]'>
            <TabsList
              className='relative flex h-14 w-full bg-transparent'
              onMouseEnter={() => setIsTabsContainerHovered(true)}
              onMouseLeave={() => {
                setIsTabsContainerHovered(false);
                setHoverTab(null);
              }}
            >
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  onClick={() => setActiveTab(tab.id as SearchTab)}
                  className={cn(
                    'flex items-center w-full relative data-[state=active]:text-white text-white/60 transition-colors mx-4'
                  )}
                >
                  <div
                    className='group text-base font-semibold cursor-pointer relative w-full text-center'
                    onMouseEnter={() =>
                      isTabsContainerHovered && setHoverTab(tab.id)
                    }
                  >
                    <span className='font-medium transition-colors'>
                      {tab.label}
                    </span>
                    {(hoverTab === tab.id ||
                      (tab.id === activeTab && !hoverTab)) && (
                      <div
                        className={cn(
                          'absolute -bottom-3 left-0 right-0 h-[2px] bg-white/90',
                          hoverTab === tab.id && 'animate-tab-slide',
                          tab.id === activeTab && !hoverTab && 'scale-x-100'
                        )}
                      />
                    )}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value='top' className='w-full'>
            {topPosts && topPosts.length > 0 ? (
              <PostsGrid
                posts={topPosts!}
                fetchNextPage={fetchNextPage}
                hasNextPage={hasNextPage}
                postType='topPosts'
                query={query}
              />
            ) : (
              <div className='flex-center p-10'>
                <p className='text-white/70'>No posts found</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value='users' className='w-full'>
            <Users query={query} />
          </TabsContent>
          <TabsContent value='videos' className='w-full'>
            <VideoPosts query={query} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SearchHeader;
