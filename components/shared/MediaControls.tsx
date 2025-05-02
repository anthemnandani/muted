'use client';

import { MediaControlsProps } from '@/lib/types';
import React from 'react';
import PostActionMenu from '../menus/PostActionMenu';

const MediaControls: React.FC<MediaControlsProps> = ({
  author,
  postId,
  createdAt,
  text,
  hideLikes,
  showControls,
  pinned,
  VolumeControls,
}) => {
  return (
    <div className='absolute top-2 w-full z-50'>
      <div className='flex-between px-4'>
        {VolumeControls || <div />}

        <PostActionMenu
          author={author}
          postId={postId}
          createdAt={createdAt}
          currentText={text ?? ''}
          hideLikes={hideLikes}
          showControls={showControls}
          pinned={pinned}
        />
      </div>
    </div>
  );
};

export default MediaControls;
