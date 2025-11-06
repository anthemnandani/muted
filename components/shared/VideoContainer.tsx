'use client';

import { VideoContainerProps } from '@/lib/types';
import { Fragment, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import PostFooter from '../posts/PostFooter';
import VolumeControls from './VolumeControls';

export const VideoContainer: React.FC<VideoContainerProps> = ({
  id,
  children,
  player,
  author,
  createdAt,
  text,
  reposts,
  setInView,
  repostedBy,
  mentions,
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
      className='relative h-full w-full overflow-hidden cursor-pointer bg-gray-6 rounded-2xl'
    >
      {children}
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
    </div>
  );
};
