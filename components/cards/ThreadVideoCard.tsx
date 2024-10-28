'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface ThreadVideoCardProps {
  video: string | undefined;
  aspectRatio?: string;
}

const ThreadVideoCard: React.FC<ThreadVideoCardProps> = ({
  video,
  aspectRatio,
}) => {
  return (
    <div className='mt-2.5 flex'>
      <div
        className={cn(
          'relative w-full flex items-center',
          aspectRatio === '16:9' && 'h-auto',
          aspectRatio === '9:16' && 'min-h-[480px] max-h-[580px]'
        )}
      >
        <video
          loop
          controls
          muted
          controlsList='nodownload nofullscreen noremoteplayback noplaybackrate'
          className='rounded-md object-cover h-full cursor-pointer 
          [&::-webkit-media-controls-fullscreen-button]:hidden'
          src={video}
        />
      </div>
    </div>
  );
};

export default ThreadVideoCard;
