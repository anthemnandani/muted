import { Icons } from '@/components/icons';
import { ThreadReplyButtonProps } from '@/lib/types';
import { useRouter } from 'next/navigation';
import React from 'react';

const ThreadReplyButton: React.FC<ThreadReplyButtonProps> = ({
  id,
  repliesCount,
  isParentThread = false,
}) => {
  const router = useRouter();
  return (
    <div
      className='icon-container-hover'
      onClick={() => router.push(`/thread/${id}`)}
    >
      <Icons.reply className='size-5' />
      {repliesCount > 0 && !isParentThread && (
        <span className='text-[13px] ml-2 text-white/75'>{repliesCount}</span>
      )}
    </div>
  );
};

export default ThreadReplyButton;
