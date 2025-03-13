'use client';

import useVideoPlayer from '@/store/videoPlayer';
import React from 'react';
import Player from 'video.js/dist/types/player';

interface VideoPlayerStateProps {
  player: Player | null;
  videoId: string;
  inView: boolean;
  username: string;
  postId: string;
}

export const useVideoPlayerState = ({
  player,
  videoId,
  inView,
}: VideoPlayerStateProps) => {
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
        player?.pause();
        if (currentlyPlaying === videoId) {
          setCurrentlyPlaying(null);
        }
      } else {
        if (!currentlyPlaying || currentlyPlaying === videoId) {
          setCurrentlyPlaying(videoId);
          player?.play()?.catch(() => {});
        } else {
          player?.pause();
        }
      }
    };

    const handlePlay = () => {
      if (currentlyPlaying && currentlyPlaying !== videoId) {
        player?.pause();
      } else {
        setCurrentlyPlaying(videoId);
      }
    };

    handlePlaybackState();
    document.addEventListener('visibilitychange', handlePlaybackState);
    player?.on('play', handlePlay);

    return () => {
      document.removeEventListener('visibilitychange', handlePlaybackState);
      player?.off('play', handlePlay);
    };
  }, [player, inView, videoId]);

  React.useEffect(() => {
    if (player && timestamps[videoId]) {
      player.currentTime(timestamps[videoId]);
    }
  }, [player]);

  React.useEffect(() => {
    if (!player) return;

    const handleVolumeChange = () => {
      if (player.muted() !== isMuted) {
        setIsMuted(player.muted() as boolean);
      }
    };

    player.muted(isMuted);
    player.on('volumechange', handleVolumeChange);

    return () => {
      player.off('volumechange', handleVolumeChange);
    };
  }, [player, isMuted, setIsMuted]);

  // React.useEffect(() => {
  //   if (!player) return;

  //   let touchStartY = 0;
  //   let touchEndY = 0;
  //   const SCROLL_THRESHOLD = 10;

  //   const handleTouchStart = (e: TouchEvent) => {
  //     touchStartY = e.touches[0].clientY;
  //   };

  //   const handleTouchEnd = (e: TouchEvent) => {
  //     touchEndY = e.changedTouches[0].clientY;

  //     const target = e.target as HTMLElement;
  //     const isControlElement =
  //       target.closest('.vjs-control-bar') ||
  //       target.closest('.vjs-play-control') ||
  //       target.closest('.vjs-big-play-button');

  //     const verticalMovement = Math.abs(touchEndY - touchStartY);

  //     if (!isControlElement && verticalMovement < SCROLL_THRESHOLD) {
  //       if (pathname === '/') {
  //         router.push(`/${username}/post/${postId}`);
  //       } else if (player.paused()) {
  //         player.play();
  //       } else {
  //         player.pause();
  //       }
  //     }
  //   };

  //   player.on('touchstart', handleTouchStart);
  //   player.on('touchend', handleTouchEnd);

  //   return () => {
  //     player.off('touchstart');
  //     player.off('touchend');
  //   };
  // }, [player, videoId]);

  return {
    isMuted,
    setTimestamp,
  };
};
