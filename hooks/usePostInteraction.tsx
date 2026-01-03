import type { AuthorInfoProps } from '@/lib/types';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { PostPrivacy } from '@prisma/client';

interface UsePostInteractionProps {
  authorId: string;
  privacy: PostPrivacy;
  mentions: Array<{
    user: AuthorInfoProps;
    index: number;
  }>;
}

export const usePostInteraction = ({
  authorId,
  privacy,
  mentions,
}: UsePostInteractionProps) => {
  const { user: loggedUser } = useUser();

  const { data: userInfo, isLoading } = api.user.getUserProfile.useQuery(
    { username: loggedUser?.username! },
    {
      enabled:
        privacy !== 'ANYONE' && !!loggedUser?.id && authorId !== loggedUser?.id,
    }
  );

  const canInteract = () => {
    if (!loggedUser) return false;
    if (authorId === loggedUser.id) return true;
    if (privacy === 'ANYONE') return true;
    if (!userInfo) return false;

    switch (privacy) {
      case 'FOLLOWERS':
        return userInfo.following.some((user) => user.followingId === authorId);
      case 'FOLLOWED':
        return userInfo.followers.some((user) => user.followerId === authorId);
      case 'MENTIONED':
        return mentions.some((mention) => mention.user.id === loggedUser.id);
      default:
        return false;
    }
  };

  return {
    isLoading: privacy !== 'ANYONE' && isLoading,
    canInteract: canInteract(),
  };
};
