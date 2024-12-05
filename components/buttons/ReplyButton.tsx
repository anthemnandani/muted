import React from 'react';
import { Icons } from '@/components/icons';
import useDialog from '@/store/dialog';
import type { ReplyPostInfo } from '@/lib/types';

interface ReplyButtonProps {
  replyThreadInfo: ReplyPostInfo;
  repliesCount: number;
  isParentPost?: boolean;
}

const ReplyButton: React.FC<ReplyButtonProps> = ({
  replyThreadInfo,
  repliesCount,
  isParentPost,
}) => {
  const { setOpenDialog, setReplyPostInfo } = useDialog();
  return (
    <div
      className='icon-container-hover'
      onClick={() => {
        setOpenDialog(true);
        setReplyPostInfo(replyThreadInfo);
      }}
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
