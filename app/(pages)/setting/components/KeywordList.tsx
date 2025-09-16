'use client';

import { Icons } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KeywordListProps } from '@/lib/types';
import InfiniteScroll from 'react-infinite-scroll-component';
import KeywordListItem from './KeywordListItem';

export const KeywordList = ({
  keywords,
  totalCount,
  fetchNextPage,
  hasNextPage,
  onDelete,
  isDeleting,
  onEdit,
}: KeywordListProps) => {
  return (
    <div className='mt-6'>
      <div className='custom-separator'></div>
      <div className='flex mt-9 mb-6'>
        <span className='text-base font-medium text-white/85'>
          Filtered Keywords
        </span>
        <span className='ml-1 text-base text-white/60'>{totalCount}</span>
      </div>
      <ScrollArea
        className='max-h-[45vh] overflow-y-auto flex flex-col'
        thumbClassName='dark:bg-zinc-700'
        type='always'
      >
        <InfiniteScroll
          dataLength={keywords.length}
          next={fetchNextPage}
          hasMore={hasNextPage}
          loader={
            <div className='h-[80px] w-full flex-center'>
              <Icons.loading className='size-11' />
            </div>
          }
        >
          {keywords.map((keyword) => (
            <KeywordListItem
              key={keyword.id}
              item={keyword}
              onDelete={onDelete}
              isDeleting={isDeleting}
              onEdit={onEdit}
            />
          ))}
        </InfiniteScroll>
      </ScrollArea>
    </div>
  );
};
