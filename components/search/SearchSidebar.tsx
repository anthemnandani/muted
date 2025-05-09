'use client';

import { Loader2, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';
import { debounce } from 'lodash';
import { api } from '@/trpc/react';

const SearchSidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedText, setDebouncedText] = useState('');

  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedText(value);
    }, 500),
    []
  );

  const { data: users, isLoading } = api.search.getSearchResults.useQuery(
    { query: debouncedText },
    {
      enabled: debouncedText.length > 0,
    }
  );

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleUserClick = (username: string) => {
    router.push(`/@${username}`);
    onClose();
  };

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  return (
    <div
      className='fixed left-[76px] top-0 h-screen w-[20rem] bg-background shadow-[5px_0px_15px_rgba(0,0,0,0.25)] border-l border-white/5 overflow-hidden transition-transform duration-300 ease-in-out z-10'
      style={{
        transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        pointerEvents: isOpen ? 'auto' : 'none',
        opacity: isOpen ? 1 : 0,
      }}
    >
      <div className='p-2 w-full'>
        <div className='h-[4.4rem] pt-4 pl-2'>
          <div className='flex items-center'>
            <h2 className='text-xl font-bold text-white/90'>Search</h2>
            <button
              onClick={onClose}
              className='ml-auto bg-white/10 hover:bg-white/20 transition-colors duration-150 size-7 rounded-full flex-center'
            >
              <X size={16} className='text-white/90' />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSearch}
          className={`flex items-center py-2.5 pl-4 pr-1 bg-white/10 rounded-[92px] relative overflow-hidden transition-all duration-150 ${
            isFocused ? 'ring-1 ring-white/25' : ''
          }`}
        >
          <input
            ref={inputRef}
            type='text'
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              debouncedSearch(e.target.value);
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder='Search'
            className='text-sm border-none outline-none w-full bg-transparent text-white/90 text-ellipsis placeholder:text-white/25'
          />

          {isLoading ? (
            <div className='pr-2'>
              <Loader2 size={16} className='animate-spin text-white/50' />
            </div>
          ) : searchQuery.length > 0 ? (
            <button
              type='button'
              onClick={clearSearch}
              className='flex items-center justify-center w-6 h-6 mr-1 rounded-full hover:bg-white/20 transition-colors'
            >
              <X size={14} className='text-white/90' />
            </button>
          ) : null}
        </form>

        {/* {searchResults?.suggestions && searchResults.suggestions.length > 0 && (
          <div className='space-y-1 mt-4'>
            {searchResults.suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className='w-full flex items-center gap-3 hover:bg-white/10 p-2 rounded-md transition-colors text-left'
              >
                <div className='size-8 flex-center bg-white/10 rounded-full flex-shrink-0'>
                  <Search size={14} className='text-white/90' />
                </div>
                <span className='text-white/90 text-sm truncate'>
                  {suggestion.text}
                </span>
              </button>
            ))}
          </div>
        )} */}
        {searchQuery.length > 0 && (
          <div className='mt-4'>
            {/* User results */}
            {users && users.length > 0 && (
              <div className='mb-4'>
                <div className='px-2 pb-2'>
                  <h3 className='text-sm font-medium text-white/50'>
                    Accounts
                  </h3>
                </div>
                <div className='space-y-1'>
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleUserClick(user.username)}
                      className='w-full flex items-center gap-3 hover:bg-white/10 p-2 rounded-md transition-colors text-left'
                    >
                      <div className='w-10 h-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0'>
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.username}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center bg-white/10 text-white/90'>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className='overflow-hidden'>
                        <div className='font-medium text-white/90 text-sm truncate'>
                          {user.username}
                        </div>
                        {user.fullName && (
                          <div className='text-white/50 text-xs truncate'>
                            {user.fullName}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleViewAllResults}
              className='w-full text-left px-4 py-3 hover:bg-white/10 transition-colors rounded-md'
            >
              <span className='text-sm font-medium text-white/90 text-ellipsis overflow-hidden'>
                View all results for “{searchQuery}”
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSidebar;
