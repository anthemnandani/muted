'use client';

import { VideoContainerProps } from '@/lib/types';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import VolumeControls from './VolumeControls';

const VideoContainer: React.FC<VideoContainerProps> = ({
  children,
  player,
  setInView,
  showControls,
  isModal,
}) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  useEffect(() => {
    setInView(inView);
  }, [inView, setInView]);

  return (
    <div ref={ref} className='post-container-fitted swiper-no-swiping'>
      {children}
      {!isModal && (
        <div className='absolute z-50 top-2 left-2'>
          <VolumeControls player={player} showControls={showControls} />
        </div>
      )}
    </div>
  );
};

export default VideoContainer;
