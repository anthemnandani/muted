import type { ReplyPostInfo } from '@/lib/types';
import useDialog from '@/store/dialog';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { Icons } from '../icons';

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
  const router = useRouter();
  const pathname = usePathname();

  const handleReplyClick = () => {
    if (!canInteract) return toast.error('You cannot reply to this post');
    if (pathname === '/') {
      const { author, id } = replyThreadInfo;
      return router.push(`/${author.username}/post/${id}`);
    }
    setOpenDialog(true);
    setReplyPostInfo(replyThreadInfo);
  };

  return (
    <div className='flex flex-col items-center gap-1.5'>
      <button className='btn-action' onClick={handleReplyClick}>
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
