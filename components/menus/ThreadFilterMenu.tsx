'use client';
import { ThreadFilter } from '@/lib/types';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Icons } from '../icons';
import MenuItem from '../shared/MenuItem';
import {
  DropdownMenu,
  DropdownMenuContent,
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

      <DropdownMenuContent className='dropdown-content-container p-2 w-[240px] rounded-2xl -mt-3'>
        <MenuItem
          icon={selectedFilter === ThreadFilter.FOR_YOU ? Check : null}
          label={ThreadFilter.FOR_YOU}
          className='flex-between focus:rounded-lg !py-4'
          isActionMenuItem
          onClick={() => router.push('/')}
        />
        <MenuItem
          icon={selectedFilter === ThreadFilter.FOLLOWING ? Check : null}
          label={ThreadFilter.FOLLOWING}
          className='flex-between focus:rounded-lg !py-4'
          isActionMenuItem
          onClick={() => router.push('/following')}
        />
        <MenuItem
          icon={selectedFilter === ThreadFilter.LIKED ? Check : null}
          label={ThreadFilter.LIKED}
          className='flex-between focus:rounded-lg !py-4'
          isActionMenuItem
          onClick={() => router.push('/liked')}
        />
        <MenuItem
          icon={selectedFilter === ThreadFilter.SAVED ? Check : null}
          label={ThreadFilter.SAVED}
          className='flex-between focus:rounded-lg !py-4'
          isActionMenuItem
          onClick={() => router.push('/saved')}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThreadFilterMenu;
