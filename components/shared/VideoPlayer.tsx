'use client';

import React from 'react';
import useVideoPlayer from '@/store/videoPlayer';
import { loadPlayerJsScript } from '@/lib/playerjs-loader';

interface VideoPlayerProps {
  video: string;
  inView: boolean;
  postId: string;
  text?: string;
  videoStyle?: React.CSSProperties;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  videoStyle,
  inView,
  postId,
  text,
}) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const playerInstanceRef = React.useRef<any>(null);
  const { currentlyPlaying, setCurrentlyPlaying } = useVideoPlayer();

  React.useEffect(() => {
    let mounted = true;

    const initializePlayer = async () => {
      try {
        await loadPlayerJsScript();

        if (!mounted || !iframeRef.current) return;

        // @ts-ignore - playerjs will be available after script loads
        const player = new playerjs.Player(iframeRef.current);

        player.on('ready', () => {
          if (!mounted) return;

          playerInstanceRef.current = player;

          // Set initial state
          if (inView && currentlyPlaying !== postId) {
            handlePlay();
          } else {
            player.pause();
          }
        });
      } catch (error) {
        console.error('Failed to initialize player:', error);
      }
    };

    initializePlayer();

    return () => {
      mounted = false;
      if (currentlyPlaying === postId) {
        setCurrentlyPlaying(null);
      }
    };
  }, [postId]);

  const handlePlay = React.useCallback(() => {
    const player = playerInstanceRef.current;
    if (!player) return;

    // Pause currently playing video if different
    if (currentlyPlaying && currentlyPlaying !== postId) {
      const event = new CustomEvent('pause-video', {
        detail: currentlyPlaying,
      });
      window.dispatchEvent(event);
    }

    player.play();
    setCurrentlyPlaying(postId);
  }, [currentlyPlaying, postId, setCurrentlyPlaying]);

  const handlePause = React.useCallback(() => {
    const player = playerInstanceRef.current;
    if (!player) return;

    player.pause();
    if (currentlyPlaying === postId) {
      setCurrentlyPlaying(null);
    }
  }, [currentlyPlaying, postId, setCurrentlyPlaying]);

  // Listen for pause events from other videos
  React.useEffect(() => {
    const pauseHandler = (e: CustomEvent) => {
      if (e.detail === postId) {
        handlePause();
      }
    };

    window.addEventListener('pause-video', pauseHandler as EventListener);
    return () => {
      window.removeEventListener('pause-video', pauseHandler as EventListener);
    };
  }, [postId, handlePause]);

  // Handle visibility changes
  React.useEffect(() => {
    if (inView) {
      if (currentlyPlaying !== postId) {
        handlePlay();
      }
    } else {
      handlePause();
    }
  }, [inView, currentlyPlaying, postId, handlePlay, handlePause]);

  return (
    <div style={videoStyle}>
      <iframe
        ref={iframeRef}
        src={`${video}?loop=true&enableapi=true`}
        loading='lazy'
        title={text || 'Video player'}
        className='w-full h-full'
        allow='autoplay; fullscreen'
      />
    </div>
  );
};
