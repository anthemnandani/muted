'use client';

import useMediaControls from '@/hooks/useMediaControls';
import { VideoContainerProps } from '@/lib/types';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import PostFooter from '../posts/PostFooter';
import MediaControls from './MediaControls';
import VolumeControls from './VolumeControls';

export const VideoContainer: React.FC<VideoContainerProps> = ({
  children,
  onInViewChange,
  player,
  author,
  createdAt,
  id,
  text,
  hideLikes,
}) => {
  const {
    showControls,
    setShowControls,
    controlsTimeoutRef,
    showControlsTemporarily,
  } = useMediaControls();

  const { ref, inView } = useInView({
    threshold: 0.6,
    triggerOnce: false,
  });

  React.useEffect(() => {
    onInViewChange(inView);
  }, [inView, onInViewChange]);

  return (
    <div
      ref={ref}
      className='relative h-full w-full overflow-hidden flex-grow cursor-pointer bg-black rounded-2xl'
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        setShowControls(false);
      }}
      onTouchStart={showControlsTemporarily}
      onTouchMove={() => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      }}
    >
      {children}
      <MediaControls
        author={author}
        postId={id}
        createdAt={createdAt}
        text={text}
        hideLikes={hideLikes}
        showControls={showControls}
        VolumeControls={
          <VolumeControls player={player} showControls={showControls} />
        }
      />
      <PostFooter author={author} createdAt={createdAt} id={id} text={text} />
    </div>
  );
};
