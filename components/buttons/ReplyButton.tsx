import { ReplyButtonProps } from '@/lib/types';
import React from 'react';
import { toast } from 'sonner';
import { Icons } from '../icons';

const ReplyButton: React.FC<ReplyButtonProps> = ({
  repliesCount,
  canInteract,
  onCommentsToggle,
  turnOffComments,
}) => {
  const handleReplyClick = () => {
    if (!canInteract) return toast.error('You cannot reply to this post');
    onCommentsToggle();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className='flex flex-col items-center'>
      <button
        type='button'
        aria-label='Reply'
        className='btn-action mt-2 mb-1.5'
        onClick={handleReplyClick}
        onKeyDown={handleKeyDown}
        disabled={turnOffComments}
      >
        <Icons.message className='size-5' fill='#fff' />
      </button>

      {!turnOffComments && (
        <strong className='text-[13px] leading-4 text-center'>
          {repliesCount}
        </strong>
      )}
    </div>
  );
};

export default ReplyButton;
