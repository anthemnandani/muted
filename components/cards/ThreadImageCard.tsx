'use client';

import Image from 'next/image';
import React from 'react';

interface ThreadImageCardProps {
  image: string | undefined;
}

const ThreadImageCard: React.FC<ThreadImageCardProps> = ({ image }) => {
  return (
    <div className='relative overflow-hidden w-fit mt-2.5 cursor-pointer'>
      <Image
        loading='lazy'
        src={image ?? ''}
        width={630}
        height={630}
        alt='Image'
        className='object-contain max-h-[430px] w-max'
      />
    </div>
  );
};

export default ThreadImageCard;
