'use client';

import useDevice from '@/hooks/useDevice';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Icons } from '../icons';
import { ScrollArea } from '../ui/scroll-area';
import CollectionCover from './CollectionCover';
import type { BookmarkInfo } from '@/lib/types';

const CollectionsList = ({ bookmarkInfo }: { bookmarkInfo: BookmarkInfo }) => {
  const { isMobile } = useDevice();
  const { user } = useUser();
  const { data, isLoading, hasNextPage, fetchNextPage } =
    api.collection.getUserCollections.useInfiniteQuery(
      { username: user?.username ?? '' },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: false,
      }
    );

  const allCollections = data?.pages.flatMap((page) => page.collections);

  if (isLoading)
    return (
      <div className='flex-center h-20'>
        <Loader2 className='size-11 animate-spin' />
      </div>
    );

  if (allCollections?.length === 0)
    return (
      <div className='flex-center h-20 text-gray-3'>No collections found</div>
    );

  return (
    <ScrollArea
      className={cn(
        'max-h-[200px] overflow-y-auto flex flex-col',
        isMobile ? 'p-2.5' : 'p-3'
      )}
      type='always'
    >
      <InfiniteScroll
        dataLength={allCollections?.length ?? 0}
        next={fetchNextPage}
        hasMore={hasNextPage ?? false}
        loader={
          <div className='h-[80px] w-full flex-center mb-[10vh] sm:mb-0'>
            <Icons.loading className='size-11' />
          </div>
        }
      >
        {allCollections
          ?.filter((c) => !c.isDefault)
          .map((collection) => (
            <CollectionCover
              key={collection.id}
              collection={collection}
              postId={bookmarkInfo.id}
              bookmarks={bookmarkInfo.bookmarks}
            />
          ))}
      </InfiniteScroll>
    </ScrollArea>
  );
};

export default CollectionsList;
