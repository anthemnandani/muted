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

  const { data: searchResults, isLoading } =
    api.search.getSearchSuggestions.useQuery(
      { query: debouncedText, limit: 8 },
      { enabled: debouncedText.length > 0, refetchOnWindowFocus: false }
    );

  const { mutate: recordSearch } = api.search.recordSearch.useMutation();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      recordSearch({ query: searchQuery.trim() });
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    recordSearch({ query: suggestion });
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    onClose();
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className={`fixed top-0 left-[76px] h-screen bg-background shadow-[5px_0px_15px_rgba(0,0,0,0.25)] transition-all duration-300 ${
        isOpen ? 'w-[20rem] visible border-l border-white/5' : 'w-0 hidden'
      }`}
    >
      <div className='p-2'>
        <div className='h-[4.4rem] pt-4 pl-2'>
          <div className='flex items-center'>
            <h2 className='text-xl font-bold text-white/90 tracking-[0.3px]'>
              Search
            </h2>
            <button
              onClick={onClose}
              className='ml-auto bg-white-13 hover:bg-white/20 transition-colors duration-150 size-7 rounded-full flex-center'
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
          <Search size={16} className='text-white/60 mr-2' />
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
            className='text-sm border-none outline-none w-full bg-transparent text-white/90 text-ellipsis'
          />

          {searchQuery.length > 0 && isLoading ? (
            <div className='pr-2'>
              <Loader2 className='size-5 animate-spin' />
            </div>
          ) : searchQuery.length > 0 ? (
            <button
              type='button'
              onClick={clearSearch}
              className='flex-center size-5 pr-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors'
            >
              <X size={16} className='text-white/90' />
            </button>
          ) : null}
        </form>

        {searchResults?.suggestions && searchResults.suggestions.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default SearchSidebar;
