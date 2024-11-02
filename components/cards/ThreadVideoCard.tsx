'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

interface ThreadVideoCardProps {
  video: string | undefined;
  aspectRatio?: string;
  originalDimensions?: { width: number; height: number };
  username?: string;
  postId?: string;
}

const ThreadVideoCard: React.FC<ThreadVideoCardProps> = ({
  video,
  aspectRatio,
  originalDimensions,
  username,
  postId,
}) => {
  const FEED_WIDTH = 550;
  const MIN_RATIO = 0.8;
  const MAX_RATIO = 1.91;
  let displayWidth = FEED_WIDTH;
  let displayHeight;

  const router = useRouter();

  const handleVideoClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLVideoElement;
    const rect = target.getBoundingClientRect();
    const y = e.clientY - rect.top;

    if (y < rect.height - 40) {
      router.push(`/@${username}/post/${postId}`);
    }
  };

  switch (aspectRatio) {
    case '16:9':
      displayHeight = 309;
      break;
    case '4:5':
      displayHeight = 688;
      break;
    case '9:16':
      displayWidth = 387;
      displayHeight = 688;
      break;
    default:
      if (originalDimensions) {
        const originalRatio =
          originalDimensions.width / originalDimensions.height;

        if (originalRatio < MIN_RATIO) {
          displayHeight = 688;
        } else if (originalRatio > MAX_RATIO) {
          displayHeight = 309;
        } else {
          displayHeight = Math.round(FEED_WIDTH / originalRatio);
        }
      } else {
        displayHeight = FEED_WIDTH;
      }
  }

  return (
    <div
      className='relative overflow-hidden mt-2.5 mb-2 bg-black flex-center'
      style={{
        width: `${FEED_WIDTH}px`,
        height: `${displayHeight}px`,
      }}
    >
      <video
        loop
        controls
        muted
        controlsList='nodownload nofullscreen noremoteplayback noplaybackrate'
        className='cursor-pointer h-full w-full object-cover
            [&::-webkit-media-controls-fullscreen-button]:hidden'
        style={{
          width: `${displayWidth}px`,
        }}
        onClick={handleVideoClick}
        src={video}
      />
    </div>
  );
};

export default ThreadVideoCard;
