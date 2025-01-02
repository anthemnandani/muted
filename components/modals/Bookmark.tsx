'use client';

import type { PostProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useAddBookmark from '@/store/addBookmark';
import { useUser } from '@clerk/nextjs';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Bookmark as BookmarkIcon } from 'lucide-react';
import CollectionsList from '../collections/CollectionsList';
import { Icons } from '../icons';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import NewCollection from './NewCollection';

interface BookmarkInfoProps {
  bookmarkInfo: Pick<PostProps, 'id' | 'bookmarks' | 'bookmarksCount'>;
  isParentPost?: boolean;
}

const Bookmark: React.FC<BookmarkInfoProps> = ({
  bookmarkInfo,
  isParentPost,
}) => {
  const { user } = useUser();
  const { openBookmarkDialog, setOpenBookmarkDialog } = useAddBookmark();
  const isOpen = openBookmarkDialog === bookmarkInfo.id;
  const isBookmarked = bookmarkInfo.bookmarks.some(
    (post: any) => post.userId === user?.id
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setOpenBookmarkDialog(open ? bookmarkInfo.id : null);
      }}
    >
      <DialogTrigger asChild>
        <button type='button' className='icon-container-hover'>
          <BookmarkIcon
            fill={isBookmarked ? 'currentColor' : 'transparent'}
            className={cn(
              'size-5 transition-colors',
              isBookmarked && 'text-primary-blue'
            )}
          />
        </button>
      </DialogTrigger>
      <DialogContent className='select-none border-none bg-transparent shadow-none outline-none z-[999]'>
        <DialogTitle>
          <VisuallyHidden.Root>Bookmarks</VisuallyHidden.Root>
        </DialogTitle>
        <Card className='rounded-2xl border-none bg-background shadow-2xl ring-1 ring-border-dark dark:ring-border-light ring-offset-0 dark:bg-[#101010]'>
          <div className='mx-6 flex items-start border-b dark:border-gray-5 border-gray-1 pt-6 pb-1'>
            <button
              className='mr-4'
              onClick={() => setOpenBookmarkDialog(null)}
            >
              <Icons.close className='size-6 hover:cursor-pointer' />
            </button>
            <h2 className='pb-2 text-xl font-medium leading-6'>Bookmarks</h2>
          </div>
          <div className='my-4 px-6'>
            <NewCollection />
          </div>
          <CollectionsList />
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default Bookmark;
