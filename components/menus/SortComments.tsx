'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import useSortByComments from '@/store/sortByComments';
import { Check, ChevronDown } from 'lucide-react';
import { Icons } from '../icons';
import { Separator } from '../ui/separator';

const SortComments = ({ isThread = false }: { isThread?: boolean }) => {
  const { sortBy, setSortBy } = useSortByComments();
  return (
    <DropdownMenu>
      {isThread ? (
        <DropdownMenuTrigger className='flex items-center gap-1 text-sm text-white/75 hover:text-white transition-colors outline-none'>
          {sortBy === 'LATEST' ? 'Newest' : 'Oldest'}
          <ChevronDown className='size-4' />
        </DropdownMenuTrigger>
      ) : (
        <DropdownMenuTrigger asChild>
          <button
            type='button'
            title='Sort Comments'
            className='text-gray-400 flex gap-1 select-none items-center text-[15px] cursor-pointer'
          >
            <Icons.filter className='size-6 select-none transform active:scale-75 transition-transform' />
          </button>
        </DropdownMenuTrigger>
      )}

      <DropdownMenuContent
        className='min-w-[190px] p-0 bg-background rounded-xl'
        align='end'
      >
        <DropdownMenuItem
          className='px-4 py-3 cursor-pointer'
          onClick={() => setSortBy('LATEST')}
        >
          <span className='text-sm font-normal'>Newest First</span>
          {sortBy === 'LATEST' && (
            <span className='text-sm font-normal'>
              <Check className='ml-1 size-4' />
            </span>
          )}
        </DropdownMenuItem>
        <Separator />
        <DropdownMenuItem
          className='px-4 py-3 cursor-pointer'
          onClick={() => setSortBy('OLDEST')}
        >
          <span className='text-sm font-normal'>Oldest First</span>
          {sortBy === 'OLDEST' && (
            <span className='text-sm font-normal'>
              <Check className='ml-1 size-4' />
            </span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortComments;
