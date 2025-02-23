'use client';

import type { PostMedia } from '@/lib/types';
import { Play } from 'lucide-react';
import React from 'react';
import videojs from 'video.js';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';

const UserPostCard = ({ media }: { media: PostMedia[] }) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const playerRef = React.useRef<Player | null>(null);
  const [isHovered, setIsHovered] = React.useState(false);

  const mediaItem = media[0];
  if (!mediaItem || mediaItem.fileType !== 'video') return null;

  React.useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = videojs(videoRef.current, {
      controls: false,
      loop: true,
      muted: true,
      playsinline: true,
      preload: 'auto',
      autoplay: false,
      fluid: true,
      sources: [
        {
          src: mediaItem.fileUrl,
          type: 'application/x-mpegURL',
        },
      ],
      html5: {
        vhs: { withCredentials: false },
        nativeTextTracks: false,
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [mediaItem.fileUrl, mediaItem.thumbnailUrl]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    playerRef.current?.play()?.catch((error) => {
      console.log('Hover play prevented:', error);
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    playerRef.current?.pause();
  };

  return (
    <div
      className='relative max-w-[320px] aspect-[3/4] rounded-[4px] overflow-hidden cursor-pointer group'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        backgroundImage: `url(${mediaItem.thumbnailUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div data-vjs-player>
        <video
          ref={videoRef}
          className='video-js w-full h-full object-cover'
          poster={mediaItem.thumbnailUrl}
        />
      </div>
      {!isHovered && (
        <div className='absolute bottom-2 left-2 text-white/90 z-10'>
          <Play className='size-[18px]' />
        </div>
      )}
    </div>
  );
};

export default UserPostCard;
