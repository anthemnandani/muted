'use client';
import { Bookmark, Check } from 'lucide-react';
import { useState } from 'react';
import { Icons } from '../icons';
import MenuItem from '../shared/MenuItem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ThreadFilter } from '@/lib/types';

const ThreadFilterMenu = () => {
  const [selectedFilter, setSelectedFilter] = useState('For you');
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
          onClick={() => setSelectedFilter(ThreadFilter.FOR_YOU)}
        />
        <MenuItem
          icon={selectedFilter === ThreadFilter.FOLLOWING ? Check : null}
          label={ThreadFilter.FOLLOWING}
          className='flex-between focus:rounded-lg !py-4'
          isActionMenuItem
          onClick={() => setSelectedFilter(ThreadFilter.FOLLOWING)}
        />
        <MenuItem
          icon={selectedFilter === ThreadFilter.LIKED ? Check : null}
          label={ThreadFilter.LIKED}
          className='flex-between focus:rounded-lg !py-4'
          isActionMenuItem
          onClick={() => setSelectedFilter(ThreadFilter.LIKED)}
        />
        <MenuItem
          icon={selectedFilter === ThreadFilter.SAVED ? Check : null}
          label={ThreadFilter.SAVED}
          className='flex-between focus:rounded-lg !py-4'
          isActionMenuItem
          onClick={() => setSelectedFilter(ThreadFilter.SAVED)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThreadFilterMenu;
