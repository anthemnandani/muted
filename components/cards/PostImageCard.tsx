'use client';

import useMediaControls from '@/hooks/useMediaControls';
import { PostImageCardProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';
import PostFooter from '../posts/PostFooter';
import MediaControls from '../shared/MediaControls';

const PostImageCard: React.FC<PostImageCardProps> = ({
  image,
  originalDimensions,
  author,
  createdAt,
  id,
  text,
  hideLikes,
}) => {
  const {
    showControls,
    setShowControls,
    controlsTimeoutRef,
    showControlsTemporarily,
  } = useMediaControls();

  const isVerticalImage = originalDimensions
    ? originalDimensions.width / originalDimensions.height < 1
    : false;

  return (
    <div
      className='relative w-[calc((0px-2rem+100vh)*0.5625)] h-[calc(0px-2rem+100vh)] overflow-hidden flex-grow bg-black rounded-2xl flex-center'
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        setShowControls(false);
      }}
      onTouchStart={showControlsTemporarily}
      onTouchMove={() => {
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current);
        }
      }}
    >
      <Image
        alt='Post'
        fill
        loading='lazy'
        src={image}
        className={cn(isVerticalImage ? 'object-cover' : 'object-contain')}
      />
      <MediaControls
        author={author}
        postId={id}
        createdAt={createdAt}
        text={text}
        hideLikes={hideLikes}
        showControls={showControls}
      />
      {isVerticalImage && (
        <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none' />
      )}
      <PostFooter author={author} createdAt={createdAt} id={id} text={text} />
    </div>
  );
};

export default PostImageCard;
