'use client';

import { Icons } from '@/components/icons';
import { ProfileVideoPlayer } from '@/components/profile/ProfileVideoPlayer';
import { Media } from '@/generated/prisma/browser';
import { FileType } from '@/generated/prisma/enums';
import type { ActivityPost, MuxPlayerRef } from '@/lib/types';
import { cn, getImageUrl } from '@/lib/utils';
import { useActivityStore } from '@/store/activityStore';
import { useProfileVideoPlayer } from '@/store/profileVideoPlayer';
import { Check, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const MediaGridItem = ({ item }: { item: ActivityPost }) => {
  const { isSelecting, selectedIds, toggleSelect } = useActivityStore();
  const isSelected = selectedIds.has(item.id);

  const [player, setPlayer] = useState<MuxPlayerRef | null>(null);
  const { playingVideoId, setPlayingVideoId } = useProfileVideoPlayer();

  const mediaItem = item.media?.[0] as Media;
  const isVideo = mediaItem?.fileType === FileType.VIDEO;
  const imageUrl = mediaItem ? getImageUrl(mediaItem) : null;

  const [stableTokens, setStableTokens] = useState({
    videoToken: mediaItem?.videoToken,
    thumbnailToken: mediaItem?.thumbnailToken,
  });

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
    if (playingVideoId === item.id) {
      player.play().catch(() => {});
    } else {
      player.pause();
    }
  }, [player, playingVideoId, item.id]);

  const handleMouseEnter = () => {
    if (!isVideo || isSelecting) return;
    setTimeout(() => {
      setPlayingVideoId(item.id);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (!isVideo) return;
    setPlayingVideoId(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isSelecting) {
      e.preventDefault();
      toggleSelect(item.id);
    }
  };

  return (
    <Link
      href={isSelecting ? '#' : `/post/${item.id}`}
      className={cn(
        'relative aspect-square bg-[#1a1a1a] overflow-hidden group',
        isSelecting && 'cursor-pointer',
        isSelecting && isSelected && 'ring-2 ring-white ring-inset',
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isSelecting && (
        <div
          className='absolute top-2 left-2 z-20 cursor-pointer'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleSelect(item.id);
          }}
        >
          <div
            className={cn(
              'size-6 rounded-full border-2 flex items-center justify-center transition-all',
              isSelected
                ? 'bg-white border-white'
                : 'bg-black/40 border-white/60 hover:border-white',
            )}
          >
            {isSelected && (
              <Check className='size-3.5 text-black' strokeWidth={3} />
            )}
          </div>
        </div>
      )}

      <div
        className={cn(
          'w-full h-full',
          isSelecting && 'pointer-events-none opacity-80',
        )}
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
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt=''
            className='absolute inset-0 w-full h-full object-cover'
            loading='lazy'
          />
        ) : (
          <div className='w-full h-full flex-center p-3'>
            <p className='text-white/30 text-xs line-clamp-3 text-center'>
              {item.text}
            </p>
          </div>
        )}
      </div>

      {!isSelecting && (
        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex-center gap-4 z-10'>
          <span className='flex items-center gap-1 text-white text-sm font-semibold'>
            <Heart className='size-4' fill='white' />{' '}
            {item.likesCount ?? item._count?.likes ?? 0}
          </span>
          <span className='flex items-center gap-1 text-white text-sm font-semibold'>
            <MessageCircle className='size-4' fill='white' />{' '}
            {item.repliesCount ?? 0}
          </span>
        </div>
      )}

      {!isSelecting && item.media && item.media.length > 1 && (
        <div className='absolute top-2 right-2 z-10'>
          <Icons.gallery className='size-5 text-white drop-shadow-lg' />
        </div>
      )}
      {!isSelecting && isVideo && (
        <div className='absolute bottom-2 right-2 z-10'>
          <Icons.videos className='size-4 text-white drop-shadow-lg' />
        </div>
      )}
    </Link>
  );
};

export default MediaGridItem;
