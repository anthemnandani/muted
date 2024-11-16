'use client';
import { useVideoPlayerState } from '@/hooks/useVideoPlayerState';
import useVideoStyles from '@/hooks/useVideoStyles';
import { usePathname, useRouter } from 'next/navigation';
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
  const pathname = usePathname();
  const router = useRouter();
  const [player, setPlayer] = React.useState<Player | null>(null);
  const [inView, setInView] = React.useState(false);

  const videoId = React.useMemo(
    () => `${username}-${postId}`,
    [username, postId]
  );

  const { isMuted, setIsMuted, setTimestamp } = useVideoPlayerState(
    player,
    videoId,
    inView
  );

  const playerOptions = React.useMemo(
    () => ({
      controls: true,
      loop: true,
      muted: isMuted,
      fluid: aspectRatio !== '9:16',
      playsinline: true,
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

  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const target = e.target as HTMLElement;

    if (
      target.closest('.vjs-control-bar') ||
      target.closest('.vjs-big-play-button') ||
      target.closest('.vjs-poster') ||
      target.closest('.vjs-loading-spinner')
    ) {
      e.stopPropagation();
      return;
    }

    if (pathname === '/') {
      router.push(`/${username}/post/${postId}`);
    }
  };

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

  return (
    <VideoContainer
      aspectRatio={aspectRatio}
      originalDimensions={originalDimensions}
      onInViewChange={setInView}
      onClick={handleVideoClick}
    >
      <VideoPlayer
        options={playerOptions}
        onPlayerReady={setPlayer}
        onTimeUpdate={handleTimeUpdate}
        onVolumeChange={handleMuteChange}
        videoStyle={videoStyle}
      />
    </VideoContainer>
  );
};

export default ThreadVideoCard;
