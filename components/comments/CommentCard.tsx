import { Comment } from '@/lib/types';
import { formatCount, formatTimeAgo } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

const CommentCard = ({ comment }: { comment: Comment }) => {
  return (
    <div key={comment.id} className='px-4 py-3 '>
      <div className='flex items-start gap-3'>
        <div className='flex-shrink-0'>
          <Avatar className='rounded-full w-full h-full size-10'>
            <AvatarImage
              src={comment.author.image ?? ''}
              alt={comment.author.username ?? ''}
              className='object-cover'
            />
            <AvatarFallback>
              {comment.author.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-1'>
            <span className='font-medium text-white'>
              {comment.author.username}
            </span>
            {/* {comment.verified && (
              <svg
                width='14'
                height='14'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z'
                  fill='#1D9BF0'
                />
                <path
                  d='M7.75 12.75L10 15.25L16.25 9'
                  stroke='white'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
            )} */}
          </div>
          <p className='mt-1 text-white'>{comment.text}</p>
          <div className='flex items-center mt-1 gap-6'>
            <span className='text-sm text-gray-400'>
              {formatTimeAgo(comment.createdAt)}
            </span>
            <div className='flex items-center'>
              <button className='flex items-center text-gray-400 hover:text-gray-300'>
                <Heart className='size-4' />
                <span className='ml-1 text-sm'>
                  {formatCount(comment.likesCount)}
                </span>
              </button>
            </div>

            <button className='text-gray-400 text-sm hover:text-gray-300'>
              Reply
            </button>
          </div>
        </div>
        <button className='text-gray-500 p-1'>
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M12 12V12.01M12 6V6.01M12 18V18.01M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13ZM12 7C12.5523 7 13 6.55228 13 6C13 5.44772 12.5523 5 12 5C11.4477 5 11 5.44772 11 6C11 6.55228 11.4477 7 12 7ZM12 19C12.5523 19 13 18.5523 13 18C13 17.4477 12.5523 17 12 17C11.4477 17 11 17.4477 11 18C11 18.5523 11.4477 19 12 19Z'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CommentCard;
