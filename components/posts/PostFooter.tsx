'use client';

import { PostFooterProps } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';
import CarouselPagination from '../shared/CarouselPagination';
import PostText from '../shared/PostText';
import RepostBanner from '../shared/RepostBanner';
import Username from '../user/Username';

const PostFooter: React.FC<PostFooterProps> = ({
  author,
  createdAt,
  id,
  text,
  totalCount,
  currentIndex,
  swiperRef,
  reposts,
  repostedBy,
  mentions,
}) => {
  return (
    <div className='absolute left-0 right-0 z-50 bottom-7 p-3 flex flex-col gap-3'>
      <CarouselPagination
        selectedIndex={currentIndex}
        totalCount={totalCount || 0}
        onSelect={(index) => swiperRef?.slideTo(index)}
      />

      <RepostBanner repostedBy={repostedBy} reposts={reposts} />

      <div className='flex items-center gap-1 w-full min-w-0'>
        <div className='max-w-[40%] overflow-hidden'>
          <Username author={author} className='truncate' />
        </div>
        <div className='hidden size-1 rounded-full bg-white sm:block' />
        <Link
          href={`/post/${id}`}
          className='text-white text-sm truncate mt-0.5'
        >
          {formatTimeAgo(createdAt)}
        </Link>
      </div>

      {text && <PostText text={text} mentions={mentions} />}
    </div>
  );
};

export default PostFooter;
