'use client';

import type { UserPostCardProps } from '@/lib/types';
import usePostStore from '@/store/postStore';
import { useProfileVideoPlayer } from '@/store/profileVideoPlayer';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import Player from 'video.js/dist/types/player';
import MediaTypeIndicator from './MediaTypeIndicator';
import { ProfileVideoPlayer } from './ProfileVideoPlayer';

const UserPostCard = ({
  media,
  postId,
  pinned,
  username,
  index,
  type = 'post',
  collectionId = null,
}: UserPostCardProps) => {
  const [player, setPlayer] = React.useState<Player | null>(null);
  const router = useRouter();
  const { playingVideoId, setPlayingVideoId } = useProfileVideoPlayer();
  const {
    setCurrentPostId,
    setCurrentIndex,
    setCollectionId,
    setProfileUsername,
    setPostType,
  } = usePostStore();
  const videoId = postId;
  const isCarousel = media?.length > 1;
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

  const handlePostClick = () => {
    setCurrentPostId(postId);
    setCurrentIndex(index);
    setProfileUsername(username);
    setPostType(type);
    if (type === 'collection' && collectionId) {
      setCollectionId(collectionId);
    }

    router.push(`/post/${postId}`, { scroll: false });
  };

  return (
    <div
      className='relative max-w-[320px] aspect-[3/4] rounded-[4px] overflow-hidden flex-center bg-no-repeat bg-center bg-white-12 cursor-pointer'
      onClick={handlePostClick}
      onMouseEnter={handleMouseEnter}
    >
      {isVideo ? (
        <ProfileVideoPlayer
          poster={mediaItem.thumbnailUrl}
          options={playerOptions}
          onPlayerReady={(p) => {
            setPlayer(p);
          }}
        />
      ) : (
        <Image
          src={fileUrl}
          loading='lazy'
          fill
          alt='Post Image'
          className='object-cover'
        />
      )}
      {(isCarousel || isVideo || pinned) && (
        <MediaTypeIndicator
          type={pinned ? 'pinned' : isCarousel ? 'carousel' : 'video'}
        />
      )}
    </div>
  );
};

export default UserPostCard;
