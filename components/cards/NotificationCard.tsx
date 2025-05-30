import { NotificationCardProps } from '@/lib/types';
import { cn, formatTimeAgo, getImageUrl } from '@/lib/utils';
import { NotificationType } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
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
  return (
    <div className='hover:bg-[#1a1a1a] transition-colors'>
      <div className='flex items-start cursor-pointer py-2.5 px-2'>
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
          <p className='line-clamp-6 text-white/50 text-sm leading-[18px] max-h-[130px] break-words'>
            {message}
            {'. '} {formatTimeAgo(createdAt)}
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
