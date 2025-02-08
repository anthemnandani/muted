'use client';

import { AuthorInfoProps } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import useVideoPlayer from '@/store/videoPlayer';
import Link from 'next/link';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import Player from 'video.js/dist/types/player';
import ThreadActionMenu from '../menus/ThreadActionMenu';
import Username from '../user/Username';
import ThreadText from './ThreadText';
import VolumeControls from './VolumeControls';

interface VideoContainerProps {
  children: React.ReactNode;
  onInViewChange: (inView: boolean) => void;
  player: Player | null;
  author: AuthorInfoProps;
  createdAt: Date;
  id: string;
  text: string | null;
  hideLikes: boolean;
}

export const VideoContainer: React.FC<VideoContainerProps> = ({
  children,
  onInViewChange,
  player,
  author,
  createdAt,
  id,
  text,
  hideLikes,
}) => {
  const [showControls, setShowControls] = React.useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);

  const { isMuted, setIsMuted } = useVideoPlayer();
  const [volume, setVolume] = React.useState(1);
  const controlsTimeoutRef = React.useRef<NodeJS.Timeout>();
  const { ref, inView } = useInView({
    threshold: 0.6,
    triggerOnce: false,
  });

  React.useEffect(() => {
    onInViewChange(inView);
  }, [inView, onInViewChange]);

  const handleVolumeChange = (newVolume: number) => {
    if (!player) return;

    setVolume(newVolume);
    player.volume(newVolume);

    if (newVolume === 0) {
      player.muted(true);
      setIsMuted(true);
    } else if (isMuted) {
      player.muted(false);
      setIsMuted(false);
    }
  };

  const showControlsTemporarily = () => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
      setShowVolumeSlider(false);
    }, 3000);
  };

  React.useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (player) {
      setVolume(player.volume() as number);
    }
  }, [player]);

  return (
    <div
      ref={ref}
      className='relative h-full w-full overflow-hidden flex-grow cursor-pointer bg-black rounded-2xl'
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        setShowControls(false);
        setShowVolumeSlider(false);
      }}
      onTouchStart={showControlsTemporarily}
      onTouchMove={() => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      }}
    >
      {children}
      <div className='absolute top-2 w-full z-50'>
        <div className='flex-between px-4'>
          <VolumeControls player={player} showControls={showControls} />
          <ThreadActionMenu
            author={author}
            postId={id}
            createdAt={createdAt}
            currentText={text ?? ''}
            hideLikes={hideLikes}
            showControls={showControls}
          />
        </div>
      </div>
      <div className='absolute bottom-6 left-0 right-0 px-4'>
        <div className='flex items-center gap-2 mb-2'>
          <div className='max-w-[40%] overflow-hidden'>
            <Username author={author} className='truncate' />
          </div>
          <div className='hidden size-1 rounded-full bg-white sm:block'></div>
          <Link
            href={`/${author.username}/post/${id}`}
            className='text-white text-sm truncate'
          >
            {formatTimeAgo(createdAt)}
          </Link>
        </div>
        {text && <ThreadText text={text} />}
      </div>
    </div>
  );
};
