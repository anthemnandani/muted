'use client';

import useToggleBlockUser from '@/hooks/useToggleBlockUser';
import { BlockUserDialogProps } from '@/lib/types';
import { useBlockedUsers } from '@/store/blockedUsers';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
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

const BlockUser = ({
  username,
  userId,
  closeMenu,
  isBlocked,
  isProfile = false,
}: BlockUserDialogProps) => {
  const { isOpen, setIsOpen } = useBlockedUsers();

  const { handleToggleBlock, isLoading, isBlockedByMe } = useToggleBlockUser({
    userId,
    username,
    isProfile,
    isBlocked,
  });

  const handleCancel = () => {
    setIsOpen(false);
    closeMenu?.();
  };

  const handleToggleBlockUser = () => {
    setIsOpen(false);
    closeMenu?.();
    handleToggleBlock();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isProfile ? (
          <Button
            size='default'
            variant='default'
            className='bg-white-13 hover:bg-white/20 rounded-md transition-colors duration-200 min-w-[120px] text-base font-medium text-white-90'
            disabled={isLoading}
          >
            <Icons.userRoundCheck className='mr-2 size-5 text-white-90' />
            Unblock
          </Button>
        ) : (
          <MenuItem
            icon={isBlockedByMe ? Icons.unblock : Icons.block}
            label={isBlockedByMe ? 'Unblock' : 'Block'}
            className='text-primary-red focus:text-primary-red'
            disabled={isLoading}
          />
        )}
      </DialogTrigger>
      <DialogContent
        isSecondDialog
        className='w-full !max-w-[400px] select-none border-none bg-transparent shadow-none outline-none z-[9999] box-content'
      >
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>
              {isBlockedByMe ? `Unblock ${username}` : `Block ${username}`}
            </VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <Card className='rounded-2xl border-none bg-gray-6 shadow-2xl ring-1 ring-gray-7 ring-offset-0'>
          <div className='w-full text-center p-6'>
            <h2 className='font-bold text-2xl leading-9 break-all text-white/90'>
              {isBlockedByMe ? `Unblock ${username}` : `Block ${username}`}
            </h2>
            <p className='text-base pt-4 text-white/75 text-center'>
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
              onClick={handleToggleBlockUser}
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
