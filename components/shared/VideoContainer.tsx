'use client';

import { VideoContainerProps } from '@/lib/types';
import { Fragment, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import VolumeControls from './VolumeControls';

export const VideoContainer: React.FC<VideoContainerProps> = ({
  children,
  player,
  setInView,
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
    <div ref={ref} className='post-container-fitted'>
      {children}
      <Fragment>
        <div className='absolute top-5 left-4 z-50'>
          <VolumeControls player={player} showControls={showControls} />
        </div>
      </Fragment>
    </div>
  );
};
