'use client';

import useVideoPlayer from '@/store/videoPlayer';
import { useRouter } from 'next/navigation';
import React from 'react';

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
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const MIN_RATIO = 0.8;
  const MAX_RATIO = 16 / 9;
  let targetRatio = 16 / 9;

  const is916 = aspectRatio === '9:16';

  const router = useRouter();

  const handleVideoClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLVideoElement;
    const rect = target.getBoundingClientRect();
    const y = e.clientY - rect.top;

    if (y < rect.height - 40) {
      router.push(`/@${username}/post/${postId}`);
    }
  };

  const handleMuteChange = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement;
    setIsMuted(video.muted);
  };

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

  const { currentlyPlaying, setCurrentlyPlaying, isMuted, setIsMuted } =
    useVideoPlayer();
  const videoId = `${username}-${postId}`;

  React.useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: Array.from({ length: 101 }, (_, i) => i / 100),
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const rect = entry.boundingClientRect;
        const windowHeight = window.innerHeight;

        const visibilityThreshold = is916 ? 0.7 : 0.9;

        if (entry.intersectionRatio >= visibilityThreshold) {
          const isVisible = is916
            ? rect.top <= windowHeight * 0.3 &&
              rect.bottom >= windowHeight * 0.3
            : rect.top >= 0 && rect.bottom <= windowHeight;

          if (isVisible) {
            if (!currentlyPlaying || currentlyPlaying === videoId) {
              videoRef.current?.play();
              setCurrentlyPlaying(videoId);
            }
          } else {
            if (currentlyPlaying === videoId) {
              videoRef.current?.pause();
              setCurrentlyPlaying(null);
            }
          }
        } else {
          if (currentlyPlaying === videoId) {
            videoRef.current?.pause();
            setCurrentlyPlaying(null);
          }
        }
      });
    }, options);

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
      if (currentlyPlaying === videoId) {
        setCurrentlyPlaying(null);
      }
    };
  }, [currentlyPlaying, videoId, setCurrentlyPlaying]);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div
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
        src={video}
      />
    </div>
  );
};

export default ThreadVideoCard;
