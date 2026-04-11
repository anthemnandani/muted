'use client';

import { useVideoViewTracker } from '@/hooks/useVideoViewTracker';
import { MuxPlayerRef, PostVideoCardProps } from '@/lib/types';
import useVideoPlayer from '@/store/videoPlayer';
import { useCallback, useEffect, useRef, useState } from 'react';
import VideoContainer from '../shared/VideoContainer';
import VideoPlayer from '../shared/VideoPlayer';
import { ViewSource } from '@/generated/prisma/enums';

const PostVideoCard: React.FC<PostVideoCardProps> = ({
  playbackId,
  postId,
  videoToken,
  thumbnailToken,
  aspectRatio,
  showControls,
  encodingStatus,
  onPlayerRegister,
  originalDimensions,
  isModal,
  isAdminPanel,
  source,
}) => {
  const [inView, setInView] = useState(false);
  const [player, setPlayer] = useState<MuxPlayerRef | null>(null);

  const { recordPlayback, flush } = useVideoViewTracker({
    postId,
    source,
    enabled: !isAdminPanel && (!isModal || source === ViewSource.POST_DETAIL),
  });

  const lastTimeRef = useRef<number>(0);

  const [stableTokens, setStableTokens] = useState({
    videoToken,
    thumbnailToken,
  });

  useEffect(() => {
    if (onPlayerRegister) {
      onPlayerRegister(player);
    }
  }, [player, onPlayerRegister]);

  useEffect(() => {
    setStableTokens({ videoToken, thumbnailToken });
  }, [playbackId]);

  const {
    currentlyPlaying,
    setCurrentlyPlaying,
    isMuted,
    setIsMuted,
    timestamps,
    setTimestamp,
  } = useVideoPlayer();

  useEffect(() => {
    if (!player) return;

    if (inView) {
      setCurrentlyPlaying(postId);
      player.play().catch(() => {});
    } else if (currentlyPlaying === postId) {
      player.pause();
    }
  }, [inView, player, postId, currentlyPlaying, setCurrentlyPlaying]);

  useEffect(() => {
    if (!player) return;

    if (currentlyPlaying !== postId && !player.paused) {
      player.pause();
    }
  }, [currentlyPlaying, player, postId]);

  useEffect(() => {
    if (!player) return;

    const handleVisibilityChange = () => {
      if (document.hidden && !player.paused) {
        player.pause();
      } else if (!document.hidden && inView && currentlyPlaying === postId) {
        player.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [player, inView, currentlyPlaying, postId]);

  const handleTimeUpdate = useCallback(() => {
    if (player && inView && !isModal) {
      setTimestamp(postId, player.currentTime);
      const current = player.currentTime ?? 0;
      const delta = current - lastTimeRef.current;
      if (delta > 0 && delta < 2) {
        recordPlayback(delta);
        lastTimeRef.current = current;
      }
    }
  }, [postId, player, inView, setTimestamp, isModal, recordPlayback]);

  const handleVolumeSync = useCallback(
    (mutedState: boolean) => {
      if (mutedState !== isMuted) {
        setIsMuted(mutedState);
      }
    },
    [isMuted, setIsMuted],
  );

  useEffect(() => {
    if (!inView) {
      flush();
      lastTimeRef.current = 0;
    }
  }, [inView]);

  return (
    <VideoContainer
      player={player}
      setInView={setInView}
      showControls={showControls}
      isModal={isModal}
    >
      <VideoPlayer
        playbackId={playbackId}
        videoToken={stableTokens.videoToken}
        thumbnailToken={stableTokens.thumbnailToken}
        isMuted={isMuted}
        inView={inView}
        status={encodingStatus!}
        startTime={timestamps[postId] || 0}
        // @ts-ignore
        onPlayerReady={setPlayer}
        onTimeUpdate={handleTimeUpdate}
        onVolumeChange={handleVolumeSync}
        aspectRatio={aspectRatio}
        originalDimensions={originalDimensions}
        isModal={isModal}
      />
    </VideoContainer>
  );
};

export default PostVideoCard;
