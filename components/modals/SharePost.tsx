import { useRepost } from '@/hooks/useRepost';
import { SharePostProps } from '@/lib/types';
import { X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Icons } from '../icons';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { useUser } from '@clerk/nextjs';

const SharePost: React.FC<SharePostProps> = ({
  id,
  reposts,
  repostsCount: initialRepostsCount,
  authorId,
}) => {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/post/${id}`;

  const { isRepostedByMe, repostsCount, isLoading, handleToggleRepost } =
    useRepost({
      reposts,
      initialRepostsCount,
      postId: id,
    });

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRepost = () => {
    handleToggleRepost();
    setOpen(false);
  };

  return (
    <div className='flex flex-col items-center'>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className='btn-action mt-2 mb-1.5'>
            <Icons.share className='size-6' />
          </button>
        </DialogTrigger>
        <DialogContent className='!max-w-[512px] w-full p-0 border-none bg-gray-6 rounded-lg shadow-2xl'>
          <div className='relative w-full'>
            <div className='flex-between px-4 pt-4'>
              <div className='flex-1'></div>
              <DialogTitle className='text-neutral-100 text-lg font-medium'>
                Share to
              </DialogTitle>
              <div className='flex-1 flex justify-end'>
                <button
                  type='button'
                  className='text-neutral-100'
                  onClick={handleClose}
                >
                  <X className='size-6' />
                </button>
              </div>
            </div>
            <div className='flex px-2'>
              {user?.id !== authorId && (
                <div className='relative p-5 cursor-pointer'>
                  <button
                    type='button'
                    onClick={handleRepost}
                    title={isRepostedByMe ? 'Remove Repost' : 'Repost'}
                    className='share-btn'
                    disabled={isLoading}
                  >
                    <div className='flex'>
                      {isRepostedByMe ? <Icons.reposted /> : <Icons.repost />}
                    </div>
                    <p className='text-neutral-100 antialiased font-medium text-sm'>
                      {isRepostedByMe ? 'Reposted' : 'Repost'}
                    </p>
                  </button>
                </div>
              )}
              <div className='relative p-5 cursor-pointer'>
                <button
                  type='button'
                  onClick={handleCopy}
                  title='Copy Link'
                  className='share-btn'
                >
                  <div className='flex'>
                    <Icons.copy />
                  </div>
                  <p className='text-neutral-100 antialiased font-medium text-sm'>
                    Copy
                  </p>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <strong className='text-[13px] leading-4 text-center text-gray-2'>
        {repostsCount ?? 0}
      </strong>
    </div>
  );
};

export default SharePost;
