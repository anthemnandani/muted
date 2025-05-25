import useMediaControls from '@/hooks/useMediaControls';
import { PostImageCardProps } from '@/lib/types';
import { getImageObjectFit } from '@/lib/utils';
import Image from 'next/image';
import React from 'react';
import PostFooter from '../posts/PostFooter';
import MediaControls from '../shared/MediaControls';

const PostImageCard: React.FC<PostImageCardProps> = ({
  image,
  originalDimensions,
  aspectRatio,
  author,
  createdAt,
  id,
  text,
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

  const objectFit = getImageObjectFit(aspectRatio!, originalDimensions);

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
          className={objectFit}
          style={{
            objectPosition: 'center',
          }}
        />
      </div>
      <MediaControls
        author={author}
        postId={id}
        createdAt={createdAt}
        text={text}
        showControls={showControls}
        pinned={pinned}
      />
      <div className='absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none' />
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
