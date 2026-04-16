import { Icons } from '@/components/icons';
import { ThreadReplyButtonProps } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React from 'react';

const ThreadReplyButton: React.FC<ThreadReplyButtonProps> = ({
  id,
  repliesCount,
  isParentThread = false,
  onCommentsToggle,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onCommentsToggle) {
      onCommentsToggle();
    } else {
      router.push(`/thread/${id}`);
    }
  };

  return (
    <div className='icon-container-hover' onClick={handleClick}>
      <Icons.reply className='size-5' />
      {repliesCount > 0 && !isParentThread && (
        <span className='text-[13px] ml-2 text-white/75'>{repliesCount}</span>
      )}
    </div>
  );
};

export default ThreadReplyButton;