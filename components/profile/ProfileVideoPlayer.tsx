'use client';

import { ProfileVideoPlayerProps } from '@/lib/types';
import '@videojs/http-streaming';
import '@videojs/themes/dist/fantasy/index.css';
import React from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

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
      playerRef.current = player;
      onPlayerReady(player);
    }
  }, [options, onPlayerReady]);

  return (
    <div className='profile-video w-full h-full'>
      <video
        data-vjs-player
        ref={videoRef}
        className='video-js w-full h-full'
        data-setup='{"inactivityTimeout": 0}'
        poster={poster}
      />
    </div>
  );
};
