'use client';

import { NotificationCardProps } from '@/lib/types';
import { cn, formatTimeAgo, getImageUrl } from '@/lib/utils';
import useCommentPanelStore from '@/store/commentPanel';
import { NotificationType } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FollowButton from '../buttons/FollowButton';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const NotificationCard = ({
  sender,
  message,
  media,
  postId,
  createdAt,
  type,
}: NotificationCardProps) => {
  const router = useRouter();
  const { openPanel } = useCommentPanelStore();

  const handleClick = () => {
    switch (type) {
      case NotificationType.FOLLOWER:
        router.push(`/@${sender.username}`);
        break;
      case NotificationType.LIKE:
        router.push(`/post/${postId}`);
        break;
      case NotificationType.COMMENT:
      case NotificationType.MENTION:
        router.push(`/post/${postId}`);
        setTimeout(() => {
          openPanel(postId!, `/post/${postId}`);
          document.body.style.overflow = 'hidden';
        }, 100);
        break;
      default:
        break;
    }
  };

  return (
    <div
      className='hover:bg-[#1a1a1a] transition-colors cursor-pointer'
      onClick={handleClick}
    >
      <div className='flex items-start py-2.5 px-2'>
        <Avatar className='size-12 rounded-full object-cover flex-[0_0_48px]'>
          <AvatarImage
            src={sender.image ?? ''}
            alt={sender.fullName ?? ''}
            className='rounded-full w-full h-full object-cover'
          />
          <AvatarFallback className='flex-center'>
            {sender.username?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className='flex-1 px-3'>
          <Link
            href={`/@${sender.username}`}
            className='line-clamp-1 break-words truncate font-semibold text-sm text-white/90 hover:underline'
          >
            {sender.username}
          </Link>
          <p
            className={cn(
              'line-clamp-6 text-sm leading-[18px] max-h-[130px] break-words',
              type === NotificationType.LIKE ||
                type === NotificationType.FOLLOWER
                ? 'text-white/50'
                : 'text-white/90'
            )}
          >
            {message}
            {(type === NotificationType.LIKE ||
              type === NotificationType.FOLLOWER) &&
              '. '}
            <span className='text-white/50'>{formatTimeAgo(createdAt)}</span>
          </p>
        </div>
        {type === NotificationType.FOLLOWER ? (
          <FollowButton
            author={sender}
            size='sm'
            variant='default'
            className={cn(
              'border-none !text-white/90 bg-blue !h-7',
              'flex-[0_0_auto] font-semibold !px-2 !py-1.5 !text-xs'
            )}
            isNotification
          />
        ) : (
          <Link href={`/post/${postId}`}>
            <Image
              src={getImageUrl(media!)!}
              alt='Thumbnail'
              width={42}
              height={56}
              className='flex-[0_0_48px] rounded-md self-center'
            />
          </Link>
        )}
      </div>
    </div>
  );
};

export default NotificationCard;
