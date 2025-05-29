'use client';

import { useSearchStore } from '@/store/searchStore';
import { api } from '@/trpc/react';
import { debounce } from 'lodash';
import { Loader2, Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import SidebarWrapper from '../shared/SidebarWrapper';

const SearchSidebar = () => {
  const { isSearchOpen, setIsSearchOpen } = useSearchStore();
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

  const { mutate: trackSearch } = api.search.trackSearch.useMutation();

  const {
    data: users,
    isLoading,
    isFetching,
  } = api.search.getSearchResults.useQuery(
    { query: debouncedText },
    {
      enabled: debouncedText.length > 0,
      cacheTime: 0,
      staleTime: 0,
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: suggestions,
    isLoading: isLoadingSuggestions,
    isFetching: isFetchingSuggestions,
  } = api.search.getSearchSuggestions.useQuery(
    { query: debouncedText, limit: 8 },
    {
      enabled: debouncedText.length > 0,
      cacheTime: 0,
      staleTime: 0,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
    if (!isSearchOpen) {
      setSearchQuery('');
      setDebouncedText('');
    }
  }, [isSearchOpen]);

  const trackSearchAndNavigate = (query: string) => {
    if (query.trim()) {
      trackSearch({ query: query.trim() });

      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    trackSearchAndNavigate(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedText('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    trackSearch({ query: suggestion });
    setSearchQuery(suggestion);
    setDebouncedText(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    setIsSearchOpen(false);
  };

  const handleUserClick = (username: string) => {
    router.push(`/@${username}`);
    setIsSearchOpen(false);
  };

  const handleViewAllResults = () => {
    trackSearchAndNavigate(debouncedText);
    setIsSearchOpen(false);
  };

  return (
    <SidebarWrapper
      isOpen={isSearchOpen}
      setIsOpen={setIsSearchOpen}
      title='Search'
    >
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

        {(isLoading ||
          isFetching ||
          isLoadingSuggestions ||
          isFetchingSuggestions) &&
        debouncedText.length > 0 ? (
          <div className='pr-2'>
            <Loader2 size={16} className='animate-spin text-white/50' />
          </div>
        ) : searchQuery.length > 0 ? (
          <button
            type='button'
            onClick={clearSearch}
            className='flex-center size-4 mr-1 rounded-full bg-white/35'
          >
            <X size={12} className='text-black' />
          </button>
        ) : null}
      </form>

      {debouncedText.length > 0 && (
        <div className='mt-4'>
          {suggestions && suggestions.length > 0 && (
            <div className='space-y-1 mt-2 mb-4'>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className='w-full flex items-center gap-3 hover:bg-[#121212] p-2 rounded-md transition-colors text-left'
                >
                  <div className='size-8 flex-center bg-white/10 rounded-full flex-shrink-0'>
                    <Search size={14} className='text-white/90' />
                  </div>
                  <span className='text-white/90 text-sm truncate'>
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          )}
          {users && users.length > 0 && (
            <div className='mb-4'>
              <div className='px-2 pb-2'>
                <h3 className='text-sm font-medium text-white/50'>Accounts</h3>
              </div>
              <div className='space-y-1'>
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user.username)}
                    className='w-full flex items-center gap-3 hover:bg-white/5 p-2 rounded-md transition-colors text-left'
                  >
                    <div className='size-10 rounded-full bg-white/10 overflow-hidden flex-shrink-0'>
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.username}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex-center bg-white/10 text-white/90'>
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
            className='w-full text-left px-4 py-3 hover:bg-white/5 transition-colors rounded-md'
          >
            <span className='text-sm font-medium text-white/90 text-ellipsis overflow-hidden'>
              View all results for “{debouncedText}”
            </span>
          </button>
        </div>
      )}
    </SidebarWrapper>
  );
};

export default SearchSidebar;
