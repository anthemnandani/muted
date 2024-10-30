'use client';

import { Author } from '@/lib/types';
import { Icons } from '../icons';
import Username from './Username';

const RepostedBy = ({
  repostedBy,
  repostedAt,
}: {
  repostedBy: Author;
  repostedAt?: Date;
}) => {
  return (
    <div className='px-6 mb-3'>
      <div className='flex items-center gap-3'>
        <Icons.repost className='size-4 text-[#999] dark:text-gray-3' />

        <Username author={repostedBy} repostedAt={repostedAt} isReposted />
      </div>
    </div>
  );
};

export default RepostedBy;
