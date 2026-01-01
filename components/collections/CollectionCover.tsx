'use client';

import useBookmark from '@/hooks/useBookmark';
import type { Collection } from '@/lib/types';
import { cn, getVideoThumbnailUrl } from '@/lib/utils';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';
import DefaultCollectionCover from './DefaultCollectionCover';

const CollectionCover = ({
  collection,
  postId,
}: {
  collection: Collection;
  postId: string;
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const { bookmarks, name } = collection;

  const { toggleBookmark, isBookmarkedByMe } = useBookmark();

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
  const isVideo = firstMedia?.fileType === 'video';

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

      {isBookmarkedByMe && <Check className='size-4 text-primary-blue' />}
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
