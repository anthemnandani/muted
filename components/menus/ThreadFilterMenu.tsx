'use client';
import { ThreadFilter } from '@/lib/types';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Icons } from '../icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

const ThreadFilterMenu = ({
  selectedFilter = ThreadFilter.FOR_YOU,
}: {
  selectedFilter?: ThreadFilter;
}) => {
  const router = useRouter();
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div className='flex-center gap-2 h-[60px] px-4'>
          <span className='text-sm font-semibold'>{selectedFilter}</span>
          <div className='icon-container'>
            <Icons.more className='size-3' />
          </div>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='shadow-xl bg-gray-6 z-[1000] w-[240px] rounded-2xl -mt-3'>
        <DropdownMenuItem
          className='dropdown-menu-item'
          onClick={() => router.push('/threads')}
        >
          {ThreadFilter.FOR_YOU}
          {selectedFilter === ThreadFilter.FOR_YOU && (
            <Check className='size-5' />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          className='dropdown-menu-item'
          onClick={() => router.push('/threads/following')}
        >
          {ThreadFilter.FOLLOWING}
          {selectedFilter === ThreadFilter.FOLLOWING && (
            <Check className='size-5' />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          className='dropdown-menu-item'
          onClick={() => router.push('/threads/liked')}
        >
          {ThreadFilter.LIKED}
          {selectedFilter === ThreadFilter.LIKED && (
            <Check className='size-5' />
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          className='dropdown-menu-item'
          onClick={() => router.push('/threads/saved')}
        >
          {ThreadFilter.SAVED}
          {selectedFilter === ThreadFilter.SAVED && (
            <Check className='size-5' />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThreadFilterMenu;
