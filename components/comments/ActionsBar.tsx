'use client';

import { useRepost } from '@/hooks/useRepost';
import type { Repost } from '@/lib/types';
import Link from 'next/link';
import { toast } from 'sonner';
import BookmarkButton from '../buttons/BookmarkButton';
import LikeButton from '../buttons/LikeButton';
import { Icons } from '../icons';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface ActionsBarProps {
  postId: string;
  authorId?: string;
  stats: {
    likesCount: number;
    likes: { userId: string }[];
    hideLikes?: boolean;
    repliesCount: number;
    bookmarksCount: number;
    bookmarks: { userId: string; collection: { isDefault: boolean } }[];
    repostsCount: number;
    reposts: Repost[];
  };
}

const ActionsBar = ({ postId, authorId, stats }: ActionsBarProps) => {
  const {
    isRepostedByMe,
    isLoading: isRepostLoading,
    handleToggleRepost,
  } = useRepost({
    reposts: stats.reposts,
    initialRepostsCount: stats.repostsCount,
    postId,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/post/${postId}`;

  return (
    <div className='mb-4 px-4'>
      <div className='flex-between'>
        <div className='flex items-center gap-5'>
          <LikeButton
            likeInfo={{
              id: postId,
              likesCount: stats.likesCount,
              likes: stats.likes,
            }}
            hideLikes={stats.hideLikes}
            authorId={authorId!}
            isPanel
          />

          <div className='flex items-center'>
            <button
              type='button'
              aria-label={`${stats.repliesCount} comments`}
              className='btn-action mt-0 mb-0 size-9 mr-1.5 cursor-default'
            >
              <Icons.message className='size-5' fill='#fff' />
            </button>
            <strong className='text-[13px] leading-4 text-white/75 text-center'>
              {stats.repliesCount}
            </strong>
          </div>

          <BookmarkButton
            bookmarkInfo={{
              id: postId,
              bookmarksCount: stats.bookmarksCount,
              bookmarks: stats.bookmarks,
            }}
            isPanel
          />
        </div>

        <div className='flex items-center'>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type='button'
                aria-label='Repost'
                className='mr-2 disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={isRepostLoading}
                onClick={handleToggleRepost}
              >
                {isRepostedByMe ? (
                  <Icons.reposted width={24} height={24} />
                ) : (
                  <Icons.repost width={24} height={24} />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent className='z-[3001]'>
              <p>{isRepostedByMe ? 'Remove repost' : 'Repost'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type='button'
                aria-label='Copy'
                className='mr-2'
                onClick={handleCopy}
              >
                <Icons.copy width={24} height={24} />
              </button>
            </TooltipTrigger>
            <TooltipContent className='z-[3001]'>
              <p>Copy</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`https://wa.me/?text=${url}`}
                aria-label='Share on WhatsApp'
                className='mr-2'
                target='_blank'
              >
                <Icons.whatsapp width={24} height={24} />
              </Link>
            </TooltipTrigger>
            <TooltipContent className='z-[3001]'>
              <p>Share on WhatsApp</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
                aria-label='Share on Facebook'
                className='mr-2'
                target='_blank'
              >
                <Icons.facebook width={24} height={24} />
              </Link>
            </TooltipTrigger>
            <TooltipContent className='z-[3001]'>
              <p>Share on Facebook</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ActionsBar;
