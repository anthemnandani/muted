'use client';

import NotFound from '@/app/not-found';
import useVideoPlayer from '@/store/videoPlayer';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import SearchHeader from './components/SearchHeader';

const SearchClient = () => {
  const params = useSearchParams();
  const { setCurrentlyPlaying } = useVideoPlayer();
  const query = decodeURIComponent(params.get('q')?.trim() || '');

  if (!query) {
    return <NotFound />;
  }

  useEffect(() => {
    setCurrentlyPlaying(null);
  }, []);

  return (
    <div className='main-container md:!pt-0 !max-w-[1200px]'>
      <div className='flex flex-col flex-[1_1_auto]'>
        <SearchHeader query={query} />
      </div>
    </div>
  );
};

export default SearchClient;
