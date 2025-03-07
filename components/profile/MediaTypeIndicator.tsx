import { MediaTypeIndicatorProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Icons } from '../icons';
import { Pin } from 'lucide-react';
import { usePostStore } from '@/store/postStore';

const MediaTypeIndicator = ({
  type,
  className,
  iconClassName,
}: MediaTypeIndicatorProps) => {
  const { selectedFilter } = usePostStore();

  if (type === 'pinned' && selectedFilter === 'OLDEST') {
    return null;
  }
  return (
    <div
      className={cn(
        'absolute top-3 right-3 text-white/90 drop-shadow-main z-10',
        className
      )}
    >
      {type === 'carousel' ? (
        <Icons.gallery className={cn('size-6', iconClassName)} />
      ) : type === 'video' ? (
        <Icons.video className={cn('size-6', iconClassName)} />
      ) : (
        <Pin
          className={cn('size-6 rotate-45', iconClassName)}
          fill='white'
          fillOpacity={0.9}
        />
      )}
    </div>
  );
};

export default MediaTypeIndicator;
