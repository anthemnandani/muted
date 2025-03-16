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
        await Promise.all([
          trpcUtils.post.getInfinitePosts.invalidate(),
          trpcUtils.post.getFollowingPosts.invalidate(),
          trpcUtils.user.getUserReposts.invalidate(),
          trpcUtils.post.getNestedPosts.invalidate(),
          trpcUtils.post.getPostsByTag.invalidate(),
        ]);
      },
    }
  );

  const handleToggleRepost = () => {
    toggleRepost({ id: postId });
  };

  return {
    isRepostedByMe,
    repostsCount,
    isLoading,
    handleToggleRepost,
  };
}
