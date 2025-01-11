'use client';

import useDeleteCollection from '@/store/deleteCollection';
import { api } from '@/trpc/react';
import { DialogTitle } from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { toast } from 'sonner';
import { Icons } from '../icons';
import MenuItem from '../shared/MenuItem';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '../ui/dialog';

const DeleteCollection = ({ collectionId }: { collectionId: string }) => {
  const { openDeleteDialog, setOpenDeleteDialog } = useDeleteCollection();
  const trpcUtils = api.useUtils();

  const isOpen = openDeleteDialog === collectionId;

  const { mutateAsync: deleteCollection, isLoading } =
    api.collection.deleteCollection.useMutation({
      onSettled: async () => {
        await trpcUtils.invalidate();
      },
      retry: false,
    });

  const handleDeleteCollection = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    try {
      e.stopPropagation();
      await deleteCollection({ id: collectionId });
      setOpenDeleteDialog(null);
      toast.success('Success');
    } catch (error) {
      toast.error('Failed to delete collection');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => setOpenDeleteDialog(open ? collectionId : null)}
    >
      <DialogTrigger asChild className='w-full'>
        <MenuItem
          icon={Icons.delete}
          label='Delete'
          className='flex-between py-2 px-4 text-primary-red focus:text-primary-red'
          onSelect={(e) => e.preventDefault()}
          isActionMenuItem
        />
      </DialogTrigger>
      <DialogContent
        isSecondDialog
        className='w-full !max-w-[280px] select-none border-none bg-transparent shadow-none outline-none z-[1001] box-content'
      >
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>Delete Collection</VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <Card className='rounded-2xl border-none bg-background dark:bg-gray-6 shadow-2xl ring-1 ring-gray-7 ring-offset-0'>
          <div className='w-full text-center px-6 pt-6 pb-5'>
            <div className='font-bold text-base pb-2'>Delete collection?</div>
            <p className='text-[15px] pt-3 text-gray-3'>
              If you delete this collection, you won't be able to restore it.
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
              className='flex-1 text-base font-bold rounded-none rounded-r-2xl h-[54px] ring-0 hover:bg-transparent text-primary-red hover:text-primary-red disabled:opacity-50 disabled:cursor-not-allowed'
              onClick={handleDeleteCollection}
              disabled={isLoading}
            >
              Delete
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteCollection;
