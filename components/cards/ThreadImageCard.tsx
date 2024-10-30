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
  const FEED_WIDTH = 470;
  let displayHeight;
  let imageStyle = 'object-cover';

  switch (aspectRatio) {
    case '1:1':
      displayHeight = FEED_WIDTH;
      break;
    case '16:9':
      displayHeight = FEED_WIDTH * (9 / 16);
      break;
    case '4:5':
      displayHeight = FEED_WIDTH * (5 / 4);
      break;
    default:
      if (originalDimensions) {
        const originalRatio =
          originalDimensions.width / originalDimensions.height;

        if (originalRatio < 0.8) {
          displayHeight = FEED_WIDTH * (5 / 4);
          imageStyle = 'object-contain bg-black';
        } else if (originalRatio > 1.91) {
          displayHeight = FEED_WIDTH / 1.91;
          imageStyle = 'object-contain';
        } else {
          displayHeight = FEED_WIDTH / originalRatio;
        }
      } else {
        displayHeight = FEED_WIDTH;
      }
  }

  return (
    <div
      className='w-full relative overflow-hidden mt-2'
      style={{ height: `${Math.round(displayHeight)}px` }}
    >
      <Image
        alt='Post'
        loading='lazy'
        fill
        className={`w-full h-full cursor-pointer ${imageStyle}`}
        src={image ?? ''}
      />
    </div>
  );
};

export default ThreadImageCard;
