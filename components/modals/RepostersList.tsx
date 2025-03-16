'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRepost } from '@/hooks/useRepost';
import type { Repost } from '@/lib/types';
import { cn, formatTimeAgo } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import RepostAvatars from '../posts/RepostAvatars';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const RepostersList = ({ reposts }: { reposts: Repost[] }) => {
  const { user } = useUser();
  const displayImage = reposts[0]?.user.image;
  const displayName = reposts[0]?.user.fullName;
  const hasMultipleReposts = reposts.length > 1;

  const userRepost = useMemo(() => {
    return reposts.find((repost) => repost.user.id === user?.id);
  }, [reposts, user?.id]);

  const sortedReposts = useMemo(() => {
    return [...reposts]?.sort((a, b) => {
      if (a.user.id === user?.id) return -1;
      if (b.user.id === user?.id) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [reposts, user?.id]);

  const { isRepostedByMe, isLoading, handleToggleRepost } = useRepost({
    reposts,
    initialRepostsCount: reposts.length,
    postId: reposts[0]?.postId,
  });

  const getRepostText = () => {
    if (isRepostedByMe) {
      return 'You reposted';
    }
    return `${reposts.length} reposted`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className='repost-banner'>
          {hasMultipleReposts ? (
            <RepostAvatars reposts={reposts} />
          ) : (
            <div className='size-4 rounded-full overflow-hidden'>
              <Image
                src={displayImage!}
                alt={displayName || ''}
                width={16}
                height={16}
                className='object-cover'
              />
            </div>
          )}
          <span
            className={cn(
              'text-sm text-white font-medium',
              hasMultipleReposts && '-ml-1.5'
            )}
          >
            {getRepostText()}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          'w-full md:max-w-[520px]',
          'select-none border-none shadow-none outline-none rounded-2xl bg-gray-6 !px-0'
        )}
      >
        <DialogTitle className='text-center mb-5'>
          {reposts.length} {reposts.length === 1 ? 'repost' : 'reposts'}
        </DialogTitle>
        <ScrollArea className='max-h-[85vh] overflow-y-auto'>
          <div className='flex flex-col gap-4 px-4'>
            {sortedReposts.map((repost) => (
              <div
                key={`${repost.user.id}-${repost.postId}`}
                className='flex-between gap-4'
              >
                <div className='flex items-center gap-3'>
                  <Image
                    src={repost.user.image!}
                    alt={repost.user.fullName!}
                    width={40}
                    height={40}
                    className='rounded-full'
                  />
                  <div className='flex flex-col'>
                    <Link
                      href={`/@${repost.user.username}`}
                      className='font-medium'
                    >
                      {repost.user.fullName}
                    </Link>
                    <span className='text-sm text-muted-foreground'>
                      {formatTimeAgo(repost.createdAt)}
                    </span>
                  </div>
                </div>
                {user?.id === repost.user.id && (
                  <Button
                    onClick={handleToggleRepost}
                    disabled={isLoading}
                    size='default'
                    variant='outline'
                    className='rounded-[10px] px-6 !text-[14px] py-1.5 h-8 select-none hover:bg-background'
                  >
                    Reposted
                  </Button>
                )}
              </div>
            ))}
          </div>
          {!userRepost && (
            <div className='sticky bottom-0 left-0 right-0 pt-4 px-4'>
              <Button
                onClick={handleToggleRepost}
                disabled={isLoading}
                className='w-full rounded-xl bg-black/20 backdrop-blur-[2px] border border-white/20 text-white text-sm font-medium hover:bg-black/20 hover:text-white'
                variant='outline'
                size='lg'
              >
                Repost
              </Button>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default RepostersList;
