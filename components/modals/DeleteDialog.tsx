'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DeleteDialogProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DialogTitle } from '@radix-ui/react-dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { toast } from 'sonner';
import { Icons } from '../icons';

const DeleteDialog = ({
  open,
  onOpenChange,
  onDelete,
  trigger,
  type,
  targetName,
  customTitle,
  customDescription,
  deleteButtonText,
  closeDropdown,
}: DeleteDialogProps) => {
  const getDialogContent = () => {
    switch (type) {
      case 'MESSAGE_REQUEST':
        return {
          title: customTitle || 'Delete message request?',
          description:
            customDescription ||
            (targetName
              ? `If you delete this message request from ${targetName}, they won't be able to send you messages in the future.`
              : "If you delete this message request, this user won't be able to send you messages in the future."),
          deleteText: deleteButtonText || 'Delete',
          visuallyHiddenTitle: 'Delete Message Request',
        };

      case 'CHAT':
        return {
          title: customTitle || 'Delete conversation?',
          description:
            customDescription ||
            (targetName
              ? `If you delete this conversation with ${targetName}, you won't be able to restore it. All messages will be permanently removed.`
              : "If you delete this conversation, you won't be able to restore it. All messages will be permanently removed."),
          deleteText: deleteButtonText || 'Delete',
          visuallyHiddenTitle: 'Delete Conversation',
        };

      case 'MESSAGES':
        return {
          title: customTitle || 'Clear all messages?',
          description:
            customDescription ||
            (targetName
              ? `If you clear all messages in this conversation with ${targetName}, you won't be able to restore them.`
              : "If you clear all messages in this conversation, you won't be able to restore them."),
          deleteText: deleteButtonText || 'Clear',
          visuallyHiddenTitle: 'Clear Messages',
        };

      default:
        return {
          title: 'Delete item?',
          description:
            "If you delete this item, you won't be able to restore it.",
          deleteText: 'Delete',
          visuallyHiddenTitle: 'Delete Item',
        };
    }
  };

  const { title, description, deleteText, visuallyHiddenTitle } =
    getDialogContent();

  const handleDelete = async () => {
    onOpenChange(false);
    if (closeDropdown) closeDropdown();

    const deletePromise = Promise.resolve(onDelete());

    toast.promise(deletePromise, {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <DialogTrigger asChild className='w-full'>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className='w-full !max-w-[320px] select-none border-none bg-transparent shadow-none outline-none z-[1001] box-content'>
        <DialogHeader>
          <DialogTitle>
            <VisuallyHidden.Root>{visuallyHiddenTitle}</VisuallyHidden.Root>
          </DialogTitle>
        </DialogHeader>
        <Card className='rounded-2xl border-none bg-gray-6 shadow-2xl ring-1 ring-gray-7 ring-offset-0'>
          <div className='w-full text-center px-6 pt-6 pb-5'>
            <div className='font-bold text-[17px] leading-6 pb-2 text-white/90'>
              {title}
            </div>
            <p className='text-[15px] pt-3 text-gray-400 leading-relaxed'>
              {description}
            </p>
          </div>
          <div className='flex-between w-full border-t-[0.8px] border-t-gray-700'>
            <Button
              variant='ghost'
              className={cn(
                'flex-1 font-normal text-base rounded-none rounded-bl-2xl h-[54px] border-r-[0.8px]',
                'border-r-gray-700 ring-0 hover:bg-white-13 text-white/90'
              )}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              variant='ghost'
              className={cn(
                'flex-1 text-base font-bold rounded-none rounded-br-2xl h-[54px] ring-0 hover:bg-white-13',
                type === 'MESSAGE_REQUEST' || type === 'CHAT'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-orange-600 dark:text-orange-400'
              )}
              onClick={handleDelete}
            >
              {deleteText}
            </Button>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
