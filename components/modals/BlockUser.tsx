'use client';

import useToggleBlockUser from '@/hooks/useToggleBlockUser';
import { BlockUserDialogProps } from '@/lib/types';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useState } from 'react';
import { Icons } from '../icons';
import MenuItem from '../shared/MenuItem';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

const BlockUser = ({ username, userId, closeMenu }: BlockUserDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { handleToggleBlock, isLoading, isBlockedByMe } = useToggleBlockUser({
    userId,
    username,
    setIsOpen,
    closeMenu,
  });

  const handleCancel = () => {
    setIsOpen(false);
    closeMenu();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <MenuItem
          icon={isBlockedByMe ? Icons.unblock : Icons.block}
          label={isBlockedByMe ? 'Unblock' : 'Block'}
          className='text-primary-red focus:text-primary-red'
          onSelect={(e) => e.preventDefault()}
          isActionMenuItem
        />
      </DialogTrigger>
      <DialogContent
        isSecondDialog
        className='w-full !max-w-[300px] select-none border-none bg-transparent shadow-none outline-none z-[9999] box-content'
      >
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>
              {isBlockedByMe ? `Unblock @${username}` : `Block @${username}`}
            </VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <Card className='rounded-2xl border-none bg-gray-6 shadow-2xl ring-1 ring-gray-7 ring-offset-0'>
          <div className='w-full text-center px-6 pt-6 pb-5'>
            <div className='font-bold text-base pb-2'>
              {isBlockedByMe ? `Unblock @${username}?` : `Block @${username}?`}
            </div>
            <p className='text-[15px] pt-3 text-gray-3'>
              {isBlockedByMe
                ? `${username} will be able to send you messages, view your posts, and follow you. They will not be notified that you unblocked them.`
                : `${username} will not be able to send you messages, see your posts, or find your profile. They will not be notified that you blocked them.`}
            </p>
          </div>
          <div className='flex-between w-full border-t-[0.8px] border-t-gray-7'>
            <Button
              variant='ghost'
              className='flex-1 font-normal text-base rounded-none rounded-l-2xl h-[54px] border-r-[0.8px] border-r-gray-7 ring-0 hover:bg-transparent'
              type='button'
              disabled={isLoading}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              variant='ghost'
              className='flex-1 text-base font-bold rounded-none rounded-r-2xl h-[54px] ring-0 hover:bg-transparent text-primary-red hover:text-primary-red'
              onClick={handleToggleBlock}
              disabled={isLoading}
              type='button'
            >
              {isBlockedByMe ? 'Unblock' : 'Block'}
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default BlockUser;
