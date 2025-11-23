'use client';

import { useSocket } from '@/contexts/SocketContext';
import { AspectRatio, PostVideoCardProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useVideoPlayer from '@/store/videoPlayer';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import Player from 'video.js/dist/types/player';
import { Icons } from '../icons';
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
  videoId,
  encodingStatus: initialStatus,
}) => {
  const [inView, setInView] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [status, setStatus] = useState(initialStatus);
  const [activePoster, setActivePoster] = useState(poster);
  const [imgError, setImgError] = useState(false);
  const { socket } = useSocket();

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
    let interval: NodeJS.Timeout;

    if (status === 'processing' && imgError && activePoster) {
      interval = setInterval(() => {
        setActivePoster(`${poster?.split('?')[0]}?t=${Date.now()}`);
        setImgError(false);
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [status, imgError, activePoster, poster]);

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

  useEffect(() => {
    if (!socket) return;

    if (status !== 'processing') return;

    const handleVideoUpdate = (data: any) => {
      if (data.postId === postId && data.videoId === videoId) {
        setStatus(data.status);
        if (data.status === 'encoded') {
          setActivePoster(`${poster?.split('?')[0]}?success=${Date.now()}`);
          setImgError(false);
        }
      }
    };

    socket.on('VIDEO_STATUS_UPDATE', handleVideoUpdate);

    return () => {
      socket.off('VIDEO_STATUS_UPDATE', handleVideoUpdate);
    };
  }, [socket, postId, videoId, status]);

  if (status === 'processing' || status === 'failed') {
    return (
      <VideoContainer
        id={postId}
        author={author}
        createdAt={createdAt}
        text={text ?? ''}
        reposts={reposts}
        repostedBy={repostedBy}
        mentions={mentions}
        setInView={() => {}}
        showControls={false}
        player={null}
      >
        <div
          className={cn(
            'relative h-full w-full',
            aspectRatio === ('16/9' as AspectRatio)
              ? 'object-cover'
              : 'object-contain',
            aspectRatio === ('16/9' as AspectRatio)
              ? 'aspect-video'
              : 'aspect-[9/16]'
          )}
        >
          {activePoster && (
            <Fragment>
              <img
                alt='Post'
                src={activePoster}
                onError={() => setImgError(true)}
                onLoad={() => setImgError(false)}
                className={cn(
                  'object-cover h-full w-full transition-opacity duration-500',
                  imgError ? 'opacity-0' : 'opacity-100'
                )}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none' />
            </Fragment>
          )}

          <div className='absolute inset-0 flex-col-center z-20'>
            {status === 'processing' ? (
              <Fragment>
                <Icons.spinner className='size-10 animate-spin text-primary-blue mb-2' />
                <p className='text-white text-base font-bold text-center'>
                  Video is processing...
                </p>
              </Fragment>
            ) : (
              <p className='text-primary-red text-base font-bold'>
                Video processing failed
              </p>
            )}
          </div>
        </div>
      </VideoContainer>
    );
  }

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
        poster={activePoster}
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
