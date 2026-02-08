'use client';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type AuthorProps } from '@/lib/types';
import { useReportStore } from '@/store/reportStore';
import { api } from '@/trpc/react';
import { debounce } from 'lodash';
import { Loader2, Search, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import UserCard from './UserCard';

const UserSearchInput = ({ isUserReport }: { isUserReport: boolean }) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedText, setDebouncedText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { setTargetUserId, targetUserId } = useReportStore();

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedText(value);
    }, 500),
    [],
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const {
    data: users,
    isLoading,
    isFetching,
  } = api.user.searchUsers.useQuery(
    {
      searchQuery: debouncedText,
    },
    {
      refetchOnWindowFocus: false,
    },
  );

  const showResults = debouncedText.trim().length > 0;

  const handleClearSearch = () => {
    setSearchText('');
    setDebouncedText('');
    setTargetUserId(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleUserSelection = (user: AuthorProps) => {
    if (targetUserId === user.id) {
      setTargetUserId(null);
    } else {
      setTargetUserId(user.id);
    }
  };

  return (
    <div className='px-5 py-4'>
      <div className='mb-4'>
        <h3 className='text-white/90 mb-2.5'>
          {isUserReport
            ? 'Impersonated user'
            : "Provide the person's account name"}
        </h3>
        {isUserReport && (
          <p className='text-white/50 text-base antialiased mb-4'>
            Include the user name of the person being impersonated
          </p>
        )}
        <div className='relative'>
          <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none'>
            <Search className='size-5 text-white/50' />
          </div>
          <div className='relative'>
            <Input
              ref={inputRef}
              type='text'
              value={searchText}
              onChange={handleSearch}
              className='pl-10 pr-10 py-2 h-12 bg-white/20 border-none rounded-md text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0'
              placeholder={isUserReport ? 'Search for user name' : 'Search'}
              autoComplete='off'
              autoFocus
            />

            {searchText && (
              <div className='absolute inset-y-0 right-3 flex items-center'>
                <button
                  title='Clear Search'
                  onClick={handleClearSearch}
                  type='button'
                >
                  <X className='size-5 text-white/50' />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showResults && (
        <div ref={resultsRef} className='relative z-50'>
          {isLoading || isFetching ? (
            <div className='flex-center py-8 bg-[#252525] rounded-md'>
              <Loader2 className='size-8 animate-spin text-white/60' />
            </div>
          ) : (
            <ScrollArea className='bg-[#252525] max-h-60 overflow-y-auto rounded-md border border-white/10'>
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
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchInput;
