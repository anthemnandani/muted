'use client';

import { Icons } from '@/components/icons';
import type { RepostButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import React from 'react';
import { toast } from 'sonner';

const RepostButton: React.FC<RepostButtonProps> = ({
  id,
  reposts,
  repostsCount: initialRepostsCount,
}) => {
  const { user: loggedUser } = useUser();

  const isRepostedByMeInitial = React.useMemo(() => {
    return reposts.some((repost) => repost.user.id === loggedUser?.id);
  }, [reposts, loggedUser?.id]);

  const [isRepostedByMe, setIsRepostedByMe] = React.useState(
    isRepostedByMeInitial
  );
  const [repostsCount, setRepostsCount] = React.useState(
    initialRepostsCount || 0
  );

  React.useEffect(() => {
    setIsRepostedByMe(isRepostedByMeInitial);
    setRepostsCount(initialRepostsCount || 0);
  }, [isRepostedByMeInitial, initialRepostsCount]);

  const trpcUtils = api.useUtils();

  const { mutate: toggleRepost, isLoading } = api.post.toggleRepost.useMutation(
    {
      onMutate: async () => {
        setIsRepostedByMe((prev) => !prev);
        setRepostsCount((prev) => (isRepostedByMe ? prev - 1 : prev + 1));

        return {
          previousIsRepostedByMe: isRepostedByMe,
          previousRepostsCount: repostsCount,
        };
      },
      onError: (error, variables, context) => {
        if (
          context?.previousIsRepostedByMe !== undefined &&
          context?.previousRepostsCount !== undefined
        ) {
          setIsRepostedByMe(context.previousIsRepostedByMe);
          setRepostsCount(context.previousRepostsCount);
        }
        toast.error('Something went wrong!');
      },
      onSuccess: async () => {
        await trpcUtils.post.getInfinitePosts.invalidate();
        await trpcUtils.post.getFollowingPosts.invalidate();
        await trpcUtils.user.getUserReposts.invalidate();
        await trpcUtils.post.getNestedPosts.invalidate();
        await trpcUtils.post.getPostsByTag.invalidate();
      },
    }
  );

  return (
    <div className='flex flex-col items-center gap-1.5'>
      <button
        type='button'
        disabled={isLoading}
        title={isRepostedByMe ? 'Remove Repost' : 'Repost'}
        onClick={() => toggleRepost({ id })}
        className='btn-action'
      >
        {isRepostedByMe ? (
          <Icons.reposted className='size-5' />
        ) : (
          <Icons.repost className='size-5' />
        )}
      </button>
      {repostsCount > 0 && (
        <strong className={cn('text-[13px] leading-4 text-center text-gray-2')}>
          {repostsCount}
        </strong>
      )}
    </div>
  );
};

export default RepostButton;
