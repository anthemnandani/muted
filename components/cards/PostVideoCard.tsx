'use client';

import { useVideoPlayerState } from '@/hooks/useVideoPlayerState';
import { PostVideoCardProps } from '@/lib/types';
import React from 'react';
import Player from 'video.js/dist/types/player';
import { VideoContainer } from '../shared/VideoContainer';
import { VideoPlayer } from '../shared/VideoPlayer';

const PostVideoCard: React.FC<PostVideoCardProps> = ({
  video,
  aspectRatio,
  postId,
  poster,
  author,
  createdAt,
  text,
  hideLikes,
}) => {
  const [player, setPlayer] = React.useState<Player | null>(null);
  const [inView, setInView] = React.useState(false);

  const videoId = React.useMemo(
    () => `${author?.username}-${postId}`,
    [author?.username, postId]
  );

  const { isMuted, setTimestamp } = useVideoPlayerState({
    player,
    videoId,
    inView,
    username: author.username!,
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
        volumePanel: false,
        progressControl: {
          seekBar: true,
        },
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
    <VideoContainer
      onInViewChange={setInView}
      player={player}
      author={author}
      createdAt={createdAt}
      id={postId}
      text={text}
      hideLikes={hideLikes}
    >
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

export default PostVideoCard;
