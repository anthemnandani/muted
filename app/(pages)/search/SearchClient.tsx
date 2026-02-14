'use client';

import NotFound from '@/app/not-found';
import useVideoPlayer from '@/store/videoPlayer';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import SearchHeader from './components/SearchHeader';

const SearchClient = () => {
  const params = useSearchParams();
  const { setCurrentlyPlaying } = useVideoPlayer();
  const query = decodeURIComponent(params?.get('q')?.trim() || '');

  useEffect(() => {
    if (query) {
      setCurrentlyPlaying(null);
    }
  }, [query, setCurrentlyPlaying]);

  if (!query) {
    return <NotFound />;
  }

  return (
    <main className='flex justify-between w-screen max-w-full flex-auto self-center'>
      <div className='main-container md:!pt-0 !max-w-[1200px]'>
        <div className='flex flex-col flex-[1_1_auto]'>
          <SearchHeader query={query} />
        </div>
      </div>
    </main>
  );
};

export default SearchClient;
