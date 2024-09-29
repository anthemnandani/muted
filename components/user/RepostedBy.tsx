'use client';

import { Author } from '@/lib/types';
import { Icons } from '../icons';
import Username from './Username';

const RepostedBy = ({ repostedBy }: { repostedBy: Author }) => {
  return (
    <div className='px-6 pb-3'>
      <div className='flex items-center gap-3'>
        <Icons.repost className='size-4 text-[#999] dark:text-gray-3' />

        <Username author={repostedBy} isReposted />
      </div>
    </div>
  );
};

export default RepostedBy;
