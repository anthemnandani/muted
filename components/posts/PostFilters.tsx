import type { PostFilter, PostView } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';
import PostFilterButton from '../buttons/PostFilterButton';
import { Separator } from '../ui/separator';
import PostViewSelector from './PostViewSelector';

interface PostFiltersProps {
  filters: PostFilter[];
  handleFilterToggle: (filter: PostFilter) => void;
  view: PostView;
  onViewChange: (view: PostView) => void;
}

const PostFilters = ({
  filters,
  handleFilterToggle,
  view,
  onViewChange,
}: PostFiltersProps) => {
  return (
    <React.Fragment>
      <div className='py-3 px-2 md:px-4'>
        <div className='flex justify-between mb-2'>
          <div
            className={cn(
              'text-zinc-400 dark:text-gray-3 cursor-pointer',
              filters.includes('ALL') &&
                'text-gray-3 dark:text-zinc-200 underline'
            )}
            onClick={() => handleFilterToggle('ALL')}
          >
            All
          </div>
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-2 sm:gap-3'>
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
            </div>
            <div className='flex items-center gap-2 sm:gap-3'>
              <PostFilterButton
                filters={filters}
                handleFilterToggle={handleFilterToggle}
                btnTitle='Portfolio'
                targetFilter='PORTFOLIO'
              />
              <PostFilterButton
                filters={filters}
                handleFilterToggle={handleFilterToggle}
                btnTitle='Reels'
                targetFilter='REELS'
              />
              {!filters.includes('ALL') && filters.length > 0 && (
                <button
                  onClick={() => handleFilterToggle('ALL')}
                  className='text-xs sm:text-sm text-zinc-500 hover:text-gray-4 dark:text-gray-3 dark:hover:text-zinc-200'
                >
                  clear all
                </button>
              )}
            </div>
          </div>
          <PostViewSelector view={view} onViewChange={onViewChange} />
        </div>
      </div>
      <Separator />
    </React.Fragment>
  );
};

export default PostFilters;
