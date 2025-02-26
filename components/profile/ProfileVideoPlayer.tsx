'use client';

import React from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import '@videojs/http-streaming';
import '@videojs/themes/dist/fantasy/index.css';
import { ProfileVideoPlayerProps } from '@/lib/types';

export const ProfileVideoPlayer: React.FC<ProfileVideoPlayerProps> = ({
  options,
  onPlayerReady,

  poster,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const playerRef = React.useRef<Player | null>(null);

  React.useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      const player = videojs(videoRef.current, options);

      const customStyles = `
        .vjs-poster img {
          object-fit: cover !important;
        }
        .video-js .vjs-tech {
          object-fit: cover !important;
        }
        `;

      const styleSheet = document.createElement('style');
      styleSheet.textContent = customStyles;
      document.head.appendChild(styleSheet);

      playerRef.current = player;
      onPlayerReady(player);
    }
  }, [options, onPlayerReady]);

  return (
    <video
      data-vjs-player
      ref={videoRef}
      className='video-js w-full h-full'
      data-setup='{"inactivityTimeout": 0}'
      poster={poster}
    />
  );
};
