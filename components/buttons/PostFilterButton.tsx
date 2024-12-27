import type { PostFilter } from '@/lib/types';
import React from 'react';
import { cn } from '@/lib/utils';

interface PostFilterButtonProps {
  filters: PostFilter[];
  handleFilterToggle: (filter: PostFilter) => void;
  btnTitle: string;
  targetFilter: PostFilter;
}

const PostFilterButton = ({
  filters,
  handleFilterToggle,
  btnTitle,
  targetFilter,
}: PostFilterButtonProps) => {
  return (
    <button
      className={cn(
        'flex items-center gap-1 rounded-full border border-border-dark dark:border-border-light px-3 py-0.5 text-sm transition',
        filters.includes(targetFilter)
          ? 'bg-zinc-900 hover:bg-black text-white dark:bg-zinc-200 dark:text-black dark:hover:bg-white'
          : 'text-zinc-500 hover:text-gray-4 dark:text-gray-3 dark:hover:text-zinc-200'
      )}
      onClick={() => handleFilterToggle(targetFilter)}
    >
      {btnTitle}
    </button>
  );
};

export default PostFilterButton;
