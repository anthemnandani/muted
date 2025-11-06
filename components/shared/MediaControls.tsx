'use client';

import { MediaControlsProps } from '@/lib/types';
import React from 'react';
import PostActionMenu from '../menus/PostActionMenu';

const MediaControls: React.FC<MediaControlsProps> = ({
  author,
  postId,
  createdAt,
  caption,
  showControls,
  pinned,
  VolumeControls,
  turnOffComments,
  hideLikes,
  media,
}) => {
  return (
    <div className='absolute top-2 w-full z-50'>
      <div className='flex-between px-4'>
        {VolumeControls || <div />}

        <PostActionMenu
          author={author}
          postId={postId}
          createdAt={createdAt}
          caption={caption}
          showControls={showControls}
          turnOffComments={turnOffComments ?? false}
          hideLikes={hideLikes ?? false}
          pinned={pinned}
          media={media}
        />
      </div>
    </div>
  );
};

export default MediaControls;
