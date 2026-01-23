import { useOptimisticAction } from '@/contexts/OptimisticActionContext';
import { UseLikeProps } from '@/lib/types';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

const useLike = ({ initialLikesCount, likes, id, type }: UseLikeProps) => {
  const { user: loggedUser } = useUser();
  const utils = api.useUtils();

  const performAction = useOptimisticAction();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isLikedByMeInitial = useMemo(
    () => likes?.some((like) => like.userId === loggedUser?.id) || false,
    [likes, loggedUser?.id],
  );

  const [isLikedByMe, setIsLikedByMe] = useState(isLikedByMeInitial);
  const [likesCount, setLikesCount] = useState(initialLikesCount || 0);

  const { mutate: serverToggleLike } = api.like.toggleLike.useMutation({
    onSettled: () => {
      if (type === 'POST') {
        utils.user.getUserProfile.invalidate({
          username: loggedUser?.username as string,
        });
        utils.user.getUserLikedPosts.invalidate({
          username: loggedUser?.username as string,
        });
      }
    },
  });

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const toggleLike = async () => {
    if (!loggedUser) {
      toast.error('You must be logged in to like posts');
      return;
    }

    const willBeLiked = !isLikedByMe;

    setIsLikedByMe(willBeLiked);
    setLikesCount((prev) => (willBeLiked ? prev + 1 : Math.max(0, prev - 1)));

    if (performAction) {
      performAction(id, 'LIKE', willBeLiked);
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      serverToggleLike({
        id,
        intent: willBeLiked,
        type,
      });
    }, 1000);
  };

  return {
    isLikedByMe,
    likesCount,
    toggleLike,
  };
};

export default useLike;
