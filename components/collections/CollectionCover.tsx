'use client';

import type { Collection } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import DefaultCollectionCover from './DefaultCollectionCover';
import useBookmark from '@/hooks/useBookmark';
import { toast } from 'sonner';

interface CollectionCoverProps {
  collection: Collection;
  postId: string;
}

const CollectionCover = ({ collection, postId }: CollectionCoverProps) => {
  const [isSaving, setIsSaving] = React.useState(false);
  const { bookmarks, name } = collection;

  const isBookmarked = bookmarks.some((bookmark) => bookmark.id === postId);

  const { toggleBookmark } = useBookmark();

  const handleCollectionClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await toggleBookmark({ postId, collectionId: collection.id });
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  const firstMedia = bookmarks[0]?.media[0];

  const renderContent = () => (
    <div className='flex-between w-full mb-3'>
      <button
        type='button'
        className={cn(
          'flex items-center gap-3 w-full transition-opacity duration-200',
          isSaving && 'opacity-50'
        )}
      >
        <div
          className={cn(
            'aspect-square relative inline-block size-10 rounded-md bg-zinc-800',
            !isSaving && 'cursor-pointer'
          )}
        >
          {bookmarks.length === 0 ? (
            <DefaultCollectionCover className='text-black' />
          ) : (
            <Image
              src={
                firstMedia?.fileType === 'image'
                  ? firstMedia.fileUrl!
                  : firstMedia.thumbnailUrl!
              }
              alt='collection-cover'
              fill
              className='object-cover rounded-md'
            />
          )}
        </div>

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
      onClick={handleCollectionClick}
      disabled={isSaving}
    >
      {renderContent()}
    </button>
  );
};

export default CollectionCover;
