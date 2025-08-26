import type { BlockedUser } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { useBlockedUsers } from '@/store/blockedUsers';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const BlockedUserCard = ({ blockedUser }: { blockedUser: BlockedUser }) => {
  const { id, image, fullName, username, bio, followersCount } = blockedUser;
  const { isUserBlocked, addBlockedUser, removeBlockedUser } =
    useBlockedUsers();
  const trpcUtils = api.useUtils();

  const { mutate: toggleBlockUser, isLoading } =
    api.user.toggleBlockUser.useMutation({
      onMutate: async ({ targetUserId }) => {
        const wasBlocked = isUserBlocked(targetUserId);

        if (wasBlocked) {
          removeBlockedUser(targetUserId);
        } else {
          addBlockedUser(targetUserId);
        }

        return { wasBlocked };
      },

      onError: (err, { targetUserId }, context) => {
        toast.error(`Error: ${err.message}`);
        if (context?.wasBlocked) {
          addBlockedUser(targetUserId);
        } else {
          removeBlockedUser(targetUserId);
        }
      },

      onSuccess: (data) => {
        if (data.blocked) {
          toast.success(`Blocked @${username}`, { richColors: true });
        } else {
          toast.success(`Unblocked @${username}`, { richColors: true });
        }
        trpcUtils.user.userInfo.invalidate();
      },
    });

  return (
    <div className='h-[89px] flex w-full'>
      <div className='flex-shrink-0 pt-[9px] w-16'>
        <Avatar className='size-16 rounded-full object-cover'>
          <AvatarImage
            src={image ?? ''}
            alt={fullName ?? ''}
            className='rounded-full w-full h-full object-cover'
          />
          <AvatarFallback>{username?.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <div className='flex-1 my-0 mx-5'>
        <h3
          className={cn(
            'mt-2 text-lg font-bold truncate',
            !bio && 'self-center'
          )}
        >
          {username}
        </h3>
        <p className='text-[15px] leading-[22px]'>
          Followers: <span className='font-semibold'>{followersCount}</span>
        </p>
        {bio && <p className='max-w-[400px] truncate text-sm'>{bio}</p>}
      </div>
      <div className='flex-shrink-0 min-w-[76px] mt-[30px]'>
        <Button
          type='button'
          variant='ghost'
          className={cn(
            'box-border min-h-7 min-w-[76px] text-base font-semibold',
            'bg-white-8 tex-white/90 py-1.5 px-4 rounded-[4px]'
          )}
          disabled={isLoading}
          onClick={() => toggleBlockUser({ targetUserId: id })}
        >
          {isUserBlocked(id) ? 'Unblock' : 'Block'}
        </Button>
      </div>
    </div>
  );
};

export default BlockedUserCard;
