'use client';

import { PostMediaToolsProps } from '@/lib/types';
import { Icons } from '../icons';
import EmojiPicker from '../modals/EmojiPicker';
import GifPicker from '../modals/GifPicker';
import usePostDialog from '@/store/postDialog';
import { Fragment } from 'react';

const PostMediaTools = ({
  onGifSelect,
  onEmojiSelect,
  getRootProps,
  getInputProps,
}: PostMediaToolsProps) => {
  const { editPostId, postData } = usePostDialog();
  return (
    <div className='flex items-center gap-2'>
      {!editPostId && (
        <Fragment>
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
        </Fragment>
      )}
      <EmojiPicker onChange={onEmojiSelect} />
    </div>
  );
};

export default PostMediaTools;
