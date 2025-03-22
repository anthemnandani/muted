import type { ReplyPostInfo } from '@/lib/types';
import React from 'react';
import { toast } from 'sonner';
import { Icons } from '../icons';

interface ReplyButtonProps {
  replyThreadInfo: ReplyPostInfo;
  repliesCount: number;
  isParentPost?: boolean;
  canInteract: boolean;
  onCommentsToggle: () => void;
  isCommentsOpen: boolean;
}

const ReplyButton: React.FC<ReplyButtonProps> = ({
  replyThreadInfo,
  repliesCount,
  isParentPost,
  canInteract,
  onCommentsToggle,
  isCommentsOpen,
}) => {
  const handleReplyClick = () => {
    if (!canInteract) return toast.error('You cannot reply to this post');
    onCommentsToggle();
  };

  return (
    <div className='flex flex-col items-center gap-1.5'>
      <button
        type='button'
        aria-label='Reply'
        className='btn-action'
        onClick={handleReplyClick}
      >
        <Icons.comment className='size-5' fill='#fff' />
      </button>
      {repliesCount > 0 && !isParentPost && (
        <strong className='text-[13px] leading-4 text-center'>
          {repliesCount}
        </strong>
      )}
    </div>
  );
};

export default ReplyButton;
