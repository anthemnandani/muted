'use client';

import useBookmark from '@/hooks/useBookmark';
import useDeleteBookmark from '@/store/deleteBookmark';
import { DialogTitle } from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader } from '../ui/dialog';

const DeleteBookmark = ({ postId }: { postId: string }) => {
  const { openDeleteDialog, setOpenDeleteDialog } = useDeleteBookmark();
  const { toggleBookmark } = useBookmark({ id: postId, type: 'POST' });

  const isOpen = openDeleteDialog === postId;

  const handleDeleteBookmark = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();
    toggleBookmark(true);
    setOpenDeleteDialog(null);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => setOpenDeleteDialog(open ? postId : null)}
    >
      <DialogContent
        isSecondDialog
        className='w-full !max-w-[280px] md:!max-w-[400px] select-none border-none bg-transparent shadow-none outline-none z-[1001] box-content'
      >
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>Delete Bookmark</VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <Card className='rounded-2xl border-none bg-background dark:bg-gray-6 shadow-2xl ring-1 ring-gray-7 ring-offset-0'>
          <div className='w-full text-center px-6 pt-6 pb-5'>
            <div className='font-bold text-[18px] md:text-[20px] pb-2'>
              Remove From Saved and Collections?
            </div>
            <p className='text-[15px] pt-2 text-center text-gray-3'>
              Removing this from saved will also remove it from collections.
            </p>
          </div>
          <div className='flex-between w-full border-t-[0.8px] border-t-border-dark dark:border-t-gray-7'>
            <Button
              variant='ghost'
              className='flex-1 font-normal text-base rounded-none rounded-l-2xl h-[54px] border-r-[0.8px] border-r-border-dark dark:border-r-gray-7 ring-0 hover:bg-transparent'
              onClick={() => setOpenDeleteDialog(null)}
            >
              Cancel
            </Button>
            <Button
              variant='ghost'
              className='flex-1 text-base text-primary-red hover:text-primary-red font-bold rounded-none rounded-r-2xl h-[54px] ring-0 hover:bg-transparent disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleDeleteBookmark}
            >
              Remove
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteBookmark;
