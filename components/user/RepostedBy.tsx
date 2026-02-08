'use client';

import type { AuthorProps } from '@/lib/types';
import { Icons } from '../icons';
import Username from './Username';

const RepostedBy = ({
  repostedBy,
  repostedAt,
}: {
  repostedBy: AuthorProps;
  repostedAt?: Date;
}) => {
  return (
    <div className='px-6 mb-3'>
      <div className='flex items-center gap-3'>
        <Icons.threadRepost className='size-4 text-white/75' />

        <Username author={repostedBy} repostedAt={repostedAt} isReposted />
      </div>
    </div>
  );
};

export default RepostedBy;
