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
    threshold: 0.6,
  });

  React.useEffect(() => {
    onInViewChange(inView);
  }, [inView, onInViewChange]);

  return (
    <div
      ref={ref}
      className='relative h-full w-full overflow-hidden flex-grow cursor-pointer bg-black rounded-2xl'
    >
      {children}
    </div>
  );
};
