'use client';

import { RepostBannerProps } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RepostersList from '../modals/RepostersList';

const RepostBanner: React.FC<RepostBannerProps> = ({ repostedBy, reposts }) => {
  const pathname = usePathname();

  return (
    <div className='w-max'>
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
            {repostedBy.fullName!.length > 15
              ? `${repostedBy.fullName!.slice(0, 15)}...`
              : repostedBy.fullName}{' '}
            reposted
          </span>
        </Link>
      )}

      {pathname !== '/following' && reposts.length > 0 && (
        <RepostersList reposts={reposts} />
      )}
    </div>
  );
};

export default RepostBanner;
