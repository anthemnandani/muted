'use client';

import { PostVideoCardProps } from '@/lib/types';
import useVideoPlayer from '@/store/videoPlayer';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  reposts,
  repostedBy,
  mentions,
  aspectRatio,
  showControls,
}) => {
  const [inView, setInView] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const {
    currentlyPlaying,
    setCurrentlyPlaying,
    isMuted,
    setIsMuted,
    timestamps,
    setTimestamp,
  } = useVideoPlayer();

  const isSafari = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  }, []);

  const sourceType = useMemo(() => {
    if (isSafari) {
      return 'application/vnd.apple.mpegurl';
    }
    return 'application/x-mpegURL';
  }, [isSafari]);

  const playerOptions = useMemo(
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
      sources: [{ src: video, type: sourceType }],
      html5: {
        vhs: {
          overrideNative: !isSafari,
          withCredentials: false,
        },
        nativeTextTracks: isSafari,
        nativeAudioTracks: isSafari,
        nativeVideoTracks: isSafari,
      },
      hls: {
        debug: false,
        enableLowInitialPlaylist: true,
        manifestLoadingTimeOut: 10000,
      },
    }),
    [video]
  );

  useEffect(() => {
    if (!player) return;

    if (inView) {
      setCurrentlyPlaying(postId);
      player.play();
    } else if (currentlyPlaying === postId) {
      player.pause();
    }
  }, [inView, player, postId, currentlyPlaying]);

  useEffect(() => {
    if (!player) return;

    if (currentlyPlaying !== postId && player.paused() === false) {
      player.pause();
    }
  }, [currentlyPlaying, player, postId]);

  useEffect(() => {
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

  useEffect(() => {
    if (player && timestamps[postId]) {
      player.currentTime(timestamps[postId]);
    }
  }, [player]);

  const handleTimeUpdate = useCallback(() => {
    if (player && inView) {
      setTimestamp(postId, player.currentTime() as number);
    }
  }, [postId, player, inView, setTimestamp]);

  useEffect(() => {
    if (!player) return;

    const handleVisibilityChange = () => {
      if (document.hidden && player.paused() === false) {
        player.pause();
      } else if (!document.hidden && inView && currentlyPlaying === postId) {
        player.play();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [player, inView, currentlyPlaying, postId]);

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
        poster={poster}
        options={playerOptions}
        onPlayerReady={(p) => {
          setPlayer(p);
        }}
        onTimeUpdate={handleTimeUpdate}
        aspectRatio={aspectRatio}
      />
    </VideoContainer>
  );
};

export default PostVideoCard;
