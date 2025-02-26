'use client';

import type { PostMedia } from '@/lib/types';
import { useProfileVideoPlayer } from '@/store/profileVideoPlayer';
import { Play } from 'lucide-react';
import React from 'react';
import Player from 'video.js/dist/types/player';
import { ProfileVideoPlayer } from './ProfileVideoPlayer';
import Image from 'next/image';

const UserPostCard = ({
  media,
  postId,
}: {
  media: PostMedia[];
  postId: string;
}) => {
  const [player, setPlayer] = React.useState<Player | null>(null);
  const { playingVideoId, setPlayingVideoId } = useProfileVideoPlayer();
  const videoId = postId;

  const mediaItem = media?.[0];
  if (!mediaItem) return null;

  const isVideo = mediaItem.fileType === 'video';
  const fileUrl = mediaItem.fileUrl;

  const playerOptions = React.useMemo(
    () => ({
      controls: false,
      loop: true,
      muted: true,
      playsinline: true,
      preload: 'auto',
      autoplay: false,
      sources: [
        {
          src: isVideo ? fileUrl : '',
          type: 'application/x-mpegURL',
        },
      ],
      html5: {
        vhs: { withCredentials: false },
        nativeTextTracks: false,
        nativeAudioTracks: false,
        nativeVideoTracks: false,
      },
    }),
    [mediaItem.fileUrl]
  );

  React.useEffect(() => {
    if (player && playingVideoId === videoId) {
      player.play()?.catch((error) => {
        console.log('Hover play prevented:', error);
      });
    } else if (player && playingVideoId !== videoId) {
      player.pause();
    }
  }, [player, playingVideoId, videoId]);

  const handleMouseEnter = () => {
    if (!isVideo) return;
    setTimeout(() => {
      setPlayingVideoId(videoId);
    }, 1000);
  };

  return (
    <div
      className='relative max-w-[320px] aspect-[3/4] rounded-[4px] overflow-hidden flex-center bg-no-repeat bg-center cursor-pointer'
      onMouseEnter={handleMouseEnter}
    >
      {isVideo ? (
        <React.Fragment>
          <ProfileVideoPlayer
            poster={mediaItem.thumbnailUrl}
            options={playerOptions}
            onPlayerReady={(p) => {
              setPlayer(p);
            }}
          />

          <div className='absolute bottom-3 left-3 text-white/90 z-10'>
            <Play className='size-[18px]' />
          </div>
        </React.Fragment>
      ) : (
        <Image
          src={fileUrl}
          loading='lazy'
          fill
          alt='Post Image'
          className='object-cover'
        />
      )}
    </div>
  );
};

export default UserPostCard;
