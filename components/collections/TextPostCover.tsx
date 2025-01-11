'use client';

import Image from 'next/image';

interface TextPostCoverProps {
  author: {
    image: string;
    fullName: string;
    username: string;
  };
  content: string;
}

const TextPostCover = ({ author, content }: TextPostCoverProps) => {
  const { image, fullName, username } = author;

  return (
    <div className='flex h-full w-full flex-col overflow-hidden transition-transform duration-300 group-hover:scale-105'>
      <div className='m-2 flex items-center space-x-2'>
        <div className='size-8 min-w-max sm:size-10 xl:size-12'>
          <Image
            alt={`${fullName}'s profile picture`}
            loading='lazy'
            width='50'
            height='50'
            decoding='async'
            className='size-6 content-center rounded-full border-2 border-border-dark dark:border-border-light object-cover sm:size-8 xl:size-10'
            src={image}
            style={{ color: 'transparent' }}
          />
        </div>
        <div className='flex flex-col min-w-0'>
          <div className='mr-2 text-xs sm:text-sm font-medium'>{fullName}</div>
          <div className='text-xs text-muted-foreground truncate'>
            @{username}
          </div>
        </div>
      </div>
      <div className='relative mx-2 mb-1 h-full overflow-hidden'>
        <div className='absolute text-xs sm:text-sm line-clamp-3'>
          {content}
        </div>
      </div>
    </div>
  );
};

export default TextPostCover;
