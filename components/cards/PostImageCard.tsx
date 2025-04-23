import useMediaControls from '@/hooks/useMediaControls';
import { PostImageCardProps } from '@/lib/types';
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
  reposts,
  pinned,
  repostedBy,
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
      <div className='relative w-full h-full'>
        <Image
          alt='Post'
          fill
          loading='lazy'
          src={image}
          className='object-contain'
        />
      </div>
      <MediaControls
        author={author}
        postId={id}
        createdAt={createdAt}
        text={text}
        hideLikes={hideLikes}
        showControls={showControls}
        pinned={pinned}
      />
      {isVerticalImage && (
        <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none' />
      )}
      <PostFooter
        author={author}
        createdAt={createdAt}
        id={id}
        text={text}
        reposts={reposts}
        repostedBy={repostedBy}
      />
    </div>
  );
};

export default PostImageCard;
