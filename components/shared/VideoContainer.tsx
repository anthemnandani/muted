'use client';

import useVideoStyles from '@/hooks/useVideoStyles';
import React from 'react';
import { useInView } from 'react-intersection-observer';

interface VideoContainerProps {
  children: React.ReactNode;
  aspectRatio?: string;
  originalDimensions?: { width: number; height: number };
  onInViewChange: (inView: boolean) => void;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const VideoContainer: React.FC<VideoContainerProps> = ({
  children,
  aspectRatio,
  originalDimensions,
  onInViewChange,
  onClick,
}) => {
  const { ref, inView } = useInView({
    threshold: 0.45,
  });

  React.useEffect(() => {
    onInViewChange(inView);
  }, [inView, onInViewChange]);

  const { containerStyle } = useVideoStyles(aspectRatio, originalDimensions);

  return (
    <div
      ref={ref}
      className='relative overflow-hidden mt-2.5 mb-2 bg-black flex-center w-full cursor-pointer'
      style={containerStyle}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
