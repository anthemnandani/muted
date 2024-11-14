'use client';

import useVideoPlayer from '@/store/videoPlayer';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useInView } from 'react-intersection-observer';

interface ThreadVideoCardProps {
  video: string | undefined;
  aspectRatio?: string;
  originalDimensions?: { width: number; height: number };
  username?: string;
  postId?: string;
}

const ThreadVideoCard: React.FC<ThreadVideoCardProps> = ({
  video,
  aspectRatio,
  originalDimensions,
  username,
  postId,
}) => {
  const {
    currentlyPlaying,
    setCurrentlyPlaying,
    isMuted,
    setIsMuted,
    timestamps,
    setTimestamp,
  } = useVideoPlayer();
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const videoId = React.useMemo(
    () => `${username}-${postId}`,
    [username, postId]
  );
  const { ref: intersectionRef, inView } = useInView({
    threshold: 0.45,
  });
  const MIN_RATIO = 0.8;
  const MAX_RATIO = 16 / 9;
  let targetRatio = 16 / 9;

  const is916 = aspectRatio === '9:16';

  const router = useRouter();

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.video-controls') ||
      target.closest('video::-webkit-media-controls-panel') ||
      target.closest('video::-webkit-media-controls')
    ) {
      e.stopPropagation();
      return;
    }

    router.push(`/${username}/post/${postId}`);
  };

  const handleMuteChange = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement;
    setIsMuted(video.muted);
  };

  const handleTimeUpdate = React.useCallback(() => {
    if (videoRef.current && inView) {
      setTimestamp(videoId, videoRef.current.currentTime);
    }
  }, [videoId, setTimestamp, inView]);

  if (!is916) {
    switch (aspectRatio) {
      case '16:9':
        targetRatio = 16 / 9;
        break;
      case '4:5':
        targetRatio = 4 / 5;
        break;
      default:
        if (originalDimensions) {
          const originalRatio =
            originalDimensions.width / originalDimensions.height;
          if (originalRatio < MIN_RATIO && originalRatio !== 9 / 16) {
            targetRatio = 4 / 5;
          } else if (originalRatio > MAX_RATIO) {
            targetRatio = 16 / 9;
          } else {
            targetRatio = originalRatio;
          }
        }
    }
  }

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (inView) {
      if (!currentlyPlaying || currentlyPlaying === videoId) {
        setCurrentlyPlaying(videoId);
        video.play().catch(() => {});
      }
    } else {
      video.pause();
      if (currentlyPlaying === videoId) {
        setCurrentlyPlaying(null);
      }
    }
  }, [inView, videoId, setCurrentlyPlaying, currentlyPlaying]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (currentlyPlaying && currentlyPlaying !== videoId) {
      video.pause();
    }
  }, [currentlyPlaying, videoId]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (video && timestamps[videoId]) {
      video.currentTime = timestamps[videoId];
    }
  }, []);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div
      ref={intersectionRef}
      className='relative overflow-hidden mt-2.5 mb-2 bg-black flex-center w-full'
      style={{
        aspectRatio: is916 ? '4/5' : `${targetRatio}`,
      }}
    >
      <video
        ref={videoRef}
        loop
        controls
        muted={isMuted}
        playsInline
        preload='auto'
        controlsList='nodownload nofullscreen noremoteplayback noplaybackrate'
        className='cursor-pointer h-full
        [&::-webkit-media-controls-fullscreen-button]:hidden
        webkit-playsinline'
        style={{
          width: is916 ? '70.36%' : '100%',
          objectFit: 'cover',
        }}
        onClick={handleVideoClick}
        onVolumeChange={handleMuteChange}
        onTimeUpdate={handleTimeUpdate}
        src={video}
      />
    </div>
  );
};

export default ThreadVideoCard;
