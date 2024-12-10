import type { AuthorInfoProps } from '@/lib/types';
import Link from 'next/link';
import FollowButton from '../buttons/FollowButton';
import { Icons } from '../icons';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import UserStats from '../user/UserStats';

const UserProfileCard: React.FC<AuthorInfoProps> = (props) => {
  const { bio, image, username, followers, fullName, following, isAdmin } =
    props;
  return (
    <div className='z-[10] flex  flex-col space-y-4 h-fit  rounded-2xl p-6 bg-background shadow-xl dark:bg-gray-6'>
      <Link href={`/@${username}`} className='flex w-full items-center '>
        <div className='flex w-full flex-col gap-1 truncate'>
          <h1 className='text-[25px] font-extrabold tracking-normal truncate'>
            {fullName}
          </h1>

          <h4 className='text-[15px] truncate'>{username}</h4>
        </div>
        <Avatar className='size-[64px] overflow-visible outline outline-2 outline-border relative'>
          <AvatarImage
            src={image ?? ''}
            alt={fullName ?? ''}
            className='h-min w-full rounded-full object-cover'
          />
          <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
          {isAdmin && (
            <div className='absolute bottom-0 -left-1'>
              <Icons.verified2 className='h-5 w-5 text-background' />
            </div>
          )}
        </Avatar>
      </Link>

      {bio && (
        <span className='text-[15px] max-h-[100px] whitespace-pre-line text-overflow-ellipsis !mt-2'>
          {bio}
        </span>
      )}
      <div className='flex items-center'>
        <UserStats
          username={username}
          following={following.length}
          followers={followers.length}
        />
      </div>
      <FollowButton variant='default' author={props} />
    </div>
  );
};

export default UserProfileCard;
