import { Icons } from '@/components/icons';
import { ThreadReplyButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useThreadStore } from '@/store/threadStore';
import React from 'react';
import { toast } from 'sonner';

const ThreadReplyButton: React.FC<ThreadReplyButtonProps> = ({
  replyThreadInfo,
  repliesCount,
  isParentThread = false,
  canInteract,
}) => {
  const { setOpenDialog, setReplyThreadInfo } = useThreadStore();

  const handleReplyClick = () => {
    if (!canInteract) return toast.error('You cannot reply to this thread');
    setOpenDialog(true);
    setReplyThreadInfo(replyThreadInfo);
  };

  return (
    <div
      className={cn(
        'icon-container-hover',
        !canInteract && '!cursor-not-allowed',
      )}
      onClick={handleReplyClick}
    >
      <Icons.reply className='size-5' />
      {repliesCount > 0 && !isParentThread && (
        <span className='text-[13px] ml-2 text-white/50'>{repliesCount}</span>
      )}
    </div>
  );
};

export default ThreadReplyButton;
