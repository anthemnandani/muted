'use client';

import useBookmark from '@/hooks/useBookmark';
import type { CollectionCoverProps } from '@/lib/types';
import { getVideoThumbnailUrl } from '@/lib/utils';
import { Check } from 'lucide-react';
import Image from 'next/image';
import DefaultCollectionCover from './DefaultCollectionCover';

const CollectionCover = ({
  collection,
  postId,
  bookmarks,
}: CollectionCoverProps) => {
  const { bookmarks: collectionBookmarks, name } = collection;

  const { toggleBookmark, isBookmarkedInTarget } = useBookmark({
    bookmarks,
    postId,
    collectionId: collection?.id,
  });

  const handleCollectionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleBookmark();
  };

  const firstMedia = collectionBookmarks[0]?.media[0];
  const isVideo = firstMedia?.fileType === 'video';

  const renderContent = () => (
    <div className='flex-between w-full mb-3'>
      <button
        type='button'
        className='flex items-center gap-3 w-full transition-opacity duration-200'
      >
        <div className='aspect-square relative inline-block size-10 rounded-md bg-zinc-800'>
          {collectionBookmarks.length === 0 ? (
            <DefaultCollectionCover className='text-black' />
          ) : (
            <Image
              src={
                !isVideo
                  ? firstMedia.fileUrl!
                  : getVideoThumbnailUrl(
                      firstMedia.playbackId as string,
                      firstMedia.thumbnailToken as string
                    )
              }
              alt='collection-cover'
              fill
              unoptimized={isVideo}
              className='object-cover rounded-md'
            />
          )}
        </div>

        <h2 className='overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold'>
          {name}
        </h2>
      </button>

      {isBookmarkedInTarget && <Check className='size-4 text-primary-blue' />}
    </div>
  );

  return (
    <button className='w-full relative' onClick={handleCollectionClick}>
      {renderContent()}
    </button>
  );
};

export default CollectionCover;
