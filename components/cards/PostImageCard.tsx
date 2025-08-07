import useMediaControls from '@/hooks/useMediaControls';
import { PostImageCardProps } from '@/lib/types';
import { getTargetRatio } from '@/lib/utils';
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
  mentions,
  turnOffComments,
  hideLikes,
}) => {
  const {
    showControls,
    setShowControls,
    controlsTimeoutRef,
    showControlsTemporarily,
  } = useMediaControls();

  return (
    <div
      className='post-container-fitted'
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
      <div className='relative w-full h-full flex-center'>
        <img
          alt='Post'
          loading='lazy'
          src={image}
          className='object-cover'
          style={{
            objectPosition: 'center',
            aspectRatio: getTargetRatio(aspectRatio!, originalDimensions),
          }}
        />
      </div>
      <MediaControls
        author={author}
        postId={id}
        createdAt={createdAt}
        caption={text}
        turnOffComments={turnOffComments}
        hideLikes={hideLikes}
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
        mentions={mentions}
      />
    </div>
  );
};

export default PostImageCard;
