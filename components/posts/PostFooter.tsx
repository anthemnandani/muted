'use client';

import { PostFooterProps } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RepostersList from '../modals/RepostersList';
import PostText from '../shared/PostText';
import Username from '../user/Username';

const PostFooter: React.FC<PostFooterProps> = ({
  author,
  createdAt,
  id,
  text,
  reposts,
  repostedBy,
}) => {
  const pathname = usePathname();

  return (
    <div className='absolute bottom-[30px] left-0 right-0 px-4 z-10'>
      {repostedBy && (
        <Link href={`/@${repostedBy.username}`} className='repost-banner'>
          <div className='size-4 rounded-full overflow-hidden'>
            <Image
              src={repostedBy.image!}
              alt={repostedBy.fullName!}
              width={16}
              height={16}
              className='object-cover'
            />
          </div>
          <span className='text-sm text-white font-medium'>
            {repostedBy?.fullName!.length! > 15
              ? `${repostedBy?.fullName!.slice(0, 15)}...`
              : repostedBy?.fullName}{' '}
            reposted
          </span>
        </Link>
      )}

      {pathname !== '/following' && reposts.length > 0 && (
        <RepostersList reposts={reposts} />
      )}

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
      {text && <PostText text={text} />}
    </div>
  );
};

export default PostFooter;
