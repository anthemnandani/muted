'use client';

import React from 'react';

interface ThreadVideoCardProps {
  video: string | undefined;
}

const ThreadVideoCard: React.FC<ThreadVideoCardProps> = ({ video }) => {
  return (
    <div className='relative w-full overflow-hidden mt-2.5'>
      <video
        src={video ?? ''}
        className='relative max-h-128 rounded object-contain object-center hover:cursor-pointer'
        autoPlay
        muted
        loop
        playsInline
      />
    </div>
  );
};

export default ThreadVideoCard;
