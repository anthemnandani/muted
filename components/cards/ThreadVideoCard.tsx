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
  const MIN_RATIO = 0.8;
  const MAX_RATIO = 16 / 9;
  let targetRatio = 16 / 9;

  const is916 = aspectRatio === '9:16';

  const router = useRouter();

  const handleVideoClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLVideoElement;
    const rect = target.getBoundingClientRect();
    const y = e.clientY - rect.top;

    if (y < rect.height - 40) {
      router.push(`/@${username}/post/${postId}`);
    }
  };

  if (!is916) {
    switch (aspectRatio) {
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
          if (originalRatio < MIN_RATIO && originalRatio !== 9 / 16) {
            targetRatio = 4 / 5;
          } else if (originalRatio > MAX_RATIO) {
            targetRatio = 16 / 9;
          } else {
            targetRatio = originalRatio;
          }
        }
    }
  }

  return (
    <div
      className='relative overflow-hidden mt-2.5 mb-2 bg-black flex-center w-full'
      style={{
        aspectRatio: is916 ? '4/5' : `${targetRatio}`,
      }}
    >
      <video
        loop
        controls
        muted
        playsInline
        preload='metadata'
        controlsList='nodownload nofullscreen noremoteplayback noplaybackrate'
        className='cursor-pointer h-full
        [&::-webkit-media-controls-fullscreen-button]:hidden
        webkit-playsinline'
        style={{
          width: is916 ? '70.36%' : '100%',
          objectFit: 'cover',
        }}
        onClick={handleVideoClick}
        src={video}
      />
    </div>
  );
};

export default ThreadVideoCard;
