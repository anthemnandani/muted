'use client';

import { useChatContext } from '@/contexts/ChatContext';
import useCopyLink from '@/hooks/useCopyLink';
import { UserProfileInfoProps } from '@/lib/types';
import { cn, formatCount } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { Privacy } from '@prisma/client';
import { Lock, Settings } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment } from 'react';
import FollowButton from '../buttons/FollowButton';
import { Icons } from '../icons';
import UserProfileMenu from '../menus/UserProfileMenu';
import BlockUser from '../modals/BlockUser';
import EditProfile from '../modals/EditProfile';
import { Button } from '../ui/button';

const UserProfile: React.FC<UserProfileInfoProps> = (props) => {
  const {
    id,
    bio,
    fullName,
    image,
    username,
    followers,
    following,
    totalLikes,
    isBlocked,
    isMuted,
  } = props;
  const { user } = useUser();
  const { handleCopyProfileLink } = useCopyLink({ username });

  const { getOrCreateChat, getOrCreateChatLoading } = useChatContext();
  const router = useRouter();

  const handleMessageClick = async () => {
    if (!user?.id || getOrCreateChatLoading) return;

    try {
      await getOrCreateChat(id);
      router.push('/messages');
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  return (
    <div className='flex items-center relative min-h-[140px] mb-5 gap-7 flex-[0_0_auto]'>
      <div className='relative flex-center size-[212px] inline-block rounded-full overflow-hidden border-[0.5px] border-white-12 cursor-pointer'>
        <Image
          src={image ?? ''}
          alt='Profile pic'
          fill
          priority
          className='object-cover'
        />
      </div>
      <div className='flex flex-col justify-between flex-[1_1_0%] gap-3 overflow-visible'>
        <div className='flex items-center gap-3'>
          <h1 className='text-2xl font-bold overflow-hidden text-ellipsis whitespace-nowrap break-words antialiased'>
            {fullName}
          </h1>
          {user?.id === id && <Lock className='size-5 text-neutral-50' />}
          <p className='text-lg font-medium max-w-[450px] overflow-hidden text-ellipsis whitespace-nowrap break-words h-[25px] antialiased'>
            {username}
          </p>
        </div>
        <div className='flex items-center gap-3'>
          {user?.id === id && (
            <Fragment>
              <EditProfile userBio={bio || ''} userImage={image || ''} />
              <Button
                size='icon'
                className='size-10 bg-white-13 hover:bg-white/20 rounded-md transition-colors duration-200'
                onClick={() => router.push('/setting')}
              >
                <Settings className='size-5 text-neutral-50' />
              </Button>
            </Fragment>
          )}
          {user?.id !== id && isBlocked && (
            <BlockUser username={username} userId={id} isProfile />
          )}
          {user?.id !== id && !isBlocked && (
            <Fragment>
              <FollowButton
                size='default'
                variant='default'
                className='bg-primary-blue !text-white/90 min-w-[120px] text-base font-medium overflow-hidden text-ellipsis whitespace-nowrap break-words'
                author={props}
              />
              <Button
                onClick={handleMessageClick}
                disabled={getOrCreateChatLoading}
                className={cn(
                  'min-w-[120px] text-base font-medium rounded-md transition-colors duration-200',
                  'bg-white-13 hover:bg-white/20 !text-white/90 disabled:cursor-not-allowed'
                )}
              >
                {getOrCreateChatLoading ? 'Starting...' : 'Message'}
              </Button>
            </Fragment>
          )}
          {user?.id !== id && (
            <UserProfileMenu
              username={username}
              isMuted={isMuted}
              isBlocked={isBlocked}
              userId={id}
            />
          )}
          {user?.id === id && (
            <Button
              size='icon'
              className='size-10 bg-white-13 hover:bg-white/20 rounded-md transition-colors duration-200'
              onClick={handleCopyProfileLink}
            >
              <Icons.share className='size-5 text-neutral-50' />
            </Button>
          )}
        </div>
        <div className='flex items-center gap-5'>
          <Link
            href={`/@${username}/following`}
            className='flex items-center gap-1.5 cursor-pointer'
          >
            <strong className='text-lg text-white/90 antialiased'>
              {formatCount(following.length)}
            </strong>
            <span className='text-base text-white/75 hover:underline transition-all duration-200 antialiased'>
              Following
            </span>
          </Link>
          <Link
            href={`/@${username}/followers`}
            className='flex items-center gap-1.5 cursor-pointer'
          >
            <strong className='text-lg text-white/90 antialiased'>
              {formatCount(followers.length)}
            </strong>
            <span className='text-base text-white/75 hover:underline transition-all duration-200 antialiased'>
              Follower{followers.length === 1 ? '' : 's'}
            </span>
          </Link>
          <div className='flex items-center gap-1.5'>
            <strong className='text-lg text-white/90 antialiased'>
              {formatCount(totalLikes)}
            </strong>
            <span className='text-base text-white/75 antialiased'>
              Like{totalLikes === 1 ? '' : 's'}
            </span>
          </div>
        </div>
        <h2 className='text-left font-normal antialiased whitespace-pre-line text-base text-white/90 max-w-[600px]'>
          {bio || 'No bio yet.'}
        </h2>
      </div>
    </div>
  );
};

export default UserProfile;
