import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useSortBy from '@/store/sortBy';
import { ArrowUpDown } from 'lucide-react';

const SortFollowersAndFollowing = () => {
  const { setSortBy } = useSortBy();
  return (
    <div className='flex items-center gap-2'>
      <span className='text-sm text-muted-foreground'>Sort by:</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <ArrowUpDown className='size-5 cursor-pointer hover:opacity-70 transition-opacity' />
        </DropdownMenuTrigger>
        <DropdownMenuContent className='min-w-[180px] p-0' align='end'>
          <DropdownMenuItem
            className='px-4 py-3 cursor-pointer'
            onClick={() => setSortBy('latest')}
          >
            <span className='text-sm font-normal'>Date followed: latest</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className='px-4 py-3 cursor-pointer'
            onClick={() => setSortBy('earliest')}
          >
            <span className='text-sm font-normal'>Date followed: earliest</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SortFollowersAndFollowing;
