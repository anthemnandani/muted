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
  const FEED_WIDTH = 550;
  const MIN_RATIO = 0.8;
  const MAX_RATIO = 1.91;
  let displayWidth = FEED_WIDTH;
  let displayHeight;

  switch (aspectRatio) {
    case '1:1':
      displayHeight = FEED_WIDTH;
      break;
    case '16:9':
      displayHeight = Math.round(FEED_WIDTH * (9 / 16));
      break;
    case '4:5':
      displayHeight = Math.round(FEED_WIDTH * (5 / 4));
      break;
    default:
      if (originalDimensions) {
        const originalRatio =
          originalDimensions.width / originalDimensions.height;

        if (originalRatio < MIN_RATIO) {
          displayHeight = Math.round(FEED_WIDTH * (5 / 4));
          displayWidth = Math.round(displayHeight * MIN_RATIO);
        } else if (originalRatio > MAX_RATIO) {
          displayHeight = Math.round(FEED_WIDTH / MAX_RATIO);
          displayWidth = Math.round(displayHeight * MAX_RATIO);
        } else {
          displayHeight = Math.round(FEED_WIDTH / originalRatio);
        }
      } else {
        displayHeight = FEED_WIDTH;
      }
  }

  return (
    <div
      className='relative overflow-hidden mt-2.5 mb-2 bg-black'
      style={{ height: `${displayHeight}px`, width: `${FEED_WIDTH}px` }}
    >
      <Image
        alt='Post'
        loading='lazy'
        fill
        className='cursor-pointer w-full h-full'
        src={image ?? ''}
      />
    </div>
  );
};

export default ThreadImageCard;
