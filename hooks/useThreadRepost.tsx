import { useOptimisticAction } from '@/contexts/OptimisticActionContext';
import type { Repost } from '@/lib/types';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface UseThreadRepostProps {
  reposts?: Repost[];
  initialRepostsCount: number;
  threadId: string;
}

export function useThreadRepost({
  reposts,
  initialRepostsCount,
  threadId,
}: UseThreadRepostProps) {
  const { user: loggedUser } = useUser();

  const isRepostedByMeInitial = useMemo(() => {
    return reposts?.some((repost) => repost.user?.id === loggedUser?.id);
  }, [reposts, loggedUser?.id]);

  const [isRepostedByMe, setIsRepostedByMe] = useState(isRepostedByMeInitial);
  const [repostsCount, setRepostsCount] = useState(initialRepostsCount || 0);

  const performAction = useOptimisticAction();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { mutate: serverToggleRepost } = api.thread.toggleRepost.useMutation({
    onError: (error) => {
      toast.error('RepostError: Something went wrong!');
    },
    //   onSettled: async () => {
    //     await trpcUtils.invalidate();
    //   },
  });

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const toggleRepost = async () => {
    if (!loggedUser) {
      toast.error('You must be logged in to repost');
      return;
    }

    const willbeReposted = !isRepostedByMe;

    setIsRepostedByMe(willbeReposted);
    setRepostsCount((prev) =>
      willbeReposted ? prev + 1 : Math.max(0, prev - 1),
    );

    if (performAction) {
      performAction(threadId, 'REPOST', willbeReposted);
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      serverToggleRepost({
        id: threadId,
      });
    }, 1000);
    toast.success(willbeReposted ? 'Reposted!' : 'Removed repost!');
  };

  return {
    isRepostedByMe,
    repostsCount,
    toggleRepost,
  };
}
