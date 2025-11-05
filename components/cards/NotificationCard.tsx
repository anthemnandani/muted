'use client';

import { NotificationCardProps } from '@/lib/types';
import { cn, formatTimeAgo, getImageUrl } from '@/lib/utils';
import useCommentPanelStore from '@/store/commentPanel';
import { useNotificationStore } from '@/store/notificationStore';
import { NotificationType } from '@prisma/client';
import {
  AlertTriangle,
  CheckCircle,
  ShieldBan,
  ShieldCheck,
  ShieldOff,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FollowButton from '../buttons/FollowButton';
import PostText from '../shared/PostText';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const NotificationCard = ({
  sender,
  message,
  media,
  postId,
  createdAt,
  type,
  isLast,
}: NotificationCardProps) => {
  const router = useRouter();
  const { setStoredPathname } = useCommentPanelStore();
  const { setIsNotificationOpen } = useNotificationStore();

  const isSystemNotification = [
    NotificationType.WARNING,
    NotificationType.SUSPENDED,
    NotificationType.UNSUSPENDED,
    NotificationType.ADMIN_PROMOTED,
    NotificationType.ADMIN_DEMOTED,
  ];

  const isSystemNotificationCheck = isSystemNotification.includes(
    type as (typeof isSystemNotification)[number]
  );

  const handleClick = () => {
    if (isSystemNotificationCheck) {
      return;
    }

    switch (type) {
      case NotificationType.FOLLOWER:
        router.push(`/@${sender!.username}`);
        break;
      case NotificationType.LIKE:
        router.push(`/post/${postId}`);
        break;
      case NotificationType.COMMENT:
      case NotificationType.MENTION:
        setStoredPathname(`/post/${postId}`);
        setIsNotificationOpen(false);
        router.push(`/post/${postId}`);
        break;
      default:
        break;
    }
  };

  const renderSystemIcon = () => {
    switch (type) {
      case NotificationType.WARNING:
        return <AlertTriangle className='size-6 text-yellow-500' />;
      case NotificationType.SUSPENDED:
        return <ShieldBan className='size-6 text-red-500' />;
      case NotificationType.UNSUSPENDED:
        return <CheckCircle className='size-6 text-green-500' />;
      case NotificationType.ADMIN_PROMOTED:
        return <ShieldCheck className='size-6 text-primary-blue' />;
      case NotificationType.ADMIN_DEMOTED:
        return <ShieldOff className='size-6 text-yellow-500' />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'hover:bg-[#1a1a1a] transition-colors cursor-pointer',
        isLast && 'mb-20',
        isSystemNotificationCheck && 'cursor-default'
      )}
      onClick={handleClick}
    >
      <div className='flex items-start py-2.5 pl-3 pr-4'>
        {isSystemNotificationCheck ? (
          <div className='flex-center size-12 flex-shrink-0 rounded-full bg-gray-700/50'>
            {renderSystemIcon()}
          </div>
        ) : (
          <Avatar className='size-12 rounded-full object-cover flex-[0_0_48px]'>
            <AvatarImage
              src={sender!.image ?? ''}
              alt={sender!.fullName ?? ''}
              className='rounded-full w-full h-full object-cover'
            />
            <AvatarFallback className='flex-center'>
              {sender!.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        <div className='flex-1 px-3'>
          {!isSystemNotificationCheck && sender && (
            <Link
              href={`/@${sender.username}`}
              className='line-clamp-1 break-words truncate font-semibold text-sm text-white/90 hover:underline'
            >
              {sender.username}
            </Link>
          )}

          {type === NotificationType.COMMENT ||
          type === NotificationType.MENTION ? (
            <div className='flex flex-col'>
              <PostText
                className='leading-[18px] max-h-[130px] line-clamp-6 text-white/70'
                text={message}
                showMore={false}
              />
              <span className='text-white/50 text-sm mt-1'>
                {formatTimeAgo(createdAt)}
              </span>
            </div>
          ) : (
            <p className='text-white/70 text-sm leading-[18px] break-words'>
              {message}
              {(type === NotificationType.LIKE ||
                type === NotificationType.FOLLOWER) &&
                '.'}
              &nbsp;
              <span className='text-white/50'>{formatTimeAgo(createdAt)}</span>
            </p>
          )}
        </div>

        {type === NotificationType.FOLLOWER ? (
          <FollowButton
            author={sender!}
            size='sm'
            variant='default'
            className={cn(
              'border-none !text-white/90 !bg-primary-blue !h-7',
              'flex-[0_0_auto] font-semibold !px-2 !py-1.5 !text-xs'
            )}
            isNotification
          />
        ) : media ? (
          <Link href={`/post/${postId}`}>
            <Image
              src={getImageUrl(media!)!}
              alt='Thumbnail'
              width={42}
              height={56}
              className='flex-[0_0_48px] rounded-md self-center object-cover'
            />
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default NotificationCard;
