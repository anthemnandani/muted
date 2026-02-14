import { PostMediaPreviewProps } from '@/lib/types';
import { X } from 'lucide-react';
import { Button } from '../ui/button';
import { FileType } from '@/generated/prisma/enums';

const PostMediaPreview = ({
  type,
  url,
  text,
  onRemove,
}: PostMediaPreviewProps) => (
  <div className='relative overflow-hidden rounded-xl border border-border w-fit'>
    {type === FileType.IMAGE || type === FileType.GIF ? (
      <img
        src={url as string}
        alt={text || ''}
        loading='lazy'
        className='object-contain h-full max-h-[150px] max-w-full'
      />
    ) : (
      <video
        src={url as string}
        className='object-contain max-h-[150px] max-w-full'
        loop
        muted
        autoPlay
        playsInline
      />
    )}
    {onRemove && (
      <Button
        onClick={onRemove}
        variant='ghost'
        className='size-[25px] p-1 absolute top-1 right-1 z-50 rounded-full transform active:scale-75 transition-transform cursor-pointer bg-background'
      >
        <X />
      </Button>
    )}
  </div>
);

export default PostMediaPreview;
