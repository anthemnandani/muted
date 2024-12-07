import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { PostPrivacy } from '@prisma/client';

interface UsePostInteractionProps {
  authorId: string;
  privacy: PostPrivacy;
}

export const usePostInteraction = ({
  authorId,
  privacy,
}: UsePostInteractionProps) => {
  const { user: loggedUser } = useUser();

  const { data: userInfo, isLoading } = api.user.userInfo.useQuery(
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
        return userInfo.userDetails.following.some(
          (user) => user.id === authorId
        );
      case 'FOLLOWED':
        return userInfo.userDetails.followers.some(
          (user) => user.id === authorId
        );
      default:
        return false;
    }
  };

  return {
    isLoading: privacy !== 'ANYONE' && isLoading,
    canInteract: canInteract(),
  };
};
