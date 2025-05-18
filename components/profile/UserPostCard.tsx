'use client';

import { UserPostCardProps } from '@/lib/types';
import { formatCount, formatTimeAgo } from '@/lib/utils';
import usePostStore from '@/store/postStore';
import { useProfileVideoPlayer } from '@/store/profileVideoPlayer';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import Player from 'video.js/dist/types/player';
import { Icons } from '../icons';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Username from '../user/Username';
import MediaTypeIndicator from './MediaTypeIndicator';
import { ProfileVideoPlayer } from './ProfileVideoPlayer';

const UserPostCard = ({
  media,
  postId,
  pinned,
  username,
  index,
  likesCount,
  text,
  createdAt,
  author,
  type = 'post',
  collectionId = null,
  isSearch = false,
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
    <div className='flex flex-col gap-2'>
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
        {isSearch && (
          <div className='absolute bottom-3 left-3 flex items-center gap-2'>
            <Icons.heart className='size-4 text-white/90' />
            <p className='text-white-100 text-small-regular'>
              {formatCount(likesCount!)}
            </p>
          </div>
        )}
        {(isCarousel || isVideo || pinned) && !isSearch && (
          <MediaTypeIndicator
            type={pinned ? 'pinned' : isCarousel ? 'carousel' : 'video'}
          />
        )}
      </div>
      {isSearch && (
        <div className='flex flex-col gap-1 px-2'>
          <p className='text-white/90 text-sm truncate'>{text}</p>
          <div className='flex-between'>
            <div className='flex items-center gap-1'>
              <Link href={`/@${author!.username}`} className='flex-shrink-0'>
                <Avatar className='rounded-full size-5'>
                  <AvatarImage
                    src={author!.image ?? ''}
                    alt={author!.username ?? ''}
                    className='object-cover'
                  />
                  <AvatarFallback>
                    {author!.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Username
                author={author!}
                className='text-ellipsis overflow-hidden'
                isSearch
              />
            </div>
            <p className='text-white/50 text-sm'>{formatTimeAgo(createdAt!)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPostCard;
