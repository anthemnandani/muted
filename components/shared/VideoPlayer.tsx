'use client';

import React from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/fantasy/index.css';
import '@videojs/http-streaming';

interface VideoPlayerProps {
  options: any;
  onPlayerReady: (player: Player) => void;
  onTouchStart?: (e: React.TouchEvent<HTMLVideoElement>) => void;
  onTimeUpdate?: () => void;
  poster?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  options,
  onPlayerReady,
  onTouchStart,
  onTimeUpdate,
  poster,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const playerRef = React.useRef<Player | null>(null);

  React.useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      const player = videojs(videoRef.current, options);

      player.on('dblclick', (e: React.MouseEvent<HTMLVideoElement>) => {
        e.preventDefault();
      });

      playerRef.current = player;
      onPlayerReady(player);
    }
  }, [options, onPlayerReady]);

  return (
    <video
      data-vjs-player
      ref={videoRef}
      className='video-js vjs-theme-fantasy vjs-show-big-play-button-on-pause'
      data-setup='{"inactivityTimeout": 0}'
      onTouchStart={onTouchStart}
      onTimeUpdate={onTimeUpdate}
      poster={poster}
      style={{
        height: '100%',
        aspectRatio: '9/16',
        width: 'auto',
      }}
    />
  );
};
