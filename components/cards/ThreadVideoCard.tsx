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
  poster: string;
}

const ThreadVideoCard: React.FC<ThreadVideoCardProps> = ({
  video,
  aspectRatio,
  originalDimensions,
  username,
  postId,
  poster,
}) => {
  const [player, setPlayer] = React.useState<Player | null>(null);
  const [inView, setInView] = React.useState(false);

  const videoId = React.useMemo(
    () => `${username}-${postId}`,
    [username, postId]
  );

  const { isMuted, setTimestamp } = useVideoPlayerState({
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
      sources: [{ src: video, type: 'application/x-mpegURL' }],
      html5: {
        vhs: {
          withCredentials: false,
        },
        nativeTextTracks: false,
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
    }),
    [video, aspectRatio, isMuted]
  );

  const { videoStyle } = useVideoStyles(aspectRatio, originalDimensions);

  const handleTimeUpdate = React.useCallback(() => {
    if (player && inView) {
      setTimestamp(videoId, player.currentTime() as number);
    }
  }, [videoId, setTimestamp, inView]);

  const handleTouchStart = (e: React.TouchEvent<HTMLVideoElement>) => {
    if (e.currentTarget.classList.contains('vjs-playing')) {
      player?.pause();
    } else {
      player?.play();
    }
  };

  return (
    <VideoContainer onInViewChange={setInView}>
      <VideoPlayer
        poster={poster}
        options={playerOptions}
        onPlayerReady={setPlayer}
        onTouchStart={handleTouchStart}
        onTimeUpdate={handleTimeUpdate}
        videoStyle={videoStyle}
      />
    </VideoContainer>
  );
};

export default ThreadVideoCard;
