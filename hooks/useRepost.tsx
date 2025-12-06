import { Icons } from '@/components/icons';
import type { Repost } from '@/lib/types';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

interface UseRepostProps {
  reposts: Repost[];
  initialRepostsCount: number;
  postId: string;
}

export function useRepost({
  reposts,
  initialRepostsCount,
  postId,
}: UseRepostProps) {
  const { user: loggedUser } = useUser();
  const trpcUtils = api.useUtils();

  const isRepostedByMeInitial = useMemo(() => {
    return reposts.some((repost) => repost.user.id === loggedUser?.id);
  }, [reposts, loggedUser?.id]);

  const [isRepostedByMe, setIsRepostedByMe] = useState(isRepostedByMeInitial);
  const [repostsCount, setRepostsCount] = useState(initialRepostsCount || 0);

  useEffect(() => {
    setIsRepostedByMe(isRepostedByMeInitial);
    setRepostsCount(initialRepostsCount || 0);
  }, [isRepostedByMeInitial, initialRepostsCount]);

  const { mutateAsync: toggleRepost, isLoading } =
    api.post.toggleRepost.useMutation({
      onError: (error) => {
        toast.error('RepostError: Something went wrong!');
      },
      onSettled: async () => {
        await Promise.all([
          trpcUtils.user.getUserReposts.invalidate(),
          trpcUtils.post.getInfinitePosts.invalidate(),
        ]);
      },
    });

  const handleToggleRepost = () => {
    toast.promise(toggleRepost({ id: postId }), {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          {isRepostedByMe ? 'Removing repost...' : 'Reposting...'}
        </div>
      ),
      success: (data) => {
        return (
          <div className='flex-center p-0'>
            {data.createdRepost
              ? 'Post reposted successfully'
              : 'Repost removed successfully'}
          </div>
        );
      },
      error: 'Failed to update repost',
      richColors: true,
    });
  };

  return {
    isRepostedByMe,
    repostsCount,
    isLoading,
    handleToggleRepost,
  };
}
