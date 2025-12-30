'use client';

import { type MuxPlayerRef, VideoPlayerProps } from '@/lib/types';
import { cn, getTargetRatio, getVideoThumbnailUrl } from '@/lib/utils';
import MuxPlayer from '@mux/mux-player-react';
import { Play } from 'lucide-react';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

const VideoPlayer: React.FC<VideoPlayerProps> = ({
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
  originalDimensions,
  isCarousel,
  isModal = false,
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

  const numericRatio = getTargetRatio(aspectRatio, originalDimensions);
  const isLandscape = numericRatio > 1;
  const isPortrait = numericRatio <= 1;

  const shouldUseAutoHeight = isModal && isLandscape;
  const shouldUseAutoWidth = isModal && isPortrait;

  return (
    <Fragment>
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
        preload='auto'
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
          width: shouldUseAutoWidth ? 'auto' : '100%',
          height:
            (isCarousel && !isModal && !isPortrait) || shouldUseAutoHeight
              ? 'auto'
              : '100%',
          aspectRatio: numericRatio,
          '--media-object-fit': 'cover',
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
    </Fragment>
  );
};

export default VideoPlayer;
