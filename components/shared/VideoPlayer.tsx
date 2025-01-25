'use client';

import { loadPlayerScript } from '@/lib/playerjs-loader';
import { Play, PlayIcon } from 'lucide-react';
import Image from 'next/image';
import React from 'react';

interface VideoPlayerProps {
  video: string;
  inView: boolean;
  postId: string;
  text?: string;
  videoStyle?: React.CSSProperties;
}

// const PlayerJsPlayIcon = () => (
//   <svg
//     width='18'
//     height='18'
//     viewBox='0 0 18 18'
//     aria-hidden='true'
//     focusable='false'
//   >
//     <path
//       d='M15.562 8.1L3.87.225c-.818-.562-1.87 0-1.87.9v15.75c0 .9 1.052 1.462 1.87.9L15.563 9.9c.584-.45.584-1.35 0-1.8z'
//       fill='#fff'
//     />
//   </svg>
// );

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  videoStyle,
  inView,
  text,
}) => {
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const playerInstanceRef = React.useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = React.useState(false);

  const videoId = video.split('/').pop();
  const thumbnailUrl = `https://${process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOSTNAME}/${videoId}/thumbnail.jpg`;

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
  }, []);

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
    <div style={videoStyle} className='relative'>
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          isPlayerReady ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Image
          src={thumbnailUrl}
          alt={text || 'Video thumbnail'}
          className='object-cover'
          fill
          priority
        />
        {/* <div className='absolute inset-0 flex items-center justify-center'>
          <button
            type='button'
            className='flex-center p-[15px] bg-[#B51018] rounded-full transition-colors'
          >
            <PlayerJsPlayIcon />
          </button>
        </div> */}
      </div>

      <iframe
        ref={iframeRef}
        src={`${video}?loop=true&autoplay=false&muted=true`}
        loading='lazy'
        title={text || 'Video player'}
        className='w-full h-full'
        allow='autoplay; fullscreen'
      />
    </div>
  );
};
