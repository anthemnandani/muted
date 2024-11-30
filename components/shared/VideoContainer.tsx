'use client';

import React from 'react';
import { useInView } from 'react-intersection-observer';

interface VideoContainerProps {
  children: React.ReactNode;
  onInViewChange: (inView: boolean) => void;
}

export const VideoContainer: React.FC<VideoContainerProps> = ({
  children,
  onInViewChange,
}) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  React.useEffect(() => {
    onInViewChange(inView);
  }, [inView, onInViewChange]);

  return (
    <div
      ref={ref}
      className='relative overflow-hidden mt-2.5 mb-2 bg-black flex-center w-full cursor-pointer'
      style={{ aspectRatio: '4/5' }}
    >
      {children}
    </div>
  );
};
