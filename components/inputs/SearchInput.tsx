'use client';

import { debounce } from 'lodash';
import React, { useCallback, useState } from 'react';
import { Icons } from '../icons';

interface SearchInputProps {
  onSearch: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onSearch(value);
    }, 300),
    [onSearch]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    debouncedSearch(value);
  };

  const clearSearch = () => {
    setSearchValue('');
    onSearch('');
  };

  return (
    <div className='rounded-2xl border border-border bg-primary-foreground mb-3 transition-transform duration-300 mr-2 md:mr-4'>
      <div className='relative w-full flex px-3 py-2 ring-offset-background placeholder:text-muted-foreground pl-14 pr-14 h-[44px]'>
        <Icons.search className='size-4 text-[#b8b8b8] dark:text-[#4d4d4d] absolute left-6 top-1/2 -translate-y-1/2' />

        <input
          value={searchValue}
          className='resize-none text-base bg-transparent w-full placeholder:text-gray-3 outline-none placeholder:text-[15px]'
          placeholder='Search'
          onChange={handleSearch}
        />

        {searchValue && (
          <button
            onClick={clearSearch}
            className='absolute right-6 top-1/2 -translate-y-1/2'
          >
            <Icons.X className='size-4 text-[#4D4D4D]' />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;
