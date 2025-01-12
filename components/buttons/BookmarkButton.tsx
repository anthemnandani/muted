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
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setAnchorRect(rect);
      }
      setShowMenu(true);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowMenu(false);
    }, 300);
  };
  return (
    <div
      className='relative inline-block'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='icon-container-hover'>
        <button ref={buttonRef} onClick={handleClick}>
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
