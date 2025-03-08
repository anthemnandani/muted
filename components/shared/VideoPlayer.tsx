'use client';

import React from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import '@videojs/http-streaming';
import '@videojs/themes/dist/fantasy/index.css';
import { VideoPlayerProps } from '@/lib/types';

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

      const customStyles = `
        .video-js .vjs-progress-control {
          position: absolute;
          bottom: 6px;
          width: 100%;
          height: 4px;
        }

        .video-js .vjs-progress-holder {
          height: 4px;
          margin: 0;
          cursor: pointer;
        }

        .video-js .vjs-play-progress {
          background-color: #ff0050;
        }

        .video-js .vjs-progress-holder .vjs-play-progress:before {
          content: '';
          display: block !important;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: -4px;
          right: -6px;
          z-index: 1;
        }

        .video-js .vjs-time-tooltip,
        .video-js .vjs-remaining-time-display,
        .video-js .vjs-progress-control .vjs-mouse-display,
        .video-js .vjs-progress-control .vjs-time-tooltip {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        }

        .video-js .vjs-control-bar {
          background: none;
          height: 4px;
        }

        .video-js .vjs-remaining-time,
        .video-js .vjs-volume-panel,
        .video-js .vjs-play-control {
          display: none;
        }
      `;

      const styleSheet = document.createElement('style');
      styleSheet.textContent = customStyles;
      document.head.appendChild(styleSheet);

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
      // webkit-playsinline='true'
      // x-webkit-airplay='allow'
      style={{
        height: '100%',
        aspectRatio: '9/16',
        width: 'auto',
      }}
    />
  );
};
