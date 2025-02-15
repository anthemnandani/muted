'use client';

import type { Collection } from '@/lib/types';
import { cn, isGif, isImage, isVideo } from '@/lib/utils';
import { Check } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import DefaultCollectionCover from './DefaultCollectionCover';
import TextCollectionCover from './TextCollectionCover';

interface CollectionCoverProps {
  collection: Collection;
  onClick: () => Promise<void>;
  postId: string;
}

const CollectionCover = ({
  collection,
  onClick,
  postId,
}: CollectionCoverProps) => {
  const [isSaving, setIsSaving] = React.useState(false);
  const { bookmarks, name } = collection;
  const isImageMedia =
    isImage(bookmarks[0]?.media[0]?.fileType as string) ||
    isGif(bookmarks[0]?.media[0]?.fileType as string);
  const isVideoMedia = isVideo(bookmarks[0]?.media[0]?.fileType as string);

  const isBookmarked = bookmarks.some((bookmark) => bookmark.id === postId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await onClick();
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  const renderContent = () => (
    <div className='flex-between w-full mb-3'>
      <button
        type='button'
        className={cn(
          'flex items-center gap-3 w-full transition-opacity duration-200',
          isSaving && 'opacity-50'
        )}
      >
        {!isImageMedia && bookmarks.length === 0 ? (
          <div
            className={cn(
              'aspect-square relative inline-block size-10 rounded-md bg-zinc-800',
              !isSaving && 'cursor-pointer'
            )}
          >
            <DefaultCollectionCover className='text-black' />
          </div>
        ) : isVideoMedia ? (
          <div
            className={cn(
              'size-10 relative inline-block rounded-md bg-zinc-800',
              !isSaving && 'cursor-pointer'
            )}
          >
            <video
              src={bookmarks[0]?.media[0]?.fileUrl as string}
              className='rounded-md object-contain w-full h-full'
              muted
            />
          </div>
        ) : !isImageMedia && bookmarks.length > 0 ? (
          <TextCollectionCover author={bookmarks[0]?.author} />
        ) : (
          <div
            className={cn(
              'aspect-square relative inline-block size-10 rounded-md bg-zinc-800',
              !isSaving && 'cursor-pointer'
            )}
          >
            <Image
              src={bookmarks[0]?.media[0]?.fileUrl as string}
              alt='collection-cover'
              fill
              className='rounded-md object-cover'
            />
          </div>
        )}

        <h2 className='overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold'>
          {name}
        </h2>
      </button>

      {isBookmarked && <Check className='size-4 text-primary-blue' />}
    </div>
  );

  return (
    <button
      className={cn(
        'w-full relative',
        !isSaving && 'cursor-pointer',
        isSaving && 'cursor-wait'
      )}
      onClick={handleClick}
      disabled={isSaving}
    >
      {renderContent()}
    </button>
  );
};

export default CollectionCover;
