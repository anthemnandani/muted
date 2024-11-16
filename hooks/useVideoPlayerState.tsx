'use client';
import useVideoPlayer from '@/store/videoPlayer';
import React from 'react';
import Player from 'video.js/dist/types/player';

export const useVideoPlayerState = (
  player: Player | null,
  videoId: string,
  inView: boolean
) => {
  const {
    currentlyPlaying,
    setCurrentlyPlaying,
    isMuted,
    setIsMuted,
    timestamps,
    setTimestamp,
  } = useVideoPlayer();

  React.useEffect(() => {
    if (!player) return;

    const handlePlaybackState = () => {
      if (document.hidden || !inView) {
        player.pause();
        if (currentlyPlaying === videoId) {
          setCurrentlyPlaying(null);
        }
      } else {
        setCurrentlyPlaying(videoId);
        player.play()?.catch(() => {});
      }
    };

    handlePlaybackState();
    document.addEventListener('visibilitychange', handlePlaybackState);

    return () => {
      document.removeEventListener('visibilitychange', handlePlaybackState);
    };
  }, [player, inView, videoId, currentlyPlaying, setCurrentlyPlaying]);

  React.useEffect(() => {
    if (player && timestamps[videoId]) {
      player.currentTime(timestamps[videoId]);
    }
  }, [player]);

  React.useEffect(() => {
    if (!player) return;
    player.muted(isMuted);
  }, [player, isMuted]);

  return {
    isMuted,
    setIsMuted,
    setTimestamp,
    currentlyPlaying,
  };
};
