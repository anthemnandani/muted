import { MediaTypeIndicatorProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Icons } from '../icons';

const MediaTypeIndicator = ({
  type,
  className,
  iconClassName,
}: MediaTypeIndicatorProps) => {
  return (
    <div
      className={cn(
        'absolute top-3 right-3 text-white/90 drop-shadow-main z-10',
        className
      )}
    >
      {type === 'carousel' ? (
        <Icons.gallery className={cn('size-6', iconClassName)} />
      ) : (
        <Icons.video className={cn('size-6', iconClassName)} />
      )}
    </div>
  );
};

export default MediaTypeIndicator;
