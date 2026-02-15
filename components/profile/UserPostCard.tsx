'use client';

import { FileType } from '@/generated/prisma/enums';
import { type MuxPlayerRef, UserPostCardProps } from '@/lib/types';
import { formatCount, formatTimeAgo } from '@/lib/utils';
import usePostStore from '@/store/postStore';
import { useProfileVideoPlayer } from '@/store/profileVideoPlayer';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Icons } from '../icons';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Username from '../user/Username';
import MediaTypeIndicator from './MediaTypeIndicator';
import { ProfileVideoPlayer } from './ProfileVideoPlayer';

const UserPostCard = ({
  media,
  postId,
  pinned,
  index,
  likesCount,
  text,
  createdAt,
  author,
  query,
  isSearch = false,
}: UserPostCardProps) => {
  const [player, setPlayer] = useState<MuxPlayerRef | null>(null);
  const { playingVideoId, setPlayingVideoId } = useProfileVideoPlayer();
  const { setCurrentPostId, setCurrentIndex, setIsOpen } = usePostStore();
  const videoId = postId;
  const isCarousel = media?.length > 1;
  const mediaItem = media?.[0];

  const [stableTokens, setStableTokens] = useState({
    videoToken: mediaItem?.videoToken,
    thumbnailToken: mediaItem?.thumbnailToken,
  });

  const isVideo = mediaItem?.fileType === FileType.VIDEO;
  const fileUrl = mediaItem?.fileUrl;

  useEffect(() => {
    if (mediaItem?.playbackId) {
      setStableTokens({
        videoToken: mediaItem.videoToken,
        thumbnailToken: mediaItem.thumbnailToken,
      });
    }
  }, [mediaItem?.playbackId]);

  useEffect(() => {
    if (!player) return;

    if (playingVideoId === videoId) {
      player.play().catch((err) => {});
    } else {
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

    const postLink = `/post/${postId}${query ? `?q=${encodeURIComponent(query)}` : ''}`;

    setIsOpen(true);

    window.history.pushState(null, '', postLink);
  };

  return (
    <div className='flex flex-col gap-2'>
      <div
        className='relative max-w-[320px] aspect-[3/4] rounded-[4px] overflow-hidden flex-center bg-no-repeat bg-center bg-white-12 cursor-pointer'
        onClick={handlePostClick}
        onMouseEnter={handleMouseEnter}
      >
        {isVideo ? (
          <div className='w-full h-full pointer-events-none'>
            <ProfileVideoPlayer
              playbackId={mediaItem.playbackId!}
              videoToken={stableTokens.videoToken!}
              thumbnailToken={stableTokens.thumbnailToken!}
              onPlayerReady={setPlayer}
            />
          </div>
        ) : (
          <Image
            src={fileUrl!}
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
