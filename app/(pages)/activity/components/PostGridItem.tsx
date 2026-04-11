import { Icons } from '@/components/icons';
import { Media } from '@/generated/prisma/browser';
import type { ActivityPost } from '@/lib/types';
import { cn, getImageUrl } from '@/lib/utils';
import { useActivityStore } from '@/store/activityStore';
import { Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import SelectionOverlay from './SelectionOverlay';

const PostGridItem = ({ post }: { post: ActivityPost }) => {
  const { isSelecting, selectedIds, toggleSelect } = useActivityStore();
  const isSelected = selectedIds.has(post.id);

  const mediaItem = post.media?.[0] as Media;
  const imageUrl = mediaItem ? getImageUrl(mediaItem) : null;

  const handleClick = (e: React.MouseEvent) => {
    if (isSelecting) {
      e.preventDefault();
      toggleSelect(post.id);
    }
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSelect(post.id);
  };

  return (
    <Link
      href={isSelecting ? '#' : `/post/${post.id}`}
      className={cn(
        'relative aspect-square bg-[#1a1a1a] overflow-hidden group',
        isSelecting && 'cursor-pointer',
        isSelecting && isSelected && 'ring-2 ring-white ring-inset',
      )}
      onClick={handleClick}
    >
      <SelectionOverlay
        isSelected={isSelected}
        isSelecting={isSelecting}
        onToggle={handleSelect}
      />
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=''
          className='absolute inset-0 w-full h-full object-cover'
          loading='lazy'
        />
      ) : (
        <div className='w-full h-full flex-center p-3'>
          <p className='text-white/30 text-xs line-clamp-3 text-center'>
            {post.text}
          </p>
        </div>
      )}
      {!isSelecting && (
        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex-center gap-4'>
          <span className='flex items-center gap-1 text-white text-sm font-semibold'>
            <Heart className='size-4' fill='white' /> {post.likesCount ?? 0}
          </span>
          <span className='flex items-center gap-1 text-white text-sm font-semibold'>
            <MessageCircle className='size-4' fill='white' />{' '}
            {post.repliesCount ?? 0}
          </span>
        </div>
      )}
      {!isSelecting && post.media && post.media.length > 1 && (
        <div className='absolute top-2 right-2'>
          <Icons.gallery className='size-5' />
        </div>
      )}
    </Link>
  );
};

export default PostGridItem;
