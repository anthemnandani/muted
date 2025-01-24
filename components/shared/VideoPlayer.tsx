'use client';

import React from 'react';
import { loadPlayerScript } from '@/lib/playerjs-loader';

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
  text,
}) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const playerInstanceRef = React.useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const initPlayer = async () => {
      try {
        await loadPlayerScript();

        if (!mounted || !iframeRef.current) return;

        // @ts-ignore - Player.js becomes available after script loads
        const player = new playerjs.Player(iframeRef.current);

        player.on('ready', () => {
          if (!mounted) return;
          playerInstanceRef.current = player;
          setIsPlayerReady(true);
        });
      } catch (error) {
        console.error('Error initializing player:', error);
      }
    };

    initPlayer();

    return () => {
      mounted = false;
      setIsPlayerReady(false);
    };
  }, []); // Only run once on mount

  // Handle play/pause when either inView changes or player becomes ready
  React.useEffect(() => {
    const player = playerInstanceRef.current;
    if (player && isPlayerReady) {
      try {
        if (inView) {
          player.play();
        } else {
          player.pause();
        }
      } catch (error) {
        console.error('Error controlling video:', error);
      }
    }
  }, [inView, isPlayerReady]);

  return (
    <div style={videoStyle}>
      <iframe
        ref={iframeRef}
        src={`${video}?autoplay=false&loop=true&enableapi=true&muted=true`}
        loading='lazy'
        title={text || 'Video player'}
        className='w-full h-full'
        allow='autoplay; fullscreen'
      />
    </div>
  );
};
