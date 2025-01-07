'use client';

import type { Collection } from '@/lib/types';
import { cn, isImage, isVideo } from '@/lib/utils';
import { Check } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import DefaultCollectionCover from './DefaultCollectionCover';

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
  const isImageMedia = isImage(bookmarks[0]?.media?.fileType as string);
  const isVideoMedia = isVideo(bookmarks[0]?.media?.fileType as string);

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
      <div
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
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='1.5'
              stroke='currentColor'
              aria-hidden='true'
              className='text-black'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z'
              ></path>
            </svg>
          </div>
        ) : isVideoMedia ? (
          <div
            className={cn(
              'size-10 relative inline-block rounded-md bg-zinc-800',
              !isSaving && 'cursor-pointer'
            )}
          >
            <video
              src={bookmarks[0]?.media?.fileUrl as string}
              className='rounded-md object-contain w-full h-full'
              muted
            />
          </div>
        ) : !isImageMedia && bookmarks.length > 0 ? (
          <DefaultCollectionCover author={bookmarks[0]?.author} />
        ) : (
          <div
            className={cn(
              'aspect-square relative inline-block size-10 rounded-md bg-zinc-800',
              !isSaving && 'cursor-pointer'
            )}
          >
            <Image
              src={bookmarks[0]?.media?.fileUrl as string}
              alt='collection-cover'
              fill
              className='rounded-md object-cover'
            />
          </div>
        )}

        <h2 className='overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold'>
          {name}
        </h2>
      </div>

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
