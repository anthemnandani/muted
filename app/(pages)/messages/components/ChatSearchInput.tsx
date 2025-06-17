import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import React from 'react';

const ChatSearchInput = ({
  searchQuery,
  setSearchQuery,
}: {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}) => {
  return (
    <div className='px-4 pb-4'>
      <div className='relative'>
        <Search
          className={cn(
            'absolute left-3 top-1/2 transform -translate-y-1/2 size-4',
            'text-white/40'
          )}
        />
        <input
          type='text'
          placeholder='Search conversations'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={cn(
            'w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10',
            'rounded-lg text-sm focus:outline-none text-white placeholder-white/40'
          )}
        />
      </div>
    </div>
  );
};

export default ChatSearchInput;
