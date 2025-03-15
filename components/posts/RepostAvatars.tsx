'use client';

import { Repost } from '@/lib/types';
import Image from 'next/image';

const RepostAvatars = ({ reposts }: { reposts: Repost[] }) => {
  const latestReposts = reposts.slice(0, 3);

  if (latestReposts.length === 0) return null;

  return (
    <div className='flex-center w-8 visible'>
      <div>
        <div className='z-0 flex items-center -space-x-2 -ml-2'>
          {latestReposts.map((repost, index) => (
            <div
              key={repost.user.id}
              className='relative z-0 flex-center size-4 shrink-0 select-none rounded-full ring-1 ring-border'
              style={{ zIndex: latestReposts.length - index }}
            >
              <Image
                src={repost.user.image!}
                alt={repost.user.username}
                width={16}
                height={16}
                className='h-full w-full rounded-full object-cover object-center'
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RepostAvatars;
