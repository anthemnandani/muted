import { NotificationCardProps } from '@/lib/types';
import { formatTimeAgo, getImageUrl } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const NotificationCard = ({
  sender,
  message,
  media,
  postId,
  createdAt,
}: NotificationCardProps) => {
  return (
    <div className='flex items-start cursor-pointer py-2.5 px-4 hover:bg-[#121212] transition-colors'>
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
          className='line-clamp-1 break-all truncate font-semibold text-sm text-white/90 hover:underline'
        >
          {sender.username}
        </Link>
        <p className='line-clamp-6 text-white/50 text-sm max-h-[130px] break-all'>
          {message} {formatTimeAgo(createdAt)}
        </p>
      </div>
      <Link href={`/post/${postId}`}>
        <Image
          src={getImageUrl(media)!}
          alt='Thumbnail'
          width={42}
          height={56}
          className='flex-[0_0_48px] rounded-md bg-no-repeat bg-cover bg-center'
        />
      </Link>
    </div>
  );
};

export default NotificationCard;
