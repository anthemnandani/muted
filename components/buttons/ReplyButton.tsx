import { Icons } from '@/components/icons';
import type { ReplyPostInfo } from '@/lib/types';
import { cn } from '@/lib/utils';
import useDialog from '@/store/dialog';
import React from 'react';
import { toast } from 'sonner';

interface ReplyButtonProps {
  replyThreadInfo: ReplyPostInfo;
  repliesCount: number;
  isParentPost?: boolean;
  canInteract: boolean;
}

const ReplyButton: React.FC<ReplyButtonProps> = ({
  replyThreadInfo,
  repliesCount,
  isParentPost,
  canInteract,
}) => {
  const { setOpenDialog, setReplyPostInfo } = useDialog();

  const handleReplyClick = () => {
    if (!canInteract) return toast.error('You cannot reply to this post');
    setOpenDialog(true);
    setReplyPostInfo(replyThreadInfo);
  };

  return (
    <div
      className={cn(
        'icon-container-hover',
        !canInteract && '!cursor-not-allowed'
      )}
      onClick={handleReplyClick}
    >
      <Icons.reply className='size-5 transition-colors duration-150 text-gray-4 dark:text-gray-2' />
      {repliesCount > 0 && !isParentPost && (
        <span className='text-[13px] ml-2 text-gray-4 dark:text-gray-2'>
          {repliesCount}
        </span>
      )}
    </div>
  );
};

export default ReplyButton;
