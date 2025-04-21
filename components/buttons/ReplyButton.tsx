import React from 'react';
import { toast } from 'sonner';
import { Icons } from '../icons';

interface ReplyButtonProps {
  repliesCount: number;
  canInteract: boolean;
  onCommentsToggle: () => void;
}

const ReplyButton: React.FC<ReplyButtonProps> = ({
  repliesCount,
  canInteract,
  onCommentsToggle,
}) => {
  const handleReplyClick = () => {
    if (!canInteract) return toast.error('You cannot reply to this post');
    onCommentsToggle();
  };

  return (
    <div className='flex flex-col items-center'>
      <button
        type='button'
        aria-label='Reply'
        className='btn-action mt-2 mb-1.5'
        onClick={handleReplyClick}
      >
        <Icons.comment className='size-5' fill='#fff' />
      </button>

      <strong className='text-[13px] leading-4 text-center'>
        {repliesCount}
      </strong>
    </div>
  );
};

export default ReplyButton;
