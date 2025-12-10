'use client';

import { MuxPlayerRef, PostVideoCardProps } from '@/lib/types';
import useVideoPlayer from '@/store/videoPlayer';
import { useCallback, useEffect, useState } from 'react';
import { VideoContainer } from '../shared/VideoContainer';
import { VideoPlayer } from '../shared/VideoPlayer';

const PostVideoCard: React.FC<PostVideoCardProps> = ({
  playbackId,
  postId,
  videoToken,
  thumbnailToken,
  author,
  createdAt,
  text,
  reposts,
  repostedBy,
  mentions,
  aspectRatio,
  showControls,
  encodingStatus,
}) => {
  const [inView, setInView] = useState(false);
  const [player, setPlayer] = useState<MuxPlayerRef | null>(null);

  const [stableTokens, setStableTokens] = useState({
    videoToken,
    thumbnailToken,
  });

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
    if (player && inView) {
      setTimestamp(postId, player.currentTime);
    }
  }, [postId, player, inView, setTimestamp]);

  const handleVolumeSync = useCallback(
    (mutedState: boolean) => {
      if (mutedState !== isMuted) {
        setIsMuted(mutedState);
      }
    },
    [isMuted, setIsMuted]
  );

  return (
    <VideoContainer
      player={player}
      author={author}
      createdAt={createdAt}
      setInView={setInView}
      id={postId}
      text={text ?? ''}
      reposts={reposts}
      repostedBy={repostedBy}
      mentions={mentions}
      showControls={showControls}
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
      />
    </VideoContainer>
  );
};

export default PostVideoCard;
