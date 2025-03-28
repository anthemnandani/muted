'use client';

import useDeletePost from '@/store/deletePost';
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
import { DeletePostProps } from '@/lib/types';

const DeletePost = ({ postId, isComment, closeDropdown }: DeletePostProps) => {
  const { openDeleteDialog, setOpenDeleteDialog } = useDeletePost();
  const trpcUtils = api.useUtils();

  const { mutateAsync: deletePost } = api.post.deletePost.useMutation({
    onError: () => {
      toast.error('Error: Something went wrong!');
    },
    onSettled: async () => {
      await trpcUtils.invalidate();
    },
    retry: false,
  });

  const handleDeletePost = () => {
    setOpenDeleteDialog(false);
    if (closeDropdown) closeDropdown();
    const promise = deletePost({ id: postId });

    toast.promise(promise, {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          Deleting...
        </div>
      ),
      success: (data) => {
        return <div className='flex-center p-0'>Deleted</div>;
      },
      error: 'Error',
      richColors: true,
    });
  };

  return (
    <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
      <DialogTrigger asChild className='w-full'>
        <MenuItem
          icon={Icons.delete}
          label='Delete'
          className='text-primary-red focus:text-primary-red'
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
            <VisuallyHidden.Root>
              Delete {isComment ? 'Comment' : 'Post'}
            </VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <Card className='rounded-2xl border-none bg-background dark:bg-gray-6 shadow-2xl ring-1 ring-gray-7 ring-offset-0'>
          <div className='w-full text-center px-6 pt-6 pb-5'>
            <div className='font-bold text-base pb-2'>
              Delete {isComment ? 'comment' : 'post'}?
            </div>
            <p className='text-[15px] pt-3 text-gray-3'>
              If you delete this {isComment ? 'comment' : 'post'}, you won't be
              able to restore it.
            </p>
          </div>
          <div className='flex-between w-full border-t-[0.8px] border-t-border-dark dark:border-t-gray-7'>
            <Button
              variant='ghost'
              className='flex-1 font-normal text-base rounded-none rounded-l-2xl h-[54px] border-r-[0.8px] border-r-border-dark dark:border-r-gray-7 ring-0 hover:bg-transparent'
              onClick={() => setOpenDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant='ghost'
              className='flex-1 text-base font-bold rounded-none rounded-r-2xl h-[54px] ring-0 hover:bg-transparent'
              onClick={handleDeletePost}
            >
              Delete
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default DeletePost;
