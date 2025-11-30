'use client';

import { type MuxPlayerRef, VideoPlayerProps } from '@/lib/types';
import MuxPlayer from '@mux/mux-player-react';
import { useEffect, useRef } from 'react';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  playbackId,
  onPlayerReady,
  poster,
  status,
  onTimeUpdate,
  aspectRatio,
  isMuted,
  startTime,
  onVolumeChange,
}) => {
  const playerRef = useRef<MuxPlayerRef>(null);

  useEffect(() => {
    if (playerRef.current) {
      // @ts-ignore - Generic ref handling
      onPlayerReady?.(playerRef.current);
    }
  }, [onPlayerReady]);

  return (
    <MuxPlayer
      ref={playerRef}
      playbackId={status === 'encoded' ? playbackId : undefined}
      src={status == 'processing' ? playbackId : undefined}
      poster={poster}
      muted={isMuted}
      startTime={startTime}
      loop
      preload='metadata'
      streamType='on-demand'
      onTimeUpdate={onTimeUpdate}
      onVolumeChange={(e) => {
        const target = e.target as HTMLVideoElement;
        onVolumeChange?.(target.muted);
      }}
      style={{
        height: '100%',
        width: '100%',
        aspectRatio: aspectRatio === '16:9' ? 16 / 9 : 9 / 16,
        '--media-object-fit': aspectRatio === '16:9' ? 'cover' : 'contain',
      }}
    />
  );
};
