import React from 'react';
import { Icons } from '@/components/icons';
import useDialog from '@/store/dialog';
import { ParentPostInfo } from '@/lib/types';

interface ReplyButtonProps {
  replyThreadInfo: ParentPostInfo;
  repliesCount: number;
}

const ReplyButton: React.FC<ReplyButtonProps> = ({
  replyThreadInfo,
  repliesCount,
}) => {
  const { setOpenDialog, setReplyPostInfo } = useDialog();
  return (
    <div
      className='flex-center hover:bg-primary p-2 rounded-full w-fit h-fit active:scale-95 cursor-pointer'
      onClick={() => {
        setOpenDialog(true);
        setReplyPostInfo(replyThreadInfo);
      }}
    >
      <Icons.reply className='size-[18px] transition-colors duration-150 text-gray-4 dark:text-gray-2' />
      {repliesCount > 0 && (
        <span className='text-[13px] ml-2 text-gray-2'>{repliesCount}</span>
      )}
    </div>
  );
};

export default ReplyButton;
