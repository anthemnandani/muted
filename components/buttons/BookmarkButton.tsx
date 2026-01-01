'use client';

import useBookmark from '@/hooks/useBookmark';
import { BookmarkButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useDeleteBookmark from '@/store/deleteBookmark';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import CollectionsMenu from '../collections/CollectionsMenu';
import { Icons } from '../icons';
import DeleteBookmark from '../modals/DeleteBookmark';

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  bookmarkInfo,
  isPanel,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const { setOpenDeleteDialog } = useDeleteBookmark();
  const { id: postId } = bookmarkInfo;
  const timeoutRef = useRef<NodeJS.Timeout>();
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const {
    isBookmarkedByMe,
    isLoading,
    toggleBookmark,
    bookmarksCount,
    hasNonDefaultBookmarks,
  } = useBookmark(bookmarkInfo);

  const handleClick = async () => {
    try {
      if (hasNonDefaultBookmarks) {
        setShowMenu(false);
        setOpenDeleteDialog(postId);
      } else {
        await toggleBookmark({ postId, isDefault: true });
      }
    } catch (error) {
      toast.error('Error: Something went wrong!');
    }
  };

  const handleMouseEnter = () => {
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
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className={cn(
        'flex flex-col items-center relative',
        isPanel && 'flex-row'
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
          isPanel && 'mt-0 mb-0 mr-1.5 size-9'
        )}
      >
        <Icons.save
          fill={isBookmarkedByMe ? 'currentColor' : '#fff'}
          className={cn(
            'size-5 transition-colors',
            isLoading && 'opacity-50',
            isBookmarkedByMe && 'text-primary-blue'
          )}
        />
      </button>

      <strong className='text-[13px] leading-4 text-center text-white/75'>
        {bookmarksCount}
      </strong>

      {showMenu && (
        <CollectionsMenu
          postId={postId}
          isOpen={showMenu}
          onClose={() => setShowMenu(false)}
        />
      )}

      <DeleteBookmark postId={postId} />
    </div>
  );
};

export default BookmarkButton;
