'use client';

import Image from 'next/image';
import React from 'react';
import { cn } from '@/lib/utils';
import { FileType } from '@prisma/client';

interface ThreadImageCardProps {
  image: string;
  fileType: FileType;
}

const ThreadImageCard: React.FC<ThreadImageCardProps> = ({
  image,
  fileType,
}) => {
  return (
    <div className='mt-2.5 mb-2 block px-2 md:px-4'>
      <Image
        src={image}
        alt='Post media'
        width={0}
        height={0}
        sizes='100vw'
        unoptimized={fileType === FileType.GIF}
        className={cn(
          'h-auto w-auto',
          'max-h-[360px] max-w-[85%]',
          'rounded-md border border-border/50 object-contain',
        )}
      />
    </div>
  );
};

export default ThreadImageCard;
