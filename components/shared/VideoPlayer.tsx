'use client';

import { AspectRatio, VideoPlayerProps } from '@/lib/types';
import '@videojs/http-streaming';
import '@videojs/themes/dist/fantasy/index.css';
import { useRef, useEffect } from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  options,
  onPlayerReady,
  poster,
  onTimeUpdate,
  aspectRatio,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (videoRef.current && !playerRef.current) {
      const player = videojs(videoRef.current, options);

      const customStyles = `
        .video-js .vjs-progress-control {
          position: absolute;
          bottom: 8px;
          width: 100%;
          height: 12px;
          cursor: pointer;
        }

        .video-js .vjs-progress-holder {
          height: 4px;
          margin: 4px 0;
        }

        .video-js .vjs-play-progress {
          background-color: #ff0050;
        }

        .video-js .vjs-progress-holder .vjs-play-progress:before {
          content: '';
          display: none !important;
          width: 14px;
          height: 14px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: -5px;
          right: -7px;
          z-index: 1;
          box-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
        }

        .video-js .vjs-progress-control:hover .vjs-play-progress:before {
          display: block !important;
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
          height: 12px;
          bottom: 4px;
        }

        .video-js .vjs-remaining-time,
        .video-js .vjs-volume-panel,
        .video-js .vjs-play-control {
          display: none;
        }
        
        .video-js .vjs-big-play-button {
          display: none !important;
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
      className='video-js vjs-theme-fantasy'
      data-setup='{"inactivityTimeout": 0}'
      poster={poster}
      onTimeUpdate={onTimeUpdate}
      webkit-playsinline='true'
      x-webkit-airplay='allow'
      style={{
        height: '100%',
        aspectRatio: aspectRatio === ('16/9' as AspectRatio) ? 16 / 9 : 9 / 16,
        width: '100%',
        objectFit:
          aspectRatio === ('16/9' as AspectRatio) ? 'cover' : 'contain',
      }}
    />
  );
};
