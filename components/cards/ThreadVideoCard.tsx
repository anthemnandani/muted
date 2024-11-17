'use client';
import { useVideoPlayerState } from '@/hooks/useVideoPlayerState';
import useVideoStyles from '@/hooks/useVideoStyles';
import React from 'react';
import Player from 'video.js/dist/types/player';
import { VideoContainer } from '../shared/VideoContainer';
import { VideoPlayer } from '../shared/VideoPlayer';

interface ThreadVideoCardProps {
  video: string;
  aspectRatio?: string;
  originalDimensions?: { width: number; height: number };
  username: string;
  postId: string;
}

const ThreadVideoCard: React.FC<ThreadVideoCardProps> = ({
  video,
  aspectRatio,
  originalDimensions,
  username,
  postId,
}) => {
  const [player, setPlayer] = React.useState<Player | null>(null);
  const [inView, setInView] = React.useState(false);

  const videoId = React.useMemo(
    () => `${username}-${postId}`,
    [username, postId]
  );

  const { isMuted, setIsMuted, setTimestamp } = useVideoPlayerState({
    player,
    videoId,
    inView,
    username,
    postId,
  });

  const playerOptions = React.useMemo(
    () => ({
      controls: true,
      loop: true,
      muted: isMuted,
      fluid: aspectRatio !== '9:16',
      playsinline: true,
      preload: 'auto',
      disablePictureInPicture: true,
      userActions: { hotkeys: true, doubleClick: false },
      controlBar: {
        pictureInPictureToggle: false,
        fullscreenToggle: false,
        volumePanel: { inline: true },
        progressControl: { seekBar: true },
        children: [
          'playToggle',
          'progressControl',
          'volumePanel',
          'currentTimeDisplay',
          'timeDivider',
          'durationDisplay',
        ],
      },
      sources: [{ src: video, type: 'video/mp4' }],
    }),
    [video, aspectRatio, isMuted]
  );

  const { videoStyle } = useVideoStyles(aspectRatio, originalDimensions);

  const handleTimeUpdate = React.useCallback(() => {
    if (player && inView) {
      setTimestamp(videoId, player.currentTime() as number);
    }
  }, [videoId, setTimestamp, inView]);

  const handleMuteChange = React.useCallback(() => {
    if (player) {
      setIsMuted(player.muted() as boolean);
    }
  }, [player, setIsMuted]);

  const handleTouchStart = (e: React.TouchEvent<HTMLVideoElement>) => {
    if (e.currentTarget.classList.contains('vjs-playing')) {
      player?.pause();
    } else {
      player?.play();
    }
  };

  return (
    <VideoContainer
      aspectRatio={aspectRatio}
      originalDimensions={originalDimensions}
      onInViewChange={setInView}
    >
      <VideoPlayer
        options={playerOptions}
        onPlayerReady={setPlayer}
        onTimeUpdate={handleTimeUpdate}
        onVolumeChange={handleMuteChange}
        onTouchStart={handleTouchStart}
        videoStyle={videoStyle}
      />
    </VideoContainer>
  );
};

export default ThreadVideoCard;
