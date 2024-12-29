import type { PostView } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Icons } from '../icons';

interface PostViewSelectorProps {
  view: PostView;
  onViewChange: (view: PostView) => void;
}

const PostViewSelector = ({ view, onViewChange }: PostViewSelectorProps) => {
  return (
    <div>
      <div className='flex items-center'>
        <div className='mr-3 text-gray-3 dark:text-zinc-200'>View:</div>
        <Icons.list
          className={cn(
            'mr-2 size-5 flex-shrink-0 stroke-2 transition hover:cursor-pointer',
            view === 'LIST'
              ? 'text-gray-3 dark:text-zinc-200'
              : 'text-zinc-300 hover:text-zinc-400 dark:text-gray-3 dark:hover:text-zinc-400'
          )}
          onClick={() => onViewChange('LIST')}
        />
        <Icons.grid
          className={cn(
            'size-5 flex-shrink-0 stroke-2 transition hover:cursor-pointer',
            view === 'GRID'
              ? 'text-gray-3 dark:text-zinc-200'
              : 'text-zinc-300 hover:text-zinc-400 dark:text-gray-3 dark:hover:text-zinc-400'
          )}
          onClick={() => onViewChange('GRID')}
        />
      </div>
    </div>
  );
};

export default PostViewSelector;
