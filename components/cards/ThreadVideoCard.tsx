'use client';
import useVideoStyles from '@/hooks/useVideoStyles';
import React from 'react';
import { VideoContainer } from '../shared/VideoContainer';
import { VideoPlayer } from '../shared/VideoPlayer';

interface ThreadVideoCardProps {
  video: string;
  aspectRatio?: string;
  originalDimensions?: { width: number; height: number };
  text?: string;
  postId: string;
}

const ThreadVideoCard: React.FC<ThreadVideoCardProps> = ({
  video,
  aspectRatio,
  originalDimensions,
  text,
  postId,
}) => {
  const [inView, setInView] = React.useState(false);
  const { videoStyle } = useVideoStyles(aspectRatio, originalDimensions);

  return (
    <VideoContainer onInViewChange={setInView}>
      <VideoPlayer
        video={video}
        videoStyle={videoStyle}
        inView={inView}
        postId={postId}
        text={text}
      />
    </VideoContainer>
  );
};

export default ThreadVideoCard;
