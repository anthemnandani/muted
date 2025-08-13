import { cn } from '@/lib/utils';
import { Link2, X } from 'lucide-react';
import { Icons } from '../icons';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { LinkPreviewCardProps } from '@/lib/types';

const LinkPreviewCard = ({
  title,
  description,
  image,
  isLoading,
  url,
  onClose,
}: LinkPreviewCardProps) => {
  if (isLoading) {
    return (
      <Card className='h-20 mx-6 flex-center mb-2'>
        <Icons.spinner className='size-8 animate-spin' />
      </Card>
    );
  }
  const domain = url ? new URL(url).hostname.replace('www.', '') : '';
  return (
    <Card className='overflow-hidden transition-colors border-border-light rounded-2xl mb-2'>
      <div className='flex flex-col relative'>
        {image && (
          <div className='relative aspect-[1.91/1] w-full overflow-hidden'>
            <img
              src={image}
              alt={title || 'Link preview image'}
              className='object-cover w-full h-full rounded-t-lg'
            />
          </div>
        )}

        {onClose && (
          <Button
            onClick={onClose}
            size='icon'
            variant='ghost'
            className={cn(
              'absolute right-2 top-2 size-9 rounded-full',
              'bg-muted hover:bg-muted/80 backdrop-blur-sm',
              'border border-border shadow-sm',
              'transition-all duration-200',
              'flex-center'
            )}
          >
            <X className='size-5' />
            <span className='sr-only'>Close preview</span>
          </Button>
        )}

        <div className='flex flex-col gap-2 p-4'>
          {title && (
            <h3 className='font-semibold leading-snug tracking-tight line-clamp-2 break-words'>
              {title}
            </h3>
          )}

          {description && (
            <p className='text-sm text-muted-foreground line-clamp-3 break-words'>
              {description}
            </p>
          )}

          <div className='flex items-center gap-2 pt-2.5 mt-2 border-t border-border'>
            <Link2 className='size-3.5 text-muted-foreground' />
            <span className='text-xs text-muted-foreground transition-colors truncate'>
              {domain}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default LinkPreviewCard;
