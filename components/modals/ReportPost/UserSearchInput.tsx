'use client';

import { Input } from '@/components/ui/input';
import { type AuthorInfoProps } from '@/lib/types';
import { useReportStore } from '@/store/reportStore';
import { api } from '@/trpc/react';
import { debounce } from 'lodash';
import { Loader2, Search, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import UserCard from './UserCard';

const UserSearchInput = () => {
  const [searchText, setSearchText] = useState('');
  const [debouncedText, setDebouncedText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { setTargetUserId, targetUserId } = useReportStore();

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedText(value);
    }, 300),
    [setDebouncedText]
  );

  const { data: users, isLoading } = api.user.searchUsers.useQuery({
    searchQuery: debouncedText,
    targetUserId: targetUserId ?? undefined,
  });

  const handleClearSearch = () => {
    setSearchText('');
    setTargetUserId(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleUserSelection = (user: AuthorInfoProps) => {
    if (targetUserId === user.id) {
      setTargetUserId(null);
    } else {
      setTargetUserId(user.id);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  return (
    <div className='px-5 py-4'>
      <div className='mb-4'>
        <h3 className='text-white/90 mb-2'>
          Provide the person's account name
        </h3>
        <div className='relative'>
          <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
            <Search className='size-5 text-white/50' />
          </div>
          <Input
            ref={inputRef}
            type='text'
            value={searchText}
            onChange={handleSearch}
            className='pl-10 pr-10 py-2 h-12 bg-white/20 border-none rounded-md text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0'
            placeholder='Search'
            autoFocus
          />
          {searchText && (
            <button
              className='absolute inset-y-0 right-3 flex items-center'
              onClick={handleClearSearch}
              type='button'
            >
              <X className='size-5 text-white/50' />
            </button>
          )}
        </div>
      </div>
      {debouncedText.length > 0 &&
        (isLoading ? (
          <div className='flex-center mt-4'>
            <Loader2 className='size-10 animate-spin' />
          </div>
        ) : (
          <div className='bg-[#121212] max-h-60 overflow-y-auto'>
            {users && users.length > 0 ? (
              users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  handleUserSelection={handleUserSelection}
                  targetUserId={targetUserId || null}
                />
              ))
            ) : (
              <div className='p-4 text-center text-white/60'>
                No users found
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default UserSearchInput;
