'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useChatContext } from '@/contexts/ChatContext';
import { cn } from '@/lib/utils';
import { Dispatch, SetStateAction } from 'react';

interface DeleteChatParams {
  showDeleteDialog: boolean;
  setShowDeleteDialog: Dispatch<SetStateAction<boolean>>;
  deleteAction: 'chat' | 'messages' | null;
  onConfirm: () => void;
}

const DeleteChat = ({
  showDeleteDialog,
  setShowDeleteDialog,
  deleteAction,
  onConfirm,
}: DeleteChatParams) => {
  const { deleteChatLoading, deleteMessagesLoading } = useChatContext();

  return (
    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent className='bg-gray-800 border-gray-700'>
        <AlertDialogHeader>
          <AlertDialogTitle className='text-white'>
            {deleteAction === 'chat' ? 'Delete Chat' : 'Clear Messages'}
          </AlertDialogTitle>
          <AlertDialogDescription className='text-white/70'>
            {deleteAction === 'chat'
              ? 'Are you sure you want to delete this chat? This will only remove it from your view. The other person will still see the conversation.'
              : 'Are you sure you want to clear all messages? This will only clear them from your view. The other person will still see all messages.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='bg-gray-700 text-white border-gray-600 hover:bg-gray-600'>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              'text-white',
              deleteAction === 'chat'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            )}
            disabled={deleteChatLoading || deleteMessagesLoading}
          >
            {deleteAction === 'chat' ? 'Delete' : 'Clear'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteChat;
