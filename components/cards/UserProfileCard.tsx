import { UserProfileCardProps } from '@/lib/types';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { Icons } from '../icons';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Follow } from '../ui/follow-button';

const UserProfileCard: React.FC<UserProfileCardProps> = (props) => {
  const { bio, image, username, followers, fullName, isAdmin } = props;
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className='relative' type='button'>
          <div className='size-9 outline outline-1 outline-border rounded-full ml-[1px]'>
            <Avatar className='rounded-full w-full h-full '>
              <AvatarImage
                src={image ?? ''}
                alt={username}
                className='object-cover'
              />
              <AvatarFallback>
                {username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className='bg-foreground absolute -bottom-0.5 -right-0.5 rounded-2xl border-2 border-background text-background hover:scale-105 active:scale-95'>
            <Plus className='size-4 p-0.5 text-white dark:text-black' />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className='z-[1000] flex flex-col space-y-4 h-fit w-full !max-w-[380px] rounded-2xl p-6 bg-background shadow-xl dark:bg-gray-6'>
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
            <AvatarFallback>
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
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
        {/* <div className='flex items-center'> */}
        {/* <UserFollowers followers={followers} showImage={true} /> */}

        {followers.length > 0 && <span className='mx-2 text-gray-3'> · </span>}
        {/* </div> */}
        {/* <FollowButton variant='default' author={props} /> */}
        <Follow
          variant='default'
          className='rounded-xl py-1.5 px-4 select-none text-[15px]'
        >
          Follow
        </Follow>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileCard;
