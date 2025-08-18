'use client';

import useMediaControls from '@/hooks/useMediaControls';
import { VideoContainerProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import React, { Fragment } from 'react';
import { useInView } from 'react-intersection-observer';
import PostFooter from '../posts/PostFooter';
import MediaControls from './MediaControls';
import VolumeControls from './VolumeControls';

export const VideoContainer: React.FC<VideoContainerProps> = ({
  children,
  player,
  author,
  createdAt,
  id,
  text,
  reposts,
  pinned,
  setInView,
  repostedBy,
  mentions,
  hideLikes,
  turnOffComments,
  media,
  isThreadView,
}) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  React.useEffect(() => {
    setInView(inView);
  }, [inView, setInView]);

  const {
    showControls,
    setShowControls,
    controlsTimeoutRef,
    showControlsTemporarily,
  } = useMediaControls();

  return (
    <div
      ref={ref}
      className={cn(
        'relative h-full w-full overflow-hidden cursor-pointer bg-black',
        isThreadView ? 'rounded-sm' : 'rounded-2xl'
      )}
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
      {isThreadView && (
        <div className='absolute top-2.5 left-2.5 z-20'>
          <VolumeControls player={player} showControls={showControls} />
        </div>
      )}

      {!isThreadView && (
        <Fragment>
          <MediaControls
            author={author}
            postId={id}
            createdAt={createdAt}
            caption={text}
            hideLikes={hideLikes}
            turnOffComments={turnOffComments}
            showControls={showControls}
            pinned={pinned}
            VolumeControls={
              <VolumeControls player={player} showControls={showControls} />
            }
            media={media}
          />
          <PostFooter
            author={author}
            createdAt={createdAt}
            id={id}
            text={text}
            reposts={reposts}
            repostedBy={repostedBy}
            mentions={mentions}
          />
        </Fragment>
      )}
    </div>
  );
};
