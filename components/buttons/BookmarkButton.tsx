'use client';

import useBookmark from '@/hooks/useBookmark';
import { PostProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Bookmark } from 'lucide-react';
import React from 'react';

interface BookmarkButtonProps {
  bookmarkInfo: Pick<PostProps, 'id' | 'bookmarks' | 'bookmarksCount'>;
  isParentPost?: boolean;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  bookmarkInfo,
  isParentPost,
}) => {
  const { isBookmarkedByMe, isLoading, toggleBookmark, bookmarksCount } =
    useBookmark({
      bookmarkInfo,
    });

  return (
    <div className='icon-container-hover'>
      <button
        type='button'
        disabled={isLoading}
        title={isBookmarkedByMe ? 'Unsave' : 'Save'}
        onClick={() =>
          toggleBookmark({ postId: bookmarkInfo.id!, isDefault: true })
        }
        className='flex items-center gap-2 z-[2] relative'
      >
        <Bookmark
          fill={isBookmarkedByMe ? 'currentColor' : 'transparent'}
          className={cn(
            'size-5 transition-colors',
            isLoading && 'opacity-50',
            isBookmarkedByMe && 'text-primary-blue'
          )}
        />
      </button>
      {bookmarksCount > 0 && !isParentPost && (
        <span className='text-[13px] text-gray-4 dark:text-gray-2 ml-2'>
          {bookmarksCount}
        </span>
      )}
    </div>
  );
};

export default BookmarkButton;
