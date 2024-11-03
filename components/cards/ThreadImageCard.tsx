'use client';

import Image from 'next/image';
import React from 'react';

interface ThreadImageCardProps {
  image: string | undefined;
  aspectRatio?: string;
  originalDimensions?: { width: number; height: number };
}

const ThreadImageCard: React.FC<ThreadImageCardProps> = ({
  image,
  aspectRatio,
  originalDimensions,
}) => {
  const MIN_RATIO = 0.8;
  const MAX_RATIO = 1.91;
  let targetRatio = 1;

  switch (aspectRatio) {
    case '1:1':
      targetRatio = 1;
      break;
    case '16:9':
      targetRatio = 16 / 9;
      break;
    case '4:5':
      targetRatio = 4 / 5;
      break;
    default:
      if (originalDimensions) {
        const originalRatio =
          originalDimensions.width / originalDimensions.height;
        if (originalRatio < MIN_RATIO) {
          targetRatio = MIN_RATIO;
        } else if (originalRatio > MAX_RATIO) {
          targetRatio = MAX_RATIO;
        } else {
          targetRatio = originalRatio;
        }
      }
  }

  return (
    <div
      className='relative overflow-hidden mt-2.5 mb-2 bg-black w-full'
      style={{
        aspectRatio: `${targetRatio}`,
      }}
    >
      <Image
        alt='Post'
        loading='lazy'
        fill
        className='cursor-pointer'
        src={image ?? ''}
      />
    </div>
  );
};

export default ThreadImageCard;
