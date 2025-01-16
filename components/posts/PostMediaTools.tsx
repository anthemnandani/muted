'use client';

import { Icons } from '@/components/icons';
import { IGif } from '@giphy/js-types';
import { useDropzone, type Accept } from 'react-dropzone';
import { EmojiPicker } from '../modals/EmojiPicker';
import GifPicker from '../modals/GifPicker';

interface PostMediaToolsProps {
  onFileSelect: (files: File[]) => void;
  onGifSelect: (gif: IGif) => void;
  onEmojiSelect: (emoji: string) => void;
}

const PostMediaTools = ({
  onFileSelect,
  onGifSelect,
  onEmojiSelect,
}: PostMediaToolsProps) => {
  const maxSize = 512 * 1024 * 1024;
  const accept: Accept = {
    'image/*': [],
    'video/*': [],
    'image/gif': [],
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: onFileSelect,
    accept,
    maxSize,
  });

  return (
    <div className='flex items-center gap-2'>
      <div {...getRootProps()} className='space-y-2 mt-1 select-none w-fit'>
        <div className='text-gray-3 flex gap-1 select-none items-center text-[15px]'>
          <input {...getInputProps()} />
          <Icons.image className='size-5 select-none transform active:scale-75 transition-transform cursor-pointer' />
        </div>
      </div>
      <GifPicker
        onGifSelect={(gif) => {
          onGifSelect(gif);
        }}
      />
      <EmojiPicker onChange={onEmojiSelect} />
    </div>
  );
};

export default PostMediaTools;
