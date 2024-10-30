'use client';

import React from 'react';

interface ThreadVideoCardProps {
  video: string | undefined;
  aspectRatio?: string;
}

const ThreadVideoCard: React.FC<ThreadVideoCardProps> = ({
  video,
  aspectRatio,
}) => {
  const FEED_WIDTH = 470;
  let containerWidth = FEED_WIDTH;
  let containerHeight;
  let videoWidth;
  let videoHeight;

  switch (aspectRatio) {
    case '16:9':
      containerHeight = FEED_WIDTH * (9 / 16);
      videoWidth = containerWidth;
      videoHeight = containerHeight;
      break;
    case '4:5':
      containerHeight = FEED_WIDTH * (5 / 4);
      videoWidth = containerWidth;
      videoHeight = containerHeight;
      break;
    case '9:16':
      containerHeight = FEED_WIDTH * (5 / 4);
      videoHeight = containerHeight;
      videoWidth = videoHeight * (9 / 16);
      break;
    default:
      containerHeight = FEED_WIDTH;
      videoWidth = containerWidth;
      videoHeight = containerHeight;
  }

  return (
    <div className='mt-2.5 flex'>
      <div
        className='relative flex items-center'
        style={{
          width: containerWidth,
          height: containerHeight,
        }}
      >
        <video
          loop
          controls
          muted
          controlsList='nodownload nofullscreen noremoteplayback noplaybackrate'
          className='rounded-md object-cover cursor-pointer 
        [&::-webkit-media-controls-fullscreen-button]:hidden'
          style={{
            width: videoWidth,
            height: videoHeight,
          }}
          src={video}
        />
      </div>
    </div>
  );
};

export default ThreadVideoCard;
