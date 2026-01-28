'use client';

import { ThreadVideoCardProps, type MuxPlayerRef } from '@/lib/types';
import { cn, getTargetRatio, getVideoThumbnailUrl } from '@/lib/utils';
import useVideoPlayer from '@/store/videoPlayer';
import MuxPlayer from '@mux/mux-player-react';
import { Play, Volume2, VolumeX } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const ThreadVideoCard: React.FC<ThreadVideoCardProps> = ({
  playbackId,
  encodingStatus,
  aspectRatio,
  threadId,
  videoToken,
  thumbnailToken,
  originalDimensions,
  className,
}) => {
  const playerRef = useRef<MuxPlayerRef>(null);
  const [isPaused, setIsPaused] = useState(true);

  const { ref, inView } = useInView({
    threshold: 0.7,
    triggerOnce: false,
  });

  const { currentlyPlaying, setCurrentlyPlaying, isMuted, setIsMuted } =
    useVideoPlayer();

  useEffect(() => {
    if (inView && encodingStatus === 'ENCODED') {
      setCurrentlyPlaying(threadId);
    }
  }, [inView, threadId, setCurrentlyPlaying, encodingStatus]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (currentlyPlaying === threadId && inView) {
      player.play().catch(() => {});
      setIsPaused(false);
    } else {
      player.pause();
      setIsPaused(true);
    }
  }, [currentlyPlaying, threadId, inView]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = useCallback(
    (e: Event) => {
      const target = e.target as HTMLVideoElement;
      setIsMuted(target.muted);
    },
    [setIsMuted],
  );

  const securePoster = useMemo(() => {
    if (encodingStatus === 'ENCODED' && playbackId && thumbnailToken) {
      return getVideoThumbnailUrl(playbackId, thumbnailToken);
    }
    return undefined;
  }, [playbackId, thumbnailToken, encodingStatus]);

  const tokens = useMemo(
    () => ({
      playback: videoToken,
      thumbnail: thumbnailToken,
    }),
    [videoToken, thumbnailToken],
  );

  const numericRatio = getTargetRatio(aspectRatio, originalDimensions);

  return (
    <div className={cn('mt-2.5 mb-2 block px-2 md:px-4', className)}>
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-md border border-border/50',
          'w-auto max-w-[85%] max-h-[360px]',
        )}
        style={{
          aspectRatio: numericRatio,
        }}
        onClick={() => {
          setCurrentlyPlaying(threadId);
          if (playerRef.current?.paused) {
            playerRef.current?.play();
          } else {
            playerRef.current?.pause();
          }
        }}
      >
        <MuxPlayer
          ref={playerRef}
          playbackId={encodingStatus === 'ENCODED' ? playbackId : undefined}
          src={encodingStatus === 'PROCESSING' ? playbackId : undefined}
          streamType='on-demand'
          muted={isMuted}
          tokens={tokens}
          poster={securePoster}
          loop
          playsInline
          preload='auto'
          onVolumeChange={handleVolumeChange}
          onPlay={() => setIsPaused(false)}
          onPause={() => setIsPaused(true)}
          style={{
            height: '100%',
            width: '100%',
            objectFit: 'cover',
            '--controls': 'none',
          }}
          accentColor='#bf1313'
        />

        <div
          className='absolute bottom-3 right-3 z-20 cursor-pointer p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors backdrop-blur-sm'
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className='size-4 stroke-[2.5px]' />
          ) : (
            <Volume2 className='size-4 stroke-[2.5px]' />
          )}
        </div>

        {isPaused && inView && encodingStatus === 'ENCODED' && (
          <div className='absolute inset-0 flex-center bg-black/10 transition-all duration-200 pointer-events-none'>
            <div
              className={cn(
                'bg-black/40 hover:bg-black/60 backdrop-blur-[2px] rounded-full p-3',
                'pointer-events-auto cursor-pointer transition-transform hover:scale-110',
              )}
              onClick={() => {
                setCurrentlyPlaying(threadId);
                playerRef.current?.play();
              }}
            >
              <Play className='size-5 fill-current' />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadVideoCard;
