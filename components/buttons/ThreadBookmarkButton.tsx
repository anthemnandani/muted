'use client';

import useBookmark from '@/hooks/useBookmark';
import { PostProps } from '@/lib/types';
import { Bookmark } from 'lucide-react';
import React from 'react';

interface BookmarkButtonProps {
  bookmarkInfo: Pick<PostProps, 'id' | 'bookmarks' | 'bookmarksCount'>;
  isParentThread?: boolean;
}

const ThreadBookmarkButton: React.FC<BookmarkButtonProps> = ({
  bookmarkInfo,
  isParentThread,
}) => {
  const { id, bookmarksCount: initialCount, bookmarks } = bookmarkInfo;

  const { isBookmarkedByMe, toggleBookmark, bookmarksCount } = useBookmark({
    bookmarksCount: initialCount,
    bookmarks,
    id,
    type: 'THREAD',
  });

  return (
    <div className='icon-container-hover flex items-center gap-2'>
      <button
        type='button'
        aria-label={isBookmarkedByMe ? 'Bookmark' : 'Remove bookmark'}
        onClick={() => toggleBookmark()}
        className='z-[2] relative'
      >
        <Bookmark
          fill={isBookmarkedByMe ? 'currentColor' : 'transparent'}
          className='size-5'
        />
      </button>
      {bookmarksCount > 0 && !isParentThread && (
        <span className='text-[13px] leading-4 text-center text-white/75'>
          {bookmarksCount}
        </span>
      )}
    </div>
  );
};

export default ThreadBookmarkButton;
