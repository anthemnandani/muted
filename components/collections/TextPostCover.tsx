'use client';

import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, getInitials } from '@/lib/utils';

interface TextPostCoverProps {
  author: {
    image: string | null;
    fullName: string | null;
    username: string | null;
  };
  content: string;
}

const TextPostCover = ({ author, content }: TextPostCoverProps) => {
  const { image, fullName, username } = author;

  return (
    <Card className='h-full w-full border-0 rounded-none bg-muted p-3 transition-all duration-300 group-hover:scale-[1.02]'>
      <div className='flex items-start space-x-3'>
        <Avatar className='size-8 border-2 border-border-dark dark:border-border-light sm:size-10'>
          <AvatarImage
            src={image ?? ''}
            alt={fullName ?? 'Profile picture'}
            className='object-cover'
          />
          <AvatarFallback>{getInitials(fullName)}</AvatarFallback>
        </Avatar>

        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium leading-none mb-1 truncate'>
            {fullName}
          </p>
          <p className='text-xs text-muted-foreground truncate'>@{username}</p>
        </div>
      </div>

      <div className='mt-3 relative h-[calc(100%-3.5rem)]'>
        <p
          className={cn(
            'text-sm',
            'line-clamp-4 sm:line-clamp-5',
            'break-words whitespace-pre-wrap'
          )}
        >
          {content}
        </p>
      </div>
    </Card>
  );
};

export default TextPostCover;
