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
    <div className='flex-center hover:bg-primary p-2 rounded-full w-fit h-fit active:scale-95 cursor-pointer'>
      <button
        type='button'
        disabled={isLoading}
        title={isBookmarkedByMe ? 'Unsave' : 'Save'}
        onClick={() => toggleBookmark({ id: bookmarkInfo.id })}
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
