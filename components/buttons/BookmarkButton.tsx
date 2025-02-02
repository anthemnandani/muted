'use client';

import useBookmark from '@/hooks/useBookmark';
import { PostProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useDeleteBookmark from '@/store/deleteBookmark';
import { Bookmark } from 'lucide-react';
import { usePathname } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import CollectionsMenu from '../collections/CollectionsMenu';
import DeleteBookmark from '../modals/DeleteBookmark';

interface BookmarkButtonProps {
  bookmarkInfo: Pick<PostProps, 'id' | 'bookmarks' | 'bookmarksCount'>;
  isParentPost?: boolean;
}

const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  bookmarkInfo,
  isParentPost,
}) => {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = React.useState(false);
  const { setOpenDeleteDialog } = useDeleteBookmark();
  const { id: postId } = bookmarkInfo;
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const showTimeoutRef = React.useRef<NodeJS.Timeout>();
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);
  const {
    isBookmarkedByMe,
    isLoading,
    toggleBookmark,
    bookmarksCount,
    hasNonDefaultBookmarks,
  } = useBookmark(bookmarkInfo);

  const isPostDetailPage = /^\/[^/]+\/post\/[^/]+$/.test(pathname);

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
    if (isPostDetailPage) {
      showTimeoutRef.current = setTimeout(() => {
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setAnchorRect(rect);
        }
        setShowMenu(true);
      }, 1000);
    }
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
      className='flex flex-col items-center gap-1.5'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button ref={buttonRef} onClick={handleClick} className='btn-action'>
        <Bookmark
          fill={isBookmarkedByMe ? 'currentColor' : '#fff'}
          className={cn(
            'size-5 transition-colors',
            isLoading && 'opacity-50',
            isBookmarkedByMe && 'text-primary-blue'
          )}
        />
      </button>
      {bookmarksCount > 0 && (
        <strong className='text-[13px] leading-4 text-center'>
          {bookmarksCount}
        </strong>
      )}
      <CollectionsMenu
        postId={postId}
        isOpen={showMenu}
        onClose={() => setShowMenu(false)}
        anchorRect={anchorRect}
      />
      <DeleteBookmark postId={postId} />
    </div>
  );
};

export default BookmarkButton;
