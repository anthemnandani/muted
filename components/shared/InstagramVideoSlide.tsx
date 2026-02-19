'use client';

import type { MuxPlayerRef } from '@/lib/types';
import { VideoSlideProps } from '@/lib/types';
import { getVideoThumbnailUrl } from '@/lib/utils';
import useVideoPlayer from '@/store/videoPlayer';
import MuxPlayer from '@mux/mux-player-react';
import { Volume2, VolumeX } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import { useInView } from 'react-intersection-observer';

const InstagramVideoSlide: React.FC<VideoSlideProps> = ({
  playbackId,
  videoToken,
  thumbnailToken,
  postId,
  isActive,
}) => {
  const playerRef = useRef<MuxPlayerRef>(null);
  const { ref, inView } = useInView({ threshold: 0.7, triggerOnce: false });

  const { currentlyPlaying, setCurrentlyPlaying, isMuted, setIsMuted } =
    useVideoPlayer();

  const securePoster = useMemo(() => {
    if (playbackId && thumbnailToken) {
      return getVideoThumbnailUrl(playbackId, thumbnailToken);
    }
    return undefined;
  }, [playbackId, thumbnailToken]);

  const tokens = useMemo(
    () => ({
      playback: videoToken!,
      thumbnail: thumbnailToken!,
    }),
    [videoToken, thumbnailToken],
  );

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (inView && isActive) {
      setCurrentlyPlaying(postId);
      player.play().catch(() => {});
    } else {
      player.pause();
    }
  }, [inView, isActive, postId, setCurrentlyPlaying]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (currentlyPlaying !== postId && !player.paused) player.pause();
  }, [currentlyPlaying, postId]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const handler = () => {
      if (document.hidden && !player.paused) player.pause();
      else if (
        !document.hidden &&
        inView &&
        isActive &&
        currentlyPlaying === postId
      )
        player.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [inView, isActive, currentlyPlaying, postId]);

  return (
    <div ref={ref} className='relative w-full h-full'>
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        tokens={tokens}
        poster={securePoster}
        playsInline
        streamType='on-demand'
        muted={isMuted}
        loop
        preload='metadata'
        style={{
          width: '100%',
          height: '100%',
          '--media-object-fit': 'cover',
          '--play-button': 'none',
          '--live-button': 'none',
          '--seek-backward-button': 'none',
          '--seek-forward-button': 'none',
          '--mute-button': 'none',
          '--captions-button': 'none',
          '--airplay-button': 'none',
          '--pip-button': 'none',
          '--fullscreen-button': 'none',
          '--cast-button': 'none',
          '--playback-rate-button': 'none',
          '--volume-range': 'none',
          '--time-range': 'none',
          '--time-display': 'none',
          '--duration-display': 'none',
          '--rendition-menu-button': 'none',
        }}
      />
      <button
        className='absolute bottom-3 right-3 z-20 rounded-full bg-black/75 p-1.5 backdrop-blur-sm focus:outline-none focus-visible:outline-none'
        onClick={(e) => {
          e.stopPropagation();
          setIsMuted(!isMuted);
        }}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className='size-4 text-white' />
        ) : (
          <Volume2 className='size-4 text-white' />
        )}
      </button>
    </div>
  );
};

export default InstagramVideoSlide;
