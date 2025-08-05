'use client';

import useMediaControls from '@/hooks/useMediaControls';
import { ThreadPostContentProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import MediaControls from '../shared/MediaControls';
import PostText from '../shared/PostText';
import PostFooter from './PostFooter';

const ThreadPostContent: React.FC<ThreadPostContentProps> = ({
  media,
  author,
  createdAt,
  postId,
  threadText,
  pinned,
  mentions,
  reposts,
  repostedBy,
  hideLikes,
  turnOffComments,
}) => {
  const hasMedia = media && media.length > 0;
  const isImageOrGif =
    hasMedia && (media[0].fileType === 'image' || media[0].fileType === 'gif');

  const {
    showControls,
    setShowControls,
    controlsTimeoutRef,
    showControlsTemporarily,
  } = useMediaControls();

  return (
    <div
      className='w-full max-w-[calc((100vh-2rem)*0.5625)] h-[calc(100vh-2rem)] bg-black relative snap-center snap-always'
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
      <div className='h-full w-full flex-center rounded-2xl overflow-hidden relative'>
        <div className='px-3 py-6 w-full flex flex-col bg-gray-6 max-h-[80vh] min-h-[15vh] gap-4'>
          <div
            className={cn(
              'min-h-0 overflow-y-auto scrollbar-thumb-rounded-full scrollbar-track-rounded-full',
              'scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent'
            )}
          >
            <PostText
              text={threadText!}
              mentions={mentions}
              className='text-base leading-relaxed pr-2'
              isThreadPost
            />
          </div>

          {isImageOrGif && (
            <div className='flex-shrink-0'>
              <div className='relative overflow-hidden'>
                {media[0].fileType === 'gif' ? (
                  <img
                    src={media[0].fileUrl}
                    alt='Thread Media'
                    className='object-contain rounded-lg'
                    width={200}
                    height={200}
                    loading='lazy'
                  />
                ) : media[0].fileType === 'image' ? (
                  <Image
                    src={media[0].fileUrl}
                    alt='Thread Media'
                    className='object-contain rounded-lg'
                    width={200}
                    height={200}
                    priority={false}
                  />
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
      <MediaControls
        author={author}
        postId={postId}
        createdAt={createdAt}
        threadText={threadText}
        showControls={showControls}
        pinned={pinned}
        hideLikes={hideLikes}
        turnOffComments={turnOffComments}
      />
      <PostFooter
        author={author}
        createdAt={createdAt}
        id={postId}
        reposts={reposts}
        repostedBy={repostedBy}
        isThread
      />
    </div>
  );
};

export default ThreadPostContent;
