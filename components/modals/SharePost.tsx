import { SharePostProps } from '@/lib/types';
import { cn } from '@/lib/utils';
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
import { useRepost } from '@/hooks/useRepost';

const SharePost: React.FC<SharePostProps> = ({
  id,
  reposts,
  repostsCount: initialRepostsCount,
}) => {
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
            <div className='flex-between px-4 py-4'>
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

            <div className='px-4'>
              <div className='flex items-center bg-white-13 rounded-md'>
                <input
                  type='text'
                  value={url}
                  readOnly
                  className={cn(
                    'flex-1 bg-transparent text-white border-none outline-none',
                    'text-base antialiased pl-4 py-3 truncate'
                  )}
                />
                <div className='flex p-[5px]'>
                  <button
                    onClick={handleCopy}
                    className={cn(
                      'inline-flex-center font-medium size-8 relative',
                      'appearance-none cursor-pointer text-base text-neutral-100',
                      'hover:bg-white-13 rounded-md transition ease-in-out'
                    )}
                  >
                    <div className='flex-center overflow-hidden w-full'>
                      <Icons.copyLink className='size-5' />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className='relative flex-center p-5 cursor-pointer w-full box-border'>
              <button
                type='button'
                onClick={handleRepost}
                title={isRepostedByMe ? 'Remove Repost' : 'Repost'}
                className={cn(
                  'relative w-fit flex flex-col items-center gap-1.5 hover:before:content-[""]',
                  'hover:before:absolute hover:before:inset-0 hover:before:rounded-lg',
                  'hover:before:-z-10 hover:before:-mt-3 hover:before:-mb-2 hover:before:-mx-3',
                  'hover:before:bg-white-13 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
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
