'use client';

import useBookmark from '@/hooks/useBookmark';
import { BookmarkButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useDeleteBookmark from '@/store/deleteBookmark';
import { useEffect, useRef, useState } from 'react';
import CollectionsMenu from '../collections/CollectionsMenu';
import { Icons } from '../icons';
import DeleteBookmark from '../modals/DeleteBookmark';

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  bookmarkInfo,
  isPanel,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { setOpenDeleteDialog, openDeleteDialog } = useDeleteBookmark();
  const { id, bookmarksCount: initialCount, bookmarks } = bookmarkInfo;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const {
    isBookmarkedByMe,
    toggleBookmark,
    bookmarksCount,
    hasNonDefaultBookmarks,
  } = useBookmark({
    bookmarksCount: initialCount,
    bookmarks,
    id,
    type: 'POST',
  });

  const handleClick = () => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);

    if (hasNonDefaultBookmarks) {
      setShowMenu(false);
      setOpenDeleteDialog(id);
    } else {
      toggleBookmark();
    }
  };

  const handleMouseEnter = () => {
    if (openDeleteDialog === id) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    showTimeoutRef.current = setTimeout(() => {
      setShowMenu(true);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setShowMenu(false);
    }, 300);
  };

  useEffect(() => {
    if (openDeleteDialog === id) {
      setShowMenu(false);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    }
  }, [openDeleteDialog, id]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className={cn(
        'flex flex-col items-center relative',
        isPanel && 'flex-row',
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        aria-label='Bookmark'
        type='button'
        ref={buttonRef}
        onClick={handleClick}
        className={cn(
          'btn-action mt-2 mb-1.5',
          isPanel && 'mt-0 mb-0 mr-1.5 size-9',
        )}
      >
        <Icons.save
          fill={isBookmarkedByMe ? 'currentColor' : '#fff'}
          className={cn(
            'size-5 transition-colors',
            isBookmarkedByMe && 'text-primary-blue',
          )}
        />
      </button>

      <strong className='text-[13px] leading-4 text-center text-white/75'>
        {bookmarksCount}
      </strong>

      {showMenu && (
        <CollectionsMenu
          postId={id}
          isOpen={showMenu}
          onClose={() => setShowMenu(false)}
          bookmarkInfo={bookmarkInfo}
          isPanel={isPanel}
        />
      )}

      <DeleteBookmark postId={id} />
    </div>
  );
};

export default BookmarkButton;
