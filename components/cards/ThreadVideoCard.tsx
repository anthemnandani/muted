'use client';

import { useVideoPlayerState } from '@/hooks/useVideoPlayerState';
import React from 'react';
import Player from 'video.js/dist/types/player';
import { VideoContainer } from '../shared/VideoContainer';
import { VideoPlayer } from '../shared/VideoPlayer';

interface ThreadVideoCardProps {
  video: string;
  aspectRatio?: string;
  username: string;
  postId: string;
  poster: string;
}

const ThreadVideoCard: React.FC<ThreadVideoCardProps> = ({
  video,
  aspectRatio,
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

  React.useEffect(() => {
    if (player && inView) {
      player.play()?.catch((error) => {
        console.log('Autoplay prevented:', error);
      });
    } else if (player && !inView) {
      player?.pause();
    }
  }, [player, inView]);

  const playerOptions = React.useMemo(
    () => ({
      controls: true,
      loop: true,
      muted: isMuted,
      playsinline: true,
      preload: 'auto',
      autoplay: false,
      disablePictureInPicture: true,
      userActions: { hotkeys: true, doubleClick: false },
      controlBar: {
        pictureInPictureToggle: false,
        fullscreenToggle: false,
        volumePanel: { inline: true },
        children: ['progressControl'],
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
    <VideoContainer onInViewChange={setInView} player={player}>
      <VideoPlayer
        poster={poster}
        options={playerOptions}
        onPlayerReady={(p) => {
          setPlayer(p);
          if (inView) {
            p.play()?.catch((error) => {
              console.log('Initial autoplay prevented:', error);
            });
          }
        }}
        onTouchStart={handleTouchStart}
        onTimeUpdate={handleTimeUpdate}
      />
    </VideoContainer>
  );
};

export default ThreadVideoCard;
