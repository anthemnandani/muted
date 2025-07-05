'use client';

import DeleteDialog from '@/components/modals/DeleteDialog';
import { Button } from '@/components/ui/button';
import useChat from '@/hooks/useChat';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { FC, Fragment, useState } from 'react';

const MessageRequestActions: FC<{ senderName: string }> = ({ senderName }) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const {
    handleAcceptRequest,
    handleDeclineRequest,
    isAcceptingRequest,
    isDecliningRequest,
  } = useChat();

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    await handleDeclineRequest();
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
            disabled={isAcceptingRequest || isDecliningRequest}
            variant='outline'
            className={cn(
              'flex-1 bg-transparent border-white/20 text-white/80 hover:bg-white/10',
              'hover:text-white disabled:opacity-50'
            )}
          >
            {isDecliningRequest ? 'Deleting...' : 'Delete'}
          </Button>
          <Button
            onClick={handleAcceptRequest}
            disabled={isAcceptingRequest || isDecliningRequest}
            className='flex-1 bg-primary-blue hover:bg-primary-blue/80 text-white disabled:opacity-50'
          >
            {isAcceptingRequest ? 'Accepting...' : 'Accept'}
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
