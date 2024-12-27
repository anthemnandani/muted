import type { PostFilter } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';
import PostFilterButton from '../buttons/PostFilterButton';
import { Separator } from '../ui/separator';
import PostViewSelector from './PostViewSelector';

interface PostFiltersProps {
  filters: PostFilter[];
  handleFilterToggle: (filter: PostFilter) => void;
}

const PostFilters = ({ filters, handleFilterToggle }: PostFiltersProps) => {
  return (
    <React.Fragment>
      <div className='flex justify-between py-4 px-2 md:px-4'>
        <div className='flex gap-5'>
          <div
            className={cn(
              'text-zinc-500 dark:text-gray-3',
              filters.includes('ALL') &&
                'text-gray-3 dark:text-zinc-200 underline'
            )}
            onClick={() => handleFilterToggle('ALL')}
          >
            All
          </div>
        </div>
        <div className='flex transform gap-1 whitespace-nowrap px-3'>
          <div className='flex flex-wrap items-center gap-2'>
            <PostFilterButton
              filters={filters}
              handleFilterToggle={handleFilterToggle}
              btnTitle='Text'
              targetFilter='TEXT'
            />

            <PostFilterButton
              filters={filters}
              handleFilterToggle={handleFilterToggle}
              btnTitle='Replies'
              targetFilter='REPLIES'
            />

            <PostFilterButton
              filters={filters}
              handleFilterToggle={handleFilterToggle}
              btnTitle='Reposts'
              targetFilter='REPOSTS'
            />

            {!filters.includes('ALL') && filters.length > 0 && (
              <button
                onClick={() => handleFilterToggle('ALL')}
                className='text-sm text-zinc-500 hover:text-gray-4 dark:text-gray-3 dark:hover:text-zinc-200'
              >
                clear all
              </button>
            )}
          </div>
        </div>
        <PostViewSelector />
      </div>
      <Separator />
    </React.Fragment>
  );
};

export default PostFilters;
