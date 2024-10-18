'use client';

import Image from 'next/image';
import React from 'react';

interface ThreadImageCardProps {
  image: string | undefined;
}

const ThreadImageCard: React.FC<ThreadImageCardProps> = ({ image }) => {
  return (
    <div className='relative w-full overflow-hidden mt-2.5'>
      <Image
        alt='Post'
        loading='lazy'
        width={650}
        height={600}
        className='relative max-h-128 rounded object-contain object-center hover:cursor-pointer'
        src={image ?? ''}
      />
    </div>
  );
};

export default ThreadImageCard;
