'use client';

import { type MuxPlayerRef, VideoPlayerProps } from '@/lib/types';
import { cn, getTargetRatio, getVideoThumbnailUrl } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
import { Play } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  playbackId,
  onPlayerReady,
  status,
  onTimeUpdate,
  isMuted,
  inView,
  startTime,
  onVolumeChange,
  videoToken,
  thumbnailToken,
  aspectRatio,
}) => {
  const playerRef = useRef<MuxPlayerRef>(null);
  const [isPaused, setIsPaused] = useState(false);

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

  const tokens = useMemo(
    () => ({
      playback: videoToken,
      thumbnail: thumbnailToken,
    }),
    [videoToken, thumbnailToken]
  );

  const numericRatio = getTargetRatio(aspectRatio);

  const objectFit = numericRatio >= 1 ? 'cover' : 'contain';

  return (
    <div className='relative h-full w-full group'>
      <MuxPlayer
        ref={playerRef}
        playbackId={status === 'encoded' ? playbackId : undefined}
        src={status === 'processing' ? playbackId : undefined}
        tokens={tokens}
        poster={securePoster}
        muted={isMuted}
        startTime={startTime}
        playsInline
        loop
        preload='metadata'
        streamType='on-demand'
        onTimeUpdate={onTimeUpdate}
        onPlay={() => setIsPaused(false)}
        onPause={() => {
          if (inView) setIsPaused(true);
        }}
        accentColor='#bf1313'
        onVolumeChange={(e) => {
          const target = e.target as HTMLVideoElement;
          onVolumeChange?.(target.muted);
        }}
        style={{
          height: '100%',
          width: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          '--media-object-fit': objectFit,
          aspectRatio: numericRatio < 1 ? `${numericRatio}` : undefined,
          '--play-button': 'none',
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
          '--duration-display': 'none',
          '--time-display': 'none',
        }}
      />
      {isPaused && inView && (
        <div className='absolute inset-0 flex-center bg-black/10 transition-all duration-200 pointer-events-none'>
          <button
            onClick={() => playerRef.current?.play()}
            className={cn(
              'rounded-full bg-black/40 p-4 text-white hover:bg-black/60',
              'hover:scale-110 transition-all pointer-events-auto backdrop-blur-sm'
            )}
          >
            <Play className='size-8 fill-current' />
          </button>
        </div>
      )}
    </div>
  );
};
