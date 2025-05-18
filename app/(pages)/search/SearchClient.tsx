'use client';

import { useSearchParams } from 'next/navigation';
import SearchHeader from './components/SearchHeader';
import NotFound from '@/app/not-found';

const SearchClient = () => {
  const params = useSearchParams();
  const query = params.get('q')?.trim();

  if (!query) {
    return <NotFound />;
  }

  return (
    <div className='main-container md:!pt-0 !max-w-[1200px]'>
      <div className='flex flex-col flex-[1_1_auto]'>
        <SearchHeader query={query} />
      </div>
    </div>
  );
};

export default SearchClient;
