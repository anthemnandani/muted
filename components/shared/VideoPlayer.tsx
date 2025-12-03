'use client';

import { type MuxPlayerRef, VideoPlayerProps } from '@/lib/types';
import { getVideoThumbnailUrl } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
import { useEffect, useMemo, useRef } from 'react';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  playbackId,
  onPlayerReady,
  status,
  onTimeUpdate,
  aspectRatio,
  isMuted,
  startTime,
  onVolumeChange,
  videoToken,
  thumbnailToken,
}) => {
  const playerRef = useRef<MuxPlayerRef>(null);

  useEffect(() => {
    if (playerRef.current) {
      // @ts-ignore - Generic ref handling
      onPlayerReady?.(playerRef.current);
    }
  }, [onPlayerReady]);

  const securePoster = useMemo(() => {
    if (status === 'encoded' && playbackId && thumbnailToken) {
      return getVideoThumbnailUrl(playbackId, thumbnailToken);
    }
    return undefined;
  }, [playbackId, thumbnailToken, status]);

  return (
    <MuxPlayer
      ref={playerRef}
      playbackId={status === 'encoded' ? playbackId : undefined}
      src={status === 'processing' ? playbackId : undefined}
      tokens={{
        playback: videoToken,
        thumbnail: thumbnailToken,
      }}
      poster={securePoster}
      muted={isMuted}
      startTime={startTime}
      loop
      preload='auto'
      streamType='on-demand'
      onTimeUpdate={onTimeUpdate}
      accentColor='#bf1313'
      onVolumeChange={(e) => {
        const target = e.target as HTMLVideoElement;
        onVolumeChange?.(target.muted);
      }}
      style={{
        height: '100%',
        width: '100%',
        aspectRatio: aspectRatio === '16:9' ? 16 / 9 : 9 / 16,
        '--media-object-fit': aspectRatio === '16:9' ? 'cover' : 'contain',
        '--fullscreen-button': 'none',
        '--volume-range': 'none',
        '--mute-button': 'none',
        '--cast-button': 'none',
        '--airplay-button': 'none',
        '--playback-rate-button': 'none',
        '--rendition-menu-button': 'none',
        '--pip-button': 'none',
        '--seek-backward-button': 'none',
        '--seek-forward-button': 'none',
      }}
    />
  );
};
