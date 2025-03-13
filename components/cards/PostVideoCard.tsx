'use client';

import { PostVideoCardProps } from '@/lib/types';
import useVideoPlayer from '@/store/videoPlayer';
import React from 'react';
import Player from 'video.js/dist/types/player';
import { VideoContainer } from '../shared/VideoContainer';
import { VideoPlayer } from '../shared/VideoPlayer';

const PostVideoCard: React.FC<PostVideoCardProps> = ({
  video,
  postId,
  poster,
  author,
  createdAt,
  text,
  hideLikes,
  pinned,
}) => {
  const [player, setPlayer] = React.useState<Player | null>(null);
  const [inView, setInView] = React.useState(false);
  const {
    currentlyPlaying,
    setCurrentlyPlaying,
    isMuted,
    setIsMuted,
    timestamps,
    setTimestamp,
  } = useVideoPlayer();

  const isSafari = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }, []);

  const playerOptions = React.useMemo(
    () => ({
      controls: true,
      loop: true,
      muted: true,
      playsinline: true,
      preload: 'metadata',
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
          overrideNative: !isSafari,
          withCredentials: false,
        },
        nativeTextTracks: isSafari,
        nativeAudioTracks: isSafari,
        nativeVideoTracks: isSafari,
      },
    }),
    [video, isSafari]
  );

  React.useEffect(() => {
    if (!player) return;

    if (inView) {
      setCurrentlyPlaying(postId);
      player.play();
    } else if (currentlyPlaying === postId) {
      player.pause();
    }
  }, [inView, player, postId, currentlyPlaying]);

  React.useEffect(() => {
    if (!player) return;

    if (currentlyPlaying !== postId && player.paused() === false) {
      player.pause();
    }
  }, [currentlyPlaying, player, postId]);

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

  React.useEffect(() => {
    if (player && timestamps[postId]) {
      player.currentTime(timestamps[postId]);
    }
  }, [player]);

  const handleTimeUpdate = React.useCallback(() => {
    if (player && inView) {
      setTimestamp(postId, player.currentTime() as number);
    }
  }, [postId, player, inView, setTimestamp]);

  return (
    <VideoContainer
      player={player}
      author={author}
      createdAt={createdAt}
      setInView={setInView}
      id={postId}
      text={text}
      hideLikes={hideLikes}
      pinned={pinned}
    >
      <VideoPlayer
        poster={poster}
        options={playerOptions}
        onPlayerReady={(p) => {
          setPlayer(p);
        }}
        onTimeUpdate={handleTimeUpdate}
      />
    </VideoContainer>
  );
};

export default PostVideoCard;
