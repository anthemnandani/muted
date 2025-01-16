import { IGif } from '@giphy/js-types';
import { X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '../ui/button';

interface PostMediaPreviewProps {
  type: 'image' | 'video' | 'gif';
  url?: string | IGif;
  text?: string;
  onRemove?: () => void;
}

const PostMediaPreview = ({
  type,
  url,
  text,
  onRemove,
}: PostMediaPreviewProps) => (
  <div className='relative overflow-hidden rounded-xl border border-border w-fit'>
    {type === 'image' ? (
      <img
        src={url as string}
        alt={text || ''}
        loading='lazy'
        className='object-contain h-full max-h-[360px] max-w-full'
      />
    ) : type === 'gif' ? (
      <Image
        src={url as string}
        alt={text || 'GIF'}
        width={200}
        height={200}
        loading='lazy'
      />
    ) : (
      <video
        src={url as string}
        className='object-contain max-h-[360px] max-w-full'
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
        className='size-[25px] p-1 absolute top-2 right-2 z-50 rounded-full transform active:scale-75 transition-transform cursor-pointer bg-background'
      >
        <X />
      </Button>
    )}
  </div>
);

export default PostMediaPreview;
