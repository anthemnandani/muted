'use client';

import { PostFooterProps } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import PostText from '../shared/PostText';
import Username from '../user/Username';

const PostFooter: React.FC<PostFooterProps> = ({
  author,
  createdAt,
  id,
  text,
}) => {
  return (
    <div className='absolute bottom-[30px] left-0 right-0 px-4 z-10'>
      <div className='flex items-center gap-2 mb-2'>
        <div className='max-w-[40%] overflow-hidden'>
          <Username author={author} className='truncate' />
        </div>
        <div className='hidden size-1 rounded-full bg-white sm:block' />
        <Link
          href={`/${author.username}/post/${id}`}
          className='text-white text-sm truncate'
        >
          {formatTimeAgo(createdAt)}
        </Link>
      </div>
      {text && <PostText text={text} />}
    </div>
  );
};

export default PostFooter;
