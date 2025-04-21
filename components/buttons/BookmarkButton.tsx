'use client';

import useBookmark from '@/hooks/useBookmark';
import { PostProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useDeleteBookmark from '@/store/deleteBookmark';
import { Bookmark } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import CollectionsMenu from '../collections/CollectionsMenu';
import DeleteBookmark from '../modals/DeleteBookmark';

interface BookmarkButtonProps {
  bookmarkInfo: Pick<PostProps, 'id' | 'bookmarks' | 'bookmarksCount'>;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({ bookmarkInfo }) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const { setOpenDeleteDialog } = useDeleteBookmark();
  const { id: postId } = bookmarkInfo;
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const showTimeoutRef = React.useRef<NodeJS.Timeout>();
  const buttonRef = React.useRef<HTMLButtonElement>(null);
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

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    };
  }, []);

  return (
    <div
      className='flex flex-col items-center relative'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        aria-label='Bookmark'
        type='button'
        ref={buttonRef}
        onClick={handleClick}
        className='btn-action mt-2 mb-1.5'
      >
        <Bookmark
          fill={isBookmarkedByMe ? 'currentColor' : '#fff'}
          className={cn(
            'size-5 transition-colors',
            isLoading && 'opacity-50',
            isBookmarkedByMe && 'text-primary-blue'
          )}
        />
      </button>

      <strong className='text-[13px] leading-4 text-center'>
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
