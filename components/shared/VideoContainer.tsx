'use client';

import { VideoContainerProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Fragment, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import PostFooter from '../posts/PostFooter';
import VolumeControls from './VolumeControls';

export const VideoContainer: React.FC<VideoContainerProps> = ({
  children,
  player,
  author,
  createdAt,
  id,
  text,
  reposts,
  setInView,
  repostedBy,
  mentions,
  isThreadView,
  showControls,
}) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  useEffect(() => {
    setInView(inView);
  }, [inView, setInView]);

  return (
    <div
      ref={ref}
      className={cn(
        'relative h-full w-full overflow-hidden cursor-pointer bg-gray-6',
        isThreadView ? 'rounded-sm' : 'rounded-2xl'
      )}
    >
      {children}
      {isThreadView && (
        <div className='absolute top-2.5 left-2.5 z-20'>
          <VolumeControls player={player} showControls={showControls} />
        </div>
      )}

      {!isThreadView && (
        <Fragment>
          <div className='absolute top-5 left-4 z-50'>
            <VolumeControls player={player} showControls={showControls} />
          </div>
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
