'use client';

import { usePathname, useRouter } from 'next/navigation';
import React from 'react';
import videojs from 'video.js';
import useVideoPlayer from '@/store/videoPlayer';
import { useInView } from 'react-intersection-observer';
import Player from 'video.js/dist/types/player';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/fantasy/index.css';

interface ThreadVideoCardProps {
  video: string | undefined;
  aspectRatio?: string;
  originalDimensions?: { width: number; height: number };
  username?: string;
  postId?: string;
}

const ThreadVideoCard: React.FC<ThreadVideoCardProps> = ({
  video,
  aspectRatio,
  originalDimensions,
  username,
  postId,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const playerRef = React.useRef<Player | null>(null);
  const pathname = usePathname();

  const {
    currentlyPlaying,
    setCurrentlyPlaying,
    isMuted,
    setIsMuted,
    timestamps,
    setTimestamp,
  } = useVideoPlayer();

  const videoId = React.useMemo(
    () => `${username}-${postId}`,
    [username, postId]
  );

  const { ref: intersectionRef, inView } = useInView({
    threshold: 0.45,
  });

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
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

  const handleMuteChange = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.target as HTMLVideoElement;
    setIsMuted(video.muted);
  };

  const handleTimeUpdate = React.useCallback(() => {
    if (playerRef.current && inView) {
      setTimestamp(videoId, playerRef.current.currentTime() as number);
    }
  }, [videoId, setTimestamp, inView]);

  const MIN_RATIO = 0.8;
  const MAX_RATIO = 16 / 9;
  let targetRatio = 16 / 9;

  const is916 = aspectRatio === '9:16';

  const router = useRouter();

  const CONTAINER_RATIO = 4 / 5;

  let videoStyle = {};
  let containerStyle = {};

  if (is916) {
    containerStyle = {
      aspectRatio: CONTAINER_RATIO,
    };

    videoStyle = {
      height: '100%',
      aspectRatio: '9/16',
      width: 'auto',
    };
  } else {
    if (!is916) {
      switch (aspectRatio) {
        case '16:9':
          targetRatio = 16 / 9;
          break;
        case '4:5':
          targetRatio = 4 / 5;
          break;
        default:
          if (originalDimensions) {
            const originalRatio =
              originalDimensions.width / originalDimensions.height;
            if (originalRatio < MIN_RATIO && originalRatio !== 9 / 16) {
              targetRatio = 4 / 5;
            } else if (originalRatio > MAX_RATIO) {
              targetRatio = 16 / 9;
            } else {
              targetRatio = originalRatio;
            }
          }
      }
    }

    containerStyle = {
      aspectRatio: targetRatio,
    };

    videoStyle = {
      height: '100%',
      width: '100%',
      objectFit: 'cover',
    };
  }

  React.useEffect(() => {
    const options = {
      controls: true,
      responsive: true,
      fluid: !is916,
      loop: true,
      muted: isMuted,
      playsinline: true,
      disablePictureInPicture: true,
      userActions: { hotkeys: true, doubleClick: false },
      controlBar: {
        pictureInPictureToggle: false,
        fullscreenToggle: false,
        volumePanel: {
          inline: true,
        },
        progressControl: {
          seekBar: true,
        },
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
    };

    if (videoRef.current && !playerRef.current) {
      const player = videojs(videoRef.current, options);

      player.on('dblclick', function (e: React.MouseEvent<HTMLVideoElement>) {
        e.preventDefault();
      });

      playerRef.current = player;
    }
  }, [video, is916]);

  React.useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (inView) {
      if (!currentlyPlaying || currentlyPlaying === videoId) {
        setCurrentlyPlaying(videoId);
        player.play()?.catch(() => {});
      }
    } else {
      player.pause();
      if (currentlyPlaying === videoId) {
        setCurrentlyPlaying(null);
      }
    }
  }, [inView, videoId, setCurrentlyPlaying, currentlyPlaying]);

  React.useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    if (currentlyPlaying && currentlyPlaying !== videoId) {
      player.pause();
    }
  }, [currentlyPlaying, videoId]);

  React.useEffect(() => {
    const player = playerRef.current;
    if (player && timestamps[videoId]) {
      player.currentTime(timestamps[videoId]);
    }
  }, []);

  React.useEffect(() => {
    if (playerRef.current) {
      playerRef.current.muted(isMuted as boolean);
    }
  }, [isMuted]);

  return (
    <div
      ref={intersectionRef}
      className='relative overflow-hidden mt-2.5 mb-2 bg-black flex-center w-full'
      style={containerStyle}
    >
      <video
        data-vjs-player
        ref={videoRef}
        className='video-js vjs-theme-fantasy cursor-pointer'
        data-setup='{}'
        onClick={handleVideoClick}
        onTimeUpdate={handleTimeUpdate}
        onVolumeChange={handleMuteChange}
        style={videoStyle}
      />
    </div>
  );
};

export default ThreadVideoCard;
