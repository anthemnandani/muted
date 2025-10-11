'use client';

import { PostFooterProps } from '@/lib/types';
import { cn, formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';
import PostText from '../shared/PostText';
import RepostBanner from '../shared/RepostBanner';
import Username from '../user/Username';

const PostFooter: React.FC<PostFooterProps> = ({
  author,
  createdAt,
  id,
  text,
  reposts,
  repostedBy,
  mentions,
  isThread,
}) => {
  return (
    <div
      className={cn(
        'absolute left-0 right-0 px-4 z-10',
        isThread ? 'bottom-1' : 'bottom-7'
      )}
    >
      <RepostBanner repostedBy={repostedBy} reposts={reposts} />

      <div className='flex items-center gap-2 mb-2'>
        <div className='max-w-[40%] overflow-hidden'>
          <Username author={author} className='truncate' />
        </div>
        <div className='hidden size-1 rounded-full bg-white sm:block' />
        <Link
          href={`/@${author.username}/post/${id}`}
          className='text-white text-sm truncate'
        >
          {formatTimeAgo(createdAt)}
        </Link>
      </div>
      {text && <PostText text={text} mentions={mentions} />}
    </div>
  );
};

export default PostFooter;
