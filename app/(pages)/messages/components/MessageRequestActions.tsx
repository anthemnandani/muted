'use client';

import DeleteDialog from '@/components/modals/DeleteDialog';
import { Button } from '@/components/ui/button';
import { MessageRequestActionsProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { FC, Fragment, useState } from 'react';

const MessageRequestActions: FC<MessageRequestActionsProps> = ({
  senderName,
  onAccept,
  onDecline,
  isAccepting = false,
  isDeclining = false,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    await onDecline();
  };
  return (
    <Fragment>
      <div className='border-t border-white/10 p-4 bg-black/20'>
        <div className='text-center mb-4'>
          <h3 className='text-white/90 font-semibold mb-2'>
            {senderName} wants to send you a message
          </h3>
          <p className='text-white/60 text-sm mb-3'>
            If you accept, you can chat with this user immediately. If you
            delete, this chat will be removed from your Message requests. Note
            that this user may send up to 3 messages total.
          </p>
          <div className='flex-center gap-2 text-white/50 text-xs'>
            <AlertTriangle className='size-4' />
            <span>Report this user if you receive a suspicious message.</span>
          </div>
        </div>

        <div className='flex gap-3'>
          <Button
            onClick={handleDeleteClick}
            disabled={isAccepting || isDeclining}
            variant='outline'
            className={cn(
              'flex-1 bg-transparent border-white/20 text-white/80 hover:bg-white/10',
              'hover:text-white disabled:opacity-50'
            )}
          >
            {isDeclining ? 'Deleting...' : 'Delete'}
          </Button>
          <Button
            onClick={onAccept}
            disabled={isAccepting || isDeclining}
            className='flex-1 bg-primary-blue hover:bg-primary-blue/80 text-white disabled:opacity-50'
          >
            {isAccepting ? 'Accepting...' : 'Accept'}
          </Button>
        </div>
      </div>

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onDelete={handleConfirmDelete}
        type='MESSAGE_REQUEST'
        targetName={senderName}
      />
    </Fragment>
  );
};

export default MessageRequestActions;
