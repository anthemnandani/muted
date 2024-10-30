'use client';

import useBookmark from '@/hooks/useBookmark';
import { PostProps } from '@/lib/types';
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
  const { toggleBookmark, isBookmarkedByMe, bookmarksCount, isLoading } =
    useBookmark({ bookmarkInfo });

  return (
    <div className='icon-container-hover'>
      <button
        type='button'
        disabled={isLoading}
        title={isBookmarkedByMe ? 'Unsave' : 'Save'}
        onClick={() => toggleBookmark({ id: bookmarkInfo.id })}
        className='flex items-center gap-2 z-[2] relative'
      >
        <Bookmark
          fill={isBookmarkedByMe ? 'currentColor' : 'transparent'}
          className='size-5'
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
